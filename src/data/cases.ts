export interface Suspect {
    id: string;
    name: string;
    photo?: string;
    description: string;
    alibi: string;
}

export interface Clue {
    id: string;
    order: number;
    text: string;
}

export interface CaseSolution {
    suspectId: string;
    motive: string;
    explanation: string;
}

export interface Case {
    id: string;
    title: string;
    premium?: boolean;
    victim: { name: string; description: string };
    intro: string;
    suspects: Suspect[];
    clues: Clue[];
    solution: CaseSolution;
}

// Estrutura pronta, conteúdo placeholder — casos reais entram depois aqui.
// Cada Case precisa de >=2 suspeitos e solution.suspectId apontando pra um
// suspects[].id existente (ver VotingPhase/RevealPhase).
export const CASES: Case[] = [
    {
        id: 'caso-01',
        title: 'O Mistério da Mansão Silenciosa',
        premium: false,
        victim: {
            name: 'Arnaldo Ferreira',
            description: 'Empresário rico, encontrado morto em seu escritório durante uma festa em sua mansão.',
        },
        intro: 'Arnaldo Ferreira foi encontrado morto em seu escritório às 23h, durante uma festa que ele mesmo organizou. A porta estava trancada por dentro. Um dos convidados é o culpado.',
        suspects: [
            {
                id: 'suspeito-1',
                name: 'Beatriz Ferreira',
                description: 'Esposa de Arnaldo, prestes a se divorciar dele.',
                alibi: 'Disse que estava no jardim o tempo todo.',
            },
            {
                id: 'suspeito-2',
                name: 'Carlos Mendes',
                description: 'Sócio de negócios de Arnaldo, com dívidas recentes.',
                alibi: 'Disse que estava na sala de jogos com outros convidados.',
            },
            {
                id: 'suspeito-3',
                name: 'Diana Alves',
                description: 'Secretária de Arnaldo, demitida na semana anterior.',
                alibi: 'Disse que já tinha ido embora antes do crime.',
            },
        ],
        clues: [
            { id: 'pista-1', order: 0, text: 'A janela do escritório estava destrancada, apesar da porta trancada por dentro.' },
            { id: 'pista-2', order: 1, text: 'Foi encontrado um bilhete rasgado com a assinatura "D." no lixo do escritório.' },
            { id: 'pista-3', order: 2, text: 'O segurança da entrada confirma que Diana voltou à mansão 20 minutos antes do horário estimado da morte.' },
        ],
        solution: {
            suspectId: 'suspeito-3',
            motive: 'Vingança pela demissão injusta.',
            explanation: 'Diana voltou pela janela após ser vista saindo, confrontou Arnaldo e deixou o bilhete rasgado como prova do desentendimento anterior.',
        },
    },
];
