// Snackbar — bottom glass pill with a message + optional action (e.g. Undo).
// Presentational only: the host owns the timer / undo buffer; this renders the pill.
// Positioned absolutely within the phone frame, above the FAB footer.
export default function Snackbar({ open = true, message, actionLabel = 'Undo', onAction }) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 46, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 16px', borderRadius: 'var(--radius-xl)',
        background: 'var(--glass-popover)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(var(--cs-outline-rgb),0.5)',
        boxShadow: '0 12px 32px rgba(var(--cs-shadow-rgb),0.6)',
      }}>
        <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 400, color: 'var(--cs-on-surface)' }}>{message}</span>
        {actionLabel && onAction && (
          <button onClick={onAction} style={{
            fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 600, color: 'var(--cs-primary)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
