import { db } from '../firebase.js';
import { authMiddleware } from '../middleware/auth.js';

const USERS = 'users';
const CALENDAR_EVENTS = 'calendarEvents';
const CALENDAR_CUSTOMIZATIONS = 'calendarCustomizations';
const USER_PROFILES = 'userProfiles'; // Kullanıcının oluşturduğu kız profilleri (Instagram hesap geçişi gibi)
const PROFILE_ACTIVITIES = 'profileActivities'; // Kızla yapılacak şeyler (kategori bazlı)

const CUSTOMIZATION_TYPES = ['important_date', 'activity_suggestion', 'reminder', 'together_activity'];

const ACTIVITY_CATEGORIES = ['romantic', 'movies', 'food', 'travel', 'sports', 'special_days', 'other'];

function sanitizeUser(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name,
    surname: d.surname,
    profilePhotoUrl: d.profilePhotoUrl || null,
  };
}

export async function getMe(req, res) {
  try {
    const userId = req.userId;
    const userDoc = await db.collection(USERS).doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userData = userDoc.data();
    const eventsSnap = await db
      .collection(CALENDAR_EVENTS)
      .where('userId', '==', userId)
      .get();
    const calendarEvents = eventsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    res.json({
      success: true,
      user: {
        id: userDoc.id,
        name: userData.name,
        surname: userData.surname,
        profilePhotoUrl: userData.profilePhotoUrl || null,
      },
      calendarEvents,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
}

export async function updateMe(req, res) {
  try {
    const userId = req.userId;
    const { profilePhotoUrl } = req.body;
    const ref = db.collection(USERS).doc(userId);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const updates = {};
    if (typeof profilePhotoUrl === 'string') updates.profilePhotoUrl = profilePhotoUrl.trim() || null;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }
    updates.updatedAt = new Date().toISOString();
    await ref.update(updates);
    const updated = await ref.get();
    res.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.data().name,
        surname: updated.data().surname,
        profilePhotoUrl: updated.data().profilePhotoUrl || null,
      },
    });
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

// ----- Kız profilleri (hesabında oluşturduğun profiller, Instagram hesap geçişi gibi) -----

export async function listMyProfiles(req, res) {
  try {
    const userId = req.userId;
    const snap = await db.collection(USER_PROFILES).where('userId', '==', userId).get();
    const profiles = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    res.json({ success: true, profiles });
  } catch (err) {
    console.error('listMyProfiles error:', err);
    res.status(500).json({ success: false, message: 'Failed to load profiles.' });
  }
}

export async function createProfile(req, res) {
  try {
    const userId = req.userId;
    const { name, surname, photoUrl } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    const data = {
      userId,
      name: name.trim(),
      surname: (surname && surname.trim()) || '',
      photoUrl: (photoUrl && photoUrl.trim()) || null,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(USER_PROFILES).add(data);
    res.status(201).json({ success: true, profile: { id: ref.id, ...data } });
  } catch (err) {
    console.error('createProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to create profile.' });
  }
}

export async function getMyProfileById(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const doc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const profile = { id: doc.id, ...doc.data() };
    const customizationsSnap = await db
      .collection(CALENDAR_CUSTOMIZATIONS)
      .where('userId', '==', userId)
      .get();
    const customizations = customizationsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.profileId === profileId)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    res.json({ success: true, profile, customizations });
  } catch (err) {
    console.error('getMyProfileById error:', err);
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const { name, surname, photoUrl } = req.body;
    const doc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const updates = { updatedAt: new Date().toISOString() };
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof surname === 'string') updates.surname = surname.trim();
    if (typeof photoUrl === 'string') updates.photoUrl = photoUrl.trim() || null;
    if (Object.keys(updates).length <= 1) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }
    await doc.ref.update(updates);
    const updated = await doc.ref.get();
    res.json({ success: true, profile: { id: updated.id, ...updated.data() } });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

export async function deleteProfile(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const doc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const customizationsSnap = await db
      .collection(CALENDAR_CUSTOMIZATIONS)
      .where('userId', '==', userId)
      .get();
    const toDelete = customizationsSnap.docs.filter((d) => d.data().profileId === profileId);
    await Promise.all([...toDelete.map((d) => d.ref.delete()), doc.ref.delete()]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete profile.' });
  }
}

export async function addProfileCalendarEvent(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const { date, title, description, type } = req.body;
    if (!date?.trim() || !title?.trim()) {
      return res.status(400).json({ success: false, message: 'Date and title are required.' });
    }
    const profileDoc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!profileDoc.exists || profileDoc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const eventType = CUSTOMIZATION_TYPES.includes(type) ? type : 'important_date';
    const event = {
      userId,
      profileId,
      date: date.trim(),
      title: title.trim(),
      description: description?.trim() || '',
      type: eventType,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(CALENDAR_CUSTOMIZATIONS).add(event);
    res.status(201).json({ success: true, event: { id: ref.id, ...event } });
  } catch (err) {
    console.error('addProfileCalendarEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to add event.' });
  }
}

export async function deleteProfileCalendarEvent(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId, eventId } = req.params;
    const doc = await db.collection(CALENDAR_CUSTOMIZATIONS).doc(eventId).get();
    if (!doc.exists || doc.data().userId !== userId || doc.data().profileId !== profileId) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    await doc.ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteProfileCalendarEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
}

// ----- Kızla yapılacak şeyler (kategori bazlı, sidebar) -----

export async function getProfileActivities(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const category = req.query.category;
    if (!category || !ACTIVITY_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Valid category required.' });
    }
    const profileDoc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!profileDoc.exists || profileDoc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const snap = await db.collection(PROFILE_ACTIVITIES).where('userId', '==', userId).get();
    const activities = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.profileId === profileId && d.category === category)
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    res.json({ success: true, activities });
  } catch (err) {
    console.error('getProfileActivities error:', err);
    res.status(500).json({ success: false, message: 'Failed to load activities.' });
  }
}

export async function addProfileActivity(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId } = req.params;
    const { category, title, description } = req.body;
    if (!category?.trim() || !title?.trim()) {
      return res.status(400).json({ success: false, message: 'Category and title required.' });
    }
    if (!ACTIVITY_CATEGORIES.includes(category.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }
    const profileDoc = await db.collection(USER_PROFILES).doc(profileId).get();
    if (!profileDoc.exists || profileDoc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const data = {
      userId,
      profileId,
      category: category.trim(),
      title: title.trim(),
      description: (description && description.trim()) || '',
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(PROFILE_ACTIVITIES).add(data);
    res.status(201).json({ success: true, activity: { id: ref.id, ...data } });
  } catch (err) {
    console.error('addProfileActivity error:', err);
    res.status(500).json({ success: false, message: 'Failed to add activity.' });
  }
}

export async function deleteProfileActivity(req, res) {
  try {
    const userId = req.userId;
    const { id: profileId, activityId } = req.params;
    const doc = await db.collection(PROFILE_ACTIVITIES).doc(activityId).get();
    if (!doc.exists || doc.data().userId !== userId || doc.data().profileId !== profileId) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    await doc.ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteProfileActivity error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete activity.' });
  }
}

export async function getCalendar(req, res) {
  try {
    const userId = req.userId;
    const snap = await db.collection(CALENDAR_EVENTS).where('userId', '==', userId).get();
    const events = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    res.json({ success: true, events });
  } catch (err) {
    console.error('getCalendar error:', err);
    res.status(500).json({ success: false, message: 'Failed to load calendar.' });
  }
}

export async function addCalendarEvent(req, res) {
  try {
    const userId = req.userId;
    const { date, title, description } = req.body;
    if (!date?.trim() || !title?.trim()) {
      return res.status(400).json({ success: false, message: 'Date and title are required.' });
    }
    const event = {
      userId,
      date: date.trim(),
      title: title.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(CALENDAR_EVENTS).add(event);
    res.status(201).json({ success: true, event: { id: ref.id, ...event } });
  } catch (err) {
    console.error('addCalendarEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to add event.' });
  }
}

export async function deleteCalendarEvent(req, res) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;
    const doc = await db.collection(CALENDAR_EVENTS).doc(eventId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    await doc.ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteCalendarEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
}
