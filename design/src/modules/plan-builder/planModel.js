// Plan data model + pure helpers — the operations needed to build a plan.
// Library content (workouts / meals) is the source of truth for names + macros.
import workoutsConfig from '../libraries/configs/workouts.jsx'
import mealsConfig from '../libraries/configs/meals.jsx'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const GOALS = ['Strength', 'Hypertrophy', 'Fat loss', 'Endurance']
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
export const WEEK_PRESETS = [4, 6, 8, 12]
export const MAX_WEEKS = 24

export const WORKOUTS = workoutsConfig.data
export const MEALS = mealsConfig.data
export const getWorkout = id => WORKOUTS.find(w => w.id === id)
export const getMeal = id => MEALS.find(m => m.id === id)

// colour-code a day cell by the workout's focus — channel triplets so the
// consumer composes rgba(var(<ch>), α) for solids/tints (theme-adaptive).
export const FOCUS_COLORS = {
  'Full body': '--cs-tertiary-rgb', Upper: '--cat-blue-rgb', Lower: '--cat-amber-rgb', Push: '--cat-pink-rgb', Pull: '--cat-violet-rgb', Core: '--cat-cyan-rgb',
}
// cell.items is a single ordered list mixing workouts + meals: { type:'workout'|'meal', id }
export const cellWorkouts = cell => cell.items.filter(i => i.type === 'workout')
export const cellHasMeals = cell => cell.items.some(i => i.type === 'meal')
export function cellInfo(cell) {
  const ws = cellWorkouts(cell)
  if (!ws.length) return null
  const w = getWorkout(ws[0].id)
  if (!w) return null
  return { name: w.name, focus: w.focus, color: FOCUS_COLORS[w.focus] ?? '--cs-primary-rgb', extra: ws.length - 1 }
}

// ── factories ────────────────────────────────────────────────────────────────
const emptyCell = () => ({ items: [] })
const emptyWeek = () => Array.from({ length: 7 }, emptyCell)
const cloneWeek = wk => wk.map(c => ({ items: c.items.map(i => ({ ...i })) }))

export function emptyPlan() {
  return {
    name: '', description: '', goal: 'Strength', level: 'Beginner', weeks: 4, tags: [],
    schedule: Array.from({ length: 4 }, emptyWeek),  // [week][Mon..Sun] → { workouts, meals }
  }
}

// ── plan meta ──────────────────────────────────────────────────────────────
export const setName = (plan, name) => ({ ...plan, name })
export const setDescription = (plan, description) => ({ ...plan, description })
export const setGoal = (plan, goal) => ({ ...plan, goal })
export const setLevel = (plan, level) => ({ ...plan, level })
export function setDurationWeeks(plan, n) {
  n = Math.max(1, Math.min(MAX_WEEKS, n))
  const schedule = Array.from({ length: n }, (_, w) => (plan.schedule[w] ? cloneWeek(plan.schedule[w]) : emptyWeek()))
  return { ...plan, weeks: n, schedule }
}

// ── cell helpers (each cell = a week × day, holds workouts + meals) ──────────
const mapCell = (plan, w, d, fn) => ({
  ...plan,
  schedule: plan.schedule.map((week, wi) => wi !== w ? week : week.map((cell, di) => di !== d ? cell : fn(cell))),
})
const move = (arr, from, to) => {
  if (to < 0 || to >= arr.length || from === to) return arr
  const next = [...arr]
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}

// unified items (workouts + meals share one ordered list, reorderable together)
const hasItem = (c, type, id) => c.items.some(i => i.type === type && i.id === id)
export const addWorkoutToDay = (plan, w, d, id) => mapCell(plan, w, d, c => hasItem(c, 'workout', id) ? c : ({ items: [...c.items, { type: 'workout', id }] }))
export const addMealToDay = (plan, w, d, id) => mapCell(plan, w, d, c => hasItem(c, 'meal', id) ? c : ({ items: [...c.items, { type: 'meal', id }] }))
export const removeFromDay = (plan, w, d, type, id) => mapCell(plan, w, d, c => ({ items: c.items.filter(i => !(i.type === type && i.id === id)) }))
export const moveItem = (plan, w, d, from, to) => mapCell(plan, w, d, c => ({ items: move(c.items, from, to) }))

export const getCell = (plan, w, d) => plan.schedule[w]?.[d] ?? emptyCell()
export function computeDayNutrition(plan, w, d) {
  return getCell(plan, w, d).items.reduce((a, it) => {
    if (it.type !== 'meal') return a
    const m = getMeal(it.id)
    if (m) { a.kcal += m.kcal; a.p += m.p; a.c += m.c; a.f += m.f }
    return a
  }, { kcal: 0, p: 0, c: 0, f: 0 })
}

// week-level
export const duplicateWeek = (plan, from, to) => ({ ...plan, schedule: plan.schedule.map((wk, wi) => wi !== to ? wk : cloneWeek(plan.schedule[from])) })
export const copyWeekToAll = (plan, from) => ({ ...plan, schedule: plan.schedule.map(() => cloneWeek(plan.schedule[from])) })
export const clearWeek = (plan, w) => ({ ...plan, schedule: plan.schedule.map((wk, wi) => wi !== w ? wk : emptyWeek()) })

// ── day-level bulk ops ───────────────────────────────────────────────────────
// merge a source day's items into a cell, skipping items already present (no dupes)
const mergeInto = (cell, src) => {
  const has = (t, id) => cell.items.some(i => i.type === t && i.id === id)
  const add = src.filter(i => !has(i.type, i.id)).map(i => ({ ...i }))
  return add.length ? { items: [...cell.items, ...add] } : cell
}
export const clearDay = (plan, w, d) => mapCell(plan, w, d, () => emptyCell())
// copy a day's items to the same weekday in every other week
export function copyDayToAllWeeks(plan, w, d) {
  const src = getCell(plan, w, d).items
  if (!src.length) return plan
  return { ...plan, schedule: plan.schedule.map((wk, wi) => wk.map((cell, di) => (di === d && wi !== w) ? mergeInto(cell, src) : cell)) }
}
// copy a day's items to an explicit set of target cells [{week, day}, …]
export function copyDayToCells(plan, w, d, targets) {
  const src = getCell(plan, w, d).items
  if (!src.length || !targets?.length) return plan
  const set = new Set(targets.map(t => `${t.week}:${t.day}`))
  return { ...plan, schedule: plan.schedule.map((wk, wi) => wk.map((cell, di) => set.has(`${wi}:${di}`) ? mergeInto(cell, src) : cell)) }
}

// ── derived / lifecycle ──────────────────────────────────────────────────────
export function computePlanStats(plan) {
  let totalSessions = 0
  const mealKcals = []
  plan.schedule.forEach(week => week.forEach(c => {
    if (cellWorkouts(c).length) totalSessions++
    const mealItems = c.items.filter(i => i.type === 'meal')
    if (mealItems.length) mealKcals.push(mealItems.reduce((s, i) => s + (getMeal(i.id)?.kcal ?? 0), 0))
  }))
  const sessionsPerWeek = plan.weeks ? Math.round((totalSessions / plan.weeks) * 10) / 10 : 0
  const avgKcalPerDay = mealKcals.length ? Math.round(mealKcals.reduce((a, b) => a + b, 0) / mealKcals.length) : 0
  return { totalSessions, sessionsPerWeek, avgKcalPerDay }
}
export const validatePlan = plan => plan.name.trim().length > 0 && plan.schedule.some(w => w.some(c => cellWorkouts(c).length > 0))
export function serializePlan(plan) {
  const { sessionsPerWeek } = computePlanStats(plan)
  return { name: plan.name, weeks: plan.weeks, daysPerWeek: Math.round(sessionsPerWeek), level: plan.level, goal: plan.goal, schedule: plan.schedule }
}

// ── a populated demo plan for the playbook ───────────────────────────────────
export function demoPlan() {
  let p = emptyPlan()
  p = { ...p, name: 'Push / Pull / Legs', description: 'Hypertrophy block — 3 sessions a week, progressive overload.', goal: 'Hypertrophy', level: 'Intermediate' }
  p = setDurationWeeks(p, 6)
  for (let w = 0; w < p.weeks; w++) {
    p = addWorkoutToDay(p, w, 0, 2) // Mon · Push Power
    p = addWorkoutToDay(p, w, 2, 3) // Wed · Pull Day
    p = addWorkoutToDay(p, w, 4, 1) // Fri · Leg Day
  }
  // Week 1 · Mon — a workout + meals share the day's list
  ;[6, 2, 3, 4].forEach(id => { p = addMealToDay(p, 0, 0, id) })
  return p
}
