import { Fragment } from 'react'

// FabMenu — the app-wide "+" action menu (origin: Workout Builder).
// A 50×50 glass FAB that morphs into a glass panel via container transform:
// width/height/radius/background animate on one container (0.32s standard ease),
// the + rotates 45° into ×, pinned to the FAB corner, and the menu items
// stagger-fade in (delay 0.1s + 40ms·i). Backdrop click or × closes.
//
// actions: [{ label, icon, onClick, primary?, dividerAbove? }]
// Panel height is derived from the action count, so any screen can pass 2–5 items.
// Place inside a right-aligned footer row (see Workout Builder / Calendar usage).

const TT = { fontFamily: 'var(--tt-font-family)' }
const ITEM_H = 55
const PAD = 20
const DIVIDER_H = 11

export default function FabMenu({ open, setOpen, actions, width = 264 }) {
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const height = PAD + actions.length * ITEM_H + actions.filter(a => a.dividerAbove).length * DIVIDER_H
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 44 }} />}
      <div style={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
        <div style={{
          position: 'absolute', right: 0, bottom: 0, zIndex: 45,
          width: open ? width : 50, height: open ? height : 50,
          // closed = radius-xl like every control on the screen; open = radius-2xl like the cards
          borderRadius: open ? 'var(--radius-2xl)' : 'var(--radius-xl)',
          background: open ? 'var(--glass-popover)' : 'var(--glass-control)',
          border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
          boxShadow: open ? '0 12px 32px rgba(var(--cs-shadow-rgb),0.6)' : 'var(--shadow-card)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
          transition: `width 0.32s ${ease}, height 0.32s ${ease}, border-radius 0.32s ${ease}, background 0.32s ${ease}, box-shadow 0.32s ${ease}`,
        }}>
          {/* menu items — stagger in once the panel has begun to open */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', flexDirection: 'column' }}>
            {actions.map((a, i) => (
              <Fragment key={a.label}>
                {a.dividerAbove && <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '5px 8px' }} />}
                <button onClick={() => { setOpen(false); a.onClick?.() }} style={{
                  ...TT, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
                  background: 'none', border: 'none', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  fontSize: 15, fontWeight: a.primary ? 600 : 500,
                  color: a.primary ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
                  textAlign: 'left', whiteSpace: 'nowrap',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.2s ease ${open ? 0.1 + i * 0.04 : 0}s, transform 0.2s ease ${open ? 0.1 + i * 0.04 : 0}s`,
                  pointerEvents: open ? 'auto' : 'none',
                }}>
                  <span style={{ display: 'flex', color: a.primary ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)', opacity: a.primary ? 1 : 0.7 }}>{a.icon}</span>
                  {a.label}
                </button>
              </Fragment>
            ))}
          </div>
          {/* + / × — persists through the morph, pinned where the FAB was */}
          <button onClick={() => setOpen(o => !o)} style={{
            position: 'absolute', right: 0, bottom: 0, width: 50, height: 50,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--cs-on-surface)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: `transform 0.32s ${ease}`,
          }}>
            <PlusIcon size={18} />
          </button>
        </div>
      </div>
    </>
  )
}

function PlusIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
