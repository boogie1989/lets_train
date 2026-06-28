import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:ui_kit/src/containers/screen_background/variants/screen_smoke_field.dart';

/// Gradient/blur smoke background — the CPU-composited, blur-based variant.
///
/// Flutter analog of design/src/components/AnimatedSmokeLayer.jsx: six blurred
/// circles drift along the shared [smokeBlobsAt] keyframe field, looping
/// forever. The GPU [ScreenShaderBackground] composites the exact same field,
/// so the two variants look alike.
class ScreenGradientBackground extends StatefulWidget {
  const ScreenGradientBackground({super.key});

  @override
  State<ScreenGradientBackground> createState() =>
      _ScreenGradientBackgroundState();
}

class _ScreenGradientBackgroundState extends State<ScreenGradientBackground>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  double _elapsedSeconds = 0;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onTick)..start();
  }

  void _onTick(Duration elapsed) {
    setState(() {
      _elapsedSeconds = elapsed.inMicroseconds / Duration.microsecondsPerSecond;
    });
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: ClipRect(
        child: CustomPaint(
          size: Size.infinite,
          painter: _GradientSmokePainter(time: _elapsedSeconds),
        ),
      ),
    );
  }
}

class _GradientSmokePainter extends CustomPainter {
  _GradientSmokePainter({required this.time});

  final double time;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) {
      return;
    }
    final scale = size.width / smokeDesignWidth;

    for (final blob in smokeBlobsAt(time)) {
      final paint = Paint()
        ..color = blob.color.withValues(alpha: blob.opacity)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, blob.blur * scale);

      canvas.drawCircle(blob.center * scale, blob.radius * scale, paint);
    }
  }

  @override
  bool shouldRepaint(_GradientSmokePainter oldDelegate) =>
      oldDelegate.time != time;
}
