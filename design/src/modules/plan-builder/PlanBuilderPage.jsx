import PlanBuilderScreen from './PlanBuilderScreen.jsx'

const STEPS = [
  { id: 'plan',     label: 'Plan'          },
  { id: 'day',      label: 'Day expanded'  },
  { id: 'daymenu',  label: 'Day actions'   },
  { id: 'copydays', label: 'Copy to days'  },
  { id: 'picker',   label: 'Add picker'    },
  { id: 'preview',  label: 'Item preview'  },
  { id: 'empty',    label: 'New (empty)'   },
]

export default function PlanBuilderPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      {STEPS.map(({ id, label }) => (
        <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>{label}</span>
          <PlanBuilderScreen initialStep={id} />
        </div>
      ))}
    </div>
  )
}
