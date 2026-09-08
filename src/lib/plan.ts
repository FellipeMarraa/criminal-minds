// Nunca confia só no campo `plan` cru, sempre recalcula a expiração contra
// "agora". Serve só pra UI (habilitar/desabilitar ação); quem decide de
// verdade é a regra do Firestore no momento da escrita. O valor em si vem
// sincronizado do quemsoueu via SSO (ver src/lib/detectiveSso não existe
// aqui — quem gera o link é o quemsoueu; este app só consome o custom token).
export function isPlanActive(plan: string | undefined, planExpiresAt: string | null | undefined): boolean {
    if (!plan || !['premium', 'annual'].includes(plan)) return false;
    if (!planExpiresAt) return true;
    return new Date(planExpiresAt) > new Date();
}
