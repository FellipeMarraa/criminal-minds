import { auth } from "./firebase";

const QUEMSOUEU_URL = "https://qual-celebs.vercel.app";

// Chamado no login: sincroniza plan/planExpiresAt do quemsoueu pro
// Firestore deste app via api/auth/plan-status.ts (Admin SDK, bypassa
// regra). Só cobre quem loga direto aqui sem passar pelo botão "Detetive
// Online" do quemsoueu — esse caminho já sincroniza via SSO no login.
// Falha aqui não deve travar nada: usuário continua como free até o
// próximo sync bem-sucedido.
export async function syncPlanFromQuemsoueu(): Promise<void> {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    try {
        await fetch(`${QUEMSOUEU_URL}/api/auth/plan-status`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${idToken}` },
        });
    } catch (error) {
        console.error("Erro ao sincronizar plano do quemsoueu:", error);
    }
}
