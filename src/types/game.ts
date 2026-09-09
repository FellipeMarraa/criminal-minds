export type RoomStatus = 'LOBBY' | 'BRIEFING' | 'INVESTIGATING' | 'VOTING' | 'REVEAL';

export interface Player {
    id: string;
    name: string;
    photo?: string | null;
}

export interface Vote {
    suspectId: string;
    votedAt: number;
}

export interface RevealedSolution {
    suspectId: string;
    motive: string;
    meansAndOpportunity: string;
    explanation: string;
    contradictingClueIds: string[];
}

export interface Room {
    id: string;
    name?: string;
    adminId: string;
    status: RoomStatus;
    caseId?: string | null;
    currentEnvelopeIndex?: number;
    memberIds: string[];
    members: Player[];
    // Voto fica fora de `members` de propósito: a regra do Firestore só
    // consegue garantir "cada jogador só mexe no próprio voto" quando é uma
    // chave de mapa por uid — dentro de um array de mapas isso não dá pra
    // travar por regra (ver firestore.rules).
    votes?: Record<string, Vote>;
    // Confirmação de "pronto pra próximo envelope", por uid → índice do
    // envelope confirmado (evita abrir tudo de uma vez sem discutir; ver
    // InvestigationPhase.tsx). Guarda o índice em vez de bool pra não
    // precisar zerar o mapa a cada avanço.
    envelopeReady?: Record<string, number>;
    // Só existe depois que /api/cases/reveal escreve aqui (Admin SDK) — o
    // client nunca tem acesso à solução antes disso (ver case_solutions/{id}
    // nas firestore.rules, allow read/write: if false).
    solution?: RevealedSolution | null;
    createdAt?: Date;
}

export interface AppUser {
    uid: string;
    name: string;
    email: string | null;
    photo: string | null;
    lastLogin: Date;
    plan?: string;
    planExpiresAt?: string | null;
    activeGroupId?: string | null;
    // Só Admin SDK/console seta isso — cliente nunca escreve (fora da
    // allowlist do update em firestore.rules pra users/{userId}).
    isAdmin?: boolean;
}
