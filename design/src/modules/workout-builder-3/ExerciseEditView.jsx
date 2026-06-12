// Screen 2 of Workout Builder 3 — the full-screen EXERCISE EDITOR. What v1/v2
// hide behind the row ⋮ is surfaced here: the Last-session panel first (the
// reference you build against), visible unit chips, a sets table with rest
// DIVIDERS between rows (the v1 recipe), tap-to-pick type markers, a visible
// + Add drop set button per set, always-visible note row, a prev/next pager.
import { useState, Fragment } from 'react'
import NavBar from '../../components/NavBar.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import DropdownMenu from '../../components/DropdownMenu.jsx'
import {
  TT, iconBtnSt, glassPopoverSt, ALL_EXERCISES, EXERCISE_HISTORY,
  ChevLeftIcon, ChevLeftSmIcon, ChevRightSmIcon, PlusIcon, HistoryIcon, NoteIcon,
  Thumb, ValueField, RowMenu, RestDivider, RestPickerPopover, NoteRow, TempoRow, StructureRow, CompactSets,
  SetNumber, MarkerCell, TYPE_INFO, SET_TYPES, MAX_DROPS, WEIGHT_UNITS, REPS_UNITS,
  dotNodeSt, xSepSt, rmHintSt, OneRmLink, kebabTriggerSt,
} from './shared.jsx'

// table grid — SET · LOAD · × · REPS · ⋮ (rest lives on dividers between rows)
const GRID = { display: 'grid', gridTemplateColumns: '28px 1fr 10px 1fr 34px', columnGap: 6, alignItems: 'center' }

const microLblSt = { ...TT, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }

// superset main-row ring (matches v1's hollow main node)
const ringSt = {
  position: 'relative', zIndex: 1,
  width: 13, height: 13, borderRadius: '50%', boxSizing: 'border-box',
  background: 'var(--node-center)', border: '1px solid rgba(var(--cs-primary-rgb),0.45)',
}

// type marker — tapping opens the type picker directly (full-screen editor has
// room for direct manipulation; the v1 tooltip became the picker's hints)
function TypeMarker({ type, n, onPick }) {
  const [open, setOpen] = useState(false)
  const info = type ? TYPE_INFO[type] : null
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', padding: 9, margin: -9, cursor: 'pointer', display: 'flex' }}>
        <SetNumber n={info ? info.letter : n} circled ch={info?.ch} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div style={{ ...glassPopoverSt, position: 'absolute', top: '100%', left: 0, marginTop: 5, zIndex: 40, minWidth: 168, padding: 4 }}>
            {SET_TYPES.map(t => (
              <button key={t.v} onClick={() => { onPick(t.v); setOpen(false) }} style={{
                ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 12, fontSize: 10, color: 'var(--cs-primary)', visibility: (type ?? 'working') === t.v ? 'visible' : 'hidden' }}>✓</span>
                {t.label}
                <span style={{ ...TT, marginLeft: 'auto', paddingLeft: 14, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>{t.hint}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// segmented unit chips — the rare-but-buried v1 action made visible
function UnitChips({ label, options, value, onPick }) {
  const chipSt = on => ({
    ...TT, height: 28, padding: '0 11px', borderRadius: 'var(--radius-2xl)', border: 'none', cursor: 'pointer',
    background: on ? 'rgba(var(--cs-primary-rgb),0.16)' : 'rgba(var(--overlay-rgb),0.05)',
    fontSize: 12, fontWeight: on ? 600 : 400, flexShrink: 0,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
    boxShadow: on ? 'inset 0 0 0 1px rgba(var(--cs-primary-rgb),0.30)' : 'none',
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ ...microLblSt, width: 32, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
        {options.map(u => (
          <button key={u} onClick={() => onPick(u)} style={chipSt(value === u)}>{u}</button>
        ))}
      </div>
    </div>
  )
}

// quiet visible "+ Add drop set" under a set's rows (frequency rule: adding a
// drop is common enough mid-planning to deserve a control in the open)
function AddDropBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      ...TT, display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '6px 0 0 34px', fontSize: 12, fontWeight: 500,
      color: 'var(--cs-on-surface-variant)', opacity: 0.50,
    }}><PlusIcon size={10} /> Add drop set</button>
  )
}

function HistoryCard({ hist, defaults, onPrefill }) {
  return (
    <GlassCard level="Low" style={{ padding: '12px 16px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}><HistoryIcon /></span>
        <span style={microLblSt}>LAST SESSION</span>
        <span style={{ ...TT, marginLeft: 'auto', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.60 }}>{hist.date}</span>
      </div>
      <CompactSets item={{ type: 'solo', sets: hist.sets }} defaults={defaults} />
      {onPrefill && (
        <button onClick={onPrefill} style={{
          ...TT, width: '100%', height: 34, marginTop: 10, borderRadius: 'var(--radius-lg)', cursor: 'pointer',
          background: 'rgba(var(--cs-primary-rgb),0.10)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)',
          fontSize: 12, fontWeight: 600, color: 'var(--cs-primary)',
        }}>Prefill these sets</button>
      )}
    </GlassCard>
  )
}

// one editable set group (main row + sub-rows + drops) inside the table
function EditSetRow({
  set, displayN, defaults, oneRM, onSetOneRM,
  onChange, onDelete, canDelete, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown,
  onAddDrop, onRemoveDrop, onApplyLoadAll, onApplyRepsAll,
}) {
  const drops = set.ds || []
  const isWarmup = set.type === 'warmup'
  const wUnit = set.weightUnit ?? defaults.weightUnit
  const repsUnitCur = set.repsUnit ?? defaults.repsUnit
  const rmHint = wUnit === '%1RM'
    ? (oneRM
      ? <span style={rmHintSt}>≈ {Math.round((set.weight || 0) / 100 * oneRM * 2) / 2} kg</span>
      : onSetOneRM ? <OneRmLink onSet={onSetOneRM} /> : null)
    : null

  return (
    <div>
      {set.note !== undefined && (
        <NoteRow value={set.note}
          onChange={t => onChange({ ...set, note: t })}
          onClear={() => { const { note: _n, ...rest } = set; onChange(rest) }}
          style={{ marginBottom: 8, paddingLeft: 34, paddingRight: 40 }} />
      )}
      {set.tempo !== undefined && (
        <TempoRow value={set.tempo}
          onChange={t => onChange({ ...set, tempo: t })}
          onClear={() => { const { tempo: _t, ...rest } = set; onChange(rest) }}
          style={{ marginBottom: 8, paddingLeft: 34, paddingRight: 40 }} />
      )}
      {set.structure && (
        <StructureRow structure={set.structure}
          onChange={st => onChange({ ...set, structure: st })}
          onClear={() => { const { structure: _s, ...rest } = set; onChange(rest) }}
          style={{ marginBottom: 8, paddingLeft: 34, paddingRight: 40 }} />
      )}

      <div style={GRID}>
        <MarkerCell>
          <TypeMarker type={set.type} n={displayN}
            onPick={v => {
              if (v === 'working') { const { type: _t, ...rest } = set; onChange(rest) }
              else onChange({ ...set, type: v })
            }} />
        </MarkerCell>
        <ValueField dim={isWarmup} value={set.weight} unit={wUnit} kind="weight"
          onChange={w => onChange({ ...set, weight: w })} subHint={rmHint} />
        <span style={xSepSt}>×</span>
        <ValueField dim={isWarmup} value={set.reps} unit={repsUnitCur} kind="reps"
          onChange={r => onChange({ ...set, reps: r })}
          valueMax={set.repsMax} onChangeMax={m => onChange({ ...set, repsMax: m })} />
        <RowMenu
          weightUnit={wUnit} repsUnit={repsUnitCur}
          onWeightUnit={u => onChange({ ...set, weightUnit: u })} onRepsUnit={u => onChange({ ...set, repsUnit: u })}
          rangeOn={set.repsMax != null}
          onToggleRange={repsUnitCur === 'reps' ? () => {
            if (set.repsMax != null) { const { repsMax: _m, ...rest } = set; onChange(rest) }
            else onChange({ ...set, repsMax: set.reps + 2 })
          } : null}
          structure={set.structure}
          onStructure={v => {
            if (v === 'straight') { const { structure: _s, ...rest } = set; onChange(rest) }
            else onChange({ ...set, structure: { kind: v, mini: set.structure?.mini ?? 3, intraRest: set.structure?.intraRest ?? 20 } })
          }}
          onAddNote={set.note === undefined ? () => onChange({ ...set, note: '' }) : null}
          onAddTempo={set.tempo === undefined ? () => onChange({ ...set, tempo: '' }) : null}
          onDuplicate={onDuplicate}
          onMoveUp={onMoveUp} onMoveDown={onMoveDown} canMoveUp={canMoveUp} canMoveDown={canMoveDown}
          onApplyLoadAll={onApplyLoadAll} onApplyRepsAll={onApplyRepsAll}
          onDelete={onDelete} deleteDisabled={!canDelete}
        />
      </div>

      {drops.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {drops.map((d, di) => {
            const updDrop = patch => onChange({ ...set, ds: drops.map((x, j) => j === di ? { ...x, ...patch } : x) })
            return (
              <div key={di} style={GRID}>
                <MarkerCell><span style={dotNodeSt} /></MarkerCell>
                <ValueField dim value={d.weight} unit={d.weightUnit ?? defaults.weightUnit} kind="weight"
                  onChange={w => updDrop({ weight: w })} />
                <span style={xSepSt}>×</span>
                <ValueField dim value={d.reps} unit={d.repsUnit ?? defaults.repsUnit} kind="reps"
                  onChange={r => updDrop({ reps: r })} />
                <RowMenu
                  weightUnit={d.weightUnit ?? defaults.weightUnit} repsUnit={d.repsUnit ?? defaults.repsUnit}
                  onWeightUnit={u => updDrop({ weightUnit: u })} onRepsUnit={u => updDrop({ repsUnit: u })}
                  onDelete={() => onRemoveDrop(di)}
                />
              </div>
            )
          })}
        </div>
      )}
      {drops.length < MAX_DROPS && <AddDropBtn onClick={onAddDrop} />}
    </div>
  )
}

export default function ExerciseEditView({
  item, index, total, defaults, oneRMs, setOneRM,
  onBack, onPrev, onNext, onChange, onDelete, onDuplicate,
}) {
  const isSuper = item.type === 'superset'
  const exercises = (isSuper ? item.exerciseIds : [item.exerciseId])
    .map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean)
  const [activeIdx, setActiveIdx] = useState(0)
  const activeEx = exercises[Math.min(activeIdx, exercises.length - 1)]
  const [menuOpen, setMenuOpen] = useState(false)
  const hist = !isSuper ? EXERCISE_HISTORY[item.exerciseId] : null

  // ── update helpers ──
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
    if (isSuper) {
      const s = {}; exercises.forEach(ex => { s[ex.id] = { weight: 8, reps: 10 } })
      onChange({ ...item, sets: [...item.sets, s] })
    } else {
      const last = item.sets[item.sets.length - 1] || { weight: 0, reps: 8 }
      onChange({ ...item, sets: [...item.sets, { weight: last.weight, reps: last.reps, weightUnit: last.weightUnit, repsUnit: last.repsUnit }] })
    }
  }
  function newDrop(last, d) {
    const u = last.weightUnit ?? d.weightUnit
    const w = u === 'rpe' ? Math.min(10, (last.weight || 8) + 0.5)
      : u === 'rir' ? Math.max(0, (last.weight || 2) - 0.5)
      : Math.max(0, last.weight - 5)
    return { weight: w, reps: (last.reps || 8) + 2, weightUnit: last.weightUnit, repsUnit: last.repsUnit }
  }
  function addDropSolo(i) {
    const s = item.sets[i]; const ds = s.ds || []
    if (ds.length >= MAX_DROPS) return
    updSet(i, { ...s, ds: [...ds, newDrop(ds[ds.length - 1] || s, defaults)] })
  }
  function removeDropSolo(i, di) {
    const s = item.sets[i]
    const ds = (s.ds || []).filter((_, j) => j !== di)
    if (ds.length === 0) { const { ds: _x, ...rest } = s; updSet(i, rest) }
    else updSet(i, { ...s, ds })
  }
  function applyLoadAll(i) {
    const src = item.sets[i]
    onChange({ ...item, sets: item.sets.map(x => ({ ...x, weight: src.weight, weightUnit: src.weightUnit })) })
  }
  function applyRepsAll(i) {
    const src = item.sets[i]
    onChange({ ...item, sets: item.sets.map(x => { const { repsMax: _m, ...rest } = x; return { ...rest, reps: src.reps, repsUnit: src.repsUnit, ...(src.repsMax != null ? { repsMax: src.repsMax } : {}) } }) })
  }
  // superset variants (per exercise)
  function updEx(i, exId, patch) {
    const set = item.sets[i]
    updSet(i, { ...set, [exId]: { ...(set[exId] || { weight: 0, reps: 10 }), ...patch } })
  }
  function addDropEx(i, exId) {
    const cur = item.sets[i][exId] || { weight: 8, reps: 10 }
    const ds = cur.ds || []
    if (ds.length >= MAX_DROPS) return
    updEx(i, exId, { ds: [...ds, newDrop(ds[ds.length - 1] || cur, defaults)] })
  }
  function removeDropEx(i, exId, di) {
    const cur = item.sets[i][exId] || {}
    const ds = (cur.ds || []).filter((_, j) => j !== di)
    if (ds.length) updEx(i, exId, { ds })
    else { const { ds: _x, ...rest } = cur; updSet(i, { ...item.sets[i], [exId]: rest }) }
  }
  function applyLoadAllEx(i, exId) {
    const src = item.sets[i][exId] || {}
    onChange({ ...item, sets: item.sets.map(s => ({ ...s, [exId]: { ...(s[exId] || {}), weight: src.weight, weightUnit: src.weightUnit } })) })
  }
  function applyRepsAllEx(i, exId) {
    const src = item.sets[i][exId] || {}
    onChange({ ...item, sets: item.sets.map(s => { const { repsMax: _m, ...rest } = s[exId] || {}; return { ...s, [exId]: { ...rest, reps: src.reps, repsUnit: src.repsUnit, ...(src.repsMax != null ? { repsMax: src.repsMax } : {}) } } }) })
  }

  // unit chips write the unit onto every set (and its drops); per-set override
  // still lives in the row ⋮. Current value reads from the first set.
  const firstSet = isSuper ? (item.sets[0]?.[activeEx?.id] || {}) : (item.sets[0] || {})
  const curWUnit = firstSet.weightUnit ?? defaults.weightUnit
  const curRUnit = firstSet.repsUnit ?? defaults.repsUnit
  function setAllWeightUnit(u) {
    if (isSuper) {
      onChange({ ...item, sets: item.sets.map(s => { const cur = s[activeEx.id] || {}; return { ...s, [activeEx.id]: { ...cur, weightUnit: u, ...(cur.ds ? { ds: cur.ds.map(d => ({ ...d, weightUnit: u })) } : {}) } } }) })
    } else {
      onChange({ ...item, sets: item.sets.map(s => ({ ...s, weightUnit: u, ...(s.ds ? { ds: s.ds.map(d => ({ ...d, weightUnit: u })) } : {}) })) })
    }
  }
  function setAllRepsUnit(u) {
    if (isSuper) {
      onChange({ ...item, sets: item.sets.map(s => { const cur = s[activeEx.id] || {}; return { ...s, [activeEx.id]: { ...cur, repsUnit: u } } }) })
    } else {
      onChange({ ...item, sets: item.sets.map(s => ({ ...s, repsUnit: u })) })
    }
  }

  const [exRestOpen, setExRestOpen] = useState(false)
  const restSetVal = item.restSet ?? defaults.restSet

  const tabSt = on => ({
    ...TT, flex: 1, height: 32, padding: '0 10px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
    background: on ? 'rgba(var(--cs-primary-rgb),0.14)' : 'transparent',
    fontSize: 12, fontWeight: on ? 600 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  })

  const pagerBtnSt = disabled => ({
    width: 30, height: 26, padding: 0, borderRadius: 'var(--radius-lg)', border: 'none',
    background: 'rgba(var(--overlay-rgb),0.05)', cursor: disabled ? 'default' : 'pointer',
    color: 'var(--cs-on-surface-variant)', opacity: disabled ? 0.25 : 0.75,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })

  let wn = 0

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <NavBar>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 8px', gap: 10 }}>
          <button onClick={onBack} style={iconBtnSt}><ChevLeftIcon /></button>
          {!isSuper && activeEx && <Thumb muscle={activeEx.muscle} size={36} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TT, fontSize: 15, fontWeight: 600, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isSuper ? 'Superset' : activeEx?.name}
            </div>
            <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.70, marginTop: 1 }}>
              {isSuper ? `${exercises.length} exercises · ${item.sets.length} rounds` : `${activeEx?.muscle} · ${activeEx?.equipment}`}
            </div>
          </div>
          <DropdownMenu onOpenChange={setMenuOpen}
            items={[
              { label: 'Change exercise', onClick: () => { /* stub — exercise picker */ } },
              { label: 'Duplicate exercise', onClick: onDuplicate },
              { label: 'Delete exercise', danger: true, onClick: onDelete },
            ]}
            triggerStyle={kebabTriggerSt(menuOpen)} />
        </div>
        {/* pager — walk the workout without going back to the preview */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 16px 10px' }}>
          <button disabled={index === 0} onClick={onPrev} style={pagerBtnSt(index === 0)}><ChevLeftSmIcon size={14} /></button>
          <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.65 }}>Exercise {index + 1} of {total}</span>
          <button disabled={index === total - 1} onClick={onNext} style={pagerBtnSt(index === total - 1)}><ChevRightSmIcon size={14} /></button>
        </div>
      </NavBar>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 40px' }}>
        {/* superset tabs — unit chips & history follow the active exercise */}
        {isSuper && (
          <GlassCard level="Low" style={{ display: 'flex', gap: 4, padding: 5, marginBottom: 14 }}>
            {exercises.map((ex, i) => (
              <button key={ex.id} onClick={() => setActiveIdx(i)} style={tabSt(i === activeIdx)}>{ex.name}</button>
            ))}
          </GlassCard>
        )}

        {/* last session FIRST — the reference you build today's prescription against */}
        {hist && (
          <HistoryCard hist={hist} defaults={defaults}
            onPrefill={() => onChange({ ...item, sets: JSON.parse(JSON.stringify(hist.sets)) })} />
        )}
        {isSuper && activeEx && EXERCISE_HISTORY[activeEx.id] && (
          <HistoryCard hist={EXERCISE_HISTORY[activeEx.id]} defaults={defaults} onPrefill={null} />
        )}

        {/* units — visible chips instead of a buried menu */}
        <GlassCard level="Low" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <UnitChips label="LOAD" options={WEIGHT_UNITS} value={curWUnit} onPick={setAllWeightUnit} />
          <UnitChips label="REPS" options={REPS_UNITS} value={curRUnit} onPick={setAllRepsUnit} />
        </GlassCard>

        {/* sets table */}
        <GlassCard level="Low" style={{ padding: '12px 14px 14px', marginBottom: 14, overflow: 'visible' }}>
          <div style={{ ...GRID, marginBottom: 8 }}>
            <span style={{ ...microLblSt, textAlign: 'center' }}>SET</span>
            <span style={{ ...microLblSt, textAlign: 'center' }}>LOAD</span>
            <span />
            <span style={{ ...microLblSt, textAlign: 'center' }}>REPS</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isSuper && item.sets.map((set, i) => {
              const displayN = set.type === 'warmup' || set.type === 'backoff' ? null : ++wn
              const prev = item.sets[i - 1]
              return (
                <Fragment key={i}>
                  {i > 0 && (
                    <RestDivider value={prev.restAfter ?? item.restSet ?? defaults.restSet}
                      onChange={v => updSet(i - 1, { ...prev, restAfter: v })}
                      onApplyAll={applyAllRest} />
                  )}
                  <EditSetRow set={set} displayN={displayN ?? i + 1}
                    defaults={defaults} oneRM={oneRMs[item.exerciseId]} onSetOneRM={v => setOneRM(item.exerciseId, v)}
                    onChange={s => updSet(i, s)} onDelete={() => delSet(i)} canDelete={item.sets.length > 1}
                    onDuplicate={() => dupSet(i)}
                    onMoveUp={() => moveSet(i, -1)} onMoveDown={() => moveSet(i, 1)}
                    canMoveUp={i > 0} canMoveDown={i < item.sets.length - 1}
                    onAddDrop={() => addDropSolo(i)} onRemoveDrop={di => removeDropSolo(i, di)}
                    onApplyLoadAll={() => applyLoadAll(i)} onApplyRepsAll={() => applyRepsAll(i)} />
                </Fragment>
              )
            })}

            {isSuper && item.sets.map((set, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <RestDivider value={item.sets[i - 1].restAfter ?? item.restSet ?? defaults.restSet}
                    onChange={v => updSet(i - 1, { ...item.sets[i - 1], restAfter: v })}
                    onApplyAll={applyAllRest} />
                )}
                <div>
                  {/* round header — number · label · round ⋮ */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 28, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                      <SetNumber n={i + 1} circled />
                    </span>
                    <span style={{ ...TT, flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}>
                      ROUND {i + 1}
                    </span>
                    <DropdownMenu
                      items={[
                        { label: 'Duplicate round', onClick: () => dupSet(i) },
                        { label: 'Move up', disabled: i === 0, onClick: () => moveSet(i, -1) },
                        { label: 'Move down', disabled: i === item.sets.length - 1, onClick: () => moveSet(i, 1) },
                        { label: 'Delete round', danger: true, disabled: item.sets.length <= 1, onClick: () => delSet(i) },
                      ]}
                      triggerStyle={{ ...kebabTriggerSt(false), width: 28, height: 28 }}
                    />
                  </div>

                  {exercises.map(ex => {
                    const exData = set[ex.id] || { weight: 0, reps: 10 }
                    const drops = exData.ds || []
                    const active = ex.id === activeEx?.id
                    return (
                      <Fragment key={ex.id}>
                        <div style={{ ...TT, fontSize: 11, fontWeight: 500, marginTop: 8, marginBottom: 6, paddingLeft: 34, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: active ? 'var(--cs-primary)' : 'var(--cs-on-surface)', opacity: active ? 0.9 : 0.6 }}>
                          {ex.name}
                        </div>
                        {exData.note !== undefined && (
                          <NoteRow value={exData.note}
                            onChange={t => updEx(i, ex.id, { note: t })}
                            onClear={() => { const { note: _n, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }}
                            style={{ marginBottom: 6, paddingLeft: 34, paddingRight: 40 }} />
                        )}
                        {exData.tempo !== undefined && (
                          <TempoRow value={exData.tempo}
                            onChange={t => updEx(i, ex.id, { tempo: t })}
                            onClear={() => { const { tempo: _t, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }}
                            style={{ marginBottom: 6, paddingLeft: 34, paddingRight: 40 }} />
                        )}
                        {exData.structure && (
                          <StructureRow structure={exData.structure}
                            onChange={st => updEx(i, ex.id, { structure: st })}
                            onClear={() => { const { structure: _s, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }}
                            style={{ marginBottom: 6, paddingLeft: 34, paddingRight: 40 }} />
                        )}
                        <div style={GRID}>
                          <MarkerCell><span style={ringSt} /></MarkerCell>
                          <ValueField value={exData.weight} unit={exData.weightUnit ?? defaults.weightUnit} kind="weight"
                            onChange={w => updEx(i, ex.id, { weight: w })}
                            subHint={(exData.weightUnit ?? defaults.weightUnit) === '%1RM' ? (oneRMs[ex.id]
                              ? <span style={rmHintSt}>≈ {Math.round((exData.weight || 0) / 100 * oneRMs[ex.id] * 2) / 2} kg</span>
                              : <OneRmLink onSet={v => setOneRM(ex.id, v)} />) : null} />
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
                            structure={exData.structure}
                            onStructure={v => {
                              if (v === 'straight') { const { structure: _s, ...rest } = set[ex.id] || {}; updSet(i, { ...set, [ex.id]: rest }) }
                              else updEx(i, ex.id, { structure: { kind: v, mini: exData.structure?.mini ?? 3, intraRest: exData.structure?.intraRest ?? 20 } })
                            }}
                            onAddNote={exData.note === undefined ? () => updEx(i, ex.id, { note: '' }) : null}
                            onAddTempo={exData.tempo === undefined ? () => updEx(i, ex.id, { tempo: '' }) : null}
                            onApplyLoadAll={() => applyLoadAllEx(i, ex.id)} onApplyRepsAll={() => applyRepsAllEx(i, ex.id)}
                          />
                        </div>
                        {drops.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                            {drops.map((d, di) => {
                              const updDrop = patch => updEx(i, ex.id, { ds: drops.map((x, j) => j === di ? { ...x, ...patch } : x) })
                              return (
                                <div key={di} style={GRID}>
                                  <MarkerCell><span style={dotNodeSt} /></MarkerCell>
                                  <ValueField dim value={d.weight} unit={d.weightUnit ?? defaults.weightUnit} kind="weight"
                                    onChange={w => updDrop({ weight: w })} />
                                  <span style={xSepSt}>×</span>
                                  <ValueField dim value={d.reps} unit={d.repsUnit ?? defaults.repsUnit} kind="reps"
                                    onChange={r => updDrop({ reps: r })} />
                                  <RowMenu
                                    weightUnit={d.weightUnit ?? defaults.weightUnit} repsUnit={d.repsUnit ?? defaults.repsUnit}
                                    onWeightUnit={u => updDrop({ weightUnit: u })} onRepsUnit={u => updDrop({ repsUnit: u })}
                                    onDelete={() => removeDropEx(i, ex.id, di)}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {drops.length < MAX_DROPS && <AddDropBtn onClick={() => addDropEx(i, ex.id)} />}
                      </Fragment>
                    )
                  })}
                </div>
              </Fragment>
            ))}
          </div>

          <button onClick={addSet} style={{
            ...TT, width: '100%', height: 40, marginTop: 14, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
            background: 'rgba(var(--overlay-rgb),0.04)', border: '1px dashed rgba(var(--cs-primary-rgb),0.35)',
            fontSize: 13, fontWeight: 500, color: 'var(--cs-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}><PlusIcon size={13} /> Add {isSuper ? 'round' : 'set'}</button>
        </GlassCard>

        {/* exercise settings — visible form rows, nothing buried */}
        <GlassCard level="Low" style={{ padding: '12px 16px 14px', marginBottom: 14, overflow: 'visible' }}>
          <p style={{ ...microLblSt, margin: '0 0 4px' }}>EXERCISE SETTINGS</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <span style={{ ...TT, flex: 1, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>
              Rest between {isSuper ? 'rounds' : 'sets'}
            </span>
            <button onClick={() => setExRestOpen(!exRestOpen)} style={{
              ...TT, height: 28, padding: '0 11px', borderRadius: 'var(--radius-2xl)', border: 'none', cursor: 'pointer',
              background: 'rgba(var(--overlay-rgb),0.05)', fontSize: 12, fontWeight: 600, color: 'var(--cs-on-surface)',
            }}>⏱ {item.restSet != null ? '' : 'default · '}{restSetVal >= 60 ? `${Math.floor(restSetVal / 60)}:${String(restSetVal % 60).padStart(2, '0')}` : `${restSetVal}s`}</button>
            {exRestOpen && (
              <RestPickerPopover align="right" value={restSetVal} onChange={applyAllRest} onClose={() => setExRestOpen(false)} />
            )}
          </div>
          <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)' }} />
          <div style={{ padding: '10px 0 2px' }}>
            <NoteRow value={item.note ?? ''} icon={<NoteIcon />}
              placeholder="Exercise note…"
              onChange={t => onChange({ ...item, note: t })}
              onClear={() => { const { note: _n, ...rest } = item; onChange(rest) }} />
          </div>
        </GlassCard>

      </div>
    </div>
  )
}
