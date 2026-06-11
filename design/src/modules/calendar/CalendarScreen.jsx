import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import DateCell from '../../components/DateCell.jsx'
import ScheduleHeader from '../../components/ScheduleHeader.jsx'
import TaskItem from '../../components/TaskItem.jsx'
import { LibrariesView } from '../libraries/index.js'

const TT = { fontFamily: 'var(--tt-font-family)' }
const USER = { name: 'Serhii Buhai', email: 'serhii.work@gmail.com', initials: 'SB' }
// Nutrition goals (per day) — consumed values are derived from completed meal items.
const GOALS = { kcal: 2200, p: 150, c: 230, f: 70 }

// Plan templates. Items are typed (kind: workout | meal); meals carry kcal + macros so
// the day's nutrition is computed from what's actually checked off.
const PLANS = {
  full: [
    { kind: 'workout', title: 'Morning Strength', time: '07:00 AM', exerciseCount: 8, status: 'Completed' },
    { kind: 'meal', title: 'Breakfast', time: '08:00 AM', kcal: 560, p: 32, c: 62, f: 22, status: 'Completed' },
    { kind: 'workout', title: 'Mobility Training', time: '08:30 AM', exerciseCount: 7, status: 'Completed' },
    { kind: 'workout', title: 'Leg Day', time: '10:00 AM', exerciseCount: 12, status: 'Planned' },
    { kind: 'meal', title: 'Lunch', time: '12:30 PM', kcal: 680, p: 42, c: 75, f: 25, status: 'Completed' },
    { kind: 'workout', title: 'Core Workout', time: '03:00 PM', exerciseCount: 10, status: 'Planned' },
    { kind: 'workout', title: 'Evening Yoga', time: '06:30 PM', exerciseCount: 5, status: 'Planned' },
    { kind: 'meal', title: 'Dinner', time: '07:30 PM', kcal: 540, p: 38, c: 55, f: 18, status: 'Planned' },
  ],
  light: [
    { kind: 'meal', title: 'Breakfast', time: '08:00 AM', kcal: 520, p: 30, c: 60, f: 18, status: 'Completed' },
    { kind: 'workout', title: 'Upper Body', time: '06:00 PM', exerciseCount: 9, status: 'Planned' },
    { kind: 'meal', title: 'Dinner', time: '07:30 PM', kcal: 610, p: 45, c: 62, f: 23, status: 'Planned' },
  ],
  empty: [],
}

// Selectable demo week. tense drives initial item statuses: future → all Planned;
// past + today keep the plan's authored mix — past days show what actually happened,
// so their uncompleted items surface the "Missed" label. `init` can still override.
const WEEK = [
  { weekday: 'Sun', day: '10', date: 'May 10', plan: 'light', tense: 'past' },
  { weekday: 'Mon', day: '11', date: 'May 11', plan: 'full', tense: 'past' },
  { weekday: 'Tue', day: '12', date: 'May 12', plan: 'empty', tense: 'past' },
  { weekday: 'Wed', day: '13', date: 'May 13', plan: 'full', tense: 'today' },
  { weekday: 'Thu', day: '14', date: 'May 14', plan: 'light', tense: 'future' },
  { weekday: 'Fri', day: '15', date: 'May 15', plan: 'full', tense: 'future' },
  { weekday: 'Sat', day: '16', date: 'May 16', plan: 'empty', tense: 'future' },
]
const WEEKDAY_FULL = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }

const initWeekItems = () => Object.fromEntries(WEEK.map(w => {
  const init = w.init ?? (w.tense === 'future' ? 'planned' : 'authored')
  return [w.day, PLANS[w.plan].map(it => ({
    ...it,
    status: init === 'done' ? 'Completed' : init === 'planned' ? 'Planned' : it.status,
  }))]
}))

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

export default function CalendarScreen({ initialDay = '13' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lib, setLib] = useState(null)
  const [selected, setSelected] = useState(initialDay)
  const [weekItems, setWeekItems] = useState(initWeekItems)

  const selDay = WEEK.find(w => w.day === selected) ?? WEEK[3]
  const items = weekItems[selected] ?? []
  const workouts = items.filter(t => t.kind === 'workout')
  const meals = items.filter(t => t.kind === 'meal')
  const eaten = meals.filter(t => t.status === 'Completed')
  const dayStats = {
    wTotal: workouts.length,
    wDone: workouts.filter(t => t.status === 'Completed').length,
    exercises: workouts.reduce((s, t) => s + t.exerciseCount, 0),
    mTotal: meals.length,
    mDone: eaten.length,
  }
  const nut = {
    kcal: eaten.reduce((s, t) => s + t.kcal, 0), goal: GOALS.kcal,
    p: eaten.reduce((s, t) => s + t.p, 0), pGoal: GOALS.p,
    c: eaten.reduce((s, t) => s + t.c, 0), cGoal: GOALS.c,
    f: eaten.reduce((s, t) => s + t.f, 0), fGoal: GOALS.f,
  }
  const dayCompleted = d => (weekItems[d] ?? []).length > 0 && weekItems[d].every(t => t.status === 'Completed')
  const toggleItem = title => setWeekItems(w => ({
    ...w,
    [selected]: w[selected].map(it => it.title === title
      ? { ...it, status: it.status === 'Completed' ? 'Planned' : 'Completed' }
      : it),
  }))
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

          {/* Date row — selectable; completed dot derived from the day's items */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
            {WEEK.map(({ weekday, day, tense }) => (
              <DateCell key={day} weekday={weekday} day={day}
                state={selected === day ? 'selected' : tense === 'today' ? 'today' : 'default'}
                completed={dayCompleted(day)}
                onClick={() => setSelected(day)} />
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
        <ScheduleHeader subtitle={`${WEEKDAY_FULL[selDay.weekday]}, ${selDay.date}`} />

        {items.length > 0 ? (
          <>
            <DaySummary stats={dayStats} nut={nut} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((task) => (
                <TaskItem key={task.title} {...task} missed={selDay.tense === 'past'} onToggle={() => toggleItem(task.title)} />
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

// ── Selected-day summary — calm progress rows, both segmented per item. Workouts =
// 1 segment per workout (completed filled emerald); Nutrition = 1 segment per meal
// (eaten filled slate) + kcal value + one-line macro legend (P / C / F).
function SegmentBar({ total, done, color }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: i < done ? color : 'rgba(var(--overlay-rgb),0.06)',
          opacity: i < done ? 0.85 : 1,
        }} />
      ))}
    </div>
  )
}

function DaySummary({ stats, nut }) {
  const macros = [
    { key: 'P', g: nut.p, goal: nut.pGoal, ch: '--cat-blue-rgb' },
    { key: 'C', g: nut.c, goal: nut.cGoal, ch: '--cat-amber-rgb' },
    { key: 'F', g: nut.f, goal: nut.fGoal, ch: '--cat-pink-rgb' },
  ]
  const headRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }
  const lbl = { ...TT, fontSize: 'var(--tt-title-small-size)', fontWeight: 'var(--tt-title-small-weight)', letterSpacing: 'var(--tt-title-small-tracking)', color: 'var(--cs-on-surface)' }
  const val = { ...TT, fontSize: 'var(--tt-body-small-size)', fontWeight: 'var(--tt-body-small-weight)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)' }
  return (
    <div style={{ ...summaryCard, padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Workouts — segmented bar, one segment per workout */}
      {stats.wTotal > 0 && (
        <div>
          <div style={headRow}>
            <span style={lbl}>Workouts</span>
            <span style={val}>
              {stats.wTotal === 1 ? (stats.wDone ? 'Completed' : 'Planned') : `${stats.wDone} of ${stats.wTotal}`}
              {' · '}{stats.exercises} exercises
            </span>
          </div>
          <SegmentBar total={stats.wTotal} done={stats.wDone} color="var(--cs-status-completed)" />
        </div>
      )}

      {/* Nutrition — segmented bar, one segment per meal + macro legend */}
      {stats.mTotal > 0 && (
        <div>
          <div style={headRow}>
            <span style={lbl}>Nutrition</span>
            <span style={val}>{nut.kcal.toLocaleString()} / {nut.goal.toLocaleString()} kcal</span>
          </div>
          <SegmentBar total={stats.mTotal} done={stats.mDone} color="var(--cs-primary)" />
          <div style={{ display: 'flex', gap: 18, marginTop: 9 }}>
            {macros.map(m => (
              <span key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: `rgba(var(${m.ch}),1)` }} />
                <span style={val}>
                  <span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{m.key} {m.g}</span> / {m.goal} g
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
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
