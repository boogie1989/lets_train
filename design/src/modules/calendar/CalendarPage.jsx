import CalendarScreen from './CalendarScreen.jsx'
import { StyleInspector } from '../../components/index.js'

// Each phone starts on a different selected day; the calendar is interactive:
// tap "May 2026 ⌄" to swap the week strip for the inline month grid, tap dates
// to switch days, tap cards to open the item detail dialog (workout completion
// itself happens in the Workout Runner, not here).
const STATES = [
  { id: 'today', label: 'Today — week', props: { initialDay: 13 } },
  { id: 'list', label: 'No timeline', props: { initialDay: 13, timeline: false } },
  { id: 'light', label: 'Light day', props: { initialDay: 14 } },
  { id: 'month', label: 'Month open', props: { initialDay: 13, initialMonthOpen: true } },
  { id: 'empty', label: 'Empty day', props: { initialDay: 16 } },
  // d13-0 = Morning Strength (Completed: session result + note)
  { id: 'detail', label: 'Detail open', props: { initialDay: 13, initialDetailId: 'd13-0' } },
]

export default function CalendarPage() {
  return (
    <StyleInspector>
      <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        {STATES.map(({ id, label, props }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>{label}</span>
            <CalendarScreen {...props} />
          </div>
        ))}
      </div>
    </StyleInspector>
  )
}
