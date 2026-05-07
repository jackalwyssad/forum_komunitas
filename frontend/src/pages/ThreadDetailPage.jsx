import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { STORAGE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const BASE_URL = STORAGE_URL;
const getAvatarUrl = (a) => !a ? null : a.startsWith('http') ? a : BASE_URL + a;
const MAX_IMAGES = 5;

// Backend now returns full URL via Storage::disk('public')->url()
const getImgUrl = (img) => img?.url || null;

const UserAvatar = ({ user, className = 'reply-avatar' }) => {
  const url = getAvatarUrl(user?.avatar);
  if (url) return <img src={url} alt={user?.name} className={className} style={{ borderRadius: '50%', objectFit: 'cover', width: '36px', height: '36px' }} />;
  return <div className={className}>{user?.name?.charAt(0).toUpperCase()}</div>;
};

const StatusBadge = ({ status }) => {
  const map = { open: { label: 'Open', cls: 'status-open' }, solved: { label: '✅ Solved', cls: 'status-solved' }, closed: { label: '🔒 Closed', cls: 'status-closed' } };
  const s = map[status] || map.open;
  return <span className={`thread-status-badge ${s.cls}`}>{s.label}</span>;
};

// Lightbox sederhana
const Lightbox = ({ images, index, onClose }) => {
  const [cur, setCur] = useState(index);
  useEffect(() => { const h = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        {images.length > 1 && <button className="lightbox-nav lightbox-prev" onClick={() => setCur((c) => (c - 1 + images.length) % images.length)}>‹</button>}
        <img src={images[cur].url} alt="" className="lightbox-img" />
        {images.length > 1 && <button className="lightbox-nav lightbox-next" onClick={() => setCur((c) => (c + 1) % images.length)}>›</button>}
        {images.length > 1 && <div className="lightbox-dots">{images.map((_, i) => <span key={i} className={i === cur ? 'dot active' : 'dot'} onClick={() => setCur(i)} />)}</div>}
      </div>
    </div>
  );
};

// Grid gambar
const ImageGallery = ({ images }) => {
  const [lb, setLb] = useState(null);
  if (!images?.length) return null;
  // normalise: support both {url} and {path} from API
  const imgs = images.map((img) => ({ ...img, url: getImgUrl(img) }));
  return (
    <>
      <div className={`thread-image-grid count-${Math.min(imgs.length, 4)}`}>
        {imgs.slice(0, 4).map((img, i) => (
          <div key={img.id} className="thread-image-item" onClick={() => setLb(i)} style={{ position: 'relative' }}>
            <img src={img.url} alt="" />
            {i === 3 && imgs.length > 4 && <div className="thread-image-more">+{imgs.length - 4}</div>}
          </div>
        ))}
      </div>
      {lb !== null && <Lightbox images={imgs} index={lb} onClose={() => setLb(null)} />}
    </>
  );
};

// Image uploader reusable
const ImageUploader = ({ images, onChange, maxImages = MAX_IMAGES }) => {
  const ref = useRef(null);
  const handleSelect = (e) => {
    const files = Array.from(e.target.files);
    const rem = maxImages - images.length;
    const toAdd = files.slice(0, rem).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    onChange([...images, ...toAdd]);
    e.target.value = '';
  };
  const remove = (i) => { URL.revokeObjectURL(images[i].preview); onChange(images.filter((_, idx) => idx !== i)); };
  return (
    <div>
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, i) => (
            <div key={i} className="image-preview-item">
              <img src={img.preview} alt="" />
              <button type="button" className="image-preview-remove" onClick={() => remove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
      {images.length < maxImages && (
        <>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" multiple style={{ display: 'none' }} onChange={handleSelect} />
          <button type="button" className="image-upload-btn" onClick={() => ref.current?.click()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Foto {images.length > 0 ? `(${images.length}/${maxImages})` : ''}
          </button>
        </>
      )}
    </div>
  );
};

// Recursive reply renderer
function ReplyItem({ reply, allReplies, depth, user, isAdmin, onReplyTo, onEdit, onDelete, editingId, editContent, setEditContent, onSaveEdit, onCancelEdit, formatDate, editNewImages, setEditNewImages, editRemoveIds, toggleRemoveImage }) {
  const children = allReplies.filter((r) => r.parent_id === reply.id);
  const canEdit = user?.id === reply.user?.id && editingId !== reply.id;
  const canDelete = user && (user.id === reply.user?.id || isAdmin());

  return (
    <div className={`reply-tree-item ${depth > 0 ? 'reply-child' : ''}`} style={{ marginLeft: depth > 0 ? `${Math.min(depth, 3) * 20}px` : 0 }}>
      <div className={`reply-card ${reply.parent_id ? 'has-parent' : ''}`} id={`reply-${reply.id}`}>
        {reply.reply_to?.user && (
          <div className="reply-to-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            Membalas <span className="reply-to-name">@{reply.reply_to.user.name}</span>
          </div>
        )}
        <div className="reply-header">
          <div className="reply-author">
            <UserAvatar user={reply.user} />
            <div>
              <span className="reply-name">{reply.user?.name}</span>
              <span className="reply-time" style={{ marginLeft: '8px' }}>{formatDate(reply.created_at)}</span>
            </div>
          </div>
          <div className="card-actions">
            {user && editingId !== reply.id && (
              <button className="btn btn-ghost btn-sm reply-btn" onClick={() => onReplyTo(reply)}>↩️ Balas</button>
            )}
            {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => onEdit(reply)}>✏️</button>}
            {canDelete && <button className="btn btn-ghost btn-sm" onClick={() => onDelete(reply.id)} style={{ color: 'var(--danger)' }}>🗑</button>}
          </div>
        </div>

        {editingId === reply.id ? (
          <div>
            <textarea className="form-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
            
            {/* Existing images */}
            {reply.images?.length > 0 && (
              <div className="image-preview-grid" style={{ marginTop: '10px' }}>
                {reply.images.map((img) => {
                  const imgUrl = getImgUrl(img);
                  const isRemoved = editRemoveIds.includes(img.id);
                  return (
                    <div key={img.id} className={`image-preview-item ${isRemoved ? 'marked-remove' : ''}`} onClick={() => toggleRemoveImage(img.id)}>
                      {imgUrl && <img src={imgUrl} alt="" />}
                      {isRemoved ? <div className="image-remove-overlay">🗑 Hapus</div> : <div className="image-remove-hint">Klik hapus</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new images */}
            {(reply.images?.length - editRemoveIds.length) < MAX_IMAGES && (
              <div style={{ marginTop: '10px' }}>
                <ImageUploader images={editNewImages} onChange={setEditNewImages} maxImages={MAX_IMAGES - (reply.images?.length || 0) + editRemoveIds.length} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => onSaveEdit(reply.id)}>Simpan</button>
              <button className="btn btn-ghost btn-sm" onClick={onCancelEdit}>Batal</button>
            </div>
          </div>
        ) : (
          <>
            <p className="reply-content">{reply.content}</p>
            {reply.images?.length > 0 && <ImageGallery images={reply.images} />}
          </>
        )}
      </div>

      {/* Render children recursively */}
      {children.map((child) => (
        <ReplyItem key={child.id} reply={child} allReplies={allReplies} depth={depth + 1}
          user={user} isAdmin={isAdmin} onReplyTo={onReplyTo} onEdit={onEdit} onDelete={onDelete}
          editingId={editingId} editContent={editContent} setEditContent={setEditContent}
          onSaveEdit={onSaveEdit} onCancelEdit={onCancelEdit} formatDate={formatDate}
          editNewImages={editNewImages} setEditNewImages={setEditNewImages}
          editRemoveIds={editRemoveIds} toggleRemoveImage={toggleRemoveImage} />
      ))}
    </div>
  );
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', category_id: '' });
  const [editNewImages, setEditNewImages] = useState([]);
  const [editRemoveIds, setEditRemoveIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [editReplyNewImages, setEditReplyNewImages] = useState([]);
  const [editReplyRemoveIds, setEditReplyRemoveIds] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const replyFormRef = useRef(null);
  const replyInputRef = useRef(null);
  const [confirmThread, setConfirmThread] = useState(false);
  const [confirmReply, setConfirmReply] = useState({ open: false, id: null });
  const repliesRef = useRef([]);

  const [photosUploading, setPhotosUploading] = useState(false);

  useEffect(() => { fetchThread(); fetchCategories(); }, [id]);

  // Setelah navigasi dari halaman baru, cek apakah foto sedang diupload
  useEffect(() => {
    const justCreated = sessionStorage.getItem('thread_uploading_photos');
    if (justCreated === id) {
      setPhotosUploading(true);
      sessionStorage.removeItem('thread_uploading_photos');
      // Auto-refresh setiap 3 detik selama 30 detik untuk menangkap foto yang baru diupload
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await api.get(`/threads/${id}`);
          const imgs = res.data.data?.images || [];
          if (imgs.length > 0) {
            setThread(res.data.data);
            setPhotosUploading(false);
            clearInterval(interval);
          }
        } catch {}
        if (attempts >= 10) { setPhotosUploading(false); clearInterval(interval); }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  // Polling every 10s
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const res = await api.get(`/threads/${id}`);
        const fresh = res.data.replies || [];
        const currentIds = new Set(repliesRef.current.map((r) => r.id));
        const newReplies = fresh.filter((r) => !currentIds.has(r.id));
        if (newReplies.length > 0) {
          setReplies((prev) => { const m = [...prev, ...newReplies]; repliesRef.current = m; return m; });
          setThread((prev) => prev ? ({ ...prev, replies_count: (prev.replies_count || 0) + newReplies.length }) : prev);
        }
      } catch (_) {}
    };
    const iv = setInterval(poll, 10000);
    return () => clearInterval(iv);
  }, [id]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/threads/${id}`);
      setThread(res.data.data);
      const r = res.data.replies || [];
      setReplies(r); repliesRef.current = r;
    } catch { navigate('/forum'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data.data); } catch {}
  };

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/threads/${id}/like`);
      setThread((p) => ({ ...p, is_liked: res.data.is_liked, likes_count: res.data.likes_count }));
    } catch {}
  };

  const handleChangeStatus = async (status) => {
    try {
      await api.put(`/threads/${id}/status`, { status });
      setThread((p) => ({ ...p, status }));
    } catch {}
  };

  const handleReplyTo = (reply) => {
    setReplyingTo({ id: reply.id, userName: reply.user?.name });
    setTimeout(() => { replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); replyInputRef.current?.focus(); }, 100);
  };

  const cancelReplyTo = () => setReplyingTo(null);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', replyContent);
      fd.append('thread_id', id);
      if (replyingTo) fd.append('parent_id', replyingTo.id);
      replyImages.forEach((img) => fd.append('images[]', img.file));

      const res = await api.post('/replies', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newReply = res.data.data;
      setReplies((prev) => { const m = [...prev, newReply]; repliesRef.current = m; return m; });
      setReplyContent(''); setReplyingTo(null); setReplyImages([]);
      setThread((p) => ({ ...p, replies_count: (p.replies_count || 0) + 1 }));
    } catch (err) { console.error(err); }
    finally { setReplyLoading(false); }
  };

  const handleDeleteThread = () => setConfirmThread(true);
  const confirmDeleteThread = async () => {
    setConfirmThread(false);
    try { await api.delete(`/threads/${id}`); navigate('/forum'); } catch {}
  };

  const startEditThread = () => {
    setEditForm({ title: thread.title, content: thread.content, category_id: thread.category?.id || '' });
    setEditNewImages([]); setEditRemoveIds([]);
    setEditing(true);
  };

  const handleEditThread = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('content', editForm.content);
      fd.append('category_id', editForm.category_id);
      editRemoveIds.forEach((rid) => fd.append('remove_image_ids[]', rid));
      editNewImages.forEach((img) => fd.append('images[]', img.file));
      fd.append('_method', 'PUT');

      const res = await api.post(`/threads/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setThread(res.data.data); setEditing(false);
    } catch (err) { console.error(err); }
  };

  const toggleEditRemoveImage = (imgId) => {
    setEditRemoveIds((prev) => prev.includes(imgId) ? prev.filter((x) => x !== imgId) : [...prev, imgId]);
  };

  const handleDeleteReply = (replyId) => setConfirmReply({ open: true, id: replyId });
  const confirmDeleteReply = async () => {
    const replyId = confirmReply.id;
    setConfirmReply({ open: false, id: null });
    try {
      await api.delete(`/replies/${replyId}`);
      const getDesc = (pid) => { const kids = repliesRef.current.filter((r) => r.parent_id === pid).map((r) => r.id); return [...kids, ...kids.flatMap(getDesc)]; };
      const toRemove = [replyId, ...getDesc(replyId)];
      setReplies((prev) => { const f = prev.filter((r) => !toRemove.includes(r.id)); repliesRef.current = f; return f; });
      setThread((p) => ({ ...p, replies_count: Math.max((p.replies_count || toRemove.length) - toRemove.length, 0) }));
      window.dispatchEvent(new Event('notif-updated'));
    } catch {}
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content);
    setEditReplyNewImages([]);
    setEditReplyRemoveIds([]);
  };

  const toggleEditReplyRemoveImage = (id) => {
    setEditReplyRemoveIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleEditReply = async (replyId) => {
    try {
      const fd = new FormData();
      fd.append('content', editReplyContent);
      editReplyRemoveIds.forEach((rid) => fd.append('remove_image_ids[]', rid));
      editReplyNewImages.forEach((img) => fd.append('images[]', img.file));
      fd.append('_method', 'PUT');

      const res = await api.post(`/replies/${replyId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReplies((prev) => prev.map((r) => r.id === replyId ? res.data.data : r));
      setEditingReplyId(null);
    } catch {}
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyNewImages([]);
    setEditReplyRemoveIds([]);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const canEditThread = user && user.id === thread?.user?.id;
  const canDeleteThread = user && (user.id === thread?.user?.id || isAdmin());
  const isOwner = user && user.id === thread?.user?.id;

  // Top-level replies only (no parent)
  const topReplies = replies.filter((r) => !r.parent_id);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!thread) return null;

  return (
    <div className="container main-content">
      <div className="thread-detail">
        <button className="back-link" onClick={() => navigate('/forum')}>← Kembali ke Forum</button>

        {/* Edit Mode */}
        {editing ? (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="modal-title">Edit Thread</h3>
            <form onSubmit={handleEditThread}>
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input type="text" className="form-input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={editForm.category_id} onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })} required>
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Konten</label>
                <textarea className="form-textarea" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} required rows={6} />
              </div>

              {/* Existing images */}
              {thread.images?.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Foto Saat Ini (klik untuk hapus)</label>
                  <div className="image-preview-grid">
                    {thread.images.map((img) => {
                      const imgUrl = getImgUrl(img);
                      return (
                        <div key={img.id} className={`image-preview-item ${editRemoveIds.includes(img.id) ? 'marked-remove' : ''}`} onClick={() => toggleEditRemoveImage(img.id)}>
                          {imgUrl && <img src={imgUrl} alt="" />}
                          {editRemoveIds.includes(img.id)
                            ? <div className="image-remove-overlay">🗑 Hapus</div>
                            : <div className="image-remove-hint">Klik hapus</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add new images */}
              {(thread.images?.length - editRemoveIds.length) < MAX_IMAGES && (
                <div className="form-group">
                  <label className="form-label">Tambah Foto Baru</label>
                  <ImageUploader images={editNewImages} onChange={setEditNewImages} maxImages={MAX_IMAGES - (thread.images?.length || 0) + editRemoveIds.length} />
                </div>
              )}

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span className="thread-category">{thread.category?.name || 'Umum'}</span>
                <StatusBadge status={thread.status} />
              </div>
              <h1 className="thread-detail-title">{thread.title}</h1>
              <div className="thread-detail-info">
                <div className="thread-detail-author">
                  <UserAvatar user={thread.user} className="thread-detail-avatar" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{thread.user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(thread.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="thread-detail-content">{thread.content}</div>

            {/* Thread Images */}
            {thread.images?.length > 0 && (
              <div style={{ margin: '16px 0' }}>
                <ImageGallery images={thread.images} />
              </div>
            )}

            {/* Banner: foto sedang diupload di background */}
            {photosUploading && (!thread.images || thread.images.length === 0) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                background: '#6366f11a', border: '1px solid #6366f133',
                margin: '12px 0', fontSize: '0.85rem', color: 'var(--primary-400)',
              }}>
                <svg style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                📷 Foto sedang diupload di background... akan muncul sebentar lagi.
              </div>
            )}

            {/* Thread Actions */}
            <div className="thread-detail-actions">
              <button className={`btn-like ${thread.is_liked ? 'liked' : ''}`} onClick={handleLike}>
                {thread.is_liked ? '❤️' : '🤍'} {thread.likes_count || 0} Like
              </button>
              {canEditThread && <button className="btn btn-ghost btn-sm" onClick={startEditThread}>✏️ Edit</button>}
              {canDeleteThread && <button className="btn btn-danger btn-sm" onClick={handleDeleteThread}>🗑 Hapus</button>}

              {/* Status changer — hanya pemilik */}
              {isOwner && (
                <div className="status-changer">
                  {thread.status !== 'solved' && (
                    <button className="btn-status btn-solved" onClick={() => handleChangeStatus('solved')}>✅ Tandai Solved</button>
                  )}
                  {thread.status !== 'closed' && (
                    <button className="btn-status btn-closed" onClick={() => handleChangeStatus('closed')}>🔒 Tutup Thread</button>
                  )}
                  {thread.status !== 'open' && (
                    <button className="btn-status btn-reopen" onClick={() => handleChangeStatus('open')}>🔓 Buka Kembali</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Replies */}
        <div className="replies-section">
          <h2 className="replies-title">Balasan <span className="replies-count">{replies.length}</span></h2>

          {topReplies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              allReplies={replies}
              depth={0}
              user={user}
              isAdmin={isAdmin}
              onReplyTo={handleReplyTo}
              onEdit={startEditReply}
              onDelete={handleDeleteReply}
              editingId={editingReplyId}
              editContent={editReplyContent}
              setEditContent={setEditReplyContent}
              onSaveEdit={handleEditReply}
              onCancelEdit={cancelEditReply}
              formatDate={formatDate}
              editNewImages={editReplyNewImages}
              setEditNewImages={setEditReplyNewImages}
              editRemoveIds={editReplyRemoveIds}
              toggleRemoveImage={toggleEditReplyRemoveImage}
            />
          ))}

          {/* Reply Form */}
          {user ? (
            <div className="card" style={{ marginTop: '20px' }} ref={replyFormRef}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Tulis Balasan</h3>

              {replyingTo && (
                <div className="reply-to-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
                  Membalas <span className="reply-to-name">@{replyingTo.userName}</span>
                  <button className="reply-to-cancel" onClick={cancelReplyTo}>✕</button>
                </div>
              )}

              <form onSubmit={handleReply}>
                <div className="form-group">
                  <textarea
                    ref={replyInputRef}
                    className="form-textarea"
                    placeholder={replyingTo ? `Balas @${replyingTo.userName}...` : 'Tulis balasan Anda...'}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required rows={4}
                    id="reply-content"
                  />
                </div>

                <ImageUploader images={replyImages} onChange={setReplyImages} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={replyLoading} id="submit-reply">
                    {replyLoading ? 'Mengirim...' : '📨 Kirim Balasan'}
                  </button>
                  {replyingTo && <button type="button" className="btn btn-ghost btn-sm" onClick={cancelReplyTo}>Batal Reply</button>}
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Login untuk membalas thread ini</p>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog isOpen={confirmThread} title="Hapus Thread" message="Yakin ingin menghapus thread ini?" variant="danger" onConfirm={confirmDeleteThread} onCancel={() => setConfirmThread(false)} />
      <ConfirmDialog isOpen={confirmReply.open} title="Hapus Balasan" message="Yakin ingin menghapus balasan ini?" variant="danger" onConfirm={confirmDeleteReply} onCancel={() => setConfirmReply({ open: false, id: null })} />
    </div>
  );
}
