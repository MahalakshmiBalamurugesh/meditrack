// ─────────────────────────────────────────────────────────────────
//  FIREBASE CONFIGURATION
//  Replace every placeholder value below with YOUR Firebase project
//  credentials.  Follow the setup guide in README-FIREBASE.md.
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? 'REPLACE_ME',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? 'REPLACE_ME',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? 'REPLACE_ME',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? 'REPLACE_ME',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'REPLACE_ME',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? 'REPLACE_ME',
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
