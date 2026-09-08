// Chave pública do Giphy (não é secreta — é o mesmo modelo da apiKey do
// Firebase já hardcoded em lib/firebase.ts: identifica o app, não autentica
// um usuário). Configurável via VITE_GIPHY_API_KEY (.env, não commitado —
// ver .env.example). Sem chave configurada, cai de volta na chave de teste
// pública que o Giphy documentava oficialmente — hoje retorna 403 (parece
// desativada/restrita pelo próprio Giphy), então sem chave própria a busca
// sempre falha e GiphyMoment só não mostra nada (fallback já é assim por
// design). Precisa de uma chave real gerada em developers.giphy.com.
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || 'dc6zaTOxFJmzC';

interface GiphyImage {
    url: string;
}

interface GiphyGif {
    images: {
        fixed_height?: GiphyImage;
        original?: GiphyImage;
    };
}

// Busca GIFs pro termo, escolhe um aleatório entre os resultados mais
// relevantes (dá variedade entre partidas sem cair em resultado
// irrelevante). Retorna null silenciosamente em qualquer falha — quem
// chama nunca deve travar a UI por causa de um GIF que não carregou.
export async function searchGif(query: string): Promise<string | null> {
    try {
        const params = new URLSearchParams({
            api_key: GIPHY_API_KEY,
            q: query,
            limit: '8',
            rating: 'pg',
            lang: 'pt',
        });
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);
        if (!res.ok) return null;

        const data = await res.json();
        const results = data?.data as GiphyGif[] | undefined;
        if (!results || results.length === 0) return null;

        const pick = results[Math.floor(Math.random() * results.length)];
        return pick?.images?.fixed_height?.url ?? pick?.images?.original?.url ?? null;
    } catch (error) {
        console.error('Erro ao buscar GIF no Giphy:', error);
        return null;
    }
}
