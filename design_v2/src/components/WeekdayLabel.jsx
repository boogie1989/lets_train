// label: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
export default function WeekdayLabel({ label = 'Mon' }) {
  return (
    <div style={{
      width: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--typo-body-small-size)',
        fontWeight: 500,
        lineHeight: 'var(--typo-body-small-line)',
        letterSpacing: 'var(--typo-body-small-tracking)',
        color: 'var(--color-on-surface-variant)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}
