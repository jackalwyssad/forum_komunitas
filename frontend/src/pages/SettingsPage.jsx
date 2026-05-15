import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { STORAGE_URL } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import PasswordInput from '../components/PasswordInput';

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return STORAGE_URL + avatar;
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
  const [avatarMessage, setAvatarMessage] = useState({ text: '', type: 'success' });

  // Confirm delete avatar
  const [confirmAvatar, setConfirmAvatar] = useState(false);

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
      const res = await api.put('/profile', { name: profileForm.name });
      setProfileSuccess(res.data.message || 'Profil berhasil diupdate.');
      const u = res.data.user;
      // Update form agar nama baru langsung terlihat
      setProfileForm(prev => ({ ...prev, name: u.name || prev.name }));
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      if (err.response?.data?.errors) {
        setProfileErrors(err.response.data.errors);
      } else {
        setProfileErrors({ name: [err.response?.data?.message || 'Gagal menyimpan profil.'] });
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

    // Preview langsung sebelum upload
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setAvatarLoading(true);
    setAvatarMessage({ text: '', type: 'success' }); // reset

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Content-Type: undefined → override instance default 'application/json'
      // agar browser otomatis set 'multipart/form-data; boundary=...'
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': undefined },
      });

      setAvatarMessage({ text: res.data.message, type: 'success' });
      setAvatarPreview(getAvatarUrl(res.data.user.avatar));
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      const msg = err.response?.data?.errors?.avatar?.[0]
        || err.response?.data?.message
        || 'Upload gagal. Pastikan format & ukuran file sesuai.';
      setAvatarMessage({ text: msg, type: 'error' });
      // Kembalikan preview ke avatar lama
      setAvatarPreview(getAvatarUrl(user?.avatar) || null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setConfirmAvatar(true);
  };

  const confirmRemoveAvatar = async () => {
    setConfirmAvatar(false);
    setAvatarLoading(true);
    setAvatarMessage({ text: '', type: 'success' });

    try {
      const res = await api.delete('/profile/avatar');
      setAvatarPreview(null);
      setAvatarMessage({ text: res.data.message, type: 'success' });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      setAvatarMessage({ text: 'Gagal menghapus foto.', type: 'error' });
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
            <Alert
              type={avatarMessage.text?.includes('gagal') || avatarMessage.text?.includes('Gagal') ? 'error' : avatarMessage.type}
              message={avatarMessage.text}
              onClose={() => setAvatarMessage({ text: '', type: 'success' })}
              autoDismiss={4000}
            />
          </div>
        </div>

        {/* ========== PROFILE SECTION ========== */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-icon">👤</span>
            Informasi Profil
          </h2>
          <div className="settings-card">
            <Alert type="success" message={profileSuccess} autoDismiss={4000} onClose={() => setProfileSuccess('')} />
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
                  disabled
                  readOnly
                  style={{ backgroundColor: 'var(--bg-card)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
                <p className="form-hint" style={{ marginTop: '4px' }}>Email tidak dapat diubah.</p>
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
            <Alert type="success" message={passwordSuccess} autoDismiss={4000} onClose={() => setPasswordSuccess('')} />
            <form onSubmit={handlePasswordSubmit} id="password-form">
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">Password Lama</label>
                <PasswordInput
                  id="current-password"
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
                <PasswordInput
                  id="new-password"
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
                <PasswordInput
                  id="confirm-new-password"
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
      {/* Confirm Remove Avatar */}
      <ConfirmDialog
        isOpen={confirmAvatar}
        title="Hapus Foto Profil"
        message="Yakin ingin menghapus foto profil? Foto akan diganti dengan inisial nama kamu."
        variant="warning"
        onConfirm={confirmRemoveAvatar}
        onCancel={() => setConfirmAvatar(false)}
      />
    </div>
  );
}
