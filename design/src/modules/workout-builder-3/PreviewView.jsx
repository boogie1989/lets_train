// Screen 1 of Workout Builder 3 — the workout PREVIEW. Clean read-only cards
// (tap one → the full-screen exercise editor): header + a 3-row set clamp,
// no note / rest chrome. Drag reorder = long-press anywhere on a card.
// Compact defaults row → bottom sheet, volume-by-muscle chips, FAB menu.
import { useState, useRef, Fragment } from 'react'
import NavBar from '../../components/NavBar.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import DropdownMenu from '../../components/DropdownMenu.jsx'
import FabMenu from '../../components/FabMenu.jsx'
import {
  TT, iconBtnSt, ALL_EXERCISES, calcStats, muscleVolume, fmtRest,
  ChevLeftIcon, ChevRightSmIcon, CheckIcon, PlusIcon, SupersetIcon, ClockIcon,
  Thumb, buildSetRows, RestDivider, RestPickerPopover, kebabTriggerSt,
  WEIGHT_UNITS, REPS_UNITS,
} from './shared.jsx'

const MUSCLE_CH = {
  Legs: '--cat-blue-rgb', Back: '--cat-violet-rgb', Chest: '--cat-pink-rgb',
  Arms: '--cat-cyan-rgb', Core: '--cs-tertiary-rgb', Shoulders: '--cat-amber-rgb',
}

// defaults summary row — one compact line; tap opens the bottom sheet
function DefaultsRow({ defaults, onOpen }) {
  return (
    <GlassCard level="Low" style={{ marginBottom: 14 }}>
      <button onClick={onOpen} style={{
        ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>Defaults</span>
        <span style={{ ...TT, marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--cs-on-surface)' }}>
          {defaults.weightUnit} · {defaults.repsUnit} · ⏱ {fmtRest(defaults.restSet)} / {fmtRest(defaults.restGap)}
        </span>
        <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}><ChevRightSmIcon /></span>
      </button>
    </GlassCard>
  )
}

// bottom sheet with the four default settings (chip rows, taps write live)
function DefaultsSheet({ defaults, setDefaults, onClose }) {
  const upd = patch => setDefaults(d => ({ ...d, ...patch }))
  const [restKey, setRestKey] = useState(null) // 'rs' | 'rg'
  const lblSt = { ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }
  const chipSt = on => ({
    ...TT, height: 30, padding: '0 12px', borderRadius: 'var(--radius-2xl)', border: 'none', cursor: 'pointer',
    background: on ? 'rgba(var(--cs-primary-rgb),0.16)' : 'rgba(var(--overlay-rgb),0.05)',
    fontSize: 12, fontWeight: on ? 600 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface)',
    boxShadow: on ? 'inset 0 0 0 1px rgba(var(--cs-primary-rgb),0.30)' : 'none',
  })
  const restRow = (key, label, value, write) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...TT, flex: 1, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{label}</span>
      <button onClick={() => setRestKey(restKey === key ? null : key)} style={chipSt(restKey === key)}>{fmtRest(value)}</button>
      {restKey === key && (
        <RestPickerPopover align="right" value={value} onChange={write} onClose={() => setRestKey(null)} />
      )}
    </div>
  )
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(var(--cs-shadow-rgb),0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        display: 'flex', flexDirection: 'column', gap: 14, padding: '10px 16px 28px',
        background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: '18px 18px 0 0',
        boxShadow: '0 -8px 32px rgba(var(--cs-shadow-rgb),0.55)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} />
        </div>
        <span style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)' }}>Workout defaults</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={lblSt}>LOAD UNIT</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {WEIGHT_UNITS.map(u => (
              <button key={u} onClick={() => upd({ weightUnit: u })} style={chipSt(defaults.weightUnit === u)}>{u}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={lblSt}>REPS UNIT</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {REPS_UNITS.map(u => (
              <button key={u} onClick={() => upd({ repsUnit: u })} style={chipSt(defaults.repsUnit === u)}>{u}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)' }} />
        {restRow('rs', 'Rest between sets', defaults.restSet, v => upd({ restSet: v }))}
        {restRow('rg', 'Rest between exercises', defaults.restGap, v => upd({ restGap: v }))}
      </div>
    </>
  )
}

// read-only preview card — tap opens the editor; long-press drags; kebab = item
// ops. Deliberately quiet: header + a 3-row set clamp, no note (it lives in the
// editor).
const SET_CLAMP = 3

// set rows for the preview card — each set in its own ~half-width bordered
// container; the rest-after value floats at the RIGHT, vertically centered on
// the boundary between two containers (absolute — adds no vertical space),
// linked to the containers' edge by a hairline
const ROW_GAP_SETS = 6
const ROW_W_SETS = '60%'

function PreviewSets({ item, defaults, limit }) {
  const rows = buildSetRows(item, defaults)
  const shown = limit ? rows.slice(0, limit) : rows
  const hidden = rows.length - shown.length
  const gapRest = i => fmtRest(item.sets[i]?.restAfter ?? item.restSet ?? defaults.restSet)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP_SETS }}>
      {shown.map((r, i) => (
        <div key={r.key} style={{ position: 'relative' }}>
          <div style={{
            width: ROW_W_SETS, boxSizing: 'border-box',
            display: 'flex', alignItems: r.lines ? 'flex-start' : 'center', gap: 8, padding: '6px 10px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(var(--overlay-rgb),0.03)', border: '1px solid rgba(var(--overlay-rgb),0.08)',
          }}>
            <span style={{ ...TT, width: 16, lineHeight: '16px', textAlign: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, color: r.ch ? `rgba(var(${r.ch}),0.75)` : 'var(--cs-on-surface-variant)', opacity: r.ch ? 1 : 0.55 }}>{r.n}</span>
            {r.lines ? (
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {r.lines.map((l, li) => (
                  <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...TT, flex: 1, minWidth: 0, fontSize: 12, lineHeight: '16px', color: 'var(--cs-on-surface)', opacity: 0.82, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.text}</span>
                    {l.extra && <span style={{ ...TT, fontSize: 10, color: 'var(--cs-primary)', opacity: 0.7, flexShrink: 0 }}>{l.extra}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <span style={{ ...TT, flex: 1, minWidth: 0, fontSize: 12, lineHeight: '16px', color: 'var(--cs-on-surface)', opacity: 0.82, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.text}</span>
                {r.extra && <span style={{ ...TT, fontSize: 10, color: 'var(--cs-primary)', opacity: 0.7, flexShrink: 0 }}>{r.extra}</span>}
              </>
            )}
          </div>
          {i < shown.length - 1 && (
            <div style={{
              position: 'absolute', left: ROW_W_SETS, right: 0, bottom: -(ROW_GAP_SETS / 2), transform: 'translateY(50%)',
              display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 8,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.07)' }} />
              <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.35 }}><ClockIcon size={9} /></span>
              <span style={{ ...TT, fontSize: 10, fontWeight: 600, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{gapRest(i)}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.07)' }} />
            </div>
          )}
        </div>
      ))}
      {hidden > 0 && (
        <div style={{ padding: '2px 10px 0' }}>
          <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>+{hidden} more…</span>
        </div>
      )}
    </div>
  )
}

function PreviewCard({ item, defaults, onEdit, onDelete, onDuplicate }) {
  const isSuper = item.type === 'superset'
  const exercises = isSuper
    ? item.exerciseIds.map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean)
    : [ALL_EXERCISES.find(e => e.id === item.exerciseId)].filter(Boolean)
  const [menuOpen, setMenuOpen] = useState(false)

  const kebab = (
    <span onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} style={{ display: 'flex', flexShrink: 0 }}>
      <DropdownMenu onOpenChange={setMenuOpen}
        items={[
          { label: 'Edit sets', onClick: onEdit },
          { label: 'Duplicate', onClick: onDuplicate },
          { label: 'Delete', danger: true, onClick: onDelete },
        ]}
        triggerStyle={kebabTriggerSt(menuOpen)} />
    </span>
  )

  if (isSuper) {
    return (
      <div onClick={onEdit} style={{
        borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--cs-primary-rgb),0.05)',
        border: '1px solid rgba(var(--cs-primary-rgb),0.18)', overflow: menuOpen ? 'visible' : 'hidden',
        position: 'relative', zIndex: menuOpen ? 30 : 'auto', boxShadow: 'var(--shadow-card)', cursor: 'pointer',
      }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--cs-primary)', borderRadius: 'var(--radius-2xl) 0 0 var(--radius-2xl)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 0 14px' }}>
          <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--cs-primary)', opacity: 0.80, flex: 1 }}>
            SUPERSET · {item.sets.length} rounds
          </span>
          {kebab}
        </div>
        {exercises.map(ex => (
          <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px 2px' }}>
            <Thumb muscle={ex.muscle} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{ex.name}</div>
              <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.70 }}>{ex.muscle} · {ex.equipment}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 14px 12px' }}>
          <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)', marginBottom: 8 }} />
          <PreviewSets item={item} defaults={defaults} limit={SET_CLAMP} />
        </div>
      </div>
    )
  }

  const ex = exercises[0]
  if (!ex) return null
  return (
    <GlassCard level="Low" style={{ display: 'flex', overflow: menuOpen ? 'visible' : 'hidden', position: 'relative', zIndex: menuOpen ? 30 : 'auto', cursor: 'pointer' }}>
      <div style={{ width: 4, flexShrink: 0, background: 'var(--cs-primary)', opacity: 0.55, borderRadius: 'var(--radius-2xl) 0 0 var(--radius-2xl)' }} />
      <div onClick={onEdit} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 0 14px' }}>
          <Thumb muscle={ex.muscle} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
            <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.70, marginTop: 2 }}>{ex.muscle} · {ex.equipment}</div>
          </div>
          <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.65, flexShrink: 0 }}>{item.sets.length} sets</span>
          {kebab}
        </div>
        <div style={{ padding: '10px 14px 12px' }}>
          <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', marginBottom: 8 }} />
          <PreviewSets item={item} defaults={defaults} limit={SET_CLAMP} />
        </div>
      </div>
    </GlassCard>
  )
}

export default function PreviewView({
  workoutName, setWorkoutName, description, setDescription,
  items, restGaps, setRestGap, defaults, setDefaults,
  onEditItem, deleteItem, duplicateItem, moveItem,
}) {
  const { exCount, setCount, estMin } = calcStats(items, restGaps, defaults)
  const volume = muscleVolume(items)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  // drag reorder — long-press anywhere on a card (no grip: cards are read-only,
  // a short tap opens the editor). Movement before the 300ms threshold cancels
  // the press (scroll/tap); rest dividers hide while dragging, heights are
  // measured lazily on first move.
  const ROW_GAP = 12
  const LONG_PRESS_MS = 300
  const [dragIdx, setDragIdx] = useState(null)
  const [dragY, setDragY] = useState(0)
  const rowRefs = useRef([])
  const dragState = useRef(null)
  const press = useRef(null)
  const justDragged = useRef(false)

  function pressDown(e, i) {
    if (e.button !== undefined && e.button !== 0) return
    const el = rowRefs.current[i]
    const id = e.pointerId
    press.current = {
      x: e.clientX, y: e.clientY, lastY: e.clientY,
      timer: setTimeout(() => {
        if (!press.current) return
        el?.setPointerCapture?.(id)
        dragState.current = { startY: press.current.lastY, idx: i, heights: null }
        justDragged.current = true
        setDragIdx(i); setDragY(0)
      }, LONG_PRESS_MS),
    }
  }
  function pressMove(e) {
    const p = press.current
    if (!p) return
    if (dragState.current) { dragMove(e); return }
    p.lastY = e.clientY
    if (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8) {
      clearTimeout(p.timer)
      press.current = null
    }
  }
  function pressUp() {
    if (press.current) { clearTimeout(press.current.timer); press.current = null }
    if (dragState.current) dragEnd()
    // the click event lands right after pointerup — let onClickCapture eat it
    setTimeout(() => { justDragged.current = false }, 50)
  }
  function dragMove(e) {
    const s = dragState.current
    if (!s) return
    if (!s.heights) s.heights = rowRefs.current.map(el => el?.offsetHeight ?? 0)
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

  const dragging = dragIdx !== null

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <NavBar>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px', gap: 8 }}>
          <button style={iconBtnSt}><ChevLeftIcon /></button>
          <div style={{ flex: 1 }} />
          <button style={{ ...iconBtnSt, background: 'var(--cs-primary)', border: 'none', color: 'var(--cs-on-primary)' }}><CheckIcon /></button>
        </div>
      </NavBar>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 90px' }}>
        {/* details — name + description */}
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
        </GlassCard>

        <DefaultsRow defaults={defaults} onOpen={() => setSheetOpen(true)} />

        {/* stats + volume by muscle */}
        <div style={{ margin: '0 2px 14px' }}>
          <p style={{ ...TT, fontSize: 'var(--tt-body-small-size)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)', opacity: 0.60, margin: 0 }}>
            {exCount} {exCount === 1 ? 'exercise' : 'exercises'} · {setCount} sets · ~{estMin} min
          </p>
          {volume.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
              {volume.map(([muscle, n]) => {
                const ch = MUSCLE_CH[muscle] ?? '--cs-primary-rgb'
                return (
                  <span key={muscle} style={{
                    ...TT, display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px',
                    borderRadius: 'var(--radius-2xl)', fontSize: 11,
                    background: `rgba(var(${ch}),0.10)`, border: `1px solid rgba(var(${ch}),0.22)`,
                    color: 'var(--cs-on-surface)',
                  }}>
                    <span style={{ opacity: 0.75 }}>{muscle}</span>
                    <span style={{ fontWeight: 700, color: `rgba(var(${ch}),0.9)` }}>{n}</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* read-only cards — tap to edit, long-press to drag */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: dragging ? ROW_GAP : 16 }}>
          {items.map((item, i) => (
            <Fragment key={item.id}>
              <div ref={el => { rowRefs.current[i] = el }}
                onPointerDown={e => pressDown(e, i)}
                onPointerMove={pressMove}
                onPointerUp={pressUp}
                onPointerCancel={pressUp}
                onClickCapture={e => {
                  if (justDragged.current) { e.preventDefault(); e.stopPropagation(); justDragged.current = false }
                }}
                style={{
                  position: 'relative', touchAction: 'pan-y',
                  transform: dragIdx === i ? `translateY(${dragY}px)` : 'none',
                  zIndex: dragIdx === i ? 20 : 'auto',
                  filter: dragIdx === i ? 'brightness(1.15)' : 'none',
                  cursor: dragIdx === i ? 'grabbing' : undefined,
                }}>
                <PreviewCard item={item} defaults={defaults}
                  onEdit={() => onEditItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onDuplicate={() => duplicateItem(item.id)} />
              </div>
              {!dragging && i < items.length - 1 && (
                <RestDivider value={restGaps[i] ?? defaults.restGap} onChange={v => setRestGap(i, v)} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* footer — FAB menu (page actions + save) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'linear-gradient(0deg, rgba(var(--cs-surface-rgb),0.92) 55%, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FabMenu open={fabOpen} setOpen={setFabOpen} actions={[
            { label: 'Add exercise', icon: <PlusIcon size={15} />, onClick: () => { /* stub — exercise picker */ } },
            { label: 'Add superset', icon: <SupersetIcon />, onClick: () => { /* stub — superset picker */ } },
            { label: 'Save workout', icon: <CheckIcon />, primary: true, dividerAbove: true, onClick: () => { /* stub — save */ } },
          ]} />
        </div>
      </div>

      {sheetOpen && <DefaultsSheet defaults={defaults} setDefaults={setDefaults} onClose={() => setSheetOpen(false)} />}
    </div>
  )
}
