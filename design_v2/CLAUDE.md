# Fitness Mobile App — Design System **v2** ("Calm Performance")

`design_v2/` is a from-`design/` rebuild of the playbook in a flatter, data-first
visual language called **Calm Performance**, authored so it translates 1:1 into a
**Flutter** Material 3 app. This document is the handoff manual — read it before
touching anything.

> First iteration scope: **Theme**, **UiKit**, **Calendar** only. Other screens
> (runner, builders, libraries, meal/plan, profile) are NOT ported yet.

## 0. Code structure

Same module layout as `design/` (see that file's §0 for the full convention):

```
src/
  tokens/tokens.css   design tokens — the de-glassed v2 system
  theme/ThemeProvider light+dark, writes [data-theme] on <html> (localStorage 'lt-theme-v2')
  components/          shared primitives (opaque, no GlassCard/SmokeLayer)
  pages/              ThemePage, UiKitPage (token + component showcases)
  modules/calendar/   the only ported screen
  App.jsx             sidebar nav — Theme / UiKit / Calendar
```

## 1. The Calm Performance direction

Why it exists: `design/` looked good but leaned on **dark-only glassmorphism +
animated smoke + backdrop blur + stacked ambient/key/inner shadows** — exactly the
set of effects Flutter renders badly. v2 keeps the slate / Inter / M3 identity but
rebuilds the surface language around what Flutter does well.

**Guiding philosophy: quality-first WITHIN Flutter's strengths.** We do not strip
everything for FPS. We avoid only what Flutter renders badly, and spend the quality
budget on what it renders well.

## 2. Flutter-aware rules (apply to every new component)

AVOID — Flutter renders these badly:
- Runtime / animated **`BackdropFilter`** blur (worst over scrolling content). → use opaque surfaces.
- **Animated large blurred layers** (the old 6-sphere smoke). → static baked background.
- **`inset` / inner shadows** — Flutter `BoxShadow` has no inset. → a 1px top border is the specular substitute.
- **Stacked** ambient + key + inner shadows. → one cheap `BoxShadow` per element.
- **`Opacity`-widget layering** (triggers saveLayer). → bake alpha into colors.

PREFER — spend quality here:
- Opaque **surface elevation ladder** (`--surface-0..4`).
- Single crisp shadow (`--elev-1` / `--elev-2`).
- **1px borders** (`--border-subtle/default/strong`) as the elevation/highlight language.
- **Static gradients** & pre-baked backgrounds (`--bg-gradient`).
- **Tabular figures** for numeric runs (`.tnum` / `fontVariantNumeric:'tabular-nums'` → `FontFeature.tabularFigures()`).
- Size/fade/elevation **morphs** (FabMenu, ItemDetailDialog) → Material **OpenContainer** (NO animated blur).

## 3. Component → Flutter widget map

| v2 component / recipe | Flutter widget |
|---|---|
| `--surface-0..4` ladder | `Material(color: surfaceContainer*)` |
| Card recipe (surface-2 + border + elev-1) | `Card` |
| `iconBtn` (surface-2 + border) | `IconButton.filledTonal` |
| `Button` filled/tonal/outlined/text | `FilledButton` / `FilledButton.tonal` / `OutlinedButton` / `TextButton` |
| `Button` submit | `FilledButton(minimumSize: fullWidth)` |
| `DateCell` selected (flat primary) | `ChoiceChip` / custom paint |
| `ListTile` | `ListTile` (visualDensity comfortable/compact) |
| `FabMenu` morph | `OpenContainer` / `FloatingActionButton` |
| `ItemDetailDialog` morph | `OpenContainer` (size + fade + elevation) |
| undo snackbar | `SnackBar` |
| `SideDrawer` | `NavigationDrawer` |
| dialogs | `Dialog` / `showModalBottomSheet` |
| `--bg-gradient` | `DecoratedBox(LinearGradient/RadialGradient)` |

## 4. Token system (`tokens/tokens.css`)

Carried over unchanged from `design/`: the 15-role M3 `--tt-*` typography (Inter
400/500), `--sp-*` 4pt spacing, `--radius-*`, status colors, `--cat-*` macro
palette, the M3 ColorScheme roles + `-rgb` channels. **Both light + dark kept.**

New / changed in v2:
- **`--surface-0..4`** — opaque elevation ladder (replaces `--glass-*`). Maps to M3 surfaceContainer roles.
- **`--border-subtle/default/strong/highlight`** — the 1px border language (replaces inner highlights).
- **`--elev-1` / `--elev-2`** — two single-`BoxShadow` tiers (replaces `--shadow-card/fab/header/task`).
- **`--bg-gradient`** — the static, baked screen background (replaces smoke + blur). Per-theme.
- **`--accent`** = `--cs-primary` — one semantic accent.
- **`--density-row` / `--density-gap`** — flip via `[data-density="compact"]`.
- **`.tnum`** utility class for tabular figures.
- Dropped: `--smoke-*`, `--blur-*`, carbon/vignette gradients, `--node-center`. `--gradient-slate-accent` kept but selected states default to flat `--cs-primary`.
- **Back-compat aliases**: old `--glass-*` / `--shadow-*` names still resolve (→ opaque surfaces / elev) so any not-yet-restyled shared component renders flat. New code must use `--surface-*` / `--elev-*` / `--border-*`.

## 5. Locked changes vs `design/`

- **Dark-only → light + dark.** The old "dark mode only" lock is lifted (daytime gym + a11y). Theme toggle in the top bar.
- **Glass → opaque surface ladder.** No `backdropFilter` anywhere in the codebase.
- **Animated smoke → one static baked `--bg-gradient`** (quality-first, no runtime blur/animation).
- **Stacked shadows + inner highlights → one `--elev-*` shadow + 1px borders.**
- **One semantic accent**; emerald/amber reserved strictly for status (done/planned/missed).
- **Density modes** added (comfortable default / compact).
- **Numeric values use tabular figures.**
- **Calendar SideDrawer library nav is stubbed** — the Libraries module is not in this iteration; drawer rows close the drawer (no-op).

## 6. Calendar specifics

The Calendar **functionality and data model are identical to `design/`** —
`calendarModel.js` is copied verbatim (week/month strip, ReadinessCard, DaySummary
with tonnage/AU/macros, TaskItem list, ItemDetailDialog with the container-transform
morph, FabMenu, undo snackbar, swipe paging, empty state). Only the visual layer
changed (opaque surfaces, flat selected states, tabular numbers, no blur). See
`modules/calendar/CLAUDE.md`.

## 7. Run & verify

```
cd design_v2 && npm install && npm run dev   # or npm run build
```
Check: nav = Theme / UiKit / Calendar only; toggle dark↔light (surfaces stay opaque
& legible); no blur anywhere; cards separate via surface + 1px border + one soft
shadow; FabMenu and ItemDetailDialog still morph open/closed smoothly; numbers
align in tabular columns; density toggle reflows rows; all Calendar interactions
(swipe weeks/months, detail dialog, reschedule picker, undo, drawer w/ stubbed nav)
work unchanged; the static `--bg-gradient` reads as a quality background, not flat-dead.

## 8. Adding the next screen

Follow `design/`'s module convention (own folder + `CLAUDE.md`), but build it in the
v2 language: `--surface-*` / `--border-*` / `--elev-*`, no glass/smoke/blur, tabular
numbers, density-aware, and label each composed control with its Flutter widget. Reuse
`components/` + `tokens/`; never reintroduce `GlassCard` / `SmokeLayer` / backdrop blur.
