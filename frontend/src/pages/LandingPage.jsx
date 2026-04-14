import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleEnterForum = () => {
    navigate('/forum');
  };

  const stats = [
    { icon: '💬', value: '1,200+', label: 'Diskusi Aktif' },
    { icon: '👥', value: '500+', label: 'Anggota Komunitas' },
    { icon: '📂', value: '20+', label: 'Kategori Topik' },
    { icon: '⚡', value: '24/7', label: 'Selalu Aktif' },
  ];

  const features = [
    {
      icon: '🗣️',
      title: 'Diskusi Bebas',
      desc: 'Bagikan ide, pertanyaan, dan pengalaman kamu dengan komunitas yang supportif.',
    },
    {
      icon: '🔔',
      title: 'Notifikasi Real-time',
      desc: 'Dapatkan pemberitahuan langsung saat ada balasan atau likes pada postinganmu.',
    },
    {
      icon: '🏷️',
      title: 'Kategori Terstruktur',
      desc: 'Temukan topik yang kamu minati dengan mudah melalui kategori yang rapi.',
    },
    {
      icon: '❤️',
      title: 'Apresiasi & Like',
      desc: 'Berikan apresiasi kepada konten yang berkualitas dengan fitur like.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="landing-canvas" />

      {/* Gradient Orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          {/* Badge */}
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Komunitas Diskusi Aktif
          </div>

          <h1 className="landing-title">
            Tempat Berbagi &amp;
            <br />
            <span className="landing-title-gradient">Bertumbuh Bersama</span>
          </h1>

          <p className="landing-subtitle">
            Forum komunitas terbaik untuk berdiskusi, berbagi pengetahuan,
            dan terhubung dengan ribuan anggota dari seluruh penjuru.
          </p>

          <div className="landing-cta-group">
            <button
              id="enter-forum-btn"
              className="landing-btn-primary"
              onClick={handleEnterForum}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Masuk ke Forum
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {!user && (
              <button
                id="register-landing-btn"
                className="landing-btn-secondary"
                onClick={() => navigate('/register')}
              >
                Daftar Gratis
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="landing-stats">
            {stats.map((s, i) => (
              <div key={i} className="landing-stat-item">
                <span className="landing-stat-icon">{s.icon}</span>
                <span className="landing-stat-value">{s.value}</span>
                <span className="landing-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-section-label">Fitur Unggulan</div>
        <h2 className="landing-section-title">Kenapa Forum Diskusi?</h2>
        <p className="landing-section-sub">
          Platform kami dirancang untuk memberikan pengalaman berdiskusi yang nyaman dan menyenangkan.
        </p>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <div className="landing-cta-glow" />
          <h2 className="landing-cta-title">Siap Bergabung?</h2>
          <p className="landing-cta-desc">
            Mulai berdiskusi sekarang dan jadilah bagian dari komunitas kami yang terus berkembang.
          </p>
          <button
            id="enter-forum-cta-btn"
            className="landing-btn-primary"
            onClick={handleEnterForum}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Masuk ke Forum Diskusi
          </button>
        </div>
      </section>
    </div>
  );
}
