import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useCase } from '../lib/useCase';
import type { Room } from '../types/game';
import { ArrowRight, Check, Mail, Search, Users, Vote } from 'lucide-react';

interface InvestigationPhaseProps {
    room: Room;
    userId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    physical: 'Física',
    testimony: 'Depoimento',
    document: 'Documento',
    forensic: 'Perícia',
};

export default function InvestigationPhase({ room, userId }: InvestigationPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = useCase(room.caseId);
    const envelopeIndex = room.currentEnvelopeIndex ?? 0;

    if (!activeCase) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    const envelopes = [...(activeCase.envelopes ?? [])].sort((a, b) => a.order - b.order);
    const openedEnvelopes = envelopes.filter((e) => e.order <= envelopeIndex);
    const hasMoreEnvelopes = envelopeIndex + 1 < envelopes.length;
    const totalClues = envelopes.reduce((n, e) => n + e.clues.length, 0);
    const revealedClues = openedEnvelopes.reduce((n, e) => n + e.clues.length, 0);

    // Anfitrião só consegue abrir o próximo envelope quando todo mundo (menos
    // ele mesmo — clicar em "abrir" já é a confirmação dele) sinalizar que
    // está pronto. Evita clicar tudo de uma vez sem discutir as pistas.
    const envelopeReady = room.envelopeReady ?? {};
    const discussants = room.members.filter((m) => m.id !== room.adminId);
    const readyCount = discussants.filter((m) => envelopeReady[m.id] === envelopeIndex).length;
    const allReady = readyCount === discussants.length;
    const iAmReady = envelopeReady[userId] === envelopeIndex;

    const openNextEnvelope = async () => {
        if (!isAdmin || !hasMoreEnvelopes || !allReady) return;
        await updateDoc(doc(db, "rooms", room.id), { currentEnvelopeIndex: envelopeIndex + 1 });
    };

    const markReady = async () => {
        if (iAmReady || !hasMoreEnvelopes) return;
        await updateDoc(doc(db, "rooms", room.id), { [`envelopeReady.${userId}`]: envelopeIndex });
    };

    const goToVoting = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "rooms", room.id), { status: 'VOTING' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">
                <header className="flex items-center justify-between gap-3 mb-8 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                            <Search size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold leading-none truncate">{activeCase.title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 truncate">
                                Sala: {room.id} · Investigando
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mb-8">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                        Envelopes Abertos ({openedEnvelopes.length}/{envelopes.length} · {revealedClues}/{totalClues} pistas)
                    </h3>
                    <div className="space-y-6">
                        {openedEnvelopes.map((envelope) => (
                            <div
                                key={envelope.id}
                                className="animate-in fade-in slide-in-from-top-2 duration-500"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail size={14} className="text-red-500/70 shrink-0" />
                                    <p className="text-xs font-black uppercase tracking-widest text-red-500/70 truncate">{envelope.title}</p>
                                </div>
                                <div className="space-y-3">
                                    {envelope.clues.map((clue) => (
                                        <div
                                            key={clue.id}
                                            className="p-4 rounded-2xl border border-red-500/20 bg-red-600/5"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/70">
                                                {CATEGORY_LABELS[clue.category] ?? clue.category}
                                            </span>
                                            <p className="text-sm text-slate-200 mt-1">{clue.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        <Users size={16} /> Suspeitos
                    </h3>
                    <div className="space-y-2">
                        {activeCase.suspects.map((s, i) => (
                            <div
                                key={s.id}
                                style={{ animationDelay: `${i * 60}ms` }}
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <p className="font-bold text-sm">{s.name}</p>
                                <p className="text-xs text-slate-500 truncate">{s.alibi}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1" />

                {isAdmin ? (
                    <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent space-y-3">
                        {hasMoreEnvelopes && (
                            <button
                                onClick={openNextEnvelope}
                                disabled={!allReady}
                                className={`w-full py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                                    allReady
                                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-[1.02] active:scale-95'
                                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                }`}
                            >
                                <ArrowRight size={18} />
                                {allReady ? 'Abrir Próximo Envelope' : `Aguardando o grupo (${readyCount}/${discussants.length} prontos)`}
                            </button>
                        )}
                        <button
                            onClick={goToVoting}
                            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 border-b-4 border-red-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Vote size={20} /> Ir Para Votação
                        </button>
                    </div>
                ) : (
                    <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                        {hasMoreEnvelopes && !iAmReady ? (
                            <button
                                onClick={markReady}
                                className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 border-b-4 border-red-800 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Check size={20} /> Estou Pronto Pra Avançar
                            </button>
                        ) : (
                            <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                {hasMoreEnvelopes
                                    ? `Aguardando o resto do grupo (${readyCount}/${discussants.length} prontos)`
                                    : 'Discutam as pistas · Aguardando o anfitrião avançar'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
