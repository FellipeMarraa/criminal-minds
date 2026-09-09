import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "../_lib/firebaseAdmin.js";
import { checkRateLimit } from "../_lib/rateLimit.js";
import { checkUsageAllowed, calculateCostUsd, recordUsage } from "../_lib/usage.js";
import { callGroq, REVIEW_MODEL } from "../_lib/groq.js";
import { BIBLE_SYSTEM_PROMPT, BIBLE_START, ENVELOPES_START, REVIEW_START, extractBlock, buildEnvelopesPrompt, buildReviewPrompt } from "../_lib/casePrompt.js";
import { validateBibleShape, validateEnvelopesShape, type GeneratedCase } from "../_lib/caseSchema.js";

// 3 chamadas ao groq/compound (que faz busca na web, mais lento) numa
// reposição de estoque zerado (bootstrap, até STOCK_TARGET casos numa única
// requisição) pode passar do timeout padrão da função — usa o teto máximo
// permitido pelo plano em vez do default curto. Progresso parcial não se
// perde (cada caso já commitado no Firestore antes de passar pro próximo
// continua salvo mesmo se a função for encerrada no meio).
export const maxDuration = 60;

// Quantos casos premium disponíveis (status:'available') mantemos no
// estoque ao mesmo tempo. Cada consumo de 1 caso dispara esta rota, que só
// repõe o que faltar (normalmente 1).
const STOCK_TARGET = 5;

// Até 2 tentativas totais (bíblia + envelopes + revisão, cada uma podendo
// falhar sozinha) antes de desistir dessa reposição — ela fica pendente pro
// próximo consumo disparar de novo, não é erro fatal do endpoint.
async function generateOneCase(): Promise<{ caseData: GeneratedCase; costUsd: number } | null> {
    let totalCost = 0;

    for (let attempt = 0; attempt < 2; attempt++) {
        // 1ª chamada: bíblia do caso (história, suspeitos, solução — sem
        // pistas ainda). Qualquer erro do Groq (429, 5xx, rede) conta como
        // falha desta tentativa, nunca derruba a rota inteira.
        let bibleResult;
        try {
            bibleResult = await callGroq([
                { role: 'system', content: BIBLE_SYSTEM_PROMPT },
                { role: 'user', content: 'Gere a bíblia de um novo caso de investigação criminal, seguindo exatamente o formato pedido.' },
            ]);
        } catch (error) {
            console.error('❌ Falha na geração da bíblia do caso (tentativa segue disponível):', error instanceof Error ? error.message : error);
            continue;
        }
        totalCost += calculateCostUsd(bibleResult.promptTokens, bibleResult.completionTokens, bibleResult.toolCalls);

        const bibleJson = extractBlock(bibleResult.text, BIBLE_START);
        if (!bibleJson) continue;

        let parsedBible: unknown;
        try {
            parsedBible = JSON.parse(bibleJson);
        } catch {
            continue;
        }

        const bible = validateBibleShape(parsedBible);
        if (!bible) continue;

        // 2ª chamada: envelopes de pista, consistentes com a bíblia já
        // fechada (inclusive a solução).
        let envelopesResult;
        try {
            envelopesResult = await callGroq([
                { role: 'system', content: 'Você cria pistas de investigação criminal organizadas em envelopes, consistentes com a bíblia do caso recebida.' },
                { role: 'user', content: buildEnvelopesPrompt(bible) },
            ]);
        } catch (error) {
            console.error('❌ Falha na geração dos envelopes (tentativa segue disponível):', error instanceof Error ? error.message : error);
            continue;
        }
        totalCost += calculateCostUsd(envelopesResult.promptTokens, envelopesResult.completionTokens, envelopesResult.toolCalls);

        const envelopesJson = extractBlock(envelopesResult.text, ENVELOPES_START);
        if (!envelopesJson) continue;

        let parsedEnvelopes: unknown;
        try {
            parsedEnvelopes = JSON.parse(envelopesJson);
        } catch {
            continue;
        }

        const envelopesResponse = validateEnvelopesShape(parsedEnvelopes);
        if (!envelopesResponse) continue;

        // contradictingClueIds só vale se apontar pra pistas que realmente
        // existem nos envelopes que acabaram de ser criados — nunca confia
        // cegamente no que o modelo cita.
        const allClueIds = new Set(envelopesResponse.envelopes.flatMap((e) => e.clues.map((c) => c.id)));
        const contradictingClueIds = envelopesResponse.contradictingClueIds.filter((id) => allClueIds.has(id));

        const assembled: GeneratedCase = {
            ...bible,
            envelopes: envelopesResponse.envelopes,
            solution: { ...bible.solution, contradictingClueIds },
        };

        // 3ª chamada: revisão/auditoria de coerência, num modelo separado
        // (rate limit por modelo — não compete com o de geração, foi
        // exatamente isso que causou um 429 real em produção antes).
        let reviewResult;
        try {
            reviewResult = await callGroq([
                { role: 'system', content: 'Você audita casos de investigação criminal em busca de incoerência lógica entre pistas e solução.' },
                { role: 'user', content: buildReviewPrompt(assembled) },
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
                return { caseData: assembled, costUsd: totalCost };
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
