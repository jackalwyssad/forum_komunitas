import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateThreadPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category_id: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post('/threads', form);
      navigate(`/threads/${res.data.data.id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button className="back-link" onClick={() => navigate('/')}>
          ← Kembali ke Forum
        </button>

        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
            ✍️ Buat Thread Baru
          </h1>

          <form onSubmit={handleSubmit} id="create-thread-form">
            <div className="form-group">
              <label className="form-label" htmlFor="thread-title">Judul Thread</label>
              <input
                id="thread-title"
                type="text"
                className="form-input"
                placeholder="Tulis judul thread yang menarik..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              {errors.title && <p className="form-error">{errors.title[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="thread-category">Kategori</label>
              <select
                id="thread-category"
                className="form-select"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="form-error">{errors.category_id[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="thread-content">Konten</label>
              <textarea
                id="thread-content"
                className="form-textarea"
                placeholder="Tulis konten diskusi Anda..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={8}
              />
              {errors.content && <p className="form-error">{errors.content[0]}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="submit-thread"
              >
                {loading ? 'Mempublish...' : '🚀 Publish Thread'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
