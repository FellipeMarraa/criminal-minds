// Cópia server-side de src/lib/scoring.ts — api/ não importa src/ (bundling
// isolado da Vercel Function, mesmo padrão já documentado no planning-trip
// pra EXPENSE_CATEGORIES/CURRENCY_CODES duplicadas em api/ai/_lib/prompt.ts).
export const CORRECT_VOTE_POINTS = 10;

interface Player {
    id: string;
    name: string;
    photo?: string | null;
    totalPoints?: number;
}

interface Vote {
    suspectId: string;
    votedAt: number;
}

export function awardCaseVotes(
    members: Player[],
    votes: Record<string, Vote> | undefined,
    solutionSuspectId: string,
): Player[] {
    return members.map((m) => {
        const vote = votes?.[m.id];
        if (vote && vote.suspectId === solutionSuspectId) {
            return { ...m, totalPoints: (m.totalPoints ?? 0) + CORRECT_VOTE_POINTS };
        }
        return m;
    });
}
