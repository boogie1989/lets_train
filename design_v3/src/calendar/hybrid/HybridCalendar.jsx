import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import { useCalendar } from '../useCalendar.js'
import {
  MONTH_LABEL, TODAY, WEEKS, WD, WEEKDAY_FULL, dateLabel, PLAN, dayDot,
  readinessScore, readinessTier,
} from '../calendarModel.js'
import * as G from '../glyphs.jsx'
import HybridDetail from './HybridDetail.jsx'

// ── HYBRID skin ─────────────────────────────────────────────────────────────
// Cupertino *aesthetic* (calm inset-grouped lists, hairlines, restraint) with
// Material *interaction grammar* (top app bar + hamburger drawer, FAB speed-dial,
// modal bottom sheet, Snackbar, accent today ring). Best fit for an app shipping
// to BOTH iOS and Android.
const TT = { fontFamily: 'var(--tt-font-family)' }
const NUM = { ...TT, fontVariantNumeric: 'tabular-nums' }

export default function HybridCalendar(props) {
  const c = useCalendar(props)
  const { day, items, selected, isToday, isPast } = c

  return (
    <PhoneFrame>
      {/* Material top app bar + date strip, on a calm grouped surface */}
      <div style={{ background: 'var(--hy-bg)', flexShrink: 0, borderBottom: '0.5px solid var(--hy-separator)' }}>
        <StatusBar />
        <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
          <IconBtn onClick={() => c.setMenuOpen(true)}><G.Menu s={22} /></IconBtn>
          <span style={{ ...TT, flex: 1, fontSize: 20, fontWeight: 600, color: 'var(--hy-label)' }}>Calendar</span>
          <IconBtn><G.Gear s={21} /></IconBtn>
        </div>
        <div style={{ display: 'flex', padding: '0 12px 10px' }}>
          <button onClick={c.toggleMonth} style={{ ...NUM, display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 'var(--hy-r)', border: 'none', background: c.monthOpen ? 'rgba(var(--hy-accent-rgb),0.14)' : 'var(--hy-fill)', color: c.monthOpen ? 'var(--hy-accent)' : 'var(--hy-label)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {c.monthOpen && c.ghostMonth ? c.ghostMonth.label : MONTH_LABEL}
            <span style={{ display: 'flex', transform: c.monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><G.ChevDown s={15} /></span>
          </button>
        </div>
        <div {...c.swipeHandlers} style={{ touchAction: 'pan-y', overflow: 'hidden', cursor: 'grab', padding: '0 8px 10px' }}>
          <div style={{ transform: `translateX(${c.dragShift}px)`, transition: c.dragShift === 0 ? 'transform 0.25s ease' : 'none' }}>
            {c.monthOpen ? <MonthGrid c={c} ghost={c.ghostMonth} /> : <WeekRow c={c} />}
          </div>
        </div>
      </div>

      {/* schedule — Cupertino inset-grouped aesthetic */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 110px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span style={{ ...TT, fontSize: 13, color: 'var(--hy-label-2)', paddingLeft: 4 }}>{WEEKDAY_FULL[day.weekday]}, {dateLabel(selected)}{!isToday && ' · '}{!isToday && <span onClick={() => c.selectDay(TODAY)} style={{ color: 'var(--hy-accent)', cursor: 'pointer' }}>Today</span>}</span>

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

      {/* FAB menu — design/ container-transform morph (square → panel, + → ×) */}
      <Footer c={c} />
      {/* Material Snackbar */}
      {c.snack && <Snackbar msg={c.snack.msg} onUndo={c.undo} />}
      {/* Material bottom-sheet detail */}
      <HybridDetail c={c} />
      {/* Material NavigationDrawer */}
      <Drawer open={c.menuOpen} onClose={() => c.setMenuOpen(false)} />
    </PhoneFrame>
  )
}

function IconBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--hy-label-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</button>
}

// ── week strip — accent fill selected, accent RING today (not red) ──
function WeekRow({ c }) {
  return <div style={{ display: 'flex', justifyContent: 'space-around' }}>{WEEKS[c.weekIdx].map((n, i) => n == null ? <span key={`b${i}`} style={{ width: 40 }} /> : <DateCell key={n} c={c} n={n} weekday={WD[i]} />)}</div>
}
function DateCell({ c, n, weekday }) {
  const sel = c.selected === n, today = n === TODAY, done = c.dayCompleted(n)
  return (
    <button onClick={() => c.selectDay(n)} style={{ width: 40, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '2px 0' }}>
      <span style={{ ...TT, fontSize: 13, color: 'var(--hy-label-2)' }}>{weekday[0]}</span>
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: sel ? 'var(--hy-accent)' : 'transparent', border: today && !sel ? '1.5px solid var(--hy-accent)' : '1.5px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...NUM, fontSize: 18, fontWeight: sel || today ? 600 : 400, color: sel ? 'var(--hy-on-accent)' : today ? 'var(--hy-accent)' : 'var(--hy-label)' }}>{n}</span>
      </span>
      <span style={{ height: 6 }}>{done && <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--hy-done)' }} />}</span>
    </button>
  )
}

// ── month grid ──
const DOT = { done: 'var(--hy-done)', missed: 'var(--hy-missed)', has: 'var(--hy-label-3)' }
const chunk = (lead, days) => { const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]; while (cells.length % 7) cells.push(null); return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7)) }
function MonthGrid({ c, ghost }) {
  const weeks = ghost ? chunk(ghost.lead, ghost.days) : WEEKS
  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>{WD.map(d => <span key={d} style={{ ...TT, textAlign: 'center', fontSize: 12, color: 'var(--hy-label-2)' }}>{d[0]}</span>)}</div>
      {weeks.map((wk, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {wk.map((n, i) => {
            if (n == null) return <span key={`b${i}`} style={{ height: 46 }} />
            if (ghost) return <span key={n} style={{ ...NUM, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: 'var(--hy-label-3)' }}>{n}</span>
            const dot = dayDot(c.month[n]), sel = n === c.selected, today = n === TODAY
            return (
              <button key={n} onClick={() => c.selectDay(n)} style={{ height: 46, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ width: 33, height: 33, borderRadius: '50%', background: sel ? 'var(--hy-accent)' : 'transparent', border: today && !sel ? '1.5px solid var(--hy-accent)' : '1.5px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...NUM, fontSize: 17, fontWeight: sel || today ? 600 : 400, color: sel ? 'var(--hy-on-accent)' : today ? 'var(--hy-accent)' : 'var(--hy-label)' }}>{n}</span>
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

// ── inset-grouped list (Cupertino aesthetic) ──
function Group({ header, children }) {
  return <div>{header && <p style={{ ...TT, fontSize: 13, color: 'var(--hy-label-2)', padding: '0 16px 6px', letterSpacing: '0.4px' }}>{header}</p>}<div style={{ background: 'var(--hy-card)', borderRadius: 'var(--hy-r-card)', overflow: 'hidden', boxShadow: 'var(--hy-e1)' }}>{children}</div></div>
}
function Row({ it, missed, first, onClick }) {
  const completed = it.status === 'Completed'
  const tint = completed ? 'var(--hy-done)' : it.kind === 'meal' ? 'var(--hy-accent)' : 'var(--hy-accent)'
  const status = completed ? { t: 'Done', c: 'var(--hy-done)' } : missed ? { t: 'Missed', c: 'var(--hy-missed)' } : null
  return (
    <>
      {!first && <div style={{ height: '0.5px', background: 'var(--hy-separator)', marginLeft: 52 }} />}
      <button onClick={onClick} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: completed ? 'var(--hy-done)' : 'rgba(var(--hy-accent-rgb),0.18)', color: completed ? '#fff' : 'var(--hy-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.kind === 'meal' ? <G.Meal s={15} /> : <G.Activity s={15} />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...TT, fontSize: 16, fontWeight: 500, color: 'var(--hy-label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</p>
          <p style={{ ...NUM, fontSize: 13, color: 'var(--hy-label-2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.time}{it.kind === 'meal' ? ` · ${it.kcal} kcal` : completed && it.result ? ` · ${it.result.tonnage.toLocaleString()} kg` : ` · ${it.exerciseCount} ex`}{it.fromPlan ? ` · ${PLAN.name}` : ''}</p>
        </div>
        {status && <span style={{ ...TT, fontSize: 13, color: status.c }}>{status.t}</span>}
        <span style={{ display: 'flex', color: 'var(--hy-label-3)' }}><G.ChevRight s={16} /></span>
      </button>
    </>
  )
}

function Seg({ total, done, color }) { return <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: total }, (_, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < done ? color : 'var(--hy-fill)' }} />)}</div> }
function DaySummary({ c }) {
  const { stats, nut, dayLoad: load } = c
  return (
    <Group header="SUMMARY">
      {stats.wTotal > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...TT, fontSize: 15, fontWeight: 500, color: 'var(--hy-label)' }}>Workouts</span><span style={{ ...NUM, fontSize: 13, color: 'var(--hy-label-2)' }}>{stats.wDone} of {stats.wTotal} · {stats.exercises} ex</span></div>
          <Seg total={stats.wTotal} done={stats.wDone} color="var(--hy-done)" />
          {load && <p style={{ ...NUM, fontSize: 12, color: 'var(--hy-label-2)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Load · <b style={{ color: 'var(--hy-label)' }}>{load.tonnage.toLocaleString()} kg</b> · <b style={{ color: 'var(--hy-label)' }}>{load.au} AU</b> · {load.minutes} min</p>}
        </div>
      )}
      {stats.mTotal > 0 && <>
        <div style={{ height: '0.5px', background: 'var(--hy-separator)', marginLeft: 16 }} />
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...TT, fontSize: 15, fontWeight: 500, color: 'var(--hy-label)' }}>Nutrition</span><span style={{ ...NUM, fontSize: 13, color: 'var(--hy-label-2)' }}>{nut.kcal.toLocaleString()} / {nut.goal.toLocaleString()} kcal</span></div>
          <Seg total={stats.mTotal} done={stats.mDone} color="var(--hy-accent)" />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>{[['P', nut.p, '--cat-p-rgb'], ['C', nut.c, '--cat-c-rgb'], ['F', nut.f, '--cat-f-rgb']].map(([k, v, ch]) => <span key={k} style={{ ...NUM, fontSize: 12, color: 'var(--hy-label-2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${ch}),1)` }} /><b style={{ color: 'var(--hy-label)' }}>{k} {v}</b>g</span>)}</div>
        </div>
      </>}
    </Group>
  )
}

const FACTORS = [['sleep', 'Sleep'], ['soreness', 'Soreness'], ['energy', 'Energy']]
const TIER_C = { Good: 'var(--hy-done)', Okay: 'var(--hy-accent)', Rough: 'var(--hy-missed)' }
function Readiness({ value, onSet, readOnly }) {
  const [draft, setDraft] = useState({})
  if (value) {
    const score = readinessScore(value), tier = readinessTier(score)
    return <Group><div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_C[tier] }} /><span style={{ ...NUM, fontSize: 15, color: 'var(--hy-label)' }}>Readiness <b>{score}</b><span style={{ color: 'var(--hy-label-2)' }}>{FACTORS.map(([k, l]) => ` · ${l} ${value[k]}`)}</span></span>{!readOnly && <span style={{ ...TT, marginLeft: 'auto', fontSize: 13, color: 'var(--hy-accent)' }}>Edit</span>}</div></Group>
  }
  const set = (k, v) => { const next = { ...draft, [k]: v }; setDraft(next); if (FACTORS.every(([f]) => next[f])) { onSet(next); setDraft({}) } }
  return (
    <Group header="HOW ARE YOU TODAY?">
      {FACTORS.map(([k, l], idx) => (
        <div key={k}>
          {idx > 0 && <div style={{ height: '0.5px', background: 'var(--hy-separator)', marginLeft: 16 }} />}
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...TT, fontSize: 15, color: 'var(--hy-label)', width: 76 }}>{l}</span>
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>{[1, 2, 3, 4, 5].map(v => <button key={v} onClick={() => set(k, v)} style={{ flex: 1, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer', background: draft[k] >= v ? 'var(--hy-accent)' : 'var(--hy-fill)' }} />)}</div>
          </div>
        </div>
      ))}
    </Group>
  )
}

function Empty() {
  return <div style={{ padding: '72px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--hy-label-3)' }}><G.CalOff s={44} /></span><span style={{ ...TT, fontSize: 16, color: 'var(--hy-label-2)' }}>No workouts scheduled</span><span style={{ ...TT, fontSize: 13, color: 'var(--hy-label-3)' }}>Tap + to add a workout</span></div>
}

// ── FAB menu — the design/ container-transform morph ──
// 56×56 accent square morphs (width/height/radius/background 0.32s) into an elevated
// panel; the + rotates 45° into ×, pinned where the FAB was; items stagger-fade in.
const FAB_ACTIONS = c => [
  { label: 'Schedule workout', icon: <G.Barbell s={16} />, on: c.scheduleWorkout },
  { label: 'Schedule meal', icon: <G.Meal s={15} />, on: c.scheduleMeal },
  { label: 'Log meal', icon: <G.Check s={15} />, on: c.logMeal },
]
const FAB_ITEM_H = 52
function Footer({ c }) {
  const open = c.fabOpen
  const actions = FAB_ACTIONS(c)
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const panelH = 12 + actions.length * FAB_ITEM_H
  return (
    <>
      {open && <div onClick={() => c.setFabOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 39 }} />}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 41, padding: '12px 16px 28px', background: 'linear-gradient(0deg, var(--hy-bg) 55%, transparent)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', pointerEvents: 'auto' }}>
          <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
            <div style={{
              position: 'absolute', right: 0, bottom: 0,
              width: open ? 264 : 56, height: open ? panelH : 56,
              borderRadius: open ? 'var(--hy-r-card)' : 18,
              background: open ? 'var(--hy-elevated)' : 'var(--hy-accent)',
              boxShadow: open ? 'var(--hy-e2)' : 'var(--hy-e2)',
              overflow: 'hidden',
              transition: `width 0.32s ${ease}, height 0.32s ${ease}, border-radius 0.32s ${ease}, background 0.32s ${ease}`,
            }}>
              <div style={{ position: 'absolute', top: 6, left: 8, right: 8, display: 'flex', flexDirection: 'column' }}>
                {actions.map((a, i) => (
                  <button key={a.label} onClick={() => { c.setFabOpen(false); a.on() }} style={{
                    ...TT, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px',
                    background: 'none', border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontSize: 15, fontWeight: 500, color: 'var(--hy-label)', textAlign: 'left', whiteSpace: 'nowrap',
                    opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 0.2s ease ${open ? 0.1 + i * 0.04 : 0}s, transform 0.2s ease ${open ? 0.1 + i * 0.04 : 0}s`,
                    pointerEvents: open ? 'auto' : 'none',
                  }}>
                    <span style={{ display: 'flex', color: 'var(--hy-accent)' }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
              <button onClick={() => c.setFabOpen(o => !o)} style={{
                position: 'absolute', right: 0, bottom: 0, width: 56, height: 56,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: open ? 'var(--hy-label)' : 'var(--hy-on-accent)',
                transform: open ? 'rotate(45deg)' : 'none', transition: `transform 0.32s ${ease}, color 0.2s ease`,
              }}>
                <G.Plus s={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Material Snackbar ──
function Snackbar({ msg, onUndo }) {
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 46, display: 'flex' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--hy-r)', background: 'var(--hy-elevated)', boxShadow: 'var(--hy-e2)' }}>
        <span style={{ ...TT, flex: 1, fontSize: 14, color: 'var(--hy-label)' }}>{msg}</span>
        <button onClick={onUndo} style={{ ...TT, fontSize: 14, fontWeight: 600, color: 'var(--hy-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>UNDO</button>
      </div>
    </div>
  )
}

// ── Material NavigationDrawer ──
const LIBS = ['Exercises', 'Workouts', 'Meals', 'Plans']
function Drawer({ open, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 300, zIndex: 51, background: 'var(--hy-elevated)', borderRadius: '0 16px 16px 0', transform: open ? 'none' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)', padding: '54px 12px 12px', boxShadow: open ? 'var(--hy-e2)' : 'none' }}>
        <p style={{ ...TT, fontSize: 20, fontWeight: 600, color: 'var(--hy-label)', padding: '0 16px 16px' }}>Fitness</p>
        {LIBS.map(l => <button key={l} onClick={onClose} style={{ ...TT, width: '100%', height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 'var(--hy-r-card)', border: 'none', background: 'transparent', color: 'var(--hy-label)', fontSize: 15, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>{l}</button>)}
      </div>
    </>
  )
}
