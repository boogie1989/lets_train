// Exact from Figma: 56 h, buttons 48×48 solid surfaceContainerHighest r=14, gap=12
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const btnStyle = {
  width: 48, height: 48,
  borderRadius: 'var(--radius-xl)',
  background: 'var(--cs-surface-container-highest)',
  border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0, padding: 0,
}

export default function TopAppBar({ title = 'Calendar', subtitle = 'May 2026' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      gap: 12,
      flexShrink: 0,
    }}>
      <button style={btnStyle}><MenuIcon /></button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-title-large-size)',
          fontWeight: 'var(--tt-title-large-weight)',
          lineHeight: 'var(--tt-title-large-height)',
          letterSpacing: 'var(--tt-title-large-tracking)',
          color: 'var(--cs-on-surface)',
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-body-small-size)',
          fontWeight: 'var(--tt-body-small-weight)',
          lineHeight: 'var(--tt-body-small-height)',
          letterSpacing: 'var(--tt-body-small-tracking)',
          color: 'var(--cs-on-surface-variant)',
        }}>
          {subtitle}
        </span>
      </div>

      <button style={btnStyle}><SettingsIcon /></button>
    </div>
  )
}
