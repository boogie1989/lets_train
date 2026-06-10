# Module: Calendar

The home tab — month/week date strip + a day's scheduled workouts. This screen is the **visual reference (source of truth) for the whole design system**: when other modules look inconsistent, match them to Calendar.

## Files
- `CalendarPage.jsx` — playbook wrapper. State toggle: `with-items` / `empty`. Renders `<CalendarScreen hasItems={…} />`.
- `CalendarScreen.jsx` — the phone screen.
- `index.js` — exports `CalendarPage`, `CalendarScreen`.

## Structure (top → bottom)
1. **Glass slab header** (`NavBar` recipe): `--glass-slab` + `blur(8px)`, top/bottom `1px rgba(var(--overlay-rgb),0.05)`, header shadow. Full-bleed, **no radius**.
   - Top bar: 48×48 glass icon buttons (`--glass-control`, border `rgba(var(--cs-outline-rgb),0.5)`, card shadow), centered title (`title-large`) + month (`body-small`). The **left ☰ button opens the side drawer**; the right gear is a stub.
   - Date row: 7 `DateCell`, `gap 6`, centered. States: default / today / selected.
2. **Schedule section** — `ScheduleHeader` (title-large + subtitle + Glass `FAB` 52), then the **selected-day summary** (`DaySummary`), then a list of `TaskItem` cards (gap 14). Empty state = centered placeholder card (summary hidden).
   - `DaySummary` — **one glass card, calm progress rows**: **Workouts** (`Workouts` label + `n of N done` + a single completion bar; from `TASKS`) and **Nutrition** (`n / goal kcal` overall + a **3-section macro bar** — protein / carbs / fat, each filling toward its own goal in `MealPreview` macro colors — with per-section `cur / goal g` labels; demo `NUT` incl. `pGoal/cGoal/fGoal`). The earlier dashboard/merged/chips/rings explorations were dropped in favor of this.

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
