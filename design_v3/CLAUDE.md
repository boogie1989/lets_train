# Fitness — Calendar, two design variants (design_v3)

`design_v3/` renders **one** fitness Calendar screen in two variants — **Hybrid** (the
recommended cross-platform direction) and **Cupertino** (Apple HIG/iOS) — each in
**light + dark**. Scope is ONLY the Calendar.

> Earlier **Material 3** and **Fluent 2** variants were removed (their files are gone;
> they remain in git history). The Material *interaction grammar* lives on inside the
> Hybrid variant — references to "Material" in Hybrid mean its patterns (FAB, bottom
> sheet, Snackbar, NavigationDrawer), not the deleted skin.

## Hybrid (recommended for a cross-platform Flutter app)
`src/calendar/hybrid/` keeps the **Cupertino *aesthetic*** the team liked (calm
inset-grouped lists, hairlines, restrained typography, system font — SF on iOS, Roboto
on Android) but uses **Material *interaction grammar*** so Android users aren't
alienated: top app bar + hamburger **NavigationDrawer**, **FAB** for add (not a nav-bar
"+"), detail via the design/ **container-transform** morph (grows from a pill above the
footer, content stagger-fades), **Snackbar** undo, and **accent ring/fill** for today
(NOT iOS red). Rationale: what reads as "foreign" on Android is the *interaction
conventions*, not the looks — so port the look, swap the behavior. Tokens:
`src/tokens/hybrid.css` (`[data-ds="hybrid"]`), a calm neutral surface ladder + a brand
accent (deliberately not iOS systemBlue), system font stack.

## Architecture — headless hook + skins
The calendar's logic is presentation-agnostic, so it lives once and the idioms fork:
- **`src/calendar/useCalendar.js`** — ONE headless controller hook: all state, swipe
  math, model ops, derived stats, undo snapshots. Returns a flat object (view state +
  `selectDay/toggleMonth/openDetail/closeDetail`, `swipeHandlers/dragShift/weekPeek`,
  ops `moveItem/deleteItem/setEaten/setNote/setReadiness/scheduleWorkout/…`, `snack/undo`).
- **Skins** consume the hook and render fully idiomatic markup:
  - `hybrid/HybridCalendar.jsx` + `HybridDetail.jsx`
  - `cupertino/CupertinoCalendar.jsx` + `CupertinoDetail.jsx`

**RULE: never branch on `data-ds` inside a skin.** Logic in the hook, idioms in the
skin. Detail morph/measure state is local to each skin's detail component.

`src/calendar/calendarModel.js` is copied verbatim from v2 (deterministic May-2026
data + immutable ops). `glyphs.jsx` = shared `currentColor` icon set.

## Token scoping — `[data-theme] [data-ds]`
`src/tokens/{base,cupertino,hybrid}.css` (aggregated by `tokens.css`). Each variant
defines its tokens on `[data-ds="x"]` (dark) and `[data-theme="light"] [data-ds="x"]`
(light overrides) — descendant selector, theme on `<html>` (global `ThemeProvider`),
`data-ds` on each phone column in `CalendarPage`. Specificity (0,2,0) > (0,1,0) so theme
wins without `!important`. Each ds block ends with an **alias layer** (`--cs-on-surface`,
`--ds-screen-bg`, `--tt-font-family`) so the shared `StatusBar`/`PhoneFrame` resolve.
`base.css` holds playbook-chrome tokens + the shared spacing scale + macro palette + `.tnum`.

## Per-variant idioms

| feature | Hybrid | Cupertino |
|---|---|---|
| chrome | top app bar + hamburger + month chip | vibrancy nav bar + large title |
| week strip | accent **ring** today / accent fill selected | filled circle, **today RED** |
| schedule | calm **inset-grouped list**, hairlines | **inset-grouped list**, 0.5px separators |
| detail | **container-transform** morph (pill → panel, stagger) | **page sheet** (grabber, slides over dim) |
| add | **FAB** → container-transform menu | nav-bar **+ → ActionSheet** |
| undo | **Snackbar** | **transient toast** (no iOS Snackbar) |
| menu | **NavigationDrawer** (scrim) | **presented modal sheet** (no left drawer) |

Cupertino uses real `backdrop-filter` vibrancy; Hybrid stays opaque with a scrim.

## Component → native + Flutter map
- Hybrid → Android: `package:flutter` Material (`AppBar`, `FloatingActionButton`+`OpenContainer`, `SnackBar`, `NavigationDrawer`); iOS: same layout with system font. Container-transform = `OpenContainer`.
- Cupertino → `package:flutter` Cupertino: `CupertinoSliverNavigationBar`, `CupertinoListSection.insetGrouped`+`CupertinoListTile`, `CupertinoActionSheet`, cupertino sheet/detents, `BackdropFilter`, custom toast `Overlay`.

## Calendar feature parity (must hold in both variants)
Header + month/year toggle · week strip ⇄ inline month grid · horizontal swipe paging
(weeks in week view, months in month view) with resistance + edge-peek + April/June
ghosts · selected + today markers · readiness check-in (interactive today, read-only
past) · day summary with tonnage/AU load line + macro legend · task list (status, plan
tag, completed shows session in meta) · detail surface (exercise list, session-result
grid, note editor, Reschedule inline month picker → moveItem, Delete, Mark-eaten) ·
add-action (schedule workout/meal, log meal) · undo · drawer/menu · empty state. The
calendar is a **planning surface** — workout completion comes from the Runner, never a
whole-card toggle (interaction-model lock carried over from v2).

## Run & verify
```
cd design_v3 && npm install && npm run dev   # → http://localhost:2003  (or npm run build)
```
For each variant × theme (Hybrid, Cupertino — 4 combos): correct chrome idiom;
week-strip selected+today (Hybrid accent ring / **iOS today red**); month toggle swaps
strip⇄grid in place; swipe pages weeks/months with snap-back, edge-peek + ghosts;
schedule renders (inset-grouped lists); readiness saves+collapses, past read-only;
day-summary load + macros tabular; tap → detail (Hybrid container-transform morph /
iOS page sheet) with full content + Reschedule/Delete/Mark-eaten; undo restores
(Snackbar / toast); add works (FAB menu / action-sheet); menu opens (drawer / sheet);
empty day placeholder. Toggle theme → both flip together. No `[data-ds]` token leakage
between columns.
