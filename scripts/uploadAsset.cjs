const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with the service account
const serviceAccount = require('../.firebase-admin-key.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "post-studio-1508a.firebasestorage.app"
});

const bucket = getStorage().bucket();

async function uploadFile(filePath) {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File does not exist at ${absolutePath}`);
    process.exit(1);
  }

  const fileName = path.basename(absolutePath);
  const destination = `assets/${Date.now()}-${fileName}`;

  try {
    console.log(`Uploading ${fileName} to Firebase Storage...`);
    
    // Upload the file
    await bucket.upload(absolutePath, {
      destination: destination,
      public: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    console.log(`Successfully uploaded ${fileName}!`);
    
    // Get the public URL. Since it's public and we are using firebase storage, 
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`;
    
    console.log(`\nPUBLIC URL:`);
    console.log(publicUrl);
    
    process.exit(0);
  } catch (error) {
    console.error("Error uploading file:", error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log("Usage: node uploadAsset.cjs <path-to-file>");
  process.exit(1);
}

uploadFile(filePath);
