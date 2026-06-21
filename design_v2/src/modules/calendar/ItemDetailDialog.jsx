import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PLAN } from './calendarModel.js'
import { MonthGrid } from './CalendarWidgets.jsx'

// Item detail dialog — opened by tapping a TaskItem card. Container transform
// per the FabMenu recipe: ONE panel animates height/radius/background/shadow
// (0.32s standard ease) from a collapsed pill into a glass popover, the content
// sections stagger-fade in (0.1s + 40ms·i), scrim fades behind. Closing
// reverses the morph.
//
// Workout detail: exercise list, per-session result (completed), note editor.
// There is NO complete action — workout completion comes from the Workout
// Runner; planned workouts say so. Meal detail: kcal + macros, Mark eaten.
// Shared actions: Reschedule (inline mini month-grid picker) and Delete.
//
// item: live item from the model (null = closed; the last item is kept for the
// exit animation). Action callbacks close the dialog from the parent.

const TT = { fontFamily: 'var(--tt-font-family)' }
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const lbl = { ...TT, fontSize: 'var(--tt-title-small-size)', fontWeight: 'var(--tt-title-small-weight)', letterSpacing: 'var(--tt-title-small-tracking)', color: 'var(--cs-on-surface)' }
const val = { ...TT, fontVariantNumeric: 'tabular-nums', fontSize: 'var(--tt-body-small-size)', fontWeight: 'var(--tt-body-small-weight)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)' }

export default function ItemDetailDialog({ item, tense, month, dayN, onClose, onMove, onDelete, onSetEaten, onSetNote }) {
  const [shown, setShown] = useState(false)
  const [kept, setKept] = useState(null)      // snapshot rendered during the exit morph
  const [picking, setPicking] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const [height, setHeight] = useState(54)
  const contentRef = useRef(null)

  useEffect(() => {
    if (item) {
      setKept(item)
      setPicking(false)
      setEditingNote(false)
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    const t = setTimeout(() => setKept(null), 360)
    return () => clearTimeout(t)
  }, [item])

  const it = item ?? kept
  // content height drives the morph — re-measured every render so inline
  // expansions (reschedule grid, note editor) animate through the same transition
  useLayoutEffect(() => {
    if (!contentRef.current) return
    const h = contentRef.current.offsetHeight
    if (h !== height) setHeight(h)
  })

  if (!it) return null
  const completed = it.status === 'Completed'
  const missed = !completed && tense === 'past'
  const isWorkout = it.kind !== 'meal'
  const accent = completed ? 'var(--cs-status-completed)' : 'var(--cs-status-planned)'
  const status = completed
    ? { text: 'Done', color: 'var(--cs-tertiary)' }
    : missed
      ? { text: 'Missed', color: 'rgba(var(--cs-error-rgb),0.75)' }
      : { text: 'Planned', color: 'var(--cs-on-surface-variant)' }

  // stagger helper — FabMenu item recipe applied to content sections
  let si = 0
  const stagger = () => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(6px)',
    transition: `opacity 0.2s ease ${shown ? 0.1 + si * 0.04 : 0}s, transform 0.2s ease ${shown ? 0.1 + si++ * 0.04 : 0}s`,
  })

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 54,
        background: 'rgba(var(--cs-shadow-rgb),0.50)',
        opacity: shown ? 1 : 0, pointerEvents: item ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }} />

      {/* morphing panel — height follows measured content, capped to the screen;
          when capped, the inner scroller takes over */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 104, zIndex: 55,
        height: shown ? Math.min(height, 716) : 54,
        borderRadius: shown ? 'var(--radius-2xl)' : 'var(--radius-xl)',
        // v2: opaque surfaces, no backdrop blur. The size/radius/colour/elevation
        // morph is pure layout/paint → maps to Material OpenContainer.
        background: shown ? 'var(--surface-3)' : 'var(--surface-2)',
        border: '1px solid var(--border-default)',
        boxShadow: shown ? 'var(--elev-2)' : 'var(--elev-1)',
        overflow: 'hidden',
        transition: `height 0.32s ${EASE}, border-radius 0.32s ${EASE}, background 0.32s ${EASE}, box-shadow 0.32s ${EASE}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* status accent strip — same language as the card's left strip */}
          <div style={{ height: 5, background: accent, flexShrink: 0 }} />

          <div style={{ padding: '16px 20px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* header: title + meta / close */}
            <div style={{ ...stagger(), display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ ...TT, fontSize: 17, fontWeight: 500, lineHeight: '24px', color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.title}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Meta icon={<ClockGlyph />}>{it.time}</Meta>
                  <MetaDot />
                  <Meta icon={isWorkout ? <ActivityGlyph /> : <MealGlyph />}>
                    {isWorkout ? `${it.exerciseCount} exercises` : `${it.kcal} kcal`}
                  </Meta>
                  {it.fromPlan && (
                    <>
                      <MetaDot />
                      <Meta icon={<PlanGlyph />} color="var(--cs-primary)">{PLAN.name}</Meta>
                    </>
                  )}
                  <span style={{ ...TT, marginLeft: 'auto', fontSize: 10, fontWeight: 500, color: status.color }}>{status.text}</span>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" style={{
                width: 28, height: 28, flexShrink: 0, marginTop: -2, marginRight: -6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: 'var(--cs-on-surface-variant)', opacity: 0.6,
              }}><CrossGlyph /></button>
            </div>

            {isWorkout ? (
              <>
                {/* exercise list */}
                <div style={{ ...stagger(), display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={lbl}>Exercises</span>
                  <div style={{ maxHeight: 176, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(it.exercises ?? []).map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ ...TT, flex: 1, fontSize: 13, fontWeight: 400, color: 'var(--cs-on-surface)', opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
                        <span style={{ ...val, fontSize: 12 }}>{ex.sets} × {ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* per-session result (completed) / runner note (planned) */}
                {completed && it.result ? (
                  <div style={{ ...stagger(), display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={lbl}>Session result</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <Stat label="Tonnage" value={`${it.result.tonnage.toLocaleString()} kg`} />
                      <Stat label="Session RPE" value={it.result.sessionRpe} />
                      <Stat label="Duration" value={`${it.result.minutes} min`} />
                      <Stat label="Sets measured" value={`${it.result.setsMeasured} of ${it.result.hardSets}`} />
                    </div>
                  </div>
                ) : !missed && (
                  <span style={{ ...stagger(), ...val, fontSize: 11, opacity: 0.55 }}>
                    Completes from the Workout Runner
                  </span>
                )}

                {/* note — quiet pro field, edited in place */}
                <div style={stagger()}>
                  {editingNote ? (
                    <NoteEditor initial={it.note ?? ''} onSave={text => { setEditingNote(false); onSetNote(text.trim()) }} />
                  ) : it.note ? (
                    <button onClick={() => setEditingNote(true)} style={{ ...TT, display: 'flex', flexDirection: 'column', gap: 4, padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <span style={{ ...val, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.55 }}>Note</span>
                      <span style={{ ...val, fontSize: 12.5, lineHeight: '18px', color: 'var(--cs-on-surface)', opacity: 0.75 }}>{it.note}</span>
                    </button>
                  ) : (
                    <button onClick={() => setEditingNote(true)} style={{ ...TT, ...val, fontSize: 12, padding: 0, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                      Add note…
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* meal body — kcal + macro legend (same language as DaySummary) */
              <div style={{ ...stagger(), display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ ...TT, fontVariantNumeric: 'tabular-nums', fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                  {it.kcal} <span style={{ ...val, fontSize: 13 }}>kcal</span>
                </span>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[['P', it.p, '--cat-blue-rgb'], ['C', it.c, '--cat-amber-rgb'], ['F', it.f, '--cat-pink-rgb']].map(([k, g, ch]) => (
                    <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: `rgba(var(${ch}),1)` }} />
                      <span style={val}><span style={{ fontWeight: 500, color: 'var(--cs-on-surface)' }}>{k} {g}</span> g</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* actions — FabMenu item recipe */}
          <div style={{ ...stagger(), padding: '0 10px 10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.07)', margin: '0 8px 5px' }} />
            {!isWorkout && (
              <Action primary icon={<CheckGlyph />} onClick={() => onSetEaten(!completed)}>
                {completed ? 'Mark not eaten' : 'Mark eaten'}
              </Action>
            )}
            <Action icon={<MoveGlyph />} active={picking} onClick={() => setPicking(p => !p)}>Reschedule</Action>
            {picking && (
              <div style={{ padding: '2px 8px 8px' }}>
                <MonthGrid month={month} selected={dayN} onSelect={n => onMove(n)} />
              </div>
            )}
            <Action icon={<TrashGlyph />} danger onClick={onDelete}>Delete</Action>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

function NoteEditor({ initial, onSave }) {
  const [text, setText] = useState(initial)
  return (
    <textarea
      autoFocus
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => onSave(text)}
      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave(text) } }}
      placeholder="Session note…"
      rows={2}
      style={{
        ...TT, width: '100%', resize: 'none', boxSizing: 'border-box',
        fontSize: 12.5, lineHeight: '18px', color: 'var(--cs-on-surface)',
        background: 'rgba(var(--overlay-rgb),0.04)',
        border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
        borderRadius: 'var(--radius-lg)', padding: '8px 10px', outline: 'none',
      }}
    />
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...TT, fontVariantNumeric: 'tabular-nums', fontSize: 15, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span>
      <span style={{ ...val, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>{label}</span>
    </div>
  )
}

function Action({ icon, children, onClick, primary, danger, active }) {
  const color = primary ? 'var(--cs-primary)' : danger ? 'rgba(var(--cs-error-rgb),0.85)' : 'var(--cs-on-surface)'
  return (
    <button onClick={onClick} style={{
      ...TT, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
      background: active ? 'rgba(var(--overlay-rgb),0.05)' : 'none',
      border: 'none', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
      fontSize: 15, fontWeight: primary ? 600 : 500, color,
      textAlign: 'left', whiteSpace: 'nowrap',
    }}>
      <span style={{ display: 'flex', color: primary || danger ? color : 'var(--cs-on-surface-variant)', opacity: primary || danger ? 1 : 0.7 }}>{icon}</span>
      {children}
    </button>
  )
}

function Meta({ icon, children, color }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      <span style={{ display: 'flex', color: color ?? 'var(--cs-on-surface-variant)', opacity: color ? 0.85 : 1 }}>{icon}</span>
      <span style={{ ...TT, fontSize: 12.5, fontWeight: color ? 500 : 400, color: color ?? 'var(--cs-on-surface-variant)', opacity: color ? 0.85 : 1 }}>{children}</span>
    </span>
  )
}

function MetaDot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface)', opacity: 0.4, flexShrink: 0 }} />
}

const glyph = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
function ClockGlyph() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...glyph}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}
function ActivityGlyph() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...glyph}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}
function MealGlyph() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...glyph}><path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" /><path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" /></svg>
}
function PlanGlyph() {
  return <svg width="11" height="11" viewBox="0 0 24 24" {...glyph}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
}
function CrossGlyph() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
}
function CheckGlyph() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><circle cx="12" cy="12" r="9" /><polyline points="8.5 12.2 11 14.7 15.5 9.8" /></svg>
}
function MoveGlyph() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><polyline points="10.5 13 13.5 16 10.5 19" /></svg>
}
function TrashGlyph() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...glyph}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
}
