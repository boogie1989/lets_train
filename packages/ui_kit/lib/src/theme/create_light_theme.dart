import 'package:flutter/material.dart';
import 'package:ui_kit/src/hooks/use_breakpoint_hook/use_breakpoint_hook.dart';
import 'package:ui_kit/src/theme/create_theme_base.dart';

/// Light [ColorScheme], ported 1:1 from the `--cs-*` light tokens in
/// `design/src/tokens/tokens.css` (soft-neutral: zinc-50/100 surfaces,
/// slate accent).
ThemeData createLightTheme(
  BuildContext context, {
  Breakpoint breakpoint = Breakpoint.small,
}) {
  const colorScheme = ColorScheme(
    brightness: Brightness.light,
    // Primary (slate-600 so tints read on light)
    primary: Color(0xFF475569),
    onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFFE2E8F0), // slate-200
    onPrimaryContainer: Color(0xFF1E293B),
    // Secondary
    secondary: Color(0xFF64748B),
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFFE2E8F0),
    onSecondaryContainer: Color(0xFF334155),
    // Tertiary (emerald-600)
    tertiary: Color(0xFF059669),
    onTertiary: Color(0xFFFFFFFF),
    tertiaryContainer: Color(0xFFA7F3D0),
    onTertiaryContainer: Color(0xFF064E3B),
    // Error
    error: Color(0xFFDC2626),
    onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFFFECACA),
    onErrorContainer: Color(0xFF7F1D1D),
    // Surface (off-white)
    surface: Color(0xFFE0E0E0), // neutral light-gray canvas
    onSurface: Color(0xFF18181B),
    onSurfaceVariant: Color(0xFF52525B), // zinc-600
    surfaceDim: Color(0xFFE4E4E7),
    surfaceBright: Color(0xFFFFFFFF),
    surfaceContainerLowest: Color(0xFFFFFFFF),
    surfaceContainerLow: Color(0xFFFAFAFA),
    surfaceContainer: Color(0xFFFFFFFF),
    surfaceContainerHigh: Color(0xFFF4F4F5),
    surfaceContainerHighest: Color(0xFFE4E4E7),
    // Outline
    outline: Color(0x38000000), // black @ 22%
    outlineVariant: Color(0x1F000000), // black @ 12%
    // Utility
    shadow: Color(0xFF000000),
    scrim: Color(0x52000000), // black @ 32%
    inverseSurface: Color(0xFF18181B),
    onInverseSurface: Color(0xFFFAFAFA),
    inversePrimary: Color(0xFF94A3B8),
    surfaceTint: Color(0xFF475569),
  );

  return createThemeBase(
    context,
    breakpoint: breakpoint,
    colorScheme: colorScheme,
  );
}
