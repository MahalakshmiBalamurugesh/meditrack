// aws/firebaseAuth.js — Firebase Admin token verification middleware
// Verifies the Firebase ID token sent from the frontend and extracts the UID.
//
// Uses ES module named imports (firebase-admin v12+ ESM pattern):
//   import { initializeApp, cert } from 'firebase-admin'
//   import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let auth = null;
let initialized = false;

function initAdmin() {
  if (initialized) return;

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './firebase-service-account.json';

  if (!fs.existsSync(keyPath)) {
    console.error('[firebaseAuth] Service account key not found: ' + keyPath);
    console.error('  Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key');
    console.error('  Save as firebase-service-account.json in the project root');
    return;
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    auth = getAuth(app);
    initialized = true;
    console.log('[firebaseAuth] Firebase Admin initialized successfully.');
  } catch (err) {
    console.error('[firebaseAuth] Failed to initialize Firebase Admin:', err.message);
    // Do not crash — the server still runs, but token verification will fail gracefully.
  }
}

// Initialize immediately at module load so status is visible at startup.
initAdmin();

/**
 * Express middleware: verifies the Firebase ID token from the
 * Authorization header and attaches `req.uid` on success.
 */
export async function verifyToken(req, res, next) {
  if (!initialized || !auth) {
    return res.status(500).json({
      error: 'Firebase Admin not configured. Check server logs for setup instructions.',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.email = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
