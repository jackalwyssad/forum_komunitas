import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BASE_URL = 'https://forumkomunitas.xyz';
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return BASE_URL + avatar;
};

export default function SettingsPage() {
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar) || null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');

  // Refresh user data in context
  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      const u = res.data.user;
      localStorage.setItem('user', JSON.stringify(u));
      // Force a page-level state update
      window.dispatchEvent(new Event('user-updated'));
    } catch (e) {
      // ignore
    }
  };

  // ========== PROFILE UPDATE ==========
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await api.put('/profile', profileForm);
      setProfileSuccess(res.data.message);
      const u = res.data.user;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      if (err.response?.data?.errors) {
        setProfileErrors(err.response.data.errors);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // ========== PASSWORD CHANGE ==========
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const res = await api.put('/profile/password', passwordForm);
      setPasswordSuccess(res.data.message);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      if (err.response?.data?.errors) {
        setPasswordErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setPasswordErrors({ current_password: [err.response.data.message] });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ========== AVATAR UPLOAD ==========
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setAvatarLoading(true);
    setAvatarMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAvatarMessage(res.data.message);
      setAvatarPreview(getAvatarUrl(res.data.user.avatar));
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      const msg = err.response?.data?.errors?.avatar?.[0] || err.response?.data?.message || 'Upload gagal.';
      setAvatarMessage(msg);
      setAvatarPreview(user?.avatar || null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Yakin ingin menghapus foto profil?')) return;
    setAvatarLoading(true);
    setAvatarMessage('');

    try {
      const res = await api.delete('/profile/avatar');
      setAvatarPreview(null);
      setAvatarMessage(res.data.message);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      setAvatarMessage('Gagal menghapus foto.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="container main-content">
      <div className="settings-page">
        <h1 className="page-title">⚙️ Pengaturan Akun</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Kelola profil, foto, dan keamanan akun Anda
        </p>

        {/* ========== AVATAR SECTION ========== */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-icon">📸</span>
            Foto Profil
          </h2>
          <div className="settings-card">
            <div className="avatar-section">
              <div className="avatar-container">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="avatar-image-lg"
                  />
                ) : (
                  <div className="avatar-placeholder-lg">
                    {userInitial}
                  </div>
                )}
                {avatarLoading && (
                  <div className="avatar-loading-overlay">
                    <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                  </div>
                )}
              </div>
              <div className="avatar-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  style={{ display: 'none' }}
                  id="avatar-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                >
                  📁 Pilih Foto
                </button>
                {avatarPreview && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleRemoveAvatar}
                    disabled={avatarLoading}
                  >
                    🗑 Hapus Foto
                  </button>
                )}
                <p className="form-hint">Format: JPEG, PNG, GIF, WebP. Maksimal 2MB.</p>
              </div>
            </div>
            {avatarMessage && (
              <div className={`alert ${avatarMessage.includes('gagal') || avatarMessage.includes('Gagal') ? 'alert-error' : 'alert-success'}`}
                style={{ marginTop: '16px' }}>
                {avatarMessage}
              </div>
            )}
          </div>
        </div>

        {/* ========== PROFILE SECTION ========== */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-icon">👤</span>
            Informasi Profil
          </h2>
          <div className="settings-card">
            {profileSuccess && <div className="alert alert-success">✅ {profileSuccess}</div>}
            <form onSubmit={handleProfileSubmit} id="profile-form">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-name">Nama Lengkap</label>
                <input
                  id="settings-name"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
                {profileErrors.name && <p className="form-error">{profileErrors.name[0]}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="settings-email">Email</label>
                <input
                  id="settings-email"
                  type="email"
                  className="form-input"
                  placeholder="nama@email.com"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
                {profileErrors.email && <p className="form-error">{profileErrors.email[0]}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
                id="save-profile"
              >
                {profileLoading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>

        {/* ========== PASSWORD SECTION ========== */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-icon">🔒</span>
            Ganti Password
          </h2>
          <div className="settings-card">
            {passwordSuccess && <div className="alert alert-success">✅ {passwordSuccess}</div>}
            <form onSubmit={handlePasswordSubmit} id="password-form">
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">Password Lama</label>
                <input
                  id="current-password"
                  type="password"
                  className="form-input"
                  placeholder="Masukkan password lama"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
                {passwordErrors.current_password && (
                  <p className="form-error">{passwordErrors.current_password[0]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Password Baru</label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  placeholder="Minimal 8 karakter"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  required
                />
                {passwordErrors.password && (
                  <p className="form-error">{passwordErrors.password[0]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Konfirmasi Password Baru</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  className="form-input"
                  placeholder="Ulangi password baru"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
                id="change-password"
              >
                {passwordLoading ? 'Mengubah...' : '🔑 Ubah Password'}
              </button>
            </form>
          </div>
        </div>

        {/* ========== ACCOUNT INFO ========== */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-icon">ℹ️</span>
            Informasi Akun
          </h2>
          <div className="settings-card">
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className={`nav-role ${user?.role === 'admin' ? 'role-admin' : ''}`}>
                {user?.role || 'user'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Bergabung Sejak</span>
              <span className="info-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
