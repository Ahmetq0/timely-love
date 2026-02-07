import bcrypt from 'bcryptjs';
import { db } from '../firebase.js';
import { signToken } from '../middleware/auth.js';

const USERS = 'users';
const CODES = 'specialCodes';

export async function register(req, res) {
  try {
    const { name, surname, email, password, specialCode } = req.body;

    if (!name?.trim() || !surname?.trim() || !email?.trim() || !password || !specialCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, surname, email, password and special code are required.',
      });
    }

    const codeSnap = await db.collection(CODES).where('code', '==', specialCode.trim()).limit(1).get();
    if (codeSnap.empty) {
      return res.status(400).json({ success: false, message: 'Invalid special code.' });
    }

    const codeDoc = codeSnap.docs[0];
    const codeData = codeDoc.data();
    if (codeData.used) {
      return res.status(400).json({
        success: false,
        message: 'This special code has already been used.',
      });
    }

    const emailLower = email.trim().toLowerCase();
    const userSnap = await db.collection(USERS).where('email', '==', emailLower).limit(1).get();
    if (!userSnap.empty) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      name: name.trim(),
      surname: surname.trim(),
      email: emailLower,
      passwordHash,
      profilePhotoUrl: null,
      specialCodeId: codeDoc.id,
      createdAt: new Date().toISOString(),
    };

    const userRef = await db.collection(USERS).add(user);
    await codeDoc.ref.update({ used: true, usedBy: userRef.id, usedAt: new Date().toISOString() });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please log in.',
      userId: userRef.id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}

export async function login(req, res) {
  try {
    const { name, surname, password } = req.body;
    const n = name?.trim();
    const s = surname?.trim();

    if (!n || !s || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, surname and password are required.',
      });
    }

    const userSnap = await db
      .collection(USERS)
      .where('name', '==', n)
      .where('surname', '==', s)
      .limit(1)
      .get();

    if (userSnap.empty) {
      return res.status(401).json({ success: false, message: 'Invalid name, surname or password.' });
    }

    const doc = userSnap.docs[0];
    const userData = doc.data();
    const match = await bcrypt.compare(password, userData.passwordHash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid name, surname or password.' });
    }

    const userId = doc.id;
    const token = signToken({ userId });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: userData.name,
        surname: userData.surname,
        profilePhotoUrl: userData.profilePhotoUrl || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
}
