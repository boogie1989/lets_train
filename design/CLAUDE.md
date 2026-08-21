# Fitness Mobile App — Design System (Figma)

This document is the handoff manual for any future agent working on the Figma design system that was built from this codebase. Read it end-to-end before touching any Figma file.

## 0. Code structure — feature modules

The React playbook under `design/src/` is organised into **feature modules**. Each tab/screen is self-contained in its own folder.

```
src/
  modules/
    <feature>/            e.g. calendar, workout-runner, workout-builder, exercises
      <Feature>Page.jsx   playbook wrapper (renders the screen + its variants)
      <Feature>Screen.jsx the phone screen(s)
      index.js            barrel exporting the module's page + screen(s)
      CLAUDE.md           ← per-module notes (read this before touching the module)
    index.js              barrel re-exporting every module's Page
  components/             shared primitives (PhoneFrame, NavBar, GlassCard, …)
  tokens/tokens.css       design tokens (colors, type, radius, shadows)
  pages/                  common, non-feature playbook pages only (Theme, UiKit)
  App.jsx                 nav; imports module Pages from ./modules, common from ./pages
```

**Rule — every new tab/screen MUST be its own module folder under `src/modules/<feature>/` with its own `CLAUDE.md`.** Steps to add one:
1. Create `src/modules/<feature>/` with `<Feature>Page.jsx`, `<Feature>Screen.jsx`, an `index.js`, and a `CLAUDE.md` describing the module (purpose, files, variants, key decisions, shared deps).
2. Screens import shared primitives from `../../components`; the page imports its screen from `./<Feature>Screen.jsx`.
3. Re-export the page from `src/modules/index.js`, then add it to the `NAV` array in `App.jsx`.
4. Reuse `components/` + `tokens/` — don't duplicate primitives into a module. Match the **Calendar** module's visual language (it's the reference).

**Frames:** screens are phone-first (`PhoneFrame`, iPhone 15 Pro Max). The Calendar module additionally carries approved tablet-portrait (`TabletFrame`, iPad Pro 12.9") and desktop (`DesktopFrame`, 1512×982) variants — an explicit scope exception (2026-07); other modules stay phone-only unless approved.

The rest of this document covers the Figma side of the system.

## 0.5 CURRENT Figma target — "Let's Train" file (2026-07, supersedes the Library scheme below)

The design system + calendar screens were rebuilt from scratch in the single Figma file **"Let's Train"** via the **Figmosha bridge** (local plugin + HTTP server on `127.0.0.1:8787/exec`; POST `{"code": js}` executes in the Figma plugin context; the plugin window must stay open in Figma Desktop). The old multi-file Library scheme described in §1–§14 below is **legacy** — kept for reference only; do not resume its migration plan.

Build scripts + shared helper prelude live in the session scratchpad (`lib.js`, `s0_*..s7_*.js`) — each script is idempotent (deletes its own output by name before rebuilding).

**Pages**
- `01 — Foundations` — color swatch boards (fills bound to variables), typography ramp, dimensions chips, effect/gradient specimens. Labels carry the Flutter accessor strings.
- `02 — UiKit` — 20 icon components (`Icon/*`) + 13 variant sets + singles: SurfaceContainer, IconButton, DateCell, MonthDayCell, TaskItem (16 variants, text props title/time/meta/planName), FabMenu, StatusBar, Snackbar, EmptyState, SectionLabel, Button (24), FAB, Checkbox, Segmented, ViewToggle, Stepper, SearchInput, TagChip, DropdownMenu, ConfirmDialog, NavBar, TitleDescription, StatusBadge, SmokeLayer, PhoneFrame.
- `03 — Calendar` — 4 phone screens (430×932): `Screen / Today — week`, `Month open`, `Empty day`, `Detail open` (clones of Today with swapped sections). Tablet/desktop intentionally NOT transferred (user decision, 2026-07).

**Naming contract (Dev Mode ↔ Flutter, the whole point)**
- Variables collection `Color` (single **Dark** mode — the file's Figma plan does not allow a second mode; light values live only in code): `colorScheme/*` (34 M3 roles), `customColors/*` (24, incl. the shipped deviation dark `glassMid`=`glassHigh`=rgba(21,21,24,.72)), `screenBackground/*` (base + smoke1..6, dark = tokens.css × 0.9 per `darken(.1)`).
- Collection `Dimensions`: `dimensions/radius*`, `dimensions/space*` — ONLY the steps that exist in `DimensionsExtension`. Off-grid values (TaskItem pad 18/20, timeline gap 14, cells 46/52/76) are deliberately raw numbers.
- Text styles `textTheme/displayLarge…labelSmall` = Flutter `textTheme.*`. Effect styles `surface/glassLow|Mid|High` (BG blur + 2 shadows + inner highlight), `shadow/card|header|fab`. Paint styles `gradient/slateAccent` (stops bound to accentGradient vars), `gradient/carbonBase`.
- `rgba(var(--x-rgb),α)` composites = variable-bound paint + paint `opacity` (Dev Mode shows `customColors/overlay · 6%` → Flutter `token.withValues(alpha: .06)`).

**Figmosha/plugin-API gotchas discovered during the build (in addition to §8 below)**
1. `setBoundVariableForPaint` drops paint `opacity`, and the fills/strokes SETTER re-initializes opacity from the variable's alpha on FIRST bind-assignment. Fix: assign twice — bind, then re-assign the stored paint with the intended opacity (`SETF`/`SETS` in lib.js).
2. `node.clone()` re-normalizes bound-paint opacity the same way — walk source & clone in parallel and re-assign (`CLONE_FIX`).
3. Absolutely-positioned children of an auto-layout frame DRIFT when the frame reflows (slab hairlines) — re-anchor after any height change.
4. Variable modes beyond 1 are plan-gated ("Limited to 1 modes only" on free plan).
5. Instance children can't be removed; recolor icons by re-assigning their strokes/fills (allowed as overrides).
6. The Figmosha plugin window closing = "plugin not connected" — reopen it in Figma Desktop; scripts are idempotent, re-run the last one.

## 1. What this is

`Fitness_Mobile_App_Design/` is a React + Tailwind reference codebase for a fitness mobile app. Its visual language has been translated into a structured Figma design system that follows **Flutter's Material 3 ColorScheme + TextTheme contracts**.

The design system is **split across multiple Figma files**: a single shared **Library** file holds tokens + components, and each screen lives in its own file that subscribes to the Library.

- **Source of truth (code):** `Fitness_Mobile_App_Design/` (this folder)
- **Library file (shared, must be published as a Team Library):** [Fitness — Library, fileKey `hAySULPo0HC2KkzDGU8Ev8`](https://www.figma.com/design/hAySULPo0HC2KkzDGU8Ev8/Fitness) — holds Foundations + Components ONLY. No screen frames live here.
- **Screen files (one per screen):**
  - `Fitness — Calendar`, fileKey `<TBD — assign once the file is created>` — Calendar screen. Migration from the Library file is pending — see §14.
  - Future screens follow the same naming pattern: `Fitness — <ScreenName>`.
- **Plan archive:** `/Users/sbuhai/.claude/plans/senior-figma-memoized-jellyfish.md`

Each screen file is intentionally minimal — one fully polished mobile frame, plus optional state variants. Cross-screen primitives (variables, paint/text/effect styles, components) live ONLY in the Library file and are consumed via subscription. Do not duplicate tokens into a screen file or detach Library components there.

## 2. Locked decisions (do not relitigate)

- **Theme:** Dark mode only.
- **Accent preset:** `slate` (from `ColorContext.tsx`'s 6 presets). Do not implement purple/blue/red/green/orange.
- **Typography:** Inter (Regular 400 + Medium 500) with `system-ui` fallback. No other weights.
- **Device:** iPhone 15 Pro Max (430 × 932 pt, corner-radius 55, Dynamic Island 126 × 37 @ y=11).
- **Material 3 mapping:** every M3 ColorScheme role exists as a Figma variable even when several roles share a hex.
- **TextStyle annotation format:** specs are documented as `TextStyle(fontFamily: 'Inter', fontSize, fontWeight, height, letterSpacing)` strings on the Foundations page.
- **Gradients live as styles** — not raw fills on instances. Stop colors are bound to color variables where Figma supports it.
- **Code Connect:** out of scope (license-gated in this file).
- **Backgrounds on screens:** solid `#000000` + smoke layer. Carbon-fiber gradients exist as Foundations styles but are not applied on the screen.

## 3. Figma file pages

### 3.1 Library file (`Fitness — Library`)

| Page | Purpose | Notes |
|---|---|---|
| `00 — Cover` | File cover (1600 × 900) | Title, version, theme tag, build date |
| `01 — Foundations` | Tokens & styles documentation | Colors, Typography, Radius, Spacing, Effects, Gradients |
| `02 — Components` | Component library | 16 components, 45 variants |

The Library file has **no `03 — Screens` page** — screens never live here. When you add a component, place it on `02 — Components` in a labeled section, then re-publish the library so the screen files pick it up.

### 3.2 Screen files (`Fitness — <ScreenName>`)

| Page | Purpose | Notes |
|---|---|---|
| `00 — Cover` | File cover (1600 × 900) | Screen name, status, build date, mock device |
| `01 — Screen` | The screen frame | One polished iPhone 15 Pro Max frame; optional state variants placed to the right |

Screen files subscribe to the published Library. All variables, paint styles, text styles, effect styles, and components used in the screen must come from the Library — never duplicated locally. The only nodes a screen file should own are the screen frame(s) and any one-off compositions specific to that screen.

## 4. Variable collections

Four collections, single mode each. Designed so that a future `Light` mode can be added without renaming.

### 4.1 Color collection (71 variables)

Two layers:

**Primitives** (16) — raw hex, used inside semantic aliases and gradient stops:
`primitive/slate/{300,400,500,600,700,800}`, `primitive/zinc/{700,800,900,950}`, `primitive/gray/600`, `primitive/neutral/600`, `primitive/emerald/{400,500}`, `primitive/white`, `primitive/black`.

**Semantic / M3 roles** (55) — each bound to a primitive alias or set to an rgba composite:

- Material 3 ColorScheme: `color/primary`, `color/onPrimary`, `color/primaryContainer`, `color/onPrimaryContainer`, `color/secondary`, `color/onSecondary`, `color/secondaryContainer`, `color/onSecondaryContainer`, `color/tertiary`, `color/onTertiary`, `color/tertiaryContainer`, `color/onTertiaryContainer`, `color/error`, `color/onError`, `color/errorContainer`, `color/onErrorContainer`, `color/surface`, `color/onSurface`, `color/surfaceDim`, `color/surfaceBright`, `color/surfaceContainerLowest`, `color/surfaceContainerLow`, `color/surfaceContainer`, `color/surfaceContainerHigh`, `color/surfaceContainerHighest`, `color/onSurfaceVariant`, `color/outline`, `color/outlineVariant`, `color/shadow`, `color/scrim`, `color/inverseSurface`, `color/inverseOnSurface`, `color/inversePrimary`, `color/surfaceTint`
- Charts: `color/chart/1..5`
- Status: `color/status/completed/{fg,bg,border}`, `color/status/planned/{fg,bg,border}`
- Atmosphere: `color/smoke/1..6`, `color/vignette/tr`, `color/vignette/bl`, `color/carbonWeave`, `color/carbonHighlight`

**Source mapping** (where these come from):
- `Fitness_Mobile_App_Design/src/styles/theme.css` — dark CSS variables (only dark values used)
- `Fitness_Mobile_App_Design/src/app/contexts/ColorContext.tsx` — slate preset smoke/glass values
- `Fitness_Mobile_App_Design/src/app/components/SmokeBackground.tsx` — 6 sphere positions/sizes/blur radii

### 4.2 Radius collection (7)
`radius/{none=0, sm=6, md=8, lg=10, xl=14, 2xl=16, pill=9999}` — base `--radius` is 10 (= 0.625rem from theme.css).

### 4.3 Spacing collection (12)
`space/{0=0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80}` — 4-point scale.

### 4.4 Typography collection (62)
- `font/family/primary = "Inter"`
- `font/family/fallback = "system-ui"`
- For each of the 15 M3 TextTheme roles below, 4 variables: `{role}/size`, `{role}/weight`, `{role}/lineHeight`, `{role}/tracking`.

Roles & values:

| Role | Size | Weight | Line | Tracking | Source mapping |
|---|---|---|---|---|---|
| `display/large` | 57 | 400 | 64 | -0.25 | M3 default |
| `display/medium` | 45 | 400 | 52 | 0 | M3 default |
| `display/small` | 36 | 400 | 44 | 0 | M3 default |
| `headline/large` | 32 | 500 | 40 | 0 | M3 default |
| `headline/medium` | 28 | 500 | 36 | 0 | M3 default |
| `headline/small` | 24 | 500 | 36 | 0 | `h1` (text-2xl, medium, line 1.5) |
| `title/large` | 20 | 500 | 30 | 0 | `h2` (text-xl) |
| `title/medium` | 18 | 500 | 27 | 0.15 | `h3` (text-lg) |
| `title/small` | 14 | 500 | 20 | 0.1 | M3 default |
| `body/large` | 16 | 400 | 24 | 0.5 | `input` (text-base 400, line 1.5) |
| `body/medium` | 14 | 400 | 20 | 0.25 | M3 default |
| `body/small` | 12 | 400 | 16 | 0.4 | M3 default |
| `label/large` | 16 | 500 | 24 | 0.1 | `h4` / `label` / `button` |
| `label/medium` | 12 | 500 | 16 | 0.5 | M3 default |
| `label/small` | 11 | 500 | 16 | 0.5 | M3 default |

## 5. Styles

### 5.1 Paint styles (55)
One paint style per semantic color variable. Style names omit the `color/` prefix and use `/` for hierarchy (e.g. `surfaceContainer`, `status/completed/fg`, `smoke/1`). Every paint style has its color bound to its corresponding variable.

### 5.2 Text styles (15)
One per M3 TextTheme role (`display/large` … `label/small`). Each style binds `fontFamily`, `fontSize`, `lineHeight`, `letterSpacing` to the matching typography variables. `fontWeight` is set via the `fontName.style` ("Regular" or "Medium") and is not variable-bound (Figma limitation for fontStyle).

### 5.3 Gradient paint styles (10)
On the Foundations page each is shown as a 280 × 160 swatch with caption + bound-variable chips.

| Style | CSS source | Bound stops |
|---|---|---|
| `gradient/slate-accent` | `linear-gradient(135deg, #94A3B8 → #475569)` | `slate-400`, `slate-600` |
| `gradient/carbon-base` | `linear-gradient(180deg, #18181B → #09090B)` | `zinc-900`, `zinc-950` |
| `gradient/carbon-weave-a` | repeating 45° (approximated as 3-stop linear) | `color/carbonWeave` |
| `gradient/carbon-weave-b` | repeating −45° | `color/carbonWeave` |
| `gradient/carbon-highlight` | fine 4px grid `rgba(255,255,255,.03)` | `color/carbonHighlight` |
| `gradient/vignette-tr` | radial top-right | `color/vignette/tr` |
| `gradient/vignette-bl` | radial bottom-left | `color/vignette/bl` |
| `gradient/vignette-center` | radial center → scrim | `color/scrim` |
| `gradient/accent-bar` | horizontal transparent → slate-600 → transparent | `slate-600` |
| `gradient/smoke-composite` | preview only (radial slate-500) | `color/smoke/5` |

> Figma supports binding **stop colors** to variables but not **stop positions or angles**. The carbon-weave gradients are visual approximations of the original CSS `repeating-linear-gradient(...)`.

### 5.4 Effect styles (8)
- `elevation/card` — drop shadow Y8 blur24 `color/shadow` (black @40%)
- `elevation/fab` — drop shadow Y6 blur16 `slate-600` @30%
- `elevation/header` — drop shadow Y12 blur32 black @60%
- `blur/glass` — background blur 16
- `blur/smoke/sm` — layer blur 80
- `blur/smoke/md` — layer blur 100
- `blur/smoke/lg` — layer blur 120
- `blur/smoke/xl` — layer blur 140

> Effect values (blur radius, shadow offset) cannot be bound to variables. Only shadow color is variable-bindable.

## 6. Components (16 total, 45 variants)

All fills/strokes/text reference styles or variables — no raw hex on instances.

| Component | Variants / properties | Source code mapping |
|---|---|---|
| `GlassCard` | `level=Low,Mid,High` | base glass surface; `bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm` |
| `IconButton` | `size=sm(32),md(40),lg(48) × state=default,hover,disabled` | header buttons from `CalendarHeader.tsx` |
| `FAB` | `size=40,56 × style=Gradient,Glass` | add-workout floating action button |
| `StatusBadge` | `status=Planned,Completed` | from `TaskItem.tsx` (`bg-emerald-500/20`, `bg-zinc-800/50`) |
| `WeekdayLabel` | text override | from `Calendar.tsx` weekday row |
| `DateCell` | `view=Week × state=default,today,selected,otherMonth`, sized 52×76 | from `Calendar.tsx` week-view cells |
| `ViewToggle` | `value=Week,Month` | from `Calendar.tsx` Week/Month pill toggle |
| `CalendarHeader` | text props | original chevron+title — currently unused on the final screen |
| `TopAppBar` | text + side icons | from `CalendarHeader.tsx` (menu / Calendar / settings) — currently unused on the final screen as a standalone instance (replaced inline) |
| `ScheduleHeader` | title + subtitle + FAB | from `ScheduleHeader.tsx` |
| `TaskItem` | `status=Planned,Completed` | from `TaskItem.tsx` — replaced inline on the final screen with refined accent-strip variant |
| `Checkbox` | `size=sm,md,lg × state=unchecked,checked,disabled` | from `Checkbox.tsx` |
| `SearchInput` | `state=default,focused,filled,disabled` | from `ExercisePicker.tsx` search bar |
| `StatusBar` | iPhone status bar 430 × 44 | system |
| `SmokeLayer` | 6 layered blur ellipses | from `SmokeBackground.tsx` (slate preset) |
| `PhoneFrame · iPhone 15 Pro Max` | 430 × 932, corner-radius 55, smoke + black bg + Dynamic Island | device wrapper |

## 7. The Calendar screen (final)

Lives in its own file: `Fitness — Calendar` (fileKey `<TBD>`), on page `01 — Screen`. Frame name: `Calendar — iPhone 15 Pro Max`, 430 × 932. Structure top → bottom:

1. **PhoneFrame instance** — provides black background + smoke layer + Dynamic Island.
2. **StatusBar instance** — `9:41` left, signal/wifi/battery right.
3. **Unified glass slab** (`Calendar Card`) — `bg-zinc-900/30 backdrop-blur-xl shadow shadow-black/60 border-white/5`, full-bleed 430 wide, padding 16, **no corner radius** (matches `CalendarScreen.tsx` line 40). Contains:
   - **Top Bar** — three columns. Left: 48 × 48 menu button (`zinc-800/60 border zinc-700/50 rounded-xl shadow-lg`). Center: stacked text (`Calendar` in `title/large` + `May 2026` in `body/small`/`onSurfaceVariant`). Right: 48 × 48 settings button (same style as menu).
   - **Date row** — 7 DateCells (52 × 76 each, `itemSpacing=6`, primaryAxisAlignItems=CENTER). Order **Sun-first** to match `Calendar.tsx`. Target Thu May 14 2026: Sun 10, Mon 11, Tue 12, Wed 13 (today: dimmed slate-600 @ 35% ring), Thu 14 (selected: `gradient/slate-accent` + refined glow), Fri 15, Sat 16.
4. **Mobile content column** — auto-layout vertical, padding 16/16 horizontal, padding 24 top/bottom, gap 14.
   - **Schedule header (simple)** — `Schedule` (title/large) + `Thursday, May 14` (body/medium / onSurfaceVariant) left, 52 × 52 plus FAB right (`zinc-800/60` style, matches top bar buttons). Extra `paddingLeft = 8` for `1.5×` left offset (= 24 px from screen edge).
   - **Task list** — 7 custom cards (not the `TaskItem` component instance — they were detached and rebuilt to use the refined design). Each card:
     - HORIZONTAL frame, 398 wide, HUG height (~88 px)
     - 5 px **accent strip** at left edge: solid `emerald-500` if Completed, `slate-500` if Planned
     - Content padding 20 / 18, vertical gap 10
     - Title `Inter Medium 17 / line 24` (custom, between `label/large` and `title/medium`)
     - Meta row: `clock 13 + time 13 medium` · 3 × 3 dot @ 25% · `activity 13 + count 13 regular @70%`
     - Effects: ambient drop shadow Y4 blur12 black@25% + key Y10 blur24 spread −2 black@35% + inner highlight 1 px white@5%

Task data (7 tasks):

| Title | Time | Exercises | Status |
|---|---|---|---|
| Morning Strength | 07:00 AM | 8 | Completed |
| Mobility Training | 08:30 AM | 7 | Completed |
| Leg Day | 10:00 AM | 12 | Planned |
| HIIT Cardio | 12:00 PM | 6 | Planned |
| Core Workout | 03:00 PM | 10 | Planned |
| Upper Body | 05:00 PM | 9 | Planned |
| Evening Yoga | 06:30 PM | 5 | Planned |

## 8. Critical gotchas — read before writing code

These are the bugs we hit during construction; future agents will hit them too unless they remember:

1. **`resize()` resets sizing modes to FIXED.** If you set `primaryAxisSizingMode = "AUTO"` then call `resize(390, 1)`, the AUTO is silently overwritten. **Order matters:** set sizing modes AFTER resize, or set them, *then* resize, *then* set them again to override. Symptoms: components show up as 1-px-tall flat lines.

2. **`figma.currentPage = page` does NOT work in `use_figma`.** Always use `await figma.setCurrentPageAsync(page)`. The sync setter throws.

3. **Page context resets between `use_figma` calls.** Re-call `setCurrentPageAsync(...)` at the start of every script that targets a non-default page.

4. **Font loading is mandatory before any text operation.** Preload `Inter Regular` and `Inter Medium` at the top of every script that creates or modifies text. Failing to do this errors silently or breaks the whole script.

5. **`figma.notify()` throws.** Use `return` for output. `console.log()` is invisible.

6. **`figma.createComponent()` does not auto-enable layoutMode.** You must set `layoutMode = "VERTICAL"` (or HORIZONTAL) explicitly. Children that try to use `layoutSizingHorizontal = "FILL"` on a non-auto-layout parent will throw `"node must be an auto-layout frame..."`.

7. **`layoutSizingHorizontal/Vertical = 'FILL'` must be set AFTER `parent.appendChild(child)`.** Setting before append throws.

8. **`use_figma` scripts are atomic.** If a script errors at line 60, lines 1–59 are NOT committed. You start clean on the next attempt. This is good — but it means a half-written change leaves nothing behind.

9. **Detached instances get a new node ID.** If you `instance.detachInstance()`, the returned node has a new ID. Subsequent scripts cannot reach it via the old ID. Either return the new ID immediately, or re-find the node by name/structure traversal.

10. **Glass-morphism (`backdrop-blur`) requires sibling-stacking.** Figma's background-blur effect only blurs what's rendered BEHIND a node *within the same frame*. `SmokeLayer` must be a child of the same frame as the glass card, NOT a separate floating background frame.

11. **Variable binding limits:**
    - Gradient stop colors: ✅ bindable
    - Gradient positions, angles: ❌ not bindable
    - Effect blur radius, shadow offset, shadow spread: ❌ not bindable
    - Shadow color: ✅ bindable via `figma.variables.setBoundVariableForEffect(effect, "color", variable)`
    - Text `fontStyle` (Regular vs Medium): ❌ not bindable (Figma uses font name string)

12. **Colors are 0–1 range, NOT 0–255.** Paint `color` objects use `{r, g, b}` only; opacity goes at the paint level (or `a` on raw-rgba paint stops).

13. **Fills/strokes are read-only arrays.** You must clone, modify, and reassign — `fills[0].color = ...` is silently ignored.

14. **`setBoundVariableForPaint` returns a NEW paint.** Capture the returned value and reassign — don't expect in-place mutation.

15. **Code Connect is gated to Organization/Enterprise plans** in this file. Do not call `mcp__plugin_figma_figma__get_code_connect_map` or `send_code_connect_mappings` — they'll error with a permission message. The user has explicitly excluded Code Connect from scope.

16. **Position new top-level nodes away from (0, 0).** Default placement is the origin and will overlap existing content. Find a clear spot first (e.g. to the right of the rightmost existing frame).

17. **Always preload Inter fonts before `loadFontAsync`-dependent operations** such as `setBoundVariable("fontFamily", …)`, `setValueForMode` on font variables, or `setExplicitVariableModeForCollection`.

## 9. How to work across files

Always confirm which file you're operating on before any `use_figma` call — the wrong-file footgun is the worst class of mistake here (you can silently pollute the Library with screen content, or duplicate Library primitives into a screen file). Open `get_metadata` first and verify `fileKey` and the page list match expectations.

### Adding a new screen (creates a new screen file)

1. Load skill `figma:figma-use` first (mandatory).
2. Create a new Figma file `Fitness — <ScreenName>` in the same team as the Library (manual UI step, or via Figma REST if available).
3. In the new file, subscribe to the published `Fitness — Library`: `Assets panel → Libraries → enable Fitness — Library`. All variables, paint/text/effect styles, and components become available as **remote** assets.
4. Set up pages: `00 — Cover` and `01 — Screen`. Delete the default "Page 1".
5. On `01 — Screen`, drop an instance of `PhoneFrame · iPhone 15 Pro Max` from the Library. Compose using Library components only. Reuse before creating new.
6. Override text via `instance.findOne(n => n.type === 'TEXT').characters = '...'`.
7. If you need a one-off composition specific to this screen (e.g. the refined Calendar task card), build it locally in the screen file but bind every fill/stroke/text to a **remote** Library variable or style — never to raw hex.
8. Record the new file's `fileKey` in §1 of this `CLAUDE.md`.

### Adding a new component (Library file)

1. Load skills `figma:figma-use` + `figma:figma-generate-library`.
2. Open the Library file (`fileKey=hAySULPo0HC2KkzDGU8Ev8`). Switch to `02 — Components`.
3. Use `figma.combineAsVariants([...components], parent)` to make a variant set.
4. Every fill/stroke/text MUST reference an existing variable or style — never raw hex.
5. Define component properties (`addComponentProperty`) for any text or boolean toggles you expect to override.
6. **Re-publish the Library** (manual UI: Assets → Publish library, or via REST). Screen files won't see the new component until they accept the library update.

### Editing tokens (Library file)

1. Open the Library file. Variables propagate inside the file automatically; downstream screen files update once they accept the published library version.
2. Do not duplicate variables. Check `getLocalVariablesAsync("COLOR")` first.
3. When updating a primitive (e.g. `slate-600`), all dependent semantic variables and gradient stops update through their bindings.
4. After any token change, **re-publish** and verify each screen file accepts the update.

### Taking screenshots for review

Library frames:
```
mcp__plugin_figma_figma__get_screenshot
  fileKey=hAySULPo0HC2KkzDGU8Ev8         # Library
  nodeId=<frame-id>
  maxDimension=1200
```

Screen frames:
```
mcp__plugin_figma_figma__get_screenshot
  fileKey=<screen-file-fileKey>          # e.g. Fitness — Calendar
  nodeId=<frame-id>
  maxDimension=1200
```

Then download the PNG via `curl -o /tmp/<name>.png "<url>"` and `Read /tmp/<name>.png` to view.

## 10. Visual style — what "good" looks like here

Polish principles applied to the Calendar screen (use these as defaults):

- **Unified glass slab** for header + calendar — single container, `bg-zinc-900/30`, backdrop-blur-xl, shadow-xl black @60%, white-5 border, **no border radius** (matches the source `CalendarScreen.tsx`).
- **Tight rhythm in date rows** — `itemSpacing=6` + `CENTER` alignment, not `SPACE_BETWEEN` (which spreads too widely on Pro Max).
- **Today indicator = subtle ring** (slate-600 @ 35%, 1 px). Not a glowing border. Not a dot.
- **Selected indicator = refined glow** — reduced to `slate @ 25%` Y3 blur10 + 1 px inner white highlight @ 20% (the earlier Y6 blur18 @ 45% read too heavy on date cells; the Figma file still carries the old value — update on next sync). Avoid heavy shadows on small elements.
- **TaskItem volume** = ambient + key drop shadows + inner highlight. NOT a single big drop shadow (looks like a sticker).
- **Status via accent strip**, not pills. 5 px solid color on the left edge: `emerald-500` for completed, `slate-500` for planned.
- **Typographic hierarchy in cards** — title `Inter Medium 17 / 24`, meta `13 / 18`. Bigger size delta than the M3 default (which can feel flat on a glass card).
- **Time vs count weight asymmetry** — time `Medium`, count `Regular @ 70%`. Time is the primary information; count is secondary.
- **FAB matches header button style** (`zinc-800/60`, `rounded-xl 14`, drop shadow). 52 × 52 — slightly larger than the 48 × 48 header buttons. Do not use the slate gradient on the FAB — it competes with the selected date cell.
- **FabMenu is THE page-level action menu, app-wide** (`src/components/FabMenu.jsx`). Every screen that needs add/page actions uses this one pattern — do not invent per-screen FABs, bottom sheets, or button rows for it. Recipe: a right-flush **50×50 glass square** (`radius-xl`, glass-control — never a circle, never the slate gradient) sitting in a footer with a surface gradient fade; tap = **container transform** — the square morphs into a glass panel (`radius-2xl`, `--glass-popover`, 0.32s `cubic-bezier(0.4,0,0.2,1)`), the `+` rotates 45° into `×` pinned to the corner, items (15px/500, padding 12) stagger-fade in (0.1s + 40ms·i); backdrop click or `×` reverses the morph. API: `actions = [{ label, icon, onClick, primary?, dividerAbove? }]` — panel height derives from the action count; `primary: true` = the screen's submit (primary color, 600); `dividerAbove` separates action groups. In use: Workout Builder (Add exercise / Add superset / Reorder / **Save workout**), Calendar (Schedule workout / Schedule meal / **Log meal** — logged = created already-Completed).

## 11. Quick reference — node IDs (snapshot at end of build)

These IDs are fragile (any rebuild changes them, and the Calendar IDs are invalidated once §14 migration runs). Use as a starting point; verify with `get_metadata` before relying on them.

### Library file (`fileKey=hAySULPo0HC2KkzDGU8Ev8`)

| Object | ID |
|---|---|
| Page `00 — Cover` | `0:1` |
| Page `01 — Foundations` | `3:2` |
| Page `02 — Components` | `3:3` |
| Page `03 — Screens` (legacy — to be deleted in §14) | `3:4` |
| Color collection | `VariableCollectionId:3:5` |
| PhoneFrame component | `43:2` |

### Calendar file (`fileKey=<TBD>`)

| Object | ID |
|---|---|
| Page `01 — Screen` | `<TBD>` |
| Calendar screen frame | `<TBD>` (was `49:141` in the legacy Library `03 — Screens` page) |

## 12. What's NOT in scope (intentional omissions)

- Workout Runner screen
- Settings page
- UIKit showcase page
- Light mode
- Other accent presets (purple, blue, red, green, orange)
- Carbon-fiber background applied to any screen (it's only on Foundations as a gradient style)
- Code Connect mappings
- Animation/transition specs (Tailwind `slide-up` keyframe is documented in `tailwind.css` but not represented in Figma)

If you're asked to add any of these, confirm scope with the user first — they were all explicitly excluded from the initial build. When a new screen is approved, it goes into its own `Fitness — <ScreenName>` file (see §9).

## 13. Skill loading order for any Figma work

1. `figma:figma-use` — **mandatory** before every `use_figma` call.
2. `figma:figma-generate-library` — when working on Library foundations/components.
3. `figma:figma-generate-design` — when composing a full screen from scratch in a screen file (not editing).

Never call `mcp__plugin_figma_figma__use_figma` without loading `figma:figma-use` first. The skill provides critical API rules that prevent the gotchas in section 8.

## 14. Migration plan — Calendar → its own file (pending)

The Calendar screen still lives on the Library file's legacy `03 — Screens` page (node `49:141`). Goal: move it into a new `Fitness — Calendar` file that subscribes to the Library, then delete the Library's `03 — Screens` page so the Library holds tokens + components only.

Prerequisite: a session with the Figma plugin connected (i.e. `mcp__plugin_figma_figma__*` tools must be available). The migration cannot run without them.

Steps:

1. **Publish the Library** (manual, in Figma UI):
   - Open `Fitness — Library` → Assets panel → "Publish library".
   - Publish all 71 color variables, 7 radii, 12 spacing, 62 typography variables, 55 paint styles, 15 text styles, 10 gradient styles, 8 effect styles, and all 16 components.
   - This is a one-time step; subsequent token/component edits require re-publishing.

2. **Create `Fitness — Calendar`** (manual, in Figma UI — the plugin API cannot create new files):
   - In the same team as the Library, `File → New design file` → rename `Fitness — Calendar`.
   - Record its `fileKey` in §1 and §11 of this `CLAUDE.md`.
   - In the new file: Assets panel → Libraries → enable `Fitness — Library`.
   - Set up pages `00 — Cover` and `01 — Screen`. Delete the default "Page 1".

3. **Move the Calendar screen** (scripted, via `use_figma`):
   - In the Library file, on `03 — Screens`, locate the Calendar frame (was `49:141`; verify with `get_metadata`).
   - Export it to JSON via the plugin's serialization helpers, OR rebuild it from scratch in the new file using the same composition described in §7 (preferred, since it forces every binding to resolve to a **remote** Library asset and guarantees no detached duplicates).
   - All variable/style/component references must point to the published Library, not local copies. After build, run an audit script that walks the frame and asserts every fill, stroke, text style, effect, and component instance has `remote: true` (or equivalent).

4. **Delete the Library's `03 — Screens` page** (scripted):
   - Once the Calendar frame is verified in `Fitness — Calendar`, remove page `3:4` from the Library: `page.remove()`.
   - Re-publish the Library to remove any orphan references.

5. **Update `CLAUDE.md`** (this file):
   - Replace `<TBD>` fileKey placeholders in §1 and §11 with the real `Fitness — Calendar` fileKey.
   - Drop the "(legacy — to be deleted in §14)" row from §11.
   - Remove this §14 entirely once migration completes.

Failure modes to watch for:
- **Components consumed as local copies, not remote**: if the Library wasn't published before the Calendar file subscribed, instances may resolve to local duplicates. Verify each component instance has a remote `componentKey` in the audit script.
- **Variables resolving to local placeholders**: same risk. Audit `boundVariables` on every paint/stroke/effect — `id` must reference a remote variable.
- **Calendar screen contains detached custom cards** (the 7 task items in §7) — these were intentionally detached from `TaskItem`. Make sure their fills/strokes/text still bind to **remote** styles and variables in the new file; otherwise raw hex will sneak in.
