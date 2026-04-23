import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/forgot-password', { email });
      setSuccess(res.data.message || 'Link reset password telah dikirim ke email Anda.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
            🔑
          </div>
          <h1 className="auth-title">Lupa Password?</h1>
          <p className="auth-subtitle">
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
          </p>
        </div>

        <Alert type="success" message={success} onClose={() => setSuccess('')} />
        <Alert type="error" message={error} onClose={() => setError('')} />

        {!success && (
          <form onSubmit={handleSubmit} id="forgot-password-form">
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Alamat Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <p className="form-hint" style={{ marginTop: '6px' }}>
                Kami akan mengirimkan link reset ke email ini.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
              id="forgot-password-submit"
            >
              {loading ? 'Mengirim...' : '📧 Kirim Link Reset'}
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
