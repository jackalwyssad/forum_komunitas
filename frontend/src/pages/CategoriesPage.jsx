import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CONFIG = {
  pending:  { label: '🕐 Menunggu',   bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.3)'  },
  approved: { label: '✅ Disetujui',   bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: 'rgba(16,185,129,0.3)'  },
  rejected: { label: '❌ Ditolak',     bg: 'rgba(239,68,68,0.10)',   color: '#ef4444',  border: 'rgba(239,68,68,0.25)'  },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState(null);

  // Modal usulkan
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Riwayat request user
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Cek apakah sudah login
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      api.get('/me')
        .then((res) => {
          setUser(res.data.user ?? res.data);
          fetchMyRequests();
        })
        .catch(() => setUser(null));
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await api.get('/category-requests');
      setMyRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const openModal = () => {
    setForm({ name: '', description: '' });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);
    try {
      const res = await api.post('/category-requests', form);
      setFormSuccess(res.data.message);
      setForm({ name: '', description: '' });
      fetchMyRequests();
      // tutup modal setelah 1.5 detik
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors ?? {})[0]?.[0] ||
        'Gagal mengirim usulan.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container main-content">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">📂 Kategori</h1>
        {user && (
          <button
            className="btn btn-primary btn-sm"
            onClick={openModal}
            id="usulkan-kategori-btn"
            style={{ gap: '6px' }}
          >
            💡 Usulkan Kategori
          </button>
        )}
      </div>

      {/* Grid Kategori */}
      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3 className="empty-state-title">Belum ada kategori</h3>
          <p className="empty-state-desc">Admin belum membuat kategori apapun.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/forum?category_id=${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
              <div className="card category-card">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.description || 'Tidak ada deskripsi'}</p>
                <span className="category-count">{cat.threads_count || 0} threads</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Riwayat Request User */}
      {user && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📋 Riwayat Usulan Saya
          </h2>

          {requestsLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat...</div>
          ) : myRequests.length === 0 ? (
            <div style={{
              padding: '20px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}>
              Kamu belum pernah mengusulkan kategori.{' '}
              <button
                onClick={openModal}
                style={{ color: 'var(--primary-400)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Usulkan sekarang!
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myRequests.map((req) => {
                const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                return (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '16px 20px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {req.name}
                      </div>
                      {req.description && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '3px' }}>
                          {req.description}
                        </div>
                      )}
                      {req.status === 'rejected' && req.admin_note && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#ef4444',
                        }}>
                          💬 Alasan: {req.admin_note}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Usulkan Kategori */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{ zIndex: 500 }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h2 className="modal-title">💡 Usulkan Kategori Baru</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Usulan kamu akan ditinjau oleh admin. Kamu akan mendapat notifikasi setelah diproses.
            </p>

            {formSuccess && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '0.875rem',
                marginBottom: '16px',
              }}>
                ✅ {formSuccess}
              </div>
            )}

            {formError && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '16px',
              }}>
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="req-name">Nama Kategori</label>
                <input
                  id="req-name"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Machine Learning"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                  required
                />
                <p className="form-hint">{form.name.length}/100 karakter</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="req-desc">Deskripsi (opsional)</label>
                <textarea
                  id="req-desc"
                  className="form-textarea"
                  placeholder="Jelaskan kenapa kategori ini dibutuhkan..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
                <p className="form-hint">{form.description.length}/500 karakter</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading || !!formSuccess}>
                  {formLoading ? 'Mengirim...' : '📨 Kirim Usulan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
