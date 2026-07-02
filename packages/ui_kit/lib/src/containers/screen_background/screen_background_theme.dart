import 'dart:ui' show lerpDouble;

import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter/material.dart';
import 'package:ui_kit/src/extensions/color_extension.dart';
import 'package:ui_kit/src/theme/theme.dart';

/// Theming for `ScreenBackground` / `ScreenShaderBackground` — the base surface
/// painted behind the smoke, the six smoke sphere colors (indexed by
/// `SmokeBlob.colorIndex`), and a global opacity multiplier.
///
/// Brightness-dependent — registered as `.dark()` / `.light()` in
/// `createThemeBase`. Values ported from the design's smoke tokens
/// (`--smoke-1..6`, `--smoke-opacity`) and `--app-bg`.
///
///
// Color(0xFF475569),
//   Color(0xFF4B5563),
//   Color(0xFF52525B),
//   Color(0xFF525252),
//   Color(0xFF64748B),
//   Color(0xFF94A3B8),
@immutable
class ScreenBackgroundExtension
    extends ThemeExtension<ScreenBackgroundExtension> {
  static ScreenBackgroundExtension of(BuildContext context) =>
      context.theme.extension<ScreenBackgroundExtension>()!;

  const ScreenBackgroundExtension({
    required this.baseColor,
    required this.smokeColors,
    required this.opacityMultiplier,
  });

  factory ScreenBackgroundExtension.dark() => ScreenBackgroundExtension(
    baseColor: Colors.black,
    // The --smoke-1..6 dark tokens, uniformly darkened: at full token
    // lightness the haze read too bright over the black base (user decision,
    // 2026-07).
    smokeColors: [
      for (final color in const [
        Color(0xFF475569),
        Color(0xFF4B5563),
        Color(0xFF52525B),
        Color(0xFF525252),
        Color(0xFF64748B),
        Color(0xFF94A3B8),
      ])
        color.darken(.2),
    ],
    opacityMultiplier: 1.0,
  );

  factory ScreenBackgroundExtension.light() => const ScreenBackgroundExtension(
    baseColor: Color(0xFFE0E0E0),
    // Neutral grays (faint cool slate lean) clearly darker than the #E0E0E0
    // base — visible as clean soft clouds, without the dingy blue cast a
    // saturated slate would give on light gray.
    smokeColors: [
      Color(0xFF8F8F96), // mid gray
      Color(0xFF7C7C84), // gray
      Color(0xFF6A6A72), // deep gray
      Color(0xFF85858C), // cool gray
      Color(0xFF73737B), // cool deep gray
      Color(0xFF5C5C63), // darkest anchor (depth)
    ],
    opacityMultiplier: 1.3,
  );

  /// Solid surface painted behind the smoke.
  final Color baseColor;

  /// The six smoke sphere colors, indexed by `SmokeBlob.colorIndex`.
  final List<Color> smokeColors;

  /// Multiplier applied to every blob's keyframe opacity.
  final double opacityMultiplier;

  @override
  ScreenBackgroundExtension copyWith({
    Color? baseColor,
    List<Color>? smokeColors,
    double? opacityMultiplier,
  }) {
    return ScreenBackgroundExtension(
      baseColor: baseColor ?? this.baseColor,
      smokeColors: smokeColors ?? this.smokeColors,
      opacityMultiplier: opacityMultiplier ?? this.opacityMultiplier,
    );
  }

  @override
  ScreenBackgroundExtension lerp(
    covariant ThemeExtension<ScreenBackgroundExtension>? other,
    double t,
  ) {
    if (other is! ScreenBackgroundExtension) return this;
    return ScreenBackgroundExtension(
      baseColor: Color.lerp(baseColor, other.baseColor, t) ?? other.baseColor,
      smokeColors: [
        for (var i = 0; i < smokeColors.length; i++)
          Color.lerp(smokeColors[i], other.smokeColors[i], t) ??
              other.smokeColors[i],
      ],
      opacityMultiplier:
          lerpDouble(opacityMultiplier, other.opacityMultiplier, t) ??
          other.opacityMultiplier,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ScreenBackgroundExtension &&
          runtimeType == other.runtimeType &&
          baseColor == other.baseColor &&
          listEquals(smokeColors, other.smokeColors) &&
          opacityMultiplier == other.opacityMultiplier;

  @override
  int get hashCode =>
      Object.hash(baseColor, Object.hashAll(smokeColors), opacityMultiplier);
}
