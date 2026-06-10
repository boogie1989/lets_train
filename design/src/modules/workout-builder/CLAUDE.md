# Module: Workout Builder

Create / edit a workout — name it, add exercises (solo or superset), and edit each set inline.

## Files
- `WorkoutBuilderPage.jsx` — playbook wrapper. Variants via `initialStep`: `list`, `list-superset`, `edit-solo`, `edit-superset`.
- `WorkoutBuilderScreen.jsx` — the whole builder (cards + inline editors).
- `index.js` — exports `WorkoutBuilderPage`, `WorkoutBuilderScreen`.

## Structure
- **Header** (`NavBar`): back + primary check (save). Workout name = editable `headline-small` (24/500); stats line `N exercises · N sets · ~N min` (duration estimate: ~40s work per exercise per set + all rests).
- **Exercise cards** — match the Workout Runner preview cards (`GlassCard` + accent strip + thumb + name + `muscle · equipment`). Tap to **expand inline** (animated `grid-template-rows 0fr→1fr`) — no bottom sheet.
  - Header has a **kebab menu (⋮)** → "Change exercise" / "Delete" (red). Card drops `overflow:hidden` while the menu is open so it can escape the clip.
- **Sets editor** (expanded): grid `32px 1fr 10px 1fr 24px` of compact stepper pills `[− value +]`. Each input has its **own unit dropdown above it** (per set AND per drop). Units + step stored per set / per drop (`set.weightUnit`, `d.repsUnit`, …).

## Load units — RPE by default
- Load dropdown options: `rpe · kg · lbs · time`. **Default is `rpe`** (prescription by effort); weight is the opt-in via the dropdown. Reps dropdown unchanged (`reps · failure · time`).
- Steps: rpe → 0.5 (clamped to max 10 via `wMax`), kg → 2.5, lbs/time → 5.
- Collapsed-card summary is unit-aware: `RPE 7.5–9 · 6–8 reps` or `20–25 kg · 10–12 reps`; uses the first set's unit, ignores sets logged in other units. `Bodyweight` only for zero weight-unit sets.
- New drop inherits the parent unit; in rpe a drop goes **up** toward 10 (`min(10, last+0.5)`), in weight units it goes down (`last−5`).

## Rest controls
- **`RestChip`** — chip `⏱ 1:30`; tap morphs it in place into the stepper language of the screen: `[− ⏱ 1:30 +]`, ±15s, range 0–600s. Tap the time to collapse. `0` renders as `No rest` (dimmed). `fmtRest`: `45s` / `1:30` / `2 min`. Geometry matches the `StepperInput` pills: `radius-xl` (NOT a 999 pill), height 36 collapsed / 40 expanded, same 34px step buttons.
- **`RestDivider`** — the row `REST ——— [⏱ 1:30]`: micro-label (10/700/0.06em, same recipe as the SUPERSET label but muted 0.45) left, hairline fills, chip flush **right** (the screen's control column).
- The `REST` label shows on **every** divider (between sets AND between cards) — each control is self-describing on its own.
- **Between sets** — a `RestDivider` in each gap between set groups. One value per exercise (`item.restSet`, default 90s) — editing any divider updates all of them. In supersets the divider sits between **rounds**; within a round there is no rest by definition.
- **Between exercises** — `RestDivider`; `item.restAfter` on the card above, default 120s. No divider after the last card.

## Set / drop markers (connector line, left column)
- **① circled number** — the set (always circled, even without drops).
- **○ hollow ring** (13px, border matches the numbered circle) — a main working set (used in supersets to mark each exercise's main row).
- **• filled dot** (7px accent) — a drop set.
- Nodes use `position:relative; zIndex:1` + opaque centre so the connector line never shows through them.

## Drop sets
Up to **3 per set** (`MAX_DROPS`); the `+ drop set` link hides at 3. Stored as `set.ds: [{weight, reps, weightUnit?, repsUnit?}]`. Supersets: drops live per exercise (`set[exId].ds`).

## Superset editor
Outer grid `32px 1fr`: col1 = circled number + connector line bracketing the round; col2 = one labelled stepper block per exercise (name centred-ish, own steppers, own drops). Exercises are grouped under one set number.

## Data shape
`item = { id, type:'solo'|'superset', exerciseId | exerciseIds, restSet?, restAfter?, sets:[…] }`. Solo set `{weight, reps, weightUnit?, repsUnit?, ds?}`; superset set `{ [exId]: {weight, reps, …, ds?} }`. `weight` holds the load value in whatever `weightUnit` says (RPE score when unit is `rpe`); missing `weightUnit` means `rpe`. `restSet`/`restAfter` are seconds.

## Open threads
`onEdit` (Change exercise) is a stub (`editItem`) — wire it to the Exercises search/picker when connected.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `GlassCard`. Icons + steppers are local.
