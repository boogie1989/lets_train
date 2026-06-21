// Anchored dropdown menu — a trigger button + a panel of actions.
// items: [{ label, icon?, danger?, disabled?, onClick }]
import { useState } from 'react'

const TT = { fontFamily: 'var(--tt-font-family)' }

function KebabIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

export default function DropdownMenu({ items = [], trigger, align = 'right', defaultOpen = false, minWidth = 180, backdrop = true, onOpenChange, triggerStyle }) {
  const [open, setOpenRaw] = useState(defaultOpen)
  const setOpen = next => setOpenRaw(prev => {
    const v = typeof next === 'function' ? next(prev) : next
    if (v !== prev) onOpenChange?.(v)
    return v
  })
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 32, height: 32, borderRadius: 'var(--radius-lg)', padding: 0,
        background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'var(--glass-control)',
        border: '1px solid rgba(var(--cs-outline-rgb),0.45)', cursor: 'pointer',
        color: 'var(--cs-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...triggerStyle,
      }}>
        {trigger ?? <KebabIcon />}
      </button>

      {open && (
        <>
          {backdrop && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />}
          <div style={{
            position: 'absolute', top: '100%', marginTop: 6, zIndex: 50, minWidth,
            [align === 'right' ? 'right' : 'left']: 0,
            background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden', boxShadow: '0 10px 28px rgba(var(--cs-shadow-rgb),0.6)', padding: 4,
          }}>
            {items.map((it, i) => (
              <div key={i}>
                {it.divider && <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '4px 6px' }} />}
                <button
                  disabled={it.disabled}
                  onClick={() => { setOpen(false); it.onClick && it.onClick() }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px',
                    borderRadius: 'var(--radius-lg)', background: 'none', border: 'none',
                    cursor: it.disabled ? 'default' : 'pointer', textAlign: 'left', opacity: it.disabled ? 0.35 : 1,
                    ...TT, fontSize: 14, fontWeight: 500,
                    color: it.danger ? 'var(--cs-error)' : 'var(--cs-on-surface)',
                  }}
                >
                  {it.icon && (
                    <span style={{
                      width: 28, height: 28, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: it.danger ? 'rgba(var(--danger-rgb),0.14)' : 'rgba(var(--overlay-rgb),0.06)',
                      color: it.danger ? 'var(--cs-error)' : 'var(--cs-on-surface-variant)',
                    }}>{it.icon}</span>
                  )}
                  {it.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
