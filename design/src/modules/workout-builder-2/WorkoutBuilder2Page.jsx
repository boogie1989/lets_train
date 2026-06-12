import WorkoutBuilder2Screen from './WorkoutBuilder2Screen.jsx'

const STEPS = [
  { id: 'list',            label: 'List — Collapsed'      },
  { id: 'edit-solo',       label: 'Expanded — Solo'       },
  { id: 'edit-superset',   label: 'Expanded — Superset'   },
  { id: 'compact',         label: 'Compact View'          },
  { id: 'empty',           label: 'Empty State'           },
]

const TT = { fontFamily: 'var(--tt-font-family)' }

export default function WorkoutBuilder2Page() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ ...TT, fontSize: 18, fontWeight: 600, color: 'var(--cs-on-surface)', margin: 0 }}>Workout Builder 2</p>
        <p style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, margin: '4px 0 0' }}>
          v2 — kg default · RIR · 1RM base · history prefill · set structures · bulk apply · compact view
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {STEPS.map(({ id, label }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.40, margin: 0 }}>
              {label}
            </p>
            <WorkoutBuilder2Screen initialStep={id} />
          </div>
        ))}
      </div>
    </div>
  )
}
