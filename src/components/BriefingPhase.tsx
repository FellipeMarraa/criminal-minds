import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useCase } from '../lib/useCase';
import type { Room } from '../types/game';
import { Play, Skull, Users } from 'lucide-react';

interface BriefingPhaseProps {
    room: Room;
    userId: string;
}

export default function BriefingPhase({ room, userId }: BriefingPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = useCase(room.caseId);

    const startInvestigation = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "rooms", room.id), { status: 'INVESTIGATING', currentEnvelopeIndex: 0, envelopeReady: {} });
    };

    if (!activeCase) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">
                <header className="flex flex-col items-center text-center mb-8 pt-6">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 mb-3 animate-in zoom-in-50 fade-in duration-500">
                        <Skull size={32} />
                    </div>
                    <h2 className="text-2xl font-black leading-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">{activeCase.title}</h2>
                </header>

                <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">A Vítima</p>
                    <p className="font-bold text-lg">{activeCase.victim.name}</p>
                    {(activeCase.victim.occupation || activeCase.victim.age) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {activeCase.victim.occupation}{activeCase.victim.age ? `, ${activeCase.victim.age} anos` : ''}
                        </p>
                    )}
                    <p className="text-sm text-slate-400 mt-2">{activeCase.victim.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                        {activeCase.victim.location && <span>📍 {activeCase.victim.location}</span>}
                        {activeCase.victim.timeOfDeath && <span>🕐 {activeCase.victim.timeOfDeath}</span>}
                    </div>
                </div>

                {activeCase.timeline && activeCase.timeline.length > 0 && (
                    <div className="mb-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">Linha do Tempo</p>
                        <ul className="space-y-1.5">
                            {activeCase.timeline.map((event, i) => (
                                <li key={i} className="text-sm text-slate-300 flex gap-2">
                                    <span className="text-red-500/60 shrink-0">—</span> {event}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold">{s.name}</p>
                                    <span className="text-[10px] text-slate-500 shrink-0">{s.relationshipToVictim}</span>
                                </div>
                                {s.occupation && <p className="text-xs text-slate-500 mt-0.5">{s.occupation}{s.age ? `, ${s.age} anos` : ''}</p>}
                                <p className="text-sm text-slate-400 mt-2">{s.background}</p>
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
