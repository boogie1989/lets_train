// state: 'default' | 'today' | 'selected' | 'otherMonth'
// completed (orthogonal to state): day's plan fully done → emerald dot (wins over today's dot)
// Exact from Figma: 52×76, r=14, gap=4, bg=surfaceContainer
export default function DateCell({ day, weekday, state = 'default', completed = false, onClick }) {
  const isSelected = state === 'selected'
  const isToday    = state === 'today'
  const isOther    = state === 'otherMonth'

  return (
    <div onClick={onClick} style={{
      width: 52,
      height: 76,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderRadius: 'var(--radius-xl)',
      // v2: selected = flat primary fill (no gradient / no inset glow);
      // today = 1px primary ring; default = surface-2 + hairline border.
      background: isSelected ? 'var(--cs-primary)' : 'var(--surface-2)',
      border: isSelected
        ? '1px solid transparent'
        : isToday
          ? '1px solid rgba(var(--cs-primary-rgb),0.55)'
          : '1px solid var(--border-subtle)',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: isSelected ? 'var(--elev-1)' : 'none',
    }}>
      {/* Weekday — labelSmall; white for today/selected, onSurfaceVariant for others */}
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 'var(--tt-label-small-size)',
        fontWeight: 'var(--tt-label-small-weight)',
        letterSpacing: 'var(--tt-label-small-tracking)',
        textTransform: 'uppercase',
        color: isSelected
          ? 'var(--cs-on-primary)'
          : isToday
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
        fontVariantNumeric: 'tabular-nums',
        fontSize: 18,
        fontWeight: 'var(--tt-title-medium-weight)',
        lineHeight: 1,
        color: isSelected
          ? 'var(--cs-on-primary)'
          : isOther ? 'rgba(var(--cs-on-surface-rgb),0.25)' : 'var(--cs-on-surface)',
      }}>
        {day}
      </span>

      {/* Indicator — 4×4 dot: emerald = plan completed, secondary = today */}
      {(completed || isToday) && (
        <div style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: completed ? 'var(--cs-status-completed)' : 'var(--cs-secondary)',
        }}/>
      )}
    </div>
  )
}
