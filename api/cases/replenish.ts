import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "../_lib/firebaseAdmin.js";
import { checkRateLimit } from "../_lib/rateLimit.js";
import { checkUsageAllowed, calculateCostUsd, recordUsage } from "../_lib/usage.js";
import { callGroq, REVIEW_MODEL } from "../_lib/groq.js";
import { CASE_GENERATION_SYSTEM_PROMPT, CASE_START, REVIEW_START, extractBlock, buildReviewPrompt } from "../_lib/casePrompt.js";
import { validateCaseShape, type GeneratedCase } from "../_lib/caseSchema.js";

// Quantos casos premium disponíveis (status:'available') mantemos no
// estoque ao mesmo tempo. Cada consumo de 1 caso dispara esta rota, que só
// repõe o que faltar (normalmente 1).
const STOCK_TARGET = 5;

// Até 2 tentativas totais (geração + validação programática + revisão por
// IA) antes de desistir dessa reposição — ela fica pendente pro próximo
// consumo disparar de novo, não é erro fatal do endpoint.
async function generateOneCase(): Promise<{ caseData: GeneratedCase; costUsd: number } | null> {
    let totalCost = 0;

    for (let attempt = 0; attempt < 2; attempt++) {
        // Qualquer erro do Groq (429 de rate limit, 5xx, rede) conta como
        // falha desta tentativa, não derruba a rota inteira — o resto do
        // estoque (ou outras chamadas desta mesma reposição) continua
        // tentando normalmente.
        let genResult;
        try {
            genResult = await callGroq([
                { role: 'system', content: CASE_GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: 'Gere um novo caso de investigação criminal, seguindo exatamente o formato pedido.' },
            ]);
        } catch (error) {
            console.error('❌ Falha na geração do caso (tentativa segue disponível):', error instanceof Error ? error.message : error);
            continue;
        }
        totalCost += calculateCostUsd(genResult.promptTokens, genResult.completionTokens, genResult.toolCalls);

        const jsonText = extractBlock(genResult.text, CASE_START);
        if (!jsonText) continue;

        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            continue;
        }

        const validated = validateCaseShape(parsed);
        if (!validated) continue;

        // Revisão usa um modelo menor, separado do de geração — rate limit
        // de conta é por modelo, então isso não compete pelo mesmo teto de
        // tokens/minuto do groq/compound (foi exatamente isso que causou um
        // 429 real em produção antes desta correção).
        let reviewResult;
        try {
            reviewResult = await callGroq([
                { role: 'system', content: 'Você audita casos de investigação criminal em busca de incoerência lógica entre pistas e solução.' },
                { role: 'user', content: buildReviewPrompt(validated) },
            ], REVIEW_MODEL);
        } catch (error) {
            console.error('❌ Falha na revisão do caso (tentativa segue disponível):', error instanceof Error ? error.message : error);
            continue;
        }
        totalCost += calculateCostUsd(reviewResult.promptTokens, reviewResult.completionTokens, reviewResult.toolCalls, REVIEW_MODEL);

        const reviewJson = extractBlock(reviewResult.text, REVIEW_START);
        if (!reviewJson) continue;

        try {
            const review = JSON.parse(reviewJson) as { valid?: boolean };
            if (review?.valid === true) {
                return { caseData: validated, costUsd: totalCost };
            }
        } catch {
            continue;
        }
    }

    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!idToken) return res.status(401).json({ message: 'Token de autenticação ausente' });

        const decoded = await admin.auth().verifyIdToken(idToken);
        const db = admin.firestore();

        const rateLimitOk = await checkRateLimit(db, decoded.uid, { collection: "case_replenish_rate_limits", max: 5, windowMs: 60_000 });
        if (!rateLimitOk) {
            return res.status(429).json({ message: 'Muitas requisições. Aguarde alguns segundos.' });
        }

        const availableSnap = await db.collection('cases')
            .where('premium', '==', true)
            .where('status', '==', 'available')
            .get();

        const needed = STOCK_TARGET - availableSnap.size;
        if (needed <= 0) {
            return res.status(200).json({ generated: 0 });
        }

        let generated = 0;
        for (let i = 0; i < needed; i++) {
            const usageOk = await checkUsageAllowed(db);
            if (!usageOk) break;

            // Cada slot é isolado: uma falha aqui (Groq, Firestore, o que
            // for) nunca derruba a resposta inteira — só essa reposição
            // específica fica pendente pro próximo consumo tentar de novo.
            try {
                const result = await generateOneCase();
                if (!result) {
                    console.error('❌ Não foi possível gerar um caso coerente após tentativas — reposição fica pendente.');
                    continue;
                }

                const { solution, ...publicFields } = result.caseData;
                const caseRef = db.collection('cases').doc();
                const batch = db.batch();
                batch.set(caseRef, {
                    ...publicFields,
                    premium: true,
                    source: 'ai',
                    status: 'available',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    usedAt: null,
                    usedByRoomId: null,
                });
                batch.set(db.collection('case_solutions').doc(caseRef.id), solution);
                await batch.commit();
                await recordUsage(db, result.costUsd);
                generated++;
            } catch (error) {
                console.error('❌ Falha inesperada ao gerar/salvar um caso (slot pulado):', error instanceof Error ? error.message : error);
            }
        }

        return res.status(200).json({ generated });
    } catch (error) {
        console.error('❌ Erro ao repor estoque de casos:', error instanceof Error ? error.message : error);
        return res.status(500).json({ message: 'Falha ao repor estoque de casos' });
    }
}
