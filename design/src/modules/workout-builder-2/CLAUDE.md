# Module: Workout Builder 2

v2 of the single-screen builder. Same concept as `workout-builder` (cards + inline editors) with the persona-driven fixes applied: kg default, RIR, wider ranges, 1RM base, history prefill, intra-set structures, bulk apply, compact view, empty state. **The original `workout-builder` module is frozen — never port changes back.**

## Files
- `WorkoutBuilder2Page.jsx` — playbook wrapper. Variants via `initialStep`: `list`, `edit-solo`, `edit-superset`, `compact`, `empty`.
- `WorkoutBuilder2Screen.jsx` — the whole builder (forked from `workout-builder/WorkoutBuilderScreen.jsx`, then evolved).
- `index.js` — exports `WorkoutBuilder2Page`, `WorkoutBuilder2Screen`.

Everything documented in `../workout-builder/CLAUDE.md` still applies (card anatomy, kebab/⋮ frequency rule, rest model, notes/tempo, FAB menu, undo delete, reorder mode, markers, data shape) — this file documents only the v2 deltas.

## Deltas vs v1

### Units (the novice fix + the pro ceilings)
- **Default load unit is `kg`** (`defaults.weightUnit: 'kg'`) — weight is the universal entry point; RPE/RIR are the autoregulation opt-in via the defaults card or the row ⋮. v1 defaulted to RPE, which confused novices.
- `WEIGHT_UNITS = ['kg','lbs','rpe','rir','%1RM','time']` — **RIR added**.
- `RpeField` → **`ScaleField`** (handles both discrete scales): RPE **5–10**, RIR **0–5**, 0.5 steps, 4-column grid, and a **one-line explainer in the picker header** (`SCALE_FIELDS[unit].hint`) — the scale is taught at the point of use.
- **%1RM clamps at 120** (supra-max overload prescriptions), not 100.
- **Rest picker minutes 0–10** (2-column grid for the MIN side) → max 10:45. Heavy compound work rests beyond 5 min.
- **`MAX_DROPS = 5`** (was 3). New drop in `rir` goes **down** toward 0 (`max(0, last−0.5)`); `rpe` still climbs toward 10.

### 1RM base (`oneRMs`)
- `ALL_EXERCISES` entries may carry `oneRM` (kg). Screen state `oneRMs` map seeds from it; `setOneRM` updates.
- When a set's load unit is `%1RM`: a `subHint` renders **under the weight field** — `≈ N kg` (computed, rounded to 0.5) when the exercise has a max, or an **`OneRmLink`** (`Set 1RM` → mini popover with one input) when it doesn't. Main set rows only — drops don't show the hint (noise).
- `ValueField` grew an optional `subHint` prop (node rendered under the box, centered).

### Exercise history (`EXERCISE_HISTORY`)
- Demo map `{ exId: { date, sets } }`. Solo cards with history show a quiet **`Last session · <soloSummary> · <date>`** line at the top of the expanded editor (HistoryIcon + 11px text).
- Card kebab gains **`Prefill from last session`** (between Set scheme and Duplicate; only when history exists) — deep-copies the history sets over the item's sets. Solo only.

### Intra-set structures (`set.structure`)
- `{ kind: 'cluster'|'restPause'|'myoReps', mini: N, intraRest: sec }`; `straight` = absence of the key (same convention as `set.type`).
- Picked via row ⋮ → **`Structure ›`** sub-page (`SET_STRUCTURES`, hints per option). Main rows only (solo + superset per-exercise rows), not drops.
- Renders as **`StructureRow`** above the set row (after note → tempo): LayersIcon + `cluster · 3 mini · 20s intra`. Tapping opens a config popover — MINI-SETS (2–5) and INTRA REST (10/15/20/30/45/60s) button rows + `Remove structure` (danger). The kind itself is NOT changed here — only in the ⋮.
- `calcStats` adds `(mini−1)·intraRest` per structured set (solo and superset-aware).

### Bulk apply
- Row ⋮ on main rows gains a group after Move up/down: **`Apply load to all sets`** / **`Apply reps to all sets`** — copies the set's value + unit (and `repsMax` presence) onto every set; in supersets per-exercise across all rounds (`applyLoadAllEx`/`applyRepsAllEx`).

### Compact view (`compactMode`)
- Toggled by a **RowsIcon chip on the stats line** (hidden in reorder mode); `initialStep: 'compact'` seeds it.
- Every card keeps its header (subtitle switches to `muscle · equipment`) and renders **`CompactSets`** — a read-only 24px-row table: marker (W/B letters tinted, working sets numbered) + `100 kg × 8` (`fmtLoad`/`fmtReps`, unit-aware incl. RPE/RIR/AMRAP/ranges) + `+N drops` chip. Supersets: one line per round, exercises joined with `·`.
- Tap a card in compact → exits compact AND expands that card (`toggle` handles it). Entering reorder exits compact.

### Empty state (`initialStep: 'empty'`)
- Zero items → `EmptyState`: glass icon tile, `Build your workout` + sub, primary CTA **`Add your first exercise`** (opens the FAB menu — a real action), and two hint lines (⋮ discoverability, defaults inheritance). Stats line + card list are hidden while empty (`restGaps` seeds safely via `Math.max(0, len-1)`).

### Accessibility
- Contrast floor for functional secondary text: card summary/sets-count 0.65–0.70 (was 0.45–0.55), unit suffixes 0.70/0.55 dim, stats line 0.60.
- Touch targets: `kebabTriggerSt` 34px (was 28), row-grid kebab column 34px, superset round kebab 28px (was 24), typed-set markers get padding 9 / margin −9 (≥40px hit area, zero layout shift).

## Demo data notes
- Item `a` set 4 carries a `structure: cluster` example; set 5 is an explicit-RPE backoff. Superset `b` exercise 5 runs on RIR. Item `d` has a `%1RM` set (RDL has `oneRM: 160` → shows `≈ 120 kg`). Squat/RDL/Pushdown have `EXERCISE_HISTORY` entries.

## Open threads
- `onEdit` (Change exercise), Add exercise / Add superset, Save — stubs, same as v1.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `GlassCard`, `DropdownMenu`, `FabMenu`. Icons + fields are local to the module.
