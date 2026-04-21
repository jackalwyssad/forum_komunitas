import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <span className="site-footer-logo-mark">F</span>
            <span>Forum Diskusi</span>
          </Link>
          <p className="site-footer-description">
            Ruang komunitas untuk berbagi ide, berdiskusi, dan membangun percakapan yang bermanfaat.
          </p>
        </div>

        <div className="site-footer-links">
          <div className="site-footer-column">
            <span className="site-footer-heading">Navigasi</span>
            <Link to="/">Beranda</Link>
            <Link to="/forum">Forum</Link>
            <Link to="/categories">Kategori</Link>
          </div>

          <div className="site-footer-column">
            <span className="site-footer-heading">Akses</span>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/settings">Pengaturan</Link>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>&copy; {year} Forum Diskusi. Dibuat untuk komunitas yang aktif dan saling bantu.</p>
      </div>
    </footer>
  );
}
