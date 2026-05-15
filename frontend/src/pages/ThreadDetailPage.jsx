import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { STORAGE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Preset alasan hapus (admin) ─────────────────────────────────────────────
const PRESET_REASONS = [
  'Konten melanggar aturan komunitas',
  'Spam atau iklan tidak sah',
  'Konten tidak pantas / mengandung SARA',
  'Duplikat thread yang sudah ada',
  'Informasi palsu / hoaks',
  'Lainnya',
];

// ── Modal Alasan Hapus ─────────────────────────────────────────────────────
function DeleteReasonModal({ target, onConfirm, onCancel, loading }) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const isOther = selected === 'Lainnya';
  const finalReason = isOther ? custom.trim() : selected;
  const canSubmit = selected && (!isOther || custom.trim().length > 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🗑</div>
          <div>
            <h2 className="modal-title" style={{ marginBottom: '2px' }}>Hapus Konten</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Alasan akan dikirim sebagai notifikasi ke pengguna</p>
          </div>
        </div>

        <div style={{ margin: '14px 0', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            {target?.type === 'thread' ? '🧵 Thread' : '💬 Komentar'}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {target?.title}
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label">Pilih Alasan <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {PRESET_REASONS.map((r) => (
              <button
                key={r} type="button"
                onClick={() => { setSelected(r); if (r !== 'Lainnya') setCustom(''); }}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: '8px',
                  border: `1.5px solid ${selected === r ? 'rgba(239,68,68,0.5)' : 'var(--border-color)'}`,
                  background: selected === r ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: selected === r ? '#ef4444' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
                  fontWeight: selected === r ? 600 : 400, transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${selected === r ? '#ef4444' : 'var(--border-color)'}`, background: selected === r ? '#ef4444' : 'transparent', transition: 'all 0.15s' }} />
                {r}
              </button>
            ))}
          </div>
        </div>

        {isOther && (
          <div className="form-group">
            <label className="form-label">Tulis alasan spesifik <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea className="form-textarea" placeholder="Jelaskan alasan secara detail..." value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={400} rows={3} autoFocus />
            <p className="form-hint">{custom.length}/400 karakter</p>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>Batal</button>
          <button type="button" className="btn btn-danger" onClick={() => onConfirm(finalReason)} disabled={!canSubmit || loading}>
            {loading ? 'Menghapus...' : '🗑 Hapus & Kirim Notifikasi'}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // ── Skeleton saat reply sedang dikirim (optimistic pending) ────────────────
  if (reply._pending) {
    return (
      <div className={`reply-tree-item ${depth > 0 ? 'reply-child' : ''}`} style={{ marginLeft: depth > 0 ? `${Math.min(depth, 3) * 20}px` : 0 }}>
        <div className="reply-card" style={{ opacity: 0.75 }}>
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
                <span className="reply-time" style={{ marginLeft: '8px' }}>Baru saja</span>
              </div>
            </div>
          </div>
          <p className="reply-content">{reply.content}</p>
          {/* Preview gambar (blob URL) selagi upload */}
          {reply._previewImages?.length > 0 && (
            <div className="image-preview-grid" style={{ marginTop: '10px', pointerEvents: 'none' }}>
              {reply._previewImages.map((src, i) => (
                <div key={i} className="image-preview-item" style={{ opacity: 0.7 }}>
                  <img src={src} alt="" />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', borderRadius: '8px' }}>
                    <svg style={{ animation: 'spin 1.2s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <svg style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Mengirim balasan...
          </div>
        </div>
      </div>
    );
  }

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
  // Modal alasan hapus (admin)
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null, title: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Banner thread dihapus admin
  const [threadDeleted, setThreadDeleted] = useState(false);
  const repliesRef = useRef([]);

  useEffect(() => { fetchThread(); fetchCategories(); }, [id]);

  // Polling every 10s — deteksi reply baru dari user lain & thread dihapus admin
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const res = await api.get(`/threads/${id}`);
        const fresh = res.data.replies || [];
        // Kecualikan pending replies (kiriman user sendiri yg sedang loading)
        const realIds = new Set(repliesRef.current.filter((r) => !r._pending).map((r) => r.id));
        const newReplies = fresh.filter((r) => !realIds.has(r.id));
        if (newReplies.length > 0) {
          setReplies((prev) => {
            // Simpan pending di akhir, sisipkan reply nyata sebelumnya
            const pending = prev.filter((r) => r._pending);
            const real = prev.filter((r) => !r._pending);
            const realIds2 = new Set(real.map((r) => r.id));
            const toAdd = newReplies.filter((r) => !realIds2.has(r.id));
            const m = [...real, ...toAdd, ...pending];
            repliesRef.current = m;
            return m;
          });
          setThread((prev) => prev ? ({ ...prev, replies_count: (prev.replies_count || 0) + newReplies.length }) : prev);
        }
      } catch (err) {
        // Jika thread sudah dihapus (404), tampilkan banner dan redirect
        if (err.response?.status === 404) {
          setThreadDeleted(true);
          setTimeout(() => navigate('/forum'), 4000);
        }
      }
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

    // Simpan data form sebelum di-clear
    const savedContent = replyContent;
    const savedImages = [...replyImages];
    const savedReplyingTo = replyingTo;

    // Buat pending placeholder — tampil langsung sebagai skeleton
    const pendingId = `pending_${Date.now()}`;
    const pendingReply = {
      id: pendingId,
      _pending: true,
      content: savedContent,
      user: user,
      created_at: new Date().toISOString(),
      parent_id: savedReplyingTo?.id || null,
      images: [],
      // Preview blob URL agar gambar langsung terlihat meski belum diupload
      _previewImages: savedImages.map((img) => img.preview),
      reply_to: savedReplyingTo ? { user: { name: savedReplyingTo.userName } } : null,
    };

    // Tambahkan pending ke state — muncul langsung
    setReplies((prev) => { const m = [...prev, pendingReply]; repliesRef.current = m; return m; });
    setThread((p) => ({ ...p, replies_count: (p.replies_count || 0) + 1 }));

    // Clear form segera agar user bisa mulai tulis balasan baru
    setReplyContent('');
    setReplyingTo(null);
    setReplyImages([]);

    setReplyLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', savedContent);
      fd.append('thread_id', id);
      if (savedReplyingTo) fd.append('parent_id', savedReplyingTo.id);
      savedImages.forEach((img) => fd.append('images[]', img.file));

      const res = await api.post('/replies', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newReply = res.data.data;

      // Ganti pending dengan data asli (beserta gambar yg sudah tersimpan)
      setReplies((prev) => {
        const m = prev.map((r) => r.id === pendingId ? newReply : r);
        repliesRef.current = m;
        return m;
      });
    } catch (err) {
      console.error(err);
      // Hapus pending jika gagal
      setReplies((prev) => { const m = prev.filter((r) => r.id !== pendingId); repliesRef.current = m; return m; });
      setThread((p) => ({ ...p, replies_count: Math.max((p.replies_count || 1) - 1, 0) }));
    } finally {
      setReplyLoading(false);
    }
  };

  // Hapus thread — jika admin hapus thread orang lain, tampilkan modal alasan
  const handleDeleteThread = () => {
    const isOwnerDeleting = user?.id === thread?.user?.id;
    if (isAdmin() && !isOwnerDeleting) {
      setDeleteModal({ open: true, type: 'thread', id: thread.id, title: thread.title });
    } else {
      setConfirmThread(true);
    }
  };

  const confirmDeleteThread = async () => {
    setConfirmThread(false);
    try { await api.delete(`/threads/${id}`); navigate('/forum'); } catch {}
  };

  // Eksekusi hapus thread oleh admin (dengan reason)
  const executeAdminDeleteThread = async (reason) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/threads/${deleteModal.id}`, { data: { reason } });
      setDeleteModal({ open: false, type: null, id: null, title: '' });
      navigate('/forum');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus thread.');
    } finally {
      setDeleteLoading(false);
    }
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

  // Hapus reply — jika admin hapus reply orang lain, tampilkan modal alasan
  const handleDeleteReply = (replyId) => {
    const targetReply = replies.find((r) => r.id === replyId);
    const isOwnerDeleting = user?.id === targetReply?.user?.id;
    if (isAdmin() && !isOwnerDeleting) {
      const preview = targetReply?.content?.slice(0, 60) + (targetReply?.content?.length > 60 ? '...' : '');
      setDeleteModal({ open: true, type: 'reply', id: replyId, title: preview || 'Komentar ini' });
    } else {
      setConfirmReply({ open: true, id: replyId });
    }
  };

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

  // Eksekusi hapus reply oleh admin (dengan reason)
  const executeAdminDeleteReply = async (reason) => {
    const replyId = deleteModal.id;
    setDeleteLoading(true);
    try {
      await api.delete(`/replies/${replyId}`, { data: { reason } });
      const getDesc = (pid) => { const kids = repliesRef.current.filter((r) => r.parent_id === pid).map((r) => r.id); return [...kids, ...kids.flatMap(getDesc)]; };
      const toRemove = [replyId, ...getDesc(replyId)];
      setReplies((prev) => { const f = prev.filter((r) => !toRemove.includes(r.id)); repliesRef.current = f; return f; });
      setThread((p) => ({ ...p, replies_count: Math.max((p.replies_count || toRemove.length) - toRemove.length, 0) }));
      setDeleteModal({ open: false, type: null, id: null, title: '' });
      window.dispatchEvent(new Event('notif-updated'));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus komentar.');
    } finally {
      setDeleteLoading(false);
    }
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

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!thread) return null;

  // Banner overlay: thread dihapus admin saat user masih di halaman
  if (threadDeleted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,15,26,0.97)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem' }}>🗑️</div>
        <h2 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 800 }}>Thread Telah Dihapus</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', lineHeight: 1.6 }}>
          Thread ini telah dihapus oleh Admin. Kamu akan dialihkan kembali ke halaman Forum secara otomatis.
        </p>
        <div style={{
          padding: '10px 20px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '0.85rem', fontWeight: 600,
        }}>
          ⏳ Mengalihkan ke Forum dalam beberapa detik...
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/forum')}
          style={{ marginTop: '8px' }}
        >
          ← Kembali ke Forum Sekarang
        </button>
      </div>
    );
  }

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

      {/* Modal Alasan Hapus — khusus admin hapus konten orang lain */}
      {deleteModal.open && (
        <DeleteReasonModal
          target={deleteModal}
          onConfirm={deleteModal.type === 'thread' ? executeAdminDeleteThread : executeAdminDeleteReply}
          onCancel={() => setDeleteModal({ open: false, type: null, id: null, title: '' })}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
