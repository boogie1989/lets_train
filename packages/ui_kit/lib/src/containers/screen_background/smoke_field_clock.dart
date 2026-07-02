import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Shared clock + geometry anchor of the smoke field, provided by
/// `ScreenBackground` to every descendant that renders the field itself
/// (`ScreenShaderBackground`, `SurfaceContainer`'s analytic glass blur).
///
/// One clock per background is essential: the blurred smoke a glass card
/// paints must be evaluated at the same instant as the sharp smoke around it,
/// or the two drift apart.
class SmokeFieldClock extends InheritedWidget {
  const SmokeFieldClock({
    super.key,
    required this.time,
    required this.backgroundBox,
    required super.child,
  });

  /// Elapsed seconds driving `smokeBlobsAt` (speed multiplier already
  /// applied by the owner).
  final ValueListenable<double> time;

  /// Resolves the background's render box — the coordinate space the smoke
  /// field is laid out in. Returns null while it is unattached.
  final RenderBox? Function() backgroundBox;

  static SmokeFieldClock? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SmokeFieldClock>();

  @override
  bool updateShouldNotify(SmokeFieldClock oldWidget) =>
      time != oldWidget.time || backgroundBox != oldWidget.backgroundBox;
}
