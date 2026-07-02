import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/create_theme_base.dart';

/// Dark [ColorScheme], ported 1:1 from the `--cs-*` dark tokens in
/// `design/src/tokens/tokens.css` (seed: Slate #64748B; primitives:
/// Tailwind Slate / Zinc / Emerald).
ThemeData createDarkTheme(BuildContext context) {
  const colorScheme = ColorScheme(
    brightness: Brightness.dark,
    // Primary (slate-400 accent)
    primary: Color(0xFF94A3B8), // slate-400
    onPrimary: Color(0xFF0F172A), // slate-900
    primaryContainer: Color(0xFF1E293B), // slate-800
    onPrimaryContainer: Color(0xFFCBD5E1), // slate-300
    // Secondary (slate-500)
    secondary: Color(0xFF64748B), // slate-500
    onSecondary: Color(0xFF0F172A),
    secondaryContainer: Color(0xFF334155), // slate-700
    onSecondaryContainer: Color(0xFFCBD5E1),
    // Tertiary (emerald)
    tertiary: Color(0xFF34D399), // emerald-400
    onTertiary: Color(0xFF022C22),
    tertiaryContainer: Color(0xFF065F46),
    onTertiaryContainer: Color(0xFF34D399),
    // Error
    error: Color(0xFFF87171),
    onError: Color(0xFF7F1D1D),
    errorContainer: Color(0xFF991B1B),
    onErrorContainer: Color(0xFFFCA5A5),
    // Surface
    surface: Color(0xFF000000),
    onSurface: Color(0xFFFAFAFA),
    onSurfaceVariant: Color(0xFFB4B4B4), // secondary text, icons
    surfaceDim: Color(0xFF09090B), // zinc-950
    surfaceBright: Color(0xFF27272A), // zinc-800
    surfaceContainerLowest: Color(0xFF09090B),
    surfaceContainerLow: Color(0xFF101012),
    surfaceContainer: Color(0xFF18181B), // zinc-900 — cards, slabs
    surfaceContainerHigh: Color(0xFF1F1F23),
    surfaceContainerHighest: Color(0xFF27272A), // zinc-800 — buttons, toggles
    // Outline
    outline: Color(0x803F3F46), // zinc-700 @ 50%
    outlineVariant: Color(0x4D3F3F46), // zinc-700 @ 30%
    // Utility
    shadow: Color(0xFF000000),
    scrim: Color(0x80000000),
    inverseSurface: Color(0xFFF1F5F9),
    onInverseSurface: Color(0xFF18181B),
    inversePrimary: Color(0xFF475569), // slate-600
    surfaceTint: Color(0xFF94A3B8),
  );

  return createThemeBase(
    context,
    colorScheme: colorScheme,
  );
}
