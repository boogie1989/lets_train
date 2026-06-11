// Calendar demo model — May 2026, today = Wed May 13. Deterministic generation
// (no randomness): every day of the month gets typed items (workout | meal) with
// statuses plus a readiness value, so the week strip, the inline month grid and
// the day summary all derive from one source.

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

// ── Month generation ──────────────────────────────────────────────────────────
export function initMonth() {
  const month = {}
  for (let n = 1; n <= DAYS_IN_MONTH; n++) {
    const wd = weekdayOf(n)
    const tense = tenseOf(n)
    let items = T[TEMPLATE_BY_WD[wd]].map(it => ({ ...it, status: 'Planned' }))

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
      readiness: tense === 'past' ? ['Good', 'Okay', 'Good', 'Rough'][n % 4] : null,
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

// Month-grid dot: 'done' (everything checked) | 'missed' (past day with gaps)
// | 'has' (items scheduled) | 'none'
export function dayDot(day) {
  if (!day.items.length) return 'none'
  if (day.items.every(isDone)) return 'done'
  if (day.tense === 'past') return 'missed'
  return 'has'
}

// ── Immutable update helpers (screen state ops, item ops are index-based) ─────
export const patchDay = (month, n, patch) => ({ ...month, [n]: { ...month[n], ...patch } })

export const addItem = (month, n, item) =>
  patchDay(month, n, { items: [...month[n].items, item] })

export const toggleItem = (month, n, idx) =>
  patchDay(month, n, {
    items: month[n].items.map((it, i) => (i === idx
      ? (isDone(it)
          ? { ...it, status: 'Planned', result: undefined }
          : { ...it, status: 'Completed', result: it.kind === 'workout' ? makeResult(n, it.exerciseCount) : undefined })
      : it)),
  })
