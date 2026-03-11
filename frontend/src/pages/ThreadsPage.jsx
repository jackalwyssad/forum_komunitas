import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ThreadsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    fetchThreads();
  }, [page, categoryId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;

      const res = await api.get('/threads', { params });
      setThreads(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchThreads();
  };

  const handleCategoryFilter = (catId) => {
    setCategoryId(catId);
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="container main-content">
      <div className="page-header">
        <h1 className="page-title">💬 Forum Diskusi</h1>
        {user && (
          <Link to="/threads/create" className="btn btn-primary">
            + Buat Thread Baru
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Cari thread berdasarkan judul..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-threads"
        />
        <select
          className="form-select"
          value={categoryId}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          id="filter-category"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary">Cari</button>
      </form>

      {/* Thread List */}
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : threads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">Belum ada thread</h3>
          <p className="empty-state-desc">Jadilah yang pertama memulai diskusi!</p>
          {user && (
            <Link to="/threads/create" className="btn btn-primary">Buat Thread</Link>
          )}
        </div>
      ) : (
        <>
          {threads.map((thread) => (
            <Link to={`/threads/${thread.id}`} key={thread.id} style={{ textDecoration: 'none' }}>
              <div className="card thread-card">
                <div className="thread-votes">
                  <span className="thread-votes-count">{thread.likes_count || 0}</span>
                  <span className="thread-votes-label">likes</span>
                </div>
                <div className="thread-content">
                  <span className="thread-category">{thread.category?.name || 'Umum'}</span>
                  <h3 className="card-title">{thread.title}</h3>
                  <p className="thread-excerpt">{thread.content}</p>
                  <div className="thread-stats">
                    <span className="thread-stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      {thread.replies_count || 0} balasan
                    </span>
                    <span className="thread-stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {formatDate(thread.created_at)}
                    </span>
                    <span className="thread-stat">
                      oleh <strong style={{ color: 'var(--primary-400)', marginLeft: '4px' }}>{thread.user?.name}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={page >= meta.last_page}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
