import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import DateCell from '../../components/DateCell.jsx'
import ScheduleHeader from '../../components/ScheduleHeader.jsx'
import TaskItem from '../../components/TaskItem.jsx'
import { LibrariesView } from '../libraries/index.js'

const TT = { fontFamily: 'var(--tt-font-family)' }
const USER = { name: 'Serhii Buhai', email: 'serhii.work@gmail.com', initials: 'SB' }
const NUT = { kcal: 1840, goal: 2200, p: 132, pGoal: 150, c: 180, cGoal: 230, f: 58, fGoal: 70 }  // selected-day nutrition (demo)

const TASKS = [
  { title: 'Morning Strength', time: '07:00 AM', exerciseCount: 8, status: 'Completed' },
  { title: 'Mobility Training', time: '08:30 AM', exerciseCount: 7, status: 'Completed' },
  { title: 'Leg Day', time: '10:00 AM', exerciseCount: 12, status: 'Planned' },
  { title: 'HIIT Cardio', time: '12:00 PM', exerciseCount: 6, status: 'Planned' },
  { title: 'Core Workout', time: '03:00 PM', exerciseCount: 10, status: 'Planned' },
  { title: 'Upper Body', time: '05:00 PM', exerciseCount: 9, status: 'Planned' },
  { title: 'Evening Yoga', time: '06:30 PM', exerciseCount: 5, status: 'Planned' },
]

const DATES = [
  { weekday: 'Sun', day: '10', state: 'default' },
  { weekday: 'Mon', day: '11', state: 'default' },
  { weekday: 'Tue', day: '12', state: 'default' },
  { weekday: 'Wed', day: '13', state: 'today' },
  { weekday: 'Thu', day: '14', state: 'selected' },
  { weekday: 'Fri', day: '15', state: 'default' },
  { weekday: 'Sat', day: '16', state: 'default' },
]

const cardSlab = {
  width: '100%',
  background: 'var(--glass-slab)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderTop: '1px solid rgba(var(--overlay-rgb),0.05)',
  borderBottom: '1px solid rgba(var(--overlay-rgb),0.05)',
  boxShadow: '0 12px 32px rgba(var(--cs-shadow-rgb),0.60)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

const iconBtn = {
  width: 48, height: 48,
  borderRadius: 'var(--radius-xl)',
  background: 'var(--glass-control)',
  border: '1px solid rgba(var(--cs-outline-rgb),0.5)',
  boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.40)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, cursor: 'default', padding: 0,
}

export default function CalendarScreen({ hasItems = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lib, setLib] = useState(null)
  const dayStats = {
    total: TASKS.length,
    completed: TASKS.filter(t => t.status === 'Completed').length,
    exercises: TASKS.reduce((s, t) => s + t.exerciseCount, 0),
  }
  return (
    <PhoneFrame smokeVariant="animated">
      {/* Calendar Card — unified glass slab, full-bleed from top, no border-radius */}
      <div style={cardSlab}>
        <StatusBar />

        {/* Top Bar + Date row with padding */}
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Bar */}
          <div style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button onClick={() => setMenuOpen(true)} style={{ ...iconBtn, cursor: 'pointer' }} aria-label="Open menu">
              <MenuIcon />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{
                fontFamily: 'var(--tt-font-family)',
                fontSize: 'var(--tt-title-large-size)',
                fontWeight: 'var(--tt-title-large-weight)',
                lineHeight: 'var(--tt-title-large-height)',
                color: 'var(--cs-on-surface)',
              }}>
                Calendar
              </span>
              <span style={{
                fontFamily: 'var(--tt-font-family)',
                fontSize: 'var(--tt-body-small-size)',
                fontWeight: 'var(--tt-body-small-weight)',
                letterSpacing: 'var(--tt-body-small-tracking)',
                color: 'var(--cs-on-surface-variant)',
              }}>
                May 2026
              </span>
            </div>

            <div style={iconBtn}>
              <SettingsIcon />
            </div>
          </div>

          {/* Date row */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
            {DATES.map(({ weekday, day, state }) => (
              <DateCell key={weekday} weekday={weekday} day={day} state={state} />
            ))}
          </div>
        </div>
      </div>

      {/* Schedule section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 16px',
        overflow: 'hidden',
      }}>
        <ScheduleHeader subtitle="Thursday, May 14" />

        {hasItems ? (
          <>
            <DaySummary stats={dayStats} nut={NUT} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TASKS.map((task) => (
                <TaskItem key={task.title} {...task} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState />
          </div>
        )}
      </div>

      {/* ── Side menu drawer ── */}
      <SideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={id => { setLib(id); setMenuOpen(false) }} />

      {/* ── Library overlay (opened from the drawer nav) ── */}
      {lib && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--cs-surface)' }}>
          <LibrariesView initialLibrary={lib} mode="browse" onClose={() => setLib(null)} />
        </div>
      )}
    </PhoneFrame>
  )
}

// ── Side drawer: short profile + library navigation ──────────────────────────
const LIBS = [
  { id: 'exercises', label: 'Exercises', ch: '--cat-blue-rgb', icon: <BarbellGlyph /> },
  { id: 'workouts', label: 'Workouts', ch: '--cat-violet-rgb', icon: <LayersGlyph /> },
  { id: 'meals', label: 'Meals', ch: '--cs-tertiary-rgb', icon: <MealGlyph /> },
  { id: 'plans', label: 'Plans', ch: '--cat-amber-rgb', icon: <PlanGlyph /> },
]

function SideDrawer({ open, onClose, onNavigate }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(var(--cs-shadow-rgb),0.50)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s ease' }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 296, zIndex: 51,
        transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.34s cubic-bezier(0.32,0.72,0,1)',
        background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(var(--overlay-rgb),0.08)', boxShadow: '8px 0 40px rgba(var(--cs-shadow-rgb),0.50)',
        display: 'flex', flexDirection: 'column', paddingTop: 54,
      }}>
        {/* short profile */}
        <button onClick={onClose} style={{ ...TT, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, padding: 2, display: 'flex', background: 'var(--gradient-slate-accent)' }}>
            <div style={{ flex: 1, borderRadius: '50%', background: 'var(--cs-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cs-on-surface)' }}>
              <span style={{ ...TT, fontSize: 16, fontWeight: 600 }}>{USER.initials}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TT, fontSize: 15, fontWeight: 600, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.name}</div>
            <div style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.65, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.email}</div>
          </div>
          <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}><ChevR /></span>
        </button>

        <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '0 16px 8px' }} />

        <span style={{ ...TT, padding: '8px 18px 6px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>Libraries</span>
        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {LIBS.map(l => (
            <button key={l.id} onClick={() => onNavigate(l.id)} style={{ ...TT, display: 'flex', alignItems: 'center', gap: 13, padding: '11px 10px', borderRadius: 'var(--radius-lg)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(var(${l.ch}),0.14)`, color: `rgba(var(${l.ch}),1)` }}>{l.icon}</span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{l.label}</span>
              <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.35 }}><ChevR /></span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const glyph = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
function BarbellGlyph() {
  return <svg width="19" height="9" viewBox="0 0 26 10" {...glyph}><rect x="0.8" y="1.5" width="4" height="7" rx="1" /><rect x="21.2" y="1.5" width="4" height="7" rx="1" /><line x1="4.8" y1="5" x2="21.2" y2="5" /></svg>
}
function LayersGlyph() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...glyph}><polygon points="12 2 22 7 12 12 2 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
}
function MealGlyph() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...glyph}><path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" /><path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" /></svg>
}
function PlanGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...glyph}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="7" y1="14" x2="9" y2="14" /><line x1="12" y1="14" x2="17" y2="14" /></svg>
}
function ChevR() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><polyline points="9 6 15 12 9 18" /></svg>
}

function EmptyState() {
  return (
    <div style={{
      width: 366,   // 85% of 430px screen width
      flexShrink: 0,
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
      background: 'var(--glass-slab)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 80,
      paddingBottom: 52,
      gap: 8,
      transform: 'translateY(-50%)',  // center = 0, this = -0.5 in block units
    }}>
      <div style={{ opacity: 0.25, marginBottom: 4 }}>
        <CalendarOffIcon />
      </div>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 'var(--tt-title-small-size)',
        fontWeight: 'var(--tt-title-small-weight)',
        color: 'var(--cs-on-surface)',
        opacity: 0.40,
      }}>
        No workouts scheduled
      </span>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 'var(--tt-body-small-size)',
        fontWeight: 'var(--tt-body-small-weight)',
        color: 'var(--cs-on-surface-variant)',
        opacity: 0.30,
      }}>
        Press + to add a workout
      </span>
    </div>
  )
}


const summaryCard = { flexShrink: 0, background: 'var(--glass-low-bg)', borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--cs-outline-rgb),0.20)' }
const pctDone = s => (s.total ? Math.round((s.completed / s.total) * 100) : 0)

// ── Selected-day summary — calm progress rows. Workouts = one overall bar; Nutrition
// = overall kcal + a 3-section bar (protein / carbs / fat), each filling to its goal.
function DaySummary({ stats, nut }) {
  const macros = [
    { key: 'Protein', g: nut.p, goal: nut.pGoal, ch: '--cat-blue-rgb' },
    { key: 'Carbs', g: nut.c, goal: nut.cGoal, ch: '--cat-amber-rgb' },
    { key: 'Fat', g: nut.f, goal: nut.fGoal, ch: '--cat-pink-rgb' },
  ]
  const headRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }
  const lbl = { ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }
  const val = { ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)' }
  return (
    <div style={{ ...summaryCard, padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Workouts — single overall bar */}
      <div>
        <div style={headRow}>
          <span style={lbl}>Workouts</span>
          <span style={val}>{stats.completed} of {stats.total} done</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${pctDone(stats)}%`, height: '100%', borderRadius: 3, background: 'var(--cs-tertiary)', opacity: 0.85, transition: 'width 0.25s' }} />
        </div>
      </div>

      {/* Nutrition — overall kcal (general) + 3 macro sections */}
      <div>
        <div style={headRow}>
          <span style={lbl}>Nutrition</span>
          <span style={val}>{nut.kcal.toLocaleString()} / {nut.goal.toLocaleString()} kcal</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {macros.map(m => {
            const mp = m.goal ? Math.min(100, Math.round((m.g / m.goal) * 100)) : 0
            return (
              <div key={m.key} style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${mp}%`, height: '100%', borderRadius: 4, background: `rgba(var(${m.ch}),1)`, opacity: 0.9, transition: 'width 0.25s' }} />
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
          {macros.map(m => (
            <div key={m.key} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: `rgba(var(${m.ch}),1)` }} />
                <span style={{ ...TT, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{m.key}</span>
              </div>
              <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)' }}>
                <span style={{ fontWeight: 600, color: 'var(--cs-on-surface)' }}>{m.g}</span> / {m.goal} g
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function CalendarOffIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="10" y1="14" x2="14" y2="18" />
      <line x1="14" y1="14" x2="10" y2="18" />
    </svg>
  )
}
