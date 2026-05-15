import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync badge Navbar setiap kali halaman notifikasi dibuka
  useEffect(() => {
    window.dispatchEvent(new Event('notif-updated'));
  }, []);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${page}&per_page=20`);
      setNotifications(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notif) => {
    if (notif.is_read) return;
    try {
      await api.put(`/notifications/${notif.id}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n)
      );
      // Update badge di Navbar
      window.dispatchEvent(new Event('notif-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      // Update badge di Navbar
      window.dispatchEvent(new Event('notif-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    await markAsRead(notif);
    // Notif untuk admin: klik langsung ke halaman kelola kategori tab request
    if (notif.type === 'category_request_new') {
      navigate('/admin/categories?tab=requests');
      return;
    }
    // Notif untuk user: approved/rejected → ke halaman kategori untuk lihat riwayat
    if (notif.type === 'category_request_approved' || notif.type === 'category_request_rejected') {
      navigate('/categories');
      return;
    }
    // Thread dihapus: tidak navigate (thread sudah tidak ada)
    if (notif.type === 'thread_deleted') return;
    // Reply dihapus: navigate ke thread jika masih ada
    if (notif.type === 'reply_deleted') {
      if (notif.thread_id) navigate(`/threads/${notif.thread_id}`);
      return;
    }
    if (notif.thread_id) {
      navigate(`/threads/${notif.thread_id}`);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'reply_thread':              return '💬';
      case 'reply_reply':               return '↩️';
      case 'thread_liked':              return '❤️';
      case 'category_request_new':      return '💡';
      case 'category_request_approved': return '✅';
      case 'category_request_rejected': return '❌';
      case 'thread_deleted':            return '🗑️';
      case 'reply_deleted':             return '🗑️';
      default: return '🔔';
    }
  };

  const getNotifTypeLabel = (type) => {
    switch (type) {
      case 'reply_thread':              return 'Balasan Thread';
      case 'reply_reply':               return 'Membalas Komentar';
      case 'thread_liked':              return 'Menyukai Thread';
      case 'category_request_new':      return 'Usulan Kategori';
      case 'category_request_approved': return 'Usulan Disetujui';
      case 'category_request_rejected': return 'Usulan Ditolak';
      case 'thread_deleted':            return 'Thread Dihapus Admin';
      case 'reply_deleted':             return 'Komentar Dihapus Admin';
      default: return 'Notifikasi';
    }
  };

  const isDeletedByAdmin = (type) => type === 'thread_deleted' || type === 'reply_deleted';

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container main-content">
      <div className="notif-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔔 Notifikasi</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllAsRead} id="mark-all-read">
              ✓ Tandai Semua Dibaca
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔕</div>
            <div className="empty-state-title">Belum ada notifikasi</div>
            <div className="empty-state-desc">
              Notifikasi akan muncul saat ada yang membalas atau menyukai thread Anda.
            </div>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                onClick={() => handleNotifClick(notif)}
                id={`notif-${notif.id}`}
              >
                <div className="notif-icon-wrapper">
                  <span className="notif-icon"
                    style={isDeletedByAdmin(notif.type) ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' } : {}}
                  >{getNotifIcon(notif.type)}</span>
                  {!notif.is_read && <span className="notif-unread-dot"></span>}
                </div>

                  <div className="notif-body">
                  <div className="notif-sender">
                    {notif.sender?.avatar ? (
                      <img src={notif.sender.avatar} alt="" className="notif-sender-avatar" />
                    ) : (
                      <div className="notif-sender-avatar-placeholder"
                        style={isDeletedByAdmin(notif.type) ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444' } : {}}
                      >
                        {isDeletedByAdmin(notif.type) ? '🛡️' : (notif.sender?.name?.charAt(0).toUpperCase() || '?')}
                      </div>
                    )}
                    <span className="notif-sender-name">
                      {isDeletedByAdmin(notif.type) ? 'Admin' : notif.sender?.name}
                    </span>
                    <span className="notif-type-label"
                      style={isDeletedByAdmin(notif.type) ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' } : {}}
                    >{getNotifTypeLabel(notif.type)}</span>
                  </div>

                  {/* Tampilan khusus untuk notif hapus oleh admin */}
                  {isDeletedByAdmin(notif.type) ? (
                    <div style={{
                      marginTop: '6px',
                      padding: '10px 14px',
                      background: 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>🗑️ Admin </span>
                      {notif.message}
                    </div>
                  ) : (
                    <p className="notif-message">
                      <strong>{notif.sender?.name}</strong> {notif.message}
                    </p>
                  )}

                  {/* Preview isi balasan atau judul thread (tergantung tipe notif) */}
                  {!isDeletedByAdmin(notif.type) && (
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Tampilkan preview isi balasan jika ada */}
                      {(notif.type === 'reply_thread' || notif.type === 'reply_reply') && notif.reply_preview ? (
                        <span className="notif-thread-title" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          💬 <span style={{ fontStyle: 'italic' }}>{notif.reply_preview}</span>
                          {notif.reply_images_count > 0 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'normal' }}>
                              · 📷 {notif.reply_images_count} gambar
                            </span>
                          )}
                        </span>
                      ) : notif.thread ? (
                        // Fallback: tampilkan judul thread (untuk like, dll)
                        <span className="notif-thread-title">📌 {notif.thread.title}</span>
                      ) : null}
                    </div>
                  )}
                  {/* Waktu di baris terpisah — tidak lagi nyambung dengan teks lain */}
                  <span className="notif-time" style={{ display: 'block', marginTop: '4px' }}>{formatTimeAgo(notif.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="pagination">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${page === meta.current_page ? 'active' : ''}`}
                onClick={() => fetchNotifications(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
