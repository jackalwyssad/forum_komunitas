import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
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

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
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
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua thread di dalamnya juga akan terhapus.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container main-content">
      <div className="page-header">
        <h1 className="page-title">⚙️ Kelola Kategori</h1>
        <button className="btn btn-primary" onClick={openCreateModal} id="add-category-btn">
          + Tambah Kategori
        </button>
      </div>

      <div className="admin-section">
        <div className="admin-section-title">🔒 Admin Only</div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">Belum ada kategori. Buat kategori pertama!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="card category-card">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.description || 'Tidak ada deskripsi'}</p>
                <span className="category-count" style={{ marginBottom: '12px', display: 'block' }}>
                  {cat.threads_count || 0} threads
                </span>
                <div className="card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(cat)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>
                    🗑 Hapus
                  </button>
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
                  id="cat-name"
                  type="text"
                  className="form-input"
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
                  id="cat-desc"
                  className="form-textarea"
                  placeholder="Deskripsi singkat tentang kategori..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Batal
                </button>
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
