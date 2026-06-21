const TT = { fontFamily: 'var(--tt-font-family)' }

const shellSt = {
  position: 'relative', width: '100%', maxWidth: 330, overflow: 'hidden',
  background: 'linear-gradient(180deg, var(--glass-dialog-top) 0%, var(--glass-dialog-bottom) 100%)',
  borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--overlay-rgb),0.08)',
  boxShadow: '0 24px 64px rgba(var(--cs-shadow-rgb),0.62), inset 0 1px 0 rgba(var(--raise-rgb),0.05)',
}
const baseBtn = { ...TT, flex: 1, height: 46, borderRadius: 'var(--radius-2xl)', cursor: 'pointer', fontSize: 14 }
const ghostBtn = { ...baseBtn, fontWeight: 500, background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.09)', color: 'var(--cs-on-surface-variant)' }
const primaryBtn = { ...baseBtn, fontWeight: 600, color: 'var(--cs-on-primary)', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.10) 0%, rgba(var(--cs-shadow-rgb),0.10) 100%), var(--cs-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 6px 18px rgba(var(--cs-primary-rgb),0.22)' }
const dangerBtn = { ...baseBtn, fontWeight: 600, color: 'rgba(var(--raise-rgb),1)', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.10) 0%, rgba(var(--cs-shadow-rgb),0.12) 100%), rgba(var(--danger-rgb),1)', border: '1px solid rgba(var(--overlay-rgb),0.14)', boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.18), 0 6px 18px rgba(var(--danger-rgb),0.30)' }

function TrashIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}
function CheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

export default function ConfirmDialog({
  title, message, onCancel, onConfirm,
  confirmLabel = 'Delete', cancelLabel = 'Cancel', destructive = true, icon,
}) {
  const tint = destructive ? 'var(--danger-rgb)' : 'var(--cs-primary-rgb)'
  return (
    <div style={shellSt}>
      {/* intent glow behind the icon */}
      <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 180, height: 130, background: `radial-gradient(circle, rgba(${tint},0.22) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '24px 22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 13 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${tint},0.14)`, border: `1px solid rgba(${tint},0.32)`,
          color: destructive ? 'var(--cs-error)' : 'var(--cs-primary)', boxShadow: `0 8px 22px rgba(${tint},0.20)`,
        }}>
          {icon ?? (destructive ? <TrashIcon /> : <CheckIcon />)}
        </div>
        <div>
          <div style={{ ...TT, fontSize: 17, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{title}</div>
          {message && <div style={{ ...TT, fontSize: 13, lineHeight: 1.5, color: 'var(--cs-on-surface-variant)', opacity: 0.62, marginTop: 6 }}>{message}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '2px 16px 16px' }}>
        <button onClick={onCancel} style={ghostBtn}>{cancelLabel}</button>
        <button onClick={onConfirm} style={destructive ? dangerBtn : primaryBtn}>{confirmLabel}</button>
      </div>
    </div>
  )
}
