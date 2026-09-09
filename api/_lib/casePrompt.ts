import type { GeneratedBible, GeneratedCase } from './caseSchema.js';

export const BIBLE_START = '<<<BIBLIA>>>';
export const ENVELOPES_START = '<<<ENVELOPES>>>';
export const REVIEW_START = '<<<REVISAO>>>';

// Acha o primeiro JSON balanceado (objeto `{...}` ou array `[...]`) depois do
// marcador de início, em vez de exigir que o marcador de FIM bata caractere a
// caractere — mesma função (e mesmo motivo) do api/ai/chat.ts do
// planning-trip: o modelo às vezes emite o marcador de fim ligeiramente
// diferente do pedido, e comparação exata faria a extração nunca casar.
export function extractBlock(text: string, start: string): string | null {
    const startIdx = text.indexOf(start);
    if (startIdx === -1) return null;

    let i = startIdx + start.length;
    while (i < text.length && text[i] !== '{' && text[i] !== '[') i++;
    if (i >= text.length) return null;
    const jsonStart = i;
    const openChar = text[i];
    const closeChar = openChar === '{' ? '}' : ']';

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (; i < text.length; i++) {
        const ch = text[i];
        if (inString) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === '"') inString = false;
        } else if (ch === '"') {
            inString = true;
        } else if (ch === openChar) {
            depth++;
        } else if (ch === closeChar) {
            depth--;
            if (depth === 0) { i++; break; }
        }
    }
    if (depth !== 0) return null;

    return text.slice(jsonStart, i);
}

// 1ª chamada: só a "bíblia" do caso (história, vítima, suspeitos, solução) —
// SEM pistas ainda. Dividir em 2 chamadas existe por um motivo técnico real:
// pedir tudo de uma vez (bíblia rica + 20-30+ pistas) num response só arrisca
// estourar o teto de tokens/minuto do modelo (já vimos um 429 em produção
// com bem menos conteúdo do que isso).
export const BIBLE_SYSTEM_PROMPT = `Você é um agente especialista em criar casos criminais completos (inspirados em crimes reais e também totalmente fictícios) para um jogo de investigação em grupo — os jogadores vão passar NO MÍNIMO 3 horas de uma noite de jogos analisando o caso, anotando, cruzando álibis, montando linha do raciocínio, antes de votar em quem é o culpado. Isso exige uma história de verdade por trás, densa e bem construída — não um resumo de 2 parágrafos. **Alta dificuldade real**, nunca óbvio, mas **nunca incoerente**.

Você vai gerar só a "bíblia" do caso agora — a história, a vítima, os suspeitos e a solução. As pistas vêm depois, numa etapa separada.

Processo obrigatório, nesta ordem exata (faça isso internamente, não escreva esse raciocínio na resposta):
1. Decida primeiro: quem é o culpado, qual o motivo, qual foi o meio (arma/método) e qual foi a oportunidade (como teve acesso à vítima sem ser visto/impedido). Essa decisão nunca muda depois.
2. Só depois disso, escreva a história e os suspeitos de forma consistente com essa decisão.

Requisitos de conteúdo (responda tudo em português do Brasil):
- **intro**: uma "super história" de verdade — vários parágrafos contando o contexto do crime, o mundo ao redor da vítima, tensões antigas, segredos de família/negócio/comunidade que vão dar substância ao caso. Não é um resumo de uma linha, é o material que os jogadores vão ler e discutir por horas.
- **timeline**: 8 a 14 eventos-chave (não só do dia do crime — inclua histórico relevante de semanas/meses antes) que ajudam a reconstruir o que aconteceu.
- **6 a 8 suspeitos**. Cada um: id curto em kebab-case, nome, idade, ocupação, relação com a vítima, álibi (o que essa pessoa alega ter feito na hora do crime), e um parágrafo denso de background (personalidade, histórico, uma tensão ou possível motivo aparente — mas NUNCA confirme culpa nem inocência no texto do suspeito em si, isso só existe na solução).
- **victim**: nome, idade, ocupação, descrição, hora estimada da morte, local do crime.
- **solution**: suspectId (deve ser o id de um dos suspeitos), motive, meansAndOpportunity, explanation (bem detalhada — vai ser o grande momento de revelação depois de 3h de jogo, precisa entregar).

Responda SOMENTE com o bloco abaixo (JSON válido, sem comentário, sem markdown, sem texto antes ou depois):

${BIBLE_START}
{"title":"...","victim":{"name":"...","age":0,"occupation":"...","description":"...","timeOfDeath":"...","location":"..."},"intro":"...","timeline":["...","..."],"suspects":[{"id":"...","name":"...","age":0,"occupation":"...","relationshipToVictim":"...","alibi":"...","background":"..."}],"solution":{"suspectId":"...","motive":"...","meansAndOpportunity":"...","explanation":"..."}}`;

// 2ª chamada: recebe a bíblia pronta (incluindo a solução) e escreve só os
// envelopes de pista, consistentes com ela.
export function buildEnvelopesPrompt(bible: GeneratedBible): string {
    return `Você recebeu a bíblia completa de um caso de investigação criminal (história, suspeitos e a solução real — os jogadores nunca veem a solução). Sua tarefa agora é criar as PISTAS, organizadas em ENVELOPES que os jogadores abrem aos poucos ao longo de ~3h de investigação.

Bíblia do caso:
${JSON.stringify(bible)}

Requisitos:
- 4 a 7 envelopes, cada um com um título temático (ex: "Envelope 1: A Cena do Crime", "Envelope 2: Vozes da Vizinhança") e 3 a 6 pistas.
- Cada pista: id curto em kebab-case, category (physical | testimony | document | forensic), text (a pista em si, pode ter 2-4 frases — é material de investigação de verdade, não uma linha solta), isRedHerring (true pra várias pistas que parecem incriminar um suspeito inocente mas não resistem a escrutínio — nunca contradizem a solução real, só são inconclusivas ou têm explicação alternativa. Numa investigação de 3h+, red herrings abundantes são essenciais).
- Ordene os envelopes (order, a partir de 0) de forma que a investigação evolua: primeiros envelopes estabelecem a cena e os suspeitos, envelopes do meio complicam com red herrings e contradições aparentes, últimos envelopes trazem as pistas mais decisivas.
- A culpa do suspeito indicado em "solution.suspectId" precisa ser **unicamente determinável** pelo conjunto de pistas — nenhum outro suspeito pode ficar igualmente incriminado. Pelo menos 3-4 pistas (espalhadas em envelopes diferentes, não todas juntas) devem, quando cruzadas entre si, expor a culpa do suspeito certo — nunca uma pista isolada óbvia demais.
- No campo "contradictingClueIds" da resposta, liste os ids exatos (os que você acabou de criar) das pistas que especificamente expõem a culpa do suspeito certo.

Responda SOMENTE com o bloco abaixo (JSON válido, sem comentário, sem markdown, sem texto antes ou depois):

${ENVELOPES_START}
{"envelopes":[{"id":"...","order":0,"title":"...","clues":[{"id":"...","category":"physical","text":"...","isRedHerring":false}]}],"contradictingClueIds":["..."]}`;
}

export function buildReviewPrompt(generatedCase: GeneratedCase): string {
    return `Audite este caso de investigação criminal. Sua única pergunta: com base SÓ nas pistas listadas (dentro dos envelopes), a culpa do suspeito indicado em "solution.suspectId" é unicamente determinável — ou seja, nenhum outro suspeito fica igualmente incriminado, e nenhuma pista contradiz a própria solução?

Caso completo (incluindo a solução, que os jogadores nunca veem):
${JSON.stringify(generatedCase)}

Responda SOMENTE com o bloco abaixo (JSON válido, sem markdown, sem texto antes ou depois):

${REVIEW_START}
{"valid":true,"reason":"explicação curta do porquê"}`;
}
