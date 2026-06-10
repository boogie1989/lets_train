// value: 'Week' | 'Month'
export default function ViewToggle({ value = 'Week', onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--cs-surface-container-highest)',
      border: '1px solid var(--cs-outline)',
      borderRadius: 'var(--radius-pill)',
      padding: 2,
      gap: 2,
    }}>
      {['Week', 'Month'].map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            onClick={() => onChange?.(opt)}
            style={{
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: active ? 'rgba(var(--cs-primary-rgb),0.70)' : 'transparent',
              color: active ? 'var(--cs-on-surface)' : 'var(--cs-on-surface-variant)',
              fontFamily: 'var(--tt-font-family)',
              fontSize: 'var(--tt-label-medium-size)',
              fontWeight: 'var(--tt-label-medium-weight)',
              letterSpacing: 'var(--tt-label-medium-tracking)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
