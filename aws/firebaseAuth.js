// aws/firebaseAuth.js — Firebase Admin token verification middleware
import { initializeApp, cert } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let auth = null;
let initialized = false;

function initAdmin() {
  if (initialized) return;

  let serviceAccount = null;

  // Option 1: Service account JSON provided as env var (for Render/cloud deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      console.log('[firebaseAuth] Using service account from environment variable.');
    } catch (e) {
      console.error('[firebaseAuth] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
      return;
    }
  } else {
    // Option 2: Service account JSON file path (for local development)
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './firebase-service-account.json';
    if (!fs.existsSync(keyPath)) {
      console.error('[firebaseAuth] Service account key not found:', keyPath);
      console.error('  Set FIREBASE_SERVICE_ACCOUNT_JSON env var or place firebase-service-account.json in project root.');
      return;
    }
    try {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      console.log('[firebaseAuth] Using service account from file:', keyPath);
    } catch (e) {
      console.error('[firebaseAuth] Failed to read service account file:', e.message);
      return;
    }
  }

  try {
    const app = initializeApp({ credential: cert(serviceAccount) });
    auth = getAuth(app);
    initialized = true;
    console.log('[firebaseAuth] Firebase Admin initialized successfully.');
  } catch (err) {
    console.error('[firebaseAuth] Failed to initialize Firebase Admin:', err.message);
  }
}

initAdmin();

export async function verifyToken(req, res, next) {
  if (!initialized || !auth) {
    return res.status(500).json({
      error: 'Firebase Admin not configured. Check server logs.',
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
