# Module: Libraries

A unified browse hub for the app's content libraries — **Exercises, Workouts, Meals, Plans** — in one screen. Modeled on the Exercises search screen (glass header → quick-chips → card list → filter sheet) but **config-driven**: the active library decides the cards, quick-chips, filter sheet, and data. Add a library = add one config.

## Files
- `LibrariesScreen.jsx` — the generic shell. Props:
  - `initialLibrary` (`'exercises' | 'workouts' | 'meals' | 'plans'`)
  - `mode` — **`browse`** (view only, tap = stub), **`multi`** (multi-select + bottom action bar), **`single`** (single-select + Choose bar). Browse works in every mode.
  - `initialSelected` (ids, for demos), `sheetOpenInitial` (open the filter sheet, for demos).
- `Segmented.jsx` — the 4-segment pill library switcher (visual language from `components/ViewToggle.jsx`).
- `shared.jsx` — `Card`, `Thumb`, `CardBody`, `DiffDot`, `MetaTag`, `SectionLabel`, the chip/grid/segmented/dots/wrapChip style fns, `DIFF_COLORS`/`THUMB_COLORS`. Imported by the shell **and** every config (no config imports → acyclic).
- `icons.jsx` — module SVGs (back, filter, equipment grid icons, per-library `ThumbGlyph`, chevrons, meta icons).
- `configs/<library>.jsx` — one per library. Each exports `{ id, label, searchPlaceholder, data, quickChips, filters, renderCard }`. `configs/index.js` exports the ordered `LIBRARIES` array.
- `WorkoutPreviewScreen.jsx` / `MealPreviewScreen.jsx` — content detail pages, each exporting a **`…View`** (no `PhoneFrame`, for overlay use) + a default **`…Screen`** (playbook). Mirror `exercises/ExercisePreviewScreen.jsx` (hero · title + chip · stat/macro block · sections · CTA). In **browse** mode, tapping a workout/meal card opens the matching preview as an overlay; the Plan Builder reuses these `…View`s when tapping an added item.
- `LibrariesPage.jsx` — playbook: a phone per library (browse) + Multi-select + Single-select + Filters-open + Workout/Meal preview columns.

## How a library config works
- `quickChips: { field, options }` — header chip row; multi-select on `item[field]` (e.g. muscle / focus / mealType / goal).
- `filters: [{ key, label, control, advanced?, options }]` — drives the filter sheet generically.
  - `control`: `grid` (equipment, multi) · `segmented` (single) · `dots` (difficulty, single) · `chips` (multi). `advanced: true` → under the collapsible "Advanced" section.
  - options are strings **or** `{ key, label, dots?, match? }`. Provide `match: item => bool` for ranges (calories, duration, weeks…); otherwise the shell compares `item[key]` (handles array fields like `tags`/`equipment` via `includes`).
- `renderCard(item, { selected, onClick })` — returns a `<Card>` (from `shared.jsx`) with library-specific content. The `Card` handles selection visuals (accent strip + highlight); the shell wires `selected`/`onClick` per `mode`.

The shell's `matchItem` + `FilterControl` are fully generic — they read the active config. Filter/search state resets when switching library.

## Reuse / consistency
Glass-slab header recipe, quick-chip style, **filter-sheet overlay** (slides over the list, doesn't shrink it), and **selection-bar** pattern are all mirrored from `../exercises/ExerciseSearchScreen.jsx`. Uses shared `SearchInput`, `SurfaceContainer`, `StatusBar`, `PhoneFrame` and `tokens.css`. Slate accent, dark only.

## Relationship to the `exercises` module
This **coexists** with `../exercises/` (the add-to-workout picker flow with its own edit/group overlay). Libraries is the general browse hub + a reusable picker (`mode='multi'|'single'`). If flows converge later, the exercises picker could be re-expressed as `<LibrariesScreen initialLibrary="exercises" mode="multi" />`.

## Scope
Static demo data; card tap in `browse` is a stub (no detail screens yet). Adding a 5th library = new `configs/<name>.jsx` + add to `configs/index.js`.
