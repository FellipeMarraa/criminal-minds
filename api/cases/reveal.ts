import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "../_lib/firebaseAdmin.js";
import { checkRateLimit } from "../_lib/rateLimit.js";
import { awardCaseVotes } from "../_lib/scoring.js";

// A solução de um caso (case_solutions/{id}) nunca é lida pelo client —
// firestore.rules nega leitura pra qualquer um (allow read: if false). Esta
// rota é o ÚNICO lugar que lê e revela: confirma que quem pediu é o
// anfitrião da sala certa, na fase certa, aí sim escreve a solução no doc da
// sala (Admin SDK, bypassa a regra que impede o client de setar
// status:'REVEAL' ou o campo `solution` diretamente).
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

        const rateLimitOk = await checkRateLimit(db, decoded.uid, { collection: "case_reveal_rate_limits", max: 10, windowMs: 60_000 });
        if (!rateLimitOk) {
            return res.status(429).json({ message: 'Muitas requisições. Aguarde alguns segundos.' });
        }

        const { roomId } = req.body || {};
        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({ message: 'roomId ausente' });
        }

        const roomRef = db.collection('rooms').doc(roomId);
        const roomSnap = await roomRef.get();
        if (!roomSnap.exists) return res.status(404).json({ message: 'Sala não encontrada' });

        const room = roomSnap.data()!;
        if (room.adminId !== decoded.uid) {
            return res.status(403).json({ message: 'Só o anfitrião pode revelar o resultado' });
        }
        if (room.status !== 'VOTING') {
            return res.status(409).json({ message: 'A sala não está na fase de votação' });
        }
        if (!room.caseId) {
            return res.status(400).json({ message: 'Sala sem caso selecionado' });
        }

        const solutionSnap = await db.collection('case_solutions').doc(room.caseId).get();
        if (!solutionSnap.exists) {
            console.error(`❌ case_solutions/${room.caseId} não encontrado ao revelar sala ${roomId}`);
            return res.status(500).json({ message: 'Solução do caso não encontrada' });
        }
        const solution = solutionSnap.data()!;

        const awardedMembers = awardCaseVotes(room.members ?? [], room.votes, solution.suspectId);

        await roomRef.update({
            status: 'REVEAL',
            members: awardedMembers,
            solution,
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('❌ Erro ao revelar resultado do caso:', error instanceof Error ? error.message : error);
        return res.status(500).json({ message: 'Falha ao revelar resultado' });
    }
}
