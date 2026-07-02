import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart' show Ticker;
import 'package:ui_kit/src/containers/screen_background/smoke_field_clock.dart';
import 'package:ui_kit/src/containers/screen_background/widgets/screen_shader_background.dart';
import 'package:ui_kit/src/theme/theme.dart';

export 'package:ui_kit/src/containers/screen_background/smoke_field_clock.dart';
export 'package:ui_kit/src/containers/screen_background/widgets/screen_shader_background.dart';

/// A full-bleed animated "smoke" background with [child] composited on top.
///
/// Paints the themed base surface ([ScreenBackgroundExtension.baseColor]), then
/// the GPU shader smoke layer, then the [child]. Colors come from the theme, so
/// it adapts to light and dark.
///
/// Owns the single smoke clock and publishes it (plus its own render box) as a
/// [SmokeFieldClock], so descendants that re-render the field — e.g.
/// `SurfaceContainer`'s analytic glass blur — stay frame-locked with the
/// background.
class ScreenBackground extends StatefulWidget {
  const ScreenBackground({
    super.key,
    this.speed = 1,
    required this.child,
  });

  /// Time multiplier for the smoke motion (1 = default, 0 = frozen).
  final double speed;

  final Widget child;

  @override
  State<ScreenBackground> createState() => _ScreenBackgroundState();
}

class _ScreenBackgroundState extends State<ScreenBackground>
    with SingleTickerProviderStateMixin {
  final ValueNotifier<double> _time = ValueNotifier<double>(0);
  late final Ticker _ticker = createTicker(_onTick);

  @override
  void initState() {
    super.initState();
    _ticker.start();
  }

  void _onTick(Duration elapsed) {
    _time.value =
        elapsed.inMicroseconds / Duration.microsecondsPerSecond * widget.speed;
  }

  @override
  void dispose() {
    _ticker.dispose();
    _time.dispose();
    super.dispose();
  }

  /// The background's render box — [SmokeFieldClock.backgroundBox]. A stable
  /// tear-off, so the inherited widget doesn't notify on every rebuild.
  RenderBox? _backgroundBox() {
    final renderObject = context.findRenderObject();
    return renderObject is RenderBox && renderObject.attached
        ? renderObject
        : null;
  }

  @override
  Widget build(BuildContext context) {
    return SmokeFieldClock(
      time: _time,
      backgroundBox: _backgroundBox,
      child: ColoredBox(
        color: ScreenBackgroundExtension.of(context).baseColor,
        child: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            ScreenShaderBackground(time: _time),
            widget.child,
          ],
        ),
      ),
    );
  }
}
