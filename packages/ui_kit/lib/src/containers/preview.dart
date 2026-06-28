import 'package:flutter/material.dart';
import 'package:flutter/widget_previews.dart';
import 'package:ui_kit/src/containers/screen_background/screen_background.dart';

@Preview(name: 'Shader', size: Size(440, 956))
Widget mySampleText() {
  return const ScreenBackground(
    child: SizedBox.expand(),
  );
}

@Preview(name: 'Gradient', size: Size(440, 956))
Widget mySampleText2() {
  return const ScreenBackground(
    type: ScreenBackgroundType.gradient,
    child: SizedBox.expand(),
  );
}
