import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CASES } from '../data/cases';
import type { Room } from '../types/game';
import { Play, Users } from 'lucide-react';
import GiphyMoment from './ui/giphy-moment';

interface BriefingPhaseProps {
    room: Room;
    userId: string;
}

export default function BriefingPhase({ room, userId }: BriefingPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = CASES.find((c) => c.id === room.caseId);

    const startInvestigation = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "rooms", room.id), { status: 'INVESTIGATING', currentClueIndex: 0 });
    };

    if (!activeCase) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                Caso não encontrado.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">
                <header className="flex flex-col items-center text-center mb-4 pt-2">
                    <GiphyMoment query="detective case file investigation" size={200} className="mb-3" />
                    <h2 className="text-2xl font-black leading-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">{activeCase.title}</h2>
                </header>

                <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">A Vítima</p>
                    <p className="font-bold text-lg">{activeCase.victim.name}</p>
                    <p className="text-sm text-slate-400 mt-1">{activeCase.victim.description}</p>
                </div>

                <div className="mb-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <p className="text-sm text-slate-300 leading-relaxed">{activeCase.intro}</p>
                </div>

                <div className="mb-8">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        <Users size={16} /> Suspeitos
                    </h3>
                    <div className="space-y-3">
                        {activeCase.suspects.map((s, i) => (
                            <div
                                key={s.id}
                                style={{ animationDelay: `${450 + i * 80}ms` }}
                                className="p-4 rounded-2xl border border-slate-800 bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <p className="font-bold">{s.name}</p>
                                <p className="text-sm text-slate-400 mt-1">{s.description}</p>
                                <p className="text-xs text-slate-500 mt-2 italic">Álibi: {s.alibi}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1" />

                <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                    {isAdmin ? (
                        <button
                            onClick={startInvestigation}
                            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 border-b-4 border-red-800 transition-all hover:scale-[1.02] active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-500"
                            style={{ animationDelay: '600ms' }}
                        >
                            <Play size={20} fill="currentColor" /> Iniciar Investigação
                        </button>
                    ) : (
                        <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            Aguardando o anfitrião iniciar a investigação...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
