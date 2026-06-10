# Module: Workout Builder

Create / edit a workout — name it, add exercises (solo or superset), and edit each set inline.

## Files
- `WorkoutBuilderPage.jsx` — playbook wrapper. Variants via `initialStep`: `list`, `list-superset`, `edit-solo`, `edit-superset`.
- `WorkoutBuilderScreen.jsx` — the whole builder (cards + inline editors).
- `index.js` — exports `WorkoutBuilderPage`, `WorkoutBuilderScreen`.

## Structure
- **Header** (`NavBar`): back + primary check (save). Workout name = editable `headline-small` (24/500); stats line `N exercises · N sets · ~N min` (duration estimate: ~40s work per exercise per set + all rests).
- **Exercise cards** — match the Workout Runner preview cards (`GlassCard` + accent strip + thumb + name + `muscle · equipment`). Tap to **expand inline** (animated `grid-template-rows 0fr→1fr`) — no bottom sheet. Card list gap 16.
  - Header has a **kebab menu (⋮)** (shared `DropdownMenu` with `onOpenChange` + `triggerStyle`) → "Change exercise" / "Delete" (red). The trigger is a **ghost** (`kebabTriggerSt`): no box/border, chevron-weight opacity 0.45, subtle bg only while open. While the menu is open the card drops `overflow:hidden` AND raises `zIndex:30` — glass cards each create a stacking context (backdrop-filter), so without the raise the next card in DOM paints OVER the open menu ("transparent menu" bug). The accent strip carries its own left border-radius so corners stay clean. The menu is the ONLY home for destructive actions — there is no "Remove exercise" link in the expanded editor.
  - Headers are `div`s with `onClick` (not `<button>`) so the kebab isn't a nested button; the kebab wrapper stops propagation.
- **Sets editor** (expanded): grid `32px 1fr 10px 1fr 24px` of compact stepper pills `[− value +]`. Each input has its **own unit dropdown above it** (per set AND per drop). Units + step stored per set / per drop (`set.weightUnit`, `d.repsUnit`, …).

## Load units — RPE by default
- Load dropdown options: `rpe · kg · lbs · time`. **Default is `rpe`** (prescription by effort); weight is the opt-in via the dropdown. Reps dropdown unchanged (`reps · failure · time`).
- Steps: rpe → 0.5 (clamped to max 10 via `wMax`), kg → 2.5, lbs/time → 5.
- Collapsed-card summary is unit-aware: `RPE 7.5–9 · 6–8 reps` or `20–25 kg · 10–12 reps`; uses the first set's unit, ignores sets logged in other units. `Bodyweight` only for zero weight-unit sets.
- New drop inherits the parent unit; in rpe a drop goes **up** toward 10 (`min(10, last+0.5)`), in weight units it goes down (`last−5`).

## Rest (display-only for now)
- **`RestDivider`** — a quiet centered divider: hairline · `⏱ 1:30` · hairline. A small clock icon (11px, opacity 0.40) replaces the text label; value = 11/600 at 0.70, gap 5; hairlines at overlay 0.05. **Not editable yet** — editing UX is TBD; rest stays a divider so it never competes with the set inputs. `fmtRest`: `45s` / `1:30` / `2 min`; `0` → `No rest`.
- **Between sets** — a `RestDivider` in each gap between set groups (`item.restSet`, sec, uniform per exercise, default 90). In supersets it sits between **rounds**; within a round there is no rest by definition.
- **Between exercise cards** — the same `RestDivider` (`item.restAfter` on the card above, default 120s). Nothing after the last card.

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
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `GlassCard`, `DropdownMenu`. Icons + steppers are local.
