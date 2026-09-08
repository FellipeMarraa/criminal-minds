import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, runTransaction, updateDoc } from 'firebase/firestore';
import { CASES } from '../data/cases';
import { awardCaseVotes } from '../lib/scoring';
import type { Room } from '../types/game';
import { Check, Gavel, Users } from 'lucide-react';

interface VotingPhaseProps {
    room: Room;
    userId: string;
}

export default function VotingPhase({ room, userId }: VotingPhaseProps) {
    const isAdmin = room.adminId === userId;
    const activeCase = CASES.find((c) => c.id === room.caseId);
    const [submitting, setSubmitting] = useState(false);

    const iVoted = !!room.votes?.[userId];
    const votedCount = Object.keys(room.votes ?? {}).length;
    const allVoted = votedCount === room.members.length;

    if (!activeCase) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                Caso não encontrado.
            </div>
        );
    }

    const castVote = async (suspectId: string) => {
        if (iVoted || submitting) return;
        setSubmitting(true);
        try {
            // Escreve só a própria chave do mapa `votes` — a regra do
            // Firestore trava pra cada jogador só poder tocar em votes.{seu
            // uid}, então isso nem precisa de transação (não há disputa de
            // outro campo do mesmo doc).
            await updateDoc(doc(db, "rooms", room.id), {
                [`votes.${userId}`]: { suspectId, votedAt: Date.now() },
            });
        } finally {
            setSubmitting(false);
        }
    };

    const revealResult = async () => {
        if (!isAdmin) return;
        const roomRef = doc(db, "rooms", room.id);
        await runTransaction(db, async (tx) => {
            const snap = await tx.get(roomRef);
            if (!snap.exists() || (snap.data() as Room).status !== 'VOTING') return;
            const current = snap.data() as Room;
            tx.update(roomRef, {
                status: 'REVEAL',
                members: awardCaseVotes(current.members, current.votes, activeCase.solution.suspectId),
            });
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">
                <header className="flex flex-col items-center text-center mb-8 pt-6">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 mb-3">
                        <Gavel size={32} />
                    </div>
                    <h2 className="text-2xl font-black leading-none">Quem é o culpado?</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 flex items-center gap-1.5">
                        <Users size={12} /> {votedCount}/{room.members.length} votaram
                    </p>
                </header>

                {iVoted ? (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center animate-in zoom-in-95 fade-in duration-300">
                        <p className="text-sm text-emerald-400 font-bold flex items-center justify-center gap-2">
                            <Check size={16} className="animate-in zoom-in-50 duration-300 delay-150" /> Voto registrado! Aguarde os outros detetives.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {activeCase.suspects.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => castVote(s.id)}
                                disabled={submitting}
                                style={{ animationDelay: `${i * 70}ms` }}
                                className="w-full p-4 rounded-2xl border border-slate-800 bg-slate-900 text-left transition-all hover:border-red-500/50 hover:bg-slate-800/50 hover:scale-[1.01] active:scale-95 disabled:opacity-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <p className="font-bold">{s.name}</p>
                                <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1" />

                {isAdmin && (
                    <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                        <button
                            onClick={revealResult}
                            disabled={!allVoted}
                            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                allVoted
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20 border-b-4 border-red-800 hover:scale-[1.02] active:scale-95 animate-pulse'
                                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <Gavel size={20} /> {allVoted ? 'Revelar Culpado' : 'Aguardando todos votarem...'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
