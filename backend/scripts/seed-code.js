/**
 * Örnek özel kod eklemek için:
 * 1. Backend .env ve serviceAccountKey.json ayarlı olmalı
 * 2. Çalıştırma: node scripts/seed-code.js [KOD]
 * Örnek: node scripts/seed-code.js WELCOME-2024
 */
import 'dotenv/config';
import { db } from '../firebase.js';

const code = process.argv[2] || 'TEST-CODE-123';

async function seed() {
  const existing = await db.collection('specialCodes').where('code', '==', code).limit(1).get();
  if (!existing.empty) {
    console.log('Bu kod zaten mevcut:', code);
    process.exit(0);
    return;
  }
  await db.collection('specialCodes').add({
    code,
    used: false,
    createdAt: new Date().toISOString(),
  });
  console.log('Özel kod eklendi:', code);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
