# Module: Calendar (tri-platform)

The same Calendar screen in **Material 3 / Cupertino / Fluent 2**, light + dark. See the
root `design_v3/CLAUDE.md` for the architecture, token scoping, and per-language recipe.

## Files
- `calendarModel.js` — **verbatim from v2**: deterministic May-2026 data (today = Wed 13),
  typed items (workout/meal), readiness, load (tonnage/AU), immutable ops
  (`addItem/moveItem/deleteItem/setEaten/setNote/patchDay`) + derived helpers
  (`computeDayStats/computeNut/computeDayLoad/dayDot/readinessScore/readinessTier`).
- `useCalendar.js` — headless controller hook. ALL state + handlers + swipe + undo.
  The skins share this; none re-implements logic.
- `glyphs.jsx` — shared `currentColor` SVG icons.
- `CalendarPage.jsx` — renders the variants side by side (each `data-ds` wrapper);
  the global ThemeToggle flips light/dark for all.
- `hybrid/` · `cupertino/` — one `*Calendar.jsx` (screen + parts) + one `*Detail.jsx`
  (the variant's detail surface) each. (Earlier `material/` and `fluent/` were removed.)

## Interaction model (locked, from v2)
The calendar is a **planning surface**. Tapping a card opens its detail; **workout
completion never happens here** — it comes from the Workout Runner. The calendar's ops
are planning ops: move, delete, note, meal-eaten. No whole-card-tap-to-complete.

## Adding a feature
Add the state/handler to `useCalendar.js` ONCE, then render it idiomatically in each
skin. Never fork on `data-ds` inside a skin; never duplicate logic into a skin.
