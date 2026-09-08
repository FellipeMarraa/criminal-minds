import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    runTransaction,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import {
    browserLocalPersistence,
    GoogleAuthProvider,
    onAuthStateChanged,
    setPersistence,
    signInWithCustomToken,
    signInWithPopup,
    signInWithRedirect
} from 'firebase/auth';
import { Crown, DoorOpen, Hash, LogIn, LogOut, Plus, Search, Skull, Trash2, Users } from 'lucide-react';

import CaseLobbyPhase from './components/CaseLobbyPhase';
import BriefingPhase from './components/BriefingPhase';
import InvestigationPhase from './components/InvestigationPhase';
import VotingPhase from './components/VotingPhase';
import RevealPhase from './components/RevealPhase';
import type { AppUser, Player, Room } from './types/game';
import { isPlanActive } from './lib/plan';
import { syncPlanFromQuemsoueu } from './lib/planSync';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from './components/ui/alert-dialog';

const UserAvatar = ({ src, name }: { src?: string | null; name: string }) => {
    const [error, setError] = useState(false);
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

    if (!src || error) {
        return (
            <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-red-600 flex items-center justify-center font-bold text-white shrink-0">
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full border-2 border-red-500 object-cover shrink-0"
            alt={name}
            onError={() => setError(true)}
        />
    );
};

export default function App() {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState<Room | null>(null);
    const [userRooms, setUserRooms] = useState<Room[]>([]);
    const [inputRoomId, setInputRoomId] = useState('');
    const [inviteProcessed, setInviteProcessed] = useState(false);
    const [ssoProcessed, setSsoProcessed] = useState(false);
    const [roomAction, setRoomAction] = useState<{ id: string; type: 'delete' | 'leave' } | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // SSO vindo do quemsoueu: token chega no hash (#token=...), igual o
    // padrão do planning-trip — mas sem router, então é lido direto aqui.
    useEffect(() => {
        if (ssoProcessed) return;
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
        const token = new URLSearchParams(hash).get('token');
        if (!token) {
            setSsoProcessed(true);
            return;
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        signInWithCustomToken(auth, token)
            .catch((error) => console.error("Erro no SSO do quemsoueu:", error))
            .finally(() => setSsoProcessed(true));
    }, [ssoProcessed]);

    useEffect(() => {
        if (!ssoProcessed) return;

        let unsubRooms: (() => void) | null = null;
        let unsubProfile: (() => void) | null = null;

        const subscribeToProfile = (userRef: ReturnType<typeof doc>, baseData: Omit<AppUser, 'plan' | 'planExpiresAt' | 'activeGroupId'>): Promise<() => void> => {
            return new Promise((resolve) => {
                let resolved = false;
                const settle = (unsub: () => void) => {
                    if (resolved) return;
                    resolved = true;
                    resolve(unsub);
                };
                const unsub = onSnapshot(userRef, (snap) => {
                    const data = snap.data();
                    setUser({
                        ...baseData,
                        plan: data?.plan,
                        planExpiresAt: data?.planExpiresAt ?? null,
                        activeGroupId: data?.activeGroupId ?? null
                    });
                    settle(unsub);
                }, (error) => {
                    console.error("Erro ao observar perfil:", error);
                    settle(unsub);
                });
            });
        };

        const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
            unsubRooms?.();
            unsubRooms = null;
            unsubProfile?.();
            unsubProfile = null;

            if (currentUser) {
                const userRef = doc(db, "users", currentUser.uid);
                const baseData = {
                    uid: currentUser.uid,
                    name: currentUser.displayName || 'Detetive',
                    email: currentUser.email,
                    photo: currentUser.photoURL,
                    lastLogin: new Date()
                };

                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, baseData);
                }

                unsubProfile = await subscribeToProfile(userRef, baseData);
                unsubRooms = fetchUserRooms(currentUser.uid);
                syncPlanFromQuemsoueu();
            } else {
                setUser(null);
                setUserRooms([]);
            }
            setLoading(false);
        });

        return () => {
            unsubAuth();
            unsubRooms?.();
            unsubProfile?.();
        };
    }, [ssoProcessed]);

    useEffect(() => {
        if (!user || inviteProcessed) return;

        const params = new URLSearchParams(window.location.search);
        const inviteCode = params.get('join');

        if (inviteCode) {
            setInviteProcessed(true);
            setTimeout(() => {
                handleJoinByInvite(inviteCode.toUpperCase(), user);
            }, 1000);
        }
    }, [user, inviteProcessed]);

    const fetchUserRooms = (uid: string) => {
        const q = query(collection(db, "rooms"), where("memberIds", "array-contains", uid));
        return onSnapshot(q, (snapshot) => {
            const rooms = snapshot.docs.map(doc => doc.data() as Room);
            setUserRooms(rooms);
        });
    };

    useEffect(() => {
        if (!room?.id) return;
        const unsubRoom = onSnapshot(doc(db, "rooms", room.id), (doc) => {
            setRoom(doc.exists() ? (doc.data() as Room) : null);
        });
        return () => unsubRoom();
    }, [room?.id]);

    const handleJoinByInvite = async (code: string, currentUser: AppUser) => {
        const roomRef = doc(db, "rooms", code);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            const roomData = roomSnap.data() as Room;
            const alreadyMember = roomData.memberIds.includes(currentUser.uid);

            if (!alreadyMember && roomData.status !== 'LOBBY') {
                setErrorMessage("Essa investigação já começou. Peça pro anfitrião criar uma nova sala.");
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (!alreadyMember) {
                const ownerSnap = await getDoc(doc(db, "users", roomData.adminId));
                const ownerData = ownerSnap.data() as AppUser | undefined;
                if (!isPlanActive(ownerData?.plan, ownerData?.planExpiresAt) && roomData.memberIds.length >= 5) {
                    setErrorMessage("Essa sala já atingiu o limite de 5 detetives do plano gratuito do anfitrião.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }

                const newMember: Player = { id: currentUser.uid, name: currentUser.name, photo: currentUser.photo };
                await updateDoc(roomRef, {
                    memberIds: arrayUnion(currentUser.uid),
                    members: arrayUnion(newMember)
                });
                setRoom({
                    ...roomData,
                    memberIds: [...roomData.memberIds, currentUser.uid],
                    members: [...roomData.members, newMember]
                });
            } else {
                setRoom(roomData);
            }

            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 1500);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        const isMobile = /iPhone|Android/i.test(navigator.userAgent);

        try {
            await setPersistence(auth, browserLocalPersistence);
            if (isMobile) {
                try {
                    await signInWithPopup(auth, provider);
                } catch {
                    await signInWithRedirect(auth, provider);
                }
            } else {
                await signInWithPopup(auth, provider);
            }
        } catch (error) {
            console.error("Erro no login:", error);
        }
    };

    const createRoom = async (name: string) => {
        if (!user) return;

        let id = '';
        let isUnique = false;
        for (let attempts = 0; attempts < 5 && !isUnique; attempts++) {
            id = Math.random().toString(36).substring(2, 7).toUpperCase();
            const existing = await getDoc(doc(db, "rooms", id));
            isUnique = !existing.exists();
        }
        if (!isUnique) {
            setErrorMessage("Não foi possível gerar um código único. Tente de novo.");
            return;
        }

        const newRoom: Room = {
            id,
            name: name.trim() || `Sala de ${user.name}`,
            adminId: user.uid,
            status: 'LOBBY',
            caseId: null,
            currentClueIndex: 0,
            memberIds: [user.uid],
            members: [{ id: user.uid, name: user.name, photo: user.photo }],
            createdAt: new Date()
        };

        const userRef = doc(db, "users", user.uid);
        try {
            await runTransaction(db, async (tx) => {
                const userSnap = await tx.get(userRef);
                const userData = userSnap.data() as AppUser | undefined;

                if (!isPlanActive(userData?.plan, userData?.planExpiresAt) && userData?.activeGroupId) {
                    throw new Error('LIMIT_ACTIVE_ROOM');
                }

                tx.set(doc(db, "rooms", id), newRoom);
                tx.update(userRef, { activeGroupId: id });
            });
        } catch (error: any) {
            if (error.message === 'LIMIT_ACTIVE_ROOM') {
                setErrorMessage("Seu plano free permite só 1 sala ativa por vez. Exclua a sala atual ou vire Premium no quemsoueu.");
            } else {
                setErrorMessage("Não foi possível criar a sala. Tente de novo.");
            }
            return;
        }

        setRoom(newRoom);
    };

    const confirmCreateRoom = async () => {
        await createRoom(roomName);
        setShowCreateDialog(false);
        setRoomName('');
    };

    const joinRoom = async (targetId?: string) => {
        if (!user) return;
        const idToJoin = (targetId || inputRoomId).toUpperCase();
        if (!idToJoin) return;
        const roomRef = doc(db, "rooms", idToJoin);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            const roomData = roomSnap.data() as Room;
            const alreadyMember = roomData.memberIds.includes(user.uid);

            if (!alreadyMember && roomData.status !== 'LOBBY') {
                setErrorMessage("Essa investigação já começou. Peça pro anfitrião criar uma nova sala.");
                return;
            }

            if (!alreadyMember) {
                const ownerSnap = await getDoc(doc(db, "users", roomData.adminId));
                const ownerData = ownerSnap.data() as AppUser | undefined;
                if (!isPlanActive(ownerData?.plan, ownerData?.planExpiresAt) && roomData.memberIds.length >= 5) {
                    setErrorMessage("Essa sala já atingiu o limite de 5 detetives do plano gratuito do anfitrião.");
                    return;
                }

                const newMember: Player = { id: user.uid, name: user.name, photo: user.photo };
                await updateDoc(roomRef, {
                    memberIds: arrayUnion(user.uid),
                    members: arrayUnion(newMember)
                });
                setRoom({
                    ...roomData,
                    memberIds: [...roomData.memberIds, user.uid],
                    members: [...roomData.members, newMember]
                });
            } else {
                setRoom(roomData);
            }
        } else {
            setErrorMessage("Sala não encontrada!");
        }
    };

    const confirmRoomAction = async () => {
        if (!roomAction || !user) return;
        const roomRef = doc(db, "rooms", roomAction.id);

        if (roomAction.type === 'delete') {
            const batch = writeBatch(db);
            batch.delete(roomRef);
            batch.update(doc(db, "users", user.uid), { activeGroupId: null });
            await batch.commit();
        } else {
            await runTransaction(db, async (tx) => {
                const snap = await tx.get(roomRef);
                if (!snap.exists()) return;
                const data = snap.data() as Room;
                tx.update(roomRef, {
                    memberIds: data.memberIds.filter(id => id !== user.uid),
                    members: data.members.filter(m => m.id !== user.uid)
                });
            });
        }
        setRoomAction(null);
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        </div>
    );

    if (!user) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
                <div className="mb-4 p-4 rounded-3xl bg-red-500/10 text-red-500 animate-in zoom-in-50 fade-in duration-500">
                    <Skull size={48} />
                </div>
                <h1 className="mb-4 text-5xl md:text-6xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
                    CRIMINAL<span className="text-red-500">MINDS</span>
                </h1>
                <p className="mb-10 max-w-xs text-slate-400 animate-in fade-in duration-700 delay-150">Monte uma sala, escolha um caso e descubra o culpado com seus amigos.</p>
                <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-black transition-all hover:bg-slate-200 hover:scale-105 active:scale-95 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300"
                >
                    <LogIn size={20} /> Entrar com Google
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <>
                <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center overflow-y-auto">
                    <div className="w-full max-w-2xl">
                        <header className="mb-10 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                            <div className="flex items-center gap-4 min-w-0">
                                <UserAvatar src={user.photo} name={user.name} />
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold leading-tight truncate">{user.name}</h2>
                                    <div className="flex items-center gap-2">
                                        {isPlanActive(user.plan, user.planExpiresAt) ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                                                <Crown size={10} /> Premium
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400">
                                                <Search size={10} /> Free
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => auth.signOut()} className="rounded-xl bg-slate-800 p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0">
                                <LogOut size={20} />
                            </button>
                        </header>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="flex flex-col items-center justify-center rounded-3xl border border-red-500/30 bg-red-600/10 p-8 transition-all hover:bg-red-600/20 group shadow-lg"
                                >
                                    <Plus className="mb-2 text-red-400 transition-transform group-hover:scale-110" size={40} />
                                    <span className="font-bold text-lg">Criar Sala</span>
                                </button>

                                <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Hash size={16} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Entrar em uma Sala</span>
                                    </div>
                                    <input
                                        placeholder="CÓDIGO"
                                        className="w-full min-w-0 rounded-2xl border-none bg-slate-800 p-4 text-center font-mono text-2xl font-bold uppercase text-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                                        value={inputRoomId}
                                        onChange={e => setInputRoomId(e.target.value)}
                                    />
                                    <button onClick={() => joinRoom()} className="rounded-2xl bg-red-600 py-4 font-bold text-white transition-all hover:bg-red-500 active:scale-95 shadow-md">
                                        ENTRAR AGORA
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                    <Users size={16} /> Minhas Salas Ativas
                                </h3>
                                <div className="space-y-3">
                                    {userRooms.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 py-12 text-center text-slate-500 shadow-inner">
                                            Você ainda não está em nenhuma sala.
                                        </div>
                                    ) : (
                                        userRooms.map((r) => (
                                            <div
                                                key={r.id}
                                                className="group flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-red-500/50 hover:bg-slate-800/50 shadow-sm"
                                            >
                                                <button onClick={() => joinRoom(r.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                                                    <div className="flex h-12 items-center justify-center rounded-xl bg-red-500/10 px-3 font-mono text-sm font-bold text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">
                                                        {r.id}
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="font-bold text-lg leading-tight truncate">{r.name || 'Sala de Investigação'}</p>
                                                        <p className="text-sm text-slate-500">{r.members.length} Detetives</p>
                                                    </div>
                                                </button>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {r.adminId === user.uid ? (
                                                        <button
                                                            onClick={() => setRoomAction({ id: r.id, type: 'delete' })}
                                                            className="p-2.5 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setRoomAction({ id: r.id, type: 'leave' })}
                                                            className="p-2.5 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                        >
                                                            <DoorOpen size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AlertDialog open={!!roomAction} onOpenChange={(open) => !open && setRoomAction(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{roomAction?.type === 'delete' ? 'Excluir sala?' : 'Sair da sala?'}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {roomAction?.type === 'delete'
                                    ? 'Essa ação não pode ser desfeita. A sala e todo o progresso da investigação serão perdidos.'
                                    : 'Você precisará de um novo convite para entrar de novo.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRoomAction}>
                                {roomAction?.type === 'delete' ? 'Excluir' : 'Sair'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showCreateDialog} onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); setRoomName(''); } }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Nome da Sala</AlertDialogTitle>
                            <AlertDialogDescription>
                                Dá um nome pra sua sala (opcional). Depois disso é só convidar os detetives.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <input
                            placeholder={`Sala de ${user.name}`}
                            className="w-full min-w-0 rounded-2xl border-none bg-slate-800 p-4 text-center font-bold text-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            autoFocus
                            maxLength={40}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmCreateRoom}>Criar Sala</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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

    return (
        <div key={room.status} className="min-h-screen w-full bg-slate-950 text-white animate-in fade-in duration-500">
            {room.status === 'LOBBY' && <CaseLobbyPhase room={room} userId={user.uid} />}
            {room.status === 'BRIEFING' && <BriefingPhase room={room} userId={user.uid} />}
            {room.status === 'INVESTIGATING' && <InvestigationPhase room={room} userId={user.uid} />}
            {room.status === 'VOTING' && <VotingPhase room={room} userId={user.uid} />}
            {room.status === 'REVEAL' && <RevealPhase room={room} userId={user.uid} />}
        </div>
    );
}
