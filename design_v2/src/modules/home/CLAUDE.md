# Module: Home concepts (reimagined)

Three **structurally different** home-screen reimaginings, built so the user can
compare them side by side and pick a direction. This is a UX/IA rethink, **not** a
restyle — the point is to challenge "the home is a calendar grid you stare at".

All three render from ONE shared real-data snapshot (`homeData.js`, derived from the
Calendar's deterministic model, today = Wed May 13): 2/5 workouts done, next =
Leg Day 10:00, day load 7,862 kg / 799 AU, nutrition 1,240 / 2,200 kcal, readiness 7.

## Files
- `homeData.js` — derives today's snapshot from `../calendar/calendarModel.js` (items, nextWorkout, stats, nut, load, readiness) + demo week-trend aggregates (the weekly load lives on a future Trends screen; mocked here to show the "input → progress" gap being closed).
- `homeShared.jsx` — shared v2 primitives: `Ring` (→ CircularProgressIndicator), `Bars` sparkline, `StatusGlyph` (done/now/planned), icons, `HomeFab`, `card` recipe.
- `NowScreen.jsx` — **Action-first.** Home = the next action. Greeting + readiness chip, a hero next-workout card with a full-width **Start**, a quiet day timeline, and a week-load sparkline. Calendar is a footer button, not the home. Lowest friction; best for casual.
- `PulseScreen.jsx` — **Rings dashboard.** Big readiness score ring, three activity rings (Train / Fuel / Recover), one compact "up next" with Start, a week-trend card, and a Today/Week/Trends tab bar. Data-forward; best for advanced/pro (Whoop/Oura logic).
- `AgendaScreen.jsx` — **Day-hero (evolution).** Keeps the week rail (reuses `DateCell`) but the day becomes the hero, grouped into **Train / Eat / Recover** with one primary action per group and detail on demand. Least risky; keeps the planning mental model.
- `HomePage.jsx` — playbook wrapper: renders all three phones side by side with labels.

## Design intent (why these differ from `design/`)
- **Lead with action / state, not a calendar.** The old home buried the primary action (Start lives deep in the Runner) under a dense stack (readiness + load + macros + list).
- **Close the input → progress gap** (the top finding from the UX eval): every concept surfaces a week trend / rings, which the old design never did on the home.
- **Progressive disclosure** for casual users; depth on tap for pro.
- **One semantic accent** (`--cs-primary`) for actions; category tints only for section identity / macros; status colors only for done/planned.

## Shared deps / v2 language
`../../components`: `PhoneFrame` (static bg), `StatusBar`, `DateCell` (Agenda rail).
All surfaces opaque (`--surface-*`), 1px borders, one `--elev-*` shadow, tabular
numbers, no glass/blur. See root `design_v2/CLAUDE.md`.

## Scope / status
Home concepts only (per user). Interactions are mostly visual (Start, tabs, FAB are
placeholders) — these are IA mockups to choose a direction. Once a concept is picked,
it becomes the real Home module and the others are removed.
