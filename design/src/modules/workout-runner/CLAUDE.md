# Module: Workout Runner

The "do the workout" flow — from picking a workout through logging sets, rests, and completion. A single-screen **state machine**.

## Files
- `WorkoutRunnerPage.jsx` — playbook wrapper. Renders one `<WorkoutRunnerScreen initialStep={id} />` per step.
- `WorkoutRunnerScreen.jsx` — the whole flow; `step` state drives which view renders.
- `index.js` — exports `WorkoutRunnerPage`, `WorkoutRunnerScreen`.

## Steps (`initialStep` / internal `step`)
`calendar` → `choice` (bottom sheet: Dynamic / Create) → `preview` (exercise list + Start) → `countdown` (10s ring) → `running` (log weight×reps, drop sets) → `rest` (timer ring, Skip / +15s) → `done` (summary) · plus standalone `timer`.

Playbook shows: Choice, Preview, Countdown, Running, Rest, Timer, Done.

## Key UI
- Reuses the Calendar glass slab + `DateCell` + `TaskItem` on the `calendar` step (this IS the calendar view).
- **Weight/reps input** (running): unit label-dropdown above (`kg/lbs/time`, `reps/failure/time`) + big 52px input + `−/+` row below. This is the canonical input the Workout Builder mirrors compactly.
- Circular progress rings for countdown/rest/timer.
- Icon buttons: shared glass recipe, 44 in-flow (border 0.5 + `--shadow-card`).
- Primary action button: `var(--cs-primary)` + top-light gradient + inner highlight + slate glow.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `SurfaceContainer`, `DateCell`, `TaskItem`. Icons are local to the screen.

## Scope
Static/mock timers (driven by `useEffect` setTimeout). Slate accent, dark only.
