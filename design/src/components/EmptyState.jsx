// EmptyState — centered placeholder card (icon · title · caption) for "nothing here yet".
// Generic base primitive: pass any `icon`, `title`, and optional `caption`.
export default function EmptyState({ icon, title, caption, width = 366, style }) {
  return (
    <div style={{
      width,
      flexShrink: 0,
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
      background: 'var(--glass-slab)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 80,
      paddingBottom: 52,
      gap: 8,
      ...style,
    }}>
      {icon && <div style={{ opacity: 0.25, marginBottom: 4 }}>{icon}</div>}
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 'var(--tt-title-small-size)',
        fontWeight: 'var(--tt-title-small-weight)',
        color: 'var(--cs-on-surface)',
        opacity: 0.40,
      }}>
        {title}
      </span>
      {caption && (
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-body-small-size)',
          fontWeight: 'var(--tt-body-small-weight)',
          color: 'var(--cs-on-surface-variant)',
          opacity: 0.30,
        }}>
          {caption}
        </span>
      )}
    </div>
  )
}
