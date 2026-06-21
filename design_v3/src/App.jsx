import CalendarPage from './calendar/CalendarPage.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

// design_v3 — single screen (the Calendar) shown in three design languages.
// No sidebar nav (scope = Calendar only). Top bar carries the light/dark toggle.
export default function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--page-bg)' }}>
      <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: 'var(--chrome-bg)', borderBottom: '1px solid rgba(var(--overlay-rgb),0.08)' }}>
        <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 600, color: 'var(--cs-on-surface)' }}>Fitness · Calendar</span>
        <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>Hybrid · Cupertino</span>
        <div style={{ marginLeft: 'auto' }}><ThemeToggle /></div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <CalendarPage />
      </div>
    </div>
  )
}
