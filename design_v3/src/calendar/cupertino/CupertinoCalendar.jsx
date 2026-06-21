import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import { useCalendar } from '../useCalendar.js'
import {
  MONTH_LABEL, TODAY, WEEKS, WD, WEEKDAY_FULL, dateLabel, PLAN, dayDot,
  readinessScore, readinessTier,
} from '../calendarModel.js'
import * as G from '../glyphs.jsx'
import CupertinoDetail from './CupertinoDetail.jsx'

// ── Cupertino (iOS HIG) skin ────────────────────────────────────────────────
// Vibrancy nav bar (blur), large title, week strip with RED today, inset-grouped
// lists, page-sheet detail, action-sheet add, transient toast undo, presented menu.
const TT = { fontFamily: 'var(--tt-font-family)', WebkitFontSmoothing: 'antialiased' }
const NUM = { ...TT, fontVariantNumeric: 'tabular-nums' }
const VIBRANCY = { background: 'var(--ios-material)', backdropFilter: 'var(--ios-blur)', WebkitBackdropFilter: 'var(--ios-blur)' }

export default function CupertinoCalendar(props) {
  const c = useCalendar(props)
  const { day, items, selected, isToday, isPast } = c
  const [addOpen, setAddOpen] = useState(false)

  return (
    <PhoneFrame>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* sticky vibrancy header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, ...VIBRANCY, borderBottom: '0.5px solid var(--ios-separator)' }}>
          <StatusBar />
          <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <button onClick={() => c.setMenuOpen(true)} style={navBtn}><G.Menu s={22} /></button>
            <div style={{ display: 'flex', gap: 18 }}>
              <button style={navBtn}><G.Gear s={21} /></button>
              <button onClick={() => setAddOpen(true)} style={navBtn}><G.Plus s={22} /></button>
            </div>
          </div>
          {/* large title = month, tappable toggle */}
          <button onClick={c.toggleMonth} style={{ ...TT, display: 'flex', alignItems: 'center', gap: 6, padding: '2px 16px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ios-label)', letterSpacing: '0.3px' }}>{c.monthOpen && c.ghostMonth ? c.ghostMonth.label : MONTH_LABEL}</span>
            <span style={{ display: 'flex', color: 'var(--ios-blue)', transform: c.monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><G.ChevDown s={18} /></span>
          </button>
          {/* date strip */}
          <div {...c.swipeHandlers} style={{ touchAction: 'pan-y', overflow: 'hidden', cursor: 'grab', padding: '0 8px 8px' }}>
            <div style={{ transform: `translateX(${c.dragShift}px)`, transition: c.dragShift === 0 ? 'transform 0.25s ease' : 'none' }}>
              {c.monthOpen ? <MonthGrid c={c} ghost={c.ghostMonth} /> : <WeekRow c={c} />}
            </div>
          </div>
        </div>

        {/* schedule */}
        <div style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ ...TT, fontSize: 13, color: 'var(--ios-label-2)', paddingLeft: 4 }}>{WEEKDAY_FULL[day.weekday]}, {dateLabel(selected)}{!isToday && ' · '}{!isToday && <span onClick={() => c.selectDay(TODAY)} style={{ color: 'var(--ios-blue)', cursor: 'pointer' }}>Today</span>}</span>

          {isToday && <Readiness value={day.readiness} onSet={c.setReadiness} />}
          {isPast && day.readiness && <Readiness value={day.readiness} readOnly />}

          {items.length > 0 ? (
            <>
              <DaySummary c={c} />
              <Group header="SCHEDULE">
                {items.map((it, i) => <Row key={it.id} it={it} missed={isPast} first={!i} onClick={() => c.openDetail(it.id)} />)}
              </Group>
            </>
          ) : <Empty />}
        </div>
      </div>

      {addOpen && <ActionSheet c={c} onClose={() => setAddOpen(false)} />}
      {c.snack && <Toast msg={c.snack.msg} onUndo={c.undo} />}
      <CupertinoDetail c={c} />
      <Menu open={c.menuOpen} onClose={() => c.setMenuOpen(false)} />
    </PhoneFrame>
  )
}

const navBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ios-blue)', display: 'flex', alignItems: 'center', padding: 0 }

// ── week strip (iOS) ──
function WeekRow({ c }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      {WEEKS[c.weekIdx].map((n, i) => (
        n == null ? <span key={`b${i}`} style={{ width: 40 }} /> : <DateCell key={n} c={c} n={n} weekday={WD[i]} />
      ))}
    </div>
  )
}
function DateCell({ c, n, weekday }) {
  const sel = c.selected === n, today = n === TODAY, done = c.dayCompleted(n)
  const circleBg = sel ? (today ? 'var(--ios-red)' : 'var(--ios-label)') : 'transparent'
  const numCol = sel ? (today ? '#fff' : 'var(--ios-bg)') : (today ? 'var(--ios-red)' : 'var(--ios-label)')
  return (
    <button onClick={() => c.selectDay(n)} style={{ width: 40, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '2px 0' }}>
      <span style={{ ...TT, fontSize: 13, fontWeight: 400, color: today ? 'var(--ios-red)' : 'var(--ios-label-2)' }}>{weekday[0]}</span>
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: circleBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...NUM, fontSize: 20, fontWeight: sel ? 600 : 400, color: numCol }}>{n}</span>
      </span>
      <span style={{ height: 6 }}>{done && <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ios-green)' }} />}</span>
    </button>
  )
}

// ── month grid (iOS) ──
const DOT = { done: 'var(--ios-green)', missed: 'var(--ios-red)', has: 'var(--ios-label-3)' }
const chunk = (lead, days) => { const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]; while (cells.length % 7) cells.push(null); return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7)) }
function MonthGrid({ c, ghost }) {
  const weeks = ghost ? chunk(ghost.lead, ghost.days) : WEEKS
  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>
        {WD.map(d => <span key={d} style={{ ...TT, textAlign: 'center', fontSize: 12, color: 'var(--ios-label-2)' }}>{d[0]}</span>)}
      </div>
      {weeks.map((wk, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {wk.map((n, i) => {
            if (n == null) return <span key={`b${i}`} style={{ height: 46 }} />
            if (ghost) return <span key={n} style={{ ...NUM, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ios-label-3)' }}>{n}</span>
            const dot = dayDot(c.month[n]), sel = n === c.selected, today = n === TODAY
            const circleBg = sel ? (today ? 'var(--ios-red)' : 'var(--ios-label)') : 'transparent'
            const numCol = sel ? (today ? '#fff' : 'var(--ios-bg)') : (today ? 'var(--ios-red)' : 'var(--ios-label)')
            return (
              <button key={n} onClick={() => c.selectDay(n)} style={{ height: 46, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ width: 33, height: 33, borderRadius: '50%', background: circleBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...NUM, fontSize: 18, fontWeight: sel ? 600 : 400, color: numCol }}>{n}</span>
                </span>
                <span style={{ height: 5 }}>{dot && <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: DOT[dot.kind] }} />}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── inset grouped list ──
function Group({ header, footer, children }) {
  return (
    <div>
      {header && <p style={{ ...TT, fontSize: 13, color: 'var(--ios-label-2)', padding: '0 16px 6px', letterSpacing: '0.5px' }}>{header}</p>}
      <div style={{ background: 'var(--ios-card)', borderRadius: 'var(--ios-r-card)', overflow: 'hidden' }}>{children}</div>
      {footer && <p style={{ ...TT, fontSize: 12, color: 'var(--ios-label-2)', padding: '6px 16px 0' }}>{footer}</p>}
    </div>
  )
}
function Row({ it, missed, first, onClick }) {
  const completed = it.status === 'Completed'
  const tint = completed ? 'var(--ios-green)' : it.kind === 'meal' ? 'var(--ios-orange)' : 'var(--ios-blue)'
  const status = completed ? { t: 'Done', c: 'var(--ios-green)' } : missed ? { t: 'Missed', c: 'var(--ios-red)' } : null
  return (
    <>
      {!first && <div style={{ height: '0.5px', background: 'var(--ios-separator)', marginLeft: 52 }} />}
      <button onClick={onClick} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: tint, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.kind === 'meal' ? <G.Meal s={15} /> : <G.Activity s={15} />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...TT, fontSize: 17, color: 'var(--ios-label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</p>
          <p style={{ ...NUM, fontSize: 13, color: 'var(--ios-label-2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.time}{it.kind === 'meal' ? ` · ${it.kcal} kcal` : completed && it.result ? ` · ${it.result.tonnage.toLocaleString()} kg` : ` · ${it.exerciseCount} ex`}{it.fromPlan ? ` · ${PLAN.name}` : ''}</p>
        </div>
        {status && <span style={{ ...TT, fontSize: 13, color: status.c }}>{status.t}</span>}
        <span style={{ display: 'flex', color: 'var(--ios-label-3)' }}><G.ChevRight s={16} /></span>
      </button>
    </>
  )
}

// ── day summary (inset grouped, 2 sections) ──
function DaySummary({ c }) {
  const { stats, nut, dayLoad: load } = c
  return (
    <Group header="SUMMARY">
      {stats.wTotal > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...TT, fontSize: 15, color: 'var(--ios-label)' }}>Workouts</span><span style={{ ...NUM, fontSize: 13, color: 'var(--ios-label-2)' }}>{stats.wDone} of {stats.wTotal} · {stats.exercises} ex</span></div>
          <Seg total={stats.wTotal} done={stats.wDone} color="var(--ios-green)" />
          {load && <p style={{ ...NUM, fontSize: 12, color: 'var(--ios-label-2)', marginTop: 8 }}>Load · <b style={{ color: 'var(--ios-label)' }}>{load.tonnage.toLocaleString()} kg</b> · <b style={{ color: 'var(--ios-label)' }}>{load.au} AU</b> · {load.minutes} min</p>}
        </div>
      )}
      {stats.mTotal > 0 && <>
        <div style={{ height: '0.5px', background: 'var(--ios-separator)', marginLeft: 16 }} />
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...TT, fontSize: 15, color: 'var(--ios-label)' }}>Nutrition</span><span style={{ ...NUM, fontSize: 13, color: 'var(--ios-label-2)' }}>{nut.kcal.toLocaleString()} / {nut.goal.toLocaleString()} kcal</span></div>
          <Seg total={stats.mTotal} done={stats.mDone} color="var(--ios-blue)" />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>{[['P', nut.p, '--cat-p-rgb'], ['C', nut.c, '--cat-c-rgb'], ['F', nut.f, '--cat-f-rgb']].map(([k, v, ch]) => <span key={k} style={{ ...NUM, fontSize: 12, color: 'var(--ios-label-2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${ch}),1)` }} /><b style={{ color: 'var(--ios-label)' }}>{k} {v}</b>g</span>)}</div>
        </div>
      </>}
    </Group>
  )
}
function Seg({ total, done, color }) { return <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: total }, (_, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < done ? color : 'var(--ios-fill-2)' }} />)}</div> }

// ── readiness ──
const FACTORS = [['sleep', 'Sleep'], ['soreness', 'Soreness'], ['energy', 'Energy']]
const TIER_C = { Good: 'var(--ios-green)', Okay: 'var(--ios-orange)', Rough: 'var(--ios-red)' }
function Readiness({ value, onSet, readOnly }) {
  const [draft, setDraft] = useState({})
  if (value) {
    const score = readinessScore(value), tier = readinessTier(score)
    return <Group><div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_C[tier] }} /><span style={{ ...NUM, fontSize: 15, color: 'var(--ios-label)' }}>Readiness <b>{score}</b><span style={{ color: 'var(--ios-label-2)' }}>{FACTORS.map(([k, l]) => ` · ${l} ${value[k]}`)}</span></span>{!readOnly && <span style={{ ...TT, marginLeft: 'auto', fontSize: 13, color: 'var(--ios-blue)' }}>Edit</span>}</div></Group>
  }
  const set = (k, v) => { const next = { ...draft, [k]: v }; setDraft(next); if (FACTORS.every(([f]) => next[f])) { onSet(next); setDraft({}) } }
  return (
    <Group header="HOW ARE YOU TODAY?">
      {FACTORS.map(([k, l], idx) => (
        <div key={k}>
          {idx > 0 && <div style={{ height: '0.5px', background: 'var(--ios-separator)', marginLeft: 16 }} />}
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...TT, fontSize: 15, color: 'var(--ios-label)', width: 76 }}>{l}</span>
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>{[1, 2, 3, 4, 5].map(v => <button key={v} onClick={() => set(k, v)} style={{ flex: 1, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer', background: draft[k] >= v ? 'var(--ios-blue)' : 'var(--ios-fill)' }} />)}</div>
          </div>
        </div>
      ))}
    </Group>
  )
}

function Empty() {
  return <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--ios-label-3)' }}><G.CalOff s={44} /></span><span style={{ ...TT, fontSize: 16, color: 'var(--ios-label-2)' }}>No Events</span><span style={{ ...TT, fontSize: 13, color: 'var(--ios-label-3)' }}>Tap + to add a workout</span></div>
}

// ── action sheet (add) ──
function ActionSheet({ c, onClose }) {
  const acts = [
    { label: 'Schedule Workout', on: c.scheduleWorkout },
    { label: 'Schedule Meal', on: c.scheduleMeal },
    { label: 'Log Meal', on: c.logMeal },
  ]
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10, animation: 'iosfade 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ animation: 'iosup 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ borderRadius: 14, overflow: 'hidden', ...VIBRANCY, marginBottom: 8 }}>
          {acts.map((a, i) => <button key={a.label} onClick={() => { onClose(); a.on() }} style={{ ...TT, width: '100%', height: 57, fontSize: 20, color: 'var(--ios-blue)', background: 'none', border: 'none', borderTop: i ? '0.5px solid var(--ios-separator)' : 'none', cursor: 'pointer' }}>{a.label}</button>)}
        </div>
        <button onClick={onClose} style={{ ...TT, width: '100%', height: 57, borderRadius: 14, fontSize: 20, fontWeight: 600, color: 'var(--ios-blue)', background: 'var(--ios-elevated)', border: 'none', cursor: 'pointer' }}>Cancel</button>
      </div>
      <style>{`@keyframes iosfade{from{opacity:0}to{opacity:1}}@keyframes iosup{from{transform:translateY(100%)}to{transform:none}}`}</style>
    </div>
  )
}

// ── transient toast (iOS has no Snackbar) ──
function Toast({ msg, onUndo }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, zIndex: 62, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderRadius: 'var(--ios-r-card)', ...VIBRANCY, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'iosup 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <span style={{ ...TT, fontSize: 14, color: 'var(--ios-label)' }}>{msg}</span>
        <button onClick={onUndo} style={{ ...TT, fontSize: 14, fontWeight: 600, color: 'var(--ios-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>Undo</button>
      </div>
    </div>
  )
}

// ── menu (presented modal sheet — iOS has no left drawer) ──
const LIBS = ['Exercises', 'Workouts', 'Meals', 'Plans']
function Menu({ open, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 64, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }} />
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, bottom: 0, background: 'var(--ios-bg)', borderRadius: '14px 14px 0 0', transform: open ? 'none' : 'translateY(100%)', transition: 'transform 0.34s cubic-bezier(0.32,0.72,0,1)', padding: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 12px' }}><div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--ios-label-3)' }} /></div>
        <p style={{ ...TT, fontSize: 22, fontWeight: 700, color: 'var(--ios-label)', padding: '4px 20px 14px' }}>Fitness</p>
        <Group header="LIBRARIES">
          {LIBS.map((l, i) => <button key={l} onClick={onClose} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', borderTop: i ? '0.5px solid var(--ios-separator)' : 'none', cursor: 'pointer', fontSize: 17, color: 'var(--ios-label)' }}>{l}<span style={{ color: 'var(--ios-label-3)', display: 'flex' }}><G.ChevRight s={16} /></span></button>)}
        </Group>
      </div>
    </div>
  )
}
