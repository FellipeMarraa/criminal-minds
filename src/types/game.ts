export type RoomStatus = 'LOBBY' | 'BRIEFING' | 'INVESTIGATING' | 'VOTING' | 'REVEAL';

export interface Player {
    id: string;
    name: string;
    photo?: string | null;
    vote?: string | null;
    votedAt?: number | null;
    totalPoints?: number;
}

export interface Room {
    id: string;
    name?: string;
    adminId: string;
    status: RoomStatus;
    caseId?: string | null;
    currentClueIndex?: number;
    memberIds: string[];
    members: Player[];
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
