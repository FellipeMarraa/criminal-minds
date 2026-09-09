export type RoomStatus = 'LOBBY' | 'BRIEFING' | 'INVESTIGATING' | 'VOTING' | 'REVEAL';

export interface Player {
    id: string;
    name: string;
    photo?: string | null;
    totalPoints?: number;
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
}
