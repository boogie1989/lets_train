import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/screen_background.dart';
import 'package:ui_kit/src/containers/surface_container/surface_container_theme.dart';
import 'package:ui_kit/src/containers/surface_container/widgets/smoke_glass_backdrop.dart';
import 'package:ui_kit/src/effects/contour_shadow.dart';
import 'package:ui_kit/src/effects/inner_top_highlight_painter.dart';
import 'package:ui_kit/src/theme/theme.dart';

export 'package:ui_kit/src/containers/surface_container/surface_container_theme.dart';

/// Elevation level of a [SurfaceContainer] (design: `level` Low / Mid / High).
enum SurfaceLevel { low, mid, high }

/// Flutter port of the design's `SurfaceContainer`
/// (`design/src/components/SurfaceContainer.jsx`): a semi-transparent glass
/// container over the smoke background — themed fill + backdrop blur +
/// hairline border + built-in elevation shadow (ambient + key + 1px inner
/// top-highlight), so it reads as lifted by default with no per-usage shadow.
///
/// All visuals come from [SurfaceContainerExtension]; pick a [level] for the
/// elevation strength.
class SurfaceContainer extends StatelessWidget {
  const SurfaceContainer({
    super.key,
    this.level = SurfaceLevel.mid,
    this.mode,
    this.padding,
    this.borderRadius,
    this.child,
  });

  final SurfaceLevel level;
  final SurfaceBlurMode? mode;

  final EdgeInsetsGeometry? padding;

  /// Overrides the themed corner radius for special cases (e.g. the
  /// square-cornered full-bleed slab).
  final BorderRadius? borderRadius;

  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final theme = SurfaceContainerExtension.of(context);
    final style = switch (level) {
      SurfaceLevel.low => theme.low,
      SurfaceLevel.mid => theme.mid,
      SurfaceLevel.high => theme.high,
    };
    final radius = borderRadius ?? BorderRadius.circular(theme.borderRadius);

    Widget? content = child;
    if (padding != null) {
      content = Padding(padding: padding!, child: content);
    }

    Widget body = CustomPaint(
      foregroundPainter: InnerTopHighlightPainter(
        color: style.innerHighlightColor,
        radius: radius,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: style.backgroundColor,
          borderRadius: radius,
          border: Border.all(
            color: style.borderColor,
            width: theme.borderWidth,
          ),
        ),
        child: content,
      ),
    );

    switch (mode ?? style.blurMode) {
      case SurfaceBlurMode.none:
        break;

      case SurfaceBlurMode.backdrop:
        body = ClipRRect(
          borderRadius: radius,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: style.blur, sigmaY: style.blur),
            child: body,
          ),
        );

      case SurfaceBlurMode.smoke:
        // Analytic blur of the smoke field, painted behind the glass fill by
        // the container's own shader — no saveLayer (see SmokeGlassBackdrop).
        // Without a ScreenBackground clock it degrades to no blur.
        final clock = SmokeFieldClock.maybeOf(context);
        if (clock != null) {
          final background = ScreenBackgroundExtension.of(context);
          body = SmokeGlassBackdrop(
            time: clock.time,
            backgroundBox: clock.backgroundBox,
            blurSigma: style.blur,
            borderRadius: radius,
            baseColor: background.baseColor,
            smokeColors: background.smokeColors,
            opacityMultiplier: background.opacityMultiplier,
            child: body,
          );
        }
    }

    // ContourShadow keeps the elevation ring outside the footprint so a
    // backdrop blur samples only the real backdrop, not the shadow.
    return ContourShadow(
      shadows: style.shadows,
      borderRadius: radius,
      child: body,
    );
  }
}

