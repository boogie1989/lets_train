import { useState, useRef } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import NavBar from '../../components/NavBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import Segmented from '../../components/Segmented.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { LibrariesView, WorkoutPreviewView, MealPreviewView } from '../libraries/index.js'
import WeekGrid from './WeekGrid.jsx'
import * as M from './planModel.js'
import { ChevLeftIcon, CheckIcon, PlusIcon, MinusIcon, XIcon, CopyIcon, GridIcon, CalendarPlusIcon } from './icons.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const iconBtnSt = {
  width: 44, height: 44, borderRadius: 'var(--radius-2xl)', flexShrink: 0,
  background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)', boxShadow: 'var(--shadow-card)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
}
const labelSt = { ...TT, display: 'block', marginBottom: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }
const chipSt = on => ({
  ...TT, padding: '6px 13px', borderRadius: 'var(--radius-2xl)', cursor: 'pointer',
  background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
  border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
  fontSize: 12, fontWeight: on ? 500 : 400, color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
})
const stepBtnSt = { ...iconBtnSt, width: 32, height: 32, borderRadius: 'var(--radius-lg)', boxShadow: 'none', background: 'rgba(var(--overlay-rgb),0.06)', border: '1px solid rgba(var(--overlay-rgb),0.09)', color: 'var(--cs-on-surface-variant)' }
const primaryBtnSt = {
  ...TT, fontWeight: 500, color: 'var(--cs-on-primary)', cursor: 'pointer',
  background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
  border: '1px solid rgba(var(--overlay-rgb),0.18)', boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)',
}
const sheetWrapSt = { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41, background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 32px rgba(var(--cs-shadow-rgb),0.55)' }
const scrimSt = { position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(var(--cs-shadow-rgb),0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }

export default function PlanBuilderScreen({ initialStep = 'plan' }) {
  const [plan, setPlan] = useState(() => (initialStep === 'empty' ? M.emptyPlan() : M.demoPlan()))
  const [expanded, setExpanded] = useState(['day', 'picker', 'preview', 'daymenu', 'copydays'].includes(initialStep) ? { week: 0, day: 0 } : null)
  const [weekMenu, setWeekMenu] = useState(null)
  const [dayMenu, setDayMenu] = useState(initialStep === 'daymenu' ? { week: 0, day: 0 } : null)
  const [copyTargets, setCopyTargets] = useState(initialStep === 'copydays' ? { week: 0, day: 0 } : null)
  const [clearAsk, setClearAsk] = useState(null)
  const [picker, setPicker] = useState(initialStep === 'picker' ? { kind: 'workout', week: 0, day: 0 } : null)
  const [preview, setPreview] = useState(initialStep === 'preview' ? { kind: 'workout', id: 2 } : null)

  const scrollRef = useRef(null)
  const weekRefs = useRef({})
  const stats = M.computePlanStats(plan)

  function toggleCell(w, d) {
    setExpanded(cur => {
      const same = cur && cur.week === w && cur.day === d
      const next = same ? null : { week: w, day: d }
      if (!same) requestAnimationFrame(() => {
        const el = weekRefs.current[w]
        if (el && scrollRef.current) scrollRef.current.scrollTop = el.offsetTop - 8
      })
      return next
    })
  }

  const on = {
    addWorkout: (w, d) => setPicker({ kind: 'workout', week: w, day: d }),
    addMeal: (w, d) => setPicker({ kind: 'meal', week: w, day: d }),
    remove: (w, d, type, id) => setPlan(p => M.removeFromDay(p, w, d, type, id)),
    move: (w, d, f, t) => setPlan(p => M.moveItem(p, w, d, f, t)),
    openWorkout: id => setPreview({ kind: 'workout', id }),
    openMeal: id => setPreview({ kind: 'meal', id }),
    dayMenu: (w, d) => setDayMenu({ week: w, day: d }),
  }

  function handlePick(ids) {
    if (!picker) return
    setPlan(p => ids.reduce((acc, id) => picker.kind === 'workout'
      ? M.addWorkoutToDay(acc, picker.week, picker.day, id)
      : M.addMealToDay(acc, picker.week, picker.day, id), p))
    setPicker(null)
  }

  return (
    <PhoneFrame smokeVariant="shader">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <NavBar>
          <StatusBar />
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px', gap: 8 }}>
            <button style={iconBtnSt}><ChevLeftIcon /></button>
            <span style={{ ...TT, flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)', textAlign: 'center' }}>
              {initialStep === 'empty' ? 'New Plan' : 'Edit Plan'}
            </span>
            <button style={{ ...iconBtnSt, background: 'var(--cs-primary)', border: 'none', color: 'var(--cs-on-primary)', opacity: M.validatePlan(plan) ? 1 : 0.4 }}><CheckIcon /></button>
          </div>
        </NavBar>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 90px' }}>
          {/* details card */}
          <GlassCard level="Low" style={{ padding: '14px 16px', marginBottom: 14 }}>
            <input value={plan.name} onChange={e => setPlan(p => M.setName(p, e.target.value))} placeholder="Plan name"
              style={{ ...TT, fontSize: 'var(--tt-title-medium-size)', fontWeight: 500, color: 'var(--cs-on-surface)', background: 'none', border: 'none', outline: 'none', padding: 0, width: '100%', boxSizing: 'border-box' }} />
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0' }} />
            <textarea value={plan.description} onChange={e => setPlan(p => M.setDescription(p, e.target.value))} placeholder="Add a description…" rows={2}
              style={{ ...TT, fontSize: 'var(--tt-body-small-size)', lineHeight: 'var(--tt-body-small-height)', color: 'var(--cs-on-surface-variant)', background: 'none', border: 'none', outline: 'none', resize: 'none', padding: 0, width: '100%', boxSizing: 'border-box', display: 'block' }} />
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0 14px' }} />

            <span style={labelSt}>Goal</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
              {M.GOALS.map(g => <button key={g} onClick={() => setPlan(p => M.setGoal(p, g))} style={chipSt(plan.goal === g)}>{g}</button>)}
            </div>

            <span style={labelSt}>Level</span>
            <div style={{ marginBottom: 16 }}>
              <Segmented options={M.LEVELS.map(l => ({ id: l, label: l }))} value={plan.level} onChange={l => setPlan(p => M.setLevel(p, l))} />
            </div>

            <span style={labelSt}>Duration</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {M.WEEK_PRESETS.map(n => <button key={n} onClick={() => setPlan(p => M.setDurationWeeks(p, n))} style={chipSt(plan.weeks === n)}>{n}</button>)}
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setPlan(p => M.setDurationWeeks(p, p.weeks - 1))} style={stepBtnSt}><MinusIcon size={15} /></button>
                <span style={{ ...TT, fontSize: 14, fontWeight: 600, color: 'var(--cs-on-surface)', minWidth: 56, textAlign: 'center' }}>{plan.weeks} wk</span>
                <button onClick={() => setPlan(p => M.setDurationWeeks(p, p.weeks + 1))} style={stepBtnSt}><PlusIcon size={13} /></button>
              </div>
            </div>
          </GlassCard>

          <p style={{ ...TT, fontSize: 'var(--tt-body-small-size)', color: 'var(--cs-on-surface-variant)', opacity: 0.45, margin: '0 2px 14px' }}>
            {plan.weeks} weeks · {stats.sessionsPerWeek}×/wk{stats.avgKcalPerDay ? ` · ~${stats.avgKcalPerDay} kcal/day` : ''}
          </p>

          <WeekGrid plan={plan} expanded={expanded} weekRefs={weekRefs} on={on}
            onCellTap={toggleCell} onWeekMenu={w => setWeekMenu(w)} />
        </div>

        {/* save footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'linear-gradient(0deg, rgba(var(--cs-surface-rgb),0.92) 55%, transparent)' }}>
          <button style={{ ...primaryBtnSt, width: '100%', height: 50, borderRadius: 'var(--radius-2xl)', fontSize: 15 }}>Save Plan</button>
        </div>

        {/* ── Week actions menu ── */}
        {weekMenu != null && (
          <>
            <div onClick={() => setWeekMenu(null)} style={scrimSt} />
            <div style={{ ...sheetWrapSt, padding: '10px 12px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} /></div>
              <p style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)', margin: '0 4px 8px', padding: '0 4px' }}>Week {weekMenu + 1}</p>
              {[
                { label: 'Duplicate to next week', icon: <CopyIcon />, disabled: weekMenu >= plan.weeks - 1, run: () => setPlan(p => M.duplicateWeek(p, weekMenu, weekMenu + 1)) },
                { label: 'Copy to all weeks', icon: <CopyIcon />, run: () => setPlan(p => M.copyWeekToAll(p, weekMenu)) },
                { label: 'Clear week', icon: <XIcon size={13} />, danger: true, run: () => setPlan(p => M.clearWeek(p, weekMenu)) },
              ].map(a => (
                <button key={a.label} disabled={a.disabled} onClick={() => { a.run(); setWeekMenu(null) }} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 'var(--radius-lg)', background: 'none', border: 'none', cursor: a.disabled ? 'default' : 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500, opacity: a.disabled ? 0.3 : 1, color: a.danger ? 'rgba(var(--cs-error-rgb),0.9)' : 'var(--cs-on-surface)' }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Day actions menu ── */}
        {dayMenu && (() => {
          const { week: w, day: d } = dayMenu
          const empty = M.getCell(plan, w, d).items.length === 0
          const actions = [
            { label: `Copy to every ${M.DAYS[d]}`, sub: 'same weekday · all weeks', icon: <CopyIcon />, disabled: empty || plan.weeks < 2, run: () => setPlan(p => M.copyDayToAllWeeks(p, w, d)) },
            { label: 'Copy to next week', sub: w >= plan.weeks - 1 ? 'last week' : `${M.DAYS[d]} · Week ${w + 2}`, icon: <CalendarPlusIcon />, disabled: empty || w >= plan.weeks - 1, run: () => setPlan(p => M.copyDayToCells(p, w, d, [{ week: w + 1, day: d }])) },
            { label: 'Copy to specific days…', sub: 'pick days on the grid', icon: <GridIcon />, disabled: empty, run: () => setCopyTargets({ week: w, day: d }) },
            { label: 'Clear day', icon: <XIcon size={13} />, danger: true, disabled: empty, run: () => setClearAsk({ week: w, day: d }) },
          ]
          return (
            <>
              <div onPointerDown={() => setDayMenu(null)} style={scrimSt} />
              <div style={{ ...sheetWrapSt, padding: '10px 12px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} /></div>
                <p style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)', margin: '0 4px 8px', padding: '0 4px' }}>
                  {DAY_FULL[d]} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>· Week {w + 1}</span>
                </p>
                {actions.map(a => (
                  <button key={a.label} disabled={a.disabled} onClick={() => { a.run(); setDayMenu(null) }} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 'var(--radius-lg)', background: 'none', border: 'none', cursor: a.disabled ? 'default' : 'pointer', textAlign: 'left', opacity: a.disabled ? 0.3 : 1, color: a.danger ? 'rgba(var(--cs-error-rgb),0.9)' : 'var(--cs-on-surface)' }}>
                    <span style={{ display: 'flex', width: 18, justifyContent: 'center', flexShrink: 0, color: a.danger ? 'rgba(var(--cs-error-rgb),0.9)' : 'var(--cs-on-surface-variant)' }}>{a.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                      {a.sub && <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 1 }}>{a.sub}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )
        })()}

        {/* ── Copy-to-specific-days picker ── */}
        {copyTargets && (
          <CopyTargetsSheet plan={plan} src={copyTargets}
            onCancel={() => setCopyTargets(null)}
            onConfirm={targets => { setPlan(p => M.copyDayToCells(p, copyTargets.week, copyTargets.day, targets)); setCopyTargets(null) }} />
        )}

        {/* ── Clear-day confirm ── */}
        {clearAsk && (
          <div onClick={() => setClearAsk(null)} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(var(--cs-shadow-rgb),0.55)' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <ConfirmDialog
                title="Clear this day?"
                message={`Remove everything from ${DAY_FULL[clearAsk.day]}, Week ${clearAsk.week + 1}.`}
                confirmLabel="Clear" cancelLabel="Cancel" destructive
                onCancel={() => setClearAsk(null)}
                onConfirm={() => { setPlan(p => M.clearDay(p, clearAsk.week, clearAsk.day)); setClearAsk(null) }} />
            </div>
          </div>
        )}

        {/* ── Library picker overlay (workouts / meals) ── */}
        {picker && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--cs-surface)' }}>
            <LibrariesView lockLibrary mode="multi"
              initialLibrary={picker.kind === 'workout' ? 'workouts' : 'meals'}
              onConfirm={handlePick} onClose={() => setPicker(null)} />
          </div>
        )}

        {/* ── Workout / Meal preview overlay ── */}
        {preview && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cs-surface)' }}>
            {preview.kind === 'workout'
              ? <WorkoutPreviewView workout={M.getWorkout(preview.id)} onClose={() => setPreview(null)} cta="Done" />
              : <MealPreviewView meal={M.getMeal(preview.id)} onClose={() => setPreview(null)} cta="Done" />}
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}

// ── Copy-to-specific-days picker ── grid of every week × day; tap to toggle.
const FOCUS_ABBR = { 'Full body': 'FB', Upper: 'Up', Lower: 'Lo', Push: 'Pu', Pull: 'Pl', Core: 'Co' }

function CopyTargetsSheet({ plan, src, onCancel, onConfirm }) {
  const [sel, setSel] = useState(() => new Set())
  const key = (w, d) => `${w}:${d}`
  const isSrc = (w, d) => w === src.week && d === src.day
  const toggle = (w, d) => {
    if (isSrc(w, d)) return
    setSel(s => { const n = new Set(s); const k = key(w, d); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  const confirm = () => onConfirm([...sel].map(k => { const [w, d] = k.split(':').map(Number); return { week: w, day: d } }))

  const cancelBtn = { ...TT, flex: 1, height: 46, borderRadius: 'var(--radius-2xl)', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.09)', color: 'var(--cs-on-surface-variant)' }
  return (
    <>
      <div onClick={onCancel} style={scrimSt} />
      <div style={{ ...sheetWrapSt, maxHeight: '80%', display: 'flex', flexDirection: 'column', padding: '10px 14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 10 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} /></div>
        <p style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)', margin: '0 2px 2px' }}>Copy {DAY_FULL[src.day]} · Week {src.week + 1}</p>
        <p style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.6, margin: '0 2px 12px' }}>Tap days to add this day's items into them.</p>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(7, 1fr)', columnGap: 4, marginBottom: 6 }}>
            <span />
            {M.DAYS.map(d => <span key={d} style={{ ...TT, fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.4, textAlign: 'center' }}>{d}</span>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {plan.schedule.map((week, w) => (
              <div key={w} style={{ display: 'grid', gridTemplateColumns: '30px repeat(7, 1fr)', columnGap: 4, alignItems: 'center' }}>
                <span style={{ ...TT, fontSize: 10, fontWeight: 600, color: 'var(--cs-on-surface-variant)', opacity: 0.7, textAlign: 'center' }}>W{w + 1}</span>
                {week.map((cell, d) => {
                  const info = M.cellInfo(cell)
                  const on = sel.has(key(w, d))
                  const me = isSrc(w, d)
                  return (
                    <button key={d} onClick={() => toggle(w, d)} disabled={me} style={{
                      position: 'relative', height: 34, borderRadius: 'var(--radius-md)', cursor: me ? 'default' : 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', ...TT, transition: 'all 0.12s',
                      background: me ? 'rgba(var(--cs-primary-rgb),0.28)' : on ? 'rgba(var(--cs-primary-rgb),0.18)' : info ? `rgba(var(${info.color}),0.10)` : 'rgba(var(--overlay-rgb),0.03)',
                      border: me ? '1px solid var(--cs-primary)' : on ? '1px solid rgba(var(--cs-primary-rgb),0.6)' : info ? `1px solid rgba(var(${info.color}),0.28)` : '1px solid rgba(var(--overlay-rgb),0.07)',
                    }}>
                      {info
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: (me || on) ? 'var(--cs-primary)' : `rgba(var(${info.color}),1)` }}>{FOCUS_ABBR[info.focus] ?? info.focus.slice(0, 2)}</span>
                        : <span style={{ width: 3, height: 3, borderRadius: '50%', background: on ? 'var(--cs-primary)' : 'rgba(var(--cs-primary-rgb),0.3)' }} />}
                      {me && <span style={{ position: 'absolute', top: 1, right: 3, ...TT, fontSize: 7, fontWeight: 700, color: 'var(--cs-primary)' }}>from</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button onClick={confirm} disabled={!sel.size} style={{ ...primaryBtnSt, flex: 1, height: 46, borderRadius: 'var(--radius-2xl)', fontSize: 14, opacity: sel.size ? 1 : 0.4 }}>Copy{sel.size ? ` (${sel.size})` : ''}</button>
        </div>
      </div>
    </>
  )
}
