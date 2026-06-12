# Module: Workout Builder 3

Two-level builder experiment: **screen 1 = read-only workout preview, screen 2 = full-screen exercise editor**. The bet vs v1/v2 (single screen, inline editing): with a whole screen per exercise, the controls that v1/v2 bury behind ⋮ can sit in the open — a Last-session panel first, visible unit chips, rest dividers between set rows, a visible + Add drop set button, tap-to-pick type markers, an always-visible note field. Carries the full v2 functional core (kg default, RIR, RPE 5–10, %1RM ≤120 + 1RM base, rest 0–10 min, drops ≤5, structures, history, bulk apply). **Original `workout-builder` and `workout-builder-2` are not touched.**

## Files
- `WorkoutBuilder3Page.jsx` — playbook wrapper. Variants via `initialStep`: `preview`, `edit-solo`, `edit-superset`.
- `WorkoutBuilder3Screen.jsx` — container: owns ALL workout state (items, restGaps, defaults, oneRMs, undo buffer) and the navigation (`mode: 'preview'|'edit'` + `editId`). Renders both views on a 200%-wide track and slides via `translateX` (0.32s, the FabMenu curve). `editId` persists through the slide-out so the editor pane keeps its content while animating away. The undo snackbar overlays both views.
- `PreviewView.jsx` — screen 1.
- `ExerciseEditView.jsx` — screen 2 (keyed by `editId` so the pager resets internal state per exercise).
- `shared.jsx` — module-local primitives forked from workout-builder-2 (data, helpers, ValueField/ScaleField/OneRmLink, RowMenu, RestPickerPopover/RestChip, Note/Tempo/Structure rows, CompactSets, markers, icons). Deliberately NOT imported across modules — each builder generation evolves independently; only app-wide primitives live in `../../components`.
- `index.js` — exports `WorkoutBuilder3Page`, `WorkoutBuilder3Screen`.

## Screen 1 — Preview (`PreviewView`)
- Header: back + primary check (same as v1). Details card: name + description (**no tags here** — deliberate scope cut for the layout experiment; WB2 demonstrates the tag dialog).
- **`DefaultsRow`** — defaults compressed to one line (`kg · reps · ⏱ 1:30 / 2 min ›`); tap opens **`DefaultsSheet`**, a bottom sheet with chip rows (load unit / reps unit) + rest rows (RestPickerPopover). Less prominent than v2's four-row card, still one tap away.
- Stats line + **volume-by-muscle chips** (`muscleVolume` in shared.jsx: working sets per muscle, warm-ups excluded; tinted via the category palette `MUSCLE_CH`).
- **Read-only cards** (`PreviewCard`) — deliberately quiet: header (thumb · name · `muscle · equipment` · sets count · kebab) + **`PreviewSets`**: each set/round row sits in its own **60%-width bordered container** (radius-lg, overlay 0.03 bg / 0.08 border, 6px stack gap), and the per-gap rest value (`sets[i].restAfter ?? item.restSet ?? defaults.restSet`) floats at the **far right, absolutely positioned + vertically centered on the boundary** between two containers (`⏱ 1:30`, 10/600 — adds no vertical space), connected to the containers' right edge by a hairline. Superset rounds: `buildSetRows` returns per-exercise `lines` — each exercise's load×reps (+drops) renders on its own line inside the round's single container (header order disambiguates); the joined `text` form remains for `CompactSets`. Clamped to 3 rows (`SET_CLAMP`; overflow → dim `+N more…`). Row data comes from `buildSetRows` (shared.jsx — also feeds `CompactSets`, which stays plain for `HistoryCard`). NO note line — it lives in the editor. **Tap anywhere on the card → opens the editor.** Kebab: Edit sets / Duplicate / Delete (undoable). Superset card keeps the primary-tinted container + SUPERSET label.
- **Drag reorder = long-press on the card** (no grip, no mode): pointer-down starts a 300ms timer; movement >8px before it fires cancels the press (scroll/tap stays native via `touchAction: pan-y`); after it fires the card lifts and follows (same swap math as v1, heights measured lazily). `justDragged` + `onClickCapture` eat the click that lands after a drag so it doesn't open the editor. The kebab stops `pointerdown` propagation so pressing it never starts a drag.
- Rest dividers between cards (same `restGaps[i]` slot model); hidden while dragging. `RestDivider` itself now lives in `shared.jsx` (used by both views).
- FAB menu: Add exercise / Add superset / **Save workout** — no Reorder item (obsolete here).

## Screen 2 — Exercise editor (`ExerciseEditView`)
- NavBar: ‹ back · thumb + exercise name + `muscle · equipment` (superset: "Superset" + `N exercises · N rounds`) · kebab (Change exercise stub / Duplicate / Delete → deletes and returns to preview). Below it the **pager** `‹ Exercise 2 of 4 ›` — walk the whole workout without bouncing back to the preview.
- **`UnitChips`** — LOAD (`kg lbs rpe rir %1RM time`) and REPS (`reps failure time`) as visible chip rows. Picking writes the unit onto **every set and its drops** (the per-set override still lives in the row ⋮). Current value reads from the first set. In supersets the chips follow the **active tab's** exercise.
- **`HistoryCard` renders FIRST** (right under the nav / superset tabs) — `LAST SESSION · <date>` + read-only `CompactSets` of the logged sets + **`Prefill these sets`** (solo only; supersets show the active exercise's history without prefill — round-count mismatch makes prefill ambiguous; deliberate). It's the reference you build today's prescription against, so it leads the page.
- **Sets table** (GlassCard): micro-label header `SET · LOAD · REPS · (⋮)`, grid `28px 1fr 10px 1fr 34px`. **Rest = `RestDivider` between set rows** (the v1 recipe — hairline · `⏱ 1:30` chip · hairline): the divider after set `i` writes `sets[i].restAfter`; its picker has `Apply to all sets` (`applyAllRest` writes `item.restSet` + clears overrides). No REST column, no hairlines — the dividers ARE the separators.
- **`TypeMarker`** — tapping the set number/W/B opens the type picker directly (working/warm-up/backoff with hints). The v1 explainer tooltip became the picker hints.
- Note/tempo/structure sub-rows render above their set (same order as v2); drops below with dot markers. Note/tempo/structure are still ADDED via the row ⋮, but **`+ Add drop set` is a visible quiet button** (`AddDropBtn`, paddingLeft 34 to align with the value columns) under each set group — hidden at `MAX_DROPS`; the menu item was removed.
- `+ Add set` / `+ Add round` — full-width dashed button under the table.
- **EXERCISE SETTINGS card**: `Rest between sets/rounds` (chip → picker; writes `item.restSet` and clears per-row `restAfter` overrides) and an always-visible **exercise note** field.
- **Superset**: a segmented **tab bar** (active exercise drives unit chips + history); the rounds table is combined — each round = header row (`① ROUND 1` + round ⋮: duplicate/move/delete) then one labelled block per exercise (name tinted primary when its tab is active, hollow-ring marker, fields, drops, its own `AddDropBtn`). Rest between rounds = the same `RestDivider` between round blocks (writes the previous round's `restAfter`). Per-exercise ⋮ has units/range/structure/note/tempo/apply-all — no delete/move (round-level ops own those).

## Why both views stay mounted
The slide track renders preview AND editor simultaneously — cheap, and it makes the transition seamless in both directions. The editor pane renders only when `editItem` exists (deleting the edited exercise nulls it after the slide-back).

## Open threads
Add exercise / Add superset / Change exercise / Save — stubs (wire to the Exercises picker when connected). Back button on the preview header is decorative (no outer navigation in the playbook).

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `GlassCard`, `DropdownMenu`, `FabMenu`. Everything else comes from the module-local `shared.jsx`.
