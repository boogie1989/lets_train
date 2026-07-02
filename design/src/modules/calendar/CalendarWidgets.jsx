// Calendar widgets — selected-day summary, readiness check-in, inline month grid.
// All derive from calendarModel data.
import { useState } from 'react'
import { WD, WEEKS, dayDot, TODAY, readinessScore, readinessTier } from './calendarModel.js'

const TT = { fontFamily: 'var(--tt-font-family)' }
const card = { flexShrink: 0, background: 'var(--glass-low-bg)', borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--cs-outline-rgb),0.20)', boxShadow: 'var(--shadow-glass-low)' }
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
          {/* load line — mirrors the macro legend under the nutrition bar; the
              quiet "Load" prefix names the jargon for non-pro readers */}
          {load && (
            <div style={{ ...val, fontSize: 11, marginTop: 9 }}>
              <span style={{ opacity: 0.7 }}>Load</span>
              {' · '}
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

// ── Readiness check-in — multi-factor { sleep, soreness, energy }, each 1–5 ───
// Today, unanswered: three 5-segment scales; auto-collapses once all three are
// set. Answered: one quiet line `Readiness 7 · Sleep 4 · Soreness 2 · Energy 5`
// with edit. Past days render the same line read-only (history).
const FACTORS = [
  { key: 'sleep', label: 'Sleep' },
  { key: 'soreness', label: 'Soreness' },
  { key: 'energy', label: 'Energy' },
]
const TIER_CH = { Good: '--cs-tertiary-rgb', Okay: '--cat-amber-rgb', Rough: '--cs-error-rgb' }

export function ReadinessCard({ value, onSet, readOnly = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})

  if (value && !editing) {
    const score = readinessScore(value)
    const tier = readinessTier(score)
    const line = (
      <>
        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: `rgba(var(${TIER_CH[tier]}),1)` }} />
        <span style={val}>
          Readiness <span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{score}</span>
          {FACTORS.map(f => <span key={f.key}> · {f.label} {value[f.key]}</span>)}
        </span>
      </>
    )
    if (readOnly) {
      return <div style={{ ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>{line}</div>
    }
    return (
      <button onClick={() => { setDraft(value); setEditing(true) }} style={{ ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
        {line}
        <span style={{ ...TT, marginLeft: 'auto', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}>edit</span>
      </button>
    )
  }

  // check-in — tap a segment per factor; saves itself once all three are set
  const set = (key, v) => {
    const next = { ...draft, [key]: v }
    setDraft(next)
    if (FACTORS.every(f => next[f.key])) {
      onSet(next)
      setEditing(false)
      setDraft({})
    }
  }
  return (
    <div style={{ ...card, padding: '13px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FACTORS.map(f => (
        <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...val, width: 62, flexShrink: 0 }}>{f.label}</span>
          <div style={{ flex: 1, display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => set(f.key, v)} aria-label={`${f.label} ${v}`} style={{
                flex: 1, height: 20, padding: 0, cursor: 'pointer',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: draft[f.key] >= v ? 'rgba(var(--cs-primary-rgb),0.75)' : 'rgba(var(--overlay-rgb),0.06)',
              }} />
            ))}
          </div>
          <span style={{ ...val, width: 12, textAlign: 'right', fontSize: 11, opacity: draft[f.key] ? 1 : 0.35 }}>
            {draft[f.key] ?? '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Inline month grid — replaces the week date row inside the glass slab ──────
// ONE quiet container (surface-container, radius-2xl — reads as a single card,
// like the DateCell row reads as one strip), transparent day cells inside.
// The only accents: selected = DateCell gradient pill (reduced glow), today =
// subtle 1px primary ring. Dot per day: emerald done / muted-error missed /
// slate has-items; dot SIZE = per-day intensity tier from completed sRPE AU
// (3/4/5px — quiet per-day weight, not a weekly aggregate). `ghost` renders a
// neighbouring month: numbers only, muted, non-interactive (no demo data
// outside May).
const DOT_COLOR = {
  done: 'var(--cs-status-completed)',
  missed: 'rgba(var(--cs-error-rgb),0.75)',
  has: 'var(--cs-status-planned)',
}
const DOT_SIZE = { 1: 3, 2: 4, 3: 5 }

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
                  ? 'var(--shadow-glass-mid), 0 2px 10px rgba(var(--cs-primary-rgb),0.30)'
                  : 'none',
              }}>
                <span style={{ fontSize: 15, fontWeight: 'var(--tt-title-medium-weight)', lineHeight: 1, color: isSel ? 'rgba(var(--raise-rgb),1)' : 'var(--cs-on-surface)' }}>{n}</span>
                {/* fixed 5px slot keeps the numbers aligned across dot sizes */}
                <span style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {dot && <span style={{ width: DOT_SIZE[dot.tier], height: DOT_SIZE[dot.tier], borderRadius: '50%', background: DOT_COLOR[dot.kind] }} />}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
