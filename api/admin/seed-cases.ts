import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "../_lib/firebaseAdmin.js";
import { FREE_CASE_ID, FREE_CASE, FREE_SOLUTION, SHOWCASE_CASE_ID, SHOWCASE_CASE, SHOWCASE_SOLUTION } from "../_lib/seedData.js";

// Endpoint de admin só pra evitar terminal/service-account local — faz o
// mesmo que scripts/cleanup-legacy-cases.mjs + scripts/seed-cases.mjs, só
// que clicando num botão dentro do próprio app (Admin SDK já configurado
// no servidor). Restrito a quem tem isAdmin:true no doc users/{uid} — esse
// campo só é settable via Admin SDK/console (fora da allowlist de update
// em firestore.rules), nunca pelo client.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!idToken) return res.status(401).json({ message: 'Token de autenticação ausente' });

        const decoded = await admin.auth().verifyIdToken(idToken);
        const db = admin.firestore();

        const callerDoc = await db.collection('users').doc(decoded.uid).get();
        if (callerDoc.data()?.isAdmin !== true) {
            return res.status(403).json({ message: 'Sem permissão' });
        }

        // 1. Limpa qualquer doc de schema antigo (sem `envelopes` — de antes
        // da migração pra envelopes).
        const snap = await db.collection('cases').get();
        let cleaned = 0;
        for (const doc of snap.docs) {
            if (Array.isArray(doc.data().envelopes)) continue;
            const batch = db.batch();
            batch.delete(doc.ref);
            batch.delete(db.collection('case_solutions').doc(doc.id));
            await batch.commit();
            cleaned++;
        }

        // 2. Grava os 2 casos escritos à mão (idempotente — .set() sobrescreve).
        await db.collection('cases').doc(FREE_CASE_ID).set({
            ...FREE_CASE,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            usedAt: null,
        });
        await db.collection('case_solutions').doc(FREE_CASE_ID).set(FREE_SOLUTION);

        await db.collection('cases').doc(SHOWCASE_CASE_ID).set({
            ...SHOWCASE_CASE,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            usedAt: null,
        });
        await db.collection('case_solutions').doc(SHOWCASE_CASE_ID).set(SHOWCASE_SOLUTION);

        return res.status(200).json({ cleaned, seeded: [FREE_CASE_ID, SHOWCASE_CASE_ID] });
    } catch (error) {
        console.error('❌ Erro ao semear casos via admin:', error instanceof Error ? error.message : error);
        return res.status(500).json({ message: 'Falha ao semear casos' });
    }
}
