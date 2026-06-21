// status: 'Planned' | 'Completed'
export default function StatusBadge({ status = 'Planned' }) {
  const isCompleted = status === 'Completed'
  const color = isCompleted ? 'var(--cs-status-completed)' : 'var(--cs-status-planned)'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: isCompleted ? 'rgba(var(--cs-tertiary-rgb),0.12)' : 'rgba(var(--cs-primary-rgb),0.12)',
      border: `1px solid ${isCompleted ? 'rgba(var(--cs-tertiary-rgb),0.25)' : 'rgba(var(--cs-primary-rgb),0.25)'}`,
      fontFamily: 'var(--tt-font-family)',
      fontSize: 'var(--tt-label-small-size)',
      fontWeight: 'var(--tt-label-small-weight)',
      letterSpacing: 'var(--tt-label-small-tracking)',
      color,
      whiteSpace: 'nowrap',
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }}/>
      {status}
    </span>
  )
}
