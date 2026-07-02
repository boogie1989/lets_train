import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/extensions/custom_colors_extension.dart';

export '../containers/screen_background/screen_background_theme.dart';
export 'create_dark_theme.dart';
export 'create_light_theme.dart';
export 'extensions/custom_colors_extension.dart';

extension ThemeContextEx on BuildContext {
  ThemeData get theme => Theme.of(this);
  CustomColorsExtension get customColors => theme.customColors;
}

extension ThemeEx on ThemeData {
  CustomColorsExtension get customColors => extension<CustomColorsExtension>()!;
}
