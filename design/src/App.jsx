import { useState } from 'react'
import { ThemePage, UiKitPage } from './pages/index.js'
import { CalendarPage, ExercisesPage, WorkoutRunnerPage, WorkoutBuilderPage, LibrariesPage, PlanBuilderPage, MealBuilderPage, ProfilePage } from './modules/index.js'
import { ThemeToggle } from './components/index.js'

const NAV = [
  { id: 'theme',     label: 'Theme',           group: 'Common',  component: ThemePage         },
  { id: 'uikit',     label: 'UiKit',           group: 'Common',  component: UiKitPage         },
  { id: 'profile',   label: 'Profile',         group: 'Screens', component: ProfilePage        },
  { id: 'libraries', label: 'Libraries',       group: 'Screens', component: LibrariesPage     },
  { id: 'calendar',  label: 'Calendar',        group: 'Screens', component: CalendarPage      },
  { id: 'exercises', label: 'Exercises',       group: 'Screens', component: ExercisesPage     },
  { id: 'workout',   label: 'Workout Runner',  group: 'Screens', component: WorkoutRunnerPage },
  { id: 'builder',   label: 'Workout Builder', group: 'Screens', component: WorkoutBuilderPage },
  { id: 'plan',      label: 'Plan Builder',    group: 'Screens', component: PlanBuilderPage    },
  { id: 'meal',      label: 'Meal Builder',    group: 'Screens', component: MealBuilderPage    },
]

export default function App() {
  const [activeId, setActiveId] = useState('theme')

  const active = NAV.find((s) => s.id === activeId)
  const Content = active?.component
  const groups = [...new Set(NAV.map((s) => s.group))]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--app-bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: 'var(--glass-sidebar)',
        borderRight: '1px solid rgba(var(--cs-outline-rgb),0.25)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(var(--cs-outline-rgb),0.20)' }}>
          <p style={{
            fontFamily: 'var(--tt-font-family)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--cs-on-surface)',
            letterSpacing: '0.02em',
          }}>
            Fitness
          </p>
          <p style={{
            fontFamily: 'var(--tt-font-family)',
            fontSize: 11,
            color: 'var(--cs-on-surface-variant)',
            opacity: 0.5,
            marginTop: 2,
          }}>
            Design Playbook
          </p>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {groups.map((group) => (
            <div key={group} style={{ marginBottom: 4 }}>
              <p style={{
                fontFamily: 'var(--tt-font-family)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--cs-on-surface-variant)',
                opacity: 0.45,
                padding: '8px 16px 4px',
              }}>
                {group}
              </p>
              {NAV.filter((s) => s.group === group).map((s) => {
                const isActive = activeId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 16px',
                      border: 'none',
                      borderLeft: isActive
                        ? '2px solid var(--cs-primary)'
                        : '2px solid transparent',
                      background: isActive
                        ? 'rgba(var(--cs-primary-rgb),0.08)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--cs-on-surface)'
                        : 'var(--cs-on-surface-variant)',
                      fontFamily: 'var(--tt-font-family)',
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: 44,
          borderBottom: '1px solid rgba(var(--cs-outline-rgb),0.20)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>
            {active?.group}
          </span>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>/</span>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
            {active?.label}
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Content && <Content />}
        </div>
      </main>
    </div>
  )
}
