import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GUEST_LIMIT = 5;

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return 'https://forumkomunitas.xyz' + avatar;
};

const ThreadAvatar = ({ user, style, className }) => {
  const avatarUrl = getAvatarUrl(user?.avatar);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name}
        className={className || 'fp-card-avatar'}
        style={{ borderRadius: '50%', objectFit: 'cover', ...style }}
      />
    );
  }
  const avatarColors = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#ec4899,#f59e0b)',
    'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f97316,#ef4444)',
    'linear-gradient(135deg,#14b8a6,#6366f1)',
  ];
  const name = user?.name || '';
  const bg = name ? avatarColors[name.charCodeAt(0) % avatarColors.length] : avatarColors[0];
  return (
    <div className={className || 'fp-card-avatar'} style={{ background: bg, ...style }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="forum-card skeleton-card">
      <div className="skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <div className="skeleton-line" style={{ width: '25%', height: '11px', marginBottom: '10px' }} />
        <div className="skeleton-line" style={{ width: '75%', height: '16px', marginBottom: '8px' }} />
        <div className="skeleton-line" style={{ width: '55%', height: '12px', marginBottom: '14px' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="skeleton-line" style={{ width: '55px', height: '11px' }} />
          <div className="skeleton-line" style={{ width: '55px', height: '11px' }} />
        </div>
      </div>
    </div>
  );
}

export default function ThreadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchThreads(); }, [page, categoryId, search]);
  useEffect(() => { fetchCategories(); }, []);

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
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };



  // Untuk tamu: tampilkan 5 pertama normal, sisanya blur
  const isGuest = !user;
  const visibleThreads = isGuest ? threads.slice(0, GUEST_LIMIT) : threads;
  const blurredThreads = isGuest ? threads.slice(GUEST_LIMIT) : [];
  const showGatewall = isGuest && (threads.length > GUEST_LIMIT || (meta.total || 0) > GUEST_LIMIT);

  return (
    <div className="fp-page">
      {/* ── Header ── */}
      <div className="fp-header container">
        <div className="fp-header-left">
          <h1 className="fp-title">Forum Diskusi</h1>
          <p className="fp-subtitle">Diskusi, berbagi, dan terhubung dengan komunitas</p>
        </div>
        {user && (
          <Link to="/threads/create" className="fp-btn-create" id="create-thread-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Buat Thread
          </Link>
        )}
      </div>

      <div className="fp-body container">
        {/* ── Search ── */}
        <form className="fp-search" onSubmit={handleSearch}>
          <div className="fp-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position:'absolute', left:'14px', color:'var(--text-muted)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="search-threads"
              type="text"
              className="fp-search-input"
              placeholder="Cari thread..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="fp-search-clear"
                onClick={() => { setSearchInput(''); setSearch(''); }}>✕</button>
            )}
          </div>
          <button type="submit" className="fp-search-btn">Cari</button>
        </form>

        {/* ── Category Pills ── */}
        <div className="fp-cats">
          <button className={`fp-cat ${categoryId === '' ? 'active' : ''}`} onClick={() => { setCategoryId(''); setPage(1); }}>
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`fp-cat ${categoryId === String(cat.id) ? 'active' : ''}`}
              onClick={() => { setCategoryId(String(cat.id)); setPage(1); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Thread List ── */}
        <div className="fp-list">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : threads.length === 0 ? (
            <div className="fp-empty">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <div className="fp-empty-title">Belum ada thread</div>
              <div className="fp-empty-sub">
                {search ? `Tidak ada hasil untuk "${search}"` : 'Jadilah yang pertama memulai diskusi!'}
              </div>
              {user && <Link to="/threads/create" className="fp-btn-create" style={{ marginTop: '16px' }}>+ Buat Thread</Link>}
            </div>
          ) : (
            <>
              {/* Thread yang terlihat normal */}
              {visibleThreads.map((thread, idx) => (
                <Link to={`/threads/${thread.id}`} key={thread.id} className="fp-card-link"
                  style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="fp-card">
                    <ThreadAvatar user={thread.user} />
                    <div className="fp-card-body">
                      <div className="fp-card-meta">
                        <span className="fp-card-cat">{thread.category?.name || 'Umum'}</span>
                        <span className="fp-card-time">{formatDate(thread.created_at)}</span>
                      </div>
                      <h3 className="fp-card-title">{thread.title}</h3>
                      <p className="fp-card-excerpt">{thread.content}</p>
                      <div className="fp-card-footer">
                        <span className="fp-card-author">oleh <strong>{thread.user?.name}</strong></span>
                        <div className="fp-card-stats">
                          <span className="fp-card-stat">❤️ {thread.likes_count || 0}</span>
                          <span className="fp-card-stat">💬 {thread.replies_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    <svg className="fp-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              ))}

              {/* Thread yang di-blur untuk tamu */}
              {blurredThreads.length > 0 && (
                <div className="fp-blurred-section">
                  {blurredThreads.map((thread) => (
                    <div key={thread.id} className="fp-card fp-card-blurred">
                      <ThreadAvatar user={thread.user} />
                      <div className="fp-card-body">
                        <div className="fp-card-meta">
                          <span className="fp-card-cat">{thread.category?.name || 'Umum'}</span>
                        </div>
                        <h3 className="fp-card-title">{thread.title}</h3>
                        <p className="fp-card-excerpt">{thread.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gatewall overlay */}
              {showGatewall && (
                <div className="fp-gatewall">
                  <div className="fp-gatewall-icon">🔒</div>
                  <h3 className="fp-gatewall-title">Masuk untuk melihat semua diskusi</h3>
                  <p className="fp-gatewall-sub">
                    Daftarkan akunmu dan akses semua {meta.total || threads.length}+ thread secara gratis.
                  </p>
                  <div className="fp-gatewall-actions">
                    <Link to="/login" className="fp-btn-create">Masuk</Link>
                    <Link to="/register" className="fp-btn-outline">Daftar Gratis</Link>
                  </div>
                </div>
              )}

              {/* Pagination (hanya untuk yang sudah login) */}
              {user && meta.last_page > 1 && (
                <div className="fp-pagination">
                  <button className="fp-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) => p === '...' ? (
                      <span key={i} className="fp-page-dots">…</span>
                    ) : (
                      <button key={p} className={`fp-page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                  <button className="fp-page-btn" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
