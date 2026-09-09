export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqResult {
    text: string;
    promptTokens: number;
    completionTokens: number;
    toolCalls: number;
}

// groq/compound: sistema agentic da própria Groq, decide sozinho quando
// busca algo na web antes de responder — mesmo modelo já em uso no
// planning-trip (api/ai/_lib/providers/groq.ts de lá), pra casos "reais e
// fictícios" a busca ajuda a fundamentar o caso em fatos plausíveis. Roda
// sobre openai/gpt-oss-120b por baixo, com rate limit de conta compartilhado
// com esse modelo — por isso a revisão (que não precisa de busca na web)
// usa um modelo menor à parte (ver GENERATION_MODEL/REVIEW_MODEL em
// casePrompt.ts), pra não competir pelo mesmo teto de tokens/minuto.
export const GENERATION_MODEL = "groq/compound";
export const REVIEW_MODEL = "openai/gpt-oss-20b";

export async function callGroq(messages: GroqMessage[], model: string = GENERATION_MODEL): Promise<GroqResult> {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY não configurada');

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, messages }),
    });

    if (!res.ok) {
        throw new Error(`Groq respondeu ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const executedTools = data.choices?.[0]?.message?.executed_tools;
    const toolCalls = Array.isArray(executedTools) ? executedTools.length : 0;

    return {
        text: data.choices?.[0]?.message?.content ?? '',
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        toolCalls,
    };
}
