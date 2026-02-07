/**
 * Firestore'daki özel kodları dışa aktarır.
 * Çalıştırma: node scripts/export-codes.js
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { db } from '../firebase.js';

async function exportCodes() {
  const snapshot = await db.collection('specialCodes').get();
  const codes = snapshot.docs.map((d) => d.data().code).sort();
  const text = codes.join('\n');
  const outPath = 'ozel-kodlar.txt';
  writeFileSync(outPath, text, 'utf8');
  console.log(`${codes.length} kod ${outPath} dosyasına kaydedildi.`);
  process.exit(0);
}

exportCodes().catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
});
