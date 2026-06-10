import CalendarScreen from './CalendarScreen.jsx'

const STATES = [
  { id: 'with',  label: 'With items', has: true },
  { id: 'empty', label: 'Empty',      has: false },
]

export default function CalendarPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      {STATES.map(({ id, label, has }) => (
        <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>{label}</span>
          <CalendarScreen hasItems={has} />
        </div>
      ))}
    </div>
  )
}
