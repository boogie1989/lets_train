// fabStyle: 'Glass' | 'Gradient'
// Glass = surfaceContainerHighest (matches header buttons)
export default function FAB({ size = 52, fabStyle = 'Glass', onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size,
        borderRadius: 'var(--radius-xl)',
        background: fabStyle === 'Gradient'
          ? 'var(--gradient-slate-accent)'
          : 'var(--glass-control)',
        border: fabStyle === 'Gradient' ? 'none' : '1px solid rgba(var(--cs-outline-rgb),0.50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, padding: 0,
        boxShadow: 'none',
      }}
    >
      {icon || <PlusIcon size={Math.round(size * 0.42)} />}
    </button>
  )
}

function PlusIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
