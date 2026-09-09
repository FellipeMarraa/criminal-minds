// Nunca confia no shape do JSON que a IA emite — mesma defesa em profundidade
// já usada no chat do planning-trip (api/ai/chat.ts, sanitizeSuggested*):
// cada campo é lido e validado explicitamente, nada passa direto.

export interface GeneratedSuspect {
    id: string;
    name: string;
    age?: number;
    occupation?: string;
    relationshipToVictim: string;
    alibi: string;
    background: string;
}

export type ClueCategory = 'physical' | 'testimony' | 'document' | 'forensic';
const CLUE_CATEGORIES: ClueCategory[] = ['physical', 'testimony', 'document', 'forensic'];

export interface GeneratedClue {
    id: string;
    category: ClueCategory;
    text: string;
    isRedHerring: boolean;
}

export interface GeneratedEnvelope {
    id: string;
    order: number;
    title: string;
    clues: GeneratedClue[];
}

// Solução SEM contradictingClueIds — na hora que a bible é gerada, as
// pistas ainda não existem (ver buildEnvelopesPrompt). O campo entra depois,
// vindo da 2ª chamada, que sim conhece os ids de pista reais.
export interface GeneratedSolutionCore {
    suspectId: string;
    motive: string;
    meansAndOpportunity: string;
    explanation: string;
}

export interface GeneratedSolution extends GeneratedSolutionCore {
    contradictingClueIds: string[];
}

export interface GeneratedBible {
    title: string;
    victim: {
        name: string;
        age?: number;
        occupation?: string;
        description: string;
        timeOfDeath?: string;
        location: string;
    };
    intro: string;
    timeline: string[];
    suspects: GeneratedSuspect[];
    solution: GeneratedSolutionCore;
}

export interface GeneratedEnvelopesResponse {
    envelopes: GeneratedEnvelope[];
    contradictingClueIds: string[];
}

export interface GeneratedCase extends GeneratedBible {
    envelopes: GeneratedEnvelope[];
    solution: GeneratedSolution;
}

const MIN_SUSPECTS = 6;
const MAX_SUSPECTS = 8;
const MIN_ENVELOPES = 4;
const MAX_ENVELOPES = 7;
const MIN_CLUES_PER_ENVELOPE = 3;
const MAX_CLUES_PER_ENVELOPE = 6;

function str(value: unknown, maxLen = 2000): string {
    return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

function num(value: unknown): number | undefined {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function sanitizeSuspect(item: unknown, index: number): GeneratedSuspect | null {
    if (typeof item !== 'object' || item === null) return null;
    const o = item as Record<string, unknown>;
    const id = str(o.id, 40) || `suspeito-${index + 1}`;
    const name = str(o.name, 100);
    const relationshipToVictim = str(o.relationshipToVictim, 200);
    const alibi = str(o.alibi, 500);
    const background = str(o.background, 800);
    if (!name || !relationshipToVictim || !alibi || !background) return null;
    return {
        id,
        name,
        age: num(o.age),
        occupation: str(o.occupation, 100) || undefined,
        relationshipToVictim,
        alibi,
        background,
    };
}

export function validateBibleShape(parsed: unknown): GeneratedBible | null {
    if (typeof parsed !== 'object' || parsed === null) return null;
    const o = parsed as Record<string, unknown>;

    const title = str(o.title, 150);
    const intro = str(o.intro, 4000);
    if (!title || !intro) return null;

    const victimRaw = o.victim;
    if (typeof victimRaw !== 'object' || victimRaw === null) return null;
    const v = victimRaw as Record<string, unknown>;
    const victimName = str(v.name, 100);
    const victimDescription = str(v.description, 800);
    if (!victimName || !victimDescription) return null;

    if (!Array.isArray(o.suspects)) return null;
    const suspects = o.suspects.map((s, i) => sanitizeSuspect(s, i)).filter((s): s is GeneratedSuspect => s !== null);
    if (suspects.length < MIN_SUSPECTS || suspects.length > MAX_SUSPECTS) return null;

    const solutionRaw = o.solution;
    if (typeof solutionRaw !== 'object' || solutionRaw === null) return null;
    const sol = solutionRaw as Record<string, unknown>;
    const suspectId = str(sol.suspectId, 40);
    const motive = str(sol.motive, 1000);
    const meansAndOpportunity = str(sol.meansAndOpportunity, 1000);
    const explanation = str(sol.explanation, 3000);
    if (!suspectId || !motive || !meansAndOpportunity || !explanation) return null;
    if (!suspects.some((s) => s.id === suspectId)) return null;

    const timeline = Array.isArray(o.timeline)
        ? o.timeline.map((t) => str(t, 300)).filter(Boolean).slice(0, 20)
        : [];

    return {
        title,
        victim: {
            name: victimName,
            age: num(v.age),
            occupation: str(v.occupation, 100) || undefined,
            description: victimDescription,
            timeOfDeath: str(v.timeOfDeath, 100) || undefined,
            location: str(v.location, 200) || 'Local não especificado',
        },
        intro,
        timeline,
        suspects,
        solution: { suspectId, motive, meansAndOpportunity, explanation },
    };
}

function sanitizeClue(item: unknown, envelopeIndex: number, clueIndex: number): GeneratedClue | null {
    if (typeof item !== 'object' || item === null) return null;
    const o = item as Record<string, unknown>;
    const id = str(o.id, 40) || `pista-${envelopeIndex + 1}-${clueIndex + 1}`;
    const text = str(o.text, 600);
    if (!text) return null;
    const category = CLUE_CATEGORIES.includes(o.category as ClueCategory) ? (o.category as ClueCategory) : 'testimony';
    return { id, category, text, isRedHerring: o.isRedHerring === true };
}

function sanitizeEnvelope(item: unknown, index: number): GeneratedEnvelope | null {
    if (typeof item !== 'object' || item === null) return null;
    const o = item as Record<string, unknown>;
    const id = str(o.id, 40) || `envelope-${index + 1}`;
    const title = str(o.title, 100) || `Envelope ${index + 1}`;
    if (!Array.isArray(o.clues)) return null;
    const clues = o.clues.map((c, i) => sanitizeClue(c, index, i)).filter((c): c is GeneratedClue => c !== null);
    if (clues.length < MIN_CLUES_PER_ENVELOPE || clues.length > MAX_CLUES_PER_ENVELOPE) return null;
    return { id, order: num(o.order) ?? index, title, clues };
}

// suspectIds: passado pra validar que contradictingClueIds não é usado aqui
// (isso é sobre pista, não suspeito) — mantido só pelo padrão de assinatura;
// na prática o cross-check real acontece depois, em replenish.ts, contra os
// ids de pista que realmente saíram de sanitizeEnvelope.
export function validateEnvelopesShape(parsed: unknown): GeneratedEnvelopesResponse | null {
    if (typeof parsed !== 'object' || parsed === null) return null;
    const o = parsed as Record<string, unknown>;

    if (!Array.isArray(o.envelopes)) return null;
    const envelopes = o.envelopes.map((e, i) => sanitizeEnvelope(e, i)).filter((e): e is GeneratedEnvelope => e !== null);
    if (envelopes.length < MIN_ENVELOPES || envelopes.length > MAX_ENVELOPES) return null;

    const contradictingClueIds = Array.isArray(o.contradictingClueIds)
        ? o.contradictingClueIds.map((c) => str(c, 40)).filter(Boolean)
        : [];

    return { envelopes, contradictingClueIds };
}
