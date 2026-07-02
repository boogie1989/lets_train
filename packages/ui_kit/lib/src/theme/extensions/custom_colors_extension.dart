import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/theme.dart';

/// Custom colors that have no [ColorScheme] role, ported from
/// `design/src/tokens/tokens.css` (status, danger, neutral overlays, glass
/// surfaces, control fills, category palette).
///
/// Smoke / atmosphere tokens (`--smoke-*`, `--app-bg`) intentionally live in
/// `ScreenBackgroundExtension`, not here.
@immutable
class CustomColorsExtension extends ThemeExtension<CustomColorsExtension> {
  static CustomColorsExtension of(BuildContext context) =>
      context.theme.extension<CustomColorsExtension>()!;

  const CustomColorsExtension({
    required this.statusCompleted,
    required this.statusPlanned,
    required this.danger,
    required this.overlay,
    required this.raise,
    required this.glassSlab,
    required this.glassLow,
    required this.glassMid,
    required this.glassHigh,
    required this.glassPopover,
    required this.glassDialogTop,
    required this.glassDialogBottom,
    required this.nodeCenter,
    required this.glassControl,
    required this.glassControlStrong,
    required this.glassControlStronger,
    required this.catGreen,
    required this.catBlue,
    required this.catAmber,
    required this.catPink,
    required this.catViolet,
    required this.catCyan,
  });

  factory CustomColorsExtension.dark() => const CustomColorsExtension(
    // Status
    statusCompleted: Color(0xFF10B981), // emerald-500
    statusPlanned: Color(0xFF64748B), // slate-500
    // Destructive button red (--danger-rgb)
    danger: Color(0xFFD9534F),
    // Neutral overlays — apply alpha at the call site via .withValues().
    // overlay = fills / hairlines / dividers (contrast vs surface).
    // raise   = specular top-highlights / gloss (stays light both themes).
    overlay: Color(0xFFFFFFFF),
    raise: Color(0xFFFFFFFF),
    // Glass surfaces
    glassSlab: Color(0x4D18181B), // zinc-900 @ 30% — header/calendar slab
    glassLow: Color(0x8C18181C), // cards a touch lighter @ 55%
    glassMid: Color(0xB818181B), // @ 72%
    glassHigh: Color(0xE01F1F23), // @ 88%
    glassPopover: Color(0xF7141417), // dropdown / menu panel @ 97%
    glassDialogTop: Color(0xFA202025), // @ 98%
    glassDialogBottom: Color(0xFA16161A), // @ 98%
    nodeCenter: Color(0xFF121214), // opaque node center over connector line
    // Control fills (zinc-800 buttons / toggles at 3 strengths)
    glassControl: Color(0x9927272A), // @ 60%
    glassControlStrong: Color(0xB327272A), // @ 70%
    glassControlStronger: Color(0xCC27272A), // @ 80%
    // Category / focus palette
    catGreen: Color(0xFF34D399), // full body
    catBlue: Color(0xFF60A5FA), // upper
    catAmber: Color(0xFFFBBF24), // lower
    catPink: Color(0xFFF472B6), // push
    catViolet: Color(0xFFA78BFA), // pull
    catCyan: Color(0xFF22D3EE), // core
  );

  factory CustomColorsExtension.light() => const CustomColorsExtension(
    // Status
    statusCompleted: Color(0xFF059669), // emerald-600
    statusPlanned: Color(0xFF64748B),
    // Destructive button red
    danger: Color(0xFFDC2626),
    // overlay flips to black; raise stays white (softer α at call site)
    overlay: Color(0xFF000000),
    raise: Color(0xFFFFFFFF),
    // Glass surfaces (translucent whites)
    glassSlab: Color(0x8CFFFFFF), // @ 55%
    glassLow: Color(0x9EFFFFFF), // @ 62%
    glassMid: Color(0xC7FFFFFF), // @ 78%
    glassHigh: Color(0xEBFFFFFF), // @ 92%
    glassPopover: Color(0xFAFFFFFF), // @ 98%
    glassDialogTop: Color(0xFAFFFFFF), // @ 98%
    glassDialogBottom: Color(0xFAF8F8FA), // @ 98%
    nodeCenter: Color(0xFFFFFFFF),
    glassControl: Color(0xFFFFFFFF),
    glassControlStrong: Color(0xFFFFFFFF),
    glassControlStronger: Color(0xFFF4F4F5),
    // Category (darkened for contrast on light)
    catGreen: Color(0xFF059669),
    catBlue: Color(0xFF2563EB),
    catAmber: Color(0xFFD97706),
    catPink: Color(0xFFDB2777),
    catViolet: Color(0xFF7C3AED),
    catCyan: Color(0xFF0891B2),
  );

  /// Completed-status accent (task accent strip, checkmarks).
  final Color statusCompleted;

  /// Planned-status accent.
  final Color statusPlanned;

  /// Destructive-action red (distinct from [ColorScheme.error]).
  final Color danger;

  /// Neutral overlay base for fills / hairlines / dividers — white on dark,
  /// black on light. Apply alpha at the call site.
  final Color overlay;

  /// Specular top-highlight / gloss base — white in both themes.
  final Color raise;

  /// Full-bleed header / calendar slab fill.
  final Color glassSlab;

  /// Glass card fills at three elevation strengths.
  final Color glassLow;
  final Color glassMid;
  final Color glassHigh;

  /// Dropdown / menu panel fill.
  final Color glassPopover;

  /// Dialog vertical-gradient fills.
  final Color glassDialogTop;
  final Color glassDialogBottom;

  /// Opaque node center drawn over a connector line.
  final Color nodeCenter;

  /// Control (button / toggle) fills at three strengths.
  final Color glassControl;
  final Color glassControlStrong;
  final Color glassControlStronger;

  /// Category / focus palette.
  final Color catGreen;
  final Color catBlue;
  final Color catAmber;
  final Color catPink;
  final Color catViolet;
  final Color catCyan;

  @override
  CustomColorsExtension copyWith({
    Color? statusCompleted,
    Color? statusPlanned,
    Color? danger,
    Color? overlay,
    Color? raise,
    Color? glassSlab,
    Color? glassLow,
    Color? glassMid,
    Color? glassHigh,
    Color? glassPopover,
    Color? glassDialogTop,
    Color? glassDialogBottom,
    Color? nodeCenter,
    Color? glassControl,
    Color? glassControlStrong,
    Color? glassControlStronger,
    Color? catGreen,
    Color? catBlue,
    Color? catAmber,
    Color? catPink,
    Color? catViolet,
    Color? catCyan,
  }) {
    return CustomColorsExtension(
      statusCompleted: statusCompleted ?? this.statusCompleted,
      statusPlanned: statusPlanned ?? this.statusPlanned,
      danger: danger ?? this.danger,
      overlay: overlay ?? this.overlay,
      raise: raise ?? this.raise,
      glassSlab: glassSlab ?? this.glassSlab,
      glassLow: glassLow ?? this.glassLow,
      glassMid: glassMid ?? this.glassMid,
      glassHigh: glassHigh ?? this.glassHigh,
      glassPopover: glassPopover ?? this.glassPopover,
      glassDialogTop: glassDialogTop ?? this.glassDialogTop,
      glassDialogBottom: glassDialogBottom ?? this.glassDialogBottom,
      nodeCenter: nodeCenter ?? this.nodeCenter,
      glassControl: glassControl ?? this.glassControl,
      glassControlStrong: glassControlStrong ?? this.glassControlStrong,
      glassControlStronger: glassControlStronger ?? this.glassControlStronger,
      catGreen: catGreen ?? this.catGreen,
      catBlue: catBlue ?? this.catBlue,
      catAmber: catAmber ?? this.catAmber,
      catPink: catPink ?? this.catPink,
      catViolet: catViolet ?? this.catViolet,
      catCyan: catCyan ?? this.catCyan,
    );
  }

  @override
  CustomColorsExtension lerp(
    covariant ThemeExtension<CustomColorsExtension>? other,
    double t,
  ) {
    if (other is! CustomColorsExtension) return this;
    Color mix(Color a, Color b) => Color.lerp(a, b, t) ?? b;
    return CustomColorsExtension(
      statusCompleted: mix(statusCompleted, other.statusCompleted),
      statusPlanned: mix(statusPlanned, other.statusPlanned),
      danger: mix(danger, other.danger),
      overlay: mix(overlay, other.overlay),
      raise: mix(raise, other.raise),
      glassSlab: mix(glassSlab, other.glassSlab),
      glassLow: mix(glassLow, other.glassLow),
      glassMid: mix(glassMid, other.glassMid),
      glassHigh: mix(glassHigh, other.glassHigh),
      glassPopover: mix(glassPopover, other.glassPopover),
      glassDialogTop: mix(glassDialogTop, other.glassDialogTop),
      glassDialogBottom: mix(glassDialogBottom, other.glassDialogBottom),
      nodeCenter: mix(nodeCenter, other.nodeCenter),
      glassControl: mix(glassControl, other.glassControl),
      glassControlStrong: mix(glassControlStrong, other.glassControlStrong),
      glassControlStronger: mix(
        glassControlStronger,
        other.glassControlStronger,
      ),
      catGreen: mix(catGreen, other.catGreen),
      catBlue: mix(catBlue, other.catBlue),
      catAmber: mix(catAmber, other.catAmber),
      catPink: mix(catPink, other.catPink),
      catViolet: mix(catViolet, other.catViolet),
      catCyan: mix(catCyan, other.catCyan),
    );
  }
}
