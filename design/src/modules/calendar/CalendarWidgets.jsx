// Calendar widgets — selected-day summary, readiness check-in, inline month grid.
// All derive from calendarModel data.
import { WD, WEEKS, dayDot, TODAY } from './calendarModel.js'

const TT = { fontFamily: 'var(--tt-font-family)' }
const card = { flexShrink: 0, background: 'var(--glass-low-bg)', borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--cs-outline-rgb),0.20)' }
const lbl = { ...TT, fontSize: 'var(--tt-title-small-size)', fontWeight: 'var(--tt-title-small-weight)', letterSpacing: 'var(--tt-title-small-tracking)', color: 'var(--cs-on-surface)' }
const val = { ...TT, fontSize: 'var(--tt-body-small-size)', fontWeight: 'var(--tt-body-small-weight)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)' }

// ── Segment bar — 1 segment per item, filled = completed ──────────────────────
export function SegmentBar({ total, done, color }) {
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

// ── Selected-day summary — workouts / load / nutrition rows ───────────────────
// Load shows two scales on purpose: tonnage = external load (kg, only sets logged
// with weight — the "measured" note keeps the number honest when part of the
// session was RPE/time-based), AU = internal load (session RPE × minutes, sRPE).
export function DaySummary({ stats, load, nut }) {
  const macros = [
    { key: 'P', g: nut.p, goal: nut.pGoal, ch: '--cat-blue-rgb' },
    { key: 'C', g: nut.c, goal: nut.cGoal, ch: '--cat-amber-rgb' },
    { key: 'F', g: nut.f, goal: nut.fGoal, ch: '--cat-pink-rgb' },
  ]
  const headRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }
  return (
    <div style={{ ...card, padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          {/* load line — mirrors the macro legend under the nutrition bar */}
          {load && (
            <div style={{ ...val, fontSize: 11, marginTop: 9 }}>
              <span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{load.tonnage.toLocaleString()} kg</span>
              {' · '}
              <span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{load.au} AU</span>
              {' · '}{load.minutes} min · {load.setsMeasured} of {load.hardSets} sets measured
            </div>
          )}
        </div>
      )}

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

// ── Readiness check-in — today only, collapses to a quiet line once answered ──
const MOODS = [
  { key: 'Good', ch: '--cs-tertiary-rgb' },
  { key: 'Okay', ch: '--cat-amber-rgb' },
  { key: 'Rough', ch: '--cs-error-rgb' },
]
export function ReadinessCard({ value, onSet }) {
  if (value) {
    const mood = MOODS.find(m => m.key === value) ?? MOODS[0]
    return (
      <button onClick={() => onSet(null)} style={{ ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${mood.ch}),1)` }} />
        <span style={val}>Readiness: <span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span></span>
        <span style={{ ...TT, marginLeft: 'auto', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}>edit</span>
      </button>
    )
  }
  return (
    <div style={{ ...card, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...lbl, flex: 1 }}>How are you today?</span>
      {MOODS.map(m => (
        <button key={m.key} onClick={() => onSet(m.key)} style={{
          ...TT, fontSize: 11, fontWeight: 500, padding: '5px 11px', cursor: 'pointer',
          borderRadius: 'var(--radius-pill)',
          background: `rgba(var(${m.ch}),0.10)`,
          border: `1px solid rgba(var(${m.ch}),0.28)`,
          color: `rgba(var(${m.ch}),1)`,
        }}>{m.key}</button>
      ))}
    </div>
  )
}

// ── Inline month grid — replaces the week date row inside the glass slab ──────
// ONE quiet container (surface-container, radius-2xl — reads as a single card,
// like the DateCell row reads as one strip), transparent day cells inside.
// The only accents: selected = DateCell gradient pill (reduced glow), today =
// subtle 1px primary ring. Dot per day: emerald done / muted-error missed /
// slate has-items. `ghost` renders a neighbouring month: numbers only, muted,
// non-interactive (no demo data outside May).
const DOT = {
  done: 'var(--cs-status-completed)',
  missed: 'rgba(var(--cs-error-rgb),0.75)',
  has: 'var(--cs-status-planned)',
}

const chunkMonth = (lead, days) => {
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
}

export function MonthGrid({ month, selected, onSelect, ghost }) {
  const weeks = ghost ? chunkMonth(ghost.lead, ghost.days) : WEEKS
  return (
    <div style={{
      background: 'var(--cs-surface-container)',
      borderRadius: 'var(--radius-2xl)',
      padding: '12px 8px 8px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      {/* weekday header — same type as the DateCell weekday label */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {WD.map(d => (
          <span key={d} style={{
            ...TT, textAlign: 'center',
            fontSize: 'var(--tt-label-small-size)',
            fontWeight: 'var(--tt-label-small-weight)',
            letterSpacing: 'var(--tt-label-small-tracking)',
            textTransform: 'uppercase',
            color: 'var(--cs-on-surface-variant)',
            opacity: 0.7,
          }}>{d}</span>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {week.map((n, i) => {
            if (n == null) return <span key={`b${i}`} style={{ height: 46 }} />
            if (ghost) {
              return (
                <span key={n} style={{
                  ...TT, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 'var(--tt-title-medium-weight)',
                  color: 'var(--cs-on-surface)', opacity: 0.35,
                }}>{n}</span>
              )
            }
            const dot = dayDot(month[n])
            const isSel = n === selected
            const isToday = n === TODAY
            return (
              <button key={n} onClick={() => onSelect(n)} style={{
                ...TT, height: 46, padding: 0, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                borderRadius: 'var(--radius-lg)',
                background: isSel ? 'var(--gradient-slate-accent)' : 'transparent',
                border: isToday && !isSel ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid transparent',
                boxShadow: isSel
                  ? '0 3px 10px rgba(var(--cs-primary-rgb),0.25), inset 0 1px 0 rgba(var(--raise-rgb),0.20)'
                  : 'none',
              }}>
                <span style={{ fontSize: 15, fontWeight: 'var(--tt-title-medium-weight)', lineHeight: 1, color: 'var(--cs-on-surface)' }}>{n}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: dot === 'none' ? 'transparent' : DOT[dot] }} />
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
