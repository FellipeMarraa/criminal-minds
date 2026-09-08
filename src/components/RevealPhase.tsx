import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useCase } from '../lib/useCase';
import type { Room } from '../types/game';
import { Check, Crown, PlayCircle, Search, Skull, X } from 'lucide-react';

interface RevealPhaseProps {
    room: Room;
    userId: string;
}

// Suspense breve antes de mostrar o nome do culpado — puramente cosmético
// (local ao cliente, não sincronizado), dá um momento de "revelação" em vez
// do resultado já aparecer pronto assim que a fase muda pra REVEAL.
const REVEAL_DELAY_MS = 1200;

export default function RevealPhase({ room, userId }: RevealPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = useCase(room.caseId);
    const solution = room.solution;
    const standings = [...room.members].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        setRevealed(false);
        const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
        return () => clearTimeout(timer);
    }, [room.caseId]);

    const startNewCase = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "rooms", room.id), {
            status: 'LOBBY',
            caseId: null,
            currentClueIndex: 0,
            votes: {},
        });
    };

    if (!activeCase || !solution) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    const culprit = activeCase.suspects.find((s) => s.id === solution.suspectId);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">
                <header className="flex flex-col items-center text-center mb-6 pt-6">
                    <div className={`p-3 bg-red-500/10 rounded-2xl text-red-400 mb-3 ${revealed ? 'animate-in zoom-in-50 fade-in duration-500' : 'animate-pulse'}`}>
                        {revealed ? <Skull size={32} /> : <Search size={32} />}
                    </div>
                    <h2 className="text-2xl font-black leading-none">
                        {revealed ? 'O culpado era...' : 'Analisando as pistas...'}
                    </h2>
                    {revealed && (
                        <p className="text-xl font-black text-red-400 mt-3 animate-in zoom-in-95 fade-in duration-500 delay-150">
                            {culprit?.name ?? 'Desconhecido'}
                        </p>
                    )}
                </header>

                {revealed && (
                    <>
                        <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                            <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">Motivo</p>
                            <p className="text-sm text-slate-300">{solution.motive}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2 mt-4">Meio e Oportunidade</p>
                            <p className="text-sm text-slate-300">{solution.meansAndOpportunity}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2 mt-4">Explicação</p>
                            <p className="text-sm text-slate-300">{solution.explanation}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                <Crown size={16} /> Placar
                            </h3>
                            <div className="space-y-2">
                                {standings.map((member, i) => {
                                    const correct = room.votes?.[member.id]?.suspectId === solution.suspectId;
                                    return (
                                        <div
                                            key={member.id}
                                            style={{ animationDelay: `${450 + i * 80}ms` }}
                                            className={`flex items-center gap-3 p-3 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                                                i === 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900/50 border-slate-800'
                                            }`}
                                        >
                                            <span className="text-xs font-mono text-slate-500 w-5 shrink-0">{i + 1}º</span>
                                            <img
                                                src={member.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                                className="w-8 h-8 rounded-full border border-slate-800 shrink-0"
                                                alt={member.name}
                                            />
                                            <p className="flex-1 min-w-0 text-sm font-medium text-slate-200 truncate">{member.name}</p>
                                            {correct ? (
                                                <Check size={16} className="text-emerald-400 shrink-0 animate-in zoom-in-50 duration-300" />
                                            ) : (
                                                <X size={16} className="text-slate-600 shrink-0" />
                                            )}
                                            <span className="text-sm font-black text-slate-300 shrink-0">{member.totalPoints ?? 0} pts</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                <div className="flex-1" />

                {revealed && (
                <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent animate-in fade-in duration-500 delay-500">
                    {isAdmin ? (
                        <button
                            onClick={startNewCase}
                            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 border-b-4 border-red-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <PlayCircle size={20} /> Novo Caso
                        </button>
                    ) : (
                        <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            Aguardando o anfitrião escolher um novo caso...
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}
