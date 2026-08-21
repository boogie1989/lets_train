import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/theme.dart';

/// Base dimension tokens ported from `design/src/tokens/tokens.css`:
/// the `--radius-*` scale and the `--sp-*` 4 pt spacing scale.
///
/// Theme-invariant (same values in dark and light). Blur sigmas
/// (`--blur-*`) intentionally live in `SurfaceContainerExtension` /
/// `ScreenBackgroundExtension`, not here.
@immutable
class DimensionsExtension extends ThemeExtension<DimensionsExtension> {
  static DimensionsExtension of(BuildContext context) =>
      context.theme.extension<DimensionsExtension>()!;

  const DimensionsExtension({
    this.radiusNone = 0,
    this.radiusSm = 6,
    this.radiusMd = 8,
    this.radiusLg = 10,
    this.radiusXl = 14, // buttons, date cells — r=14 from Figma
    this.radius2xl = 16, // task cards — r=16 from Figma
    this.radius3xl = 24,
    this.radiusPill = 9999,
    this.space0 = 0,
    this.space1 = 4,
    this.space2 = 8,
    this.space3 = 12,
    this.space4 = 16,
    this.space5 = 20,
    this.space6 = 24,
    this.space8 = 32,
    this.space10 = 40,
    this.space12 = 48,
    this.space16 = 64,
    this.space20 = 80,
  });

  /// Corner-radius scale (`--radius-*`).
  final double radiusNone;
  final double radiusSm;
  final double radiusMd;
  final double radiusLg;
  final double radiusXl;
  final double radius2xl;
  final double radius3xl;
  final double radiusPill;

  /// Spacing scale (`--sp-*`, 4 pt grid). The suffix is the step number,
  /// not pixels: `space4` = 16 px.
  final double space0;
  final double space1;
  final double space2;
  final double space3;
  final double space4;
  final double space5;
  final double space6;
  final double space8;
  final double space10;
  final double space12;
  final double space16;
  final double space20;

  @override
  DimensionsExtension copyWith({
    double? radiusNone,
    double? radiusSm,
    double? radiusMd,
    double? radiusLg,
    double? radiusXl,
    double? radius2xl,
    double? radius3xl,
    double? radiusPill,
    double? space0,
    double? space1,
    double? space2,
    double? space3,
    double? space4,
    double? space5,
    double? space6,
    double? space8,
    double? space10,
    double? space12,
    double? space16,
    double? space20,
  }) {
    return DimensionsExtension(
      radiusNone: radiusNone ?? this.radiusNone,
      radiusSm: radiusSm ?? this.radiusSm,
      radiusMd: radiusMd ?? this.radiusMd,
      radiusLg: radiusLg ?? this.radiusLg,
      radiusXl: radiusXl ?? this.radiusXl,
      radius2xl: radius2xl ?? this.radius2xl,
      radius3xl: radius3xl ?? this.radius3xl,
      radiusPill: radiusPill ?? this.radiusPill,
      space0: space0 ?? this.space0,
      space1: space1 ?? this.space1,
      space2: space2 ?? this.space2,
      space3: space3 ?? this.space3,
      space4: space4 ?? this.space4,
      space5: space5 ?? this.space5,
      space6: space6 ?? this.space6,
      space8: space8 ?? this.space8,
      space10: space10 ?? this.space10,
      space12: space12 ?? this.space12,
      space16: space16 ?? this.space16,
      space20: space20 ?? this.space20,
    );
  }

  @override
  DimensionsExtension lerp(
    covariant ThemeExtension<DimensionsExtension>? other,
    double t,
  ) {
    if (other is! DimensionsExtension) return this;
    double mix(double a, double b) => lerpDouble(a, b, t) ?? b;
    return DimensionsExtension(
      radiusNone: mix(radiusNone, other.radiusNone),
      radiusSm: mix(radiusSm, other.radiusSm),
      radiusMd: mix(radiusMd, other.radiusMd),
      radiusLg: mix(radiusLg, other.radiusLg),
      radiusXl: mix(radiusXl, other.radiusXl),
      radius2xl: mix(radius2xl, other.radius2xl),
      radius3xl: mix(radius3xl, other.radius3xl),
      radiusPill: mix(radiusPill, other.radiusPill),
      space0: mix(space0, other.space0),
      space1: mix(space1, other.space1),
      space2: mix(space2, other.space2),
      space3: mix(space3, other.space3),
      space4: mix(space4, other.space4),
      space5: mix(space5, other.space5),
      space6: mix(space6, other.space6),
      space8: mix(space8, other.space8),
      space10: mix(space10, other.space10),
      space12: mix(space12, other.space12),
      space16: mix(space16, other.space16),
      space20: mix(space20, other.space20),
    );
  }
}
