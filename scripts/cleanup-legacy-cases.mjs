// Script local, roda 1x: apaga qualquer doc em `cases/` que não tenha o
// campo `envelopes` (schema antigo, de antes da migração pra envelopes —
// tinha `clues` solto em vez disso) + seu par em `case_solutions/`. Usa a
// mesma service account JSON do seed-cases.mjs:
//
//   GOOGLE_APPLICATION_CREDENTIALS=./chave-service-account.json node scripts/cleanup-legacy-cases.mjs
//
// Depois de rodar, roda scripts/seed-cases.mjs de novo pra recriar o caso
// free no formato novo. O estoque de IA se repõe sozinho (bootstrap) na
// próxima vez que uma sala premium carregar a tela de escolher caso.

import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function main() {
    const snap = await db.collection('cases').get();
    let deleted = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        if (Array.isArray(data.envelopes)) continue; // já está no formato novo

        console.log(`🗑️  Apagando caso legado sem envelopes: ${doc.id} ("${data.title ?? 'sem título'}")`);
        const batch = db.batch();
        batch.delete(doc.ref);
        batch.delete(db.collection('case_solutions').doc(doc.id));
        await batch.commit();
        deleted++;
    }

    console.log(`✅ ${deleted} caso(s) legado(s) removido(s) de ${snap.size} total.`);
}

main().catch((error) => {
    console.error('❌ Erro ao limpar casos legados:', error);
    process.exit(1);
});
