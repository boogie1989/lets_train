import { useState, useRef, useEffect, Fragment } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import NavBar from '../../components/NavBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import DropdownMenu from '../../components/DropdownMenu.jsx'
import FabMenu from '../../components/FabMenu.jsx'
import IconButton from '../../components/IconButton.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'

// ─── Data ──────────────────────────────────────────────────────────────────────

const ALL_EXERCISES = [
  { id: 1,  name: 'Barbell Back Squat', muscle: 'Legs',  equipment: 'Barbell'  },
  { id: 2,  name: 'Romanian Deadlift',  muscle: 'Back',  equipment: 'Barbell'  },
  { id: 5,  name: 'Dumbbell Lunges',    muscle: 'Legs',  equipment: 'Dumbbell' },
  { id: 7,  name: 'Tricep Pushdown',    muscle: 'Arms',  equipment: 'Cable'    },
  { id: 8,  name: 'Bicep Curls',        muscle: 'Arms',  equipment: 'Dumbbell' },
]

// Load defaults to RPE; weightUnit overrides per set/drop (kg / lbs / time).
// restSet = rest between sets (sec, uniform per item). Rest between exercises
// lives OUTSIDE the items in restGaps[i] (sec, the pause after position i) —
// it belongs to the slot in the workout, not to the exercise, so reordering
// cards never drags a pause along.
const DEMO_ITEMS = [
  { id: 'a', type: 'solo', exerciseId: 1, restSet: 120, note: 'Pause 2s at the bottom, no bouncing.',
    sets: [
      { weight: 5, reps: 10, type: 'warmup' },
      { weight: 7.5, reps: 8 },
      { weight: 175, reps: 8, weightUnit: 'lbs', restAfter: 180 },
      { weight: 9, reps: 6, note: 'Top set — belt on.', tempo: '3-1-1-0', ds: [{ weight: 9.5, reps: 10 }, { weight: 10, reps: 30, repsUnit: 'time' }] },
      { weight: 8, reps: 8, repsMax: 10, type: 'backoff' },
    ] },
  { id: 'b', type: 'superset', exerciseIds: [5, 8], restSet: 60,
    sets: [
      { 5: { weight: 8, reps: 12 }, 8: { weight: 15, reps: 12, weightUnit: 'kg', ds: [{ weight: 10, reps: 14, weightUnit: 'kg' }] } },
      { 5: { weight: 8.5, reps: 10 }, 8: { weight: 12, reps: 10, weightUnit: 'kg' } },
      { 5: { weight: 9, reps: 10 }, 8: { weight: 10, reps: 12, weightUnit: 'kg' } },
    ] },
  { id: 'c', type: 'solo', exerciseId: 7,
    sets: [
      { weight: 25, reps: 12, weightUnit: 'kg', ds: [{ weight: 20, reps: 15, weightUnit: 'kg' }] },
      { weight: 25, reps: 10, weightUnit: 'kg', ds: [{ weight: 15, reps: 12, weightUnit: 'kg' }] },
      { weight: 20, reps: 10, weightUnit: 'kg' },
    ] },
  { id: 'd', type: 'solo', exerciseId: 2,
    sets: [
      { weight: 7, reps: 10 },
      { weight: 75, reps: 8, weightUnit: '%1RM' },
      { weight: 8, reps: 10, repsMax: 12 },
    ] },
]

const DEMO_GAPS = [180, 120, 90]

// ─── Tokens ────────────────────────────────────────────────────────────────────

const TT = { fontFamily: 'var(--tt-font-family)' }

const thumbTint = ch => `linear-gradient(150deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.06) 100%), var(--cs-surface-container-high)`
const THUMB_COLORS = {
  Legs: thumbTint('--cat-blue-rgb'), Back: thumbTint('--cat-violet-rgb'), Chest: thumbTint('--cat-pink-rgb'),
  Arms: thumbTint('--cat-cyan-rgb'), Core: thumbTint('--cs-tertiary-rgb'), Shoulders: thumbTint('--cat-amber-rgb'),
}

// Preset workout tags (chosen via picker — no free typing)
const TAG_PRESETS = ['Strength', 'Hypertrophy', 'Endurance', 'Push', 'Pull', 'Upper body', 'Lower body', 'Full body', 'Cardio', 'Mobility']

const tagChipSt = {
  fontFamily: 'var(--tt-font-family)', display: 'inline-flex', alignItems: 'center',
  height: 26, padding: '0 11px', borderRadius: 'var(--radius-2xl)',
  background: 'rgba(var(--cs-primary-rgb),0.14)', border: '1px solid rgba(var(--cs-primary-rgb),0.28)',
  fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)',
}
// removable selected chip (inside the dialog)
const tagChipRemovableSt = { ...tagChipSt, gap: 6, padding: '0 5px 0 11px' }
const tagXSt = {
  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, padding: 0,
  background: 'rgba(var(--cs-primary-rgb),0.20)', border: 'none', cursor: 'pointer', color: 'var(--cs-primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
// the tags row inside the details card — opens the tag dialog
const tagFieldSt = {
  fontFamily: 'var(--tt-font-family)', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  minHeight: 28, padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
}
const tagRowSt = on => ({
  fontFamily: 'var(--tt-font-family)', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '11px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', border: 'none',
  background: on ? 'rgba(var(--cs-primary-rgb),0.10)' : 'transparent',
})
const tagCreateRowSt = {
  fontFamily: 'var(--tt-font-family)', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '11px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
  background: 'rgba(var(--cs-primary-rgb),0.08)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)',
  fontSize: 14, fontWeight: 500, color: 'var(--cs-primary)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soloSummary(sets, d = { weightUnit: 'rpe' }) {
  // warm-ups don't speak for the exercise — ranges come from working/backoff sets
  const work = sets.filter(s => s.type !== 'warmup')
  if (!work.length) return sets.length ? `${sets.length} warm-up` : '0 sets'
  // summarize load in the unit of the first set; ignore sets logged in other units
  const unit = work[0].weightUnit ?? d.weightUnit
  const weights = work.filter(s => (s.weightUnit ?? d.weightUnit) === unit).map(s => s.weight).filter(w => w > 0)
  const reps = work.flatMap(s => s.repsMax != null ? [s.reps, s.repsMax] : [s.reps])
  const range = weights.length && Math.min(...weights) === Math.max(...weights)
    ? `${weights[0]}`
    : `${Math.min(...weights)}–${Math.max(...weights)}`
  const wStr = weights.length === 0
    ? 'Bodyweight'
    : unit === 'rpe' ? `RPE ${range}` : `${range} ${unit}`
  const minR = Math.min(...reps), maxR = Math.max(...reps)
  const rStr = minR === maxR ? `${maxR}` : `${minR}–${maxR}`
  return `${wStr} · ${rStr} reps`
}

function calcStats(items, restGaps = [], d = { restSet: 90, restGap: 120 }) {
  let exCount = 0, setCount = 0, sec = 0
  items.forEach((item, i) => {
    const exN = item.type === 'solo' ? 1 : item.exerciseIds.length
    exCount += exN
    // warm-up sets don't count toward the prescription (duration still does)
    setCount += item.sets.filter(x => x.type !== 'warmup').length
    // rough duration: ~40s of work per exercise per set + rests
    sec += item.sets.length * 40 * exN
    item.sets.slice(0, -1).forEach(x => { sec += x.restAfter ?? item.restSet ?? d.restSet })
    if (i < items.length - 1) sec += restGaps[i] ?? d.restGap
  })
  return { exCount, setCount, estMin: Math.round(sec / 60) }
}

function fmtRest(s) {
  if (!s) return 'No rest'
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60), r = s % 60
  return r ? `${m}:${String(r).padStart(2, '0')}` : `${m} min`
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function ChevLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevDownIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function PlusIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function XIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function TagIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function ChevRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SmallBarbellIcon() {
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" fill="none" stroke="rgba(var(--overlay-rgb),0.18)" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1" />
      <rect x="21.5" y="1" width="4" height="8" rx="1" />
      <line x1="4.5" y1="5" x2="21.5" y2="5" />
    </svg>
  )
}

// ─── Thumb ──────────────────────────────────────────────────────────────────

function Thumb({ muscle, size = 40 }) {
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

// ─── ValueField — `175 lbs` text field / `7.5 rpe` picker field ────────────────
// The unit lives INSIDE the field as a passive suffix (changing it is a rare,
// menu-level action). No step buttons at all: continuous values (kg/lbs/sec,
// reps) are typed; the DISCRETE rpe scale gets a one-tap picker instead.

const unitSuffix = (kind, u) => {
  if (u === 'time') return 'sec'
  if (kind === 'reps' && u === 'failure') return 'AMRAP'
  return u
}

const fieldBoxSt = (dim, active) => ({
  height: 40, borderRadius: 'var(--radius-xl)', boxSizing: 'border-box',
  background: dim ? 'rgba(var(--overlay-rgb),0.025)' : 'rgba(var(--overlay-rgb),0.04)',
  border: `1px solid ${active ? 'rgba(var(--cs-primary-rgb),0.40)' : 'rgba(var(--overlay-rgb),0.08)'}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.15s ease',
})

const suffixSt = dim => ({
  ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: dim ? 0.45 : 0.55,
})

// RPE is prescribed on a discrete 6–10 scale in 0.5 steps — picking beats typing.
// The picker is a compact 3×3 grid, not a scrolling list.
const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]

function RpeField({ value, dim = false, onChange, onMenuLift }) {
  const [open, setOpenRaw] = useState(false)
  const setOpen = v => { setOpenRaw(v); onMenuLift?.(v) }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ ...fieldBoxSt(dim, open), position: 'relative', width: '100%', padding: 0, cursor: 'pointer' }}>
        <span style={{ ...TT, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value || 0}</span>
        <span style={suffixAbsSt(dim)}>rpe</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 5, zIndex: 40,
            background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
            borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 6,
            display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: 4,
          }}>
            {RPE_OPTIONS.map(v => (
              <button key={v} onClick={() => { onChange(v); setOpen(false) }} style={{
                height: 34, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', padding: 0,
                background: v === value ? 'rgba(var(--cs-primary-rgb),0.18)' : 'transparent',
                ...TT, fontSize: 14, fontWeight: v === value ? 500 : 400,
                color: v === value ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
              }}>{v}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Unit labels are pinned to the RIGHT EDGE of the box (not glued to the value);
// values stay centered. valueMax/onChangeMax turn the reps field into a RANGE:
// visually ONE control, internally two inputs split by an inset hairline.
const suffixAbsSt = dim => ({
  ...suffixSt(dim), position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
  pointerEvents: 'none',
})

function ValueField({ value, unit, kind, dim = false, onChange, valueMax, onChangeMax, onMenuLift }) {
  const [focusMin, setFocusMin] = useState(false)
  const [focusMax, setFocusMax] = useState(false)
  const refMin = useRef(null)
  const refMax = useRef(null)

  if (kind === 'weight' && unit === 'rpe') {
    return <RpeField value={value} dim={dim} onChange={onChange} onMenuLift={onMenuLift} />
  }

  const max = unit === '%1RM' ? 100 : Infinity
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

  // range = two ordinary controls stacked in a column, labelled min / max on the left
  if (valueMax !== undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        {singleBox(value, onChange, refMin, focusMin, setFocusMin, 'min')}
        {singleBox(valueMax, onChangeMax, refMax, focusMax, setFocusMax, 'max')}
      </div>
    )
  }

  return singleBox(value, onChange, refMin, focusMin, setFocusMin)
}

const xSepSt = { ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.18, textAlign: 'center' }

const linkBtnSt = {
  ...TT, fontSize: 11, fontWeight: 500, background: 'none', border: 'none',
  cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
}

const exNameSt = {
  ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', opacity: 0.72,
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
}

// ─── Units (same options & steps as WorkoutRunner) ─────────────────────────────

const MAX_DROPS = 3
const WEIGHT_UNITS = ['rpe', 'kg', 'lbs', '%1RM', 'time']
const REPS_UNITS   = ['reps', 'failure', 'time']

// non-input cell (marker, × separator) centered against the 40px fields
function MarkerCell({ children }) {
  return (
    <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
  )
}

// ─── Row menu (⋮) — rare actions live here: units, drops, delete ───────────────
// Two pages: the action list, and an in-place unit picker (‹ back at the top).
// Frequency rule: values are edited inline, everything rare goes behind ⋮.

function RowKebabIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

const SET_TYPES = [
  { v: 'working', label: 'working', hint: 'counted' },
  { v: 'warmup',  label: 'warm-up', hint: 'not counted' },
  { v: 'backoff', label: 'backoff', hint: 'lighter work' },
]

function RowMenu({
  weightUnit, repsUnit, onWeightUnit, onRepsUnit,
  rangeOn, onToggleRange,
  setType, onSetType,
  onAddDrop, canAddDrop = true, onAddNote, onAddTempo,
  onDuplicate, onMoveUp, onMoveDown, canMoveUp = true, canMoveDown = true,
  onDelete, deleteDisabled = false, onOpenChange,
}) {
  const [open, setOpenRaw] = useState(false)
  const [page, setPage] = useState(null) // null | 'w' | 'r' | 't'
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
        : { title: 'Set type', opts: SET_TYPES, cur: setType ?? 'working', pick: onSetType }
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
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 5, zIndex: 40, minWidth: 176,
            background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
            borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 4,
          }}>
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
                {onSetType && (
                  <button onClick={() => setPage('t')} style={itemSt()}>
                    Set type<span style={valSt}>{(SET_TYPES.find(t => t.v === (setType ?? 'working')) || SET_TYPES[0]).label} ›</span>
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

// ─── Rest controls ─────────────────────────────────────────────────────────────

function ClockIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 13.5" />
    </svg>
  )
}

// Rest picker — two columns: minutes (0–5) and seconds (0/15/30/45). Taps write
// live (m·60+s); tap-away closes. `0:00` reads back as `No rest`.
const REST_MINS = [0, 1, 2, 3, 4, 5]
const REST_SECS = [0, 15, 30, 45]

function RestPickerPopover({ value, onChange, onClose, align = 'center', onApplyAll }) {
  const m = Math.floor(value / 60), s = value % 60
  const colLblSt = { ...TT, fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', textAlign: 'center', color: 'var(--cs-on-surface-variant)', opacity: 0.45, padding: '2px 0 4px' }
  const optSt = on => ({
    width: 44, height: 30, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', padding: 0,
    background: on ? 'rgba(var(--cs-primary-rgb),0.18)' : 'transparent',
    ...TT, fontSize: 13, fontWeight: on ? 500 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
  })
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
      <div style={{
        position: 'absolute', top: '100%', marginTop: 5, zIndex: 40,
        ...(align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { right: 0 }),
        background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
        borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={colLblSt}>MIN</span>
            {REST_MINS.map(x => (
              <button key={x} onClick={() => onChange(x * 60 + s)} style={optSt(x === m)}>{x}</button>
            ))}
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
              fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)',
            }}>Apply to all sets</button>
          </>
        )}
      </div>
    </>
  )
}

// Rest divider — a quiet hairline with `⏱ 1:30` in the middle; tapping the chip
// opens the min/sec picker (when onChange is provided).
function RestDivider({ value, onChange, onApplyAll, onMenuLift }) {
  const [open, setOpenRaw] = useState(false)
  const setOpen = v => { setOpenRaw(v); onMenuLift?.(v) }
  const chip = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}><ClockIcon size={11} /></span>
      <span style={{ ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.70 }}>{fmtRest(value)}</span>
    </span>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.05)' }} />
      {onChange ? (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpen(!open)} style={{
            background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'none', border: 'none', cursor: 'pointer',
            padding: '3px 8px', borderRadius: 'var(--radius-lg)', display: 'flex',
          }}>{chip}</button>
          {open && <RestPickerPopover value={value} onChange={onChange} onApplyAll={onApplyAll} onClose={() => setOpen(false)} />}
        </div>
      ) : chip}
      <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.05)' }} />
    </div>
  )
}

// ─── Notes — quiet one-liners on exercises and sets ────────────────────────────
// Added via menus (card kebab / row ⋮ → "Add note"). The row is always an
// editable input; blurring it empty removes the note entirely (zero pixels when absent).

function NoteIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function MetronomeIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l4 18H5L9 3z" />
      <line x1="12" y1="14" x2="17" y2="5" />
    </svg>
  )
}

function NoteRow({ value, onChange, onClear, style, icon = <NoteIcon />, placeholder = 'Note…', inputStyle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, ...style }}>
      <span style={{ display: 'flex', flexShrink: 0, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>{icon}</span>
      <input
        value={value}
        autoFocus={value === ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onBlur={() => { if (!value.trim()) onClear() }}
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', padding: 0,
          ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.8,
          ...inputStyle,
        }}
      />
    </div>
  )
}

// tempo sub-row — value is PICKED, not typed: tapping it opens a dropdown of the
// most common tempos (+ a custom text field as the last row). Freshly added tempo
// ('' value) auto-opens the picker; dismissing it without choosing removes the row.
const TEMPO_PRESETS = [
  { v: '2-0-2-0', hint: 'controlled' },
  { v: '3-0-1-0', hint: 'slow eccentric' },
  { v: '3-1-1-0', hint: 'pause at bottom' },
  { v: '4-0-1-0', hint: 'slow eccentric+' },
  { v: '3-0-X-0', hint: 'explosive up' },
]

function TempoRow({ value, onChange, onClear, onMenuLift, style }) {
  const [open, setOpenRaw] = useState(value === '')
  const [custom, setCustom] = useState('')
  // auto-open on create lifts the card too
  useEffect(() => { if (value === '') onMenuLift?.(true) }, []) // eslint-disable-line
  const closePicked = () => { setOpenRaw(false); onMenuLift?.(false) }
  const closeDismiss = () => { setOpenRaw(false); onMenuLift?.(false); if (value === '') onClear() }
  const commitCustom = () => { if (custom.trim()) { onChange(custom.trim()); setCustom(''); closePicked() } }

  const itemSt = {
    ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)', textAlign: 'left', cursor: 'pointer',
  }
  const digitsSt = { ...TT, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--cs-on-surface)' }
  const hintSt = { ...TT, marginLeft: 'auto', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }

  return (
    <div style={{ position: 'relative', ...style }}>
      <button onClick={() => (open ? closeDismiss() : (setOpenRaw(true), onMenuLift?.(true)))} style={{
        display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <span style={{ display: 'flex', flexShrink: 0, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}><MetronomeIcon /></span>
        <span style={{ ...TT, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--cs-on-surface-variant)', opacity: value ? 0.8 : 0.5 }}>
          {value || 'Tempo…'}
        </span>
      </button>

      {open && (
        <>
          <div onClick={closeDismiss} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 19, marginTop: 5, zIndex: 40, minWidth: 196,
            background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
            borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 4,
          }}>
            {TEMPO_PRESETS.map(t => (
              <button key={t.v} onClick={() => { onChange(t.v); closePicked() }} style={itemSt}>
                <span style={{ ...digitsSt, color: t.v === value ? 'var(--cs-primary)' : 'var(--cs-on-surface)' }}>{t.v}</span>
                <span style={hintSt}>{t.hint}</span>
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '4px 6px' }} />
            {/* custom — typed, committed with Enter or ✓ */}
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

// ─── Workout defaults — base config that sets/exercises inherit ────────────────
// Sits between the details card and the exercise list. Per-set/per-exercise
// overrides (row menus, divider pickers) always win over these.

function UnitListPopover({ options, value, onSelect, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
      <div style={{
        position: 'absolute', top: '100%', right: 0, marginTop: 5, zIndex: 40, minWidth: 120,
        background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
        borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 4,
      }}>
        {options.map(u => (
          <button key={u} onClick={() => onSelect(u)} style={{
            ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
            background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)', textAlign: 'left',
            fontSize: 13, fontWeight: value === u ? 500 : 400, cursor: 'pointer',
            color: value === u ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
          }}>
            <span style={{ width: 12, fontSize: 10, color: 'var(--cs-primary)', visibility: value === u ? 'visible' : 'hidden' }}>✓</span>
            {u}
          </button>
        ))}
      </div>
    </>
  )
}

function WorkoutDefaultsCard({ defaults, setDefaults }) {
  const [openKey, setOpenKey] = useState(null)
  const upd = patch => setDefaults(d => ({ ...d, ...patch }))
  const close = () => setOpenKey(null)

  const rowBtnSt = {
    ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
  }
  const hairline = <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)' }} />

  const row = (key, label, valueLabel, popover) => (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpenKey(openKey === key ? null : key)} style={rowBtnSt}>
        <span style={{ ...TT, flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{label}</span>
        <span style={{ ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{valueLabel}</span>
        <span style={{ fontSize: 8, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>▼</span>
      </button>
      {openKey === key && popover}
    </div>
  )

  return (
    <GlassCard level="Low" style={{ padding: '12px 16px 6px', marginBottom: 14 }}>
      <SectionLabel style={{ margin: '0 0 2px' }}>Workout defaults</SectionLabel>
      {row('w', 'Load unit', defaults.weightUnit,
        <UnitListPopover options={WEIGHT_UNITS} value={defaults.weightUnit}
          onSelect={u => { upd({ weightUnit: u }); close() }} onClose={close} />)}
      {hairline}
      {row('r', 'Reps unit', defaults.repsUnit,
        <UnitListPopover options={REPS_UNITS} value={defaults.repsUnit}
          onSelect={u => { upd({ repsUnit: u }); close() }} onClose={close} />)}
      {hairline}
      {row('rs', 'Rest between sets', fmtRest(defaults.restSet),
        <RestPickerPopover align="right" value={defaults.restSet}
          onChange={v => upd({ restSet: v })} onClose={close} />)}
      {hairline}
      {row('rg', 'Rest between exercises', fmtRest(defaults.restGap),
        <RestPickerPopover align="right" value={defaults.restGap}
          onChange={v => upd({ restGap: v })} onClose={close} />)}
    </GlassCard>
  )
}

// ─── Solo sets editor (grid table) ─────────────────────────────────────────────

function SoloSetsEditor({ item, onChange, onMenuLift, defaults }) {
  function updSet(i, s) { onChange({ ...item, sets: item.sets.map((x, j) => j === i ? s : x) }) }
  function delSet(i) { onChange({ ...item, sets: item.sets.filter((_, j) => j !== i) }) }
  function dupSet(i) {
    const copy = JSON.parse(JSON.stringify(item.sets[i]))
    onChange({ ...item, sets: [...item.sets.slice(0, i + 1), copy, ...item.sets.slice(i + 1)] })
  }
  function moveSet(i, d) {
    const n = [...item.sets]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x)
    onChange({ ...item, sets: n })
  }
  function applyAllRest(v) {
    onChange({ ...item, restSet: v, sets: item.sets.map(({ restAfter: _r, ...rest }) => rest) })
  }
  function addSet() {
    const last = item.sets[item.sets.length - 1] || { weight: 0, reps: 8 }
    onChange({ ...item, sets: [...item.sets, { weight: last.weight, reps: last.reps, weightUnit: last.weightUnit, repsUnit: last.repsUnit }] })
  }
  function addDrop(i) {
    const s = item.sets[i]
    const ds = s.ds || []
    if (ds.length >= MAX_DROPS) return
    const last = ds[ds.length - 1] || s
    // drop = lighter weight pushed again; in RPE terms each drop lands closer to 10
    const w = (last.weightUnit ?? defaults.weightUnit) === 'rpe' ? Math.min(10, (last.weight || 8) + 0.5) : Math.max(0, last.weight - 5)
    updSet(i, { ...s, ds: [...ds, { weight: w, reps: (last.reps || 8) + 2, weightUnit: last.weightUnit, repsUnit: last.repsUnit }] })
  }
  function removeDrop(i, di) {
    const s = item.sets[i]
    const ds = (s.ds || []).filter((_, j) => j !== di)
    if (ds.length === 0) { const { ds: _ignored, ...rest } = s; updSet(i, rest) }
    else updSet(i, { ...s, ds })
  }

  return (
    <div>
      {/* set groups — rest dividers live in the gaps between sets (uniform per exercise) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(() => { let wn = 0; return item.sets.map((set, i) => {
          const displayN = set.type === 'warmup' ? 'W' : set.type === 'backoff' ? 'B' : ++wn
          return (
          <Fragment key={i}>
            <SetRowGroup idx={i} displayN={displayN} set={set} canDelete={item.sets.length > 1}
              canAddDrop={(set.ds || []).length < MAX_DROPS}
              onChange={s => updSet(i, s)} onDelete={() => delSet(i)}
              onAddDrop={() => addDrop(i)} onRemoveDrop={di => removeDrop(i, di)}
              onDuplicate={() => dupSet(i)}
              onMoveUp={() => moveSet(i, -1)} onMoveDown={() => moveSet(i, 1)}
              canMoveUp={i > 0} canMoveDown={i < item.sets.length - 1}
              onMenuLift={onMenuLift} defaults={defaults} />
            {i < item.sets.length - 1 && (
              <RestDivider value={set.restAfter ?? item.restSet ?? defaults.restSet}
                onChange={v => updSet(i, { ...set, restAfter: v })}
                onApplyAll={applyAllRest} onMenuLift={onMenuLift} />
            )}
          </Fragment>
          )
        }) })()}
      </div>

      <button onClick={addSet} style={{ ...linkBtnSt, color: 'var(--cs-primary)', opacity: 0.65, marginTop: 20, fontSize: 13 }}>
        <PlusIcon size={13} /> Add set
      </button>
    </div>
  )
}

// connector geometry: rows are plain 40px fields now (no unit-label row), so
// the line starts just below the circled set number and ends at the last node
const LINE_TOP = 31
const LINE_BOTTOM = 20

const dotNodeSt = {
  position: 'relative', zIndex: 1,
  width: 7, height: 7, borderRadius: '50%', background: 'var(--cs-primary)', opacity: 0.75,
  boxShadow: '0 0 0 3px var(--node-center)',
}
// main working-set marker — bigger hollow ring (vs the small filled drop dots);
// border matches the numbered set circle. Sits above the line so it stays clean.
const mainNodeSt = {
  position: 'relative', zIndex: 1,
  width: 13, height: 13, borderRadius: '50%', boxSizing: 'border-box',
  background: 'var(--node-center)', border: '1px solid rgba(var(--cs-primary-rgb),0.45)',
  boxShadow: '0 0 0 3px var(--node-center)',
}

// Set number — circled when the set has drop sets (the connector starts here)
function SetNumber({ n, circled, ch }) {
  return (
    <span style={{
      minWidth: 22, height: 22, padding: '0 5px', boxSizing: 'border-box', borderRadius: 999,
      border: `1px solid ${circled ? (ch ? `rgba(var(${ch}),0.35)` : 'rgba(var(--cs-primary-rgb),0.45)') : 'transparent'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      ...TT, fontSize: 11, fontWeight: 500,
      color: ch ? `rgba(var(${ch}),0.65)` : 'var(--cs-on-surface-variant)',
      opacity: circled ? 0.80 : 0.45,
    }}>{n}</span>
  )
}

// Typed-set marker — tapping the W/B ring opens a small explainer tooltip
const TYPE_INFO = {
  warmup:  { letter: 'W', ch: '--cat-amber-rgb', title: 'Warm-up set',  text: 'Preparation work — not counted toward working sets or volume.' },
  backoff: { letter: 'B', ch: '--cat-cyan-rgb',  title: 'Back-off set', text: 'Lighter work after the top set — counts as working volume.' },
}

function SetTypeMarker({ type, n, onMenuLift }) {
  const [open, setOpenRaw] = useState(false)
  if (!type) return <SetNumber n={n} circled />
  const info = TYPE_INFO[type]
  const setOpen = v => { setOpenRaw(v); onMenuLift?.(v) }
  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
        <SetNumber n={info.letter} circled ch={info.ch} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 40, width: 196,
            background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
            borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: '10px 12px',
          }}>
            <div style={{ ...TT, fontSize: 12, fontWeight: 500, color: `rgba(var(${info.ch}),0.85)` }}>{info.title}</div>
            <div style={{ ...TT, fontSize: 11, lineHeight: 1.45, color: 'var(--cs-on-surface-variant)', opacity: 0.8, marginTop: 3 }}>{info.text}</div>
          </div>
        </>
      )}
    </div>
  )
}

// One set + its drop sets, grouped as a single block with a connector line.
// Each row is `marker · value field · × · value field · ⋮` — rare actions
// (units / add drop / delete) live in the row menu, values edit inline.
function SetRowGroup({ idx, displayN, set, canDelete, canAddDrop, onChange, onDelete, onAddDrop, onRemoveDrop, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown, onMenuLift, defaults }) {
  const drops = set.ds || []
  const hasDrops = drops.length > 0
  const isWarmup = set.type === 'warmup'
  const repsUnitCur = set.repsUnit ?? defaults.repsUnit

  const rowGridSt = { display: 'grid', gridTemplateColumns: '32px 1fr 10px 1fr 28px', columnGap: 8, alignItems: 'center' }

  return (
    <div>
      {/* set note — ABOVE the set: the cue is read before the set is performed,
          and the main-row → drops chain stays unbroken */}
      {set.note !== undefined && (
        <NoteRow value={set.note}
          onChange={t => onChange({ ...set, note: t })}
          onClear={() => { const { note: _n, ...rest } = set; onChange(rest) }}
          style={{ marginBottom: 10, paddingLeft: 40, paddingRight: 36 }} />
      )}
      {set.tempo !== undefined && (
        <TempoRow value={set.tempo} onMenuLift={onMenuLift}
          onChange={t => onChange({ ...set, tempo: t })}
          onClear={() => { const { tempo: _t, ...rest } = set; onChange(rest) }}
          style={{ marginBottom: 10, paddingLeft: 40, paddingRight: 36 }} />
      )}
      <div style={{ position: 'relative' }}>
      {/* connector — from the circled set number down through the drop nodes */}
      {hasDrops && (
        <div style={{ position: 'absolute', left: 15, top: LINE_TOP, bottom: LINE_BOTTOM, width: 2, borderRadius: 1, background: 'rgba(var(--cs-primary-rgb),0.35)' }} />
      )}
      {/* main set row — warm-ups dim and show W instead of a number; backoffs get a tiny B */}
      <div style={rowGridSt}>
        <MarkerCell>
          <SetTypeMarker type={set.type} n={displayN ?? idx + 1} onMenuLift={onMenuLift} />
        </MarkerCell>
        <ValueField dim={isWarmup} value={set.weight} unit={set.weightUnit ?? defaults.weightUnit} kind="weight"
          onChange={w => onChange({ ...set, weight: w })} onMenuLift={onMenuLift} />
        <span style={xSepSt}>×</span>
        <ValueField dim={isWarmup} value={set.reps} unit={set.repsUnit ?? defaults.repsUnit} kind="reps"
          onChange={r => onChange({ ...set, reps: r })}
          valueMax={set.repsMax} onChangeMax={m => onChange({ ...set, repsMax: m })} />
        <RowMenu
          weightUnit={set.weightUnit ?? defaults.weightUnit} repsUnit={set.repsUnit ?? defaults.repsUnit}
          onWeightUnit={u => onChange({ ...set, weightUnit: u })} onRepsUnit={u => onChange({ ...set, repsUnit: u })}
          rangeOn={set.repsMax != null}
          onToggleRange={repsUnitCur === 'reps' ? () => {
            if (set.repsMax != null) { const { repsMax: _m, ...rest } = set; onChange(rest) }
            else onChange({ ...set, repsMax: set.reps + 2 })
          } : null}
          setType={set.type}
          onSetType={v => {
            if (v === 'working') { const { type: _t, ...rest } = set; onChange(rest) }
            else onChange({ ...set, type: v })
          }}
          onAddDrop={onAddDrop} canAddDrop={canAddDrop}
          onAddNote={set.note === undefined ? () => onChange({ ...set, note: '' }) : null}
          onAddTempo={set.tempo === undefined ? () => onChange({ ...set, tempo: '' }) : null}
          onDuplicate={onDuplicate}
          onMoveUp={onMoveUp} onMoveDown={onMoveDown} canMoveUp={canMoveUp} canMoveDown={canMoveDown}
          onDelete={onDelete} deleteDisabled={!canDelete}
          onOpenChange={onMenuLift}
        />
      </div>

      {/* drop-set rows — same full-width fields, separated from the main set by a
          larger top gap (14 vs the 8 in-group rhythm) so the hierarchy reads vertically */}
      {hasDrops && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {drops.map((d, di) => {
            const updDrop = patch => onChange({ ...set, ds: drops.map((x, j) => j === di ? { ...x, ...patch } : x) })
            return (
              <div key={di} style={rowGridSt}>
                <MarkerCell><span style={dotNodeSt} /></MarkerCell>
                <ValueField dim value={d.weight} unit={d.weightUnit ?? defaults.weightUnit} kind="weight"
                  onChange={w => updDrop({ weight: w })} onMenuLift={onMenuLift} />
                <span style={xSepSt}>×</span>
                <ValueField dim value={d.reps} unit={d.repsUnit ?? defaults.repsUnit} kind="reps"
                  onChange={r => updDrop({ reps: r })} />
                <RowMenu
                  weightUnit={d.weightUnit ?? defaults.weightUnit} repsUnit={d.repsUnit ?? defaults.repsUnit}
                  onWeightUnit={u => updDrop({ weightUnit: u })} onRepsUnit={u => updDrop({ repsUnit: u })}
                  onDelete={() => onRemoveDrop(di)}
                  onOpenChange={onMenuLift}
                />
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}

// ─── Superset sets editor (grouped by set) ─────────────────────────────────────

function SupersetSetsEditor({ item, onChange, onMenuLift, defaults }) {
  const exercises = item.exerciseIds.map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean)

  function updSet(i, s) { onChange({ ...item, sets: item.sets.map((x, j) => j === i ? s : x) }) }
  function delSet(i) { onChange({ ...item, sets: item.sets.filter((_, j) => j !== i) }) }
  function dupSet(i) {
    const copy = JSON.parse(JSON.stringify(item.sets[i]))
    onChange({ ...item, sets: [...item.sets.slice(0, i + 1), copy, ...item.sets.slice(i + 1)] })
  }
  function moveSet(i, d) {
    const n = [...item.sets]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x)
    onChange({ ...item, sets: n })
  }
  function applyAllRest(v) {
    onChange({ ...item, restSet: v, sets: item.sets.map(({ restAfter: _r, ...rest }) => rest) })
  }
  function addSet() {
    const s = {}; exercises.forEach(ex => { s[ex.id] = { weight: 8, reps: 10 } })
    onChange({ ...item, sets: [...item.sets, s] })
  }
  function updEx(i, exId, patch) {
    const set = item.sets[i]
    updSet(i, { ...set, [exId]: { ...(set[exId] || { weight: 0, reps: 10 }), ...patch } })
  }
  function addDrop(i, exId) {
    const cur = item.sets[i][exId] || { weight: 8, reps: 10 }
    const ds = cur.ds || []
    if (ds.length >= MAX_DROPS) return
    const last = ds[ds.length - 1] || cur
    const w = (last.weightUnit ?? defaults.weightUnit) === 'rpe' ? Math.min(10, (last.weight || 8) + 0.5) : Math.max(0, last.weight - 5)
    updEx(i, exId, { ds: [...ds, { weight: w, reps: (last.reps || 8) + 2, weightUnit: last.weightUnit, repsUnit: last.repsUnit }] })
  }
  function removeDrop(i, exId, di) {
    const cur = item.sets[i][exId] || {}
    const ds = (cur.ds || []).filter((_, j) => j !== di)
    if (ds.length) updEx(i, exId, { ds })
    else { const { ds: _x, ...rest } = cur; updSet(i, { ...item.sets[i], [exId]: rest }) }
  }

  return (
    <div>
      {/* set groups — circled number + connector line bracket each set; rest chips
          between rounds (within a round the superset itself means no rest) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {item.sets.map((set, i) => (
          <Fragment key={i}>
          <div style={{ position: 'relative' }}>
            {/* connector line — anchored at the circled set number, runs to the bottom */}
            <div style={{ position: 'absolute', left: 15, top: 23, bottom: LINE_BOTTOM, width: 2, borderRadius: 1, background: 'rgba(var(--cs-primary-rgb),0.35)' }} />

            {exercises.map((ex, ei) => {
              const exData = set[ex.id] || { weight: 0, reps: 10 }
              const drops = exData.ds || []
              const rowGridSt = { display: 'grid', gridTemplateColumns: '32px 1fr 10px 1fr 28px', columnGap: 8, alignItems: 'center' }
              return (
                <Fragment key={ex.id}>
                  {/* exercise name row — the round's ⋮ menu lives on the first one
                      (the round is the unit; deleting it is the menu's job now) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: ei > 0 ? 14 : 0 }}>
                    <span style={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                      {ei === 0 ? <SetNumber n={i + 1} circled /> : null}
                    </span>
                    <span style={exNameSt}>{ex.name}</span>
                    {ei === 0 && (
                      <span style={{ marginLeft: 'auto', display: 'flex' }}>
                        <DropdownMenu
                          onOpenChange={onMenuLift}
                          items={[
                            { label: 'Duplicate set', onClick: () => dupSet(i) },
                            { label: 'Move up', disabled: i === 0, onClick: () => moveSet(i, -1) },
                            { label: 'Move down', disabled: i === item.sets.length - 1, onClick: () => moveSet(i, 1) },
                            { label: 'Delete set', danger: true, disabled: item.sets.length <= 1, onClick: () => delSet(i) },
                          ]}
                          triggerStyle={{ ...kebabTriggerSt(false), width: 24, height: 24 }}
                        />
                      </span>
                    )}
                  </div>

                  {/* per-exercise set note — between the name row and the values */}
                  {exData.note !== undefined && (
                    <NoteRow value={exData.note}
                      onChange={t => updEx(i, ex.id, { note: t })}
                      onClear={() => { const { note: _n, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }}
                      style={{ marginTop: 6, marginBottom: 2, paddingLeft: 40, paddingRight: 36 }} />
                  )}
                  {exData.tempo !== undefined && (
                    <TempoRow value={exData.tempo} onMenuLift={onMenuLift}
                      onChange={t => updEx(i, ex.id, { tempo: t })}
                      onClear={() => { const { tempo: _t, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }}
                      style={{ marginTop: 4, marginBottom: 2, paddingLeft: 40, paddingRight: 36 }} />
                  )}

                  {/* main row — hollow ring on the connector; menu has no Delete
                      (a single exercise's row can't leave the round) */}
                  <div style={{ ...rowGridSt, marginTop: 8 }}>
                    <MarkerCell><span style={mainNodeSt} /></MarkerCell>
                    <ValueField value={exData.weight} unit={exData.weightUnit ?? defaults.weightUnit} kind="weight"
                      onChange={w => updEx(i, ex.id, { weight: w })} onMenuLift={onMenuLift} />
                    <span style={xSepSt}>×</span>
                    <ValueField value={exData.reps} unit={exData.repsUnit ?? defaults.repsUnit} kind="reps"
                      onChange={r => updEx(i, ex.id, { reps: r })}
                      valueMax={exData.repsMax} onChangeMax={m => updEx(i, ex.id, { repsMax: m })} />
                    <RowMenu
                      weightUnit={exData.weightUnit ?? defaults.weightUnit} repsUnit={exData.repsUnit ?? defaults.repsUnit}
                      onWeightUnit={u => updEx(i, ex.id, { weightUnit: u })} onRepsUnit={u => updEx(i, ex.id, { repsUnit: u })}
                      rangeOn={exData.repsMax != null}
                      onToggleRange={(exData.repsUnit ?? defaults.repsUnit) === 'reps' ? () => {
                        if (exData.repsMax != null) { const { repsMax: _m, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }
                        else updEx(i, ex.id, { repsMax: exData.reps + 2 })
                      } : null}
                      onAddDrop={() => addDrop(i, ex.id)} canAddDrop={drops.length < MAX_DROPS}
                      onAddNote={exData.note === undefined ? () => updEx(i, ex.id, { note: '' }) : null}
                      onAddTempo={exData.tempo === undefined ? () => updEx(i, ex.id, { tempo: '' }) : null}
                      onOpenChange={onMenuLift}
                    />
                  </div>

                  {/* drop rows — same full-width fields, separated by a larger top gap */}
                  {drops.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                      {drops.map((d, di) => {
                        const updDrop = patch => updEx(i, ex.id, { ds: drops.map((x, j) => j === di ? { ...x, ...patch } : x) })
                        return (
                          <div key={di} style={rowGridSt}>
                            <MarkerCell><span style={dotNodeSt} /></MarkerCell>
                            <ValueField dim value={d.weight} unit={d.weightUnit ?? defaults.weightUnit} kind="weight"
                              onChange={w => updDrop({ weight: w })} onMenuLift={onMenuLift} />
                            <span style={xSepSt}>×</span>
                            <ValueField dim value={d.reps} unit={d.repsUnit ?? defaults.repsUnit} kind="reps"
                              onChange={r => updDrop({ reps: r })} />
                            <RowMenu
                              weightUnit={d.weightUnit ?? defaults.weightUnit} repsUnit={d.repsUnit ?? defaults.repsUnit}
                              onWeightUnit={u => updDrop({ weightUnit: u })} onRepsUnit={u => updDrop({ repsUnit: u })}
                              onDelete={() => removeDrop(i, ex.id, di)}
                              onOpenChange={onMenuLift}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
          {i < item.sets.length - 1 && (
            <RestDivider value={set.restAfter ?? item.restSet ?? defaults.restSet}
              onChange={v => updSet(i, { ...set, restAfter: v })}
              onApplyAll={applyAllRest} onMenuLift={onMenuLift} />
          )}
          </Fragment>
        ))}
      </div>

      <button onClick={addSet} style={{ ...linkBtnSt, color: 'var(--cs-primary)', opacity: 0.65, marginTop: 22, fontSize: 13 }}>
        <PlusIcon size={13} /> Add set
      </button>
    </div>
  )
}

// ─── Expandable wrapper (animated grid-rows) ───────────────────────────────────

function Expandable({ open, children }) {
  // overflow:hidden is required for the grid-rows animation, but it would clip
  // the row menus — release it once the expand transition has settled
  const [settled, setSettled] = useState(open)
  useEffect(() => { if (!open) setSettled(false) }, [open])
  return (
    <div
      style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.28s ease' }}
      onTransitionEnd={() => setSettled(open)}
    >
      <div style={{ overflow: open && settled ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  )
}

// ─── Exercise cards ────────────────────────────────────────────────────────────

// kebab menu items shared by both card types
const cardMenu = ({ onEdit, onScheme, onDuplicate, onAddNote, onDelete }) => [
  { label: 'Change exercise', onClick: onEdit },
  { label: 'Set scheme', onClick: onScheme },
  { label: 'Duplicate exercise', onClick: onDuplicate },
  ...(onAddNote ? [{ label: 'Add note', onClick: onAddNote }] : []),
  { label: 'Delete', danger: true, onClick: onDelete },
]

// quick set-scheme presets — applying REPLACES the item's sets
const SCHEMES = [{ n: 3, r: 8 }, { n: 4, r: 10 }, { n: 5, r: 5 }, { n: 5, r: 3 }]

function SchemePopover({ onPick, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
      <div style={{
        position: 'absolute', top: 52, right: 12, zIndex: 40,
        background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)',
        borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)', padding: 6,
        display: 'grid', gridTemplateColumns: 'repeat(2, 64px)', gap: 4,
      }}>
        {SCHEMES.map(({ n, r }) => (
          <button key={`${n}x${r}`} onClick={() => { onPick(n, r); onClose() }} style={{
            height: 34, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', padding: 0,
            background: 'rgba(var(--overlay-rgb),0.04)',
            ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)',
          }}>{n}×{r}</button>
        ))}
      </div>
    </>
  )
}

// ghost kebab — same visual weight as the chevron beside it, no box until tapped
const kebabTriggerSt = open => ({
  width: 28, height: 28, borderRadius: 'var(--radius-lg)',
  background: open ? 'rgba(var(--overlay-rgb),0.06)' : 'none', border: 'none',
  color: 'var(--cs-on-surface-variant)', opacity: open ? 0.85 : 0.45,
})

// ─── Reorder mode ──────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
      <circle cx="4.5" cy="3" r="1.5" /><circle cx="9.5" cy="3" r="1.5" />
      <circle cx="4.5" cy="9" r="1.5" /><circle cx="9.5" cy="9" r="1.5" />
      <circle cx="4.5" cy="15" r="1.5" /><circle cx="9.5" cy="15" r="1.5" />
    </svg>
  )
}

function ReorderIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="5" x2="8" y2="19" /><polyline points="4 9 8 5 12 9" />
      <line x1="16" y1="5" x2="16" y2="19" /><polyline points="12 15 16 19 20 15" />
    </svg>
  )
}

function SupersetIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="13" height="7" rx="2" />
      <rect x="8" y="13" width="13" height="7" rx="2" />
    </svg>
  )
}

function SoloCard({ item, open, onToggle, onChange, onDelete, onEdit, onDuplicate, defaults }) {
  const ex = ALL_EXERCISES.find(e => e.id === item.exerciseId)
  // card drops overflow:hidden while a menu (header kebab OR a row ⋮) is open
  // so the popover can escape the clip; zIndex raises it above sibling cards
  const [menuOpen, setMenuOpen] = useState(false)
  const [rowLift, setRowLift] = useState(false)
  const [schemeOpen, setSchemeOpen] = useState(false)
  const lifted = menuOpen || rowLift || schemeOpen
  function applyScheme(n, r) {
    const last = item.sets[item.sets.length - 1] || {}
    onChange({ ...item, sets: Array.from({ length: n }, () => ({ weight: last.weight ?? 8, reps: r, weightUnit: last.weightUnit, repsUnit: last.repsUnit })) })
  }
  if (!ex) return null

  return (
    <GlassCard level="Low" style={{ display: 'flex', overflow: lifted ? 'visible' : 'hidden', position: 'relative', zIndex: lifted ? 30 : 'auto' }}>
      <div style={{ width: 4, flexShrink: 0, background: 'var(--cs-primary)', opacity: 0.55, borderRadius: 'var(--radius-2xl) 0 0 var(--radius-2xl)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header (tap to expand) */}
        <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 14px', cursor: 'pointer' }}>
          <Thumb muscle={ex.muscle} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
            <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 2 }}>
              {open ? `${ex.muscle} · ${ex.equipment}` : soloSummary(item.sets, defaults)}
            </div>
          </div>
          <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, flexShrink: 0 }}>{item.sets.length} sets</span>
          <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.45, display: 'flex', flexShrink: 0 }}><ChevDownIcon open={open} /></span>
          <span onClick={e => e.stopPropagation()} style={{ display: 'flex', flexShrink: 0 }}>
            <DropdownMenu onOpenChange={setMenuOpen}
              items={cardMenu({
                onEdit,
                onScheme: () => setSchemeOpen(true),
                onDuplicate,
                onAddNote: item.note === undefined ? () => onChange({ ...item, note: '' }) : null,
                onDelete,
              })}
              triggerStyle={kebabTriggerSt(menuOpen)} />
          </span>
        </div>

        {schemeOpen && <SchemePopover onPick={applyScheme} onClose={() => setSchemeOpen(false)} />}

        {/* exercise note — visible even collapsed; emptied on blur = removed */}
        {item.note !== undefined && (
          <NoteRow value={item.note}
            onChange={t => onChange({ ...item, note: t })}
            onClear={() => { const { note: _n, ...rest } = item; onChange(rest) }}
            style={{ padding: '0 14px 11px 14px' }} />
        )}

        <Expandable open={open}>
          <div style={{ padding: '4px 14px 14px' }}>
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '0 0 16px' }} />
            <SoloSetsEditor item={item} onChange={onChange} onMenuLift={setRowLift} defaults={defaults} />
          </div>
        </Expandable>
      </div>
    </GlassCard>
  )
}

// pulling an exercise out of a 2-exercise superset converts the item to solo
function removeFromSuperset(item, exId) {
  const ids = item.exerciseIds.filter(x => x !== exId)
  if (ids.length >= 2) {
    return { ...item, exerciseIds: ids, sets: item.sets.map(s => { const { [exId]: _x, ...rest } = s; return rest }) }
  }
  const rem = ids[0]
  return { id: item.id, type: 'solo', exerciseId: rem, restSet: item.restSet, sets: item.sets.map(s => ({ ...(s[rem] || { weight: 8, reps: 10 }) })) }
}

function SupersetCard({ item, open, onToggle, onChange, onDelete, onEdit, onDuplicate, defaults }) {
  const exercises = item.exerciseIds.map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean)
  // card drops overflow:hidden while a menu (header kebab OR a row ⋮) is open
  const [menuOpen, setMenuOpen] = useState(false)
  const [rowLift, setRowLift] = useState(false)
  const [schemeOpen, setSchemeOpen] = useState(false)
  const lifted = menuOpen || rowLift || schemeOpen
  function applyScheme(n, r) {
    const lastRound = item.sets[item.sets.length - 1] || {}
    const sets = Array.from({ length: n }, () => {
      const o = {}
      item.exerciseIds.forEach(id => {
        const prev = lastRound[id] || {}
        o[id] = { weight: prev.weight ?? 8, reps: r, weightUnit: prev.weightUnit, repsUnit: prev.repsUnit }
      })
      return o
    })
    onChange({ ...item, sets })
  }

  return (
    <div style={{ borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--cs-primary-rgb),0.05)', border: '1px solid rgba(var(--cs-primary-rgb),0.18)', overflow: lifted ? 'visible' : 'hidden', position: 'relative', zIndex: lifted ? 30 : 'auto', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--cs-primary)', borderRadius: 'var(--radius-2xl) 0 0 var(--radius-2xl)' }} />

      {/* Header (tap to expand) */}
      <div onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 6px 14px' }}>
          <SectionLabel count={`${item.sets.length} sets each`} style={{ color: 'var(--cs-primary)', opacity: 0.80, flex: 1 }}>Superset</SectionLabel>
          <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.45, display: 'flex' }}><ChevDownIcon open={open} /></span>
          <span onClick={e => e.stopPropagation()} style={{ display: 'flex', flexShrink: 0 }}>
            <DropdownMenu onOpenChange={setMenuOpen}
              items={cardMenu({
                onEdit,
                onScheme: () => setSchemeOpen(true),
                onDuplicate,
                onAddNote: item.note === undefined ? () => onChange({ ...item, note: '' }) : null,
                onDelete,
              })}
              triggerStyle={kebabTriggerSt(menuOpen)} />
          </span>
        </div>
        {schemeOpen && <SchemePopover onPick={applyScheme} onClose={() => setSchemeOpen(false)} />}
        {exercises.map((ex, i) => (
          <div key={ex.id}>
            {i > 0 && <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)', marginLeft: 14 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
              <Thumb muscle={ex.muscle} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{ex.name}</div>
                <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{ex.muscle} · {ex.equipment}</div>
              </div>
              {/* per-exercise ⋮ — resolves the "which exercise does Change apply to?" ambiguity */}
              <span onClick={e => e.stopPropagation()} style={{ display: 'flex', flexShrink: 0 }}>
                <DropdownMenu
                  onOpenChange={setRowLift}
                  items={[
                    { label: 'Change exercise', onClick: () => { /* stub — exercise picker */ } },
                    { label: 'Remove from superset', danger: true, onClick: () => onChange(removeFromSuperset(item, ex.id)) },
                  ]}
                  triggerStyle={kebabTriggerSt(false)}
                />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* superset note — visible even collapsed */}
      {item.note !== undefined && (
        <NoteRow value={item.note}
          onChange={t => onChange({ ...item, note: t })}
          onClear={() => { const { note: _n, ...rest } = item; onChange(rest) }}
          style={{ padding: '0 14px 10px 14px' }} />
      )}

      <Expandable open={open}>
        <div style={{ padding: '6px 14px 14px' }}>
          <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.12)', margin: '0 0 14px' }} />
          <SupersetSetsEditor item={item} onChange={onChange} onMenuLift={setRowLift} defaults={defaults} />
        </div>
      </Expandable>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WorkoutBuilderScreen({ initialStep = 'list' }) {
  const seedExpanded = initialStep === 'edit-solo' ? 'a'
    : initialStep === 'edit-superset' ? 'b'
    : null

  const seedItems = initialStep === 'list-superset'
    ? [DEMO_ITEMS[1], DEMO_ITEMS[0], DEMO_ITEMS[2]]
    : DEMO_ITEMS

  const [workoutName, setWorkoutName] = useState('Leg Day')
  const [description, setDescription] = useState('Heavy lower-body day — squats, hinges, and accessory work.')
  const [tags, setTags] = useState([])
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  // drives the tag sheet's container-transform enter (mount → next frame → in)
  const [tagSheetIn, setTagSheetIn] = useState(false)
  useEffect(() => {
    if (!tagDialogOpen) { setTagSheetIn(false); return }
    const id = requestAnimationFrame(() => setTagSheetIn(true))
    return () => cancelAnimationFrame(id)
  }, [tagDialogOpen])
  const [tagQuery, setTagQuery] = useState('')
  const [items, setItems] = useState(seedItems)
  const [expandedId, setExpandedId] = useState(seedExpanded)
  // rest between exercises is keyed by GAP POSITION, not by item (see DEMO_GAPS note)
  const [restGaps, setRestGaps] = useState(() => DEMO_GAPS.slice(0, seedItems.length - 1))
  // workout-level base config — sets/exercises without explicit values inherit these
  const [defaults, setDefaults] = useState({ weightUnit: 'rpe', repsUnit: 'reps', restSet: 90, restGap: 120 })

  // FAB menu — the page-level actions live here (add exercise / superset / reorder)
  const [fabOpen, setFabOpen] = useState(false)

  // reorder mode — cards collapse, rest dividers hide, grips appear on the left
  const [reorderMode, setReorderMode] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [dragY, setDragY] = useState(0)
  const rowRefs = useRef([])
  const dragState = useRef(null)

  const { exCount, setCount, estMin } = calcStats(items, restGaps, defaults)

  // tag dialog: search + create. List shows only NOT-yet-selected tags
  // (selected ones live as removable chips above the list).
  const tagPool   = [...new Set([...TAG_PRESETS, ...tags])]
  const tagMatches = tagPool.filter(t => !tags.includes(t) && t.toLowerCase().includes(tagQuery.trim().toLowerCase()))
  const showCreate = tagQuery.trim() && !tagPool.some(t => t.toLowerCase() === tagQuery.trim().toLowerCase())

  function toggle(id) { setExpandedId(cur => cur === id ? null : id) }
  function updateItem(updated) { setItems(p => p.map(it => it.id === updated.id ? updated : it)) }
  // delete is undoable: the removed card + its rest slot sit in a 4s buffer
  const [lastDeleted, setLastDeleted] = useState(null) // { item, index, gap }
  const undoTimer = useRef(null)
  const copySeq = useRef(1)
  function deleteItem(id) {
    const i = items.findIndex(it => it.id === id)
    if (i < 0) return
    const gap = restGaps[Math.min(i, restGaps.length - 1)]
    setRestGaps(g => g.filter((_, j) => j !== Math.min(i, g.length - 1)))
    setItems(p => p.filter(it => it.id !== id))
    setExpandedId(null)
    clearTimeout(undoTimer.current)
    setLastDeleted({ item: items[i], index: i, gap })
    undoTimer.current = setTimeout(() => setLastDeleted(null), 4000)
  }
  function undoDelete() {
    if (!lastDeleted) return
    clearTimeout(undoTimer.current)
    const { item, index, gap } = lastDeleted
    setItems(p => { const n = [...p]; n.splice(Math.min(index, n.length), 0, item); return n })
    setRestGaps(g => { const n = [...g]; n.splice(Math.min(index, n.length), 0, gap ?? defaults.restGap); return n })
    setLastDeleted(null)
  }
  function duplicateItem(id) {
    const i = items.findIndex(it => it.id === id)
    if (i < 0) return
    const copy = JSON.parse(JSON.stringify(items[i]))
    copy.id = `${id}-c${copySeq.current++}`
    setItems(p => [...p.slice(0, i + 1), copy, ...p.slice(i + 1)])
    // the copy inherits the original's pause-after as its own slot
    setRestGaps(g => { const n = [...g]; n.splice(i, 0, g[i] ?? defaults.restGap); return n })
  }
  function editItem() { /* stub — wire to the Exercises search/picker when connected */ }
  function moveItem(from, to) {
    setItems(p => { const n = [...p]; const [it] = n.splice(from, 1); n.splice(to, 0, it); return n })
  }

  // drag — grip-handle pointer drag; swaps with a neighbour once the dragged row's
  // offset crosses half of that neighbour's height (uniform-free: heights measured)
  const ROW_GAP = 10
  function dragStart(e, i) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startY: e.clientY, idx: i, heights: rowRefs.current.map(el => el?.offsetHeight ?? 0) }
    setDragIdx(i); setDragY(0)
  }
  function dragMove(e) {
    const s = dragState.current
    if (!s) return
    let dy = e.clientY - s.startY
    while (s.idx < s.heights.length - 1 && dy > (s.heights[s.idx + 1] + ROW_GAP) / 2) {
      const next = s.idx + 1
      moveItem(s.idx, next)
      s.startY += s.heights[next] + ROW_GAP
      ;[s.heights[s.idx], s.heights[next]] = [s.heights[next], s.heights[s.idx]]
      s.idx = next
      dy = e.clientY - s.startY
    }
    while (s.idx > 0 && dy < -(s.heights[s.idx - 1] + ROW_GAP) / 2) {
      const prev = s.idx - 1
      moveItem(s.idx, prev)
      s.startY -= s.heights[prev] + ROW_GAP
      ;[s.heights[s.idx], s.heights[prev]] = [s.heights[prev], s.heights[s.idx]]
      s.idx = prev
      dy = e.clientY - s.startY
    }
    setDragIdx(s.idx); setDragY(dy)
  }
  function dragEnd() {
    dragState.current = null
    setDragIdx(null); setDragY(0)
  }
  function toggleTag(t) { setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]) }
  function createTag(name) {
    const t = name.trim()
    if (t && !tags.some(x => x.toLowerCase() === t.toLowerCase())) setTags(p => [...p, t])
    setTagQuery('')
  }

  return (
    <PhoneFrame smokeVariant="shader">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <NavBar>
          <StatusBar />
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px', gap: 8 }}>
            <IconButton size="md" aria-label="Back" icon={<ChevLeftIcon />} />
            <div style={{ flex: 1 }} />
            <IconButton size="md" aria-label="Save workout" icon={<CheckIcon />}
              style={{ background: 'var(--cs-primary)', border: 'none', color: 'var(--cs-on-primary)' }} />
          </div>
        </NavBar>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 90px' }}>
          {/* Workout details card — name · description · tags grouped as a form */}
          <GlassCard level="Low" style={{ padding: '14px 16px', marginBottom: 14 }}>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="Workout name"
              style={{ ...TT, fontSize: 'var(--tt-title-medium-size)', fontWeight: 500, color: 'var(--cs-on-surface)', background: 'none', border: 'none', outline: 'none', padding: 0, width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0' }} />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={2}
              style={{ ...TT, fontSize: 'var(--tt-body-small-size)', lineHeight: 'var(--tt-body-small-height)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)', background: 'none', border: 'none', outline: 'none', resize: 'none', padding: 0, width: '100%', boxSizing: 'border-box', display: 'block' }}
            />
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0' }} />

            {/* Tags — empty by default; the row opens the tag dialog */}
            <button onClick={() => { setTagQuery(''); setTagDialogOpen(true) }} style={tagFieldSt}>
              <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.45, flexShrink: 0 }}><TagIcon /></span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {tags.length === 0
                  ? <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>Add tags</span>
                  : tags.map(t => <span key={t} style={tagChipSt}>{t}</span>)}
              </div>
              <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4, flexShrink: 0 }}><ChevRightIcon /></span>
            </button>
          </GlassCard>

          {/* Workout defaults — base units + rests that sets/exercises inherit */}
          <WorkoutDefaultsCard defaults={defaults} setDefaults={setDefaults} />

          <div style={{ display: 'flex', alignItems: 'center', margin: '0 2px 14px', minHeight: 26 }}>
            <p style={{ ...TT, flex: 1, fontSize: 'var(--tt-body-small-size)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)', opacity: 0.40, margin: 0 }}>
              {exCount} {exCount === 1 ? 'exercise' : 'exercises'} · {setCount} sets · ~{estMin} min
            </p>
            {/* reorder mode is entered from the FAB menu; Done exits it */}
            {reorderMode && (
              <button onClick={() => setReorderMode(false)} style={{
                ...TT, height: 26, padding: '0 12px', borderRadius: 'var(--radius-2xl)', cursor: 'pointer',
                background: 'rgba(var(--cs-primary-rgb),0.14)', border: '1px solid rgba(var(--cs-primary-rgb),0.28)',
                fontSize: 12, fontWeight: 600, color: 'var(--cs-primary)',
              }}>Done</button>
            )}
          </div>

          {/* Cards — rest dividers between cards mark the pause before the next exercise.
              In reorder mode: dividers hide, cards collapse + shrink, grips appear. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: reorderMode ? ROW_GAP : 16 }}>
            {items.map((item, i) => {
              const card = item.type === 'superset'
                ? <SupersetCard item={item} open={!reorderMode && expandedId === item.id} onToggle={() => !reorderMode && toggle(item.id)} onChange={updateItem} onDelete={() => deleteItem(item.id)} onEdit={() => editItem(item.id)} onDuplicate={() => duplicateItem(item.id)} defaults={defaults} />
                : <SoloCard item={item} open={!reorderMode && expandedId === item.id} onToggle={() => !reorderMode && toggle(item.id)} onChange={updateItem} onDelete={() => deleteItem(item.id)} onEdit={() => editItem(item.id)} onDuplicate={() => duplicateItem(item.id)} defaults={defaults} />
              return (
                <Fragment key={item.id}>
                  <div ref={el => { rowRefs.current[i] = el }} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    position: 'relative',
                    transform: dragIdx === i ? `translateY(${dragY}px)` : 'none',
                    zIndex: dragIdx === i ? 20 : 'auto',
                  }}>
                    {reorderMode && (
                      <span
                        onPointerDown={e => dragStart(e, i)} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={dragEnd}
                        style={{
                          width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--cs-on-surface-variant)', opacity: dragIdx === i ? 0.9 : 0.45,
                          cursor: dragIdx === i ? 'grabbing' : 'grab', touchAction: 'none',
                        }}><GripIcon /></span>
                    )}
                    <div style={{ flex: 1, minWidth: 0, filter: dragIdx === i ? 'brightness(1.15)' : 'none' }}>
                      {card}
                    </div>
                  </div>
                  {!reorderMode && i < items.length - 1 && (
                    <RestDivider value={restGaps[i] ?? defaults.restGap}
                      onChange={v => setRestGaps(g => { const n = [...g]; n[i] = v; return n })} />
                  )}
                </Fragment>
              )
            })}
          </div>

        </div>

        {/* Footer — only the FAB menu lives here (Save moved into it); hidden in reorder mode */}
        {!reorderMode && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'linear-gradient(0deg, rgba(var(--cs-surface-rgb),0.92) 55%, transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FabMenu open={fabOpen} setOpen={setFabOpen} actions={[
                { label: 'Add exercise', icon: <PlusIcon size={15} />, onClick: () => { /* stub — exercise picker */ } },
                { label: 'Add superset', icon: <SupersetIcon />, onClick: () => { /* stub — superset picker */ } },
                { label: 'Reorder', icon: <ReorderIcon />, onClick: () => { setReorderMode(true); setExpandedId(null) } },
                { label: 'Save workout', icon: <CheckIcon />, primary: true, dividerAbove: true, onClick: () => { /* stub — save */ } },
              ]} />
            </div>
          </div>
        )}

        {/* undo snackbar — 4s window after deleting an exercise */}
        {lastDeleted && (
          <div style={{
            position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 46,
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 'var(--radius-xl)', background: 'var(--glass-popover)',
            border: '1px solid rgba(var(--overlay-rgb),0.10)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(var(--cs-shadow-rgb),0.55)',
          }}>
            <span style={{ ...TT, flex: 1, fontSize: 13, color: 'var(--cs-on-surface)' }}>Exercise deleted</span>
            <button onClick={undoDelete} style={{ ...TT, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--cs-primary)', padding: 0 }}>
              Undo
            </button>
          </div>
        )}

        {/* ── Tag dialog — search · create · multi-select ── */}
        {tagDialogOpen && (
          <>
            <div onClick={() => setTagDialogOpen(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(var(--cs-shadow-rgb),0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
                opacity: tagSheetIn ? 1 : 0, transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1)' }} />
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41, height: 600,
              display: 'flex', flexDirection: 'column',
              background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
              boxShadow: '0 -8px 32px rgba(var(--cs-shadow-rgb),0.55)',
              transform: tagSheetIn ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {/* handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} />
              </div>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 12px', flexShrink: 0 }}>
                <span style={{ ...TT, flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)' }}>Tags</span>
                <button onClick={() => setTagDialogOpen(false)} style={{ width: 30, height: 30, borderRadius: 'var(--radius-lg)', padding: 0, background: 'rgba(var(--overlay-rgb),0.05)', border: 'none', cursor: 'pointer', color: 'var(--cs-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XIcon size={13} />
                </button>
              </div>
              {/* search / create input */}
              <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
                <input
                  value={tagQuery}
                  onChange={e => setTagQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && showCreate) createTag(tagQuery) }}
                  placeholder="Search or create a tag…"
                  autoFocus
                  style={{ ...TT, width: '100%', height: 42, boxSizing: 'border-box', padding: '0 14px', borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', outline: 'none', fontSize: 14, color: 'var(--cs-on-surface)' }}
                />
              </div>

              {/* selected tags — removable chips, right after the field */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px', flexShrink: 0 }}>
                  {tags.map(t => (
                    <span key={t} style={tagChipRemovableSt}>
                      {t}
                      <button onClick={() => toggleTag(t)} style={tagXSt}><XIcon size={9} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', flexShrink: 0, margin: '0 16px 4px' }} />

              {/* list — only not-yet-selected tags, no selection highlight */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {showCreate && (
                  <button onClick={() => createTag(tagQuery)} style={tagCreateRowSt}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'rgba(var(--cs-primary-rgb),0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cs-primary)' }}><PlusIcon size={12} /></span>
                    Create “{tagQuery.trim()}”
                  </button>
                )}
                {tagMatches.map(t => (
                  <button key={t} onClick={() => toggleTag(t)} style={tagRowSt(false)}>
                    <span style={{ ...TT, flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 400, color: 'var(--cs-on-surface)' }}>{t}</span>
                    <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.4, display: 'flex' }}><PlusIcon size={13} /></span>
                  </button>
                ))}
                {tagMatches.length === 0 && !showCreate && (
                  <p style={{ ...TT, textAlign: 'center', padding: '28px 0', fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                    {tagQuery.trim() ? 'No more tags' : 'All tags added'}
                  </p>
                )}
              </div>
              {/* done */}
              <div style={{ padding: '10px 16px 24px', flexShrink: 0, borderTop: '1px solid rgba(var(--overlay-rgb),0.06)' }}>
                <button onClick={() => setTagDialogOpen(false)} style={{
                  ...TT, width: '100%', height: 48, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
                  border: '1px solid rgba(var(--overlay-rgb),0.18)', color: 'var(--cs-on-primary)', fontSize: 15, fontWeight: 500,
                  boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)',
                }}>
                  Done{tags.length ? ` · ${tags.length}` : ''}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PhoneFrame>
  )
}
