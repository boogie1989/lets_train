// size: 'sm'(32) | 'md'(40) | 'lg'(48)   state: 'default' | 'disabled'
const dimMap = { sm: 32, md: 40, lg: 48 }

export default function IconButton({ icon, size = 'lg', state = 'default', style: extra }) {
  const dim = dimMap[size] ?? 48
  return (
    <button
      disabled={state === 'disabled'}
      style={{
        width: dim, height: dim,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--cs-surface-container-highest)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: state === 'disabled' ? 'not-allowed' : 'pointer',
        opacity: state === 'disabled' ? 0.4 : 1,
        flexShrink: 0, padding: 0,
        ...extra,
      }}
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
