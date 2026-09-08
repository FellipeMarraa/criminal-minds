import admin from "firebase-admin";

// Circuit-breaker de custo — mesmo padrão do planning-trip (api/ai/_lib/usage.ts
// de lá): só um teto global mensal hardcoded, sem admin panel.
const GLOBAL_LIMIT_USD = 10;

// Preço em USD do groq/compound (console.groq.com/docs/compound/systems/compound,
// 2026-09) — roda sobre GPT-OSS-120B: $0.15/1M tokens de entrada, $0.60/1M de
// saída. Revisar se o preço publicado mudar.
const PRICING = { promptPer1k: 0.00015, completionPer1k: 0.0006 };

// Busca na web embutida do Compound é cobrada à parte do token. Usa o valor
// mais caro documentado ($8/1000 chamadas) de propósito — mais seguro
// superestimar o gasto (corta a IA cedo demais, no pior caso) do que
// subestimar (deixaria o teto mentir sobre o gasto real da conta Groq).
const TOOL_CALL_COST_USD = 0.008;

function isSamePeriod(periodStart: string | undefined): boolean {
    if (!periodStart) return false;
    const stored = new Date(periodStart);
    const now = new Date();
    return stored.getUTCFullYear() === now.getUTCFullYear() && stored.getUTCMonth() === now.getUTCMonth();
}

export function calculateCostUsd(promptTokens: number, completionTokens: number, toolCalls = 0): number {
    return (promptTokens / 1000) * PRICING.promptPer1k
        + (completionTokens / 1000) * PRICING.completionPer1k
        + toolCalls * TOOL_CALL_COST_USD;
}

export async function checkUsageAllowed(db: admin.firestore.Firestore): Promise<boolean> {
    const snap = await db.collection('ai_usage').doc('global').get();
    const data = snap.data();
    if (!data || !isSamePeriod(data.periodStart)) return true;
    return data.spentUsd < GLOBAL_LIMIT_USD;
}

export async function recordUsage(db: admin.firestore.Firestore, costUsd: number): Promise<void> {
    const ref = db.collection('ai_usage').doc('global');
    await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        const data = snap.data();
        if (!data || !isSamePeriod(data.periodStart)) {
            transaction.set(ref, { spentUsd: costUsd, periodStart: new Date().toISOString() });
        } else {
            transaction.update(ref, { spentUsd: data.spentUsd + costUsd });
        }
    });
}
