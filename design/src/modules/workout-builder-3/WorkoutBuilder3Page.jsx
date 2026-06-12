import WorkoutBuilder3Screen from './WorkoutBuilder3Screen.jsx'

const STEPS = [
  { id: 'preview',        label: 'Workout Preview'      },
  { id: 'edit-solo',      label: 'Editor — Solo'        },
  { id: 'edit-superset',  label: 'Editor — Superset'    },
]

const TT = { fontFamily: 'var(--tt-font-family)' }

export default function WorkoutBuilder3Page() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ ...TT, fontSize: 18, fontWeight: 600, color: 'var(--cs-on-surface)', margin: 0 }}>Workout Builder 3</p>
        <p style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, margin: '4px 0 0' }}>
          Two-level: read-only workout preview → full-screen exercise editor (tap a card; ‹ › pager walks the workout)
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {STEPS.map(({ id, label }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.40, margin: 0 }}>
              {label}
            </p>
            <WorkoutBuilder3Screen initialStep={id} />
          </div>
        ))}
      </div>
    </div>
  )
}
