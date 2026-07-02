import 'dart:ui' show lerpDouble;

import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/theme.dart';

/// How a [SurfaceContainer] level blurs its backdrop.
enum SurfaceBlurMode {
  /// No blur — plain translucent fill.
  none,

  /// Real [BackdropFilter] — correct over arbitrary content (scrolling lists,
  /// other cards), but costs a saveLayer + framebuffer readback per container.
  backdrop,

  /// Analytic blur of the smoke field, computed in the container's own
  /// fragment shader (`surface_glass.frag`) — free (no saveLayer), visually
  /// identical over `ScreenBackground`, but blurs ONLY the smoke: content
  /// passing under the glass stays sharp. Degrades to [none] outside a
  /// `ScreenBackground`.
  smoke,
}

/// Visual recipe of one [SurfaceContainer] elevation level, ported from the
/// design's `SurfaceContainer` levels (`design/src/components/SurfaceContainer.jsx`):
/// glass fill + backdrop blur + hairline border + elevation shadows
/// (`--shadow-glass-*`, ambient + key) + 1px inner top-highlight.
@immutable
class SurfaceContainerStyle {
  const SurfaceContainerStyle({
    required this.backgroundColor,
    required this.blur,
    required this.blurMode,
    required this.borderColor,
    required this.shadows,
    required this.innerHighlightColor,
  });

  /// Semi-transparent glass fill, so the backdrop blur shows through.
  final Color backgroundColor;

  /// Backdrop blur sigma (CSS `backdrop-filter: blur(Npx)` — N is the sigma).
  final double blur;

  /// How [blur] is realised — see [SurfaceBlurMode].
  final SurfaceBlurMode blurMode;

  /// 1px hairline border color.
  final Color borderColor;

  /// Elevation shadows (ambient + key), outside the container footprint.
  final List<BoxShadow> shadows;

  /// 1px specular highlight along the inner top edge — what gives the glass
  /// volume against the dark/smoke background (CSS `inset 0 1px 0`).
  final Color innerHighlightColor;

  static SurfaceContainerStyle lerp(
    SurfaceContainerStyle a,
    SurfaceContainerStyle b,
    double t,
  ) {
    return SurfaceContainerStyle(
      backgroundColor:
          Color.lerp(a.backgroundColor, b.backgroundColor, t) ??
          b.backgroundColor,
      blur: lerpDouble(a.blur, b.blur, t) ?? b.blur,
      blurMode: t < 0.5 ? a.blurMode : b.blurMode,
      borderColor: Color.lerp(a.borderColor, b.borderColor, t) ?? b.borderColor,
      shadows: BoxShadow.lerpList(a.shadows, b.shadows, t) ?? b.shadows,
      innerHighlightColor:
          Color.lerp(a.innerHighlightColor, b.innerHighlightColor, t) ??
          b.innerHighlightColor,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SurfaceContainerStyle &&
          runtimeType == other.runtimeType &&
          backgroundColor == other.backgroundColor &&
          blur == other.blur &&
          blurMode == other.blurMode &&
          borderColor == other.borderColor &&
          listEquals(other.shadows, shadows) &&
          innerHighlightColor == other.innerHighlightColor;

  @override
  int get hashCode => Object.hash(
    backgroundColor,
    blur,
    blurMode,
    borderColor,
    Object.hashAll(shadows),
    innerHighlightColor,
  );
}

/// All theming of [SurfaceContainer] — one [SurfaceContainerStyle] per
/// elevation level plus the shared corner radius / border width.
///
/// Registered per-brightness in `createThemeBase` via [SurfaceContainerExtension.dark] /
/// [SurfaceContainerExtension.light]; both derive from the active [ColorScheme]
/// where a token maps to a scheme role and carry the remaining design-token
/// literals (`--glass-*-bg`, `--overlay-rgb`, `--raise-rgb`, `--shadow-glass-*`,
/// `--radius-2xl` in `design/src/tokens/tokens.css`).
@immutable
class SurfaceContainerExtension
    extends ThemeExtension<SurfaceContainerExtension> {
  static SurfaceContainerExtension of(BuildContext context) =>
      context.theme.extension<SurfaceContainerExtension>()!;

  const SurfaceContainerExtension({
    required this.low,
    required this.mid,
    required this.high,
    this.borderRadius = 16, // --radius-2xl
    this.borderWidth = 1,
  });

  factory SurfaceContainerExtension.dark(ColorScheme colorScheme) {
    final shadow = colorScheme.shadow;
    // --overlay-rgb (dark) = white; --raise-rgb = white.
    const overlay = Color(0xFFFFFFFF);
    const raise = Color(0xFFFFFFFF);
    return SurfaceContainerExtension(
      low: SurfaceContainerStyle(
        // --glass-low-bg: rgba(24,24,28,.55) — a touch lighter than
        // surfaceContainer (24,24,27), so a literal.
        backgroundColor: const Color.from(
          alpha: 0.55,
          red: 24 / 255,
          green: 24 / 255,
          blue: 28 / 255,
        ),
        blur: 16,
        blurMode: SurfaceBlurMode.smoke,
        borderColor: overlay.withValues(alpha: 0.04),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 4),
            blurRadius: 12,
            color: shadow.withValues(alpha: 0.25),
          ),
          BoxShadow(
            offset: const Offset(0, 10),
            blurRadius: 24,
            spreadRadius: -2,
            color: shadow.withValues(alpha: 0.35),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.05),
      ),
      mid: SurfaceContainerStyle(
        // Darkened from --glass-mid-bg rgba(24,24,27,.72): the design token
        // read too light in the app (user decision, 2026-07).
        backgroundColor: const Color.from(
          alpha: 0.72,
          red: 21 / 255,
          green: 21 / 255,
          blue: 24 / 255,
        ),
        blur: 24,
        blurMode: SurfaceBlurMode.smoke,
        borderColor: overlay.withValues(alpha: 0.06),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 6),
            blurRadius: 16,
            color: shadow.withValues(alpha: 0.30),
          ),
          BoxShadow(
            offset: const Offset(0, 16),
            blurRadius: 36,
            spreadRadius: -4,
            color: shadow.withValues(alpha: 0.45),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.06),
      ),
      high: SurfaceContainerStyle(
        // Darkened from --glass-high-bg rgba(31,31,35,.88): the design token
        // read too light in the app (user decision, 2026-07).
        // backgroundColor: const Color.from(
        //   alpha: 0.88,
        //   red: 26 / 255,
        //   green: 26 / 255,
        //   blue: 30 / 255,
        // ),
        backgroundColor: const Color.from(
          alpha: 0.72,
          red: 21 / 255,
          green: 21 / 255,
          blue: 24 / 255,
        ),
        blur: 32,
        blurMode: SurfaceBlurMode.backdrop,
        borderColor: overlay.withValues(alpha: 0.08),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 10),
            blurRadius: 24,
            color: shadow.withValues(alpha: 0.35),
          ),
          BoxShadow(
            offset: const Offset(0, 26),
            blurRadius: 52,
            spreadRadius: -6,
            color: shadow.withValues(alpha: 0.55),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.08),
      ),
    );
  }

  factory SurfaceContainerExtension.light(ColorScheme colorScheme) {
    final shadow = colorScheme.shadow;
    // --overlay-rgb flips to black on light; --raise-rgb stays white.
    const overlay = Color(0xFF000000);
    const raise = Color(0xFFFFFFFF);
    // --glass-*-bg (light) are translucent whites over surfaceContainer (#FFF).
    final glass = colorScheme.surfaceContainer;
    return SurfaceContainerExtension(
      low: SurfaceContainerStyle(
        backgroundColor: glass.withValues(alpha: 0.62),
        blur: 16,
        blurMode: SurfaceBlurMode.smoke,
        borderColor: overlay.withValues(alpha: 0.04),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 4),
            blurRadius: 12,
            color: shadow.withValues(alpha: 0.14),
          ),
          BoxShadow(
            offset: const Offset(0, 12),
            blurRadius: 28,
            spreadRadius: -2,
            color: shadow.withValues(alpha: 0.20),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.75),
      ),
      mid: SurfaceContainerStyle(
        backgroundColor: glass.withValues(alpha: 0.78),
        blur: 24,
        blurMode: SurfaceBlurMode.smoke,
        borderColor: overlay.withValues(alpha: 0.06),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 6),
            blurRadius: 16,
            color: shadow.withValues(alpha: 0.16),
          ),
          BoxShadow(
            offset: const Offset(0, 18),
            blurRadius: 40,
            spreadRadius: -4,
            color: shadow.withValues(alpha: 0.24),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.85),
      ),
      high: SurfaceContainerStyle(
        //  backgroundColor: glass.withValues(alpha: 0.92),
        backgroundColor: glass.withValues(alpha: 0.78),
        blur: 32,
        blurMode: SurfaceBlurMode.backdrop,
        borderColor: overlay.withValues(alpha: 0.08),
        shadows: [
          BoxShadow(
            offset: const Offset(0, 10),
            blurRadius: 24,
            color: shadow.withValues(alpha: 0.20),
          ),
          BoxShadow(
            offset: const Offset(0, 28),
            blurRadius: 56,
            spreadRadius: -6,
            color: shadow.withValues(alpha: 0.28),
          ),
        ],
        innerHighlightColor: raise.withValues(alpha: 0.85),
      ),
    );
  }

  final SurfaceContainerStyle low;
  final SurfaceContainerStyle mid;
  final SurfaceContainerStyle high;

  /// Shared corner radius (`--radius-2xl`).
  final double borderRadius;

  /// Hairline border width.
  final double borderWidth;

  @override
  SurfaceContainerExtension copyWith({
    SurfaceContainerStyle? low,
    SurfaceContainerStyle? mid,
    SurfaceContainerStyle? high,
    double? borderRadius,
    double? borderWidth,
  }) {
    return SurfaceContainerExtension(
      low: low ?? this.low,
      mid: mid ?? this.mid,
      high: high ?? this.high,
      borderRadius: borderRadius ?? this.borderRadius,
      borderWidth: borderWidth ?? this.borderWidth,
    );
  }

  @override
  SurfaceContainerExtension lerp(
    covariant ThemeExtension<SurfaceContainerExtension>? other,
    double t,
  ) {
    if (other is! SurfaceContainerExtension) return this;
    return SurfaceContainerExtension(
      low: SurfaceContainerStyle.lerp(low, other.low, t),
      mid: SurfaceContainerStyle.lerp(mid, other.mid, t),
      high: SurfaceContainerStyle.lerp(high, other.high, t),
      borderRadius:
          lerpDouble(borderRadius, other.borderRadius, t) ?? other.borderRadius,
      borderWidth:
          lerpDouble(borderWidth, other.borderWidth, t) ?? other.borderWidth,
    );
  }
}
