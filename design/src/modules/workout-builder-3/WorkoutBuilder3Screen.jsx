// Workout Builder 3 — two-level architecture. The container owns the workout
// state and slides between the PREVIEW (screen 1) and the full-screen
// EXERCISE EDITOR (screen 2): translateX over a 200%-wide track, 0.32s.
import { useState, useRef } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import PreviewView from './PreviewView.jsx'
import ExerciseEditView from './ExerciseEditView.jsx'
import { TT, ALL_EXERCISES, DEMO_ITEMS, DEMO_GAPS } from './shared.jsx'

export default function WorkoutBuilder3Screen({ initialStep = 'preview' }) {
  const seedEditId = initialStep === 'edit-solo' ? 'a'
    : initialStep === 'edit-superset' ? 'b'
    : null

  const [workoutName, setWorkoutName] = useState('Leg Day')
  const [description, setDescription] = useState('Heavy lower-body day — squats, hinges, and accessory work.')
  const [items, setItems] = useState(DEMO_ITEMS)
  const [restGaps, setRestGaps] = useState(() => DEMO_GAPS.slice(0, Math.max(0, DEMO_ITEMS.length - 1)))
  const [defaults, setDefaults] = useState({ weightUnit: 'kg', repsUnit: 'reps', restSet: 90, restGap: 120 })
  const [oneRMs, setOneRMs] = useState(() => Object.fromEntries(ALL_EXERCISES.filter(e => e.oneRM).map(e => [e.id, e.oneRM])))
  const setOneRM = (id, v) => setOneRMs(m => ({ ...m, [id]: v }))

  // navigation — editId persists through the slide-out so the editor pane
  // keeps its content while animating back to the preview
  const [mode, setMode] = useState(seedEditId ? 'edit' : 'preview')
  const [editId, setEditId] = useState(seedEditId)
  const openEditor = id => { setEditId(id); setMode('edit') }
  const closeEditor = () => setMode('preview')

  function updateItem(updated) { setItems(p => p.map(it => it.id === updated.id ? updated : it)) }
  function moveItem(from, to) {
    setItems(p => { const n = [...p]; const [it] = n.splice(from, 1); n.splice(to, 0, it); return n })
  }

  // delete is undoable — same 4s buffer + snackbar contract as v1/v2
  const [lastDeleted, setLastDeleted] = useState(null) // { item, index, gap }
  const undoTimer = useRef(null)
  const copySeq = useRef(1)
  function deleteItem(id) {
    const i = items.findIndex(it => it.id === id)
    if (i < 0) return
    const gap = restGaps[Math.min(i, restGaps.length - 1)]
    setRestGaps(g => g.filter((_, j) => j !== Math.min(i, g.length - 1)))
    setItems(p => p.filter(it => it.id !== id))
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
    setRestGaps(g => { const n = [...g]; n.splice(i, 0, g[i] ?? defaults.restGap); return n })
  }

  const editIndex = items.findIndex(it => it.id === editId)
  const editItem = editIndex >= 0 ? items[editIndex] : null

  return (
    <PhoneFrame smokeVariant="shader">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '200%', display: 'flex',
          transform: mode === 'preview' ? 'translateX(0)' : 'translateX(-50%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ width: '50%', position: 'relative', height: '100%' }}>
            <PreviewView
              workoutName={workoutName} setWorkoutName={setWorkoutName}
              description={description} setDescription={setDescription}
              items={items} restGaps={restGaps}
              setRestGap={(i, v) => setRestGaps(g => { const n = [...g]; n[i] = v; return n })}
              defaults={defaults} setDefaults={setDefaults}
              onEditItem={openEditor}
              deleteItem={deleteItem} duplicateItem={duplicateItem} moveItem={moveItem}
            />
          </div>
          <div style={{ width: '50%', position: 'relative', height: '100%' }}>
            {editItem && (
              <ExerciseEditView key={editId}
                item={editItem} index={editIndex} total={items.length}
                defaults={defaults} oneRMs={oneRMs} setOneRM={setOneRM}
                onBack={closeEditor}
                onPrev={() => editIndex > 0 && setEditId(items[editIndex - 1].id)}
                onNext={() => editIndex < items.length - 1 && setEditId(items[editIndex + 1].id)}
                onChange={updateItem}
                onDelete={() => { deleteItem(editItem.id); closeEditor() }}
                onDuplicate={() => duplicateItem(editItem.id)}
              />
            )}
          </div>
        </div>

        {/* undo snackbar — overlays both views */}
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
      </div>
    </PhoneFrame>
  )
}
