import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import OtpInput from '../components/OtpInput';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const otpRef = useRef(null);
  
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP State
  const [step, setStep] = useState('register'); // 'register' or 'otp-sent'
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      const res = await sendOtp(form.name, form.email, form.password, form.password_confirmation);
      setSuccessMessage(res.data?.message || 'Kode OTP telah dikirimkan ke email Anda.');
      setStep('otp-sent');
      setCountdown(60);
      
      // Scroll to OTP section
      setTimeout(() => {
        otpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Gagal mengirim OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setGeneralError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      await sendOtp(form.name, form.email, form.password, form.password_confirmation);
      setSuccessMessage('Kode OTP baru telah dikirim ke email Anda.');
      setOtpValue('');
      setCountdown(60);
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (otpValue.length < 6) {
      setGeneralError('Masukkan 6 digit kode OTP');
      return;
    }
    
    setLoading(true);
    try {
      await verifyOtp(form.email, otpValue);
      navigate('/');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Verifikasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: 0, fontWeight: '500', fontSize: '0.9rem' }}
        >
          ← Kembali
        </button>
        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-subtitle">Gabung dan mulai berdiskusi</p>

        {generalError && step !== 'otp-sent' && <Alert type="error" message={generalError} onClose={() => setGeneralError('')} />}

        <form onSubmit={handleSendOtp} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Nama Lengkap</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={step === 'otp-sent'}
            />
            {errors.name && <p className="form-error">{errors.name[0]}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={step === 'otp-sent'}
            />
            {errors.email && <p className="form-error">{errors.email[0]}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <PasswordInput
              id="reg-password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={step === 'otp-sent'}
            />
            {errors.password && <p className="form-error">{errors.password[0]}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Konfirmasi Password</label>
            <PasswordInput
              id="reg-confirm"
              placeholder="Ulangi password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              required
              disabled={step === 'otp-sent'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading || step === 'otp-sent'}
            id="register-submit"
          >
            {loading && step !== 'otp-sent' ? 'Mengirim OTP...' : step === 'otp-sent' ? '✅ Kode OTP Terkirim' : 'Daftar'}
          </button>
        </form>

        {step === 'otp-sent' && (
          <div ref={otpRef} style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border)", animation: "fadeInUp 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✉️</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Kode OTP telah dikirim ke</p>
              <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.95rem", margin: "4px 0 0" }}>{form.email}</p>
            </div>

            {generalError && <Alert type="error" message={generalError} onClose={() => setGeneralError('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            <form onSubmit={handleVerifyOtp} id="otp-verify-form">
              <div className="form-group" style={{ textAlign: "center" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "12px" }}>Masukkan Kode OTP</label>
                <OtpInput value={otpValue} onChange={setOtpValue} disabled={loading} />
                <p className="form-hint" style={{ marginTop: "10px" }}>
                  ⏰ Kode berlaku selama <strong>10 menit</strong>
                </p>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "16px" }} disabled={loading || otpValue.length < 6}>
                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button 
                type="button" 
                onClick={handleResendOtp}
                style={{ 
                  background: "none", 
                  color: countdown > 0 ? "var(--text-muted)" : "var(--primary)", 
                  border: "1.5px solid var(--border)", 
                  fontWeight: "600", 
                  cursor: countdown > 0 ? "not-allowed" : "pointer",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  width: "100%",
                  transition: "all 0.2s"
                }}
                disabled={countdown > 0 || loading}
              >
                {loading && !otpValue ? 'Mengirim...' : countdown > 0 ? `📧 Kirim Ulang OTP (${countdown}s)` : '📧 Kirim Ulang OTP'}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                type="button" 
                onClick={() => setStep('register')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ← Kembali perbaiki data
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer" style={{ marginTop: '24px' }}>
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
