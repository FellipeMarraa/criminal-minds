// Só os tipos do documento PÚBLICO (`cases/{id}` no Firestore) — a solução
// nunca vive aqui nem em lugar nenhum que o client leia antes da revelação
// (ver case_solutions/{id} em firestore.rules e api/cases/reveal.ts).
export interface Suspect {
    id: string;
    name: string;
    age?: number;
    occupation?: string;
    relationshipToVictim: string;
    alibi: string;
    background: string;
}

export interface Clue {
    id: string;
    order: number;
    category: 'physical' | 'testimony' | 'document' | 'forensic';
    text: string;
    isRedHerring: boolean;
}

export interface StoredCase {
    id: string;
    title: string;
    premium: boolean;
    source: 'handwritten' | 'ai';
    status: 'available' | 'used';
    victim: {
        name: string;
        age?: number;
        occupation?: string;
        description: string;
        timeOfDeath?: string;
        location: string;
    };
    intro: string;
    timeline?: string[];
    suspects: Suspect[];
    clues: Clue[];
    usedByRoomId?: string | null;
}
