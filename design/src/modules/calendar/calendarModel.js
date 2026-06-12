// Calendar demo model — May 2026, today = Wed May 13. Deterministic generation
// (no randomness): every day of the month gets typed items (workout | meal) with
// statuses plus a readiness value, so the week strip, the inline month grid and
// the day summary all derive from one source.
//
// Workout completion NEVER happens from the calendar — it comes from the Workout
// Runner (past/today statuses are pre-baked here "as if after the runner"). The
// calendar's own ops are planning ops: move / delete / note / meal eaten.

export const MONTH_LABEL = 'May 2026'
export const TODAY = 13
export const DAYS_IN_MONTH = 31

// Per-day nutrition goals — consumed values derive from completed meal items.
export const GOALS = { kcal: 2200, p: 150, c: 230, f: 70 }

// Active training plan (mirrors the Plan Builder demo). Items scheduled by the plan
// carry `fromPlan: true` and show the plan name on their card; ad-hoc items don't.
export const PLAN = { name: 'Push / Pull / Legs' }

// Sun–Sat week rows of May 2026 (null = neighbouring month placeholder).
export const WEEKS = [
  [null, null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
  [31, null, null, null, null, null, null],
]
export const weekIndexOf = n => WEEKS.findIndex(w => w.includes(n))

// Neighbouring months for the month-view swipe (ghost grids: numbers only,
// no demo data, not selectable). lead = blanks before day 1 in a Sun-first grid.
export const NEIGHBOR_MONTHS = {
  '-1': { label: 'April 2026', lead: 3, days: 30 },
  1: { label: 'June 2026', lead: 1, days: 30 },
}

export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_FULL = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }
export const weekdayOf = n => WD[(n + 4) % 7]          // May 3 2026 = Sunday
export const dateLabel = n => `May ${n}`
export const tenseOf = n => (n < TODAY ? 'past' : n === TODAY ? 'today' : 'future')

// ── Plan templates ────────────────────────────────────────────────────────────
// fromPlan marks items scheduled by the training plan; the rest are personal
// ad-hoc additions (no plan tag on their cards).
const T = {
  full: [
    { kind: 'workout', title: 'Morning Strength', time: '07:00 AM', exerciseCount: 8, fromPlan: true },
    { kind: 'meal', title: 'Breakfast', time: '08:00 AM', kcal: 560, p: 32, c: 62, f: 22, fromPlan: true },
    { kind: 'workout', title: 'Mobility Training', time: '08:30 AM', exerciseCount: 7 },
    { kind: 'workout', title: 'Leg Day', time: '10:00 AM', exerciseCount: 12, fromPlan: true },
    { kind: 'meal', title: 'Lunch', time: '12:30 PM', kcal: 680, p: 42, c: 75, f: 25, fromPlan: true },
    { kind: 'workout', title: 'Core Workout', time: '03:00 PM', exerciseCount: 10, fromPlan: true },
    { kind: 'workout', title: 'Evening Yoga', time: '06:30 PM', exerciseCount: 5 },
    { kind: 'meal', title: 'Dinner', time: '07:30 PM', kcal: 540, p: 38, c: 55, f: 18, fromPlan: true },
  ],
  light: [
    { kind: 'meal', title: 'Breakfast', time: '08:00 AM', kcal: 520, p: 30, c: 60, f: 18, fromPlan: true },
    { kind: 'workout', title: 'Upper Body', time: '06:00 PM', exerciseCount: 9, fromPlan: true },
    { kind: 'meal', title: 'Dinner', time: '07:30 PM', kcal: 610, p: 45, c: 62, f: 23, fromPlan: true },
  ],
  empty: [],
}
// Weekday → template (Mon/Wed/Fri are training-heavy, Tue/Sat are rest days).
const TEMPLATE_BY_WD = { Sun: 'light', Mon: 'full', Tue: 'empty', Wed: 'full', Thu: 'light', Fri: 'full', Sat: 'empty' }

// ── Deterministic exercise list (shown in the item detail dialog) ─────────────
const EX_POOL = [
  'Back Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Pull-ups', 'Romanian Deadlift', 'Walking Lunges', 'Lat Pulldown', 'Leg Press',
  'Cable Fly', 'Hip Thrust', 'Face Pull', 'Plank', 'Calf Raise', 'Hammer Curl',
]
const makeExercises = (seed, count) => Array.from({ length: count }, (_, i) => ({
  name: EX_POOL[(seed + i * 3) % EX_POOL.length],
  sets: 3 + ((seed + i) % 2),
  reps: 6 + ((seed * 2 + i) % 7),
}))

// Session notes on a few demo items (pro pattern: notes live on the item,
// edited from the detail dialog).
const NOTES = {
  '13:Morning Strength': 'Felt strong — added 2.5 kg on the top sets.',
  '11:Leg Day': 'Knee felt tight on warm-up — capped top sets at RPE 8.',
  '4:Leg Day': 'Short on time — supersetted the accessories.',
}

// ── Deterministic workout result (attached when a workout is completed) ───────
// Raw load components, NOT one magic number: tonnage = external load (only the
// sets logged with weight — setsMeasured tracks coverage), sessionRpe × minutes
// = internal load (sRPE AU), hardSets = unit-agnostic volume.
const makeResult = (n, ec) => {
  const hardSets = ec * 3
  return {
    hardSets,
    setsMeasured: Math.round(hardSets * (0.7 + (n % 3) * 0.1)),
    minutes: ec * 6 + 10,
    sessionRpe: 7 + ((n + ec) % 4) * 0.5,
    tonnage: ec * 460 + n * 37,
  }
}

// ── Readiness — multi-factor check-in { sleep, soreness, energy }, each 1–5 ───
// soreness is inverted in the composite (5 = very sore = bad).
const makeReadiness = n => ({ sleep: 2 + (n % 4), soreness: 1 + ((n * 2) % 5), energy: 2 + ((n + 1) % 4) })

export const readinessScore = r => Math.round(((r.sleep + (6 - r.soreness) + r.energy) / 15) * 10)
export const readinessTier = score => (score >= 7 ? 'Good' : score >= 4 ? 'Okay' : 'Rough')

// ── Month generation ──────────────────────────────────────────────────────────
export function initMonth() {
  const month = {}
  for (let n = 1; n <= DAYS_IN_MONTH; n++) {
    const wd = weekdayOf(n)
    const tense = tenseOf(n)
    let items = T[TEMPLATE_BY_WD[wd]].map((it, i) => ({
      ...it,
      id: `d${n}-${i}`,
      status: 'Planned',
      exercises: it.kind === 'workout' ? makeExercises(n + it.title.length, it.exerciseCount) : undefined,
      note: NOTES[`${n}:${it.title}`],
    }))

    if (tense === 'past') {
      items = items.map(it => ({
        ...it,
        status: 'Completed',
        result: it.kind === 'workout' ? makeResult(n, it.exerciseCount) : undefined,
      }))
      // every third day stays imperfect: last workout missed; some dinners skipped
      if (n % 3 === 1) {
        const li = items.map(it => it.kind).lastIndexOf('workout')
        if (li >= 0) items[li] = { ...items[li], status: 'Planned', result: undefined }
      }
      if (n % 4 === 2) {
        const di = items.findIndex(it => it.title === 'Dinner')
        if (di >= 0) items[di] = { ...items[di], status: 'Planned' }
      }
    }

    if (tense === 'today') {
      const done = ['Morning Strength', 'Breakfast', 'Mobility Training', 'Lunch']
      items = items.map(it => (done.includes(it.title)
        ? { ...it, status: 'Completed', result: it.kind === 'workout' ? makeResult(n, it.exerciseCount) : undefined }
        : it))
    }

    month[n] = {
      n,
      weekday: wd,
      tense,
      items,
      readiness: tense === 'past' ? makeReadiness(n) : null,
    }
  }
  return month
}

// ── Derived helpers ───────────────────────────────────────────────────────────
export const isDone = it => it.status === 'Completed'

export function computeDayStats(items) {
  const workouts = items.filter(t => t.kind === 'workout')
  const meals = items.filter(t => t.kind === 'meal')
  return {
    wTotal: workouts.length,
    wDone: workouts.filter(isDone).length,
    exercises: workouts.reduce((s, t) => s + t.exerciseCount, 0),
    mTotal: meals.length,
    mDone: meals.filter(isDone).length,
  }
}

export function computeNut(items) {
  const eaten = items.filter(t => t.kind === 'meal' && isDone(t))
  const sum = k => eaten.reduce((s, t) => s + t[k], 0)
  return {
    kcal: sum('kcal'), goal: GOALS.kcal,
    p: sum('p'), pGoal: GOALS.p,
    c: sum('c'), cGoal: GOALS.c,
    f: sum('f'), fGoal: GOALS.f,
  }
}

// Day training load — aggregated from completed workouts' results. Two scales on
// purpose (external + internal load are not mergeable into one honest number):
// tonnage (kg, measured sets only) and sRPE AU (sessionRpe × minutes). null when
// nothing is completed yet.
export function computeDayLoad(items) {
  const done = items.filter(t => t.kind === 'workout' && t.result)
  if (!done.length) return null
  const sum = f => done.reduce((s, t) => s + f(t.result), 0)
  return {
    tonnage: sum(r => r.tonnage),
    au: Math.round(sum(r => r.sessionRpe * r.minutes)),
    hardSets: sum(r => r.hardSets),
    setsMeasured: sum(r => r.setsMeasured),
    minutes: sum(r => r.minutes),
  }
}

// Month-grid dot — { kind, tier } or null when the day is empty.
// kind: 'done' (everything checked) | 'missed' (past day with gaps) | 'has'.
// tier 1–3 = per-day intensity from completed sRPE AU (NOT a weekly aggregate —
// trends live on a separate screen); days without completed load stay tier 1.
export function dayDot(day) {
  if (!day.items.length) return null
  const kind = day.items.every(isDone) ? 'done' : day.tense === 'past' ? 'missed' : 'has'
  const load = computeDayLoad(day.items)
  const tier = !load ? 1 : load.au < 600 ? 1 : load.au < 1500 ? 2 : 3
  return { kind, tier }
}

// ── Immutable update helpers (planning ops, id-based) ─────────────────────────
const timeKey = t => {
  const [, h, m, ap] = t.match(/(\d+):(\d+) (AM|PM)/)
  return ((+h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + +m
}
const byTime = (a, b) => timeKey(a.time) - timeKey(b.time)

export const patchDay = (month, n, patch) => ({ ...month, [n]: { ...month[n], ...patch } })

const patchItem = (month, n, id, patch) =>
  patchDay(month, n, { items: month[n].items.map(it => (it.id === id ? { ...it, ...patch } : it)) })

let uid = 0
export const addItem = (month, n, item) => {
  const it = { ...item, id: `u${++uid}` }
  if (it.kind === 'workout' && !it.exercises) it.exercises = makeExercises(n + it.title.length, it.exerciseCount)
  return patchDay(month, n, { items: [...month[n].items, it].sort(byTime) })
}

export const deleteItem = (month, n, id) =>
  patchDay(month, n, { items: month[n].items.filter(it => it.id !== id) })

export const moveItem = (month, fromN, id, toN) => {
  if (fromN === toN) return month
  const item = month[fromN].items.find(it => it.id === id)
  if (!item) return month
  const removed = patchDay(month, fromN, { items: month[fromN].items.filter(it => it.id !== id) })
  return patchDay(removed, toN, { items: [...removed[toN].items, item].sort(byTime) })
}

// Meals only — eating is logged from the calendar; workout completion is not
// (it comes from the Workout Runner).
export const setEaten = (month, n, id, eaten) =>
  patchItem(month, n, id, { status: eaten ? 'Completed' : 'Planned' })

export const setNote = (month, n, id, note) =>
  patchItem(month, n, id, { note: note || undefined })
