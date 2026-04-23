import { useEffect, useState } from 'react';

/**
 * Animated Alert banner with optional auto-dismiss and close button.
 *
 * Props:
 *   type      : 'success' | 'error' | 'warning' | 'info'
 *   message   : string
 *   onClose   : () => void   (optional – shows ✕ button when provided)
 *   autoDismiss: number (ms) – auto-close after N ms (0 = never, default 0)
 */
export default function Alert({ type = 'success', message, onClose, autoDismiss = 0 }) {
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    if (!message) return;
    requestAnimationFrame(() => setVisible(true));
  }, [message]);

  // Auto dismiss
  useEffect(() => {
    if (!autoDismiss || !message) return;
    const t = setTimeout(() => handleClose(), autoDismiss);
    return () => clearTimeout(t);
  }, [autoDismiss, message]);

  if (!message) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300); // wait for exit animation
  };

  const config = {
    success: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      className: 'alert alert-success alert-animated',
    },
    error: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      className: 'alert alert-error alert-animated',
    },
    warning: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      className: 'alert alert-warning alert-animated',
    },
    info: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      className: 'alert alert-info alert-animated',
    },
  };

  const { icon, className } = config[type] || config.info;

  return (
    <div className={`${className} ${visible ? 'alert-visible' : 'alert-hidden'}`} role="alert">
      <span className="alert-icon">{icon}</span>
      <span className="alert-text">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={handleClose} aria-label="Tutup">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
