import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        animation: 'fadeInUp 0.5s ease',
      }}>
        {/* Animated 404 */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 140px)',
          fontWeight: '900',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
          letterSpacing: '-4px',
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          Halaman Tidak Ditemukan
        </h1>

        {/* Description */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '15px',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
          <br />
          Anda akan diarahkan ke beranda dalam{' '}
          <strong style={{ color: 'var(--primary)' }}>{countdown}</strong> detik.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
            id="not-found-home-btn"
          >
            🏠 Ke Beranda
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            style={{ minWidth: '160px' }}
            id="not-found-back-btn"
          >
            ← Kembali
          </button>
        </div>

        {/* Quick links */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
            Atau coba halaman ini:
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/forum" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
              💬 Forum
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link to="/categories" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
              📂 Kategori
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link to="/login" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
              🔑 Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
