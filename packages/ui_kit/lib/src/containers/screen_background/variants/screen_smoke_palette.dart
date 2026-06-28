import 'package:flutter/material.dart';

/// Shared "smoke" atmosphere palette for the [ScreenBackground] variants.
///
/// Ported from the design playbook tokens (`design/src/tokens/tokens.css`,
/// dark theme). The system is dark-mode only, so these values are fixed:
/// a black base with six low-opacity slate spheres.
abstract final class ScreenSmokePalette {
  const ScreenSmokePalette._();

  /// Base surface painted behind the smoke (`#000000`).
  static const Color baseColor = Color(0xFF000000);

  /// Per-sphere base opacity (`--smoke-opacity`).
  static const double baseOpacity = 0.10;

  /// The six smoke colors (`--smoke-1..6`), in order.
  static const List<Color> smokeColors = <Color>[
    Color(0xFF475569), // --smoke-1
    Color(0xFF4B5563), // --smoke-2
    Color(0xFF52525B), // --smoke-3
    Color(0xFF525252), // --smoke-4
    Color(0xFF64748B), // --smoke-5
    Color(0xFF94A3B8), // --smoke-6
  ];
}
