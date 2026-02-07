import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sgo-takvim-secret-change-in-production';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  req.userId = decoded.userId;
  next();
}
