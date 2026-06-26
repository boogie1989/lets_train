import { useState, useRef } from 'react'
import GlassCard from '../../components/GlassCard.jsx'
import IconButton from '../../components/IconButton.jsx'
import { DAYS, cellInfo, cellHasMeals, getWorkout, getMeal, FOCUS_COLORS } from './planModel.js'
import { DotsIcon, PlusIcon, XIcon, GripIcon } from './icons.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const FOCUS_ABBR = { 'Full body': 'FB', Upper: 'Up', Lower: 'Lo', Push: 'Pu', Pull: 'Pl', Core: 'Co' }
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// tap → expand (onClick); long-press / right-click → day actions menu (onMenu)
function DayCell({ cell, active, onClick, onMenu }) {
  const info = cellInfo(cell)
  const hasMeals = cellHasMeals(cell)
  const timer = useRef(null)
  const longRef = useRef(false)
  const start = () => { longRef.current = false; clearTimeout(timer.current); timer.current = setTimeout(() => { longRef.current = true; onMenu && onMenu() }, 450) }
  const cancel = () => { clearTimeout(timer.current); timer.current = null }
  const press = {
    onClick: () => { if (longRef.current) { longRef.current = false; return } onClick && onClick() },
    onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel,
    onContextMenu: e => { e.preventDefault(); cancel(); onMenu && onMenu() },
  }
  const base = {
    position: 'relative', height: 42, borderRadius: 10, cursor: 'pointer', padding: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', ...TT, WebkitUserSelect: 'none', userSelect: 'none', touchAction: 'none',
    outline: active ? '2px solid rgba(var(--cs-primary-rgb),0.55)' : 'none', outlineOffset: 1,
  }
  const mealDot = hasMeals && <span style={{ position: 'absolute', bottom: 4, right: 4, width: 4, height: 4, borderRadius: '50%', background: 'var(--cs-tertiary)' }} />
  if (!info) {
    return (
      <button {...press} style={{ ...base, background: 'rgba(var(--overlay-rgb),0.02)', border: '1px solid rgba(var(--overlay-rgb),0.06)' }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(var(--cs-primary-rgb),0.30)' }} />
        {mealDot}
      </button>
    )
  }
  return (
    <button {...press} title={info.name} style={{ ...base, background: `rgba(var(${info.color}),0.14)`, border: `1px solid rgba(var(${info.color}),0.40)` }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: `rgba(var(${info.color}),1)`, letterSpacing: '0.02em' }}>{FOCUS_ABBR[info.focus] ?? info.focus.slice(0, 2)}</span>
      {info.extra > 0 && <span style={{ fontSize: 8, fontWeight: 500, color: `rgba(var(${info.color}),0.7)` }}>+{info.extra}</span>}
      {mealDot}
    </button>
  )
}

function ItemRow({ kind, item, onOpen, onRemove, draggable, onDragStart, onDragEnter, onDrop }) {
  const colorCh = kind === 'workout' ? (FOCUS_COLORS[item.focus] ?? '--cs-primary-rgb') : '--cs-tertiary-rgb'
  const meta = kind === 'workout'
    ? `${item.focus} · ${item.exercises} ex · ${item.minutes} min`
    : `${item.kcal} kcal · ${item.p}P ${item.c}C ${item.f}F`
  return (
    <div draggable={draggable} onDragStart={onDragStart} onDragEnter={onDragEnter} onDragOver={e => e.preventDefault()} onDrop={onDrop}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px 9px 8px', borderRadius: 'var(--radius-lg)', background: 'var(--glass-low-bg)', border: '1px solid rgba(var(--overlay-rgb),0.04)', boxShadow: 'var(--shadow-glass-low)' }}>
      <span style={{ color: 'rgba(var(--cs-primary-rgb),0.4)', flexShrink: 0, padding: '0 2px' }}><GripIcon /></span>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${colorCh}),1)`, opacity: 0.8, flexShrink: 0 }} />
      <button onClick={onOpen} style={{ ...TT, flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{meta}</div>
      </button>
      <button onClick={onRemove} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(var(--cs-primary-rgb),0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={12} /></button>
    </div>
  )
}

const addBtnSt = { ...TT, flex: 1, height: 40, borderRadius: 'var(--radius-lg)', border: '1.5px dashed rgba(var(--overlay-rgb),0.12)', background: 'rgba(var(--overlay-rgb),0.02)', color: 'var(--cs-on-surface-variant)', opacity: 0.6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }

function DayPanel({ plan, week, day, on }) {
  const [drag, setDrag] = useState(null) // index in the unified list being dragged
  const cell = plan.schedule[week][day]
  // resolve to a single ordered list mixing workouts + meals
  const items = cell.items
    .map(it => ({ ...it, data: it.type === 'workout' ? getWorkout(it.id) : getMeal(it.id) }))
    .filter(x => x.data)

  return (
    <GlassCard level="Low" style={{ padding: '14px 14px 16px', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
        <p style={{ ...TT, flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)', margin: 0 }}>
          {DAY_FULL[day]} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>· Week {week + 1}</span>
        </p>
        <IconButton size="sm" aria-label="Day actions" onClick={() => on.dayMenu && on.dayMenu(week, day)}
          icon={<span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)' }}><DotsIcon /></span>} />
      </div>

      {/* one ordered list — workouts + meals reorder freely among each other */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: items.length ? 12 : 0 }}>
        {items.map((it, i) => (
          <ItemRow key={`${it.type}-${it.id}`} kind={it.type} item={it.data}
            draggable
            onDragStart={() => setDrag(i)}
            onDragEnter={() => { if (drag != null && drag !== i) { on.move(week, day, drag, i); setDrag(i) } }}
            onDrop={() => setDrag(null)}
            onOpen={() => it.type === 'workout' ? on.openWorkout(it.id) : on.openMeal(it.id)}
            onRemove={() => on.remove(week, day, it.type, it.id)} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => on.addWorkout(week, day)} style={addBtnSt}><PlusIcon size={12} /> Workout</button>
        <button onClick={() => on.addMeal(week, day)} style={addBtnSt}><PlusIcon size={12} /> Meal</button>
      </div>
    </GlassCard>
  )
}

export default function WeekGrid({ plan, expanded, weekRefs, onCellTap, onWeekMenu, on }) {
  return (
    <div>
      {/* day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(7, 1fr)', columnGap: 5, marginBottom: 7 }}>
        <span />
        {DAYS.map(d => (
          <span key={d} style={{ ...TT, fontSize: 9, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.4, textAlign: 'center' }}>{d}</span>
        ))}
      </div>

      {/* one row per week (+ inline day panel) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {plan.schedule.map((week, w) => (
          <div key={w} ref={el => { if (weekRefs) weekRefs.current[w] = el }}>
            <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(7, 1fr)', columnGap: 5, alignItems: 'center' }}>
              <button onClick={() => onWeekMenu(w)} style={{ ...TT, height: 42, padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'var(--cs-on-surface-variant)' }}>
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.75 }}>W{w + 1}</span>
                <span style={{ opacity: 0.4, display: 'flex' }}><DotsIcon /></span>
              </button>
              {week.map((cell, d) => (
                <DayCell key={d} cell={cell} active={expanded && expanded.week === w && expanded.day === d}
                  onClick={() => onCellTap(w, d)} onMenu={() => on.dayMenu(w, d)} />
              ))}
            </div>
            {expanded && expanded.week === w && (
              <DayPanel plan={plan} week={w} day={expanded.day} on={on} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
