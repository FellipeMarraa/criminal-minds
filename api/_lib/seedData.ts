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

// ---------------------------------------------------------------------
// 2º caso premium escrito à mão: "A Véspera do Anúncio"
// ---------------------------------------------------------------------
// Mesma régua de qualidade da vinícola: cada suspeito é descartado por
// evidência específica cruzada (nunca por "não sobrou mais ninguém"),
// pistas ambíguas (jaleco de todo mundo, código-mestre de 2 pessoas,
// bilhete sem nome) só fecham depois de cruzadas com outra pista. Além
// disso: 2 reviravoltas — quem denunciou a fraude anonimamente (não é
// quem parece) e uma ironia final revelada só na solução.
export const SECOND_CASE_ID = 'caso-03-instituto';

export const SECOND_CASE = {
    title: 'A Véspera do Anúncio',
    premium: true,
    source: 'handwritten',
    status: 'available',
    victim: {
        name: 'Dr. Ricardo Almeida',
        age: 61,
        occupation: 'Diretor-fundador do Instituto Almeida de Pesquisas Biomédicas',
        description: 'Cientista respeitado internacionalmente, dedicou 25 anos a construir o instituto que leva seu sobrenome — durão em decisões institucionais, mas de uma lealdade quase cega à própria família.',
        timeOfDeath: '22h20 (estimado)',
        location: 'Laboratório 4, ala restrita do instituto',
    },
    intro: `O Instituto Almeida de Pesquisas Biomédicas nasceu há 25 anos, quando o jovem pesquisador Ricardo Almeida apostou a própria carreira acadêmica pra abrir um laboratório independente, bancado a duras penas com bolsas e economias pessoais. Passou duas décadas e meia construindo um dos centros de pesquisa mais respeitados do país — e, nos últimos cinco anos, o projeto que coroaria seu legado: o Composto ALV-12, uma molécula promissora contra uma doença neurodegenerativa rara.

Na noite da festa de 25 anos do instituto — um evento de gala pra doadores, parceiros e imprensa especializada, com jaleco branco por cima do traje social como uniforme temático de toda a equipe — Ricardo planejava anunciar publicamente, na manhã seguinte, o fechamento de um acordo de licenciamento multimilionário do ALV-12 com a Vantex Biopharma, uma das maiores farmacêuticas do mundo.

Horas antes da festa, porém, Ricardo recebeu de uma fonte anônima um conjunto de planilhas apontando inconsistências graves nos dados do estudo pré-clínico do ALV-12 — dados que ele mesmo assinara como responsável científico. Cruzando os números originais com os que constavam no relatório final enviado à Vantex, percebeu que alguém da equipe havia manipulado resultados-chave pra fazer o composto parecer mais eficaz e mais seguro do que realmente era. Se o acordo fechasse daquele jeito e a fraude viesse à tona depois, seria o fim do instituto — processos, talvez prisão. Ricardo decidiu ali mesmo suspender o anúncio da manhã seguinte até apurar quem estava por trás, e avisou a assistente que precisava "resolver uma coisa grave" ainda durante a festa. Por volta das 22h20, desceu sozinho ao Laboratório 4, na ala restrita, onde ficavam os dados originais do estudo — e não voltou. Foi encontrado horas depois por um segurança fazendo a ronda, caído entre as bancadas, com um ferimento na cabeça que a perícia descartou rapidamente como sendo de uma queda acidental.`,
    timeline: [
        'Há 25 anos — Ricardo funda o Instituto Almeida com bolsas de pesquisa e economias pessoais.',
        'Há 8 anos — Ricardo se casa com Valentina, hoje diretora de relações institucionais do instituto.',
        'Há 5 anos — início do projeto Composto ALV-12, liderado pela equipe mais próxima de Ricardo.',
        'Há 3 anos — Dra. Patrícia Sato é contratada como pós-doutoranda, assume os ensaios pré-clínicos do ALV-12.',
        'Há 2 anos — Diego Fontoura, sobrinho de Ricardo, assume a diretoria financeira, com acesso a orçamento e sistemas de segurança predial.',
        'Há 1 ano — negociações sigilosas de licenciamento do ALV-12 com a Vantex Biopharma começam.',
        'Há 8 meses — Diego passa a desviar recursos do instituto por uma conta pessoal de investimentos, tentando cobrir dívidas de jogo.',
        'Há 4 meses — Prof. Anderson Vilela, diretor do Instituto Bragança (rival), propõe uma "parceria científica" que Ricardo interpreta como tentativa disfarçada de absorver o projeto ALV-12.',
        'Há 6 semanas — Luíza Almeida, filha de Ricardo, descobre que não será a sucessora natural na direção e passa a questionar abertamente os termos do acordo com a Vantex.',
        'Há 3 semanas — Marcos Tavares, gerente de laboratório há 20 anos, descobre que não será coautor de uma patente-chave do ALV-12, apesar de ter desenvolvido uma técnica essencial usada no processo.',
        'Horas antes da festa — Ricardo recebe planilhas anônimas apontando manipulação nos dados pré-clínicos do ALV-12.',
        'Na noite da festa — Ricardo decide suspender o anúncio do acordo até investigar a fraude.',
        '22h20 (estimado) — Ricardo é morto no Laboratório 4.',
    ],
    suspects: [
        {
            id: 'valentina-almeida',
            name: 'Valentina Almeida',
            age: 47,
            occupation: 'Diretora de relações institucionais do instituto',
            relationshipToVictim: 'Esposa',
            alibi: 'Diz que passou a noite inteira circulando entre os doadores no saguão principal, ao lado da equipe de fotografia oficial do evento.',
            background: 'Casada com Ricardo há 8 anos, Valentina é o rosto público do instituto nos eventos de captação. Soube recentemente que Ricardo vinha revisando o testamento pra transferir o controle do instituto e das patentes a uma fundação sem fins lucrativos em vez de deixá-lo à família — algo que discutiram uma única vez, sem chegar a um acordo. Como parte da diretoria executiva, recebeu como todo o alto escalão uma tocha comemorativa de metal maciço, item decorativo da festa de aniversário.',
        },
        {
            id: 'luiza-almeida',
            name: 'Luíza Almeida',
            age: 33,
            occupation: 'Pesquisadora sênior do instituto',
            relationshipToVictim: 'Filha (do primeiro casamento)',
            alibi: 'Diz que passou a noite se preparando e depois discursando no palco principal, no brinde de aniversário do instituto.',
            background: 'Cientista de carreira dentro do próprio instituto, sempre presumiu que sucederia o pai na direção. Descobriu há 6 semanas que Ricardo vinha preparando um sucessor externo, e desde então se opõe abertamente aos termos do acordo com a Vantex, que considera entregar o controle científico do instituto a interesses comerciais.',
        },
        {
            id: 'diego-fontoura',
            name: 'Diego Fontoura',
            age: 38,
            occupation: 'Diretor financeiro do instituto',
            relationshipToVictim: 'Sobrinho',
            alibi: 'Diz que passou boa parte da noite resolvendo um problema no sistema de som do saguão principal.',
            background: 'Filho da irmã mais nova de Ricardo, assumiu a diretoria financeira há 2 anos, com acesso amplo a orçamento, contratos e também aos sistemas de segurança predial, por supervisionar a área de facilities. Vem enfrentando dívidas de jogo que tenta esconder da família. Como parte da diretoria executiva, recebeu como todo o alto escalão uma tocha comemorativa de metal maciço.',
        },
        {
            id: 'patricia-sato',
            name: 'Dra. Patrícia Sato',
            age: 31,
            occupation: 'Pesquisadora pós-doutoranda',
            relationshipToVictim: 'Subordinada direta',
            alibi: 'Diz que passou a maior parte da noite conduzindo uma sessão de perguntas e respostas sobre o ALV-12 pra doadores, perto do pôster científico no saguão.',
            background: 'Contratada há 3 anos, é responsável pelos ensaios pré-clínicos do Composto ALV-12 — o estudo que sustenta o acordo com a Vantex. Sua permanência no país depende de um visto de pesquisa vinculado ao instituto, e tem acesso de rotina à ala restrita pra consultar os dados originais.',
        },
        {
            id: 'anderson-vilela',
            name: 'Prof. Anderson Vilela',
            age: 55,
            occupation: 'Diretor do Instituto Bragança (instituto rival)',
            relationshipToVictim: 'Concorrente profissional',
            alibi: 'Diz que foi embora da festa por volta das 22h, direto pro estacionamento, sem passar pela ala restrita.',
            background: 'Diretor de um centro de pesquisa concorrente, propôs meses atrás uma "parceria científica" que Ricardo via como tentativa disfarçada de absorver o projeto ALV-12 caso o acordo com a Vantex desandasse.',
        },
        {
            id: 'marcos-tavares',
            name: 'Marcos Tavares',
            age: 52,
            occupation: 'Gerente de laboratório',
            relationshipToVictim: 'Funcionário de longa data',
            alibi: 'Diz que passou a noite toda na cabine de som e luz, operando a transmissão ao vivo da festa pro telão do saguão.',
            background: 'Funcionário do instituto há 20 anos, extremamente leal a Ricardo. Recentemente descobriu que não seria incluído como coautor de uma patente-chave do ALV-12, apesar de ter desenvolvido uma técnica de purificação essencial usada no processo. Detém, junto com a diretoria financeira, um dos dois únicos códigos-mestre de emergência que destravam a ala restrita fora do horário normal.',
        },
    ],
    envelopes: [
        {
            id: 'env-1',
            order: 0,
            title: 'Envelope 1: A Cena e os Primeiros Depoimentos',
            clues: [
                { id: 'e1-c1', category: 'forensic', text: 'A perícia inicial descarta a hipótese de queda acidental: o ferimento na cabeça de Ricardo tem formato circular, incompatível com bancada ou piso — sugere golpe com objeto cilíndrico e pesado.', isRedHerring: false },
                { id: 'e1-c2', category: 'testimony', text: 'Um segurança da ala restrita comenta que viu alguém saindo do corredor do Laboratório 4 em algum momento da noite, vestindo o jaleco branco por cima do traje de gala — mas como toda a equipe usava o mesmo jaleco naquela noite, não conseguiu identificar quem era.', isRedHerring: false },
                { id: 'e1-c3', category: 'document', text: 'Uma auditoria interna, ainda incompleta, aponta divergências entre o orçamento aprovado do instituto e o saldo real de uma conta de investimentos vinculada à diretoria financeira, num valor crescente nos últimos meses.', isRedHerring: false },
                { id: 'e1-c4', category: 'testimony', text: 'Valentina confirma que passou a noite circulando entre os doadores no saguão principal, ao lado da equipe de fotografia oficial do evento.', isRedHerring: false },
            ],
        },
        {
            id: 'env-2',
            order: 1,
            title: 'Envelope 2: Motivos à Mesa',
            clues: [
                { id: 'e2-c1', category: 'document', text: 'Uma pasta na maleta de Ricardo contém as planilhas anônimas com os dados pré-clínicos do ALV-12, e uma anotação recente à mão na margem: "os números não fecham — vou ter que confrontar isso ainda hoje, antes que seja tarde demais".', isRedHerring: false },
                { id: 'e2-c2', category: 'testimony', text: 'Luíza admite discordar abertamente dos termos do acordo com a Vantex, mas fica visivelmente incomodada quando perguntada sobre a sucessão da direção do instituto.', isRedHerring: false },
                { id: 'e2-c3', category: 'testimony', text: 'Patrícia confirma que era responsável pelos ensaios pré-clínicos do ALV-12 e afirma, nervosa, que "os dados sempre foram revisados por mais de uma pessoa antes de ir pro relatório final".', isRedHerring: false },
                { id: 'e2-c4', category: 'physical', text: 'Uma carta antiga e ameaçadora, sem assinatura, é encontrada no arquivo pessoal de Ricardo — mas a data é de mais de dez anos atrás, ligada a uma polêmica científica já esquecida sobre um artigo retratado.', isRedHerring: true },
            ],
        },
        {
            id: 'env-3',
            order: 2,
            title: 'Envelope 3: Álibis em Xeque',
            clues: [
                { id: 'e3-c1', category: 'document', text: 'O registro da portaria confirma que Anderson Vilela deixou o prédio às 22h05, com o ticket do manobrista batendo exatamente com esse horário — compatível com ter saído bem antes da hora estimada da morte.', isRedHerring: false },
                { id: 'e3-c2', category: 'document', text: 'A gravação oficial da transmissão ao vivo da festa mostra Marcos, visivelmente, na cabine de som e luz operando os controles durante toda a janela em que o crime aconteceu.', isRedHerring: false },
                { id: 'e3-c3', category: 'testimony', text: 'Dezenas de convidados e a gravação do palco confirmam Luíza discursando no brinde de aniversário exatamente na janela em que o crime aconteceu.', isRedHerring: false },
                { id: 'e3-c4', category: 'document', text: 'A equipe de fotografia oficial confirma, com fotos com horário registrado, que Valentina aparece cumprimentando doadores no saguão em pelo menos sete fotos espalhadas entre 21h50 e 22h40, cobrindo toda a janela em que o crime pode ter acontecido.', isRedHerring: false },
                { id: 'e3-c5', category: 'testimony', text: 'Um funcionário da produção do evento lembra de ter visto Patrícia respondendo perguntas de doadores perto do pôster científico durante boa parte da noite, mas não soube precisar os horários exatos.', isRedHerring: false },
            ],
        },
        {
            id: 'env-4',
            order: 3,
            title: 'Envelope 4: O Segredo do Laboratório',
            clues: [
                { id: 'e4-c1', category: 'forensic', text: 'Um resíduo de um reagente incomum é encontrado próximo ao corpo — o laboratório confirma que esse composto específico não faz parte do protocolo padrão do ALV-12, mas de uma técnica de mascaramento de resultados que não consta em nenhum manual oficial do instituto.', isRedHerring: false },
                { id: 'e4-c2', category: 'document', text: 'O sistema de controle de acesso mostra que a porta da ala restrita foi destravada, no horário do crime, usando um dos dois únicos códigos-mestre de emergência do instituto — um pertence à diretoria financeira, o outro ao gerente de laboratório.', isRedHerring: false },
                { id: 'e4-c3', category: 'document', text: 'O planner pessoal de Ricardo, recuperado de seu escritório, tem uma anotação idêntica à vista na pasta de planilhas — "confrontar sobre os números ainda hoje" — mas ao lado, grampeado, está um extrato financeiro impresso, não uma planilha de dados de laboratório.', isRedHerring: false },
                { id: 'e4-c4', category: 'testimony', text: 'Uma sessão de perguntas e respostas registrada em vídeo pelos organizadores mostra Patrícia respondendo perguntas junto ao pôster científico às 22h15 — dentro da janela estimada do crime.', isRedHerring: false },
            ],
        },
        {
            id: 'env-5',
            order: 4,
            title: 'Envelope 5: As Últimas Peças',
            clues: [
                { id: 'e5-c1', category: 'document', text: 'O extrato telefônico de Diego mostra uma ligação de 12 minutos pra um número não identificado, sem relação com o sistema de som do instituto, entre 22h e 22h15 — registrada pela torre de celular mais próxima da ala restrita, não do saguão principal.', isRedHerring: false },
                { id: 'e5-c2', category: 'testimony', text: 'A equipe técnica de som confirma que não recebeu nenhum chamado de manutenção durante a festa, e que o sistema de áudio funcionou sem interrupções a noite inteira.', isRedHerring: false },
                { id: 'e5-c3', category: 'physical', text: 'Um pequeno fragmento de tecido do forro interno de um paletó social, de um padrão incomum entre os convidados, é encontrado preso numa dobradiça solta da porta do Laboratório 4.', isRedHerring: false },
                { id: 'e5-c4', category: 'forensic', text: 'A perícia confirma que o formato do ferimento na cabeça de Ricardo é compatível com uma tocha comemorativa de metal maciço — item decorativo distribuído apenas à diretoria executiva do instituto naquela noite.', isRedHerring: false },
            ],
        },
        {
            id: 'env-6',
            order: 5,
            title: 'Envelope 6: Reviravoltas',
            clues: [
                { id: 'e6-c1', category: 'document', text: 'Uma segunda página do planner de Ricardo, arrancada e amassada na lixeira do escritório, traz uma frase incompleta: "quanto à situação do financeiro, prefiro resolver em família, sem denúncia formal — vou conversar em particular depois do anúncio".', isRedHerring: false },
                { id: 'e6-c2', category: 'document', text: 'Um perito grafotécnico compara a letra da anotação anônima que chegou até Ricardo com amostras do próprio punho de toda a equipe do instituto — o resultado aponta correspondência com a caligrafia de Marcos Tavares.', isRedHerring: false },
                { id: 'e6-c3', category: 'testimony', text: 'Confrontado, Marcos admite ter sido ele quem enviou as planilhas anônimas a Ricardo — queria que a fraude nos dados do ALV-12 viesse à tona depois de descobrir que não seria reconhecido como coautor da patente, mas jura que não sabia de nada sobre desvio financeiro nem imaginou que aquilo levaria a uma morte.', isRedHerring: false },
            ],
        },
    ],
    usedByRoomId: null,
};

export const SECOND_SOLUTION = {
    suspectId: 'diego-fontoura',
    motive: 'Diego vinha desviando recursos do instituto havia meses, tentando cobrir dívidas de jogo, através de uma conta pessoal de investimentos. Horas antes da festa, Ricardo recebeu planilhas anônimas que ele inicialmente interpretou como sendo sobre fraude nos dados científicos do ALV-12 — mas cruzando o extrato financeiro grampeado ao mesmo bilhete, os números que não fechavam eram os da própria diretoria financeira. Diego percebeu que seria descoberto e exposto ainda naquela noite.',
    meansAndOpportunity: 'Como diretor financeiro também responsável pela área de facilities, Diego possuía um dos dois únicos códigos-mestre de emergência que davam acesso à ala restrita fora do horário normal — o mesmo usado pra destravar a porta do Laboratório 4 no horário do crime. Usou o pretexto de "resolver um problema no sistema de som" pra se ausentar do saguão sem levantar suspeita, encontrando Ricardo sozinho no laboratório.',
    explanation: 'O testemunho do segurança (alguém de jaleco branco saindo do corredor) é ambíguo por si só — toda a equipe usava o mesmo jaleco temático naquela noite. Mas o código-mestre usado pra destravar a porta pertence a só duas pessoas: a diretoria financeira (Diego) ou o gerente de laboratório (Marcos) — e Marcos está visivelmente na cabine de som durante toda a janela do crime, gravado ao vivo. Isso isola Diego. Seu álibi ("resolvendo o sistema de som") é diretamente contradito pela própria equipe técnica de som, que não recebeu nenhum chamado a noite inteira — e seu extrato telefônico mostra uma ligação feita justamente da torre mais próxima da ala restrita, não do saguão onde ele diz ter passado o tempo. A arma do crime — uma tocha comemorativa de metal maciço — só foi distribuída à diretoria executiva, o que aponta pra Diego ou Valentina; mas Valentina está coberta por sete fotos com horário cobrindo toda a janela, isolando Diego de novo. O motivo se fecha cruzando duas pistas que sozinhas pareciam apontar pra outro lugar: a anotação de Ricardo "os números não fecham" soa, à primeira vista, como se fosse sobre os dados científicos manipulados de Patrícia — mas o planner mostra essa mesma frase grampeada a um extrato financeiro, não a uma planilha de laboratório, fechando que "os números" eram os da fraude financeira de Diego, confirmada pela divergência orçamentária encontrada logo na cena do crime. Patrícia, aliás, está limpa: apesar do acesso de rotina à ala restrita levantar suspeita inicial, um vídeo a mostra respondendo perguntas junto ao pôster científico às 22h15, dentro da janela exata do crime. A reviravolta final é amarga: uma segunda página rasgada do planner de Ricardo revela que ele pretendia resolver a situação financeira "em família, sem denúncia formal" — ou seja, ia proteger Diego, não expô-lo publicamente, reservando a denúncia formal só pra fraude científica de Patrícia. Diego matou o tio por um medo que, sem que ele soubesse, não ia se concretizar daquele jeito. E a fonte das planilhas anônimas que desencadeou tudo, aliás, era outra reviravolta: a perícia grafotécnica aponta Marcos — o funcionário leal preterido como coautor da patente — como autor do bilhete, querendo expor a fraude científica de Patrícia sem imaginar que aquilo custaria a vida do homem a quem era leal.',
    contradictingClueIds: ['e4-c2', 'e3-c2', 'e5-c1', 'e5-c2', 'e5-c4', 'e3-c4', 'e4-c3', 'e1-c3', 'e4-c4', 'e6-c1', 'e6-c2'],
};
