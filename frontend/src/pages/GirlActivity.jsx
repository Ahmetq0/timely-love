import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getMyProfileById,
  getProfileMe,
  getProfileActivities,
  addProfileActivity,
  deleteProfileActivity,
} from '../api';
import GirlLayout from '../components/GirlLayout';
import { ACTIVITY_CATEGORIES } from '../constants/activityCategories';
import './Auth.css';
import './Profile.css';
import './GirlActivity.css';

export default function GirlActivity() {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [adding, setAdding] = useState(false);

  const categoryInfo = ACTIVITY_CATEGORIES.find((c) => c.key === category);

  const load = async () => {
    if (!id || !category) return;
    setLoading(true);
    setError('');
    const [profileRes, meRes, activitiesRes] = await Promise.all([
      getMyProfileById(id),
      getProfileMe(),
      getProfileActivities(id, category),
    ]);
    if (profileRes.needAuth || meRes.needAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }
    if (profileRes.success) {
      setProfile(profileRes.profile);
    } else {
      setError(profileRes.message || 'Profil yüklenemedi.');
    }
    if (meRes.success) setMe(meRes.user);
    if (activitiesRes.success) setActivities(activitiesRes.activities || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id, category]);

  useEffect(() => {
    if (id) localStorage.setItem('lastVisitedProfileId', id);
  }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;
    setAdding(true);
    const res = await addProfileActivity(id, {
      category,
      title: newActivity.title.trim(),
      description: newActivity.description.trim() || '',
    });
    setAdding(false);
    if (res.success) {
      setActivities((prev) => [...prev, res.activity]);
      setNewActivity({ title: '', description: '' });
    } else {
      setError(res.message || 'Eklenemedi.');
    }
  };

  const handleDelete = async (activityId) => {
    const res = await deleteProfileActivity(id, activityId);
    if (res.success) {
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  if (loading && !profile) {
    return (
      <div className="girl-activity-page">
        <div className="profile-loading">Yükleniyor…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="girl-activity-page">
        <div className="profile-error">
          {error || 'Profil bulunamadı.'}
          <Link to="/profile" className="btn btn-primary">Profilime dön</Link>
        </div>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div className="girl-activity-page">
        <div className="profile-error">Geçersiz kategori.</div>
      </div>
    );
  }

  return (
    <GirlLayout profile={profile} me={me}>
      <div className="girl-activity-page">
        {error && (
          <div className="profile-error-banner" role="alert">
            {error}
            <button type="button" onClick={() => setError('')} className="profile-error-dismiss">×</button>
          </div>
        )}

        <main className="girl-activity-main">
          <header className="girl-activity-header">
            <div className="girl-activity-header-icon-wrap">
              <span className="girl-activity-icon">{categoryInfo.icon}</span>
            </div>
            <div className="girl-activity-header-text">
              <h1 className="girl-activity-title">{categoryInfo.label}</h1>
              <p className="girl-activity-desc">{categoryInfo.description}</p>
              {categoryInfo.tips && (
                <p className="girl-activity-tips">
                  <span className="girl-activity-tips-label">Fikirler:</span> {categoryInfo.tips}
                </p>
              )}
              {activities.length > 0 && (
                <span className="girl-activity-count">{activities.length} aktivite</span>
              )}
            </div>
          </header>

          <section className="girl-activity-form-section">
            <h2 className="girl-activity-form-title">Yeni ekle</h2>
            <form onSubmit={handleAdd} className="girl-activity-form">
              <div className="girl-activity-form-row">
                <label className="girl-activity-label">Aktivite adı</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Örn: Piknik yapmak, Romantik film izlemek"
                  required
                  className="input girl-activity-input"
                />
              </div>
              <div className="girl-activity-form-row">
                <label className="girl-activity-label">Açıklama (isteğe bağlı)</label>
                <input
                  type="text"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Detay, not veya hatırlatma"
                  className="input girl-activity-input"
                />
              </div>
              <button type="submit" disabled={adding} className="btn btn-primary girl-activity-submit">
                {adding ? 'Ekleniyor…' : 'Listeye ekle'}
              </button>
            </form>
          </section>

          <section className="girl-activity-list-section">
            <div className="girl-activity-list-header">
              <h2 className="girl-activity-list-title">Listem</h2>
              {activities.length > 0 && (
                <span className="girl-activity-list-count">{activities.length} öğe</span>
              )}
            </div>
            {activities.length === 0 ? (
              <div className="girl-activity-empty-state">
                <span className="girl-activity-empty-icon">{categoryInfo.icon}</span>
                <h3 className="girl-activity-empty-title">Henüz aktivite yok</h3>
                <p className="girl-activity-empty-text">
                  Yukarıdaki formdan bu kategoride birlikte yapmak istediğin şeyleri ekleyebilirsin.
                </p>
              </div>
            ) : (
              <ul className="girl-activity-list">
                {activities.map((act, index) => (
                  <li key={act.id} className="girl-activity-item">
                    <span className="girl-activity-item-number">{index + 1}</span>
                    <div className="girl-activity-item-content">
                      <span className="girl-activity-item-title">{act.title}</span>
                      {act.description && (
                        <span className="girl-activity-item-desc">{act.description}</span>
                      )}
                      {act.createdAt && (
                        <span className="girl-activity-item-date">{formatDate(act.createdAt)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id)}
                      className="girl-activity-item-delete"
                      title="Sil"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </GirlLayout>
  );
}
