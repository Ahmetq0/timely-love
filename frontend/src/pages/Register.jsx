import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister, validateSpecialCode } from '../api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    specialCode: '',
  });
  const [codeValid, setCodeValid] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'specialCode') setCodeValid(null);
    setError('');
  };

  const handleValidateCode = async () => {
    if (!form.specialCode.trim()) return;
    setCodeChecking(true);
    setCodeValid(null);
    try {
      const result = await validateSpecialCode(form.specialCode);
      setCodeValid(result.valid);
    } catch {
      setCodeValid(false);
    } finally {
      setCodeChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiRegister(form);
      if (result.success) {
        navigate('/login', { state: { message: 'Kayıt başarılı. Giriş yapabilirsiniz.' } });
        return;
      }
      setError(result.message || 'Kayıt başarısız.');
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
        <h1 className="auth-title">Kayıt Ol</h1>
        <p className="auth-subtitle">Hesabını oluştur, takvimini doldur</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label className="label">Ad</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
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
              name="surname"
              value={form.surname}
              onChange={handleChange}
              placeholder="Soyadınız"
              required
              autoComplete="family-name"
              className="input"
            />
          </div>
          <div className="form-row">
            <label className="label">E-posta</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
              className="input"
            />
          </div>
          <div className="form-row">
            <label className="label">Şifre</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              className="input"
            />
          </div>
          <div className="form-row">
            <label className="label">Özel Kod</label>
            <div className="code-input-wrap">
              <input
                type="text"
                name="specialCode"
                value={form.specialCode}
                onChange={handleChange}
                placeholder="Size gönderilen özel kodu girin"
                required
                className="input"
              />
              <button
                type="button"
                onClick={handleValidateCode}
                disabled={codeChecking || !form.specialCode.trim()}
                className="btn btn-outline"
              >
                {codeChecking ? 'Kontrol…' : 'Doğrula'}
              </button>
            </div>
            {codeValid === true && (
              <span className="code-hint code-valid">✓ Kod geçerli</span>
            )}
            {codeValid === false && (
              <span className="code-hint code-invalid">Bu kod geçersiz veya kullanılmış.</span>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Kaydediliyor…' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-footer">
          Zaten hesabınız var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
