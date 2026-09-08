import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CASES } from '../data/cases';
import type { Room } from '../types/game';
import { ArrowRight, Search, Users, Vote } from 'lucide-react';
import LottieAnimation from './ui/lottie-animation';
import clueFlashAnimation from '../assets/lottie/clue-flash.json';

interface InvestigationPhaseProps {
    room: Room;
    userId: string;
}

export default function InvestigationPhase({ room, userId }: InvestigationPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = CASES.find((c) => c.id === room.caseId);
    const clueIndex = room.currentClueIndex ?? 0;

    if (!activeCase) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                Caso não encontrado.
            </div>
        );
    }

    const revealedClues = activeCase.clues.filter((c) => c.order <= clueIndex);
    const hasMoreClues = clueIndex + 1 < activeCase.clues.length;

    const revealNextClue = async () => {
        if (!isAdmin || !hasMoreClues) return;
        await updateDoc(doc(db, "rooms", room.id), { currentClueIndex: clueIndex + 1 });
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
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                            Pistas Reveladas ({revealedClues.length}/{activeCase.clues.length})
                        </h3>
                        <LottieAnimation key={clueIndex} animationData={clueFlashAnimation} size={40} />
                    </div>
                    <div className="space-y-3">
                        {revealedClues.map((clue) => (
                            <div
                                key={clue.id}
                                className="p-4 rounded-2xl border border-red-500/20 bg-red-600/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-500"
                            >
                                <p className="text-sm text-slate-200">{clue.text}</p>
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
                        <button
                            onClick={revealNextClue}
                            disabled={!hasMoreClues}
                            className={`w-full py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                                hasMoreClues
                                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-[1.02] active:scale-95'
                                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <ArrowRight size={18} /> Revelar Próxima Pista
                        </button>
                        <button
                            onClick={goToVoting}
                            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 border-b-4 border-red-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Vote size={20} /> Ir Para Votação
                        </button>
                    </div>
                ) : (
                    <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                        <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            Discutam as pistas · Aguardando o anfitrião avançar
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
