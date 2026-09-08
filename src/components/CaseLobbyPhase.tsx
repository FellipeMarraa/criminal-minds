import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import type { StoredCase } from '../data/cases';
import type { AppUser, Room } from '../types/game';
import { isPlanActive } from '../lib/plan';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { ArrowLeft, Check, Copy, FileSearch, Lock, Play, UserPlus, Users } from 'lucide-react';

interface CaseLobbyPhaseProps {
    room: Room;
    userId: string;
}

export default function CaseLobbyPhase({ room, userId }: CaseLobbyPhaseProps) {
    const isAdmin = room.adminId === userId;
    const [copied, setCopied] = useState(false);
    const [showCaseDialog, setShowCaseDialog] = useState(false);
    const [isRoomPremium, setIsRoomPremium] = useState(false);
    const [availableCases, setAvailableCases] = useState<StoredCase[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);
    const bootstrapTriggered = useRef(false);

    // O plano da SALA é sempre o de quem criou (adminId), igual quemsoueu.
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "users", room.adminId), (snap) => {
            const ownerData = snap.data() as AppUser | undefined;
            setIsRoomPremium(isPlanActive(ownerData?.plan, ownerData?.planExpiresAt));
        });
        return () => unsub();
    }, [room.adminId]);

    // Estoque de casos: os free (handwritten) são permanentes, os premium
    // (ai) se repõem sozinhos conforme são consumidos (ver startCase).
    useEffect(() => {
        const q = query(collection(db, 'cases'), where('status', '==', 'available'));
        const unsub = onSnapshot(q, (snap) => {
            setAvailableCases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoredCase)));
        });
        return () => unsub();
    }, []);

    // Bootstrap do estoque: replenish normalmente só dispara ao CONSUMIR um
    // caso premium (ver startCase) — mas se nunca existiu nenhum ainda
    // (estoque zerado, primeira sala premium do projeto), nada nunca
    // dispararia o primeiro. Detecta esse caso e chama uma vez.
    useEffect(() => {
        if (!isAdmin || !isRoomPremium || bootstrapTriggered.current) return;
        if (availableCases.some((c) => c.premium)) return;
        bootstrapTriggered.current = true;
        (async () => {
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) return;
            fetch('/api/cases/replenish', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idToken}` },
            }).catch(() => {});
        })();
    }, [isAdmin, isRoomPremium, availableCases]);

    const selectedCase = availableCases.find((c) => c.id === room.caseId) ?? null;
    const canStart = !!selectedCase;

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}?join=${room.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSelectCase = async (caseId: string) => {
        const target = availableCases.find((c) => c.id === caseId);
        if (target?.premium && !isRoomPremium) return;
        await updateDoc(doc(db, "rooms", room.id), { caseId });
        setShowCaseDialog(false);
    };

    const startCase = async () => {
        if (!canStart || !selectedCase || starting) return;
        setStarting(true);
        try {
            if (selectedCase.premium) {
                // Transação: só marca 'used' se ainda estiver 'available' —
                // evita 2 salas pegarem o mesmo caso do estoque ao mesmo tempo.
                try {
                    await runTransaction(db, async (tx) => {
                        const caseRef = doc(db, 'cases', selectedCase.id);
                        const snap = await tx.get(caseRef);
                        if (!snap.exists() || snap.data().status !== 'available') {
                            throw new Error('CASE_ALREADY_USED');
                        }
                        tx.update(caseRef, { status: 'used', usedAt: serverTimestamp(), usedByRoomId: room.id });
                    });
                } catch (error: any) {
                    if (error.message === 'CASE_ALREADY_USED') {
                        setErrorMessage('Esse caso acabou de ser escolhido por outra sala. Escolha outro no estoque.');
                    } else {
                        setErrorMessage('Não foi possível iniciar o caso. Tente de novo.');
                    }
                    return;
                }
            }

            await updateDoc(doc(db, "rooms", room.id), { status: 'BRIEFING' });

            if (selectedCase.premium) {
                // Fire-and-forget: repõe o estoque em background, não trava
                // o host esperando a IA.
                const idToken = await auth.currentUser?.getIdToken();
                if (idToken) {
                    fetch('/api/cases/replenish', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${idToken}` },
                    }).catch(() => {});
                }
            }
        } finally {
            setStarting(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
                <div className="w-full max-w-2xl p-6 flex flex-col min-h-screen">
                    <header className="flex items-center gap-3 mb-8">
                        <button
                            onClick={() => window.location.href = window.location.origin}
                            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400 shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Sala de Investigação</span>
                            <h2 className="text-xl font-bold leading-none mt-1 truncate">{room.name || 'Nova Sala'}</h2>
                        </div>
                    </header>

                    {isAdmin && (
                        <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400 shrink-0">
                                    <UserPlus size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Convidar detetives</p>
                                    <p className="text-sm text-slate-200 truncate font-mono">ID: {room.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                    copied ? 'bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Link</>}
                            </button>
                        </div>
                    )}

                    {isAdmin ? (
                        <button
                            onClick={() => setShowCaseDialog(true)}
                            className="mb-6 p-5 rounded-2xl border border-red-500/30 bg-red-600/10 flex items-center gap-4 text-left transition-all hover:bg-red-600/20"
                        >
                            <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                                <FileSearch size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Escolher Caso</p>
                                <p className="text-sm font-bold truncate mt-0.5">{selectedCase ? selectedCase.title : 'Nenhum caso selecionado'}</p>
                            </div>
                        </button>
                    ) : (
                        <div className="mb-6 p-5 rounded-2xl border border-slate-800 bg-slate-900/50 text-center">
                            <p className="text-sm text-slate-400">
                                {selectedCase ? `Caso escolhido: ${selectedCase.title}` : 'Aguardando o anfitrião escolher um caso...'}
                            </p>
                        </div>
                    )}

                    <div className="mt-2">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            <Users size={16} /> Detetives na Sala
                        </h3>
                        <div className="space-y-3">
                            {room.members.map((member, i) => (
                                <div
                                    key={member.id}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                >
                                    <img
                                        src={member.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                        className="w-11 h-11 rounded-full border-2 border-slate-800 shrink-0"
                                        alt={member.name}
                                    />
                                    <p className="font-bold truncate">{member.name}</p>
                                    {member.id === room.adminId && (
                                        <span className="ml-auto text-[10px] font-black uppercase text-red-400 shrink-0">Anfitrião</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1" />

                    {isAdmin ? (
                        <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                            <button
                                onClick={startCase}
                                disabled={!canStart || starting}
                                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                    canStart && !starting
                                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20 border-b-4 border-red-800'
                                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                }`}
                            >
                                <Play size={20} fill={canStart ? "currentColor" : "none"} />
                                {starting ? 'INICIANDO...' : 'INICIAR CASO'}
                            </button>
                        </div>
                    ) : (
                        <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                            <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                Aguardando ADM iniciar o caso...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
                <DialogContent className="max-h-[80vh] flex flex-col p-4">
                    <DialogHeader>
                        <DialogTitle>Escolher Caso</DialogTitle>
                        <DialogDescription>Qual mistério a sala vai investigar?</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 space-y-2 -mx-1 px-1">
                        {availableCases.length === 0 && (
                            <p className="px-3 py-6 text-center text-xs text-slate-500">Nenhum caso disponível no momento.</p>
                        )}
                        {availableCases.map((c, i) => {
                            const locked = c.premium && !isRoomPremium;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => !locked && handleSelectCase(c.id)}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 hover:scale-[1.01] active:scale-95 ${
                                        locked
                                            ? 'border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed'
                                            : room.caseId === c.id
                                                ? 'border-red-500 bg-red-600/10'
                                                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold truncate">{c.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{c.suspects.length} suspeitos · {c.clues.length} pistas</p>
                                    </div>
                                    {locked && (
                                        <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 text-amber-400 shrink-0">
                                            <Lock size={9} /> Premium
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ops!</AlertDialogTitle>
                        <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorMessage(null)}>Entendi</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
