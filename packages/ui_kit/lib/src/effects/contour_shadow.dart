import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter/material.dart';

/// Max shadows the fragment shader can composite in one pass (the theme uses
/// at most 2). Lists longer than this fall back to the painter.
const int _maxShadows = 4;

const String _shaderAsset = 'packages/ui_kit/shaders/box_shadow.frag';

/// Lazily loads and caches the `box_shadow.frag` program once, app-wide, so a
/// long list of [ContourShadow]s doesn't reload it per item.
class _ShadowShaderProgram {
  _ShadowShaderProgram._();

  static ui.FragmentProgram? _program;
  static Future<ui.FragmentProgram>? _loading;

  /// The loaded program if ready, else null (callers fall back meanwhile).
  static ui.FragmentProgram? get programOrNull => _program;

  static Future<ui.FragmentProgram> load() {
    return _loading ??= ui.FragmentProgram.fromAsset(_shaderAsset).then((p) {
      _program = p;
      return p;
    });
  }
}

/// Paints the elevation shadow of a rounded rectangle for a [List]<[BoxShadow]>,
/// reproducing native Flutter [BoxShadow] semantics (offset, blur, spread,
/// color) with a single fragment shader — no `MaskFilter.blur` / `saveLayer`.
///
/// By default ([contourOnly] = true) the shadow is knocked out inside the
/// rectangle's footprint, so it reads as a contour ring and never paints over a
/// transparent interior (e.g. glass that must show the background through it).
/// Set [contourOnly] = false for a normal drop shadow that also sits under the
/// box.
///
/// Falls back to a `MaskFilter.blur` painter — with identical output — while the
/// shader program loads, if it fails to load (e.g. web HTML renderer), for
/// per-corner (non-uniform) radii, or for more than [_maxShadows] shadows.
class ContourShadow extends StatefulWidget {
  const ContourShadow({
    super.key,
    required this.shadows,
    required this.borderRadius,
    this.contourOnly = true,
    this.child,
  });

  /// The shadows to composite, in paint order (first = bottom-most).
  final List<BoxShadow> shadows;

  /// Footprint of the shadow caster. The shader path requires a uniform
  /// circular radius; non-uniform radii use the fallback painter.
  final BorderRadius borderRadius;

  /// When true (default) the interior of [borderRadius] is left transparent.
  final bool contourOnly;

  /// The widget the shadow sits behind.
  final Widget? child;

  @override
  State<ContourShadow> createState() => _ContourShadowState();
}

class _ContourShadowState extends State<ContourShadow> {
  ui.FragmentShader? _shader;

  @override
  void initState() {
    super.initState();
    final cached = _ShadowShaderProgram.programOrNull;
    if (cached != null) {
      _shader = cached.fragmentShader();
    } else {
      _ShadowShaderProgram.load()
          .then((program) {
            if (!mounted) return;
            setState(() => _shader = program.fragmentShader());
          })
          .catchError((_) {
            // No shader support / asset missing → keep the fallback painter.
          });
    }
  }

  @override
  void dispose() {
    _shader?.dispose();
    super.dispose();
  }

  bool get _radiusIsUniformCircular {
    final r = widget.borderRadius;
    return r.topLeft == r.topRight &&
        r.topRight == r.bottomLeft &&
        r.bottomLeft == r.bottomRight &&
        r.topLeft.x == r.topLeft.y;
  }

  @override
  Widget build(BuildContext context) {
    final shader = _shader;
    final useShader =
        shader != null &&
        _radiusIsUniformCircular &&
        widget.shadows.length <= _maxShadows;

    final CustomPainter painter = useShader
        ? _ShadowShaderPainter(
            shader: shader,
            shadows: widget.shadows,
            corner: widget.borderRadius.topLeft.x,
            contourOnly: widget.contourOnly,
          )
        : _FallbackShadowPainter(
            radius: widget.borderRadius,
            shadows: widget.shadows,
            contourOnly: widget.contourOnly,
          );

    // For a contour shadow (transparent interior) paint it as a FOREGROUND, on
    // top of the child: the ring sits entirely outside the footprint so it
    // doesn't cover content, and — crucially — a child BackdropFilter (e.g. a
    // blurred surface) then samples only the real backdrop, not this shadow
    // (which a behind-painter would let the blur pull inward, darkening the
    // edges). A full drop shadow (contourOnly == false) must stay behind.
    return CustomPaint(
      isComplex: true,
      painter: widget.contourOnly ? null : painter,
      foregroundPainter: widget.contourOnly ? painter : null,
      child: widget.child,
    );
  }
}

/// Computes the bounds padding needed to fit the softest/farthest shadow.
double _shadowPad(List<BoxShadow> shadows) {
  var pad = 0.0;
  for (final s in shadows) {
    pad = math.max(pad, s.blurRadius * 2 + s.spreadRadius + s.offset.distance);
  }
  return pad.clamp(20.0, 400.0);
}

/// Draws the shadows via `box_shadow.frag`. Uniform floats are set in the exact
/// declaration order of the shader.
class _ShadowShaderPainter extends CustomPainter {
  _ShadowShaderPainter({
    required this.shader,
    required this.shadows,
    required this.corner,
    required this.contourOnly,
  });

  final ui.FragmentShader shader;
  final List<BoxShadow> shadows;
  final double corner;
  final bool contourOnly;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty || shadows.isEmpty) return;

    var i = 0;
    void set(double v) => shader.setFloat(i++, v);

    // uRect (left, top, right, bottom)
    set(0);
    set(0);
    set(size.width);
    set(size.height);
    // uParams (cornerRadius, shadowCount, contourOnly, _)
    set(corner);
    set(shadows.length.toDouble());
    set(contourOnly ? 1.0 : 0.0);
    set(0);
    // uShadowGeomN / uShadowColorN — zero-fill unused slots (a = 0 → no effect).
    for (var s = 0; s < _maxShadows; s++) {
      if (s < shadows.length) {
        final sh = shadows[s];
        set(sh.offset.dx);
        set(sh.offset.dy);
        set(sh.blurSigma);
        set(sh.spreadRadius);
        set(sh.color.r);
        set(sh.color.g);
        set(sh.color.b);
        set(sh.color.a);
      } else {
        for (var z = 0; z < 8; z++) {
          set(0);
        }
      }
    }

    canvas.drawRect(
      (Offset.zero & size).inflate(_shadowPad(shadows)),
      Paint()..shader = shader,
    );
  }

  @override
  bool shouldRepaint(_ShadowShaderPainter old) =>
      old.shader != shader ||
      old.corner != corner ||
      old.contourOnly != contourOnly ||
      !listEquals(old.shadows, shadows);
}

/// `MaskFilter.blur` fallback — identical output to the shader path. Used until
/// the shader loads, on load failure, for per-corner radii, or for long lists.
class _FallbackShadowPainter extends CustomPainter {
  _FallbackShadowPainter({
    required this.radius,
    required this.shadows,
    required this.contourOnly,
  });

  final BorderRadius radius;
  final List<BoxShadow> shadows;
  final bool contourOnly;

  @override
  void paint(Canvas canvas, Size size) {
    if (shadows.isEmpty) return;

    final rect = Offset.zero & size;
    final rrect = radius.toRRect(rect);

    canvas.save();
    if (contourOnly) {
      // Outer ring only — knock out the interior.
      canvas.clipPath(
        Path.combine(
          PathOperation.difference,
          Path()..addRect(rect.inflate(_shadowPad(shadows))),
          Path()..addRRect(rrect),
        ),
      );
    }

    for (final shadow in shadows) {
      canvas.drawRRect(
        radius.toRRect(rect.shift(shadow.offset).inflate(shadow.spreadRadius)),
        Paint()
          ..color = shadow.color
          ..maskFilter = MaskFilter.blur(BlurStyle.normal, shadow.blurSigma),
      );
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(_FallbackShadowPainter old) =>
      old.radius != radius ||
      old.contourOnly != contourOnly ||
      !listEquals(old.shadows, shadows);
}
