// Script local, roda 1x: grava o caso escrito à mão (free, permanente) em
// `cases/caso-01` + `case_solutions/caso-01`. Usa a mesma service account
// JSON já gerada pra configurar DETECTIVE_FIREBASE_* no quemsoueu — aponte
// GOOGLE_APPLICATION_CREDENTIALS pra esse arquivo antes de rodar:
//
//   GOOGLE_APPLICATION_CREDENTIALS=./chave-service-account.json node scripts/seed-cases.mjs
//
// (bash: `export GOOGLE_APPLICATION_CREDENTIALS=...` antes; PowerShell:
// `$env:GOOGLE_APPLICATION_CREDENTIALS = "..."`)

import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const CASE_ID = 'caso-01';

// Caso free reescrito com a mesma régua dos premium (o rascunho antigo
// tinha exatamente o defeito que a régua proíbe: um bilhete assinado "D."
// que só bate com uma suspeita). 6 suspeitos, 6 envelopes, cada um
// descartado por evidência específica cruzada — nunca por eliminação vaga
// — e reviravolta final revelada só na solução.
const publicCase = {
    title: 'Cortina Fechada',
    premium: false,
    source: 'handwritten',
    status: 'available',
    victim: {
        name: 'Otávio Reis',
        age: 64,
        occupation: 'Diretor artístico fundador do Teatro Aurora',
        description: 'Diretor de teatro respeitado, dedicou a vida ao Teatro Aurora — na noite da comemoração de 100 anos da casa, estrearia a peça mais ambiciosa de sua carreira.',
        timeOfDeath: '19h50 (estimado)',
        location: 'Sala de figurino e adereços, nos bastidores do Teatro Aurora',
    },
    intro: `O Teatro Aurora completa 100 anos, e a montagem do espetáculo de aniversário reúne, nos bastidores, seis pessoas com motivos bem diferentes pra guardar segredo naquela noite. A produtora executiva Marcela Andrade cuida do orçamento apertado da produção — e vem desviando recursos havia meses, através de contratos fictícios de fornecedores, pra cobrir dívidas pessoais. O dramaturgo Rafael Konrad, pupilo de Otávio Reis (o diretor artístico fundador da casa), coescreveu ao lado dele a peça que estreia naquela noite, e enfrenta, dias antes da estreia, uma acusação grave de plágio que pode acabar com a carreira dele antes mesmo de começar. A atriz principal Isadora Vasconcelos, veterana da companhia, percebe Otávio favorecer abertamente uma atriz mais jovem nos ensaios recentes, e teme ser substituída depois de anos no papel. Bento Salgado, assistente de direção há 20 anos e braço direito de Otávio, acabou de saber que não será ele o escolhido pra dirigir o próximo grande espetáculo da casa. O patrono Eduardo Bittencourt, principal financiador da montagem, pressiona havia meses por mudanças na gestão criativa da casa em troca de manter o patrocínio. E a figurinista-chefe Beatriz Lemos, ex-mulher de Otávio, guarda havia décadas o ressentimento de nunca ter sido reconhecida como coautora do maior sucesso da carreira dele, escrito ao lado dele muito antes do divórcio.

A tensão mais visível, porém, é outra: a acusação de plágio contra Rafael vazou pra imprensa especializada dias atrás, e um crítico influente promete um artigo demolidor caso a peça realmente estreie sem esclarecimentos — o tipo de escândalo público que Otávio vinha tentando abafar a semana inteira, cobrando explicações de Rafael em particular mais de uma vez.

Horas antes da estreia, dois problemas menores estouraram ao mesmo tempo, bem mais discretos que a crise do plágio. Bento, checando notas fiscais pro fechamento do orçamento, descobriu contratos com fornecedores que não existiam, e avisou Otávio, sem saber ainda quem estava por trás. E um pesquisador contratado pra montar a retrospectiva de 100 anos encontrou, no acervo do teatro, rascunhos antigos que provavam a coautoria de Beatriz no maior sucesso da carreira de Otávio — achado que seria parte da exposição comemorativa naquela mesma noite. Otávio, já no limite com a crise do plágio e agora pego de surpresa por esse segundo assunto, decidiu negar tudo caso alguém perguntasse, e avisou Beatriz pessoalmente, nos bastidores, que "não tinha como reconhecer isso agora, não daquele jeito, na frente de todo mundo" — a mesma promessa quebrada mais uma vez, depois de décadas de espera. Por volta das 19h50, durante a recepção de pré-estreia no saguão, os dois ficaram sozinhos por alguns minutos na sala de figurino e adereços, combinando um registro fotográfico com o troféu de fundação do teatro pra exposição — e foi lá que Otávio foi encontrado morto, pouco antes da abertura das cortinas.`,
    timeline: [
        'Há 100 anos — o Teatro Aurora é fundado.',
        'Há 35 anos — Otávio Reis assume a direção artística e reergue a casa da falência, com Beatriz Lemos como parceira criativa.',
        'Há 20 anos — Otávio e Beatriz se divorciam; ela permanece no teatro como figurinista-chefe.',
        'Há 20 anos — Bento Salgado começa como assistente de direção, torna-se braço direito de Otávio.',
        'Há 4 anos — Rafael Konrad se torna pupilo de Otávio, começa a escrever ao lado dele.',
        'Há 1 ano — negociações de patrocínio do centenário com Eduardo Bittencourt começam.',
        'Há 8 meses — Marcela Andrade assume a produção executiva da montagem do centenário.',
        'Há 5 meses — Marcela começa a desviar recursos da produção via contratos fictícios de fornecedores.',
        'Há 6 semanas — Otávio começa a favorecer abertamente uma atriz mais jovem nos ensaios, deixando Isadora insegura.',
        'Há 3 semanas — Bento descobre que não será o escolhido pra dirigir o próximo grande espetáculo da casa.',
        'Há 10 dias — um crítico levanta suspeita pública de plágio no monólogo central da nova peça, acusando Rafael.',
        'Há 2 semanas — o pesquisador da retrospectiva encontra rascunhos antigos no acervo do teatro.',
        'Horas antes da estreia — Bento descobre as notas fiscais fictícias e avisa Otávio, sem saber de quem eram.',
        'Horas antes da estreia — o pesquisador identifica, nos rascunhos, a letra de Beatriz ao lado da de Otávio, provando a coautoria antiga.',
        'Horas antes da estreia — Otávio decide negar publicamente a coautoria de Beatriz caso perguntado.',
        '19h50 (estimado) — Otávio é morto na sala de figurino e adereços.',
    ],
    suspects: [
        {
            id: 'marcela-andrade',
            name: 'Marcela Andrade',
            age: 42,
            occupation: 'Produtora executiva do Teatro Aurora',
            relationshipToVictim: 'Subordinada direta',
            alibi: 'Diz que passou a janela toda discursando pros convidados e imprensa na recepção do saguão.',
            background: 'Responsável pelo orçamento apertado da montagem do centenário, vem desviando recursos da produção havia 5 meses através de contratos fictícios de fornecedores de cenário e figurino, tentando cobrir dívidas pessoais.',
        },
        {
            id: 'rafael-konrad',
            name: 'Rafael Konrad',
            age: 27,
            occupation: 'Dramaturgo, pupilo de Otávio',
            relationshipToVictim: 'Coautor da nova peça',
            alibi: 'Diz que passou a janela sozinho perto do camarim, nervoso demais com a estreia pra conversar com alguém.',
            background: 'Coescreveu a peça do centenário ao lado de Otávio. Nos últimos dias, um crítico levantou suspeita de que o monólogo central da peça teria sido plagiado de um manuscrito inédito de um dramaturgo já falecido, mentor de Otávio décadas atrás — uma acusação que poderia acabar com a carreira de Rafael antes mesmo de começar.',
        },
        {
            id: 'isadora-vasconcelos',
            name: 'Isadora Vasconcelos',
            age: 46,
            occupation: 'Atriz principal da companhia',
            relationshipToVictim: 'Funcionária de longa data',
            alibi: 'Diz que passou a janela toda no palco, em prova final de figurino e teste de microfone com a equipe de bastidores.',
            background: 'Veterana da companhia, vinha percebendo Otávio favorecer abertamente uma atriz mais jovem nos ensaios recentes, e temia ser substituída como protagonista da casa depois de anos no papel.',
        },
        {
            id: 'bento-salgado',
            name: 'Bento Salgado',
            age: 51,
            occupation: 'Assistente de direção',
            relationshipToVictim: 'Funcionário de longa data',
            alibi: 'Diz que passou a janela toda na cabine técnica, rodando a checklist final de som e luz com a equipe, por rádio.',
            background: 'Braço direito de Otávio há 20 anos, acabara de saber que não seria o escolhido pra dirigir o próximo grande espetáculo da casa. Como responsável pela logística de bastidores, também guarda uma das duas únicas chaves da vitrine do acervo comemorativo no saguão — a outra fica com a chefe de figurino.',
        },
        {
            id: 'eduardo-bittencourt',
            name: 'Eduardo Bittencourt',
            age: 58,
            occupation: 'Patrono e principal financiador do teatro',
            relationshipToVictim: 'Investidor',
            alibi: 'Diz que passou a janela toda circulando entre os convidados VIP na recepção do saguão.',
            background: 'Principal financiador da montagem do centenário, vinha pressionando Otávio por mudanças na gestão criativa da casa em troca de manter o patrocínio, algo que os dois discutiam havia meses sem acordo.',
        },
        {
            id: 'beatriz-lemos',
            name: 'Beatriz Lemos',
            age: 61,
            occupation: 'Figurinista-chefe do Teatro Aurora',
            relationshipToVictim: 'Ex-esposa',
            alibi: 'Diz que passou a janela toda sozinha no ateliê de figurino, fazendo os últimos ajustes de costura antes da estreia.',
            background: 'Coescreveu ao lado de Otávio, décadas atrás, o maior sucesso da carreira dele — só o nome dele foi pros créditos. Permaneceu no teatro como figurinista-chefe mesmo depois do divórcio. Como responsável pelo acervo de figurino, guarda uma das duas únicas chaves da vitrine do acervo comemorativo no saguão.',
        },
    ],
    envelopes: [
        {
            id: 'env-1',
            order: 0,
            title: 'Envelope 1: A Cena e os Primeiros Depoimentos',
            clues: [
                { id: 'e1-c1', category: 'forensic', text: 'A perícia inicial descarta a hipótese de queda acidental: o ferimento na cabeça de Otávio tem formato redondo, incompatível com o mobiliário da sala — sugere golpe com um objeto arredondado e pesado.', isRedHerring: false },
                { id: 'e1-c2', category: 'testimony', text: 'Um técnico de palco comenta que viu alguém de "crew black" (o uniforme preto padrão de toda a equipe técnica) saindo do corredor da sala de figurino em algum momento da recepção — mas como praticamente todo mundo dos bastidores usa a mesma roupa preta, não conseguiu identificar quem era.', isRedHerring: false },
                { id: 'e1-c3', category: 'document', text: 'Uma checagem preliminar do orçamento da montagem aponta contratos de fornecedores de cenário e figurino sem registro de entrega correspondente, num valor que vem crescendo nos últimos meses.', isRedHerring: false },
                { id: 'e1-c4', category: 'testimony', text: 'Marcela confirma que passou a recepção inteira discursando pros convidados e pra imprensa no saguão.', isRedHerring: false },
            ],
        },
        {
            id: 'env-2',
            order: 1,
            title: 'Envelope 2: Motivos nos Bastidores',
            clues: [
                { id: 'e2-c1', category: 'document', text: 'Um bilhete rabiscado às pressas no camarim de Otávio diz: "não tem como reconhecer isso agora, não daquele jeito, na frente de todo mundo — vou ter que negar, mais uma vez".', isRedHerring: false },
                { id: 'e2-c2', category: 'testimony', text: 'Rafael fica visivelmente na defensiva quando perguntado sobre a suspeita de plágio no monólogo central da peça, e admite que passou a recepção sozinho, sem conseguir precisar quem o viu.', isRedHerring: false },
                { id: 'e2-c3', category: 'testimony', text: 'Isadora admite temer ser substituída como protagonista da casa, mas garante que estava em prova de figurino no palco, cercada pela equipe de bastidores, durante toda a recepção.', isRedHerring: false },
                { id: 'e2-c4', category: 'physical', text: 'Uma adaga de utilería seguida de sangue falso é encontrada no chão do camarim — à primeira vista parece uma pista alarmante, mas é o próprio acessório de cena da peça, com etiqueta de utilería intacta.', isRedHerring: true },
            ],
        },
        {
            id: 'env-3',
            order: 2,
            title: 'Envelope 3: Álibis em Xeque',
            clues: [
                { id: 'e3-c1', category: 'document', text: 'A gravação oficial da transmissão da recepção mostra Marcela, visivelmente, discursando no saguão durante toda a janela em que o crime aconteceu.', isRedHerring: false },
                { id: 'e3-c2', category: 'document', text: 'O log de rádio da equipe técnica confirma Bento conduzindo a checklist final de som e luz, por rádio, durante toda a janela em que o crime aconteceu.', isRedHerring: false },
                { id: 'e3-c3', category: 'testimony', text: 'A equipe de bastidores e o monitor interno de vídeo usado nos testes técnicos confirmam Isadora em prova de figurino no palco durante toda a janela do crime.', isRedHerring: false },
                { id: 'e3-c4', category: 'document', text: 'O fotógrafo oficial do evento confirma, com fotos com horário registrado, que Eduardo aparece circulando entre convidados VIP no saguão em pelo menos seis fotos espalhadas durante toda a janela do crime.', isRedHerring: false },
                { id: 'e3-c5', category: 'document', text: 'O aplicativo de mensagens do agente de Rafael confirma, pelo registro do servidor, uma conversa contínua com Rafael sobre a acusação de plágio exatamente durante a janela do crime.', isRedHerring: false },
            ],
        },
        {
            id: 'env-4',
            order: 3,
            title: 'Envelope 4: O Segredo do Ateliê',
            clues: [
                { id: 'e4-c1', category: 'forensic', text: 'Um fragmento de linha de costura é encontrado preso à manga do paletó de Otávio — o laboratório confirma se tratar de um fio específico, de importação restrita, usado apenas no ateliê de figurino da casa.', isRedHerring: false },
                { id: 'e4-c2', category: 'document', text: 'Uma pasta de arquivo entre os pertences de Otávio contém os rascunhos antigos que provam a coautoria de Beatriz no maior sucesso da carreira dele — a mesma pasta tem, grampeado por cima, o bilhete visto antes no camarim.', isRedHerring: false },
                { id: 'e4-c3', category: 'document', text: 'A auditoria financeira completa fecha a origem dos contratos fictícios de fornecedores na conta pessoal de Marcela — mas não há qualquer registro de que Otávio tenha confrontado alguém sobre isso naquela noite.', isRedHerring: false },
                { id: 'e4-c4', category: 'testimony', text: 'Uma costureira do ateliê lembra de Beatriz ter dito que preferia terminar os ajustes finais sozinha, sem ajuda, "como sempre faz antes de uma estreia importante".', isRedHerring: false },
            ],
        },
        {
            id: 'env-5',
            order: 4,
            title: 'Envelope 5: As Últimas Peças',
            clues: [
                { id: 'e5-c1', category: 'physical', text: 'O troféu de bronze maciço da fundação do teatro, normalmente exposto na vitrine do saguão, é encontrado na sala de figurino, longe do lugar de exibição.', isRedHerring: false },
                { id: 'e5-c2', category: 'testimony', text: 'Um assistente de produção lembra que o troféu seria levado aos bastidores naquela noite pra um registro fotográfico especial da retrospectiva, reunindo Otávio e Beatriz — ideia da própria organização do evento.', isRedHerring: false },
                { id: 'e5-c3', category: 'document', text: 'O registro da vitrine mostra que ela foi destrancada pouco antes da recepção com uma das duas únicas chaves do acervo comemorativo — uma pertence à chefe de figurino, a outra ao assistente de direção.', isRedHerring: false },
                { id: 'e5-c4', category: 'forensic', text: 'A perícia confirma que o formato arredondado da base do troféu é compatível com o ferimento na cabeça de Otávio.', isRedHerring: false },
            ],
        },
        {
            id: 'env-6',
            order: 5,
            title: 'Envelope 6: Reviravoltas',
            clues: [
                { id: 'e6-c1', category: 'testimony', text: 'Confrontado, Bento admite ter sido ele quem encontrou as notas fiscais fictícias durante o fechamento do orçamento e avisou Otávio horas antes da estreia — sem saber, na época, que o desvio era de Marcela, e sem qualquer relação com o crime.', isRedHerring: false },
                { id: 'e6-c2', category: 'document', text: 'Um segundo bilhete, rascunhado e nunca enviado, é encontrado no escritório de Otávio: um comunicado pronto pra ser lido na abertura da exposição, reconhecendo publicamente Beatriz como coautora do maior sucesso de sua carreira.', isRedHerring: false },
                { id: 'e6-c3', category: 'document', text: 'A data de criação do arquivo do comunicado não enviado é de uma semana antes da descoberta dos rascunhos pelo pesquisador da retrospectiva — ou seja, Otávio já vinha planejando reconhecer Beatriz por conta própria, antes de qualquer pressão externa.', isRedHerring: false },
            ],
        },
    ],
    usedByRoomId: null,
};

const solution = {
    suspectId: 'beatriz-lemos',
    motive: 'Décadas de ressentimento por nunca ter sido reconhecida como coautora do maior sucesso da carreira de Otávio culminaram, naquela mesma noite, na notícia de que ele decidira negar tudo mais uma vez, publicamente, caso alguém perguntasse sobre os rascunhos encontrados pelo pesquisador da retrospectiva.',
    meansAndOpportunity: 'Como responsável pelo acervo de figurino, Beatriz tinha uma das duas únicas chaves da vitrine do acervo comemorativo, e ficou a sós com Otávio na sala de figurino durante os poucos minutos combinados pra um registro fotográfico com o troféu de fundação — justamente o objeto que se tornaria a arma do crime.',
    explanation: 'O testemunho do técnico de palco (alguém de "crew black" saindo do corredor) é ambíguo por si só — praticamente toda a equipe de bastidores usa o mesmo uniforme preto. Mas a chave usada pra destrancar a vitrine do troféu pertence a só duas pessoas: a chefe de figurino (Beatriz) ou o assistente de direção (Bento) — e Bento está confirmado por rádio na cabine técnica durante toda a janela do crime, isolando Beatriz. O fragmento de linha de costura de importação restrita, preso ao paletó de Otávio, também aponta especificamente pro ateliê dela. O motivo se fecha cruzando duas pistas que sozinhas pareciam apenas plausíveis: o bilhete no camarim ("vou ter que negar, mais uma vez") ganha nome exato ao ser encontrado grampeado à pasta com os rascunhos que provam a coautoria de Beatriz — fechando que era ela, e não a acusação de plágio de Rafael nem o desvio financeiro de Marcela, o assunto que Otávio pretendia enterrar. Todos os outros suspeitos têm o motivo, os meios ou a oportunidade descartados por evidência específica: Marcela está confirmada discursando no saguão pela transmissão oficial (e sua fraude, embora real, nunca foi confrontada por Otávio naquela noite — motivo sem gatilho), Bento está confirmado por rádio na cabine técnica, Isadora está confirmada pela equipe de bastidores e pelo monitor interno, Eduardo está confirmado por fotos com horário durante toda a janela, e Rafael tem uma conversa contínua por aplicativo de mensagens, com registro de servidor, cobrindo exatamente a janela do crime. A reviravolta final é amarga: um comunicado nunca enviado, escrito por Otávio uma semana antes mesmo de o pesquisador encontrar os rascunhos, mostra que ele já planejava reconhecer Beatriz como coautora por conta própria — um gesto genuíno que ele perdeu a coragem de cumprir bem na hora em que mais importava. Beatriz o matou por uma promessa que, sem que ela soubesse, ele já tinha decidido cumprir. E o aviso sobre os contratos fictícios que chegou a Otávio horas antes da estreia, aliás, não tinha nada a ver com a coautoria: partiu de Bento, o assistente de direção, que só queria proteger o orçamento da montagem e nunca imaginou que aquela mesma noite terminaria em uma morte.',
    contradictingClueIds: ['e5-c3', 'e3-c2', 'e4-c1', 'e4-c2', 'e5-c1', 'e5-c4', 'e6-c2', 'e6-c3'],
};

// ---------------------------------------------------------------------
// Caso premium escrito à mão: "O Silêncio da Vinícola Boa Esperança"
// ---------------------------------------------------------------------
// Feito manualmente (não gerado por IA) como referência de qualidade —
// analisei 3 casos comerciais de exemplo antes de escrever este, e o
// padrão mais comum de falha neles é a solução ser "vibe" (eliminação +
// motivo genérico, tipo "ciúme é motivo clássico") sem prova real
// convergindo. Aqui a culpada (Camila) é fechada por 4 fios de evidência
// independentes que se cruzam (lacuna de horário + resíduo forense +
// testemunha + anotação da própria vítima), e TODO suspeito alheio é
// descartado por um fato específico e verificável (álibi confirmado por
// documento/testemunha), nunca por "não sobrou mais ninguém".
const SHOWCASE_CASE_ID = 'caso-02-vinicola';

const showcasePublicCase = {
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

const showcaseSolution = {
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
const SECOND_CASE_ID = 'caso-03-instituto';

const secondCase = {
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

const secondSolution = {
    suspectId: 'diego-fontoura',
    motive: 'Diego vinha desviando recursos do instituto havia meses, tentando cobrir dívidas de jogo, através de uma conta pessoal de investimentos. Horas antes da festa, Ricardo recebeu planilhas anônimas que ele inicialmente interpretou como sendo sobre fraude nos dados científicos do ALV-12 — mas cruzando o extrato financeiro grampeado ao mesmo bilhete, os números que não fechavam eram os da própria diretoria financeira. Diego percebeu que seria descoberto e exposto ainda naquela noite.',
    meansAndOpportunity: 'Como diretor financeiro também responsável pela área de facilities, Diego possuía um dos dois únicos códigos-mestre de emergência que davam acesso à ala restrita fora do horário normal — o mesmo usado pra destravar a porta do Laboratório 4 no horário do crime. Usou o pretexto de "resolver um problema no sistema de som" pra se ausentar do saguão sem levantar suspeita, encontrando Ricardo sozinho no laboratório.',
    explanation: 'O testemunho do segurança (alguém de jaleco branco saindo do corredor) é ambíguo por si só — toda a equipe usava o mesmo jaleco temático naquela noite. Mas o código-mestre usado pra destravar a porta pertence a só duas pessoas: a diretoria financeira (Diego) ou o gerente de laboratório (Marcos) — e Marcos está visivelmente na cabine de som durante toda a janela do crime, gravado ao vivo. Isso isola Diego. Seu álibi ("resolvendo o sistema de som") é diretamente contradito pela própria equipe técnica de som, que não recebeu nenhum chamado a noite inteira — e seu extrato telefônico mostra uma ligação feita justamente da torre mais próxima da ala restrita, não do saguão onde ele diz ter passado o tempo. A arma do crime — uma tocha comemorativa de metal maciço — só foi distribuída à diretoria executiva, o que aponta pra Diego ou Valentina; mas Valentina está coberta por sete fotos com horário cobrindo toda a janela, isolando Diego de novo. O motivo se fecha cruzando duas pistas que sozinhas pareciam apontar pra outro lugar: a anotação de Ricardo "os números não fecham" soa, à primeira vista, como se fosse sobre os dados científicos manipulados de Patrícia — mas o planner mostra essa mesma frase grampeada a um extrato financeiro, não a uma planilha de laboratório, fechando que "os números" eram os da fraude financeira de Diego, confirmada pela divergência orçamentária encontrada logo na cena do crime. Patrícia, aliás, está limpa: apesar do acesso de rotina à ala restrita levantar suspeita inicial, um vídeo a mostra respondendo perguntas junto ao pôster científico às 22h15, dentro da janela exata do crime. A reviravolta final é amarga: uma segunda página rasgada do planner de Ricardo revela que ele pretendia resolver a situação financeira "em família, sem denúncia formal" — ou seja, ia proteger Diego, não expô-lo publicamente, reservando a denúncia formal só pra fraude científica de Patrícia. Diego matou o tio por um medo que, sem que ele soubesse, não ia se concretizar daquele jeito. E a fonte das planilhas anônimas que desencadeou tudo, aliás, era outra reviravolta: a perícia grafotécnica aponta Marcos — o funcionário leal preterido como coautor da patente — como autor do bilhete, querendo expor a fraude científica de Patrícia sem imaginar que aquilo custaria a vida do homem a quem era leal.',
    contradictingClueIds: ['e4-c2', 'e3-c2', 'e5-c1', 'e5-c2', 'e5-c4', 'e3-c4', 'e4-c3', 'e1-c3', 'e4-c4', 'e6-c1', 'e6-c2'],
};

async function main() {
    await db.collection('cases').doc(CASE_ID).set({
        ...publicCase,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usedAt: null,
    });
    await db.collection('case_solutions').doc(CASE_ID).set(solution);
    console.log(`✅ Caso "${CASE_ID}" gravado em cases/ e case_solutions/.`);

    await db.collection('cases').doc(SHOWCASE_CASE_ID).set({
        ...showcasePublicCase,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usedAt: null,
    });
    await db.collection('case_solutions').doc(SHOWCASE_CASE_ID).set(showcaseSolution);
    console.log(`✅ Caso "${SHOWCASE_CASE_ID}" gravado em cases/ e case_solutions/.`);

    await db.collection('cases').doc(SECOND_CASE_ID).set({
        ...secondCase,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usedAt: null,
    });
    await db.collection('case_solutions').doc(SECOND_CASE_ID).set(secondSolution);
    console.log(`✅ Caso "${SECOND_CASE_ID}" gravado em cases/ e case_solutions/.`);
}

main().catch((error) => {
    console.error('❌ Erro ao gravar caso seed:', error);
    process.exit(1);
});
