import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TITLE_MIN = 10;
const TITLE_MAX = 255;
const CONTENT_MIN = 30;

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

  const titleLen = form.title.length;
  const contentLen = form.content.length;
  const titleOk = titleLen >= TITLE_MIN && titleLen <= TITLE_MAX;
  const contentOk = contentLen >= CONTENT_MIN;

  const getCounterColor = (current, min, max) => {
    if (current === 0) return 'var(--text-muted)';
    if (current < min) return '#f59e0b';
    if (max && current > max) return '#ef4444';
    return '#10b981';
  };

  return (
    <div className="container main-content">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button className="back-link" onClick={() => navigate('/forum')}>
          ← Kembali ke Forum
        </button>

        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
            ✍️ Buat Thread Baru
          </h1>

          <form onSubmit={handleSubmit} id="create-thread-form">
            {/* Judul */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="thread-title" style={{ margin: 0 }}>
                  Judul Thread
                </label>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: getCounterColor(titleLen, TITLE_MIN, TITLE_MAX),
                  transition: 'color 0.2s',
                }}>
                  {titleLen}/{TITLE_MAX}
                  {titleLen > 0 && titleLen < TITLE_MIN && ` (min ${TITLE_MIN})`}
                </span>
              </div>
              <input
                id="thread-title"
                type="text"
                className="form-input"
                placeholder="Tulis judul thread yang menarik... (min 10 karakter)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={TITLE_MAX}
                required
                style={{
                  borderColor: titleLen > 0 && !titleOk ? '#f59e0b' : undefined,
                  transition: 'border-color 0.2s',
                }}
              />
              {errors.title && <p className="form-error">{errors.title[0]}</p>}
              {!errors.title && titleLen > 0 && titleLen < TITLE_MIN && (
                <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠ Judul terlalu pendek. Tambah {TITLE_MIN - titleLen} karakter lagi.
                </p>
              )}
            </div>

            {/* Kategori */}
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

            {/* Konten */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="thread-content" style={{ margin: 0 }}>
                  Konten
                </label>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: getCounterColor(contentLen, CONTENT_MIN, null),
                  transition: 'color 0.2s',
                }}>
                  {contentLen} karakter
                  {contentLen > 0 && contentLen < CONTENT_MIN && ` (min ${CONTENT_MIN})`}
                </span>
              </div>
              <textarea
                id="thread-content"
                className="form-textarea"
                placeholder="Tulis konten diskusi Anda... (min 30 karakter)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={8}
                style={{
                  borderColor: contentLen > 0 && !contentOk ? '#f59e0b' : undefined,
                  transition: 'border-color 0.2s',
                }}
              />
              {errors.content && <p className="form-error">{errors.content[0]}</p>}
              {!errors.content && contentLen > 0 && contentLen < CONTENT_MIN && (
                <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠ Konten terlalu pendek. Tambah {CONTENT_MIN - contentLen} karakter lagi.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/forum')}>
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
