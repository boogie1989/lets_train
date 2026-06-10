import { useState, useMemo } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import SearchInput from '../../components/SearchInput.jsx'
import GlassCard from '../../components/GlassCard.jsx'


const EXERCISES = [
  { id: 1, name: 'Barbell Back Squat',  muscle: 'Legs',      equipment: 'Barbell',    difficulty: 'Hard',   type: 'Strength',    force: 'Push', mechanic: 'Compound'  },
  { id: 2, name: 'Romanian Deadlift',   muscle: 'Back',      equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',    force: 'Pull', mechanic: 'Compound'  },
  { id: 3, name: 'Bench Press',         muscle: 'Chest',     equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',    force: 'Push', mechanic: 'Compound'  },
  { id: 4, name: 'Pull-ups',            muscle: 'Back',      equipment: 'Bodyweight', difficulty: 'Hard',   type: 'Strength',    force: 'Pull', mechanic: 'Compound'  },
  { id: 5, name: 'Dumbbell Lunges',     muscle: 'Legs',      equipment: 'Dumbbell',   difficulty: 'Easy',   type: 'Strength',    force: 'Push', mechanic: 'Compound'  },
  { id: 6, name: 'Overhead Press',      muscle: 'Shoulders', equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',    force: 'Push', mechanic: 'Compound'  },
  { id: 7, name: 'Cable Rows',          muscle: 'Back',      equipment: 'Cable',      difficulty: 'Easy',   type: 'Strength',    force: 'Pull', mechanic: 'Compound'  },
  { id: 8, name: 'Box Jumps',           muscle: 'Legs',      equipment: 'Bodyweight', difficulty: 'Medium', type: 'Plyometric',  force: 'Push', mechanic: 'Compound'  },
  { id: 9, name: 'Tricep Pushdown',     muscle: 'Arms',      equipment: 'Cable',      difficulty: 'Easy',   type: 'Strength',    force: 'Push', mechanic: 'Isolation' },
  { id:10, name: 'Plank Hold',          muscle: 'Core',      equipment: 'Bodyweight', difficulty: 'Easy',   type: 'Strength',    force: 'Static','mechanic': 'Isolation'},
]

const MUSCLE_OPTS    = ['Legs', 'Back', 'Chest', 'Arms', 'Core', 'Shoulders']
const EQUIPMENT_DEFS = [
  { key: 'Bodyweight', label: 'Body'     },
  { key: 'Barbell',    label: 'Barbell'  },
  { key: 'Dumbbell',   label: 'Dumbbell' },
  { key: 'Cable',      label: 'Cable'    },
  { key: 'Bands',      label: 'Bands'    },
  { key: 'Machine',    label: 'Machine'  },
]
const TYPE_OPTS = ['Strength', 'Cardio', 'Flexibility', 'Plyometric']
const DIFFICULTY_OPTS = [
  { key: 'Easy',   dots: 1 },
  { key: 'Medium', dots: 2 },
  { key: 'Hard',   dots: 3 },
  { key: 'Expert', dots: 4 },
]
const FORCE_OPTS    = ['Push', 'Pull', 'Static']
const MECHANIC_OPTS = ['Compound', 'Isolation']

const DIFF_COLORS = { Easy: 'var(--cs-tertiary)', Medium: 'var(--cat-amber)', Hard: 'var(--cs-error)', Expert: 'var(--cat-violet)' }
const thumbTint = ch => `linear-gradient(150deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.06) 100%), var(--cs-surface-container-high)`
const THUMB_COLORS = {
  Legs: thumbTint('--cat-blue-rgb'), Back: thumbTint('--cat-violet-rgb'), Chest: thumbTint('--cat-pink-rgb'),
  Shoulders: thumbTint('--cat-amber-rgb'), Arms: thumbTint('--cat-cyan-rgb'), Core: thumbTint('--cs-tertiary-rgb'),
}

const EMPTY_FILTERS = { muscle: [], equipment: [], type: null, difficulty: null, force: [], mechanic: [] }

export default function ExerciseSearchScreen() {
  const [query,        setQuery]        = useState('')
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [filters,      setFilters]      = useState(EMPTY_FILTERS)
  const [selected,     setSelected]     = useState(new Set())
  const [editOpen,     setEditOpen]     = useState(false)
  const [items,        setItems]        = useState([])
  const [reorderMode,  setReorderMode]  = useState(false)
  const [checkedIds,   setCheckedIds]   = useState(new Set())
  const [checkedGroups,setCheckedGroups]= useState(new Set())

  const activeCount = useMemo(() =>
    filters.muscle.length + filters.equipment.length +
    (filters.type ? 1 : 0) + (filters.difficulty ? 1 : 0) +
    filters.force.length + filters.mechanic.length
  , [filters])

  const results = useMemo(() =>
    EXERCISES.filter(ex => {
      if (query && !ex.name.toLowerCase().includes(query.toLowerCase())) return false
      if (filters.muscle.length    && !filters.muscle.includes(ex.muscle))       return false
      if (filters.equipment.length && !filters.equipment.includes(ex.equipment)) return false
      if (filters.type             && ex.type !== filters.type)                   return false
      if (filters.difficulty       && ex.difficulty !== filters.difficulty)       return false
      if (filters.force.length     && !filters.force.includes(ex.force))         return false
      if (filters.mechanic.length  && !filters.mechanic.includes(ex.mechanic))   return false
      return true
    })
  , [query, filters])

  function toggleMulti(key, value) {
    setFilters(prev => {
      const cur = prev[key]
      return { ...prev, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] }
    })
  }

  function setSingle(key, value) {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const anyChecked = checkedIds.size > 0 || checkedGroups.size > 0
  const canGroup   = checkedIds.size >= 2
    && checkedGroups.size === 0
    && Array.from(checkedIds).every(id => items.some(e => e.type === 'solo' && e.id === id))

  function toggleCheckedId(id) {
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleCheckedGroup(key) {
    setCheckedGroups(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function handleDelete() {
    setItems(prev => {
      const result = []
      for (const entry of prev) {
        if (entry.type === 'solo') {
          if (!checkedIds.has(entry.id)) result.push(entry)
        } else {
          const key = entry.ids.join('-')
          const groupChecked = checkedGroups.has(key)
          const remaining = entry.ids.filter(id => !checkedIds.has(id))
          if (!groupChecked && remaining.length === entry.ids.length) {
            result.push(entry)
          } else if (remaining.length === 0) {
            // superset disappears entirely
          } else if (remaining.length === 1) {
            result.push({ type: 'solo', id: remaining[0] })
          } else if (groupChecked) {
            for (const id of remaining) result.push({ type: 'solo', id })
          } else {
            result.push({ type: 'superset', ids: remaining })
          }
        }
      }
      return result
    })
    setCheckedIds(new Set())
    setCheckedGroups(new Set())
  }

  function handleGroup() {
    const soloIds = Array.from(checkedIds).filter(id =>
      items.some(e => e.type === 'solo' && e.id === id)
    )
    if (soloIds.length < 2) return
    setItems(prev => {
      let inserted = false
      const result = []
      for (const entry of prev) {
        if (entry.type === 'solo' && soloIds.includes(entry.id)) {
          if (!inserted) { result.push({ type: 'superset', ids: soloIds }); inserted = true }
        } else {
          result.push(entry)
        }
      }
      return result
    })
    setCheckedIds(new Set())
  }

  return (
    <PhoneFrame smokeVariant="animated">

      {/* ── Search header (StatusBar lives here, shares glass bg) ── */}
      <div style={{
        background: 'var(--glass-slab)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(var(--overlay-rgb),0.05)',
        borderBottom: '1px solid rgba(var(--overlay-rgb),0.05)',
        boxShadow: '0 12px 32px rgba(var(--cs-shadow-rgb),0.60)',
        flexShrink: 0,
      }}>
        <StatusBar />

        {/* Search row: back · search input · filter button */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
          {/* Back button */}
          <button style={{
            width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0, flexShrink: 0,
            background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.40)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <BackChevron />
          </button>
          <div style={{ flex: 1 }}>
            <SearchInput
              placeholder="Search exercises..."
              value={query}
              state={query ? 'filled' : 'default'}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setSheetOpen(o => !o)}
            style={{
              width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0,
              background: sheetOpen || activeCount > 0 ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--cs-surface-container-highest)',
              border: sheetOpen || activeCount > 0 ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid var(--cs-outline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
            }}
          >
            <FilterIcon active={sheetOpen || activeCount > 0} />
            {activeCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                minWidth: 17, height: 17, borderRadius: 9,
                background: 'var(--cs-primary)', color: 'var(--cs-on-primary)',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', border: '1.5px solid var(--cs-surface)',
              }}>{activeCount}</span>
            )}
          </button>
        </div>

        {/* Muscle quick-chips */}
        <style>{`.qchips::-webkit-scrollbar{display:none}`}</style>
        <div className="qchips" style={{
          display: 'flex', gap: 6, padding: '0 16px 12px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          <button onClick={() => setFilters(p => ({ ...p, muscle: [] }))} style={chipSt(filters.muscle.length === 0)}>All</button>
          {MUSCLE_OPTS.map(m => (
            <button key={m} onClick={() => toggleMulti('muscle', m)} style={chipSt(filters.muscle.includes(m))}>{m}</button>
          ))}
        </div>
      </div>

      {/* ── Results + Selection bar (overlay) ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: `12px 16px ${selected.size > 0 ? 76 : 12}px`,
        transition: 'padding-bottom 0.22s ease',
      }}>
        {results.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
              No exercises found
            </span>
          </div>
        ) : results.map(ex => {
          const isSel = selected.has(ex.id)
          return (
            <GlassCard key={ex.id} level="Low" onClick={() => toggleSelect(ex.id)}
              style={{
                display: 'flex', overflow: 'hidden', cursor: 'pointer',
                ...(isSel && { background: 'rgba(var(--cs-primary-rgb),0.14)' }),
                transition: 'background 0.15s',
              }}
            >
              {/* accent strip */}
              <div style={{ width: 4, flexShrink: 0, background: isSel ? 'var(--cs-primary)' : 'transparent', transition: 'background 0.15s' }} />
              {/* content */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: THUMB_COLORS[ex.muscle] ?? thumbTint('--cs-primary-rgb'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
                }}>
                  <SmallBarbellIcon />
                </div>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <span style={{
                    fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 500,
                    color: 'var(--cs-on-surface)', display: 'block',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{ex.name}</span>
                  <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>
                    {ex.muscle} · {ex.equipment}
                  </span>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: DIFF_COLORS[ex.difficulty] ?? 'var(--cs-on-surface-variant)', opacity: 0.75 }} />
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* ── Selection bar (absolute overlay) ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: selected.size > 0 ? 64 : 0,
        overflow: 'hidden', transition: 'height 0.22s ease',
        background: 'var(--glass-popover)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(var(--cs-outline-rgb),0.30)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <span style={{ flex: 1, fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
          {selected.size} selected
        </span>
        <button onClick={() => {
          setItems(Array.from(selected).map(id => ({ type: 'solo', id })))
          setEditOpen(true)
        }} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 38, padding: '0 14px', borderRadius: 'var(--radius-2xl)',
          background: 'rgba(var(--cs-outline-rgb),0.30)', border: '1px solid rgba(var(--cs-outline-rgb),0.45)',
          fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500,
          color: 'var(--cs-on-surface-variant)', cursor: 'pointer', flexShrink: 0,
        }}>
          <EditIcon /> Edit
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 38, padding: '0 16px', borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
          border: '1px solid rgba(var(--overlay-rgb),0.18)', fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500,
          color: 'var(--cs-on-primary)', cursor: 'pointer', flexShrink: 0,
          boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 2px 4px rgba(var(--cs-shadow-rgb),0.28), 0 8px 24px rgba(var(--cs-primary-rgb),0.22), 0 16px 40px rgba(var(--cs-shadow-rgb),0.14)',
        }}>
          <CheckSmallIcon /> Add
        </button>
      </div>
      </div>{/* end results+bar wrapper */}

      {/* ── Filter backdrop scrim (dims the list while the sheet is open) ── */}
      <div
        onClick={() => setSheetOpen(false)}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(var(--cs-shadow-rgb),0.45)',
          opacity: sheetOpen ? 1 : 0,
          pointerEvents: sheetOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Filter bottom sheet — absolute overlay, slides up over the list ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 31,
        height: 462,
        transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        background: 'var(--glass-popover)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(var(--cs-outline-rgb),0.35)',
        borderRadius: '18px 18px 0 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drag handle */}
        <div
          onClick={() => setSheetOpen(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0 6px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2px 16px 0' }}>

          {/* Equipment grid */}
          <SectionLabel>Equipment</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
            {EQUIPMENT_DEFS.map(({ key, label }) => {
              const on = filters.equipment.includes(key)
              return (
                <button key={key} onClick={() => toggleMulti('equipment', key)} style={{
                  height: 52, borderRadius: 'var(--radius-lg)',
                  background: on ? 'rgba(var(--cs-primary-rgb),0.12)' : 'var(--glass-control)',
                  border: on ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.30)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <EquipmentIcon name={key} active={on} />
                  <span style={{
                    fontFamily: 'var(--tt-font-family)', fontSize: 10, fontWeight: on ? 500 : 400,
                    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                  }}>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Type segmented */}
          <SectionLabel>Type</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {TYPE_OPTS.map(t => {
              const on = filters.type === t
              return (
                <button key={t} onClick={() => setSingle('type', t)} style={{
                  flex: 1, height: 34, borderRadius: 'var(--radius-2xl)',
                  background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
                  border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
                  fontFamily: 'var(--tt-font-family)', fontSize: 10, fontWeight: on ? 500 : 400,
                  color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{t}</button>
              )
            })}
          </div>

          {/* Difficulty dots */}
          <SectionLabel>Difficulty</SectionLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {DIFFICULTY_OPTS.map(({ key, dots }) => {
              const on = filters.difficulty === key
              return (
                <button key={key} onClick={() => setSingle('difficulty', key)} style={{
                  flex: 1, height: 50, borderRadius: 'var(--radius-lg)',
                  background: on ? 'rgba(var(--cs-primary-rgb),0.12)' : 'var(--glass-control)',
                  border: on ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.30)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} style={{
                        width: 5, height: 5, borderRadius: '50%', transition: 'all 0.15s',
                        background: i < dots ? DIFF_COLORS[key] : 'rgba(var(--overlay-rgb),0.12)',
                        opacity: i < dots ? (on ? 1 : 0.70) : 1,
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: 'var(--tt-font-family)', fontSize: 10, fontWeight: on ? 500 : 400,
                    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                  }}>{key}</span>
                </button>
              )
            })}
          </div>

          {/* Advanced collapsible */}
          <button
            onClick={() => setAdvancedOpen(o => !o)}
            style={{
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, textAlign: 'left',
              fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500,
              color: 'var(--cs-on-surface-variant)', opacity: 0.45,
            }}
          >
            <ChevronSmall open={advancedOpen} />
            Advanced
          </button>
          <div style={{ maxHeight: advancedOpen ? 160 : 0, overflow: 'hidden', transition: 'max-height 0.22s ease' }}>
            <SectionLabel>Force</SectionLabel>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {FORCE_OPTS.map(f => {
                const on = filters.force.includes(f)
                return (
                  <button key={f} onClick={() => toggleMulti('force', f)} style={{
                    flex: 1, height: 32, borderRadius: 'var(--radius-2xl)',
                    background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
                    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
                    fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: on ? 500 : 400,
                    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{f}</button>
                )
              })}
            </div>
            <SectionLabel>Mechanic</SectionLabel>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {MECHANIC_OPTS.map(m => {
                const on = filters.mechanic.includes(m)
                return (
                  <button key={m} onClick={() => toggleMulti('mechanic', m)} style={{
                    flex: 1, height: 32, borderRadius: 'var(--radius-2xl)',
                    background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
                    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
                    fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: on ? 500 : 400,
                    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{m}</button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '10px 16px 20px', flexShrink: 0,
          borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)',
        }}>
          <button onClick={() => setFilters(EMPTY_FILTERS)} style={{
            height: 44, padding: '0 20px', borderRadius: 'var(--radius-2xl)',
            background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.40)',
            fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 500,
            color: 'var(--cs-on-surface-variant)', cursor: 'pointer', flexShrink: 0,
          }}>Reset</button>
          <button onClick={() => setSheetOpen(false)} style={{
            flex: 1, height: 44, borderRadius: 'var(--radius-2xl)',
            background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
            border: '1px solid rgba(var(--overlay-rgb),0.18)', fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 500,
            color: 'var(--cs-on-primary)', cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 2px 4px rgba(var(--cs-shadow-rgb),0.28), 0 8px 24px rgba(var(--cs-primary-rgb),0.22), 0 16px 40px rgba(var(--cs-shadow-rgb),0.14)',
          }}>Show {results.length} exercises</button>
        </div>
      </div>

      {/* ── Edit overlay ──────────────────────── */}
      {editOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--cs-surface)', display: 'flex', flexDirection: 'column' }}>
          <StatusBar />

          {/* Top bar */}
          <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
            <button onClick={() => { setEditOpen(false); setReorderMode(false); setCheckedIds(new Set()); setCheckedGroups(new Set()) }} style={{
              width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0,
              background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ChevronLeft />
            </button>
            <span style={{ flex: 1, fontFamily: 'var(--tt-font-family)', fontSize: 18, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
              Edit Selection
            </span>
            <button
              onClick={() => { setReorderMode(r => !r); setCheckedIds(new Set()); setCheckedGroups(new Set()) }}
              style={{
                height: 34, padding: '0 12px', borderRadius: 'var(--radius-2xl)',
                background: reorderMode ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control)',
                border: reorderMode ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.40)',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500,
                color: reorderMode ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                cursor: 'pointer',
              }}
            >
              {reorderMode ? 'Done' : <><ReorderIcon /> Reorder</>}
            </button>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((entry) => {
              if (entry.type === 'solo') {
                const checked = checkedIds.has(entry.id)
                const leading = reorderMode
                  ? <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'grab' }}><DragHandleIcon /></div>
                  : <RowCheckbox checked={checked} onChange={() => toggleCheckedId(entry.id)} />
                return (
                  <GlassCard key={entry.id} level="Low" style={{
                    display: 'flex', overflow: 'hidden',
                    ...(checked && { background: 'rgba(var(--cs-primary-rgb),0.14)' }),
                    transition: 'background 0.15s',
                  }}>
                    <div style={{ width: 4, flexShrink: 0, background: checked ? 'var(--cs-primary)' : 'transparent', transition: 'background 0.15s' }} />
                    <ExerciseRow id={entry.id} leading={leading} />
                  </GlassCard>
                )
              }
              const groupKey = entry.ids.join('-')
              const groupChecked = checkedGroups.has(groupKey)
              const groupLeading = reorderMode
                ? <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'grab' }}><DragHandleIcon /></div>
                : <RowCheckbox checked={groupChecked} onChange={() => toggleCheckedGroup(groupKey)} />
              return (
                <div key={groupKey} style={{
                  borderRadius: 'var(--radius-2xl)',
                  background: 'rgba(var(--cs-primary-rgb),0.05)',
                  border: '1px solid rgba(var(--cs-primary-rgb),0.18)',
                  overflow: 'hidden', position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--cs-primary)' }} />
                  {/* Superset header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 6px 14px' }}>
                    {groupLeading}
                    <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', color: 'var(--cs-primary)', opacity: 0.80 }}>SUPERSET</span>
                  </div>
                  {/* Exercises inside superset */}
                  {entry.ids.map((id, idx) => {
                    const exChecked = checkedIds.has(id)
                    const exLeading = reorderMode
                      ? <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'grab' }}><DragHandleIcon /></div>
                      : <RowCheckbox checked={exChecked} onChange={() => toggleCheckedId(id)} />
                    return (
                      <div key={id}>
                        {idx > 0 && <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)', marginLeft: 14 }} />}
                        <ExerciseRow id={id} leading={exLeading} />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px 28px', flexShrink: 0, borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)', background: 'var(--glass-low-bg)' }}>
            {!reorderMode && anyChecked && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {canGroup && (
                  <button onClick={handleGroup} style={{
                    flex: 1, height: 42, borderRadius: 'var(--radius-2xl)',
                    background: 'rgba(var(--cs-primary-rgb),0.08)', border: '1px solid rgba(var(--cs-primary-rgb),0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500,
                    color: 'var(--cs-primary)', cursor: 'pointer',
                  }}>
                    <LinkIcon /> Group
                  </button>
                )}
                <button onClick={handleDelete} style={{
                  flex: 1, height: 42, borderRadius: 'var(--radius-2xl)',
                  background: 'rgba(var(--cs-error-rgb),0.10)', border: '1px solid rgba(var(--cs-error-rgb),0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500,
                  color: 'var(--cs-error)', cursor: 'pointer',
                }}>
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
            <button style={{
              width: '100%', height: 48, borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
              border: '1px solid rgba(var(--overlay-rgb),0.18)', fontFamily: 'var(--tt-font-family)', fontSize: 15, fontWeight: 500,
              color: 'var(--cs-on-primary)', cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 2px 4px rgba(var(--cs-shadow-rgb),0.28), 0 8px 24px rgba(var(--cs-primary-rgb),0.22), 0 16px 40px rgba(var(--cs-shadow-rgb),0.14)',
            }}>Add to Workout</button>
          </div>
        </div>
      )}
    </PhoneFrame>
  )
}

// ─── Helpers ──────────────────────────────────

function chipSt(active) {
  return {
    flexShrink: 0, padding: '5px 12px', borderRadius: 'var(--radius-2xl)',
    background: active ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
    border: active ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
    fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: active ? 500 : 400,
    color: active ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  }
}

function SectionLabel({ children }) {
  return (
    <span style={{
      display: 'block', marginBottom: 8,
      fontFamily: 'var(--tt-font-family)', fontSize: 10, fontWeight: 500,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--cs-on-surface-variant)', opacity: 0.45,
    }}>{children}</span>
  )
}

function ChevronSmall({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function EquipmentIcon({ name, active }) {
  const c = active ? 'var(--cs-primary)' : 'rgba(var(--cs-on-surface-variant-rgb),0.50)'
  const sw = '1.6'
  if (name === 'Bodyweight') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v8" /><path d="M8 10h8" /><path d="M9 20l3-6 3 6" />
    </svg>
  )
  if (name === 'Barbell') return (
    <svg width="22" height="8" viewBox="0 0 26 8" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <rect x="0.5" y="0" width="3" height="8" rx="1" /><rect x="22.5" y="0" width="3" height="8" rx="1" />
      <line x1="3.5" y1="4" x2="22.5" y2="4" />
      <rect x="3" y="1.5" width="2" height="5" rx="0.5" /><rect x="21" y="1.5" width="2" height="5" rx="0.5" />
    </svg>
  )
  if (name === 'Dumbbell') return (
    <svg width="20" height="8" viewBox="0 0 22 8" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <rect x="0.5" y="1" width="2.5" height="6" rx="1" /><rect x="19" y="1" width="2.5" height="6" rx="1" />
      <line x1="3" y1="4" x2="19" y2="4" />
      <rect x="2.5" y="2" width="2" height="4" rx="0.5" /><rect x="17.5" y="2" width="2" height="4" rx="0.5" />
    </svg>
  )
  if (name === 'Cable') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V17" /><path d="M8 21h8l-1.5-4h-5L8 21z" />
    </svg>
  )
  if (name === 'Bands') return (
    <svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <ellipse cx="12" cy="8" rx="10" ry="5" /><ellipse cx="12" cy="8" rx="6" ry="2.5" />
    </svg>
  )
  if (name === 'Machine') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
  return null
}

// ─── SVG Icons ────────────────────────────────

function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function FilterIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)'}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}


function SmallBarbellIcon() {
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" fill="none"
      stroke="rgba(var(--overlay-rgb),0.18)" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1" />
      <rect x="21.5" y="1" width="4" height="8" rx="1" />
      <line x1="4.5" y1="5" x2="21.5" y2="5" />
    </svg>
  )
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="rgba(var(--cs-on-surface-variant-rgb),0.35)" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="8"  x2="20" y2="8"  />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function CheckSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ExerciseRow({ id, leading }) {
  const ex = EXERCISES.find(e => e.id === id)
  if (!ex) return null
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px 9px 14px' }}>
      {leading}
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: THUMB_COLORS[ex.muscle] ?? thumbTint('--cs-primary-rgb'), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--cs-outline-rgb),0.25)' }}>
        <SmallBarbellIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
        <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{ex.muscle} · {ex.equipment}</span>
      </div>
    </div>
  )
}

function RowCheckbox({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 22, height: 22, borderRadius: checked ? 11 : 6, flexShrink: 0, padding: 0,
      background: checked ? 'var(--cs-primary)' : 'transparent',
      border: checked ? 'none' : '1.5px solid rgba(var(--cs-outline-rgb),0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="var(--cs-on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  )
}

function ReorderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
