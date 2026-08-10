const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./.firebase-admin-key.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'post-studio-1508a.firebasestorage.app'
});

async function configureCors() {
  const bucket = getStorage().bucket();
  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET', 'HEAD', 'OPTIONS'],
      maxAgeSeconds: 3600
    }
  ];

  await bucket.setCorsConfiguration(corsConfiguration);
  console.log("CORS configuration successfully updated on the bucket!");
}

configureCors().catch(console.error);
