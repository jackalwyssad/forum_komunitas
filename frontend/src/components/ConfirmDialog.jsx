import { useEffect } from 'react';

/**
 * Animated confirm dialog – replaces native window.confirm().
 *
 * Props:
 *   isOpen   : boolean
 *   title    : string
 *   message  : string
 *   onConfirm: () => void
 *   onCancel : () => void
 *   variant  : 'danger' | 'warning' | 'info'  (default 'danger')
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi',
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    danger:  { emoji: '🗑️', color: 'var(--danger)' },
    warning: { emoji: '⚠️', color: '#f59e0b' },
    info:    { emoji: 'ℹ️', color: 'var(--primary-400)' },
  };
  const { emoji, color } = icons[variant] || icons.danger;

  return (
    <div
      className="cdialog-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cdialog-title"
    >
      <div className="cdialog">
        {/* Icon */}
        <div className="cdialog-icon" style={{ background: `${color}1a`, color }}>
          <span>{emoji}</span>
        </div>

        {/* Content */}
        <h2 id="cdialog-title" className="cdialog-title">{title}</h2>
        <p className="cdialog-message">{message}</p>

        {/* Actions */}
        <div className="cdialog-actions">
          <button className="btn btn-ghost" onClick={onCancel} id="cdialog-cancel">
            Batal
          </button>
          <button
            className={variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            id="cdialog-confirm"
            autoFocus
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
