// Multi-item select dialog — toggle several options, confirm with a count.
const TT = { fontFamily: 'var(--tt-font-family)' }
const norm = o => (typeof o === 'string' ? { id: o, label: o } : o)

const shellSt = {
  position: 'relative', width: '100%', maxWidth: 330, overflow: 'hidden',
  background: 'linear-gradient(180deg, var(--glass-dialog-top) 0%, var(--glass-dialog-bottom) 100%)',
  backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
  borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--overlay-rgb),0.08)',
  boxShadow: '0 24px 64px rgba(var(--cs-shadow-rgb),0.62), inset 0 1px 0 rgba(var(--raise-rgb),0.05)',
  display: 'flex', flexDirection: 'column',
}
const baseBtn = { ...TT, flex: 1, height: 46, borderRadius: 'var(--radius-2xl)', cursor: 'pointer', fontSize: 14 }
const ghostBtn = { ...baseBtn, fontWeight: 500, background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.09)', color: 'var(--cs-on-surface-variant)' }
const primaryBtn = { ...baseBtn, fontWeight: 600, color: 'var(--cs-on-primary)', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.10) 0%, rgba(var(--cs-shadow-rgb),0.10) 100%), var(--cs-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 6px 18px rgba(var(--cs-primary-rgb),0.22)' }

function CheckBox({ on }) {
  return (
    <span style={{
      width: 22, height: 22, borderRadius: 7, flexShrink: 0, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
      background: on ? 'var(--cs-primary)' : 'transparent',
      border: on ? 'none' : '2px solid rgba(var(--cs-outline-rgb),0.5)',
    }}>
      {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
    </span>
  )
}

export default function MultiSelectDialog({ title = 'Select', subtitle, options = [], values = [], onToggle, onCancel, onConfirm, cancelLabel = 'Cancel', confirmLabel = 'Done' }) {
  const set = Array.isArray(values) ? values : Array.from(values)
  const count = set.length
  return (
    <div style={shellSt}>
      <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 180, height: 120, background: 'radial-gradient(circle, rgba(var(--cs-primary-rgb),0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '18px 20px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{title}</span>
          {subtitle && <p style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.55, margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
        <span style={{ ...TT, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-2xl)', background: count ? 'rgba(var(--cs-primary-rgb),0.16)' : 'rgba(var(--overlay-rgb),0.05)', border: `1px solid ${count ? 'rgba(var(--cs-primary-rgb),0.30)' : 'rgba(var(--overlay-rgb),0.08)'}`, color: count ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)' }}>{count} selected</span>
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto', padding: '2px 8px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {options.map(o => {
          const opt = norm(o)
          const on = set.includes(opt.id)
          return (
            <button key={opt.id} onClick={() => onToggle && onToggle(opt.id)} style={{
              position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px 11px 14px',
              borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: on ? 'rgba(var(--cs-primary-rgb),0.13)' : 'transparent', transition: 'background 0.15s',
            }}>
              {on && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: 'var(--cs-primary)' }} />}
              {opt.icon && (
                <span style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(var(--cs-primary-rgb),0.18)' : 'rgba(var(--overlay-rgb),0.05)', color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)' }}>{opt.icon}</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TT, fontSize: 14, fontWeight: on ? 600 : 400, color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</div>
                {opt.subtitle && <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 1 }}>{opt.subtitle}</div>}
              </div>
              <CheckBox on={on} />
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '4px 16px 16px' }}>
        <button onClick={onCancel} style={ghostBtn}>{cancelLabel}</button>
        <button onClick={onConfirm} style={primaryBtn}>{confirmLabel}{count ? ` (${count})` : ''}</button>
      </div>
    </div>
  )
}
