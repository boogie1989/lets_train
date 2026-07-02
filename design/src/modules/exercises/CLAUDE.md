# Module: Exercises

The exercise library — browse/search exercises and view a single exercise's details. Two screens shown side by side in the playbook.

## Files
- `ExercisesPage.jsx` — playbook wrapper. Renders `<ExercisePreviewScreen />` and `<ExerciseSearchScreen />`.
- `ExerciseSearchScreen.jsx` — search + filters + multi-select list (the picker; ~830 lines, the largest screen). Includes filter chips, unit/segment toggles, a selection footer, and a reorder mode.
- `ExercisePreviewScreen.jsx` — single exercise detail: media/figure, difficulty badge, stat row (muscles / equipment / sets), numbered instructions.
- `index.js` — exports `ExercisesPage`, `ExerciseSearchScreen`, `ExercisePreviewScreen`.

## Key UI
- Search header is a glass slab (same recipe as Calendar/NavBar).
- Preview title = `22/500` hero; difficulty pill (`Easy/Medium/Hard` color-coded); stat row in a `SurfaceContainer`.
- Selectable list rows with thumbs; primary "add" footer button uses the slate-gradient recipe.

## Consumers
This module is the intended target for the Workout Builder's **"Change exercise" / "Add Exercise"** actions (currently stubbed there) — wire the search/picker here when connecting flows.

## Known minor inconsistency
Some search-screen nav icon buttons use border `0.40` and no shadow (vs the shared glass recipe: border `0.5` + `--shadow-card`). Sub-perceptual; align if you touch them.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `SearchInput`, `SurfaceContainer`, `Button`. Icons are local.

## Scope
Slate accent, dark only. Static demo data.
