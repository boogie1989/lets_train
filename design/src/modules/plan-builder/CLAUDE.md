# Module: Plan Builder

Create / edit a multi-week training plan — set its length in weeks and lay **workouts + meals per day** across a **weeks × Mon–Sun grid**. Tapping a day expands an **inline panel** under that week's row. Reuses the Libraries picker (workouts/meals) and the Libraries preview screens.

## Files
- `PlanBuilderScreen.jsx` — the builder. No Schedule/Nutrition tabs. `initialStep` drives playbook variants: `plan` · `day` (a day expanded) · `picker` (add overlay) · `preview` (item preview overlay) · `empty`.
- `WeekGrid.jsx` — the grid (day-of-week header + **one row per week**) **plus the inline `DayPanel`**. A `DayCell` shows the first workout's focus abbrev/colour, a green dot when the day has meals, and an outline ring when expanded. The `DayPanel` (rendered under the active week row) has a header (`Monday · Week 1` + a **⋮ day-actions button** → `on.dayMenu(w,d)`) then **Workouts**/**Meals** rows (grip-drag reorder · tap → preview · `×` remove) + dashed "Add" buttons.
- **Day-actions menu** (`PlanBuilderScreen`, bottom sheet opened from the ⋮): *Copy to every \<weekday\>* · *Copy to next week* · *Copy to specific days…* (opens `CopyTargetsSheet` — a weeks×days grid; tap a day to toggle it as a target, re-tap to remove; the source day is marked "from") · *Clear day* (red → `ConfirmDialog`). Playbook variants: `daymenu`, `copydays`.
- `planModel.js` — **the plan data model + all pure operations** (see below).
- `icons.jsx` — module SVGs.
- `PlanBuilderPage.jsx` — playbook (one phone per variant).

## Data model (`planModel.js`)
```
plan = { name, description, goal, level, weeks:N, tags:[],
         schedule: N × 7 dayCell }     // [week][Mon..Sun]
dayCell = { workouts:number[], meals:number[] }   // workouts:[] = rest; both per cell
```
Workout names + meal macros resolve from the Libraries data (`../libraries/configs/{workouts,meals}.jsx`).

## Plan-building functions (`planModel.js`)
- **Meta:** `setName` · `setDescription` · `setGoal` · `setLevel` · `setDurationWeeks(n)` (grows/trims week rows, preserving data).
- **Workouts (per cell):** `assignWorkout(w,d,id)` · `addWorkoutToDay` · `removeWorkoutFromDay` · `moveWorkout(w,d,from,to)` · `setRestDay` · `getCell`.
- **Meals (per cell):** `addMealToDay(w,d,id)` · `removeMealFromDay` · `moveMeal(w,d,from,to)` · `computeDayNutrition(w,d)`.
- **Week-level:** `duplicateWeek(from,to)` · `copyWeekToAll(from)` · `clearWeek` (all carry workouts + meals).
- **Day-level (via the open-card ⋮ menu):** `clearDay(w,d)` · `copyDayToAllWeeks(w,d)` (same weekday, every other week) · `copyDayToCells(w,d,targets[])` (targets = `[{week,day}]`). Copies **merge** — items already present in a target are skipped (no duplicates).
- **Derived/lifecycle:** `computePlanStats` (sessions, sessions/wk, avg kcal/day) · `validatePlan` (name + ≥1 workout) · `serializePlan` (→ shape compatible with the `plans` library card + schedule).
- Helpers: `cellInfo` (focus name/colour), `demoPlan`/`emptyPlan`, constants `DAYS`, `GOALS`, `LEVELS`, `WEEK_PRESETS`, `FOCUS_COLORS`.

All ops are **pure** (take `plan`, return a new `plan`); the screen holds `plan` in state and pipes through them.

## Reuse
- **Add picker = `LibrariesView`** mounted full-overlay: workouts/meals `mode='multi'`, `lockLibrary` hides the switcher; `onConfirm(ids)` appends to the day, `onClose` dismisses.
- **Item preview = `WorkoutPreviewView` / `MealPreviewView`** (from `../libraries/`) — opened as an overlay when tapping an added workout/meal.
- Shared `Segmented` (`components/Segmented.jsx`) for the Level control; `NavBar`, `GlassCard`, `StatusBar`, `PhoneFrame`, tokens. Details card + week sheet mirror `workout-builder`.
- Control radii match the list tiles (`radius-2xl`); grid day-cells stay at `radius-lg`.

## Scope
Static demo (`demoPlan`). Save is a stub. Workouts + meals are per cell (each week's day is independent — supports progression); week kebab copies a week (workouts + meals) to the next or all weeks. Reorder is drag-and-drop within a day's list.
