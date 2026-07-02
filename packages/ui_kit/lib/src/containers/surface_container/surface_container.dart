import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/surface_container/surface_container_theme.dart';
import 'package:ui_kit/src/effects/contour_shadow.dart';

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
    this.padding,
    this.borderRadius,
    this.child,
  });

  final SurfaceLevel level;

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

    // ContourShadow keeps the elevation ring outside the footprint so the
    // BackdropFilter below samples only the real backdrop, not the shadow.
    return ContourShadow(
      shadows: style.shadows,
      borderRadius: radius,
      child: ClipRRect(
        borderRadius: radius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: style.blur, sigmaY: style.blur),
          child: CustomPaint(
            foregroundPainter: _InnerTopHighlightPainter(
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
          ),
        ),
      ),
    );
  }
}

/// Paints the 1px specular highlight along the inner top edge — the CSS
/// `inset 0 1px 0` shadow, which [BoxShadow] cannot express.
class _InnerTopHighlightPainter extends CustomPainter {
  _InnerTopHighlightPainter({required this.color, required this.radius});

  final Color color;
  final BorderRadius radius;

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = radius.toRRect(Offset.zero & size);
    // The sliver between the rrect and itself shifted down 1px = the top
    // inner pixel row, following the corner curves.
    final sliver = Path.combine(
      PathOperation.difference,
      Path()..addRRect(rrect),
      Path()..addRRect(rrect.shift(const Offset(0, 1))),
    );
    canvas.drawPath(sliver, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_InnerTopHighlightPainter old) =>
      old.color != color || old.radius != radius;
}
