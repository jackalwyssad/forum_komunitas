import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'https://forumkomunitas.xyz';
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return BASE_URL + avatar;
};

const UserAvatar = ({ user, className = 'reply-avatar' }) => {
  const avatarUrl = getAvatarUrl(user?.avatar);
  if (avatarUrl) {
    return <img src={avatarUrl} alt={user?.name} className={className} style={{ borderRadius: '50%', objectFit: 'cover', width: '36px', height: '36px' }} />;
  }
  return <div className={className}>{user?.name?.charAt(0).toUpperCase()}</div>;
};

export default function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', category_id: '' });
  const [categories, setCategories] = useState([]);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // Reply-to state
  const [replyingTo, setReplyingTo] = useState(null); // { id, userName }
  const replyFormRef = useRef(null);
  const replyInputRef = useRef(null);

  useEffect(() => {
    fetchThread();
    fetchCategories();
  }, [id]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/threads/${id}`);
      setThread(res.data.data);
      setReplies(res.data.replies);
    } catch (err) {
      navigate('/forum');
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

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/threads/${id}/like`);
      setThread((prev) => ({
        ...prev,
        is_liked: res.data.is_liked,
        likes_count: res.data.likes_count,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ========== REPLY WITH @MENTION ==========
  const handleReplyTo = (reply) => {
    setReplyingTo({ id: reply.id, userName: reply.user?.name });
    // Scroll to reply form
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replyInputRef.current?.focus();
    }, 100);
  };

  const cancelReplyTo = () => {
    setReplyingTo(null);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const payload = {
        content: replyContent,
        thread_id: id,
      };
      if (replyingTo) {
        payload.parent_id = replyingTo.id;
      }

      const res = await api.post('/replies', payload);
      setReplies([...replies, res.data.data]);
      setReplyContent('');
      setReplyingTo(null);
      setThread((prev) => ({ ...prev, replies_count: (prev.replies_count || 0) + 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Yakin ingin menghapus thread ini?')) return;
    try {
      await api.delete(`/threads/${id}`);
      navigate('/forum');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditThread = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/threads/${id}`, editForm);
      setThread(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditThread = () => {
    setEditForm({
      title: thread.title,
      content: thread.content,
      category_id: thread.category?.id || '',
    });
    setEditing(true);
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Yakin ingin menghapus reply ini? Semua balasan di bawahnya juga akan terhapus.')) return;
    try {
      await api.delete(`/replies/${replyId}`);

      // Collect all descendant IDs recursively
      const getDescendantIds = (parentId) => {
        const childIds = replies
          .filter((r) => r.parent_id === parentId)
          .map((r) => r.id);
        let allIds = [...childIds];
        childIds.forEach((cid) => {
          allIds = [...allIds, ...getDescendantIds(cid)];
        });
        return allIds;
      };

      const idsToRemove = [replyId, ...getDescendantIds(replyId)];
      const remaining = replies.filter((r) => !idsToRemove.includes(r.id));
      setReplies(remaining);
      setThread((prev) => ({
        ...prev,
        replies_count: Math.max((prev.replies_count || idsToRemove.length) - idsToRemove.length, 0),
      }));

      // Refresh notification badge
      window.dispatchEvent(new Event('notif-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content);
  };

  const handleEditReply = async (replyId) => {
    try {
      const res = await api.put(`/replies/${replyId}`, { content: editReplyContent });
      setReplies(replies.map((r) => (r.id === replyId ? res.data.data : r)));
      setEditingReplyId(null);
      setEditReplyContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Find the reply being replied to (for display)
  const getParentReply = (reply) => {
    if (reply.reply_to?.user) return reply.reply_to.user.name;
    if (reply.parent_id) {
      const parent = replies.find((r) => r.id === reply.parent_id);
      return parent?.user?.name || 'Unknown';
    }
    return null;
  };

  const canEditThread = user && (user.id === thread?.user?.id);
  const canDeleteThread = user && (user.id === thread?.user?.id || isAdmin());

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!thread) return null;

  return (
    <div className="container main-content">
      <div className="thread-detail">
        <button className="back-link" onClick={() => navigate('/forum')}>
          ← Kembali ke Forum
        </button>

        {/* Edit Mode */}
        {editing ? (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="modal-title">Edit Thread</h3>
            <form onSubmit={handleEditThread}>
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Konten</label>
                <textarea
                  className="form-textarea"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  required
                  rows={6}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="thread-detail-header">
              <span className="thread-category">{thread.category?.name || 'Umum'}</span>
              <h1 className="thread-detail-title">{thread.title}</h1>
              <div className="thread-detail-info">
                <div className="thread-detail-author">
                  <UserAvatar user={thread.user} className="thread-detail-avatar" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{thread.user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(thread.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thread Content */}
            <div className="thread-detail-content">{thread.content}</div>

            {/* Thread Actions */}
            <div className="thread-detail-actions">
              <button
                className={`btn-like ${thread.is_liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                {thread.is_liked ? '❤️' : '🤍'} {thread.likes_count || 0} Like
              </button>

              {canEditThread && (
                <button className="btn btn-ghost btn-sm" onClick={startEditThread}>
                  ✏️ Edit
                </button>
              )}
              {canDeleteThread && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteThread}>
                  🗑 Hapus
                </button>
              )}
            </div>
          </>
        )}

        {/* Replies */}
        <div className="replies-section">
          <h2 className="replies-title">
            Balasan <span className="replies-count">{replies.length}</span>
          </h2>

          {replies.map((reply) => {
            const parentUserName = getParentReply(reply);

            return (
              <div key={reply.id} className={`reply-card ${parentUserName ? 'has-parent' : ''}`}>
                {/* Reply-to indicator */}
                {parentUserName && (
                  <div className="reply-to-indicator">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 14 4 9 9 4"/>
                      <path d="M20 20v-7a4 4 0 00-4-4H4"/>
                    </svg>
                    Membalas <span className="reply-to-name">@{parentUserName}</span>
                  </div>
                )}

                <div className="reply-header">
                  <div className="reply-author">
                    <UserAvatar user={reply.user} className="reply-avatar" />
                    <div>
                      <span className="reply-name">{reply.user?.name}</span>
                      <span className="reply-time" style={{ marginLeft: '8px' }}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    {/* Reply-to button */}
                    {user && editingReplyId !== reply.id && (
                      <button
                        className="btn btn-ghost btn-sm reply-btn"
                        onClick={() => handleReplyTo(reply)}
                        title={`Balas ${reply.user?.name}`}
                      >
                        ↩️ Balas
                      </button>
                    )}
                    {user && user.id === reply.user?.id && editingReplyId !== reply.id && (
                      <button className="btn btn-ghost btn-sm" onClick={() => startEditReply(reply)}>
                        ✏️
                      </button>
                    )}
                    {user && (user.id === reply.user?.id || isAdmin()) && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteReply(reply.id)}
                        style={{ color: 'var(--danger)' }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>

                {editingReplyId === reply.id ? (
                  <div>
                    <textarea
                      className="form-textarea"
                      value={editReplyContent}
                      onChange={(e) => setEditReplyContent(e.target.value)}
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditReply(reply.id)}>
                        Simpan
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingReplyId(null)}>
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="reply-content">{reply.content}</p>
                )}
              </div>
            );
          })}

          {/* Reply Form */}
          {user ? (
            <div className="card" style={{ marginTop: '20px' }} ref={replyFormRef}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Tulis Balasan</h3>

              {/* Reply-to badge */}
              {replyingTo && (
                <div className="reply-to-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 14 4 9 9 4"/>
                    <path d="M20 20v-7a4 4 0 00-4-4H4"/>
                  </svg>
                  Membalas <span className="reply-to-name">@{replyingTo.userName}</span>
                  <button
                    className="reply-to-cancel"
                    onClick={cancelReplyTo}
                    title="Batal membalas"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleReply}>
                <div className="form-group">
                  <textarea
                    ref={replyInputRef}
                    className="form-textarea"
                    placeholder={replyingTo ? `Balas @${replyingTo.userName}...` : 'Tulis balasan Anda di sini...'}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                    rows={4}
                    id="reply-content"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={replyLoading}
                    id="submit-reply"
                  >
                    {replyLoading ? 'Mengirim...' : '📨 Kirim Balasan'}
                  </button>
                  {replyingTo && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={cancelReplyTo}>
                      Batal Reply
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Login untuk membalas thread ini
              </p>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
