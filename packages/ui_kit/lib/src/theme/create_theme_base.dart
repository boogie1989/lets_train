import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/screen_background_theme.dart';
import 'package:ui_kit/src/containers/surface_container/surface_container_theme.dart';
import 'package:ui_kit/src/theme/extensions/custom_colors_extension.dart';

ThemeData createThemeBase(
  BuildContext context, {
  required ColorScheme colorScheme,
  Color scaffoldBackgroundColor = Colors.transparent,
}) {
  final isDark = colorScheme.brightness == Brightness.dark;
  final textTheme = _createTextTheme(
    colorScheme: colorScheme,
  );

  const appBarTheme = AppBarThemeData(
    backgroundColor: Colors.transparent,
    surfaceTintColor: Colors.transparent,
  );

  const listTileTheme = ListTileThemeData(
    minTileHeight: 75,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    brightness: colorScheme.brightness,
    scaffoldBackgroundColor: scaffoldBackgroundColor,
    textTheme: textTheme,
    appBarTheme: appBarTheme,
    listTileTheme: listTileTheme,
    extensions: {
      if (isDark) ...[
        ScreenBackgroundExtension.dark(),
        CustomColorsExtension.dark(),
        SurfaceContainerExtension.dark(colorScheme),
      ] else ...[
        ScreenBackgroundExtension.light(),
        CustomColorsExtension.light(),
        SurfaceContainerExtension.light(colorScheme),
      ],
    },
  );
}

/// Material 3 [TextTheme], ported 1:1 from the `--tt-*` tokens in
/// `design/src/tokens/tokens.css`. Sizes are customised from the M3 defaults to
/// match the design; `height` is the line-height ÷ font-size ratio and
/// `letterSpacing` is the tracking in logical pixels. Inter 400 (Regular) /
/// 500 (Medium); every role is tinted with [ColorScheme.onSurface].
TextTheme _createTextTheme({
  required ColorScheme colorScheme,
}) {
  TextStyle role(
    double size,
    FontWeight weight,
    double height,
    double tracking,
  ) {
    return TextStyle(
      fontFamily: 'Inter',
      fontSize: size,
      fontWeight: weight,
      height: height,
      letterSpacing: tracking,
      color: colorScheme.onSurface,
    );
  }

  const regular = FontWeight.w400;
  const medium = FontWeight.w500;

  return TextTheme(
    displayLarge: role(57, regular, 1.12, -0.25),
    displayMedium: role(45, regular, 1.16, 0),
    displaySmall: role(36, regular, 1.22, 0),
    headlineLarge: role(32, medium, 1.25, 0),
    headlineMedium: role(28, medium, 1.29, 0),
    headlineSmall: role(24, medium, 1.33, 0),
    titleLarge: role(20, medium, 1.50, 0),
    titleMedium: role(18, medium, 1.50, 0.15),
    titleSmall: role(14, medium, 1.43, 0.1),
    bodyLarge: role(16, regular, 1.50, 0.5),
    bodyMedium: role(14, regular, 1.43, 0.25),
    bodySmall: role(12, regular, 1.33, 0.4),
    labelLarge: role(16, medium, 1.50, 0.1),
    labelMedium: role(12, medium, 1.33, 0.5),
    labelSmall: role(11, medium, 1.45, 0.5),
  );
}
