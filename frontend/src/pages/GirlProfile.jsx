import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getMyProfileById,
  getProfileMe,
  updateMyProfile,
  addProfileCalendarEvent,
  deleteProfileCalendarEvent,
} from '../api';
import GirlLayout from '../components/GirlLayout';
import './Auth.css';
import './Profile.css';
import './GirlProfile.css';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';

const EVENT_TYPE_LABELS = {
  important_date: 'Önemli tarih (tanışma, yıldönümü, anı)',
  activity_suggestion: 'Çift aktivite önerisi',
  reminder: 'Özel gün hatırlatması (Sevgililer, doğum günü vb.)',
  together_activity: 'Birlikte zaman (film, yemek, vb.)',
};

export default function GirlProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    type: 'important_date',
  });
  const [adding, setAdding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', surname: '', photoUrl: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    const [profileRes, meRes] = await Promise.all([getMyProfileById(id), getProfileMe()]);
    if (profileRes.needAuth || meRes.needAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }
    if (profileRes.success) {
      setProfile(profileRes.profile);
      setCustomizations(profileRes.customizations || []);
      setEditForm({
        name: profileRes.profile.name || '',
        surname: profileRes.profile.surname || '',
        photoUrl: profileRes.profile.photoUrl || '',
      });
    } else {
      setError(profileRes.message || 'Profil yüklenemedi.');
    }
    if (meRes.success) setMe(meRes.user);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (id) localStorage.setItem('lastVisitedProfileId', id);
  }, [id]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    setAdding(true);
    const res = await addProfileCalendarEvent(id, {
      date: newEvent.date,
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
    });
    setAdding(false);
    if (res.success) {
      setCustomizations((prev) => [...prev, res.event]);
      setNewEvent({ date: '', title: '', description: '', type: 'important_date' });
    } else {
      setError(res.message || 'Eklenemedi.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const res = await deleteProfileCalendarEvent(id, eventId);
    if (res.success) {
      setCustomizations((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateMyProfile(id, editForm);
    setSavingProfile(false);
    if (res.success) {
      setProfile(res.profile);
      setEditingProfile(false);
    } else {
      setError(res.message || 'Profil güncellenemedi.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="girl-profile-page">
        <div className="profile-loading">Yükleniyor…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="girl-profile-page">
        <div className="profile-error">
          {error || 'Profil bulunamadı.'}
          <Link to="/profile" className="btn btn-primary">Profilime dön</Link>
        </div>
      </div>
    );
  }

  return (
    <GirlLayout profile={profile} me={me}>
      <div className="girl-profile-page">
        {error && (
          <div className="profile-error-banner" role="alert">
            {error}
            <button type="button" onClick={() => setError('')} className="profile-error-dismiss">×</button>
          </div>
        )}

        <main className="girl-profile-main">
          {editingProfile ? (
            <section className="profile-section girl-section">
              <h2 className="profile-section-title">Profili düzenle</h2>
              <form onSubmit={handleSaveProfile} className="girl-profile-edit-form girl-profile-edit-form--page">
                <div className="form-row">
                  <label className="label">Ad</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ad"
                    required
                    className="input"
                  />
                </div>
                <div className="form-row">
                  <label className="label">Soyad</label>
                  <input
                    type="text"
                    value={editForm.surname}
                    onChange={(e) => setEditForm((p) => ({ ...p, surname: e.target.value }))}
                    placeholder="Soyad"
                    className="input"
                  />
                </div>
                <div className="form-row">
                  <label className="label">Fotoğraf URL</label>
                  <input
                    type="url"
                    value={editForm.photoUrl}
                    onChange={(e) => setEditForm((p) => ({ ...p, photoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="input"
                  />
                </div>
                <div className="girl-profile-edit-actions">
                  <button type="submit" disabled={savingProfile} className="btn btn-primary btn-sm">
                    {savingProfile ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="btn btn-outline btn-sm">
                    İptal
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <>
              <section className="profile-section girl-section girl-section-toolbar">
                <h2 className="profile-section-title">Takvim</h2>
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="btn btn-outline btn-sm"
                >
                  Profili düzenle
                </button>
              </section>
              <section className="profile-section girl-section">
          <p className="girl-section-desc">
            Bu profile özel tarihler, etkinlikler ve hatırlatmalar ekle. Hepsi sadece bu profilde görünür.
          </p>
          <form onSubmit={handleAddEvent} className="girl-customize-form">
            <div className="girl-form-row">
              <label className="label">Tür</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))}
                className="input girl-select"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="girl-form-row">
              <label className="label">Tarih</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                required
                className="input"
              />
            </div>
            <div className="girl-form-row">
              <label className="label">Başlık</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                placeholder="Örn: İlk tanışma, Sevgililer Günü, Film gecesi"
                required
                className="input"
              />
            </div>
            <div className="girl-form-row">
              <label className="label">Açıklama (isteğe bağlı)</label>
              <input
                type="text"
                value={newEvent.description}
                onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detay veya not"
                className="input"
              />
            </div>
            <button type="submit" disabled={adding} className="btn btn-primary">
              {adding ? 'Ekleniyor…' : 'Ekle'}
            </button>
          </form>

          <h3 className="girl-customizations-title">Eklenen etkinlikler</h3>
          {customizations.length === 0 ? (
            <p className="calendar-empty">Henüz etkinlik yok. Yukarıdan ekleyebilirsin.</p>
          ) : (
            <ul className="calendar-list girl-customizations-list">
              {customizations.map((ev) => (
                <li key={ev.id} className={`calendar-item girl-custom-item girl-custom-item--${ev.type || 'important_date'}`}>
                  <div className="calendar-item-main">
                    <span className="calendar-item-type">{EVENT_TYPE_LABELS[ev.type] || ev.type}</span>
                    <span className="calendar-item-date">{ev.date}</span>
                    <span className="calendar-item-title">{ev.title}</span>
                    {ev.description && (
                      <span className="calendar-item-desc">{ev.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="calendar-item-delete"
                    title="Sil"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
              </section>
            </>
          )}
        </main>
      </div>
    </GirlLayout>
  );
}
