// Base tile — opaque Card (v2). leading / trailing accept any React node.
// `level` (Low/Mid/High) maps to the surface elevation ladder for API parity
// with the old GlassCard levels. → Flutter ListTile inside a Card.
const SURF = { Low: 'var(--surface-2)', Mid: 'var(--surface-2)', High: 'var(--surface-3)' }

export default function ListTile({
  title,
  subtitle,
  leading,
  trailing,
  level = 'Mid',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: SURF[level] ?? 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--elev-1)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        minHeight: 64,
      }}>

        {/* Leading */}
        {leading && (
          <div style={{ flexShrink: 0 }}>
            {leading}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{
            fontFamily: 'var(--tt-font-family)',
            fontSize: 'var(--tt-body-large-size)',
            fontWeight: 500,
            lineHeight: 'var(--tt-body-large-height)',
            color: 'var(--cs-on-surface)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </span>

          {subtitle && (
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 'var(--tt-body-small-size)',
              fontWeight: 'var(--tt-body-small-weight)',
              lineHeight: 'var(--tt-body-small-height)',
              color: 'var(--cs-on-surface-variant)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {subtitle}
            </span>
          )}
        </div>

        {/* Trailing */}
        {trailing && (
          <div style={{ flexShrink: 0, color: 'var(--cs-on-surface-variant)' }}>
            {trailing}
          </div>
        )}

      </div>
    </div>
  )
}
