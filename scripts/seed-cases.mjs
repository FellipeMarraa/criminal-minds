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

const publicCase = {
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
    clues: [
        { id: 'pista-1', order: 0, category: 'physical', text: 'A janela do escritório estava destrancada, apesar da porta trancada por dentro.', isRedHerring: false },
        { id: 'pista-2', order: 1, category: 'document', text: 'Foi encontrado um bilhete rasgado com a assinatura "D." no lixo do escritório.', isRedHerring: false },
        { id: 'pista-3', order: 2, category: 'testimony', text: 'O segurança da entrada confirma que Diana voltou à mansão 20 minutos antes do horário estimado da morte — mas ela disse que já tinha ido embora.', isRedHerring: false },
    ],
    usedByRoomId: null,
};

const solution = {
    suspectId: 'suspeito-3',
    motive: 'Vingança pela demissão injusta.',
    meansAndOpportunity: 'Diana voltou pela janela do escritório, que conhecia bem por ter trabalhado ali, evitando ser vista entrando pela porta principal.',
    explanation: 'O álibi de Diana ("já tinha ido embora") é contradito pelo segurança, que confirma seu retorno pouco antes do crime. O bilhete rasgado assinado "D." no lixo do escritório é a prova física do confronto entre ela e Arnaldo.',
    contradictingClueIds: ['pista-2', 'pista-3'],
};

async function main() {
    await db.collection('cases').doc(CASE_ID).set({
        ...publicCase,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usedAt: null,
    });
    await db.collection('case_solutions').doc(CASE_ID).set(solution);
    console.log(`✅ Caso "${CASE_ID}" gravado em cases/ e case_solutions/.`);
}

main().catch((error) => {
    console.error('❌ Erro ao gravar caso seed:', error);
    process.exit(1);
});
