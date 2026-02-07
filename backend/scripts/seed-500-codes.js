/**
 * 500 adet rastgele özel kod oluşturup Firestore'a ekler.
 * Her kod sadece 1 kayıt için kullanılabilir (mevcut sistem zaten böyle çalışıyor).
 *
 * Çalıştırma: node scripts/seed-500-codes.js
 * Gereksinim: .env ve serviceAccountKey.json ayarlı olmalı
 */
import 'dotenv/config';
import { db } from '../firebase.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karışıklık için 0,O,1,I hariç
const PREFIX = 'SG';
const CODE_LENGTH = 8; // SG-XXXX-XXXX = 8 karakter

function randomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (i === 4) code += '-';
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `${PREFIX}-${code}`;
}

async function seed500() {
  const batchSize = 500;
  const codes = new Set();

  while (codes.size < batchSize) {
    codes.add(randomCode());
  }

  const codesArr = [...codes];
  const firestoreBatch = db.batch();
  const now = new Date().toISOString();

  for (const code of codesArr) {
    const ref = db.collection('specialCodes').doc();
    firestoreBatch.set(ref, {
      code,
      used: false,
      createdAt: now,
    });
  }

  await firestoreBatch.commit();
  console.log(`${batchSize} özel kod eklendi.`);
  console.log('İlk 5 örnek:', codesArr.slice(0, 5).join(', '));
  process.exit(0);
}

seed500().catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
});
