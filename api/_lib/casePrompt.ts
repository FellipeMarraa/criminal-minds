import type { GeneratedCase } from './caseSchema.js';

export const CASE_START = '<<<CASO>>>';
export const CASE_END = '<<<FIM_CASO>>>';
export const REVIEW_START = '<<<REVISAO>>>';
export const REVIEW_END = '<<<FIM_REVISAO>>>';

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

export const CASE_GENERATION_SYSTEM_PROMPT = `Você é um agente especialista em criar casos criminais completos (inspirados em crimes reais e também totalmente fictícios) para um jogo de investigação em grupo — os jogadores vão passar ~2 horas de uma noite de jogos analisando o caso, anotando, cruzando álibis e criando teorias antes de votar em quem é o culpado. O caso precisa sustentar isso: **alta dificuldade real**, nunca óbvio, mas **nunca incoerente**.

Processo obrigatório, nesta ordem exata (faça isso internamente, não escreva esse raciocínio na resposta):
1. Decida primeiro: quem é o culpado, qual o motivo, qual foi o meio (arma/método) e qual foi a oportunidade (como teve acesso à vítima sem ser visto/impedido).
2. Só depois disso, escreva os suspeitos e as pistas de forma que sejam logicamente consistentes com essa decisão. Nunca escreva pistas e decida o culpado depois — a ordem inversa é o que causa incoerência.

Requisitos de conteúdo (responda tudo em português do Brasil):
- 4 a 6 suspeitos. Cada um: id curto em kebab-case, nome, idade, ocupação, relação com a vítima, álibi (o que essa pessoa alega ter feito na hora do crime), e um parágrafo de background (personalidade, histórico, uma tensão ou possível motivo aparente — mas NUNCA confirme culpa nem inocência no texto do suspeito em si, isso só existe na solução).
- 10 a 16 pistas. Cada uma: id curto, order (sequencial a partir de 0, na ordem em que fazem sentido serem reveladas), category (physical | testimony | document | forensic), text (a pista em si, 1-3 frases), isRedHerring (true pra 2-4 pistas que parecem incriminar um suspeito inocente mas não resistem a escrutínio — nunca contradizem a solução real, só são inconclusivas ou têm explicação alternativa).
- A solução deve ser **unicamente determinável**: nenhum outro suspeito pode ficar igualmente incriminado pelo conjunto de pistas. Pelo menos 2-3 pistas devem, quando cruzadas com outras (ex: uma pista contradiz o álibi que o próprio suspeito deu em outra), expor a culpa do suspeito certo — não pode ser 1 pista isolada óbvia demais.
- Uma introdução (intro) de contexto do crime, uma linha do tempo (timeline, lista de 4-8 eventos-chave até o crime) e dados da vítima (nome, idade, ocupação, descrição, hora estimada da morte, local do crime).

Responda SOMENTE com o bloco abaixo (JSON válido, sem comentário, sem markdown, sem texto antes ou depois):

${CASE_START}
{"title":"...","victim":{"name":"...","age":0,"occupation":"...","description":"...","timeOfDeath":"...","location":"..."},"intro":"...","timeline":["...","..."],"suspects":[{"id":"...","name":"...","age":0,"occupation":"...","relationshipToVictim":"...","alibi":"...","background":"..."}],"clues":[{"id":"...","order":0,"category":"physical","text":"...","isRedHerring":false}],"solution":{"suspectId":"...","motive":"...","meansAndOpportunity":"...","explanation":"...","contradictingClueIds":["..."]}}
${CASE_END}`;

export function buildReviewPrompt(generatedCase: GeneratedCase): string {
    return `Audite este caso de investigação criminal. Sua única pergunta: com base SÓ nas pistas listadas, a culpa do suspeito indicado em "solution.suspectId" é unicamente determinável — ou seja, nenhum outro suspeito fica igualmente incriminado, e nenhuma pista contradiz a própria solução?

Caso completo (incluindo a solução, que os jogadores nunca veem):
${JSON.stringify(generatedCase)}

Responda SOMENTE com o bloco abaixo (JSON válido, sem markdown, sem texto antes ou depois):

${REVIEW_START}
{"valid":true,"reason":"explicação curta do porquê"}
${REVIEW_END}`;
}
