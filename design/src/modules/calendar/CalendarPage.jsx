import CalendarScreen from './CalendarScreen.jsx'

// Each phone starts on a different selected day; the week itself is interactive
// (tap dates to switch, tap item checkboxes to toggle Completed).
const STATES = [
  { day: '13', label: 'Today — full day' },
  { day: '14', label: 'Light day' },
  { day: '16', label: 'Empty day' },
]

export default function CalendarPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      {STATES.map(({ day, label }) => (
        <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>{label}</span>
          <CalendarScreen initialDay={day} />
        </div>
      ))}
    </div>
  )
}
