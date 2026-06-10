import ViewToggle from './ViewToggle.jsx'

// month: string   view: 'Week'|'Month'   onViewChange: fn
export default function CalendarHeader({ month = 'May 2026', view = 'Week', onViewChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-4)',
      height: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--typo-title-medium-size)',
          fontWeight: 'var(--typo-title-medium-weight)',
          color: 'var(--color-on-surface)',
        }}>
          {month}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <ViewToggle value={view} onChange={onViewChange} />
    </div>
  )
}
