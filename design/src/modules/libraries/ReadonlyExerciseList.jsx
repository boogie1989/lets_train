// Read-only exercise cards for the Workout preview — mirror the Workout Builder
// cards (collapsed summary → expand to sets / supersets / drop sets) but with no
// editing. Sample set content is generated from the exercises library data.
import { useState } from 'react'
import SurfaceContainer from '../../components/SurfaceContainer.jsx'
import exercisesConfig from './configs/exercises.jsx'
import { Thumb, THUMB_COLORS } from './shared.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const EX = exercisesConfig.data
const byId = id => EX.find(e => e.id === id)

// ── sample plan content for a workout (deterministic, for the mock) ──────────
export function buildSampleContent(workout) {
  const n = Math.min(workout.exercises || 4, EX.length)
  const picks = EX.slice(0, n)
  const base = ex => (ex.equipment === 'Bodyweight' ? 0 : 20 + ex.id * 6)
  const soloSets = (ex, withDrop) => {
    const b = base(ex)
    const sets = [{ weight: b, reps: 10 }, { weight: b, reps: 10 }, { weight: Math.max(0, b - 5), reps: 8 }]
    if (withDrop) sets[2] = { ...sets[2], ds: [{ weight: Math.max(0, b - 15), reps: 12 }] }
    return sets
  }
  const items = []
  let i = 0
  if (picks[i]) { items.push({ type: 'solo', exerciseId: picks[i].id, sets: soloSets(picks[i], true) }); i++ }
  if (picks[i] && picks[i + 1]) {
    const a = picks[i], b = picks[i + 1]
    items.push({ type: 'superset', exerciseIds: [a.id, b.id], sets: [
      { [a.id]: { weight: base(a), reps: 12 }, [b.id]: { weight: base(b), reps: 12 } },
      { [a.id]: { weight: base(a), reps: 10 }, [b.id]: { weight: base(b), reps: 10 } },
      { [a.id]: { weight: base(a), reps: 10 }, [b.id]: { weight: base(b), reps: 12 } },
    ] })
    i += 2
  }
  while (picks[i]) { items.push({ type: 'solo', exerciseId: picks[i].id, sets: soloSets(picks[i], false) }); i++ }
  return items
}

const wLabel = w => (w > 0 ? `${w} kg` : 'BW')
function soloSummary(sets) {
  const weights = sets.map(s => s.weight).filter(w => w > 0)
  const reps = sets.map(s => s.reps)
  const wStr = weights.length === 0 ? 'Bodyweight'
    : Math.min(...weights) === Math.max(...weights) ? `${weights[0]} kg`
      : `${Math.min(...weights)}–${Math.max(...weights)} kg`
  const minR = Math.min(...reps), maxR = Math.max(...reps)
  return `${wStr} · ${minR === maxR ? maxR : `${minR}–${maxR}`} reps`
}

function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function Expandable({ open, children }) {
  return <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.28s ease' }}><div style={{ overflow: 'hidden' }}>{children}</div></div>
}

const setLabelSt = { ...TT, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }
const valueSt = { ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }

function SetRow({ idx, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={setLabelSt}>{label ?? `Set ${idx + 1}`}</span>
      <span style={valueSt}>{value}</span>
    </div>
  )
}

function SoloCard({ item }) {
  const [open, setOpen] = useState(false)
  const ex = byId(item.exerciseId)
  if (!ex) return null
  return (
    <SurfaceContainer level="Low" style={{ display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 4, flexShrink: 0, background: 'var(--cs-primary)', opacity: 0.55 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <Thumb kind="exercise" color={THUMB_COLORS[ex.muscle]} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
            <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 2 }}>{open ? `${ex.muscle} · ${ex.equipment}` : soloSummary(item.sets)}</div>
          </div>
          <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, flexShrink: 0 }}>{item.sets.length} sets</span>
          <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.45, display: 'flex', flexShrink: 0 }}><Chevron open={open} /></span>
        </button>
        <Expandable open={open}>
          <div style={{ padding: '2px 14px 12px' }}>
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '0 0 4px' }} />
            {item.sets.map((s, i) => (
              <div key={i}>
                <SetRow idx={i} value={`${wLabel(s.weight)} × ${s.reps}`} />
                {s.ds?.map((d, di) => (
                  <div key={di} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 6px 12px', marginLeft: 4, borderLeft: '2px solid rgba(var(--cs-primary-rgb),0.30)' }}>
                    <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--cs-primary)', opacity: 0.7 }}>DROP</span>
                    <span style={{ ...valueSt, opacity: 0.8 }}>{wLabel(d.weight)} × {d.reps}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Expandable>
      </div>
    </SurfaceContainer>
  )
}

function SupersetCard({ item }) {
  const [open, setOpen] = useState(false)
  const exs = item.exerciseIds.map(byId).filter(Boolean)
  return (
    <div style={{ borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--cs-primary-rgb),0.05)', border: '1px solid rgba(var(--cs-primary-rgb),0.18)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--cs-primary)' }} />
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 6px 14px' }}>
          <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--cs-primary)', opacity: 0.8, flex: 1 }}>SUPERSET · {item.sets.length} sets each</span>
          <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.45, display: 'flex' }}><Chevron open={open} /></span>
        </div>
        {exs.map((ex, i) => (
          <div key={ex.id}>
            {i > 0 && <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)', marginLeft: 14 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
              <Thumb kind="exercise" color={THUMB_COLORS[ex.muscle]} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{ex.name}</div>
                <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{ex.muscle} · {ex.equipment}</div>
              </div>
            </div>
          </div>
        ))}
      </button>
      <Expandable open={open}>
        <div style={{ padding: '6px 14px 14px' }}>
          <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.12)', margin: '0 0 8px' }} />
          {item.sets.map((set, i) => (
            <div key={i} style={{ padding: '6px 0' }}>
              <span style={setLabelSt}>Set {i + 1}</span>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {exs.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ ...TT, fontSize: 12, color: 'var(--cs-primary)', opacity: 0.7 }}>{ex.name}</span>
                    <span style={{ ...valueSt, opacity: 0.9 }}>{wLabel((set[ex.id] || {}).weight ?? 0)} × {(set[ex.id] || {}).reps ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Expandable>
    </div>
  )
}

export default function ReadonlyExerciseList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => item.type === 'superset'
        ? <SupersetCard key={i} item={item} />
        : <SoloCard key={i} item={item} />)}
    </div>
  )
}
