import 'package:flutter/material.dart';
import 'package:ui_kit/src/theme/extensions/custom_colors_extension.dart';
import 'package:ui_kit/src/theme/extensions/dimensions_extension.dart';

export '../containers/screen_background/screen_background_theme.dart';
export 'create_dark_theme.dart';
export 'create_light_theme.dart';
export 'extensions/custom_colors_extension.dart';
export 'extensions/dimensions_extension.dart';

extension ThemeContextEx on BuildContext {
  ThemeData get theme => Theme.of(this);
  CustomColorsExtension get customColors => theme.customColors;
  DimensionsExtension get dimensions => theme.dimensions;
}

extension ThemeEx on ThemeData {
  CustomColorsExtension get customColors => extension<CustomColorsExtension>()!;
  DimensionsExtension get dimensions => extension<DimensionsExtension>()!;
}
