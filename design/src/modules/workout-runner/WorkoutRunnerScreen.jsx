import { useState, useEffect } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import NavBar from '../../components/NavBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import DateCell from '../../components/DateCell.jsx'
import TaskItem from '../../components/TaskItem.jsx'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_EXERCISES = [
  { id: 1, name: 'Barbell Back Squat', muscle: 'Legs',  equipment: 'Barbell',    difficulty: 'Hard'   },
  { id: 2, name: 'Romanian Deadlift',  muscle: 'Back',  equipment: 'Barbell',    difficulty: 'Medium' },
  { id: 5, name: 'Dumbbell Lunges',    muscle: 'Legs',  equipment: 'Dumbbell',   difficulty: 'Easy'   },
  { id: 8, name: 'Box Jumps',          muscle: 'Legs',  equipment: 'Bodyweight', difficulty: 'Medium' },
  { id: 9, name: 'Tricep Pushdown',    muscle: 'Arms',  equipment: 'Cable',      difficulty: 'Easy'   },
]

const DEMO_WORKOUT = {
  title: 'Leg Day',
  items: [
    { type: 'solo',     id: 1,        sets: 4 },
    { type: 'solo',     id: 2,        sets: 3 },
    { type: 'superset', ids: [5, 8],  sets: 3 },
    { type: 'solo',     id: 9,        sets: 3 },
  ],
}

const TASKS = [
  { title: 'Morning Strength',  time: '07:00 AM', exerciseCount: 8,  status: 'Completed' },
  { title: 'Mobility Training', time: '08:30 AM', exerciseCount: 7,  status: 'Completed' },
  { title: 'Leg Day',           time: '10:00 AM', exerciseCount: 12, status: 'Planned'   },
  { title: 'HIIT Cardio',       time: '12:00 PM', exerciseCount: 6,  status: 'Planned'   },
  { title: 'Core Workout',      time: '03:00 PM', exerciseCount: 10, status: 'Planned'   },
  { title: 'Upper Body',        time: '05:00 PM', exerciseCount: 9,  status: 'Planned'   },
  { title: 'Evening Yoga',      time: '06:30 PM', exerciseCount: 5,  status: 'Planned'   },
]

const DATES = [
  { weekday: 'Sun', day: '10', state: 'default'  },
  { weekday: 'Mon', day: '11', state: 'default'  },
  { weekday: 'Tue', day: '12', state: 'default'  },
  { weekday: 'Wed', day: '13', state: 'today'    },
  { weekday: 'Thu', day: '14', state: 'selected' },
  { weekday: 'Fri', day: '15', state: 'default'  },
  { weekday: 'Sat', day: '16', state: 'default'  },
]

const thumbTint = ch => `linear-gradient(150deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.06) 100%), var(--cs-surface-container-high)`
const THUMB_COLORS = {
  Legs: thumbTint('--cat-blue-rgb'), Back: thumbTint('--cat-violet-rgb'), Chest: thumbTint('--cat-pink-rgb'),
  Arms: thumbTint('--cat-cyan-rgb'), Core: thumbTint('--cs-tertiary-rgb'), Shoulders: thumbTint('--cat-amber-rgb'),
}

const DIFF_COLORS    = { Easy: 'var(--cs-tertiary)', Medium: 'var(--cat-amber)', Hard: 'var(--cs-error)' }
const WEIGHT_UNITS   = ['kg', 'lbs', 'time']
const REPS_UNITS     = ['reps', 'failure', 'time']

// ─── Shared styles ────────────────────────────────────────────────────────────

const TT = { fontFamily: 'var(--tt-font-family)' }


const iconBtnSt = {
  width: 44, height: 44, borderRadius: 'var(--radius-xl)',
  background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
  boxShadow: 'var(--shadow-card)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, cursor: 'pointer', padding: 0,
}

const adjustBtnSt = {
  width: 32, height: 32, borderRadius: 8, padding: 0,
  background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.09)',
  ...TT, fontSize: 18, color: 'var(--cs-on-surface-variant)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkoutRunnerScreen({ initialStep = 'calendar' }) {
  const isRunLike   = initialStep === 'running' || initialStep === 'rest'
  const isTimerLike = initialStep === 'timer'

  const [step,       setStep]       = useState(initialStep)
  const [countSec,   setCountSec]   = useState(10)
  const [itemIdx,    setItemIdx]    = useState(0)
  const [subIdx,     setSubIdx]     = useState(0)
  const [setIdx,     setSetIdx]     = useState(isRunLike ? 1 : 0)
  const [loggedSets, setLoggedSets] = useState(isRunLike ? [{ weight: '80', reps: '8', isDrop: false }] : [])
  const [weight,     setWeight]     = useState('')
  const [reps,       setReps]       = useState('')
  const [restSec,    setRestSec]    = useState(10)
  const [restTotal,  setRestTotal]  = useState(10)
  const [restType,   setRestType]   = useState('set')
  const [workoutSec, setWorkoutSec] = useState(isRunLike ? 142 : 0)
  const [weightUnit,    setWeightUnit]    = useState('kg')
  const [repsUnit,      setRepsUnit]      = useState('reps')
  const [unitPicker,    setUnitPicker]    = useState(null)
  const [dropSetForms,  setDropSetForms]  = useState([])
  const [timerSec,      setTimerSec]      = useState(isTimerLike ? 47 : 60)
  const [timerTotal,    setTimerTotal]    = useState(60)
  const [timerRunning,  setTimerRunning]  = useState(isTimerLike)

  // ─── Computed ──────────────────────────────────────────────
  const currentItem = DEMO_WORKOUT.items[itemIdx]
  const isSupersetItem = currentItem?.type === 'superset'
  const currentExId = isSupersetItem ? currentItem.ids[subIdx] : currentItem?.id
  const currentEx   = DEMO_EXERCISES.find(e => e.id === currentExId)
  const totalSets   = currentItem?.sets ?? 3
  const hasInput    = weight !== '' && reps !== ''

  const flatExCount = DEMO_WORKOUT.items.reduce(
    (n, item) => n + (item.type === 'superset' ? item.ids.length : 1), 0
  )
  let doneExCount = 0
  for (let i = 0; i < itemIdx; i++) {
    const it = DEMO_WORKOUT.items[i]
    doneExCount += it.type === 'superset' ? it.ids.length : 1
  }
  if (isSupersetItem) doneExCount += subIdx

  const equipmentList = [...new Set(
    DEMO_WORKOUT.items.flatMap(item =>
      item.type === 'superset'
        ? item.ids.map(id => DEMO_EXERCISES.find(e => e.id === id)?.equipment).filter(Boolean)
        : [DEMO_EXERCISES.find(e => e.id === item.id)?.equipment].filter(Boolean)
    )
  )]

  const firstItem = DEMO_WORKOUT.items[0]
  const firstEx = DEMO_EXERCISES.find(e => e.id === (
    firstItem?.type === 'superset' ? firstItem.ids[0] : firstItem?.id
  ))

  const totalStats = DEMO_WORKOUT.items.reduce(
    (n, i) => n + i.sets * (i.type === 'superset' ? i.ids.length : 1), 0
  )

  // ─── Timer effects ─────────────────────────────────────────
  useEffect(() => {
    if (step !== 'countdown') return
    if (countSec <= 0) return
    const id = setTimeout(() => setCountSec(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [step, countSec])

  useEffect(() => {
    if (step !== 'rest') return
    if (restSec <= 0) return
    const id = setTimeout(() => setRestSec(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [step, restSec])

  useEffect(() => {
    if (step !== 'running' && step !== 'rest') return
    const id = setTimeout(() => setWorkoutSec(s => s + 1), 1000)
    return () => clearTimeout(id)
  }, [step, workoutSec])

  useEffect(() => {
    if (step !== 'timer' || !timerRunning) return
    if (timerSec <= 0) { setTimerRunning(false); return }
    const id = setTimeout(() => setTimerSec(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [step, timerRunning, timerSec])

  // ─── Transition handlers ────────────────────────────────────
  function handleAddDropSet() {
    setDropSetForms(prev => [...prev, { weight: '', reps: '' }])
  }

  function updateDropSetForm(idx, field, value) {
    setDropSetForms(prev => prev.map((ds, i) => i === idx ? { ...ds, [field]: value } : ds))
  }

  function handleNextSet() {
    const allSets = [
      { weight, reps, isDrop: false },
      ...dropSetForms.map(ds => ({ weight: ds.weight, reps: ds.reps, isDrop: true })),
    ]
    setLoggedSets(prev => [...prev, ...allSets])
    setWeight(''); setReps('')
    setDropSetForms([])
    const nextSet = setIdx + 1
    if (nextSet < totalSets) {
      setSetIdx(nextSet)
      setRestType('set'); setRestSec(10); setRestTotal(10); setStep('rest')
    } else {
      doNextExercise()
    }
  }

  function doNextExercise() {
    setLoggedSets([]); setWeight(''); setReps(''); setSetIdx(0); setDropSetForms([])
    if (isSupersetItem && subIdx === 0) {
      setSubIdx(1)
      return
    }
    setSubIdx(0)
    const nextIdx = itemIdx + 1
    if (nextIdx >= DEMO_WORKOUT.items.length) {
      setStep('done')
    } else {
      setItemIdx(nextIdx)
      setRestType('exercise'); setRestSec(15); setRestTotal(15); setStep('rest')
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function resetAll() {
    setStep('calendar')
    setItemIdx(0); setSubIdx(0); setSetIdx(0)
    setLoggedSets([]); setWeight(''); setReps('')
    setCountSec(10); setRestSec(10); setRestTotal(10); setWorkoutSec(0); setDropSetForms([])
    setTimerSec(60); setTimerTotal(60); setTimerRunning(false)
  }

  function getNextUpText() {
    if (restType === 'set') return `Set ${setIdx + 1} of ${totalSets} · ${currentEx?.name}`
    return currentEx?.name ?? 'Next Exercise'
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <PhoneFrame smokeVariant="shader">

      {/* ══ CALENDAR (+ CHOICE scrim) ══ */}
      {(step === 'calendar' || step === 'choice') && (
        <>
          {/* Glass slab header */}
          <NavBar>
            <StatusBar />
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Top bar */}
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ ...iconBtnSt, cursor: 'default' }}><MenuIcon /></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ ...TT, fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Calendar</span>
                  <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>May 2026</span>
                </div>
                <div style={{ ...iconBtnSt, cursor: 'default' }}><SettingsIcon /></div>
              </div>
              {/* Date row */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                {DATES.map(({ weekday, day, state }) => (
                  <DateCell key={weekday} weekday={weekday} day={day} state={state} />
                ))}
              </div>
            </div>
          </NavBar>

          {/* Schedule section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 16px', overflow: 'hidden' }}>
            {/* Schedule header with tappable FAB */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ ...TT, fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Schedule</span>
                <span style={{ ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.60 }}>Thursday, May 14</span>
              </div>
              <button
                onClick={step === 'calendar' ? () => setStep('choice') : undefined}
                style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-xl)',
                  background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: step === 'calendar' ? 'pointer' : 'default', padding: 0,
                }}
              >
                <PlusIcon />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
              {TASKS.map(task => <TaskItem key={task.title} {...task} />)}
            </div>
          </div>
        </>
      )}

      {/* ══ CHOICE BOTTOM SHEET ══ */}
      {step === 'choice' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(var(--cs-shadow-rgb),0.55)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div style={{
            background: 'var(--glass-popover)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px 20px 0 0',
            borderTop: '1px solid rgba(var(--overlay-rgb),0.07)',
            padding: '16px 16px 44px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.15)', alignSelf: 'center', marginBottom: 4 }} />
            <span style={{ ...TT, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.40, textAlign: 'center', marginBottom: 2 }}>
              Start Workout
            </span>

            {/* Dynamic Workout */}
            <button
              onClick={() => setStep('preview')}
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                background: 'var(--glass-popover)', border: '1px solid rgba(var(--cs-primary-rgb),0.15)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-xl)', flexShrink: 0,
                background: 'rgba(var(--cs-primary-rgb),0.12)', border: '1px solid rgba(var(--cs-primary-rgb),0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BoltIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...TT, fontSize: 15, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Dynamic Workout</div>
                <div style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 2 }}>Start anytime, track as you go</div>
              </div>
              <div style={{ opacity: 0.35, flexShrink: 0 }}><ChevRightIcon /></div>
            </button>

            {/* Create Workout (disabled) */}
            <button
              disabled
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left', cursor: 'not-allowed',
                background: 'var(--glass-popover)', border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: 0.32,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-xl)', flexShrink: 0,
                background: 'rgba(var(--cs-outline-rgb),0.40)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EditSquareIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...TT, fontSize: 15, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Create Workout</div>
                <div style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 2 }}>Plan in advance · Coming soon</div>
              </div>
            </button>

            <button
              onClick={() => setStep('calendar')}
              style={{
                alignSelf: 'center', border: 'none', background: 'transparent',
                ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface-variant)',
                opacity: 0.50, cursor: 'pointer', padding: '8px 24px', marginTop: 2,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══ PREVIEW ══ */}
      {step === 'preview' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={() => setStep('choice')} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                {DEMO_WORKOUT.title}
              </span>
            </div>
          </NavBar>

          {/* Summary strip */}
          <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {equipmentList.map(eq => (
                <span key={eq} style={{
                  ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)',
                  background: 'rgba(var(--cs-primary-rgb),0.10)', border: '1px solid rgba(var(--cs-primary-rgb),0.20)',
                  borderRadius: 'var(--radius-xl)', padding: '4px 10px',
                }}>{eq}</span>
              ))}
            </div>
            <div style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.50, display: 'flex', gap: 6 }}>
              <span>{flatExCount} exercises</span>
              <span>·</span>
              <span>~{DEMO_WORKOUT.items.length * 8} min</span>
            </div>
          </div>

          {/* Exercise list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_WORKOUT.items.map((item, idx) => {
              if (item.type === 'solo') {
                const ex = DEMO_EXERCISES.find(e => e.id === item.id)
                return (
                  <GlassCard key={idx} level="Low" style={{ display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: 4, flexShrink: 0, background: 'var(--cs-primary)', opacity: 0.50 }} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: THUMB_COLORS[ex?.muscle] ?? thumbTint('--cs-primary-rgb'), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--cs-outline-rgb),0.25)' }}>
                        <SmallBarbellIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex?.name}</div>
                        <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{ex?.muscle} · {ex?.equipment}</div>
                      </div>
                      <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45, flexShrink: 0 }}>{item.sets} sets</span>
                    </div>
                  </GlassCard>
                )
              }
              return (
                <div key={idx} style={{ borderRadius: 'var(--radius-xl)', background: 'rgba(var(--cs-primary-rgb),0.05)', border: '1px solid rgba(var(--cs-primary-rgb),0.18)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--cs-primary)' }} />
                  <div style={{ padding: '8px 14px 6px 14px' }}>
                    <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', color: 'var(--cs-primary)', opacity: 0.80 }}>
                      SUPERSET · {item.sets} sets each
                    </span>
                  </div>
                  {item.ids.map((id, i) => {
                    const ex = DEMO_EXERCISES.find(e => e.id === id)
                    return (
                      <div key={id}>
                        {i > 0 && <div style={{ height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)', marginLeft: 14 }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: THUMB_COLORS[ex?.muscle] ?? thumbTint('--cs-primary-rgb'), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--cs-outline-rgb),0.25)' }}>
                            <SmallBarbellIcon />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{ex?.name}</div>
                            <div style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{ex?.muscle} · {ex?.equipment}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 16px 36px', flexShrink: 0, borderTop: '1px solid rgba(var(--cs-outline-rgb),0.15)' }}>
            <button
              onClick={() => { setCountSec(10); setStep('countdown') }}
              style={{
                width: '100%', height: 52, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
                border: '1px solid rgba(var(--overlay-rgb),0.18)',
                ...TT, fontSize: 15, fontWeight: 500, color: 'var(--cs-on-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)',
              }}
            >
              Start Workout <PlayArrowIcon />
            </button>
          </div>
        </>
      )}

      {/* ══ COUNTDOWN ══ */}
      {step === 'countdown' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={() => setStep('preview')} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                {DEMO_WORKOUT.title}
              </span>
              <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>
                {flatExCount} exercises
              </span>
            </div>
          </NavBar>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 32px 44px' }}>
          <span style={{ ...TT, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>
            Get Ready
          </span>

          <div style={{ position: 'relative', width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="128" height="128" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(var(--cs-primary-rgb),0.08)" strokeWidth="5" />
              <circle cx="64" cy="64" r="58" fill="none" stroke="var(--cs-primary)" strokeWidth="5"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - countSec / 10)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <span style={{ ...TT, fontSize: 60, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>
              {countSec}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>First up</span>
            <span style={{ ...TT, fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center' }}>{firstEx?.name}</span>
            <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}>{firstEx?.muscle} · {firstEx?.equipment}</span>
          </div>

          <button
            onClick={() => setCountSec(0)}
            style={{
              border: 'none', background: 'transparent',
              ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface-variant)',
              opacity: 0.40, cursor: 'pointer', padding: '8px 24px',
            }}
          >
            Skip
          </button>
        </div>
        </>
      )}

      {/* ══ RUNNING ══ */}
      {step === 'running' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={resetAll} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                {DEMO_WORKOUT.title}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)', opacity: 0.75, letterSpacing: '0.02em' }}>
                  {formatTime(workoutSec)}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                  Set {setIdx + 1}/{totalSets}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                  {doneExCount + 1}/{flatExCount}
                </span>
              </div>
            </div>
          </NavBar>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {isSupersetItem && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', color: 'var(--cs-primary)', opacity: 0.80 }}>SUPERSET</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(var(--cs-primary-rgb),0.10)' }} />
                <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>
                  with {DEMO_EXERCISES.find(e => e.id === currentItem.ids[subIdx === 0 ? 1 : 0])?.name}
                </span>
              </div>
            )}

            <GlassCard level="Low" style={{ display: 'flex', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ width: 4, flexShrink: 0, background: 'var(--cs-primary)' }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: THUMB_COLORS[currentEx?.muscle] ?? thumbTint('--cs-primary-rgb'), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--cs-outline-rgb),0.25)' }}>
                  <SmallBarbellIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...TT, fontSize: 16, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentEx?.name}</div>
                  <div style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.50, marginTop: 2 }}>{currentEx?.muscle} · {currentEx?.equipment}</div>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: DIFF_COLORS[currentEx?.difficulty] ?? 'var(--cs-on-surface-variant)', flexShrink: 0 }} />
              </div>
            </GlassCard>

            {loggedSets.length > 0 && (
              <div>
                <span style={{ ...TT, fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.30 }}>Previous Sets</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {loggedSets.map((s, i) => {
                    const mainCount = loggedSets.slice(0, i + 1).filter(x => !x.isDrop).length
                    const label = s.isDrop ? 'DS' : String(mainCount)
                    return (
                      <div key={i} style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface-variant)', background: s.isDrop ? 'rgba(var(--cs-primary-rgb),0.06)' : 'rgba(var(--overlay-rgb),0.04)', border: `1px solid ${s.isDrop ? 'rgba(var(--cs-primary-rgb),0.16)' : 'rgba(var(--overlay-rgb),0.07)'}`, borderRadius: 'var(--radius-xl)', padding: '5px 10px' }}>
                        {label}. {s.weight || '—'} {weightUnit} × {s.reps || '—'} {repsUnit}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <span style={{ ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
              Set {setIdx + 1} of {totalSets}
            </span>

            {/* Weight × Reps inputs — side by side, labels above */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

              {/* Weight */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                <button
                  onClick={() => setUnitPicker(unitPicker === 'weight' ? null : 'weight')}
                  style={{ border: 'none', background: 'transparent', ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.50, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  {weightUnit} ▾
                </button>
                <div style={{ width: '100%', height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="number" min="0" placeholder="—" value={weight}
                    onChange={e => setWeight(e.target.value)}
                    style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', ...TT, fontSize: 26, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center', outline: 'none' }}
                  />
                </div>
                {unitPicker === 'weight' && (
                  <div style={{ position: 'absolute', top: 26, left: 0, right: 0, zIndex: 20, background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', overflow: 'hidden' }}>
                    {WEIGHT_UNITS.map(u => (
                      <button key={u} onClick={() => { setWeightUnit(u); setUnitPicker(null) }} style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 14px', textAlign: 'left', ...TT, fontSize: 14, fontWeight: weightUnit === u ? 500 : 400, color: weightUnit === u ? 'var(--cs-primary)' : 'var(--cs-on-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 14, fontSize: 11, color: 'var(--cs-primary)', visibility: weightUnit === u ? 'visible' : 'hidden' }}>✓</span>
                        {u}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setWeight(w => String(Math.max(0, parseFloat(w || 0) - (weightUnit === 'lbs' ? 5 : 2.5))))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>−</button>
                  <button onClick={() => setWeight(w => String(parseFloat(w || 0) + (weightUnit === 'lbs' ? 5 : 2.5)))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>+</button>
                </div>
              </div>

              <span style={{ ...TT, fontSize: 18, color: 'var(--cs-on-surface-variant)', opacity: 0.18, flexShrink: 0, marginTop: 38 }}>×</span>

              {/* Reps */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                <button
                  onClick={() => setUnitPicker(unitPicker === 'reps' ? null : 'reps')}
                  style={{ border: 'none', background: 'transparent', ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.50, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  {repsUnit} ▾
                </button>
                <div style={{ width: '100%', height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="number" min="0" placeholder="—" value={reps}
                    onChange={e => setReps(e.target.value)}
                    style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', ...TT, fontSize: 26, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center', outline: 'none' }}
                  />
                </div>
                {unitPicker === 'reps' && (
                  <div style={{ position: 'absolute', top: 26, left: 0, right: 0, zIndex: 20, background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', overflow: 'hidden' }}>
                    {REPS_UNITS.map(u => (
                      <button key={u} onClick={() => { setRepsUnit(u); setUnitPicker(null) }} style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 14px', textAlign: 'left', ...TT, fontSize: 14, fontWeight: repsUnit === u ? 500 : 400, color: repsUnit === u ? 'var(--cs-primary)' : 'var(--cs-on-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 14, fontSize: 11, color: 'var(--cs-primary)', visibility: repsUnit === u ? 'visible' : 'hidden' }}>✓</span>
                        {u}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setReps(r => String(Math.max(0, parseInt(r || 0) - (repsUnit === 'time' ? 5 : 1))))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>−</button>
                  <button onClick={() => setReps(r => String(parseInt(r || 0) + (repsUnit === 'time' ? 5 : 1)))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>+</button>
                </div>
              </div>
            </div>

            {/* Drop set forms */}
            {dropSetForms.map((ds, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(var(--cs-primary-rgb),0.08)' }} />
                  <span style={{ ...TT, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: 'var(--cs-primary)', opacity: 0.65 }}>
                    DROP SET{dropSetForms.length > 1 ? ` ${idx + 1}` : ''}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(var(--cs-primary-rgb),0.08)' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}>{weightUnit}</span>
                    <div style={{ width: '100%', height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input type="number" min="0" placeholder="—" value={ds.weight} onChange={e => updateDropSetForm(idx, 'weight', e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', ...TT, fontSize: 26, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateDropSetForm(idx, 'weight', String(Math.max(0, parseFloat(ds.weight || 0) - (weightUnit === 'lbs' ? 5 : 2.5))))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>−</button>
                      <button onClick={() => updateDropSetForm(idx, 'weight', String(parseFloat(ds.weight || 0) + (weightUnit === 'lbs' ? 5 : 2.5)))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>+</button>
                    </div>
                  </div>
                  <span style={{ ...TT, fontSize: 18, color: 'var(--cs-on-surface-variant)', opacity: 0.18, flexShrink: 0, marginTop: 38 }}>×</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}>{repsUnit}</span>
                    <div style={{ width: '100%', height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input type="number" min="0" placeholder="—" value={ds.reps} onChange={e => updateDropSetForm(idx, 'reps', e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', ...TT, fontSize: 26, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateDropSetForm(idx, 'reps', String(Math.max(0, parseInt(ds.reps || 0) - (repsUnit === 'time' ? 5 : 1))))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>−</button>
                      <button onClick={() => updateDropSetForm(idx, 'reps', String(parseInt(ds.reps || 0) + (repsUnit === 'time' ? 5 : 1)))} style={{ ...adjustBtnSt, flex: 1, width: 'auto' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddDropSet}
              style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.40, cursor: 'pointer', padding: '2px 0' }}
            >
              + Add Drop Set
            </button>
          </div>

          <div style={{ padding: '12px 16px 36px', flexShrink: 0, display: 'flex', gap: 10, borderTop: '1px solid rgba(var(--cs-outline-rgb),0.15)' }}>
            <button
              onClick={handleNextSet}
              style={{
                flex: 1, height: 50, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                background: hasInput ? 'rgba(var(--cs-primary-rgb),0.12)' : 'rgba(var(--overlay-rgb),0.04)',
                border: hasInput ? '1px solid rgba(var(--cs-primary-rgb),0.28)' : '1px solid rgba(var(--overlay-rgb),0.07)',
                ...TT, fontSize: 14, fontWeight: 500,
                color: hasInput ? 'var(--cs-primary)' : 'rgba(var(--overlay-rgb),0.18)',
                transition: 'all 0.20s',
              }}
            >
              Next Set
            </button>
            <button
              onClick={doNextExercise}
              style={{
                flex: 1, height: 50, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                background: hasInput
                  ? 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)'
                  : 'rgba(var(--overlay-rgb),0.04)',
                border: hasInput ? '1px solid rgba(var(--overlay-rgb),0.18)' : '1px solid rgba(var(--overlay-rgb),0.07)',
                ...TT, fontSize: 14, fontWeight: 500,
                color: hasInput ? 'var(--cs-on-primary)' : 'rgba(var(--overlay-rgb),0.18)',
                transition: 'all 0.20s',
                boxShadow: hasInput ? 'inset 0 1px 0 rgba(var(--raise-rgb),0.22)' : 'none',
              }}
            >
              Next Exercise
            </button>
          </div>
        </>
      )}

      {/* ══ REST ══ */}
      {step === 'rest' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={resetAll} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                {DEMO_WORKOUT.title}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)', opacity: 0.75, letterSpacing: '0.02em' }}>
                  {formatTime(workoutSec)}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                  Set {setIdx + 1}/{totalSets}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                  {doneExCount + 1}/{flatExCount}
                </span>
              </div>
            </div>
          </NavBar>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 32px 36px' }}>
            <span style={{ ...TT, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.35 }}>
              {restType === 'set' ? 'Rest between sets' : 'Rest between exercises'}
            </span>

            <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="160" height="160" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(var(--cs-primary-rgb),0.08)" strokeWidth="7" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--cs-primary)" strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - restSec / restTotal)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ ...TT, fontSize: 60, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>{restSec}</span>
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.35 }}>sec</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.35 }}>Next up</span>
              <span style={{ ...TT, fontSize: 16, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center' }}>{getNextUpText()}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => setStep('running')}
                style={{
                  flex: 1, height: 50, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  background: 'transparent', border: '1px solid rgba(var(--overlay-rgb),0.10)',
                  ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.55,
                }}
              >
                Skip Rest
              </button>
              <button
                onClick={() => { setRestSec(s => s + 15); setRestTotal(t => t + 15) }}
                style={{
                  flex: 1, height: 50, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  background: 'rgba(var(--cs-primary-rgb),0.08)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)',
                  ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-primary)',
                }}
              >
                + 15s
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══ DONE ══ */}
      {step === 'done' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={resetAll} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
                {DEMO_WORKOUT.title}
              </span>
              <span style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)', opacity: 0.75 }}>
                {formatTime(workoutSec)}
              </span>
            </div>
          </NavBar>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 40px', gap: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(var(--cs-primary-rgb),0.10)', border: '1px solid rgba(var(--cs-primary-rgb),0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrophyIcon />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ ...TT, fontSize: 24, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Workout Complete!</span>
              <span style={{ ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.50 }}>{DEMO_WORKOUT.title}</span>
            </div>
            <GlassCard level="Low" style={{ width: '100%', overflow: 'hidden' }}>
              {[
                { label: 'Duration',    value: '~24 min'    },
                { label: 'Exercises',   value: flatExCount  },
                { label: 'Total Sets',  value: totalStats   },
              ].map(({ label, value }, i) => (
                <div key={label}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', marginLeft: 20 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px' }}>
                    <span style={{ ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{label}</span>
                    <span style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span>
                  </div>
                </div>
              ))}
            </GlassCard>
            <button
              onClick={resetAll}
              style={{
                width: '100%', height: 52, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                background: 'rgba(var(--cs-primary-rgb),0.10)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)',
                ...TT, fontSize: 15, fontWeight: 500, color: 'var(--cs-primary)',
              }}
            >
              Back to Calendar
            </button>
          </div>
        </>
      )}

      {/* ══ TIMER ══ */}
      {step === 'timer' && (
        <>
          <NavBar>
            <StatusBar />
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
              <button onClick={resetAll} style={iconBtnSt}><ChevLeftIcon /></button>
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Timer</span>
            </div>
          </NavBar>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 32px 48px' }}>

            {/* Circular timer */}
            <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="200" height="200" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(var(--cs-primary-rgb),0.07)" strokeWidth="8" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="var(--cs-primary)" strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - timerSec / timerTotal)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ ...TT, fontSize: 52, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {formatTime(timerSec)}
                </span>
                <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.30 }}>
                  {timerRunning ? 'running' : timerSec === 0 ? 'done' : 'paused'}
                </span>
              </div>
            </div>

            {/* Quick duration presets */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[60, 120, 180, 300].map(sec => (
                <button
                  key={sec}
                  onClick={() => { setTimerSec(sec); setTimerTotal(sec); setTimerRunning(false) }}
                  style={{
                    ...TT, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    padding: '6px 12px', borderRadius: 'var(--radius-xl)',
                    background: timerTotal === sec ? 'rgba(var(--cs-primary-rgb),0.14)' : 'rgba(var(--overlay-rgb),0.04)',
                    border: timerTotal === sec ? '1px solid rgba(var(--cs-primary-rgb),0.30)' : '1px solid rgba(var(--overlay-rgb),0.07)',
                    color: timerTotal === sec ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
                  }}
                >
                  {sec < 60 ? `${sec}s` : `${sec / 60}min`}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => { setTimerSec(timerTotal); setTimerRunning(false) }}
                style={{
                  width: 50, height: 50, flexShrink: 0, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <ResetIcon />
              </button>
              <button
                onClick={() => setTimerRunning(r => !r)}
                style={{
                  flex: 1, height: 50, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  background: timerRunning
                    ? 'rgba(var(--cs-primary-rgb),0.10)'
                    : 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
                  border: timerRunning ? '1px solid rgba(var(--cs-primary-rgb),0.22)' : '1px solid rgba(var(--overlay-rgb),0.18)',
                  ...TT, fontSize: 15, fontWeight: 500,
                  color: timerRunning ? 'var(--cs-primary)' : 'var(--cs-on-primary)',
                  boxShadow: timerRunning ? 'none' : 'inset 0 1px 0 rgba(var(--raise-rgb),0.22)',
                }}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>
        </>
      )}

    </PhoneFrame>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function ChevLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function ChevRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cs-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

function EditSquareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function PlayArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--cs-on-primary)" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}

function SmallBarbellIcon() {
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" fill="none" stroke="rgba(var(--overlay-rgb),0.18)" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1"/>
      <rect x="21.5" y="1" width="4" height="8" rx="1"/>
      <line x1="4.5" y1="5" x2="21.5" y2="5"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cs-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/>
      <line x1="12" y1="17" x2="12" y2="13"/>
      <path d="M7 4H4a1 1 0 0 0-1 1v3a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V5a1 1 0 0 0-1-1h-3"/>
      <path d="M7 4h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5z"/>
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  )
}
