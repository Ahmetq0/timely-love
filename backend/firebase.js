import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore();

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (keyPath && existsSync(path.resolve(__dirname, keyPath))) {
    const serviceAccount = JSON.parse(
      readFileSync(path.resolve(__dirname, keyPath), 'utf8')
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (keyJson) {
    const serviceAccount = JSON.parse(keyJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    throw new Error(
      'Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env'
    );
  }

  return admin.firestore();
}

export const db = initFirebase();
