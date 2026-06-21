import FAB from './FAB.jsx'

export default function ScheduleHeader({ title = 'Schedule', subtitle = 'Thursday, May 14' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 8,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-title-large-size)',
          fontWeight: 'var(--tt-title-large-weight)',
          lineHeight: 'var(--tt-title-large-height)',
          color: 'var(--cs-on-surface)',
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-body-medium-size)',
          fontWeight: 'var(--tt-body-medium-weight)',
          lineHeight: 'var(--tt-body-medium-height)',
          letterSpacing: 'var(--tt-body-medium-tracking)',
          color: 'var(--cs-on-surface-variant)',
        }}>
          {subtitle}
        </span>
      </div>
      <FAB size={52} fabStyle="Glass" />
    </div>
  )
}
