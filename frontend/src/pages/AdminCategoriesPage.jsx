import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_CONFIG = {
  pending:  { label: '🕐 Menunggu',  bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  approved: { label: '✅ Disetujui', bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)'  },
  rejected: { label: '❌ Ditolak',   bg: 'rgba(239,68,68,0.10)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
};

export default function AdminCategoriesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'requests'

  // ── Kategori ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_public: true });
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // ── Category Requests ─────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectNote, setRejectNote] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => { fetchCategories(); fetchRequests(); }, []);

  // Buka tab request otomatis jika dari notifikasi (?tab=requests)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'requests') {
      setActiveTab('requests');
    }
  }, [location.search]);

  // ── Kategori helpers ──────────────────────────────────────────────────────
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

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', is_public: true });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', is_public: cat.is_public });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => setConfirmDialog({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmDialog.id;
    setConfirmDialog({ open: false, id: null });
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleTogglePublic = async (cat) => {
    setTogglingId(cat.id);
    try {
      await api.put(`/categories/${cat.id}`, {
        name: cat.name,
        description: cat.description || '',
        is_public: !cat.is_public,
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Request helpers ───────────────────────────────────────────────────────
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await api.get('/category-requests');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/category-requests/${id}/approve`);
      fetchRequests();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui.');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (req) => {
    setRejectModal({ open: true, id: req.id, name: req.name });
    setRejectNote('');
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await api.post(`/category-requests/${rejectModal.id}/reject`, { admin_note: rejectNote });
      setRejectModal({ open: false, id: null, name: '' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak.');
    } finally {
      setRejectLoading(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">⚙️ Kelola Kategori</h1>
        {activeTab === 'categories' && (
          <button className="btn btn-primary" onClick={openCreateModal} id="add-category-btn">
            + Tambah Kategori
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {[
          { key: 'categories', label: '📂 Kategori', count: null },
          { key: 'requests',   label: '🔔 Request',  count: pendingCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary-400)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--primary-400)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 7px',
                lineHeight: '1.6',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: KATEGORI ──────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="admin-section">
          <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🔒 Admin Only</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Kategori <strong>Publik</strong> → terlihat oleh tamu (belum login)
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-desc">Belum ada kategori. Buat kategori pertama!</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="card category-card" style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    padding: '3px 10px', borderRadius: '999px',
                    fontSize: '0.68rem', fontWeight: 700,
                    background: cat.is_public ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                    color: cat.is_public ? '#10b981' : '#ef4444',
                    border: `1px solid ${cat.is_public ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
                  }}>
                    {cat.is_public ? '🌐 Publik' : '🔒 Login Only'}
                  </span>

                  <h3 className="category-name" style={{ paddingRight: '90px' }}>{cat.name}</h3>
                  <p className="category-desc">{cat.description || 'Tidak ada deskripsi'}</p>
                  <span className="category-count" style={{ marginBottom: '14px', display: 'block' }}>
                    {cat.threads_count || 0} threads
                  </span>

                  <div className="card-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      className={`btn btn-sm ${cat.is_public ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleTogglePublic(cat)}
                      disabled={togglingId === cat.id}
                      style={{ flex: '1', minWidth: '110px' }}
                    >
                      {togglingId === cat.id ? '...' : cat.is_public ? '🔒 Jadikan Privat' : '🌐 Jadikan Publik'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(cat)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>🗑 Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: REQUEST ───────────────────────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div>
          {requestsLoading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">Belum ada request</h3>
              <p className="empty-state-desc">Tidak ada usulan kategori dari user.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req) => {
                const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                const isPending = req.status === 'pending';
                return (
                  <div
                    key={req.id}
                    className="card"
                    style={{
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      borderColor: isPending ? 'rgba(245,158,11,0.3)' : 'var(--border-color)',
                    }}
                  >
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                          {req.name}
                        </span>
                        <span style={{
                          padding: '2px 10px', borderRadius: '999px',
                          fontSize: '0.68rem', fontWeight: 700,
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        }}>
                          {cfg.label}
                        </span>
                      </div>

                      {req.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                          {req.description}
                        </p>
                      )}

                      {req.admin_note && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#ef4444',
                        }}>
                          💬 Alasan penolakan: {req.admin_note}
                        </div>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Diusulkan oleh <strong>{req.user?.name ?? 'User'}</strong> ·{' '}
                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Actions (hanya untuk pending) */}
                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                          style={{
                            background: 'rgba(16,185,129,0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.3)',
                          }}
                        >
                          {processingId === req.id ? '...' : '✅ Setujui'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openRejectModal(req)}
                          disabled={processingId === req.id}
                        >
                          ❌ Tolak
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Tambah/Edit Kategori ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingId ? '✏️ Edit Kategori' : '➕ Tambah Kategori'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Nama Kategori</label>
                <input
                  id="cat-name" type="text" className="form-input"
                  placeholder="Contoh: Web Development"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                {errors.name && <p className="form-error">{errors.name[0]}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cat-desc">Deskripsi</label>
                <textarea
                  id="cat-desc" className="form-textarea"
                  placeholder="Deskripsi singkat tentang kategori..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Akses Tamu (belum login)</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_public: true })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                      borderColor: form.is_public ? '#10b981' : 'var(--border-color)',
                      background: form.is_public ? 'rgba(16,185,129,0.1)' : 'transparent',
                      color: form.is_public ? '#10b981' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    🌐 Publik
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, marginTop: '2px' }}>Tamu bisa melihat</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_public: false })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                      borderColor: !form.is_public ? '#6366f1' : 'var(--border-color)',
                      background: !form.is_public ? 'rgba(99,102,241,0.1)' : 'transparent',
                      color: !form.is_public ? 'var(--primary-400)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    🔒 Login Only
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, marginTop: '2px' }}>Harus login dulu</div>
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Tolak Request ────────────────────────────────────────────── */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, id: null, name: '' })} style={{ zIndex: 600 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 className="modal-title">❌ Tolak Usulan</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Tolak usulan kategori <strong>"{rejectModal.name}"</strong>?{' '}
              User akan mendapat notifikasi dengan alasan penolakan.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="reject-note">Alasan Penolakan (opsional)</label>
              <textarea
                id="reject-note"
                className="form-textarea"
                placeholder="Contoh: Kategori ini sudah ada atau terlalu spesifik..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                maxLength={300}
                rows={3}
              />
              <p className="form-hint">{rejectNote.length}/300 karakter</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRejectModal({ open: false, id: null, name: '' })}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={rejectLoading}
              >
                {rejectLoading ? 'Menolak...' : '❌ Tolak Usulan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title="Hapus Kategori"
        message="Yakin ingin menghapus kategori ini? Semua thread di dalamnya juga akan terhapus."
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}
