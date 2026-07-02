# Module: Workout Builder

Create / edit a workout — name it, add exercises (solo or superset), and edit each set inline.

## Files
- `WorkoutBuilderPage.jsx` — playbook wrapper. Variants via `initialStep`: `list`, `list-superset`, `edit-solo`, `edit-superset`.
- `WorkoutBuilderScreen.jsx` — the whole builder (cards + inline editors).
- `index.js` — exports `WorkoutBuilderPage`, `WorkoutBuilderScreen`.

## Structure
- **Header** (`NavBar`): back + primary check (save). Workout name = editable `headline-small` (24/500); stats line `N exercises · N sets · ~N min` (duration estimate: ~40s work per exercise per set + all rests).
- **Exercise cards** — match the Workout Runner preview cards (`SurfaceContainer` + accent strip + thumb + name + `muscle · equipment`). Tap to **expand inline** (animated `grid-template-rows 0fr→1fr`) — no bottom sheet. Card list gap 16.
  - Header has a **kebab menu (⋮)** (shared `DropdownMenu` with `onOpenChange` + `triggerStyle`) → `Change exercise` / **`Set scheme`** (opens `SchemePopover` — 2×2 grid of `3×8 · 4×10 · 5×5 · 5×3`; applying **replaces** the item's sets, values seeded from the last set; works for solo and supersets) / **`Duplicate exercise`** (screen-level `duplicateItem`: deep copy after the original + a copied `restGaps` slot) / `Add note` (when none) / `Delete` (red). The trigger is a **ghost** (`kebabTriggerSt`): no box/border, chevron-weight opacity 0.45, subtle bg only while open. While the menu is open the card drops `overflow:hidden` AND raises `zIndex:30` — glass cards each create a stacking context (backdrop-filter), so without the raise the next card in DOM paints OVER the open menu ("transparent menu" bug). The accent strip carries its own left border-radius so corners stay clean. The menu is the ONLY home for destructive actions — there is no "Remove exercise" link in the expanded editor.
  - Headers are `div`s with `onClick` (not `<button>`) so the kebab isn't a nested button; the kebab wrapper stops propagation.
- **Sets editor** (expanded): grid `32px 1fr 10px 1fr 28px`, each row = `marker · ValueField · × · ValueField · ⋮`. **Frequency rule: values edit inline, everything rare (units / add drop / delete) lives behind the row ⋮.** No unit labels above fields, no `+ drop set` links, no per-row ✕ — all three were folded into `ValueField` + `RowMenu` to kill the patchwork rhythm.
- **`ValueField`** — field with the unit INSIDE as a passive suffix **pinned to the right edge** of the box (value stays centered; `175    lbs`; `time → sec`, `failure → AMRAP` via `unitSuffix`). h40, radius-xl, quiet bg, accent border while active. **No step buttons at all**: continuous values (kg/lbs/sec, reps) are typed; the discrete **rpe** scale gets **`RpeField`** instead — tap opens a compact **3×3 picker grid** (`RPE_OPTIONS` 6–10 in 0.5 steps), one tap to pick, invalid values impossible. Two input modalities on purpose: discrete → pick, continuous → type.
- **Drop hierarchy is vertical, not horizontal**: drop fields keep the SAME full column width as the main set; the drop block is separated by a larger top gap (`marginTop:14` vs the 8px in-group rhythm). Left-indenting drop fields was tried and rolled back (it shrank the fields).
- **`RowMenu` (⋮ per row)** — glass popover with sub-pages (`‹ back` header): unit pickers + Set type. Main-set items, grouped by hairlines: `Load unit · <cur> ›` / `Reps unit · <cur> ›` / `Rep range` (✓-toggle, shown only when reps unit = reps) / `Set type · <cur> ›` (solo only) ── `Add drop set` (≤`MAX_DROPS`) / `Add note` / `Add tempo` ── `Duplicate set` / `Move up` / `Move down` (disabled at the edges) ── `Delete` (danger; disabled on the last set). Drop rows: units + Delete. Superset main rows: units + Rep range + Add drop/note/tempo — NO Delete/Duplicate/Move (round-level ops live on the round ⋮).
- **Set types** (`set.type`: working default / `warmup` / `backoff`, **solo only** — superset rounds stay working by semantics): typed sets show a **colored letter marker** instead of a number — warm-up: **amber `W`** (`--cat-amber-rgb`) + dim row; backoff: **cyan `B`** (`--cat-cyan-rgb`). **Tapping the marker opens an explainer tooltip** (`SetTypeMarker` + `TYPE_INFO`: title in the type's tint + one-line text; lifts the card via `onMenuLift`); the Set type menu page shows the same knowledge as per-option hints (`counted / not counted / lighter work`). Neither consumes a display number (working sets number ① ② ③ … without them); warm-ups also don't count in `calcStats`/`soloSummary` (backoffs do — they're working volume). Duration still counts warm-ups (time is time).
- **Rep range** (`set.repsMax`, also `set[exId].repsMax` in supersets): toggled via the row menu (on → `reps+2`); `ValueField` renders **two ordinary controls stacked in a column** (gap 6; `valueMax`/`onChangeMax`) — each is the standard field with a left-pinned `min`/`max` label and the right-pinned unit label: `[ min · 8 · reps ]` over `[ max · 10 · reps ]`. Earlier shapes (one split box, two side-by-side boxes) were tried and rolled back — a single box with two inputs was tried and rolled back (the container focus stole clicks from the max input). `soloSummary` ranges include `repsMax`.
- **Superset round ⋮** — the round's name row carries a shared-`DropdownMenu` kebab: `Duplicate set` / `Move up` / `Move down` (edge-disabled) / `Delete set` (disabled on the last round). The old lone ✕ is gone — no exceptions to "rare actions live behind ⋮".
- **Superset card header: per-exercise ⋮** — each exercise row in the card header has a kebab: `Change exercise` (stub) / `Remove from superset` (danger). Removing from a 2-exercise superset **converts the item to solo** (`removeFromSuperset` keeps the remaining exercise's set data + `restSet`). This resolves the old "which exercise does the card-level Change apply to?" ambiguity.
- Menus open downward; while any row menu / picker is open the card lifts (`overflow:visible` + `zIndex:30` — same mechanism as the header kebab, wired via `onMenuLift`, including `RpeField`). `Expandable` releases its `overflow:hidden` after the expand transition settles (`onTransitionEnd`) so popovers aren't clipped.

## Load units — RPE by default
- Load unit options: `rpe · kg · lbs · %1RM · time` (`%1RM` typing is clamped to 100). **Default is `rpe`**; weight is the opt-in via the row menu. Reps units unchanged (`reps · failure · time`). Units stored per set / per drop as before.
- Steps: rpe → 0.5 (clamped to max 10 via `wMax`), kg → 2.5, lbs/time → 5.
- Collapsed-card summary is unit-aware: `RPE 7.5–9 · 6–8 reps` or `20–25 kg · 10–12 reps`; uses the first set's unit, ignores sets logged in other units. `Bodyweight` only for zero weight-unit sets.
- New drop inherits the parent unit; in rpe a drop goes **up** toward 10 (`min(10, last+0.5)`), in weight units it goes down (`last−5`).

## Rest (editable via the min/sec picker)
- **`RestDivider`** — a quiet centered divider: hairline · `⏱ 1:30` · hairline (clock 11px at 0.40, value 11/600 at 0.70, hairlines at overlay 0.05). Tapping the chip opens **`RestPickerPopover`** — two columns, **MIN 0–5** and **SEC 0/15/30/45**; taps write live (`m·60+s`), tap-away closes, `0:00` reads back as `No rest`. The chip gets a subtle bg while open; the popover lifts the card via `onMenuLift`. `fmtRest`: `45s` / `1:30` / `2 min`.
- **Between sets** — a `RestDivider` in each gap. The gap value is **per-gap**: `sets[i].restAfter ?? item.restSet ?? defaults.restSet` — tapping a divider edits ONLY that gap (writes `restAfter` on the set above); the picker's **`Apply to all sets`** row writes `item.restSet` and clears every `restAfter`. Same model between superset **rounds** (`restAfter` lives on the round object; numeric exId keys don't clash). `calcStats` duration sums per-gap values.
- **Between exercise cards** — the same `RestDivider`; the value lives in **`restGaps[i]`** (screen-level state, sec) — the pause after slot `i`, keyed by **gap position, NOT by item**, so reordering cards never drags a pause along. Editing writes the explicit value into the slot. `deleteItem` removes the gap after the removed card (or the last gap for the last card). Nothing after the last card.

## Workout defaults (base config)
- **`WorkoutDefaultsCard`** sits between the details card and the exercise list: micro-label `WORKOUT DEFAULTS` + four settings rows (label left · value 13/600 right · ▼): `Load unit`, `Reps unit` (→ `UnitListPopover`), `Rest between sets`, `Rest between exercises` (→ `RestPickerPopover`, right-aligned).
- Stored as screen state `defaults = { weightUnit:'rpe', repsUnit:'reps', restSet:90, restGap:120 }`, threaded through cards → editors → rows. **Inheritance rule: anything without an explicit value falls back to defaults** (`set.weightUnit ?? defaults.weightUnit`, `item.restSet ?? defaults.restSet`, `restGaps[i] ?? defaults.restGap`); per-set / per-divider overrides always win and are written explicitly on first edit. `calcStats` and `soloSummary` are defaults-aware. Demo: items `a`/`b` carry explicit `restSet` overrides, `c`/`d` inherit.

## Notes (exercise + set level)
- **`NoteRow`** — a quiet one-liner (pencil icon 12px at 0.40 + transparent 12px input, placeholder `Note…`). Always editable in place; **blurring it empty removes the note** — zero pixels when absent. `autoFocus` fires when the note is created empty.
- **Exercise note** (`item.note`) — added via the card kebab → `Add note` (the item shows only while no note exists). Renders under the card header, **visible even collapsed** — it's the coach's cue for the whole exercise. Works on solo cards and supersets (note on the whole superset item).
- **Set note** (`set.note`; in supersets per-exercise `set[exId].note`) — added via the row ⋮ → `Add note`. Renders **ABOVE the set row** (indented to the value columns, paddingLeft 40): the cue is read before the set is performed, the main-row → drops chain stays unbroken, and it matches the "note precedes what it describes" rule (exercise notes sit above the sets, superset name rows sit above their values). Below-the-row was tried and moved.
- **Tempo** (`set.tempo`; supersets `set[exId].tempo`) — **`TempoRow`**: metronome icon + 600-weight wide-tracked digits, rendered above the set row right after the note (note → tempo → values). The value is **picked, not typed**: tapping it opens a dropdown of `TEMPO_PRESETS` (`2-0-2-0 controlled · 3-0-1-0 slow eccentric · 3-1-1-0 pause at bottom · 4-0-1-0 slow eccentric+ · 3-0-X-0 explosive up`), then a **custom text field** (Enter / ✓ commits) and, when a value exists, `Remove tempo` (danger). Added via row ⋮ → `Add tempo` — the fresh row auto-opens the picker; dismissing it without choosing removes the row (no empty leftovers). The picker lifts the card via `onMenuLift`.
- NO notes on drops, rounds, or rest — the exercise/set levels cover those cases (decision; don't add).
- Workout-level notes = the description field in the details card (already existed).

## FAB menu (page-level actions)
- Uses the **shared `FabMenu`** (`../../components/FabMenu.jsx`) — this pattern originated here and is now the app-wide page-action menu (also used by Calendar; see the root CLAUDE.md §10 note). Panel height derives from the action count.
- A 50×50 glass square (**`radius-xl`, like every control on the screen — NOT a circle**) is the only thing in the footer, flush right. There is NO separate Save button — saving lives in this menu. The whole footer hides in reorder mode.
- Tap = **container transform**: the FAB itself morphs into a 264-wide glass panel (width/height/radius/background animate, 0.32s cubic-bezier(0.4,0,0.2,1)); radius goes `xl → 2xl` (card radius); the `+` rotates 45° into `×` and stays pinned to the FAB corner; items (15px, padding 12) stagger-fade in (delay 0.1s + 40ms·i). Backdrop click or × closes (reverse morph).
- Items: `Add exercise` (stub), `Add superset` (stub), `Reorder` (enters reorder mode), divider, `Save workout` (**primary-colored, 600 weight, check icon** — the screen's submit). This menu is the ONLY entry point for all four — the dashed "Add Exercise" button, the ⇅ stats-line toggle and the footer Save button were all removed when it landed.
- FAB visual follows the Calendar rule: glass-control style, no primary gradient.

## Undo delete
Deleting an exercise is **undoable**: the card + its rest slot go into a 4s buffer (`lastDeleted` + `undoTimer`), a glass snackbar (`Exercise deleted · Undo`, bottom 96 above the FAB footer, zIndex 46) restores both on Undo; a new delete or the timeout commits the previous one. No confirm dialog by design.

## Reorder mode (exercise level only — nothing inside a card changes)
- Entered from the FAB menu → `Reorder`; exited via the primary **Done** chip on the stats line.
- Entering: collapses all cards (`expandedId=null`, expand/tap disabled), hides rest dividers AND the FAB, shows a **⠿ grip** (24px) left of each card — the card visually narrows.
- Drag: pointer-capture on the grip; the dragged row follows via `translateY` and swaps with a neighbour once its offset crosses half that neighbour's measured height (`heights` measured at dragStart, swapped on each move — handles non-uniform card heights). List gap in mode = `ROW_GAP` (10).
- Reordering only permutes `items`; `restGaps` is untouched by design (pauses belong to slots).

## Set / drop markers (connector line, left column)
- **① circled number** — the set (always circled, even without drops).
- **○ hollow ring** (13px, border matches the numbered circle) — a main working set (used in supersets to mark each exercise's main row).
- **• filled dot** (7px accent) — a drop set.
- Nodes use `position:relative; zIndex:1` + opaque centre so the connector line never shows through them.

## Drop sets
Up to **3 per set** (`MAX_DROPS`). Added via the main set row's ⋮ → `Add drop set` (disabled at 3); removed via the drop row's ⋮ → `Delete`. The old standalone `+ drop set` links are gone. Stored as `set.ds: [{weight, reps, weightUnit?, repsUnit?}]`. Supersets: drops live per exercise (`set[exId].ds`).

## Superset editor
Outer grid `32px 1fr`: col1 = circled number + connector line bracketing the round; col2 = one labelled stepper block per exercise (name centred-ish, own steppers, own drops). Exercises are grouped under one set number.

## Data shape
`item = { id, type:'solo'|'superset', exerciseId | exerciseIds, restSet?, sets:[…] }`. Solo set `{weight, reps, weightUnit?, repsUnit?, ds?}`; superset set `{ [exId]: {weight, reps, …, ds?} }`. `weight` holds the load value in whatever `weightUnit` says (RPE score when unit is `rpe`); missing `weightUnit` means `rpe`. `restSet` is seconds. Rest between exercises is NOT on the item — it's `restGaps[i]` (screen state, seconds, gap after slot `i`).

## Open threads
`onEdit` (Change exercise) is a stub (`editItem`) — wire it to the Exercises search/picker when connected.

## Details card (name · description · tags)
The top card uses shared `components/` primitives so it matches the Meal Builder exactly: **`TitleDescription`** (name input · hairline · description textarea) and the **`TagField`** row (icon · chips · chevron) → **`TagPickerSheet`** bottom sheet (search · create · multi-select; `TAG_PRESETS` seeds the pool, free-create allowed). The screen owns `tags` + `tagDialogOpen`; the sheet is rendered at the phone-container level (never inside the scroll area). Both are showcased on the UiKit page.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `SurfaceContainer`, `DropdownMenu`, `FabMenu`, `TitleDescription`, `TagField`/`TagPickerSheet`. Other icons + steppers are local.
