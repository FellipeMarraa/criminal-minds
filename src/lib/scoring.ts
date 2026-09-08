import type { Player } from '../types/game';

// Investigação é coletiva e simultânea (voto só é revelado depois que todos
// votaram) — diferente do podium por ordem do quemsoueu, aqui não existe
// "quem votou primeiro", só quem acertou o culpado.
export const CORRECT_VOTE_POINTS = 10;

export function awardCaseVotes(members: Player[], solutionSuspectId: string): Player[] {
    return members.map((m) => {
        if (m.vote && m.vote === solutionSuspectId) {
            return { ...m, totalPoints: (m.totalPoints ?? 0) + CORRECT_VOTE_POINTS };
        }
        return m;
    });
}
