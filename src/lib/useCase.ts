import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { StoredCase } from '../data/cases';

// Conteúdo público do caso (tudo exceto a solução, que nunca chega no
// client antes de /api/cases/reveal escrever em rooms/{id}.solution).
// Não muda depois de criado (só status/usedAt/usedByRoomId mudam, o que
// não afeta nenhuma fase depois do LOBBY), mas mantém onSnapshot em vez de
// getDoc único por simplicidade — mesmo padrão do resto do app.
export function useCase(caseId: string | null | undefined): StoredCase | null {
    const [caseData, setCaseData] = useState<StoredCase | null>(null);

    useEffect(() => {
        if (!caseId) {
            setCaseData(null);
            return;
        }
        const unsub = onSnapshot(doc(db, 'cases', caseId), (snap) => {
            setCaseData(snap.exists() ? ({ id: snap.id, ...snap.data() } as StoredCase) : null);
        });
        return () => unsub();
    }, [caseId]);

    return caseData;
}
