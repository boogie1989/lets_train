import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/widgets/screen_shader_background.dart';
import 'package:ui_kit/src/theme/theme.dart';

export 'package:ui_kit/src/containers/screen_background/widgets/screen_shader_background.dart';

/// A full-bleed animated "smoke" background with [child] composited on top.
///
/// Paints the themed base surface ([ScreenBackgroundExtension.baseColor]), then
/// the GPU shader smoke layer, then the [child]. Colors come from the theme, so
/// it adapts to light and dark.
class ScreenBackground extends StatelessWidget {
  const ScreenBackground({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: ScreenBackgroundExtension.of(context).baseColor,
      child: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          const ScreenShaderBackground(),
          child,
        ],
      ),
    );
  }
}
