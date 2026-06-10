import GlassCard from './GlassCard.jsx'

// Base tile — wrapped in GlassCard by default.
// leading / trailing accept any React node.
export default function ListTile({
  title,
  subtitle,
  leading,
  trailing,
  level = 'Mid',
  onClick,
}) {
  return (
    <GlassCard
      level={level}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
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
    </GlassCard>
  )
}
