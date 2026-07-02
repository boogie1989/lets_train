# Module: Meal Builder

Create / edit a **dish** — name + photo + meta, an editable **ingredient list**, an ordered **recipe**, and **auto-computed nutrition**. The create/edit counterpart of `libraries/MealPreviewScreen` (same content, but editable).

## Files
- `MealBuilderScreen.jsx` — the builder. `initialStep` drives playbook variants: `edit` (demo meal) · `ingredient` (last ingredient expanded) · `empty` (new).
- `mealModel.js` — meal data model + **pure ops** (see below).
- `icons.jsx` — module SVGs.
- `MealBuilderPage.jsx` — playbook (one phone per variant).

## Data model (`mealModel.js`)
```
meal = { name, description, mealType, servings, prepMin, cookMin, tags:[],
         ingredients:[{ id, name, qty, unit, kcal, p, c, f }],   // macros entered for that amount
         steps:[string] }
```
- `computeNutrition(meal)` → `{ total, per }` (sum of ingredient macros; `per` = total / servings).
- Ops: `setField` · `setServings` · `setMinutes` · `addIngredient`/`updateIngredient`/`removeIngredient`/`moveIngredient` · `addStep`/`updateStep`/`removeStep`/`moveStep` · `validateMeal` (name + ≥1 ingredient). Constants `MEAL_TYPES`, `UNITS`, `DIETS`. All pure.

## Structure (top → bottom)
1. **Header** (`NavBar`): back + centered title + primary save check (dim until valid).
2. **Cover photo** — tappable gradient placeholder (stub, no upload).
3. **Details** (`SurfaceContainer`): shared **`TitleDescription`** (name input · description) · **meal type** (`Segmented`, 4) · **Servings / Prep / Cook** steppers · shared **`TagField`** row → shared **`TagPickerSheet`** bottom sheet (presets = `DIETS`, free-create allowed). The `TitleDescription` + `TagField`/`TagPickerSheet` trio lives in `components/` and is shared with Workout Builder (showcased on the UiKit page) so tags + title/description look identical app-wide.
4. **Nutrition** (`SurfaceContainer`, auto): **Per serving / Total** toggle · big kcal · P/C/F macro bars (colors match `MealPreview`). Recomputes live from the ingredients.
5. **Ingredients** — editable rows: collapsed = name + `qty unit · kcal`; tap to **expand** an inline editor (name · amount+unit dropdown · calories · P/C/F). Grip-drag reorder · `×` remove (`ConfirmDialog`). `+ Add ingredient` (dashed) adds a blank, auto-expanded row.
6. **Recipe** — numbered, reorderable step textareas · `×` remove · `+ Add step` (dashed).
7. **Save footer** — sticky `Save Meal` (slate gradient) over a surface fade.

## Reuse
- `components/`: `NavBar`, `SurfaceContainer`, `Segmented`, `TitleDescription` + `TagField`/`TagPickerSheet` (shared title/desc + tags), `ConfirmDialog` (remove), `PhoneFrame`, `StatusBar`, tokens. Header/footer/stepper recipes mirror `plan-builder` / `workout-builder`. Macro colors + bar pattern mirror `libraries/MealPreviewScreen`.
- Local `UnitField` (small token dropdown) for the g/ml/pcs/cup/tbsp/tsp unit.

## Scope
Static demo (`demoMeal`). Save + cover photo are stubs. Ingredient macros are entered per-amount (no food database / no per-100g auto-scaling). All colors are tokens (dark + light); no hardcoded colors.
