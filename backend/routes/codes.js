import { db } from '../firebase.js';

const CODES = 'specialCodes';

export async function validateCode(req, res) {
  try {
    const { code } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ valid: false, message: 'Code is required.' });
    }

    const snap = await db.collection(CODES).where('code', '==', code.trim()).limit(1).get();
    if (snap.empty) {
      return res.json({ valid: false, message: 'Invalid code.' });
    }

    const data = snap.docs[0].data();
    if (data.used) {
      return res.json({ valid: false, message: 'This code has already been used.' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('Validate code error:', err);
    res.status(500).json({ valid: false, message: 'Validation failed.' });
  }
}

export async function createCode(req, res) {
  try {
    const { code } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ success: false, message: 'Code is required.' });
    }

    const existing = await db.collection(CODES).where('code', '==', code.trim()).limit(1).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, message: 'This code already exists.' });
    }

    await db.collection(CODES).add({
      code: code.trim(),
      used: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Special code created.' });
  } catch (err) {
    console.error('Create code error:', err);
    res.status(500).json({ success: false, message: 'Failed to create code.' });
  }
}
