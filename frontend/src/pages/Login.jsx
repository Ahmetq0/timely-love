import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as apiLogin } from '../api';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiLogin(name, surname, password);
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/profile', { replace: true });
        return;
      }
      setError(result.message || 'Giriş başarısız.');
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/logo.png" alt="Timely Love" className="auth-brand-logo" />
          <div className="auth-brand-name">Timely Love</div>
          <div className="auth-brand-tagline">Anılarını planla</div>
        </div>
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-subtitle">Ad, soyad ve şifrenizle giriş yapın</p>

        {successMessage && (
          <div className="form-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label className="label">Ad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Adınız"
              required
              autoComplete="given-name"
              className="input"
            />
          </div>
          <div className="form-row">
            <label className="label">Soyad</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => { setSurname(e.target.value); setError(''); }}
              placeholder="Soyadınız"
              required
              autoComplete="family-name"
              className="input"
            />
          </div>
          <div className="form-row">
            <label className="label">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p className="auth-footer">
          Hesabınız yok mu? <Link to="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}
