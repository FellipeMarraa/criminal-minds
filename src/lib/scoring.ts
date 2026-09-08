import type { Player, Vote } from '../types/game';

// Investigação é coletiva e simultânea (voto só é revelado depois que todos
// votaram) — diferente do podium por ordem do quemsoueu, aqui não existe
// "quem votou primeiro", só quem acertou o culpado.
export const CORRECT_VOTE_POINTS = 10;

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
