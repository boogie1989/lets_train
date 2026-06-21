import NowScreen from './NowScreen.jsx'
import PulseScreen from './PulseScreen.jsx'
import AgendaScreen from './AgendaScreen.jsx'

// Playbook wrapper — the three reimagined home concepts side by side so they can be
// compared on identical real data (today = Wed, May 13). Pick one to take forward.
const CONCEPTS = [
  { key: 'now',    label: 'Now',    desc: 'Action-first · hero next-workout + Start',          Screen: NowScreen },
  { key: 'pulse',  label: 'Pulse',  desc: 'Rings dashboard · readiness score + Train/Fuel/Recover', Screen: PulseScreen },
  { key: 'agenda', label: 'Agenda', desc: 'Day-hero · week rail + Train / Eat / Recover groups', Screen: AgendaScreen },
]

export default function HomePage() {
  return (
    <div style={{ padding: '40px 48px', display: 'flex', gap: 48, alignItems: 'flex-start', overflowX: 'auto' }}>
      {CONCEPTS.map(({ key, label, desc, Screen }) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{label}</p>
            <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.7, marginTop: 2, maxWidth: 430 }}>{desc}</p>
          </div>
          <Screen />
        </div>
      ))}
    </div>
  )
}
