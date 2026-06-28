import { useState, useRef } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import DateCell from '../../components/DateCell.jsx'
import TaskItem from '../../components/TaskItem.jsx'
import FabMenu from '../../components/FabMenu.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import { LibrariesView } from '../libraries/index.js'
import {
  MONTH_LABEL, TODAY, WEEKS, WD, WEEKDAY_FULL, weekIndexOf, dateLabel, PLAN, NEIGHBOR_MONTHS,
  initMonth, computeDayStats, computeNut, computeDayLoad, isDone,
  patchDay, addItem, moveItem, deleteItem, setEaten, setNote,
} from './calendarModel.js'
import { DaySummary, ReadinessCard, MonthGrid } from './CalendarWidgets.jsx'
import ItemDetailDialog from './ItemDetailDialog.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const USER = { name: 'Serhii Buhai', email: 'serhii.work@gmail.com', initials: 'SB' }

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

// block group — a quiet section label tight above its content block
const blockGroup = { display: 'flex', flexDirection: 'column', gap: 8 }
const sectionLabel = {
  ...TT,
  paddingLeft: 2,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--cs-on-surface-variant)',
  opacity: 0.5,
}
function SectionLabel({ children }) {
  return <span style={sectionLabel}>{children}</span>
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

// edge-peek — the adjacent week's nearest day (last of the previous week /
// first of the next), shown as a faint sliver so the strip reads as swipeable
const weekPeek = (month, wi, edge) => {
  const days = (WEEKS[wi] ?? []).filter(n => n != null)
  if (!days.length) return null
  const n = edge === 'last' ? days[days.length - 1] : days[0]
  return { weekday: month[n].weekday, day: String(n), state: 'default' }
}

export default function CalendarScreen({ initialDay = TODAY, initialMonthOpen = false, initialDetailId = null, timeline = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lib, setLib] = useState(null)
  const [month, setMonth] = useState(initMonth)
  const [selected, setSelected] = useState(initialDay)
  const [weekIdx, setWeekIdx] = useState(Math.max(0, weekIndexOf(initialDay)))
  const [monthOpen, setMonthOpen] = useState(initialMonthOpen)
  const [monthOffset, setMonthOffset] = useState(0) // -1 Apr / 0 May / 1 Jun (ghost months)
  const [fabOpen, setFabOpen] = useState(false)
  const [detailId, setDetailId] = useState(initialDetailId)

  const day = month[selected]
  const items = day.items
  const stats = computeDayStats(items)
  const nut = computeNut(items)
  const dayLoad = computeDayLoad(items)
  const isToday = selected === TODAY
  const isPast = day.tense === 'past'
  const dayCompleted = n => month[n].items.length > 0 && month[n].items.every(isDone)

  const selectDay = n => { setSelected(n); setWeekIdx(Math.max(0, weekIndexOf(n))); setMonthOpen(false); setMonthOffset(0) }

  // ── undo snackbar — planning ops (move / delete / eaten) keep the previous
  //    month snapshot; Undo swaps it back ──
  const [snack, setSnack] = useState(null)
  const snackTimer = useRef(null)
  const showSnack = (msg, prev) => {
    clearTimeout(snackTimer.current)
    setSnack({ msg, prev })
    snackTimer.current = setTimeout(() => setSnack(null), 4000)
  }
  const undo = () => { clearTimeout(snackTimer.current); setMonth(snack.prev); setSnack(null) }

  // ── item detail dialog — tap on a card opens it; its actions are the only
  //    planning ops (workout completion lives in the Workout Runner) ──
  const detailItem = detailId ? items.find(it => it.id === detailId) ?? null : null
  const detailHandlers = {
    onClose: () => setDetailId(null),
    onMove: toN => {
      const prev = month
      setMonth(m => moveItem(m, selected, detailId, toN))
      setDetailId(null)
      showSnack(`Moved to ${dateLabel(toN)}`, prev)
    },
    onDelete: () => {
      const prev = month
      setMonth(m => deleteItem(m, selected, detailId))
      setDetailId(null)
      showSnack('Deleted', prev)
    },
    onSetEaten: eaten => {
      const prev = month
      setMonth(m => setEaten(m, selected, detailId, eaten))
      setDetailId(null)
      showSnack(eaten ? 'Marked eaten' : 'Marked not eaten', prev)
    },
    onSetNote: note => setMonth(m => setNote(m, selected, detailId, note)),
  }

  // ── horizontal swipe on the date strip: week view pages weeks, month view pages months ──
  const swipeStart = useRef(null)
  const [dragX, setDragX] = useState(0)
  const shiftWeek = dir => {
    const wi = Math.max(0, Math.min(WEEKS.length - 1, weekIdx + dir))
    if (wi === weekIdx) return
    setWeekIdx(wi)
    setSelected(WEEKS[wi][WD.indexOf(day.weekday)] ?? WEEKS[wi].find(x => x != null))
  }
  const swipeHandlers = {
    onPointerDown: e => { swipeStart.current = e.clientX },
    onPointerMove: e => { if (swipeStart.current != null) setDragX(e.clientX - swipeStart.current) },
    onPointerUp: () => {
      if (swipeStart.current == null) return
      const d = dragX
      swipeStart.current = null
      setDragX(0)
      if (Math.abs(d) < 60) return
      const dir = d < 0 ? 1 : -1 // swipe left → next
      if (monthOpen) setMonthOffset(o => Math.max(-1, Math.min(1, o + dir)))
      else shiftWeek(dir)
    },
    onPointerLeave: () => { if (swipeStart.current != null) { swipeStart.current = null; setDragX(0) } },
  }
  const dragShift = Math.max(-70, Math.min(70, dragX / 2)) // follow with resistance
  // FAB menu actions — demo items land in the selected day (ad-hoc: no plan tag)
  const scheduleWorkout = () => setMonth(m => addItem(m, selected, { kind: 'workout', title: 'Quick Workout', time: '05:00 PM', exerciseCount: 6, status: 'Planned' }))
  const scheduleMeal = () => setMonth(m => addItem(m, selected, { kind: 'meal', title: 'Snack', time: '04:00 PM', kcal: 280, p: 18, c: 30, f: 9, status: 'Planned' }))
  const logMeal = () => setMonth(m => addItem(m, selected, { kind: 'meal', title: 'Snack', time: '04:00 PM', kcal: 280, p: 18, c: 30, f: 9, status: 'Completed' }))

  return (
    <PhoneFrame smokeVariant="shader">
      {/* Calendar Card — unified glass slab, full-bleed from top, no border-radius */}
      <div style={cardSlab}>
        <StatusBar />

        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Bar */}
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              {/* Month label = week/month toggle (chevron flips when open); the
                  faint pill backing marks it as tappable without shouting */}
              <button onClick={() => { setMonthOpen(o => !o); setMonthOffset(0) }} style={{
                ...TT, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px',
                background: 'rgba(var(--overlay-rgb),0.06)', border: 'none',
                borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                fontSize: 'var(--tt-body-small-size)',
                fontWeight: 'var(--tt-body-small-weight)',
                letterSpacing: 'var(--tt-body-small-tracking)',
                color: 'var(--cs-on-surface-variant)',
              }}>
                {monthOpen && monthOffset !== 0 ? NEIGHBOR_MONTHS[monthOffset].label : MONTH_LABEL}
                <span style={{ display: 'flex', transform: monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }}>
                  <ChevDown />
                </span>
              </button>
            </div>

            <div style={iconBtn}>
              <SettingsIcon />
            </div>
          </div>

          {/* Date strip: week row ⇄ inline month grid (same slab, no dialog).
              Horizontal swipe pages weeks (week view) / months (month view). */}
          <div {...swipeHandlers} style={{ touchAction: 'pan-y', overflow: 'hidden', cursor: 'grab' }}>
            <div style={{
              transform: `translateX(${dragShift}px)`,
              transition: dragX === 0 ? 'transform 0.25s ease' : 'none',
            }}>
              {monthOpen ? (
                <MonthGrid month={month} selected={selected} onSelect={selectDay}
                  ghost={monthOffset !== 0 ? NEIGHBOR_MONTHS[monthOffset] : null} />
              ) : (
                <div style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                  {/* edge-peek — slivers of the neighbouring weeks' cells make the
                      strip read as swipeable (clipped by the swipe wrapper) */}
                  {weekPeek(month, weekIdx - 1, 'last') && (
                    <div style={{ position: 'absolute', left: -44, opacity: 0.25, pointerEvents: 'none' }}>
                      <DateCell {...weekPeek(month, weekIdx - 1, 'last')} />
                    </div>
                  )}
                  {WEEKS[weekIdx].map((n, i) => (
                    n == null
                      ? <span key={`b${i}`} style={{ width: 52, height: 76, flexShrink: 0 }} />
                      : <DateCell key={n} weekday={month[n].weekday} day={String(n)}
                          state={selected === n ? 'selected' : n === TODAY ? 'today' : 'default'}
                          completed={dayCompleted(n)}
                          onClick={() => selectDay(n)} />
                  ))}
                  {weekPeek(month, weekIdx + 1, 'first') && (
                    <div style={{ position: 'absolute', right: -44, opacity: 0.25, pointerEvents: 'none' }}>
                      <DateCell {...weekPeek(month, weekIdx + 1, 'first')} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '20px 16px 96px',
        overflowY: 'auto',
      }}>
        {/* quiet date caption — full weekday for orientation after month-grid
            jumps; a Today pill appears whenever the selection wandered off */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{
            ...TT,
            fontSize: 'var(--tt-body-medium-size)',
            fontWeight: 'var(--tt-body-medium-weight)',
            letterSpacing: 'var(--tt-body-medium-tracking)',
            color: 'var(--cs-on-surface-variant)',
          }}>
            {WEEKDAY_FULL[day.weekday]}, {dateLabel(selected)}
          </span>
          {!isToday && (
            <button onClick={() => selectDay(TODAY)} style={{
              ...TT, fontSize: 11, fontWeight: 500, padding: '4px 12px', cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(var(--overlay-rgb),0.05)',
              border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
              color: 'var(--cs-on-surface-variant)',
            }}>
              Today
            </button>
          )}
        </div>

        {/* readiness — interactive check-in today, read-only history on past days */}
        {(isToday || (isPast && day.readiness)) && (
          <div style={blockGroup}>
            <SectionLabel>How are you today?</SectionLabel>
            {isToday && <ReadinessCard value={day.readiness} onSet={v => setMonth(m => patchDay(m, selected, { readiness: v }))} />}
            {isPast && day.readiness && <ReadinessCard value={day.readiness} readOnly />}
          </div>
        )}

        {items.length > 0 ? (
          <>
            <div style={blockGroup}>
              <SectionLabel>Summary</SectionLabel>
              <DaySummary stats={stats} load={dayLoad} nut={nut} />
            </div>
            <div style={blockGroup}>
              <SectionLabel>Schedule</SectionLabel>
              {timeline ? (
                /* timeline — time gutter + status-node rail, cards on the right */
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map((task, i) => {
                    const nodeColor = task.status === 'Completed'
                      ? 'var(--cs-status-completed)'
                      : isPast ? 'rgba(var(--cs-error-rgb),0.65)' : 'var(--cs-status-planned)'
                    const [hhmm, mer] = task.time.split(' ')
                    const isFirst = i === 0
                    const isLast = i === items.length - 1
                    return (
                      <div key={task.id} style={{ display: 'flex' }}>
                        {/* time gutter */}
                        <div style={{ width: 52, flexShrink: 0, height: 88, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 }}>
                          <span style={{ ...TT, fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, color: 'var(--cs-on-surface)' }}>{hhmm}</span>
                          {mer && <span style={{ ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{mer}</span>}
                        </div>
                        {/* rail with status node */}
                        <div style={{ width: 22, flexShrink: 0, position: 'relative' }}>
                          {!isFirst && <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, height: 44, width: 2, background: 'rgba(var(--overlay-rgb),0.13)' }} />}
                          {!isLast && <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 44, bottom: 0, width: 2, background: 'rgba(var(--overlay-rgb),0.13)' }} />}
                          <div style={{ position: 'absolute', left: '50%', top: 44, transform: 'translate(-50%,-50%)', width: 11, height: 11, borderRadius: '50%', background: nodeColor, boxShadow: '0 0 0 3px var(--cs-surface)', zIndex: 1 }} />
                        </div>
                        {/* card (time lives in the gutter now) */}
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 14 }}>
                          <TaskItem {...task} hideTime hideAccent
                            plan={task.fromPlan ? PLAN.name : undefined}
                            missed={isPast}
                            onClick={() => setDetailId(task.id)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* plain list — original tiles with time + status accent strip */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map(task => (
                    <TaskItem key={task.id} {...task}
                      plan={task.fromPlan ? PLAN.name : undefined}
                      missed={isPast}
                      onClick={() => setDetailId(task.id)} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon={<CalendarOffIcon />} title="No workouts scheduled" caption="Press + to add a workout" style={{ transform: 'translateY(-50%)' }} />
          </div>
        )}
      </div>

      {/* ── Footer — FAB menu (shared FabMenu, same recipe as Workout Builder) ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '12px 16px 28px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', pointerEvents: 'auto' }}>
          <FabMenu open={fabOpen} setOpen={setFabOpen} actions={[
            { label: 'Schedule workout', icon: <BarbellGlyph />, onClick: scheduleWorkout },
            { label: 'Schedule meal', icon: <MealGlyph />, onClick: scheduleMeal },
            { label: 'Log meal', icon: <LoggedMealGlyph />, dividerAbove: true, onClick: logMeal },
          ]} />
        </div>
      </div>

      {/* ── Undo snackbar — move / delete / eaten ops are reversible ── */}
      <Snackbar open={!!snack} message={snack?.msg} onAction={undo} />

      {/* ── Item detail dialog — container transform per the FabMenu recipe ── */}
      <ItemDetailDialog item={detailItem} tense={day.tense} month={month} dayN={selected} {...detailHandlers} />

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
        borderRight: '1px solid rgba(var(--overlay-rgb),0.08)', boxShadow: open ? '8px 0 40px rgba(var(--cs-shadow-rgb),0.50)' : 'none',
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
function LoggedMealGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...glyph}><circle cx="12" cy="12" r="9" /><polyline points="8.5 12.2 11 14.7 15.5 9.8" /></svg>
}
function PlanGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...glyph}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="7" y1="14" x2="9" y2="14" /><line x1="12" y1="14" x2="17" y2="14" /></svg>
}
function ChevR() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><polyline points="9 6 15 12 9 18" /></svg>
}
function ChevDown() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...glyph}><polyline points="6 9 12 15 18 9" /></svg>
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
