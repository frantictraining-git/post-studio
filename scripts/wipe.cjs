const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('/Users/threedwizard/Desktop/DPS Social/Web App/post-studio/.firebase-admin-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function clearProjects() {
  const snapshot = await db.collection('projects').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    count++;
  }
  console.log(`Deleted ${count} projects successfully.`);
  process.exit(0);
}

clearProjects().catch(console.error);
