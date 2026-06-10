# Module: Workout Builder

Create / edit a workout — name it, add exercises (solo or superset), and edit each set inline.

## Files
- `WorkoutBuilderPage.jsx` — playbook wrapper. Variants via `initialStep`: `list`, `list-superset`, `edit-solo`, `edit-superset`.
- `WorkoutBuilderScreen.jsx` — the whole builder (cards + inline editors).
- `index.js` — exports `WorkoutBuilderPage`, `WorkoutBuilderScreen`.

## Structure
- **Header** (`NavBar`): back + primary check (save). Workout name = editable `headline-small` (24/500); stats line `N exercises · N sets`.
- **Exercise cards** — match the Workout Runner preview cards (`GlassCard` + accent strip + thumb + name + `muscle · equipment`). Tap to **expand inline** (animated `grid-template-rows 0fr→1fr`) — no bottom sheet.
  - Header has a **kebab menu (⋮)** → "Change exercise" / "Delete" (red). Card drops `overflow:hidden` while the menu is open so it can escape the clip.
- **Sets editor** (expanded): grid `32px 1fr 10px 1fr 24px` of compact stepper pills `[− value +]`. Each input has its **own unit dropdown above it** (per set AND per drop), same options/dropdown as Workout Runner. Units + step stored per set / per drop (`set.weightUnit`, `d.repsUnit`, …; lbs/time → step 5).

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
`item = { id, type:'solo'|'superset', exerciseId | exerciseIds, weightUnit?, repsUnit?, sets:[…] }`. Solo set `{weight, reps, weightUnit?, repsUnit?, ds?}`; superset set `{ [exId]: {weight, reps, …, ds?} }`.

## Open threads
`onEdit` (Change exercise) is a stub (`editItem`) — wire it to the Exercises search/picker when connected.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `GlassCard`. Icons + steppers are local.
