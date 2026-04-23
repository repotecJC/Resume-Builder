import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase Config
export const isConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!isConfigValid && import.meta.env.DEV) {
  const missing = [];
  if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missing.push('VITE_FIREBASE_APP_ID');

  console.error(
    `FATAL: Firebase configuration is missing: ${missing.join(', ')} \n` +
    "1. Go to Settings -> Environment Variables in AI Studio.\n" +
    "2. Add the missing keys from your Firebase Project Settings.\n" +
    "3. Restart the application."
  );
}

const app = initializeApp(firebaseConfig);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined;

// Use initializeFirestore with experimentalForceLongPolling to bypass WebSockets completely.
// This is the strongest fix for "client is offline" errors on restrictive networks.
export const db = initializeFirestore(
  app, 
  { experimentalForceLongPolling: true }, 
  databaseId
);

export const auth = getAuth(app);

// Check if Firebase is properly configured on initial boot
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error(
        "🔥🔥🔥 FIREBASE OFFLINE ERROR 🔥🔥🔥\n\n" +
        "We could not reach your Firestore Database. This usually happens for one of three reasons:\n" +
        "1. You forgot to create the Firestore Database in the Firebase Console. \n" +
        "   (Solution: Go to Firebase Console -> Firestore Database -> Click 'Create Database' -> Start in Production Mode)\n" +
        "2. Your AdBlocker (like Brave Shields or uBlock) is blocking the connection to firestore.googleapis.com. \n" +
        "   (Solution: Whitelist this site in your AdBlocker)\n" +
        "3. Your Wi-Fi or corporate network is blocking WebSockets or Google domains.\n\n" +
        "Error Details:", error.message
      );
    }
  }
}
testConnection();
