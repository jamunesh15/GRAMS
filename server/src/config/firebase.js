const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// You need to download your service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key

try {
  // Try to use environment variable first (for production/Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // Fall back to service account key file (for local development)
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.error('Please ensure your serviceAccountKey.json is in the correct location');
  console.error('Or set FIREBASE_SERVICE_ACCOUNT environment variable');
}

// Export auth instance
module.exports = admin;
