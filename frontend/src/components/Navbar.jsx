import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Unread notification count
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync user data from localStorage when updated
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const handleUserUpdate = () => {
      const saved = localStorage.getItem('user');
      if (saved) setCurrentUser(JSON.parse(saved));
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unread_count);
      } catch (err) {
        // ignore - user might not be logged in
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for notification updates (after marking as read)
  useEffect(() => {
    const handleNotifUpdate = () => {
      if (currentUser) {
        api.get('/notifications/unread-count')
          .then((res) => setUnreadCount(res.data.unread_count))
          .catch(() => {});
      }
    };
    window.addEventListener('notif-updated', handleNotifUpdate);
    return () => window.removeEventListener('notif-updated', handleNotifUpdate);
  }, [currentUser]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#navGrad)" />
            <text x="16" y="22" fontFamily="Inter" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">F</text>
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          Forum Diskusi
        </Link>

        <div className="navbar-right">
          {/* Dark/Light Mode Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notification Bell */}
          {currentUser && (
            <Link to="/notifications" className="notif-bell" id="notif-bell" title="Notifikasi">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>
          )}

          <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
              Beranda
            </Link>
            <Link to="/forum" className={isActive('/forum')} onClick={() => setMenuOpen(false)}>
              Forum
            </Link>
            <Link to="/categories" className={isActive('/categories')} onClick={() => setMenuOpen(false)}>
              Kategori
            </Link>

            {currentUser ? (
              <>
                {isAdmin && (
                  <Link to="/admin/categories" className={isActive('/admin/categories')} onClick={() => setMenuOpen(false)}>
                    Kelola Kategori
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="profile-dropdown" ref={profileRef}>
                  <button
                    className="profile-trigger"
                    onClick={() => setProfileOpen(!profileOpen)}
                    id="profile-menu-btn"
                  >
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="nav-avatar-img" />
                    ) : (
                      <div className="nav-avatar">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="nav-username">{currentUser.name}</span>
                    {isAdmin && <span className="nav-role">Admin</span>}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ marginLeft: '4px', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="profile-menu">
                      <div className="profile-menu-header">
                        <div className="profile-menu-name">{currentUser.name}</div>
                        <div className="profile-menu-email">{currentUser.email}</div>
                      </div>
                      <div className="profile-menu-divider"></div>
                      <Link
                        to="/notifications"
                        className="profile-menu-item"
                        onClick={() => { setProfileOpen(false); setMenuOpen(false); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        Notifikasi
                        {unreadCount > 0 && (
                          <span className="notif-menu-badge">{unreadCount}</span>
                        )}
                      </Link>
                      <Link
                        to="/settings"
                        className="profile-menu-item"
                        onClick={() => { setProfileOpen(false); setMenuOpen(false); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        Pengaturan
                      </Link>
                      <button
                        className="profile-menu-item profile-menu-logout"
                        onClick={handleLogout}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
