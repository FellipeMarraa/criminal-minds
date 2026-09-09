// Conteúdo estático dos 2 casos escritos à mão (mesmo conteúdo de
// scripts/seed-cases.mjs, duplicado aqui de propósito — api/ não importa
// scripts/.mjs, mesmo padrão de duplicar conteúdo estático já usado no
// projeto pra CURRENCY_CODES/EXPENSE_CATEGORIES do planning-trip). Usado
// pelo endpoint de admin api/admin/seed-cases.ts, que faz o mesmo trabalho
// do script local mas sem precisar de terminal/service account no
// computador de quem administra o jogo.

export const FREE_CASE_ID = 'caso-01';

export const FREE_CASE = {
    title: 'O Mistério da Mansão Silenciosa',
    premium: false,
    source: 'handwritten',
    status: 'available',
    victim: {
        name: 'Arnaldo Ferreira',
        age: 58,
        occupation: 'Empresário',
        description: 'Empresário rico, encontrado morto em seu escritório durante uma festa em sua mansão.',
        timeOfDeath: '23h',
        location: 'Escritório da mansão',
    },
    intro: 'Arnaldo Ferreira foi encontrado morto em seu escritório às 23h, durante uma festa que ele mesmo organizou. A porta estava trancada por dentro. Um dos convidados é o culpado.',
    timeline: [
        '20h — festa começa, convidados chegam',
        '21h30 — Arnaldo discute com Carlos sobre dívidas da sociedade',
        '22h — Diana é vista chegando de volta à mansão',
        '22h45 — última vez que Arnaldo foi visto vivo, entrando no escritório',
        '23h — corpo encontrado pela equipe de bufê',
    ],
    suspects: [
        {
            id: 'suspeito-1',
            name: 'Beatriz Ferreira',
            age: 52,
            occupation: 'Socialite',
            relationshipToVictim: 'Esposa',
            alibi: 'Disse que estava no jardim o tempo todo.',
            background: 'Prestes a se divorciar de Arnaldo, o que a deixaria com metade do patrimônio segundo o acordo pré-nupcial.',
        },
        {
            id: 'suspeito-2',
            name: 'Carlos Mendes',
            age: 47,
            occupation: 'Sócio de negócios',
            relationshipToVictim: 'Sócio',
            alibi: 'Disse que estava na sala de jogos com outros convidados.',
            background: 'Sócio de Arnaldo há 15 anos, acumulou dívidas recentes e temia ser expulso da sociedade.',
        },
        {
            id: 'suspeito-3',
            name: 'Diana Alves',
            age: 34,
            occupation: 'Ex-secretária',
            relationshipToVictim: 'Ex-funcionária',
            alibi: 'Disse que já tinha ido embora antes do crime.',
            background: 'Demitida por Arnaldo na semana anterior sob acusações que ela considera injustas.',
        },
    ],
    envelopes: [
        {
            id: 'envelope-1',
            order: 0,
            title: 'Envelope 1: A Cena do Crime',
            clues: [
                { id: 'pista-1', category: 'physical', text: 'A janela do escritório estava destrancada, apesar da porta trancada por dentro.', isRedHerring: false },
                { id: 'pista-2', category: 'document', text: 'Foi encontrado um bilhete rasgado com a assinatura "D." no lixo do escritório.', isRedHerring: false },
            ],
        },
        {
            id: 'envelope-2',
            order: 1,
            title: 'Envelope 2: Vozes da Festa',
            clues: [
                { id: 'pista-3', category: 'testimony', text: 'O segurança da entrada confirma que Diana voltou à mansão 20 minutos antes do horário estimado da morte — mas ela disse que já tinha ido embora.', isRedHerring: false },
                { id: 'pista-4', category: 'testimony', text: 'Um garçom viu Carlos saindo da sala de jogos por alguns minutos, mas não soube dizer pra onde foi.', isRedHerring: true },
            ],
        },
    ],
    usedByRoomId: null,
};

export const FREE_SOLUTION = {
    suspectId: 'suspeito-3',
    motive: 'Vingança pela demissão injusta.',
    meansAndOpportunity: 'Diana voltou pela janela do escritório, que conhecia bem por ter trabalhado ali, evitando ser vista entrando pela porta principal.',
    explanation: 'O álibi de Diana ("já tinha ido embora") é contradito pelo segurança, que confirma seu retorno pouco antes do crime. O bilhete rasgado assinado "D." no lixo do escritório é a prova física do confronto entre ela e Arnaldo.',
    contradictingClueIds: ['pista-2', 'pista-3'],
};

export const SHOWCASE_CASE_ID = 'caso-02-vinicola';

export const SHOWCASE_CASE = {
    title: 'O Silêncio da Vinícola Boa Esperança',
    premium: true,
    source: 'handwritten',
    status: 'available',
    victim: {
        name: 'Henrique Salgado',
        age: 61,
        occupation: 'Fundador e proprietário da Vinícola Boa Esperança',
        description: 'Henrique construiu a vinícola do zero há 30 anos e era uma figura muito respeitada na região — durão nos negócios, mas sentimental quando o assunto era o legado que deixaria para a família.',
        timeOfDeath: '22h10 (estimado)',
        location: 'Adega subterrânea da vinícola, durante a Festa da Colheita anual',
    },
    intro: `A Vinícola Boa Esperança nasceu há 30 anos, quando Henrique Salgado apostou as economias da família — e um empréstimo arriscado com o então amigo Eduardo Ferraz — para transformar um pedaço de terra improdutivo num dos rótulos mais respeitados da região. A sociedade com Eduardo não durou: uma década depois, os dois romperam em meio a acusações cruzadas sobre a divisão dos lucros, e Eduardo sumiu de vista por anos.

Hoje a vinícola é bem mais que um negócio — é o centro de uma teia de expectativas, ressentimentos e segredos que se acumularam por décadas. Henrique vinha negociando em sigilo a venda da propriedade para um grupo estrangeiro, um plano que dividiu sua família: o filho Thiago via a venda como uma traição ao legado que ajudou a construir; a filha Marina, que vive fora do país, pressionava o pai a aceitar, contando com sua parte da venda para resolver problemas financeiros próprios. A enóloga-chefe Camila Duarte, responsável por revitalizar os rótulos premium da casa nos últimos 3 anos, alimentava em segredo a esperança de comprar a vinícola ela mesma caso o negócio com os estrangeiros não se concretizasse.

Nos bastidores, mais tensão: Henrique descobrira meses atrás que sua esposa Renata mantinha um caso extraconjugal, e vinha silenciosamente reorganizando seu testamento. Thiago, pressionado por dívidas pessoais de um negócio próprio que fracassara, começara a desviar dinheiro da vinícola através de notas fiscais falsas de fornecedores — um esquema que ele mal conseguia manter em segredo. E Eduardo Ferraz, o antigo sócio, reaparecera dois meses atrás cobrando publicamente uma parte dos lucros da fundação da empresa, numa cena feia em um evento da cidade que quase terminou em briga física.

Na noite da Festa da Colheita — a maior celebração anual da vinícola, com dezenas de convidados, fogos de artifício e a sala de degustação lotada — Henrique tomou a decisão que mudaria tudo: não venderia a propriedade a ninguém de fora da família, nem ao grupo estrangeiro, nem à própria Camila, que havia feito uma proposta informal semanas antes. Ele planejava contar a ela pessoalmente naquela mesma noite. Por volta das 22h10, em algum momento entre o show de fogos e o encerramento da festa, Henrique desceu à adega subterrânea sozinho — e não voltou. Foi encontrado horas depois pela equipe de limpeza, caído entre os barris, com ferimentos que a perícia rapidamente descartou como sendo de um acidente.`,
    timeline: [
        'Há 30 anos — Henrique funda a Vinícola Boa Esperança com a ajuda financeira de Eduardo Ferraz.',
        'Há 8 anos — Henrique e Eduardo rompem a sociedade em meio a acusações cruzadas sobre a divisão dos lucros.',
        'Há 3 anos — Camila Duarte é contratada como enóloga-chefe, revitaliza os rótulos premium da vinícola.',
        'Há 1 ano — Henrique inicia negociações sigilosas para vender a vinícola a um grupo estrangeiro.',
        'Há 6 meses — Henrique descobre um caso extraconjugal de Renata e começa a revisar o testamento em segredo.',
        'Há 2 meses — Eduardo reaparece publicamente cobrando parte dos lucros da fundação da empresa, quase parte para briga física com Henrique num evento da cidade.',
        'Há 6 semanas — Marina retorna do exterior e pressiona o pai a aceitar a venda.',
        'Há 3 semanas — Thiago começa a desviar dinheiro da vinícola via notas fiscais falsas de fornecedores, pressionado por dívidas pessoais.',
        'Há 2 semanas — Renata contrata um advogado de divórcio, já resignada ao fim do casamento, sem alarde.',
        'Há 5 dias — Henrique decide não vender a vinícola a ninguém fora da família, e recusa uma proposta informal de Camila de comprá-la caso o negócio estrangeiro caísse.',
        'Na noite da Festa da Colheita — Henrique planeja contar a Camila, pessoalmente, sobre sua decisão.',
        '22h10 (estimado) — Henrique é morto na adega subterrânea.',
    ],
    suspects: [
        {
            id: 'renata-salgado',
            name: 'Renata Salgado',
            age: 58,
            occupation: 'Sócia-administrativa da vinícola',
            relationshipToVictim: 'Esposa',
            alibi: 'Diz que passou a noite inteira recebendo os convidados na entrada principal da festa, ao lado do casal de anfitriões parceiros do evento.',
            background: 'Casada com Henrique há 32 anos, Renata sempre foi o rosto social da vinícola. Como sócia-administrativa, também costuma descer à adega de vez em quando pra conferir o estoque, embora raramente o faça durante eventos. Vinha mantendo um caso extraconjugal havia meses — Henrique descobriu, mas os dois nunca discutiram abertamente sobre isso diante de terceiros.',
        },
        {
            id: 'thiago-salgado',
            name: 'Thiago Salgado',
            age: 29,
            occupation: 'Gerente de operações da vinícola',
            relationshipToVictim: 'Filho',
            alibi: 'Diz que passou boa parte da noite sozinho no depósito de geradores, resolvendo um problema de energia.',
            background: 'Filho único homem, Thiago se opõe abertamente à venda da vinícola para o grupo estrangeiro. Como gerente de operações, é também quem cuida da manutenção dos equipamentos antigos guardados na adega, tendo acesso livre a ela a qualquer hora. Um negócio próprio fracassado o deixou com dívidas pessoais que ele vem tentando esconder da família.',
        },
        {
            id: 'camila-duarte',
            name: 'Camila Duarte',
            age: 34,
            occupation: 'Enóloga-chefe da vinícola',
            relationshipToVictim: 'Funcionária de confiança',
            alibi: 'Diz que passou a festa inteira na sala de degustação, servindo os convidados pessoalmente.',
            background: 'Contratada há 3 anos, Camila é responsável pelo renascimento dos rótulos premium da casa e desenvolveu técnicas próprias de clarificação do vinho que considera segredo profissional seu. Nutria a esperança silenciosa de um dia comprar a vinícola.',
        },
        {
            id: 'eduardo-ferraz',
            name: 'Eduardo Ferraz',
            age: 52,
            occupation: 'Empresário (ex-sócio fundador)',
            relationshipToVictim: 'Ex-sócio',
            alibi: 'Diz que foi embora da festa por volta das 22h, direto para o hotel onde estava hospedado.',
            background: 'Sócio original de Henrique na fundação da vinícola, rompeu a parceria há 8 anos em más condições. Reapareceu recentemente cobrando publicamente uma parte dos lucros da fundação da empresa, chegando a ameaçar Henrique num evento da cidade.',
        },
        {
            id: 'marina-salgado',
            name: 'Marina Salgado',
            age: 26,
            occupation: 'Está entre empregos, mora no exterior',
            relationshipToVictim: 'Filha',
            alibi: 'Diz que estava em uma chamada de vídeo com o namorado, que mora no exterior, durante boa parte da noite.',
            background: 'Vive fora do país há alguns anos e depende financeiramente do pai. Voltou ao Brasil há 6 semanas defendendo abertamente a venda da vinícola, algo que a colocou em atrito direto com o irmão Thiago.',
        },
        {
            id: 'paulo-nery',
            name: 'Paulo Nery',
            age: 45,
            occupation: 'Capataz e gerente do vinhedo',
            relationshipToVictim: 'Funcionário de longa data',
            alibi: 'Diz que passou a noite operando o show de fogos de artifício, na área externa, visível para os convidados.',
            background: 'Trabalha na vinícola desde os primeiros anos, extremamente leal a Henrique. Recentemente foi preterido de uma promessa antiga de uma pequena participação societária, quando Henrique mudou de ideia sobre o assunto.',
        },
    ],
    envelopes: [
        {
            id: 'env-1',
            order: 0,
            title: 'Envelope 1: A Cena e os Primeiros Depoimentos',
            clues: [
                { id: 'e1-c1', category: 'forensic', text: 'A perícia inicial descarta a hipótese de acidente: o ferimento na nuca de Henrique tem um formato incompatível com uma queda entre os barris — sugere um golpe com um objeto de borda reta.', isRedHerring: false },
                { id: 'e1-c2', category: 'testimony', text: 'Paulo Nery, o capataz, comenta de passagem que viu alguém saindo sozinho da área da adega em algum momento da noite, enxugando as mãos num avental — mas estava longe e não conseguiu ver o rosto direito, só reparou que era alguém vestindo o avental padrão da equipe da festa.', isRedHerring: false },
                { id: 'e1-c3', category: 'document', text: 'Uma página do livro-caixa da vinícola mostra divergências entre notas fiscais de fornecedores e os pagamentos realmente registrados no banco, num valor que vem crescendo nos últimos 3 meses.', isRedHerring: false },
                { id: 'e1-c4', category: 'testimony', text: 'Renata confirma que passou a noite recebendo convidados na entrada principal, ao lado do casal de anfitriões parceiros do evento.', isRedHerring: false },
            ],
        },
        {
            id: 'env-2',
            order: 1,
            title: 'Envelope 2: Motivos à Mesa',
            clues: [
                { id: 'e2-c1', category: 'document', text: 'Um rascunho de contrato de venda da vinícola ao grupo estrangeiro é encontrado na maleta de Henrique, com uma anotação recente à mão na margem: "não vou vender pra ninguém de fora — vou ter que dar uma notícia difícil amanhã, ela não vai gostar".', isRedHerring: false },
                { id: 'e2-c2', category: 'testimony', text: 'Thiago admite discordar abertamente da venda da vinícola, mas fica visivelmente desconfortável e evasivo quando perguntado sobre o que exatamente fazia sozinho no depósito de geradores.', isRedHerring: false },
                { id: 'e2-c3', category: 'testimony', text: 'Marina confirma que defendia a venda da vinícola e que estava em uma longa chamada de vídeo com o namorado, que mora no exterior, durante boa parte da festa.', isRedHerring: false },
                { id: 'e2-c4', category: 'physical', text: 'Uma garrafa de vinho quebrada e um bilhete rasgado e ilegível são encontrados perto da porta lateral da adega — à primeira vista parece uma pista importante, mas o bilhete tem data de mais de um ano atrás, de uma comemoração antiga da equipe.', isRedHerring: true },
            ],
        },
        {
            id: 'env-3',
            order: 2,
            title: 'Envelope 3: Álibis em Xeque',
            clues: [
                { id: 'e3-c1', category: 'document', text: 'O ticket do estacionamento do hotel de Eduardo Ferraz, cruzado com o registro de entrada da recepção, confirma que ele chegou ao hotel às 22h05 — compatível com ter deixado a festa bem antes da hora estimada da morte.', isRedHerring: false },
                { id: 'e3-c2', category: 'document', text: 'A operadora de telefonia confirma que a chamada de vídeo de Marina com o namorado durou de 21h40 a 23h15, sem interrupções.', isRedHerring: false },
                { id: 'e3-c3', category: 'testimony', text: 'A gravação oficial do show de fogos de artifício, e o depoimento de mais de uma dezena de convidados, confirmam Paulo no controle do show durante toda a janela em que o crime aconteceu.', isRedHerring: false },
                { id: 'e3-c4', category: 'document', text: 'O livro de comandas da sala de degustação mostra um intervalo de cerca de 40 minutos, entre 21h50 e 22h30, sem nenhum pedido registrado na estação de Camila — justamente quando ela diz que estava servindo convidados sem parar.', isRedHerring: false },
                { id: 'e3-c5', category: 'document', text: 'O fotógrafo contratado para a festa entrega o contact sheet com todas as fotos da noite: Renata aparece cumprimentando convidados na entrada principal em pelo menos seis fotos com horários espalhados entre 21h15 e 22h50, cobrindo toda a janela em que o crime pode ter acontecido.', isRedHerring: false },
            ],
        },
        {
            id: 'env-4',
            order: 3,
            title: 'Envelope 4: O Segredo da Adega',
            clues: [
                { id: 'e4-c1', category: 'forensic', text: 'Um resíduo de um agente de clarificação artesanal é encontrado perto do corpo — o laboratório confirma que esse composto específico não faz parte do processo padrão da vinícola, então quem o usou trouxe de fora, por conta própria.', isRedHerring: false },
                { id: 'e4-c2', category: 'physical', text: 'Escondida atrás de uma fileira de barris, é encontrada uma ferramenta antiga de prensagem manual, com uma borda reta e vestígios de sangue.', isRedHerring: false },
                { id: 'e4-c3', category: 'document', text: 'O planner pessoal de Henrique, recuperado de seu escritório, confirma a anotação vista antes no rascunho do contrato: ele havia marcado "falar sobre a proposta dela" na noite da festa, sem citar nome — mas a única proposta de compra da vinícola que ele recebera nos últimos meses, além do grupo estrangeiro, foi a de Camila, semanas atrás.', isRedHerring: false },
                { id: 'e4-c4', category: 'testimony', text: 'O contador da vinícola confirma que se reuniu com Thiago em uma sala nos fundos exatamente entre 21h50 e 22h30, tentando resolver as pendências das notas fiscais divergentes antes que alguém mais percebesse.', isRedHerring: false },
            ],
        },
        {
            id: 'env-5',
            order: 4,
            title: 'Envelope 5: As Últimas Peças',
            clues: [
                { id: 'e5-c1', category: 'document', text: 'Um extrato de honorários mostra que Renata já havia contratado um advogado de divórcio há 2 semanas — muito antes da festa, e de forma discreta, sugerindo que ela já havia se resignado ao fim do casamento sem urgência de agir naquela noite.', isRedHerring: false },
                { id: 'e5-c2', category: 'testimony', text: 'Uma auxiliar da sala de degustação lembra vagamente de Camila ter dito que ia "só um minutinho" resolver algo, mas não soube precisar quanto tempo ela ficou fora.', isRedHerring: false },
                { id: 'e5-c3', category: 'physical', text: 'Um pequeno fragmento de tecido, do mesmo padrão do avental usado pela equipe da sala de degustação, é encontrado preso numa farpa de madeira na porta da adega.', isRedHerring: false },
                { id: 'e5-c4', category: 'forensic', text: 'A perícia confirma que a borda da ferramenta de prensagem manual encontrada atrás dos barris é compatível com o formato do ferimento na nuca de Henrique.', isRedHerring: false },
            ],
        },
    ],
    usedByRoomId: null,
};

export const SHOWCASE_SOLUTION = {
    suspectId: 'camila-duarte',
    motive: 'Camila alimentava havia meses o plano silencioso de comprar a vinícola caso a venda ao grupo estrangeiro não se concretizasse — havia investido anos de trabalho e sua própria técnica de vinificação nesse futuro imaginado. Henrique planejava lhe contar, naquela mesma noite, que jamais venderia a ninguém fora da família, nem mesmo a ela.',
    meansAndOpportunity: 'Camila tinha acesso irrestrito e sem levantar suspeitas à adega subterrânea a qualquer hora da festa, além de conhecimento técnico do equipamento antigo de prensagem guardado ali. Aproveitou uma janela de cerca de 40 minutos, entre o auge do show de fogos e o retorno dos convidados à sala de degustação, período em que sua ausência da própria estação de trabalho passaria despercebida.',
    explanation: 'O testemunho de Paulo (alguém de avental saindo da adega) é ambíguo por si só — qualquer um da equipe da sala de degustação usa o mesmo avental padrão. Mas o livro de comandas fecha essa ambiguidade: mostra um intervalo de ~40 minutos sem nenhum pedido registrado na estação de Camila, exatamente a janela estimada da morte, e é justamente esse intervalo que a auxiliar da sala de degustação confirma como a "saidinha de um minutinho" de Camila. O fragmento de tecido preso na farpa da porta da adega, do mesmo padrão do avental da equipe, fisicamente amarra essa pessoa ao local. O resíduo de agente de clarificação encontrado perto do corpo não é do processo padrão da vinícola — cruzando com o histórico de Camila (que desenvolveu técnica própria e a trata como segredo profissional), a autoria fica clara. A arma do crime (ferramenta de prensagem, borda compatível com o ferimento) só faz sentido nas mãos de quem tem motivo pra estar ali sem levantar suspeita — o que também descreve Thiago, que tem acesso à adega para manutenção, e Renata, que ocasionalmente desce lá — mas os dois têm álibi fechado por terceiros para a janela exata (Thiago com o contador, Renata em fotos com horário). Por fim, a anotação no planner de Henrique ("falar sobre a proposta dela") só faz sentido cruzada com um fato já estabelecido antes: a única proposta de compra recebida nos últimos meses, fora o grupo estrangeiro, foi a de Camila — fechando o motivo. Todos os outros suspeitos têm pelo menos um dos três elementos (motivo, meio ou oportunidade) definitivamente descartado por evidência específica: Eduardo já estava no hotel (ticket + recepção), Marina estava em chamada de vídeo comprovada pela operadora, Paulo estava visivelmente no controle dos fogos, Thiago estava reunido com o contador tentando resolver o desvio de notas fiscais (culpado de fraude, não de homicídio), e Renata está coberta por fotos com horário durante toda a janela, além de já estar resignada ao divórcio há duas semanas, sem motivo novo para agir naquela noite.',
    contradictingClueIds: ['e3-c4', 'e1-c2', 'e4-c1', 'e4-c3', 'e5-c2', 'e5-c3', 'e5-c4'],
};
