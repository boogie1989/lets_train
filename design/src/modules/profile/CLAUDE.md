# Module: Profile

The user's account tab — identity, very-basic workout + nutrition stats, and auth actions. Has **two states** driven by one prop.

## Files
- `ProfilePage.jsx` — playbook wrapper. Renders two phones: `Anonymous` (`initialAuthed=false`) and `Authenticated` (`initialAuthed=true`).
- `ProfileScreen.jsx` — the screen. `initialAuthed` seeds internal `authed` state; the auth buttons toggle it so the prototype is interactive (Create account / Log in → authed; Log out → anon).
- `icons.jsx` — module SVGs (currentColor).
- `index.js` — exports `ProfilePage`, `ProfileScreen`.

## Structure (top → bottom)
1. **Glass-slab header** (`NavBar`): "Profile" + a settings gear (stub).
2. **Identity hero** (`SurfaceContainer`):
   - **Authed:** gradient-ring avatar with initials · name · email · plan chip · edit button.
   - **Anon:** muted glyph avatar · "You're a guest" · sync pitch · **Create account** (primary) + **Log in** (ghost).
3. **Workouts · this week** card: 3 `StatTile`s (Workouts / Streak / Active time) + a 7-bar `WeekBars` mini-chart.
4. **Nutrition · today** card: big kcal / goal + progress bar + P/C/F `MacroBar`s (colors match `MealPreview` macros).
5. **Account** (authed only): list of rows (Edit profile / Settings / Help) + **Log out** (error-tinted). Anon shows a sign-in nudge line instead.

For the **anonymous** state the stat values render muted as `—` (and bars/macros empty) so the screen previews the value of signing in without looking broken.

## Key decisions
- Two states from one prop + interactive toggle (no router needed for the prototype).
- "Very basic" stats only: counts, streak, time, weekly bars, today's kcal + macros. No history/charts/PRs (that's a future Progress module).
- All colors are tokens (`var(--…)` / `rgba(var(--…-rgb), α)`) — works in dark + light, no hardcoded colors (see [[feedback_color_tokens]]).

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `NavBar`, `SurfaceContainer`. Icons local. Reuses `--gradient-slate-accent`, category channels (`--cat-*-rgb`), `--cs-tertiary` for nutrition.

## Scope
Static demo user + stats. Auth is a local state toggle (no real backend). Settings / Edit / Help rows are stubs.
