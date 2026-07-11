const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('/Users/threedwizard/Desktop/DPS Social/post-studio/.firebase-admin-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'post-studio-1508a.firebasestorage.app'
  });
}

const bucket = admin.storage().bucket();

async function uploadFile(filePath, destName) {
  const destination = `assets/${Date.now()}-${destName}`;
  console.log(`Uploading ${destName} to Firebase Storage...`);
  
  await bucket.upload(filePath, {
    destination: destination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });

  const file = bucket.file(destination);
  await file.makePublic();
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`;
  
  console.log(`Successfully uploaded ${destName}!`);
  console.log(`PUBLIC URL:\n${url}\n`);
}

async function main() {
  const files = [
    { path: '/Users/threedwizard/.gemini/antigravity/brain/58d63353-d692-4bd6-b7cb-cf67a2f17f0c/t11_tasty_morning_1783727515870.jpg', name: 't11_hero.jpg' },
    { path: '/Users/threedwizard/.gemini/antigravity/brain/58d63353-d692-4bd6-b7cb-cf67a2f17f0c/t12_golden_brunch_1783727523630.jpg', name: 't12_hero.jpg' },
    { path: '/Users/threedwizard/.gemini/antigravity/brain/58d63353-d692-4bd6-b7cb-cf67a2f17f0c/t13_morning_mood_1783727531358.jpg', name: 't13_hero.jpg' },
    { path: '/Users/threedwizard/.gemini/antigravity/brain/58d63353-d692-4bd6-b7cb-cf67a2f17f0c/t14_fuel_morning_1783727538748.jpg', name: 't14_hero.jpg' }
  ];

  for (const f of files) {
    if (fs.existsSync(f.path)) {
      await uploadFile(f.path, f.name);
    } else {
      console.log(`File not found: ${f.path}`);
    }
  }
}

main().catch(console.error);
