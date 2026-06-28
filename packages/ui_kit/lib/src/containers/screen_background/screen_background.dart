import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/variants/screen_gradient_background.dart';
import 'package:ui_kit/src/containers/screen_background/variants/screen_shader_background.dart';
import 'package:ui_kit/src/containers/screen_background/variants/screen_smoke_palette.dart';

export 'package:ui_kit/src/containers/screen_background/variants/screen_gradient_background.dart';
export 'package:ui_kit/src/containers/screen_background/variants/screen_shader_background.dart';

/// Which animated smoke background [ScreenBackground] renders.
enum ScreenBackgroundType {
  /// GPU fragment shader — six drifting Gaussian smoke spheres in one pass.
  shader,

  /// CPU gradient/blur — six blurred circles on staggered keyframe loops.
  gradient,
}

/// A full-bleed animated "smoke" background with [child] composited on top.
///
/// Paints the dark base surface, then the animated layer selected by [type],
/// then the [child]. Switch [type] to swap between the GPU shader and the
/// gradient/blur implementations.
class ScreenBackground extends StatelessWidget {
  const ScreenBackground({
    super.key,
    this.type = ScreenBackgroundType.shader,
    required this.child,
  });

  final Widget child;

  /// The animated background implementation to render.
  final ScreenBackgroundType type;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        const ColoredBox(color: ScreenSmokePalette.baseColor),
        switch (type) {
          ScreenBackgroundType.shader => const ScreenShaderBackground(),
          ScreenBackgroundType.gradient => const ScreenGradientBackground(),
        },
        child,
      ],
    );
  }
}
