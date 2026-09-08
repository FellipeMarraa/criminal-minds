import { useEffect, useState } from 'react';
import { searchGif } from '../../lib/giphy';

interface GiphyMomentProps {
    query: string;
    size?: number;
    className?: string;
}

// GIF de verdade (não vetor/ícone) buscado no Giphy pra ilustrar o momento:
// caso aberto, pista nova, voto confirmado, culpado revelado. Some
// silenciosamente se a busca falhar ou não tiver chave configurada — nunca
// quebra o layout por causa disso (ver src/lib/giphy.ts).
export default function GiphyMoment({ query, size = 160, className }: GiphyMomentProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setUrl(null);
        searchGif(query).then((result) => {
            if (!cancelled && result) setUrl(result);
        });
        return () => { cancelled = true; };
    }, [query]);

    if (!url) return null;

    return (
        <div className={className} style={{ maxWidth: size }}>
            <img src={url} alt="" className="w-full rounded-2xl border border-slate-800" />
            <a
                href="https://giphy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[9px] text-slate-600 mt-1 hover:text-slate-400"
            >
                Powered by GIPHY
            </a>
        </div>
    );
}
