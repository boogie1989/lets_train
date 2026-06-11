# Module: Calendar

The home tab — month/week date strip + a day's scheduled workouts. This screen is the **visual reference (source of truth) for the whole design system**: when other modules look inconsistent, match them to Calendar.

## Files
- `CalendarPage.jsx` — playbook wrapper. Three phones, each starting on a different selected day: `13` (today, full plan) / `14` (light day) / `16` (empty). Renders `<CalendarScreen initialDay={…} />`.
- `CalendarScreen.jsx` — the phone screen. **Interactive demo**: tapping a date switches the day; tapping an item's checkbox toggles Completed. Demo data: `PLANS` (typed item templates, `kind: 'workout' | 'meal'`, meals carry kcal + p/c/f) + `WEEK` (7 days, each mapping to a plan with a `tense` — future days init all-Planned; **past and today keep the authored mix**, so past days show what actually happened and their uncompleted items surface the "Missed" label). Per-day item state lives in `weekItems`; `DaySummary` numbers, nutrition (consumed vs `GOALS`), and DateCell completed dots are all **derived** from it.
- `index.js` — exports `CalendarPage`, `CalendarScreen`.

## Structure (top → bottom)
1. **Glass slab header** (`NavBar` recipe): `--glass-slab` + `blur(8px)`, top/bottom `1px rgba(var(--overlay-rgb),0.05)`, header shadow. Full-bleed, **no radius**.
   - Top bar: 48×48 glass icon buttons (`--glass-control`, border `rgba(var(--cs-outline-rgb),0.5)`, card shadow), centered title (`title-large`) + month (`body-small`). The **left ☰ button opens the side drawer**; the right gear is a stub.
   - Date row: 7 `DateCell`, `gap 6`, centered, **tappable** (`onClick` selects the day). States: default / today / selected, plus an orthogonal `completed` flag (every item of the day checked off) → 4×4 emerald dot (`--cs-status-completed`); today's secondary dot yields to it. The dot is derived live from item state — checking off the last item lights it up.
2. **Schedule section** — `ScheduleHeader` (title-large + subtitle follows the selected day + Glass `FAB` 52), then the **selected-day summary** (`DaySummary`), then a list of `TaskItem` cards (gap 14; with `onToggle` the **whole card is tappable** to flip Completed/Planned. Right-side status labels, **10/500**: completed → emerald **"Done"** (`--cs-tertiary`); uncompleted on a **past** day (`missed` prop) → muted **"Missed"** (`--cs-error` @ 0.75). State = accent strip + label, no controls, no dimming). Empty state = centered placeholder card (summary hidden).
   - `DaySummary` — **one glass card, two per-item segmented rows** (shared `SegmentBar`: filled = item completed, rest = dim track):
     - **Workouts** — `n of N · m exercises` (collapsing to `Completed/Planned · m exercises` for a single workout) + segmented bar, 1 segment per workout, fill `--cs-status-completed`. Hidden when the day has no workouts.
     - **Nutrition** — `n / goal kcal` + segmented bar, 1 segment per meal (fill `--cs-primary`, filled = eaten), + a **one-line macro legend** — colored dot + `P/C/F cur / goal g` in `MealPreview` macro colors. Per-day `nut` (in `DAYS`) is kept consistent with the day's completed meals.
     - Type via `title-small`/`body-small` tokens, weights 400/500 only. Earlier explorations (dashboard/merged/chips/rings/3-macro-bars/day-level "Plan" bar) were dropped in favor of this.

## Side drawer (`SideDrawer` in `CalendarScreen.jsx`)
Left slide-in (scrim + 296-wide `--glass-popover` panel; always rendered, `transform` toggled for animation). Opened by the ☰ button. Contents:
- **Short profile** — gradient-ring avatar (initials) + name + email (demo `USER`); tap closes (stub for a future Profile route).
- **Libraries nav** — rows for `exercises · workouts · meals · plans` (`LIBS`), each a category-tinted glyph + label + chevron. Tapping a row opens that library as a full overlay via **`LibrariesView`** (`mode='browse'`, `initialLibrary`, `onClose`) — the library's own ‹ back button + switcher handle the rest. All colors are tokens.

## Reference tokens (reuse these everywhere)
- Icon button: 48 top-level / 44 in-flow, radius-xl, glass bg + border 0.5 + `--shadow-card`.
- Section padding `24px 16px`; card list gap `14`.
- Type via tokens, weights **400/500 only**.
- Status via 5px accent strip (`emerald` completed / `slate` planned), not pills.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `DateCell`, `ScheduleHeader`, `TaskItem` (+ `FAB`, `GlassCard` transitively). Drawer nav reuses `LibrariesView` from `../libraries/`.

## Scope
Dark mode only, slate accent, iPhone 15 Pro Max. Month-grid view and real date logic are out of scope (static mock).
