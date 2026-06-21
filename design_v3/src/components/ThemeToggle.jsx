// Dark/Light segmented toggle for the playbook top bar. Drives [data-theme].
import { useTheme } from '../theme/ThemeProvider.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const opts = [
    { id: 'dark', icon: <MoonIcon />, label: 'Dark' },
    { id: 'light', icon: <SunIcon />, label: 'Light' },
  ]
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2, padding: 2,
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(var(--overlay-rgb), 0.05)',
      border: '1px solid rgba(var(--overlay-rgb), 0.08)',
    }}>
      {opts.map(o => {
        const on = theme === o.id
        return (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            title={o.label}
            style={{
              ...TT, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 'calc(var(--radius-2xl) - 2px)',
              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: on ? 500 : 400,
              background: on ? 'rgba(var(--cs-primary-rgb), 0.16)' : 'transparent',
              color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
              transition: 'all 0.12s',
            }}
          >
            {o.icon}{o.label}
          </button>
        )
      })}
    </div>
  )
}
