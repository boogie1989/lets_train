// Canonical icon button — matches the Calendar reference recipe
// (CalendarScreen.jsx `iconBtn`): glass-control fill, 0.5 outline border,
// card shadow, radius-xl. Use this everywhere instead of per-module copies.
//
// size: 'sm'(32) | 'md'(44, in-flow) | 'lg'(48, top-level)   default 'lg'
// state: 'default' | 'disabled'
// Passes through onClick / aria-label / other button props.
const dimMap = { sm: 32, md: 44, lg: 48 }

export default function IconButton({ icon, size = 'lg', state = 'default', style: extra, ...rest }) {
  const dim = dimMap[size] ?? 48
  const disabled = state === 'disabled'
  return (
    <button
      disabled={disabled}
      style={{
        width: dim, height: dim,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--glass-control)',
        border: '1px solid rgba(var(--cs-outline-rgb),0.5)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0, padding: 0,
        ...extra,
      }}
      {...rest}
    >
      {icon || <HamburgerIcon />}
    </button>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}
