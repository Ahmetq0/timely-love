import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { register, login } from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { validateCode, createCode } from './routes/codes.js';
import {
  getMe,
  updateMe,
  getCalendar,
  addCalendarEvent,
  deleteCalendarEvent,
  listMyProfiles,
  createProfile,
  getMyProfileById,
  updateProfile,
  deleteProfile,
  addProfileCalendarEvent,
  deleteProfileCalendarEvent,
  getProfileActivities,
  addProfileActivity,
  deleteProfileActivity,
} from './routes/profile.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/validate-code', validateCode);
app.post('/api/admin/codes', createCode);

app.get('/api/profile/me/calendar', authMiddleware, getCalendar);
app.post('/api/profile/me/calendar', authMiddleware, addCalendarEvent);
app.delete('/api/profile/me/calendar/:eventId', authMiddleware, deleteCalendarEvent);
app.get('/api/profile/me', authMiddleware, getMe);
app.patch('/api/profile/me', authMiddleware, updateMe);

app.get('/api/profiles', authMiddleware, listMyProfiles);
app.post('/api/profiles', authMiddleware, createProfile);
app.get('/api/profiles/:id', authMiddleware, getMyProfileById);
app.patch('/api/profiles/:id', authMiddleware, updateProfile);
app.delete('/api/profiles/:id', authMiddleware, deleteProfile);
app.get('/api/profiles/:id/activities', authMiddleware, getProfileActivities);
app.post('/api/profiles/:id/activities', authMiddleware, addProfileActivity);
app.delete('/api/profiles/:id/activities/:activityId', authMiddleware, deleteProfileActivity);
app.post('/api/profiles/:id/calendar', authMiddleware, addProfileCalendarEvent);
app.delete('/api/profiles/:id/calendar/:eventId', authMiddleware, deleteProfileCalendarEvent);

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Production: frontend build'ini serve et (tek sunucu deployment)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
