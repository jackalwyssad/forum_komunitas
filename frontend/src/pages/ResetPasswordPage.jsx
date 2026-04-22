import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      setForm((prev) => ({ ...prev, token, email }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setError('');

    try {
      const res = await api.post('/reset-password', form);
      setSuccess(res.data.message || 'Password berhasil direset! Silakan login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Jika token tidak ada di URL
  if (!searchParams.get('token')) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h1 className="auth-title">Link Tidak Valid</h1>
          <p className="auth-subtitle">
            Link reset password tidak valid atau sudah kadaluarsa.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '24px'
          }}>
            🔒
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Masukkan password baru untuk akun Anda.</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            ✅ {success} <br />
            <small>Mengalihkan ke halaman login...</small>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            ⚠ {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} id="reset-password-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                readOnly={!!searchParams.get('email')}
              />
              {errors.email && <p className="form-error">{errors.email[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">Password Baru</label>
              <input
                id="reset-password"
                type="password"
                className="form-input"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoFocus
              />
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password-confirm">
                Konfirmasi Password Baru
              </label>
              <input
                id="reset-password-confirm"
                type="password"
                className="form-input"
                placeholder="Ulangi password baru"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
              id="reset-password-submit"
            >
              {loading ? 'Menyimpan...' : '🔑 Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '24px' }}>
          <Link to="/login">← Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
