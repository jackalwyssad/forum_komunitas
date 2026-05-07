import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';
import PasswordInput from '../components/PasswordInput';

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
  const [linkExpired, setLinkExpired] = useState(false);

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
      if (err.response?.data?.message === 'LINK_EXPIRED') {
        // Tampilkan halaman "link kadaluarsa"
        setLinkExpired(true);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Jika token tidak ada di URL ──────────────────────────────────────────
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

  // ── Tampilan Link Kadaluarsa ─────────────────────────────────────────────
  if (linkExpired) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          {/* Ikon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
          }}>
            <span style={{ fontSize: '36px' }}>⏰</span>
          </div>

          <h1 className="auth-title" style={{ color: '#ef4444' }}>Link Sudah Kadaluarsa</h1>
          <p className="auth-subtitle" style={{ lineHeight: '1.6' }}>
            Link reset password hanya berlaku selama <strong>10 menit</strong> dan sudah tidak aktif.
            <br />Silakan minta link baru untuk melanjutkan.
          </p>

          {/* Kotak info */}
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
            margin: '20px 0',
            textAlign: 'left',
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              💡 <strong>Tips:</strong> Setelah menerima email, segera klik link dalam waktu 10 menit sebelum kadaluarsa.
            </p>
          </div>

          <Link
            to="/forgot-password"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
            id="request-new-link-btn"
          >
            🔄 Minta Link Baru
          </Link>
          <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Form Reset Password ──────────────────────────────────────────────────
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

          {/* Badge 10 menit */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: '#f97316',
            marginTop: '8px',
          }}>
            ⏱ Link berlaku 10 menit sejak dikirim
          </div>
        </div>

        <Alert
          type="success"
          message={success ? `${success} — Mengalihkan ke halaman login...` : ''}
        />
        <Alert type="error" message={error} onClose={() => setError('')} />

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
              <PasswordInput
                id="reset-password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password-confirm">
                Konfirmasi Password Baru
              </label>
              <PasswordInput
                id="reset-password-confirm"
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
