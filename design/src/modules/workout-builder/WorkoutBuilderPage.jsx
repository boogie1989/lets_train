import WorkoutBuilderScreen from './WorkoutBuilderScreen.jsx'

const STEPS = [
  { id: 'list',            label: 'List — Collapsed'      },
  { id: 'list-superset',   label: 'With Superset'         },
  { id: 'edit-solo',       label: 'Expanded — Solo'       },
  { id: 'edit-superset',   label: 'Expanded — Superset'   },
]

const TT = { fontFamily: 'var(--tt-font-family)' }

export default function WorkoutBuilderPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ ...TT, fontSize: 18, fontWeight: 600, color: 'var(--cs-on-surface)', margin: 0 }}>Workout Builder</p>
        <p style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, margin: '4px 0 0' }}>
          Runner-style glass cards · tap to expand & edit sets inline
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {STEPS.map(({ id, label }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.40, margin: 0 }}>
              {label}
            </p>
            <WorkoutBuilderScreen initialStep={id} />
          </div>
        ))}
      </div>
    </div>
  )
}
