import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/widgets/screen_smoke_field.dart';
import 'package:ui_kit/src/theme/theme.dart';

/// GPU shader smoke background — the animated, single-draw-call variant.
///
/// Loads `screen_shader_background.frag` and composites the shared
/// [smokeBlobsAt] field (the same six spheres the gradient variant draws) on
/// the GPU each frame. Renders transparent gaps so the [ScreenBackground] base
/// color shows through; while the program loads (or if loading fails) it paints
/// nothing.
class ScreenShaderBackground extends StatefulWidget {
  const ScreenShaderBackground({
    super.key,
    this.opacity = 1.0,
    this.speed = 1,
  });

  /// Multiplier over each sphere's keyframe opacity (1 = identical to gradient).
  final double opacity;

  /// Time multiplier (1 = default, 0 = frozen).
  final double speed;

  @override
  State<ScreenShaderBackground> createState() => _ScreenShaderBackgroundState();
}

class _ScreenShaderBackgroundState extends State<ScreenShaderBackground>
    with SingleTickerProviderStateMixin {
  static const String _shaderAsset =
      'packages/ui_kit/shaders/screen_shader_background.frag';

  ui.FragmentShader? _shader;
  late final _ticker = createTicker(_onTick);
  double _elapsedSeconds = 0;

  @override
  void initState() {
    super.initState();
    _loadShader().then((_) {
      _ticker.start();
    });
  }

  Future<void> _loadShader() async {
    try {
      final program = await ui.FragmentProgram.fromAsset(_shaderAsset);
      if (!mounted) {
        return;
      }
      setState(() => _shader = program.fragmentShader());
    } catch (_) {
      // No shader support / asset missing → render nothing (graceful), the
      // ScreenBackground base color still shows.
    }
  }

  void _onTick(Duration elapsed) {
    setState(() {
      _elapsedSeconds = elapsed.inMicroseconds / Duration.microsecondsPerSecond;
    });
  }

  @override
  void dispose() {
    _ticker.dispose();
    _shader?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ScreenBackgroundExtension(:smokeColors, :opacityMultiplier) =
        ScreenBackgroundExtension.of(context);

    if (smokeColors.length < 6) {
      return const Offstage();
    }

    final shader = _shader;
    if (shader == null) {
      return const SizedBox.expand();
    }

    return IgnorePointer(
      child: CustomPaint(
        size: Size.infinite,
        painter: _ShaderSmokePainter(
          shader: shader,
          time: _elapsedSeconds * widget.speed,
          opacity: widget.opacity * opacityMultiplier,
          colors: smokeColors,
        ),
      ),
    );
  }
}

class _ShaderSmokePainter extends CustomPainter {
  _ShaderSmokePainter({
    required this.shader,
    required this.time,
    required this.opacity,
    required this.colors,
  });

  final ui.FragmentShader shader;
  final double time;
  final double opacity;
  final List<Color> colors;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) {
      return;
    }
    final scale = size.width / smokeDesignWidth;

    // Uniforms must be set in declaration order (see the .frag): for each
    // sphere a (center.x, center.y, radius, sigma) vec4 then an (r,g,b,opacity)
    // vec4, all pre-scaled to the canvas' logical px (FlutterFragCoord space).
    // Colors come from the theme (ScreenBackgroundExtension.smokeColors).
    var i = 0;
    for (final blob in smokeBlobsAt(time)) {
      final center = blob.center * scale;
      final color = colors[blob.colorIndex];
      shader
        ..setFloat(i++, center.dx)
        ..setFloat(i++, center.dy)
        ..setFloat(i++, blob.radius * scale)
        ..setFloat(i++, blob.blur * scale)
        ..setFloat(i++, color.r)
        ..setFloat(i++, color.g)
        ..setFloat(i++, color.b)
        ..setFloat(i++, (blob.opacity * opacity).clamp(0.0, 1.0));
    }

    canvas.drawRect(
      Offset.zero & size,
      Paint()..shader = shader,
    );
  }

  @override
  bool shouldRepaint(_ShaderSmokePainter oldDelegate) =>
      oldDelegate.time != time ||
      oldDelegate.opacity != opacity ||
      oldDelegate.colors != colors ||
      oldDelegate.shader != shader;
}
