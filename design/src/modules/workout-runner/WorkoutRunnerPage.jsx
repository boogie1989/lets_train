import WorkoutRunnerScreen from './WorkoutRunnerScreen.jsx'

const STEPS = [
  { id: 'choice',    label: 'Choice'    },
  { id: 'preview',   label: 'Preview'   },
  { id: 'countdown', label: 'Countdown' },
  { id: 'running',   label: 'Running'   },
  { id: 'rest',      label: 'Rest'      },
  { id: 'timer',     label: 'Timer'     },
  { id: 'done',      label: 'Done'      },
]

const TT = { fontFamily: 'var(--tt-font-family)' }

export default function WorkoutRunnerPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 430px)', gap: '56px 40px' }}>
        {STEPS.map(({ id, label }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{
              ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)',
              opacity: 0.45, margin: 0,
            }}>
              {label}
            </p>
            <WorkoutRunnerScreen initialStep={id} />
          </div>
        ))}
      </div>
    </div>
  )
}
