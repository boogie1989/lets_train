import ExercisePreviewScreen from './ExercisePreviewScreen.jsx'
import ExerciseSearchScreen  from './ExerciseSearchScreen.jsx'

function PhoneColumn({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--cs-on-surface-variant)', opacity: 0.45,
      }}>{label}</span>
      {children}
    </div>
  )
}

export default function ExercisesPage() {
  return (
    <div style={{
      padding: '40px 48px',
      background: 'var(--cs-surface-container)',
      minHeight: '100%',
      display: 'flex',
      gap: 48,
      alignItems: 'flex-start',
    }}>
      <PhoneColumn label="Exercise Preview">
        <ExercisePreviewScreen />
      </PhoneColumn>

      <PhoneColumn label="Exercise Search">
        <ExerciseSearchScreen />
      </PhoneColumn>
    </div>
  )
}
