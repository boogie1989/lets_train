import HybridCalendar from './hybrid/HybridCalendar.jsx'
import CupertinoCalendar from './cupertino/CupertinoCalendar.jsx'

// The same Calendar across design languages, side by side. The global ThemeToggle
// (App top bar) flips light/dark for all at once via [data-theme]. Each column pins
// its design language via data-ds so the scoped tokens resolve.
const LANGS = [
  { ds: 'hybrid',    label: 'Hybrid (recommended)', sub: 'Cupertino look · Material grammar (FAB · sheet · drawer · accent today) — for iOS + Android', Screen: HybridCalendar },
  { ds: 'cupertino', label: 'Cupertino (iOS)',      sub: 'Apple HIG · inset lists · vibrancy · sheets', Screen: CupertinoCalendar },
]

export default function CalendarPage() {
  return (
    <div style={{ padding: '40px 48px', display: 'flex', gap: 48, alignItems: 'flex-start', overflowX: 'auto' }}>
      {LANGS.map(({ ds, label, sub, Screen }) => (
        <div key={ds} data-ds={ds} style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{label}</p>
            <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.8, marginTop: 2 }}>{sub}</p>
          </div>
          <Screen initialDay={13} />
        </div>
      ))}
    </div>
  )
}
