# Module: Calendar

The home tab — week strip / inline month grid + the selected day's schedule (workouts + meals). This screen is the **visual reference (source of truth) for the whole design system**: when other modules look inconsistent, match them to Calendar.

## Files
- `CalendarPage.jsx` — playbook wrapper. Four phones: `Today — week` (May 13) / `Light day` (May 14) / `Month open` / `Empty day` (May 16). Renders `<CalendarScreen initialDay={…} initialMonthOpen={…} />`.
- `CalendarScreen.jsx` — the phone screen (state: month items, selected day, monthOpen). Drawer/EmptyState/icons live here.
- `calendarModel.js` — **single source of demo data**: deterministic May 2026 (today = Wed 13), every day gets typed items (`kind: 'workout' | 'meal'`, meals carry kcal + p/c/f) with statuses + a readiness value. Weekday templates: Mon/Wed/Fri full, Sun/Thu light, Tue/Sat empty; past days mostly done with deterministic gaps, future all planned. Items scheduled by the plan carry `fromPlan: true` (`PLAN.name` = "Push / Pull / Legs"); a couple per day are ad-hoc (Mobility, Yoga). `WEEKS` = 6 Sun-first rows with `null` placeholders for the neighbouring-month edges. Derived helpers: `computeDayStats`, `computeNut`, `dayDot`; ops: `toggleItem` (index-based), `patchDay`.
- `CalendarWidgets.jsx` — `SegmentBar`, `DaySummary`, `ReadinessCard`, `MonthGrid`.
- `index.js` — exports `CalendarPage`, `CalendarScreen`.

## Structure (top → bottom)
1. **Glass slab header** (`NavBar` recipe): `--glass-slab` + `blur(8px)`, full-bleed, **no radius**.
   - Top bar: 48×48 glass icon buttons (☰ opens the drawer; gear is a stub), centered title (`title-large`) + **"May 2026 ⌄" subtitle-button** — the quiet week⇄month toggle (chevron rotates 180° when open). No separate controls row.
   - **Date strip** below — one of two states **in place** (never a dialog), wrapped in a **horizontal swipe area** (pointer-drag with /2 resistance, ±70px clamp, 60px commit threshold; snaps back on release): week view swipes page **weeks**, month view swipes page **months**.
     - *Week row* — 7 `DateCell`s of the week containing the selected day (null edge days render as empty 52×76 spacers). Tappable; `completed` dot derived live (all items checked → emerald). Selected-cell glow was **reduced** to `0 3px 10px @0.25` (was 6/18 @0.45) — same value in the month grid.
     - *Inline month grid* (`MonthGrid`) — **one quiet container**, not a tile wall: a single `--cs-surface-container` panel with `radius-2xl` (reads as one card, like the week strip reads as one row), weekday header in the DateCell weekday type, **transparent 46px day cells** inside. The only accents: selected = DateCell gradient pill (`radius-lg`, reduced glow), today = 1px primary ring @0.35, 4px status dot per day (emerald done / muted-error missed / slate has-items). Tapping a day selects it and collapses back to the week row. Earlier explorations (bare transparent grid; per-cell surface tiles) read as foreign — don't resurrect.
     - *Ghost months* — swiping the month grid left/right shows **April / June 2026** (`NEIGHBOR_MONTHS`: label + lead + days only): muted non-interactive numbers, header label follows; there is no demo data outside May by design. Offset resets on day select / view toggle.
2. **Schedule section** — a **quiet date caption** (`body-medium`, on-surface-variant: "Wednesday, May 13" — the old `ScheduleHeader` block with its title + 52px FAB was removed in favor of the floating FAB menu), then **`ReadinessCard`** (today only: "How are you today?" + Good/Okay/Rough chips in status colors; collapses to a one-line `Readiness: …` with edit once answered), then `DaySummary`, then `TaskItem` cards (gap 14; **whole card tap toggles** Completed⇄Planned). Bottom padding 96 so the list clears the FAB footer. Empty state = centered placeholder card (summary hidden).
3. **FAB menu footer** — shared **`FabMenu`** (`components/FabMenu.jsx`, same recipe as Workout Builder: right-flush 50×50 glass square in a gradient-fade footer, morphs into a glass panel). Actions:
   - `Schedule workout` — adds a Planned ad-hoc workout to the selected day,
   - `Schedule meal` — adds a Planned ad-hoc meal,
   - `Log meal` (divider above) — adds a meal **immediately marked Completed** (eaten now, not planned).
   Added items are ad-hoc (no `fromPlan`) so they render without the plan tag. The FAB floats over the list and works in both week and month views.
   - `DaySummary` — one glass card, two sections: **Workouts** (`n of N · m exercises`, collapsing to `Completed/Planned · m exercises` for a single workout; emerald segments, plus the load line below) and **Nutrition** (`n / goal kcal`, 1 segment per meal in `--cs-primary`, macro legend `P/C/F cur / goal g`).
   - **Load line** — lives INSIDE the Workouts section, under the segment bar (no own label — mirrors the macro legend under the nutrition bar). Shown only when ≥1 workout is completed: `7,862 kg · 799 AU · 110 min · 36 of 45 sets measured` (kg/AU emphasized 500). Two scales on purpose, external + internal load are never merged into one number: tonnage counts ONLY weight-logged sets (`setsMeasured` keeps it honest when part of the session is RPE/time-based); AU = sRPE (session RPE × minutes, Foster). Data: completed workouts carry `result = { hardSets, setsMeasured, minutes, sessionRpe, tonnage }` (deterministic `makeResult`; attached on completion — incl. card-tap toggle — removed on untoggle); the day aggregate is `computeDayLoad` (null → line hidden). Future e1RM engine (any weight+reps+RPE set → Epley with RIR → converts RPE/%1RM sets to kg) raises `setsMeasured` coverage without schema changes.
   - `TaskItem` right labels 10/500: Done (emerald) / Missed (muted error, past days). **Plan tag**: items with `fromPlan` get a third meta segment — mini calendar glyph + plan name in `--cs-primary` — ad-hoc items omit it (this replaces the earlier header-level plan badge: ad-hoc items don't belong to the plan, so the tag lives on the item).
4. Side drawer + Libraries overlay — unchanged (see below).

## Side drawer (`SideDrawer` in `CalendarScreen.jsx`)
Left slide-in (scrim + 296-wide `--glass-popover` panel). Opened by the ☰ button. Contents:
- **Short profile** — gradient-ring avatar (initials) + name + email (demo `USER`); tap closes (stub).
- **Libraries nav** — rows for `exercises · workouts · meals · plans` (`LIBS`); tapping opens that library full-overlay via `LibrariesView` (`mode='browse'`).

## Reference tokens (reuse these everywhere)
- Icon button: 48 top-level / 44 in-flow, radius-xl, glass bg + border 0.5 + `--shadow-card`.
- Section padding `24px 16px`; card list gap `14`.
- Type via tokens, weights **400/500 only**.
- Status via 5px accent strip (`emerald` completed / `slate` planned) + quiet right label, not pills.

## Shared deps
`../../components`: `PhoneFrame`, `StatusBar`, `DateCell`, `TaskItem`, `FabMenu` (+ `GlassCard` transitively). Drawer nav reuses `LibrariesView` from `../libraries/`. `ScheduleHeader` is no longer used here (kept in components/ as the Figma reference).

## Scope
Dark mode only, slate accent, iPhone 15 Pro Max. One static month (May 2026) with deterministic demo data; real date logic and month paging are out of scope. Dropped explorations (do not resurrect without asking): header plan badge, week chevrons + pill ViewToggle row, FAB add-menu/quick-log, item detail / nutrition bottom sheets, Partial status, runner integration, week-stats card, Progress module.
