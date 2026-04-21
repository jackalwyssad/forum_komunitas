import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_public: true });
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

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

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua thread di dalamnya juga akan terhapus.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  // Toggle is_public langsung dari card
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

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container main-content">
      <div className="page-header">
        <h1 className="page-title">⚙️ Kelola Kategori</h1>
        <button className="btn btn-primary" onClick={openCreateModal} id="add-category-btn">
          + Tambah Kategori
        </button>
      </div>

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

                {/* Badge status */}
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

      {/* Modal */}
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

              {/* Toggle akses tamu */}
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
    </div>
  );
}
