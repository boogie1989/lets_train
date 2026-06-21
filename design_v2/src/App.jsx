import { useState } from 'react'
import { ThemePage, UiKitPage } from './pages/index.js'
import { CalendarPage, HomePage } from './modules/index.js'
import { ThemeToggle } from './components/index.js'

// design_v2: Theme, UiKit, three reimagined Home concepts, and the Calendar.
const NAV = [
  { id: 'theme',     label: 'Theme',           group: 'Common',  component: ThemePage    },
  { id: 'uikit',     label: 'UiKit',           group: 'Common',  component: UiKitPage     },
  { id: 'home',      label: 'Home concepts',   group: 'Screens', component: HomePage      },
  { id: 'calendar',  label: 'Calendar',        group: 'Screens', component: CalendarPage  },
]

export default function App() {
  const [activeId, setActiveId] = useState('home')

  const active = NAV.find((s) => s.id === activeId)
  const Content = active?.component
  const groups = [...new Set(NAV.map((s) => s.group))]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--app-bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
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
            opacity: 0.7,
            marginTop: 2,
          }}>
            Design Playbook · v2
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
                opacity: 0.6,
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
                        ? 'rgba(var(--cs-primary-rgb),0.10)'
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
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>
            {active?.group}
          </span>
          <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>/</span>
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
