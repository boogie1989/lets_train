// Segmented switcher. Radius matches the app's list tiles (radius-2xl)
// so tabs/segments read consistently with cards and chips.
export default function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 3, padding: 3,
      background: 'var(--glass-control-strong)',
      border: '1px solid rgba(var(--cs-outline-rgb),0.35)',
      borderRadius: 'var(--radius-2xl)',
    }}>
      {options.map(opt => {
        const on = opt.id === value
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1, height: 32, borderRadius: 'calc(var(--radius-2xl) - 3px)', padding: '0 4px',
              background: on ? 'rgba(var(--cs-primary-rgb),0.18)' : 'transparent',
              border: on ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid transparent',
              boxShadow: on ? 'inset 0 1px 0 rgba(var(--raise-rgb),0.06)' : 'none',
              fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: on ? 500 : 400,
              color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
              cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
