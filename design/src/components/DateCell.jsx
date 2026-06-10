// state: 'default' | 'today' | 'selected' | 'otherMonth'
// Exact from Figma: 52×76, r=14, gap=4, bg=surfaceContainer
export default function DateCell({ day, weekday, state = 'default' }) {
  const isSelected = state === 'selected'
  const isToday    = state === 'today'
  const isOther    = state === 'otherMonth'

  return (
    <div style={{
      width: 52,
      height: 76,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderRadius: 'var(--radius-xl)',
      background: isSelected
        ? 'var(--gradient-slate-accent)'
        : 'var(--cs-surface-container)',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: isSelected
        ? '0 6px 18px rgba(var(--cs-primary-rgb),0.45), inset 0 1px 0 rgba(var(--raise-rgb),0.20)'
        : 'none',
    }}>
      {/* Weekday — labelSmall; white for today/selected, onSurfaceVariant for others */}
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 'var(--tt-label-small-size)',
        fontWeight: 'var(--tt-label-small-weight)',
        letterSpacing: 'var(--tt-label-small-tracking)',
        textTransform: 'uppercase',
        color: (isSelected || isToday)
          ? 'var(--cs-on-surface)'
          : isOther
            ? 'rgba(var(--cs-on-surface-variant-rgb),0.30)'
            : 'var(--cs-on-surface-variant)',
      }}>
        {weekday}
      </span>

      {/* Day number — titleMedium weight, onSurface */}
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 18,
        fontWeight: 'var(--tt-title-medium-weight)',
        lineHeight: 1,
        color: isOther ? 'rgba(var(--cs-on-surface-rgb),0.25)' : 'var(--cs-on-surface)',
      }}>
        {day}
      </span>

      {/* Today indicator — 4×4 dot in secondary color */}
      {isToday && (
        <div style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: 'var(--cs-secondary)',
        }}/>
      )}
    </div>
  )
}
