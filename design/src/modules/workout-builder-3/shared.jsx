// Module-local primitives for Workout Builder 3 — forked from workout-builder-2
// (same v2 functional core: kg default, RIR, 1RM base, structures, history).
// Deliberately NOT imported across modules: each builder generation evolves
// independently; only app-wide primitives live in ../../components.
import { useState, useRef } from 'react'

// ─── Data ──────────────────────────────────────────────────────────────────────

// oneRM — known 1RM base in kg (drives the %1RM → kg hint); absent = not tested yet
export const ALL_EXERCISES = [
  { id: 1,  name: 'Barbell Back Squat', muscle: 'Legs',  equipment: 'Barbell', oneRM: 140 },
  { id: 2,  name: 'Romanian Deadlift',  muscle: 'Back',  equipment: 'Barbell', oneRM: 160 },
  { id: 5,  name: 'Dumbbell Lunges',    muscle: 'Legs',  equipment: 'Dumbbell' },
  { id: 7,  name: 'Tricep Pushdown',    muscle: 'Arms',  equipment: 'Cable'    },
  { id: 8,  name: 'Bicep Curls',        muscle: 'Arms',  equipment: 'Dumbbell' },
]

export const DEMO_ITEMS = [
  { id: 'a', type: 'solo', exerciseId: 1, restSet: 120, note: 'Pause 2s at the bottom, no bouncing.',
    sets: [
      { weight: 60, reps: 10, type: 'warmup' },
      { weight: 100, reps: 8 },
      { weight: 175, reps: 8, weightUnit: 'lbs', restAfter: 180 },
      { weight: 120, reps: 6, note: 'Top set — belt on.', tempo: '3-1-1-0', structure: { kind: 'cluster', mini: 3, intraRest: 20 }, ds: [{ weight: 100, reps: 10 }, { weight: 80, reps: 30, repsUnit: 'time' }] },
      { weight: 8, reps: 8, weightUnit: 'rpe', repsMax: 10, type: 'backoff' },
    ] },
  { id: 'b', type: 'superset', exerciseIds: [5, 8], restSet: 60,
    sets: [
      { 5: { weight: 2, reps: 12, weightUnit: 'rir' }, 8: { weight: 15, reps: 12, ds: [{ weight: 10, reps: 14 }] } },
      { 5: { weight: 1.5, reps: 10, weightUnit: 'rir' }, 8: { weight: 12, reps: 10 } },
      { 5: { weight: 1, reps: 10, weightUnit: 'rir' }, 8: { weight: 10, reps: 12 } },
    ] },
  { id: 'c', type: 'solo', exerciseId: 7,
    sets: [
      { weight: 25, reps: 12, ds: [{ weight: 20, reps: 15 }] },
      { weight: 25, reps: 10, ds: [{ weight: 15, reps: 12 }] },
      { weight: 20, reps: 10 },
    ] },
  { id: 'd', type: 'solo', exerciseId: 2,
    sets: [
      { weight: 100, reps: 10 },
      { weight: 75, reps: 8, weightUnit: '%1RM' },
      { weight: 110, reps: 10, repsMax: 12 },
    ] },
]

export const DEMO_GAPS = [180, 120, 90]

// last logged session per exercise — drives the "Last session" panel + Prefill
export const EXERCISE_HISTORY = {
  1: { date: '5 days ago', sets: [{ weight: 60, reps: 10, type: 'warmup' }, { weight: 100, reps: 8 }, { weight: 110, reps: 6 }, { weight: 110, reps: 6 }] },
  2: { date: '1 week ago', sets: [{ weight: 100, reps: 10 }, { weight: 105, reps: 8 }, { weight: 105, reps: 8 }] },
  7: { date: '5 days ago', sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }, { weight: 22.5, reps: 10 }] },
}

// ─── Tokens ────────────────────────────────────────────────────────────────────

export const TT = { fontFamily: 'var(--tt-font-family)' }

const thumbTint = ch => `linear-gradient(150deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.06) 100%), var(--cs-surface-container-high)`
export const THUMB_COLORS = {
  Legs: thumbTint('--cat-blue-rgb'), Back: thumbTint('--cat-violet-rgb'), Chest: thumbTint('--cat-pink-rgb'),
  Arms: thumbTint('--cat-cyan-rgb'), Core: thumbTint('--cs-tertiary-rgb'), Shoulders: thumbTint('--cat-amber-rgb'),
}

export const glassPopoverSt = {
  background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
  borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function soloSummary(sets, d = { weightUnit: 'kg' }) {
  const work = sets.filter(s => s.type !== 'warmup')
  if (!work.length) return sets.length ? `${sets.length} warm-up` : '0 sets'
  const unit = work[0].weightUnit ?? d.weightUnit
  const weights = work.filter(s => (s.weightUnit ?? d.weightUnit) === unit).map(s => s.weight).filter(w => w > 0)
  const reps = work.flatMap(s => s.repsMax != null ? [s.reps, s.repsMax] : [s.reps])
  const range = weights.length && Math.min(...weights) === Math.max(...weights)
    ? `${weights[0]}`
    : `${Math.min(...weights)}–${Math.max(...weights)}`
  const wStr = weights.length === 0
    ? 'Bodyweight'
    : unit === 'rpe' ? `RPE ${range}` : unit === 'rir' ? `${range} RIR` : `${range} ${unit}`
  const minR = Math.min(...reps), maxR = Math.max(...reps)
  const rStr = minR === maxR ? `${maxR}` : `${minR}–${maxR}`
  return `${wStr} · ${rStr} reps`
}

export function calcStats(items, restGaps = [], d = { restSet: 90, restGap: 120 }) {
  let exCount = 0, setCount = 0, sec = 0
  items.forEach((item, i) => {
    const exN = item.type === 'solo' ? 1 : item.exerciseIds.length
    exCount += exN
    setCount += item.sets.filter(x => x.type !== 'warmup').length
    sec += item.sets.length * 40 * exN
    item.sets.forEach(x => {
      const sts = item.type === 'solo' ? [x.structure] : item.exerciseIds.map(id => x[id]?.structure)
      sts.forEach(st => { if (st) sec += Math.max(0, st.mini - 1) * st.intraRest })
    })
    item.sets.slice(0, -1).forEach(x => { sec += x.restAfter ?? item.restSet ?? d.restSet })
    if (i < items.length - 1) sec += restGaps[i] ?? d.restGap
  })
  return { exCount, setCount, estMin: Math.round(sec / 60) }
}

// working-set volume per muscle group (warm-ups excluded) → [['Legs', 9], …]
export function muscleVolume(items) {
  const vol = {}
  items.forEach(item => {
    const ids = item.type === 'solo' ? [item.exerciseId] : item.exerciseIds
    const n = item.sets.filter(s => s.type !== 'warmup').length
    ids.forEach(id => {
      const ex = ALL_EXERCISES.find(e => e.id === id)
      if (ex) vol[ex.muscle] = (vol[ex.muscle] || 0) + n
    })
  })
  return Object.entries(vol).sort((a, b) => b[1] - a[1])
}

export function fmtRest(s) {
  if (!s) return 'No rest'
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60), r = s % 60
  return r ? `${m}:${String(r).padStart(2, '0')}` : `${m} min`
}

export const unitSuffix = (kind, u) => {
  if (u === 'time') return 'sec'
  if (kind === 'reps' && u === 'failure') return 'AMRAP'
  return u
}

export function fmtLoad(s, d) {
  const u = s.weightUnit ?? d.weightUnit
  if (!s.weight && u !== 'rpe' && u !== 'rir') return 'BW'
  if (u === 'rpe') return `RPE ${s.weight}`
  if (u === 'rir') return `${s.weight} RIR`
  return `${s.weight} ${unitSuffix('weight', u)}`
}
export function fmtReps(s, d) {
  const u = s.repsUnit ?? d.repsUnit
  const r = s.repsMax != null ? `${s.reps}–${s.repsMax}` : `${s.reps}`
  if (u === 'time') return `${r} sec`
  if (u === 'failure') return 'AMRAP'
  return `× ${r}`
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const MAX_DROPS = 5
export const WEIGHT_UNITS = ['kg', 'lbs', 'rpe', 'rir', '%1RM', 'time']
export const REPS_UNITS   = ['reps', 'failure', 'time']

export const SET_TYPES = [
  { v: 'working', label: 'working', hint: 'counted' },
  { v: 'warmup',  label: 'warm-up', hint: 'not counted' },
  { v: 'backoff', label: 'backoff', hint: 'lighter work' },
]

export const SET_STRUCTURES = [
  { v: 'straight',  label: 'straight',   hint: 'default' },
  { v: 'cluster',   label: 'cluster',    hint: 'mini-sets · intra rest' },
  { v: 'restPause', label: 'rest-pause', hint: 'to failure · short rests' },
  { v: 'myoReps',   label: 'myo-reps',   hint: 'activation + minis' },
]
export const STRUCTURE_LABEL = { cluster: 'cluster', restPause: 'rest-pause', myoReps: 'myo-reps' }
export const STRUCTURE_MINIS = [2, 3, 4, 5]
export const STRUCTURE_RESTS = [10, 15, 20, 30, 45, 60]

// ─── Icons ─────────────────────────────────────────────────────────────────────

export function ChevLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function ChevRightSmIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function ChevLeftSmIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function PlusIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function XIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function ClockIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 13.5" />
    </svg>
  )
}

export function NoteIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

export function MetronomeIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l4 18H5L9 3z" />
      <line x1="12" y1="14" x2="17" y2="5" />
    </svg>
  )
}

export function LayersIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export function HistoryIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
      <polyline points="12 7 12 12 15.5 13.5" />
    </svg>
  )
}

export function GripIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
      <circle cx="4.5" cy="3" r="1.5" /><circle cx="9.5" cy="3" r="1.5" />
      <circle cx="4.5" cy="9" r="1.5" /><circle cx="9.5" cy="9" r="1.5" />
      <circle cx="4.5" cy="15" r="1.5" /><circle cx="9.5" cy="15" r="1.5" />
    </svg>
  )
}

export function SupersetIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="13" height="7" rx="2" />
      <rect x="8" y="13" width="13" height="7" rx="2" />
    </svg>
  )
}

export function RowKebabIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

export function SmallBarbellIcon() {
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" fill="none" stroke="rgba(var(--overlay-rgb),0.18)" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1" />
      <rect x="21.5" y="1" width="4" height="8" rx="1" />
      <line x1="4.5" y1="5" x2="21.5" y2="5" />
    </svg>
  )
}

// ─── Thumb ──────────────────────────────────────────────────────────────────

export function Thumb({ muscle, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size >= 40 ? 12 : 8, flexShrink: 0,
      background: THUMB_COLORS[muscle] ?? thumbTint('--cs-primary-rgb'),
      border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <SmallBarbellIcon />
    </div>
  )
}

// ─── Value fields (kg/lbs typed · rpe/rir picked · %1RM hinted) ────────────────

const fieldBoxSt = (dim, active) => ({
  height: 40, borderRadius: 'var(--radius-xl)', boxSizing: 'border-box',
  background: dim ? 'rgba(var(--overlay-rgb),0.025)' : 'rgba(var(--overlay-rgb),0.04)',
  border: `1px solid ${active ? 'rgba(var(--cs-primary-rgb),0.40)' : 'rgba(var(--overlay-rgb),0.08)'}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.15s ease',
})

const suffixAbsSt = dim => ({
  ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: dim ? 0.55 : 0.70,
  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
  pointerEvents: 'none',
})

const SCALE_FIELDS = {
  rpe: { options: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10], hint: 'How hard the set feels — 10 = nothing left' },
  rir: { options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], hint: 'Reps left in the tank — 0 = failure' },
}

function ScaleField({ unit, value, dim = false, onChange }) {
  const { options, hint } = SCALE_FIELDS[unit]
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ ...fieldBoxSt(dim, open), position: 'relative', width: '100%', padding: 0, cursor: 'pointer' }}>
        <span style={{ ...TT, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value || 0}</span>
        <span style={suffixAbsSt(dim)}>{unit}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            ...glassPopoverSt, position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 5, zIndex: 40, padding: 6,
          }}>
            <p style={{ ...TT, fontSize: 10, lineHeight: 1.4, color: 'var(--cs-on-surface-variant)', opacity: 0.65, margin: '2px 4px 6px', whiteSpace: 'nowrap' }}>{hint}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 44px)', gap: 4 }}>
              {options.map(v => (
                <button key={v} onClick={() => { onChange(v); setOpen(false) }} style={{
                  height: 34, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', padding: 0,
                  background: v === value ? 'rgba(var(--cs-primary-rgb),0.18)' : 'transparent',
                  ...TT, fontSize: 14, fontWeight: v === value ? 600 : 400,
                  color: v === value ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
                }}>{v}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const rmHintSt = { fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.65 }

export function OneRmLink({ onSet }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  const commit = () => { const n = parseFloat(val); if (n > 0) { onSet(n); setOpen(false) } }
  return (
    <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center' }}>
      <button onClick={() => setOpen(!open)} style={{
        ...TT, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: 10, fontWeight: 600, color: 'var(--cs-primary)', opacity: 0.85,
      }}>Set 1RM</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            ...glassPopoverSt, position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 5, zIndex: 40, padding: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <input
              value={val} autoFocus inputMode="numeric" placeholder="1RM"
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commit() }}
              style={{
                width: 56, height: 30, boxSizing: 'border-box', padding: '0 8px', borderRadius: 'var(--radius-lg)',
                background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', outline: 'none',
                ...TT, fontSize: 13, color: 'var(--cs-on-surface)', textAlign: 'center',
              }}
            />
            <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>kg</span>
            <button onClick={commit} style={{
              width: 26, height: 26, borderRadius: 'var(--radius-lg)', border: 'none', padding: 0, cursor: 'pointer',
              background: 'rgba(var(--cs-primary-rgb),0.18)', color: 'var(--cs-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><CheckIcon /></button>
          </div>
        </>
      )}
    </div>
  )
}

export function ValueField({ value, unit, kind, dim = false, onChange, valueMax, onChangeMax, subHint }) {
  const [focusMin, setFocusMin] = useState(false)
  const [focusMax, setFocusMax] = useState(false)
  const refMin = useRef(null)
  const refMax = useRef(null)

  if (kind === 'weight' && (unit === 'rpe' || unit === 'rir')) {
    return <ScaleField unit={unit} value={value} dim={dim} onChange={onChange} />
  }

  const max = unit === '%1RM' ? 120 : Infinity
  const numInput = (v, set, ref, setFocus) => (
    <input
      ref={ref}
      value={v === 0 ? '' : String(v)}
      placeholder="0"
      onChange={e => set(Math.min(max, parseFloat(e.target.value) || 0))}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      inputMode="numeric"
      style={{
        flex: 1, width: '100%', minWidth: 0, padding: 0,
        background: 'transparent', border: 'none', outline: 'none',
        ...TT, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center',
      }}
    />
  )

  const singleBox = (v, set, ref, focused, setFocus, leftLabel) => (
    <div onClick={() => ref.current?.focus()} style={{ ...fieldBoxSt(dim, focused), position: 'relative', cursor: 'text' }}>
      {leftLabel && (
        <span style={{ ...suffixAbsSt(dim), right: 'auto', left: 10 }}>{leftLabel}</span>
      )}
      {numInput(v, set, ref, setFocus)}
      <span style={suffixAbsSt(dim)}>{unitSuffix(kind, unit)}</span>
    </div>
  )

  if (valueMax !== undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        {singleBox(value, onChange, refMin, focusMin, setFocusMin, 'min')}
        {singleBox(valueMax, onChangeMax, refMax, focusMax, setFocusMax, 'max')}
      </div>
    )
  }

  if (subHint) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        {singleBox(value, onChange, refMin, focusMin, setFocusMin)}
        <div style={{ textAlign: 'center' }}>{subHint}</div>
      </div>
    )
  }
  return singleBox(value, onChange, refMin, focusMin, setFocusMin)
}

export const xSepSt = { ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.18, textAlign: 'center' }

// ─── Markers ───────────────────────────────────────────────────────────────────

export const dotNodeSt = {
  position: 'relative', zIndex: 1,
  width: 7, height: 7, borderRadius: '50%', background: 'var(--cs-primary)', opacity: 0.75,
  boxShadow: '0 0 0 3px var(--node-center)',
}

export const TYPE_INFO = {
  warmup:  { letter: 'W', ch: '--cat-amber-rgb' },
  backoff: { letter: 'B', ch: '--cat-cyan-rgb' },
}

export function SetNumber({ n, circled, ch }) {
  return (
    <span style={{
      minWidth: 22, height: 22, padding: '0 5px', boxSizing: 'border-box', borderRadius: 999,
      border: `1px solid ${circled ? (ch ? `rgba(var(${ch}),0.35)` : 'rgba(var(--cs-primary-rgb),0.45)') : 'transparent'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      ...TT, fontSize: 11, fontWeight: 600,
      color: ch ? `rgba(var(${ch}),0.65)` : 'var(--cs-on-surface-variant)',
      opacity: circled ? 0.80 : 0.45,
    }}>{n}</span>
  )
}

export function MarkerCell({ children }) {
  return (
    <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
  )
}

export const kebabTriggerSt = open => ({
  width: 34, height: 34, borderRadius: 'var(--radius-lg)',
  background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'none', border: 'none',
  color: 'var(--cs-on-surface-variant)', opacity: open ? 0.85 : 0.45,
})

// ─── Row menu (⋮) — rare per-set actions ───────────────────────────────────────
// Same contract as v2: units / range / structure sub-pages, add drop/note/tempo,
// duplicate/move, apply-to-all, delete. Set TYPE is picked on the marker in v3.

export function RowMenu({
  weightUnit, repsUnit, onWeightUnit, onRepsUnit,
  rangeOn, onToggleRange,
  structure, onStructure,
  onAddDrop, canAddDrop = true, onAddNote, onAddTempo,
  onDuplicate, onMoveUp, onMoveDown, canMoveUp = true, canMoveDown = true,
  onApplyLoadAll, onApplyRepsAll,
  onDelete, deleteDisabled = false, onOpenChange,
}) {
  const [open, setOpenRaw] = useState(false)
  const [page, setPage] = useState(null) // null | 'w' | 'r' | 's'
  const setOpen = v => { setOpenRaw(v); setPage(null); onOpenChange?.(v) }

  const itemSt = (disabled = false, danger = false) => ({
    ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
    background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)', textAlign: 'left',
    fontSize: 13, fontWeight: 500,
    color: danger ? 'var(--cs-error)' : 'var(--cs-on-surface)',
    opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer', whiteSpace: 'nowrap',
  })
  const valSt = { ...TT, marginLeft: 'auto', paddingLeft: 14, fontSize: 12, fontWeight: 400, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }
  const hairline = <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '4px 6px' }} />

  const subPage = page && (() => {
    const cfg = page === 'w'
      ? { title: 'Load unit', opts: WEIGHT_UNITS.map(u => ({ v: u, label: u })), cur: weightUnit, pick: onWeightUnit }
      : page === 'r'
        ? { title: 'Reps unit', opts: REPS_UNITS.map(u => ({ v: u, label: u })), cur: repsUnit, pick: onRepsUnit }
        : { title: 'Structure', opts: SET_STRUCTURES, cur: structure?.kind ?? 'straight', pick: onStructure }
    return (
      <>
        <button onClick={() => setPage(null)} style={{ ...itemSt(), fontWeight: 600 }}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>‹</span>{cfg.title}
        </button>
        {hairline}
        {cfg.opts.map(o => (
          <button key={o.v} onClick={() => { cfg.pick(o.v); setOpen(false) }} style={itemSt()}>
            <span style={{ width: 12, fontSize: 10, color: 'var(--cs-primary)', visibility: cfg.cur === o.v ? 'visible' : 'hidden' }}>✓</span>
            {o.label}
            {o.hint && <span style={valSt}>{o.hint}</span>}
          </button>
        ))}
      </>
    )
  })()

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button onClick={() => setOpen(!open)} style={{
        ...kebabTriggerSt(open), padding: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><RowKebabIcon /></button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{ ...glassPopoverSt, position: 'absolute', top: '100%', right: 0, marginTop: 5, zIndex: 40, minWidth: 176, padding: 4 }}>
            {page ? subPage : (
              <>
                <button onClick={() => setPage('w')} style={itemSt()}>Load unit<span style={valSt}>{weightUnit} ›</span></button>
                <button onClick={() => setPage('r')} style={itemSt()}>Reps unit<span style={valSt}>{repsUnit} ›</span></button>
                {onToggleRange && (
                  <button onClick={() => { setOpen(false); onToggleRange() }} style={itemSt()}>
                    Rep range
                    <span style={{ ...valSt, fontSize: 10, color: 'var(--cs-primary)', opacity: 1, visibility: rangeOn ? 'visible' : 'hidden' }}>✓</span>
                  </button>
                )}
                {onStructure && (
                  <button onClick={() => setPage('s')} style={itemSt()}>
                    Structure<span style={valSt}>{(SET_STRUCTURES.find(s => s.v === (structure?.kind ?? 'straight')) || SET_STRUCTURES[0]).label} ›</span>
                  </button>
                )}
                {(onAddDrop || onAddNote || onAddTempo) && hairline}
                {onAddDrop && (
                  <button disabled={!canAddDrop} onClick={() => { if (canAddDrop) { setOpen(false); onAddDrop() } }} style={itemSt(!canAddDrop)}>
                    Add drop set
                  </button>
                )}
                {onAddNote && (
                  <button onClick={() => { setOpen(false); onAddNote() }} style={itemSt()}>Add note</button>
                )}
                {onAddTempo && (
                  <button onClick={() => { setOpen(false); onAddTempo() }} style={itemSt()}>Add tempo</button>
                )}
                {(onDuplicate || onMoveUp || onMoveDown) && hairline}
                {onDuplicate && (
                  <button onClick={() => { setOpen(false); onDuplicate() }} style={itemSt()}>Duplicate set</button>
                )}
                {onMoveUp && (
                  <button disabled={!canMoveUp} onClick={() => { if (canMoveUp) { setOpen(false); onMoveUp() } }} style={itemSt(!canMoveUp)}>Move up</button>
                )}
                {onMoveDown && (
                  <button disabled={!canMoveDown} onClick={() => { if (canMoveDown) { setOpen(false); onMoveDown() } }} style={itemSt(!canMoveDown)}>Move down</button>
                )}
                {(onApplyLoadAll || onApplyRepsAll) && hairline}
                {onApplyLoadAll && (
                  <button onClick={() => { setOpen(false); onApplyLoadAll() }} style={itemSt()}>Apply load to all sets</button>
                )}
                {onApplyRepsAll && (
                  <button onClick={() => { setOpen(false); onApplyRepsAll() }} style={itemSt()}>Apply reps to all sets</button>
                )}
                {onDelete && (
                  <>
                    {hairline}
                    <button disabled={deleteDisabled} onClick={() => { if (!deleteDisabled) { setOpen(false); onDelete() } }} style={itemSt(deleteDisabled, true)}>
                      Delete
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Rest picker — minutes 0–10 (2-col grid) + seconds 0/15/30/45 ──────────────

const REST_MINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const REST_SECS = [0, 15, 30, 45]

export function RestPickerPopover({ value, onChange, onClose, align = 'center', onApplyAll }) {
  const m = Math.floor(value / 60), s = value % 60
  const colLblSt = { ...TT, fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', textAlign: 'center', color: 'var(--cs-on-surface-variant)', opacity: 0.45, padding: '2px 0 4px' }
  const optSt = on => ({
    width: 44, height: 30, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', padding: 0,
    background: on ? 'rgba(var(--cs-primary-rgb),0.18)' : 'transparent',
    ...TT, fontSize: 13, fontWeight: on ? 600 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
  })
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
      <div style={{
        ...glassPopoverSt, position: 'absolute', top: '100%', marginTop: 5, zIndex: 40,
        ...(align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { right: 0 }),
        padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={colLblSt}>MIN</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 44px)', gap: 2 }}>
              {REST_MINS.map(x => (
                <button key={x} onClick={() => onChange(x * 60 + s)} style={optSt(x === m)}>{x}</button>
              ))}
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(var(--overlay-rgb),0.07)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={colLblSt}>SEC</span>
            {REST_SECS.map(x => (
              <button key={x} onClick={() => onChange(m * 60 + x)} style={optSt(x === s)}>{String(x).padStart(2, '0')}</button>
            ))}
          </div>
        </div>
        {onApplyAll && (
          <>
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)' }} />
            <button onClick={() => { onApplyAll(value); onClose() }} style={{
              ...TT, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '6px 4px', borderRadius: 'var(--radius-lg)', textAlign: 'center',
              fontSize: 12, fontWeight: 600, color: 'var(--cs-primary)',
            }}>Apply to all sets</button>
          </>
        )}
      </div>
    </>
  )
}

// rest divider — hairline · `⏱ 1:30` chip · hairline; between preview cards and
// between set rows in the editor (the v1 recipe). Picker supports Apply-to-all.
export function RestDivider({ value, onChange, onApplyAll }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.05)' }} />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(!open)} style={{
          background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'none', border: 'none', cursor: 'pointer',
          padding: '3px 8px', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}><ClockIcon size={11} /></span>
          <span style={{ ...TT, fontSize: 11, fontWeight: 600, color: 'var(--cs-on-surface-variant)', opacity: 0.70 }}>{fmtRest(value)}</span>
        </button>
        {open && <RestPickerPopover value={value} onChange={onChange} onApplyAll={onApplyAll} onClose={() => setOpen(false)} />}
      </div>
      <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.05)' }} />
    </div>
  )
}

// rest chip — `⏱ 1:30` button that opens the picker; used inline (table column)
export function RestChip({ value, onChange, onApplyAll, dim = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'none', border: 'none', cursor: 'pointer',
        padding: '4px 6px', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: dim ? 0.35 : 0.50 }}><ClockIcon size={10} /></span>
        <span style={{ ...TT, fontSize: 11, fontWeight: 600, color: 'var(--cs-on-surface-variant)', opacity: dim ? 0.5 : 0.80 }}>{fmtRest(value)}</span>
      </button>
      {open && <RestPickerPopover align="right" value={value} onChange={onChange} onApplyAll={onApplyAll} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Notes / tempo / structure sub-rows ─────────────────────────────────────────

export function NoteRow({ value, onChange, onClear, style, icon = <NoteIcon />, placeholder = 'Note…', inputStyle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, ...style }}>
      <span style={{ display: 'flex', flexShrink: 0, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>{icon}</span>
      <input
        value={value}
        autoFocus={value === ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onBlur={() => { if (!value.trim()) onClear?.() }}
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', padding: 0,
          ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.8,
          ...inputStyle,
        }}
      />
    </div>
  )
}

const TEMPO_PRESETS = [
  { v: '2-0-2-0', hint: 'controlled' },
  { v: '3-0-1-0', hint: 'slow eccentric' },
  { v: '3-1-1-0', hint: 'pause at bottom' },
  { v: '4-0-1-0', hint: 'slow eccentric+' },
  { v: '3-0-X-0', hint: 'explosive up' },
]

export function TempoRow({ value, onChange, onClear, style }) {
  const [open, setOpenRaw] = useState(value === '')
  const [custom, setCustom] = useState('')
  const closePicked = () => setOpenRaw(false)
  const closeDismiss = () => { setOpenRaw(false); if (value === '') onClear() }
  const commitCustom = () => { if (custom.trim()) { onChange(custom.trim()); setCustom(''); closePicked() } }

  const itemSt = {
    ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)', textAlign: 'left', cursor: 'pointer',
  }
  const digitsSt = { ...TT, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--cs-on-surface)' }
  const hintSt = { ...TT, marginLeft: 'auto', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }

  return (
    <div style={{ position: 'relative', ...style }}>
      <button onClick={() => (open ? closeDismiss() : setOpenRaw(true))} style={{
        display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <span style={{ display: 'flex', flexShrink: 0, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}><MetronomeIcon /></span>
        <span style={{ ...TT, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--cs-on-surface-variant)', opacity: value ? 0.8 : 0.5 }}>
          {value || 'Tempo…'}
        </span>
      </button>

      {open && (
        <>
          <div onClick={closeDismiss} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{ ...glassPopoverSt, position: 'absolute', top: '100%', left: 19, marginTop: 5, zIndex: 40, minWidth: 196, padding: 4 }}>
            {TEMPO_PRESETS.map(t => (
              <button key={t.v} onClick={() => { onChange(t.v); closePicked() }} style={itemSt}>
                <span style={{ ...digitsSt, color: t.v === value ? 'var(--cs-primary)' : 'var(--cs-on-surface)' }}>{t.v}</span>
                <span style={hintSt}>{t.hint}</span>
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '4px 6px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 6px' }}>
              <input
                value={custom}
                placeholder="Custom · 3-1-2-0"
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitCustom() }}
                style={{
                  flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', padding: 0,
                  ...TT, fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--cs-on-surface)',
                }}
              />
              <button onClick={commitCustom} disabled={!custom.trim()} style={{
                width: 22, height: 22, borderRadius: 'var(--radius-lg)', border: 'none', padding: 0, cursor: custom.trim() ? 'pointer' : 'default',
                background: custom.trim() ? 'rgba(var(--cs-primary-rgb),0.18)' : 'rgba(var(--overlay-rgb),0.05)',
                color: custom.trim() ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)', opacity: custom.trim() ? 1 : 0.4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><CheckIcon /></button>
            </div>
            {value && (
              <>
                <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '4px 6px' }} />
                <button onClick={() => { onClear(); closePicked() }} style={{ ...itemSt, color: 'var(--cs-error)', fontSize: 12, fontWeight: 500 }}>
                  Remove tempo
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function StructureRow({ structure, onChange, onClear, style }) {
  const [open, setOpen] = useState(false)
  const label = `${STRUCTURE_LABEL[structure.kind]} · ${structure.mini} mini · ${structure.intraRest}s intra`
  const optSt = on => ({
    minWidth: 34, height: 28, padding: '0 6px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
    background: on ? 'rgba(var(--cs-primary-rgb),0.18)' : 'rgba(var(--overlay-rgb),0.04)',
    ...TT, fontSize: 12, fontWeight: on ? 600 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
  })
  const lblSt = { ...TT, fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }
  return (
    <div style={{ position: 'relative', ...style }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ display: 'flex', flexShrink: 0, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}><LayersIcon /></span>
        <span style={{ ...TT, fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', color: 'var(--cs-on-surface-variant)', opacity: 0.8 }}>{label}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            ...glassPopoverSt, position: 'absolute', top: '100%', left: 19, marginTop: 5, zIndex: 40, minWidth: 224,
            padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7,
          }}>
            <span style={lblSt}>MINI-SETS</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {STRUCTURE_MINIS.map(n => (
                <button key={n} onClick={() => onChange({ ...structure, mini: n })} style={optSt(n === structure.mini)}>{n}</button>
              ))}
            </div>
            <span style={lblSt}>INTRA REST</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {STRUCTURE_RESTS.map(sv => (
                <button key={sv} onClick={() => onChange({ ...structure, intraRest: sv })} style={optSt(sv === structure.intraRest)}>{sv}s</button>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)' }} />
            <button onClick={() => { onClear(); setOpen(false) }} style={{
              ...TT, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left',
              fontSize: 12, fontWeight: 500, color: 'var(--cs-error)',
            }}>Remove structure</button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Compact sets table (read-only) — preview cards ────────────────────────────

// one display row per set/round — { key, n, ch, text, extra }; row index i
// always maps to item.sets[i] (so gap-after-row-i rest = sets[i].restAfter)
export function buildSetRows(item, defaults) {
  const rows = []
  if (item.type === 'solo') {
    let wn = 0
    item.sets.forEach((s, i) => {
      const n = s.type === 'warmup' ? 'W' : s.type === 'backoff' ? 'B' : ++wn
      const ch = s.type === 'warmup' ? '--cat-amber-rgb' : s.type === 'backoff' ? '--cat-cyan-rgb' : null
      rows.push({ key: i, n, ch, text: `${fmtLoad(s, defaults)} ${fmtReps(s, defaults)}`, extra: (s.ds || []).length ? `+${s.ds.length} drop${s.ds.length > 1 ? 's' : ''}` : null })
    })
  } else {
    // superset round → `lines`: one entry per exercise (PreviewSets renders them
    // stacked inside one container); `text` keeps the joined form for CompactSets
    item.sets.forEach((s, i) => {
      const lines = item.exerciseIds.map(id => {
        const d = s[id] || { reps: 0 }
        const ds = (d.ds || []).length
        return { text: `${fmtLoad(d, defaults)} ${fmtReps(d, defaults)}`, extra: ds ? `+${ds} drop${ds > 1 ? 's' : ''}` : null }
      })
      rows.push({ key: i, n: i + 1, ch: null, lines, text: lines.map(l => l.text).join('  ·  '), extra: null })
    })
  }
  return rows
}

export function CompactSets({ item, defaults, limit }) {
  const rows = buildSetRows(item, defaults)
  const shown = limit ? rows.slice(0, limit) : rows
  const hidden = rows.length - shown.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {shown.map(r => (
        <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 24 }}>
          <span style={{ ...TT, width: 16, textAlign: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, color: r.ch ? `rgba(var(${r.ch}),0.75)` : 'var(--cs-on-surface-variant)', opacity: r.ch ? 1 : 0.55 }}>{r.n}</span>
          <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface)', opacity: 0.82, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.text}</span>
          {r.extra && <span style={{ ...TT, fontSize: 10, color: 'var(--cs-primary)', opacity: 0.7, flexShrink: 0 }}>{r.extra}</span>}
        </div>
      ))}
      {hidden > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 22 }}>
          <span style={{ width: 16, flexShrink: 0 }} />
          <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>+{hidden} more…</span>
        </div>
      )}
    </div>
  )
}
