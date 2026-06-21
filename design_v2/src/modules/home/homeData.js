// Home concepts share ONE derived "today" snapshot, taken from the Calendar's
// deterministic model so the three reimagined layouts show identical real data.
import {
  initMonth, TODAY, WEEKDAY_FULL, dateLabel,
  computeDayStats, computeNut, computeDayLoad, isDone,
  readinessScore, readinessTier,
} from '../calendar/calendarModel.js'

const month = initMonth()
export const day = month[TODAY]
export const items = day.items
export const workouts = items.filter(i => i.kind === 'workout')
export const meals = items.filter(i => i.kind === 'meal')

// the action the home screen is built around: the next not-yet-done workout
export const nextWorkout = workouts.find(w => !isDone(w)) ?? workouts[workouts.length - 1]

export const stats = computeDayStats(items)   // { wTotal, wDone, exercises, mTotal, mDone }
export const nut = computeNut(items)          // { kcal, goal, p/c/f (+goals) }
export const load = computeDayLoad(items)     // { tonnage, au, minutes, setsMeasured, hardSets } | null

// today readiness is an interactive check-in in the model (null at start); the
// home mocks show a filled-in value so the concept reads as "morning, checked in".
export const readiness = { sleep: 4, soreness: 3, energy: 4 }
export const readinessPct = Math.round(((readiness.sleep + (6 - readiness.soreness) + readiness.energy) / 15) * 100) // 0–100
export const score = readinessScore(readiness)     // 0–10
export const tier = readinessTier(score)           // Good / Okay / Rough

// recovery hours — demo only (no sleep tracking in the model yet)
export const recoveryHours = 7.2

// week trend — demo aggregates (weekly load lives on a future Trends screen; here
// it is a mocked sparkline so the "input → progress" gap is visibly addressed).
export const weekTonnage = [6.2, 0, 9.1, 7.9, 0, 8.4, 5.4]  // tonnes per weekday (Sun→Sat)
export const weekTonnageTotal = weekTonnage.reduce((s, v) => s + v, 0)  // 37.0 t
export const weekTrendPct = 12   // ↗ vs previous week
export const weekSessions = 12

export { TODAY, WEEKDAY_FULL, dateLabel, isDone }
