import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getProfileMe,
  updateProfileMe,
  listMyProfiles,
  createProfile,
} from '../api';
import './Auth.css';
import './Profile.css';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myProfiles, setMyProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', surname: '', photoUrl: '' });
  const [addingProfile, setAddingProfile] = useState(false);
  const [lastVisitedId, setLastVisitedId] = useState(null);

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    const res = await getProfileMe();
    if (res.needAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }
    if (res.success) {
      setProfile(res.user);
      setPhotoUrl(res.user.profilePhotoUrl || '');
    } else {
      setError(res.message || 'Profil yüklenemedi.');
    }
    setLoading(false);
  };

  const loadMyProfiles = async () => {
    const res = await listMyProfiles();
    if (res.success) setMyProfiles(res.profiles || []);
  };

  useEffect(() => {
    const last = localStorage.getItem('lastVisitedProfileId');
    if (last) setLastVisitedId(last);
  }, [myProfiles]);

  useEffect(() => {
    loadProfile();
    loadMyProfiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleSavePhoto = async () => {
    setSavingPhoto(true);
    const res = await updateProfileMe({ profilePhotoUrl: photoUrl || null });
    setSavingPhoto(false);
    if (res.success) {
      setProfile((p) => ({ ...p, profilePhotoUrl: res.user.profilePhotoUrl }));
      setEditingPhoto(false);
    } else {
      setError(res.message || 'Fotoğraf güncellenemedi.');
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newProfile.name.trim()) return;
    setAddingProfile(true);
    const res = await createProfile(newProfile);
    setAddingProfile(false);
    if (res.success) {
      setMyProfiles((prev) => [...prev, res.profile]);
      setNewProfile({ name: '', surname: '', photoUrl: '' });
      setShowAddProfile(false);
    } else {
      setError(res.message || 'Profil eklenemedi.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Yükleniyor…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error || 'Profil yüklenemedi.'}
          <button type="button" onClick={() => navigate('/login')} className="btn btn-primary">
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    );
  }

  const photoSrc = profile.profilePhotoUrl || DEFAULT_AVATAR;
  const lastVisitedProfile = lastVisitedId ? myProfiles.find((p) => p.id === lastVisitedId) : null;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-avatar-wrap">
            <img src={photoSrc} alt="" className="profile-avatar" />
            {editingPhoto ? (
              <div className="profile-photo-edit">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Fotoğraf URL"
                  className="input"
                />
                <div className="profile-photo-actions">
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    disabled={savingPhoto}
                    className="btn btn-primary btn-sm"
                  >
                    {savingPhoto ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingPhoto(false); setPhotoUrl(profile.profilePhotoUrl || ''); }}
                    className="btn btn-outline btn-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingPhoto(true)}
                className="profile-avatar-edit-btn"
                title="Fotoğrafı düzenle"
              >
                ✎
              </button>
            )}
          </div>
          <div className="profile-heading">
            <h1 className="profile-name">{profile.name} {profile.surname}</h1>
            <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
              Çıkış Yap
            </button>
          </div>
          <Link to="/profile" className="profile-logo-wrap">
            <img src="/logo.png" alt="Timely Love" className="profile-logo" />
          </Link>
        </div>
      </header>

      {error && (
        <div className="profile-error-banner" role="alert">
          {error}
          <button type="button" onClick={() => setError('')} className="profile-error-dismiss">×</button>
        </div>
      )}

      <main className="profile-main">
        <div className="profile-welcome-card">
          <span className="profile-welcome-emoji">👋</span>
          <div>
            <h2 className="profile-welcome-title">Merhaba, {profile.name}!</h2>
            <p className="profile-welcome-text">Profiline tıklayarak takvim ve aktiviteleri yönetebilirsin.</p>
          </div>
        </div>

        {lastVisitedProfile && myProfiles.length > 1 && (
          <div className="profile-quick-access">
            <span className="profile-quick-label">Hızlı erişim</span>
            <Link
              to={`/profile/girl/${lastVisitedProfile.id}`}
              className="profile-quick-card"
            >
              <img
                src={lastVisitedProfile.photoUrl || DEFAULT_AVATAR}
                alt=""
                className="profile-quick-avatar"
              />
              <span>{lastVisitedProfile.name} {lastVisitedProfile.surname}</span>
            </Link>
          </div>
        )}

        <section className="profile-section profile-section-girls">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Kızlarım</h2>
            {myProfiles.length > 0 && (
              <span className="profile-count-badge">{myProfiles.length} profil</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAddProfile(true)}
            className="btn btn-primary btn-add-profile"
          >
            + Yeni profil ekle
          </button>
          <div className="others-grid">
            {myProfiles.length === 0 ? (
              <div className="profile-empty-state">
                <span className="profile-empty-icon">✨</span>
                <h3 className="profile-empty-title">Henüz profil yok</h3>
                <p className="profile-empty-text">İlk profilini ekle, takvim ve aktiviteleri birlikte planla.</p>
                <button
                  type="button"
                  onClick={() => setShowAddProfile(true)}
                  className="btn btn-primary"
                >
                  İlk profilini ekle
                </button>
              </div>
            ) : (
              myProfiles.map((p) => (
                <Link
                  key={p.id}
                  to={`/profile/girl/${p.id}`}
                  className="others-card others-card-link"
                  onClick={() => localStorage.setItem('lastVisitedProfileId', p.id)}
                >
                  <img
                    src={p.photoUrl || DEFAULT_AVATAR}
                    alt=""
                    className="others-card-photo"
                  />
                  <span className="others-card-name">{p.name} {p.surname}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="profile-tip-card">
          <span className="profile-tip-icon">💡</span>
          <p className="profile-tip-text">Her profile girince soldaki menüden takvim, romantik aktiviteler, film listesi ve daha fazlasını ekleyebilirsin.</p>
        </div>
      </main>

      {showAddProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowAddProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setShowAddProfile(false)}
            >
              ×
            </button>
            <h3 className="profile-modal-title">Yeni kız profili ekle</h3>
            <form onSubmit={handleAddProfile} className="auth-form">
              <div className="form-row">
                <label className="label">Ad</label>
                <input
                  type="text"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ad"
                  required
                  className="input"
                />
              </div>
              <div className="form-row">
                <label className="label">Soyad (isteğe bağlı)</label>
                <input
                  type="text"
                  value={newProfile.surname}
                  onChange={(e) => setNewProfile((prev) => ({ ...prev, surname: e.target.value }))}
                  placeholder="Soyad"
                  className="input"
                />
              </div>
              <div className="form-row">
                <label className="label">Profil fotoğrafı URL (isteğe bağlı)</label>
                <input
                  type="url"
                  value={newProfile.photoUrl}
                  onChange={(e) => setNewProfile((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="input"
                />
              </div>
              <button type="submit" disabled={addingProfile} className="btn btn-primary">
                {addingProfile ? 'Ekleniyor…' : 'Profil oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
