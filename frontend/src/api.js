const API = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function validateSpecialCode(code) {
  const res = await fetch(`${API}/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim() }),
  });
  return res.json();
}

export async function register({ name, surname, email, password, specialCode }) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      password,
      specialCode: specialCode.trim(),
    }),
  });
  return res.json();
}

export async function login(name, surname, password) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name?.trim(),
      surname: surname?.trim(),
      password,
    }),
  });
  return res.json();
}

export async function getProfileMe() {
  const res = await fetch(`${API}/profile/me`, { headers: getAuthHeaders() });
  if (res.status === 401) return { success: false, needAuth: true };
  return res.json();
}

export async function updateProfileMe({ profilePhotoUrl }) {
  const res = await fetch(`${API}/profile/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ profilePhotoUrl }),
  });
  return res.json();
}

export async function getCalendar() {
  const res = await fetch(`${API}/profile/me/calendar`, { headers: getAuthHeaders() });
  if (res.status === 401) return { success: false, needAuth: true };
  return res.json();
}

export async function addCalendarEvent({ date, title, description }) {
  const res = await fetch(`${API}/profile/me/calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, title, description: description || '' }),
  });
  return res.json();
}

export async function deleteCalendarEvent(eventId) {
  const res = await fetch(`${API}/profile/me/calendar/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// Kız profilleri (hesabında oluşturduğun profiller)
export async function listMyProfiles() {
  const res = await fetch(`${API}/profiles`, { headers: getAuthHeaders() });
  if (res.status === 401) return { success: false, needAuth: true };
  return res.json();
}

export async function createProfile({ name, surname, photoUrl }) {
  const res = await fetch(`${API}/profiles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name: name?.trim(), surname: surname?.trim(), photoUrl: photoUrl?.trim() || null }),
  });
  return res.json();
}

export async function getMyProfileById(id) {
  const res = await fetch(`${API}/profiles/${id}`, { headers: getAuthHeaders() });
  if (res.status === 401) return { success: false, needAuth: true };
  return res.json();
}

export async function updateMyProfile(id, { name, surname, photoUrl }) {
  const res = await fetch(`${API}/profiles/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name: name?.trim(), surname: surname?.trim(), photoUrl: photoUrl?.trim() || null }),
  });
  return res.json();
}

export async function deleteMyProfile(id) {
  const res = await fetch(`${API}/profiles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function addProfileCalendarEvent(profileId, { date, title, description, type }) {
  const res = await fetch(`${API}/profiles/${profileId}/calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, title, description: description || '', type: type || 'important_date' }),
  });
  return res.json();
}

export async function deleteProfileCalendarEvent(profileId, eventId) {
  const res = await fetch(`${API}/profiles/${profileId}/calendar/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getProfileActivities(profileId, category) {
  const res = await fetch(`${API}/profiles/${profileId}/activities?category=${encodeURIComponent(category)}`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) return { success: false, needAuth: true };
  return res.json();
}

export async function addProfileActivity(profileId, { category, title, description }) {
  const res = await fetch(`${API}/profiles/${profileId}/activities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ category, title, description: description || '' }),
  });
  return res.json();
}

export async function deleteProfileActivity(profileId, activityId) {
  const res = await fetch(`${API}/profiles/${profileId}/activities/${activityId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}
