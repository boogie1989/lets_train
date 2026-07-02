import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart' show ValueListenable, listEquals;
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:ui_kit/src/containers/screen_background/widgets/screen_smoke_field.dart';

/// Paints an analytically-blurred smoke backdrop behind its child — the
/// shader-computed alternative to `BackdropFilter` for glass that sits over
/// `ScreenBackground` (see `surface_glass.frag`): the blurred backdrop of the
/// procedural field is computed exactly (σ′ = √(σ² + blur²)) instead of read
/// back from the framebuffer, so it costs no saveLayer.
///
/// Fills the child's rounded rect with an OPAQUE base-color + blurred-smoke
/// layer, frame-locked to the background via the shared [time]. Degrades to
/// painting nothing (glass without blur) while the shader loads, if it can't
/// load, or when the widget isn't a descendant of the background box.
class SmokeGlassBackdrop extends SingleChildRenderObjectWidget {
  const SmokeGlassBackdrop({
    super.key,
    required this.time,
    required this.backgroundBox,
    required this.blurSigma,
    required this.borderRadius,
    required this.baseColor,
    required this.smokeColors,
    required this.opacityMultiplier,
    super.child,
  });

  /// Shared smoke clock (`SmokeFieldClock.time`).
  final ValueListenable<double> time;

  /// Resolves the background's render box (`SmokeFieldClock.backgroundBox`).
  final RenderBox? Function() backgroundBox;

  /// Glass blur sigma folded into every sphere's own sigma.
  final double blurSigma;

  final BorderRadius borderRadius;

  /// `ScreenBackgroundExtension.baseColor` — what the blur resolves to where
  /// no smoke covers the card.
  final Color baseColor;

  /// `ScreenBackgroundExtension.smokeColors`, indexed by `SmokeBlob.colorIndex`.
  final List<Color> smokeColors;

  /// `ScreenBackgroundExtension.opacityMultiplier`.
  final double opacityMultiplier;

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderSmokeGlassBackdrop(
      time: time,
      backgroundBox: backgroundBox,
      blurSigma: blurSigma,
      borderRadius: borderRadius,
      baseColor: baseColor,
      smokeColors: smokeColors,
      opacityMultiplier: opacityMultiplier,
    );
  }

  @override
  void updateRenderObject(
    BuildContext context,
    RenderSmokeGlassBackdrop renderObject,
  ) {
    renderObject
      ..time = time
      ..backgroundBox = backgroundBox
      ..blurSigma = blurSigma
      ..borderRadius = borderRadius
      ..baseColor = baseColor
      ..smokeColors = smokeColors
      ..opacityMultiplier = opacityMultiplier;
  }
}

/// Lazily loads and caches the `surface_glass.frag` program once, app-wide.
class _GlassShaderProgram {
  _GlassShaderProgram._();

  static const String _asset = 'packages/ui_kit/shaders/surface_glass.frag';

  static ui.FragmentProgram? _program;
  static Future<void>? _loading;

  static ui.FragmentProgram? get programOrNull => _program;

  static Future<void> load() {
    return _loading ??= ui.FragmentProgram.fromAsset(_asset)
        .then((program) {
          _program = program;
        })
        .catchError((_) {
          // No shader support / asset missing → consumers keep the no-blur
          // degrade.
        });
  }
}

class RenderSmokeGlassBackdrop extends RenderProxyBox {
  RenderSmokeGlassBackdrop({
    required this._time,
    required this._backgroundBox,
    required this._blurSigma,
    required this._borderRadius,
    required this._baseColor,
    required this._smokeColors,
    required this._opacityMultiplier,
  });

  ui.FragmentShader? _shader;

  ValueListenable<double> _time;
  set time(ValueListenable<double> value) {
    if (identical(value, _time)) return;
    if (attached) _time.removeListener(markNeedsPaint);
    _time = value;
    if (attached) _time.addListener(markNeedsPaint);
    markNeedsPaint();
  }

  RenderBox? Function() _backgroundBox;
  set backgroundBox(RenderBox? Function() value) {
    if (value == _backgroundBox) return;
    _backgroundBox = value;
    markNeedsPaint();
  }

  double _blurSigma;
  set blurSigma(double value) {
    if (value == _blurSigma) return;
    _blurSigma = value;
    markNeedsPaint();
  }

  BorderRadius _borderRadius;
  set borderRadius(BorderRadius value) {
    if (value == _borderRadius) return;
    _borderRadius = value;
    markNeedsPaint();
  }

  Color _baseColor;
  set baseColor(Color value) {
    if (value == _baseColor) return;
    _baseColor = value;
    markNeedsPaint();
  }

  List<Color> _smokeColors;
  set smokeColors(List<Color> value) {
    if (listEquals(value, _smokeColors)) return;
    _smokeColors = value;
    markNeedsPaint();
  }

  double _opacityMultiplier;
  set opacityMultiplier(double value) {
    if (value == _opacityMultiplier) return;
    _opacityMultiplier = value;
    markNeedsPaint();
  }

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);
    _time.addListener(markNeedsPaint);
    if (_GlassShaderProgram.programOrNull == null) {
      _GlassShaderProgram.load().then((_) {
        if (attached) markNeedsPaint();
      });
    }
  }

  @override
  void detach() {
    _time.removeListener(markNeedsPaint);
    super.detach();
  }

  @override
  void dispose() {
    _shader?.dispose();
    _shader = null;
    super.dispose();
  }

  /// Whether [ancestor] is on this box's parent chain — [Offset]s between the
  /// two spaces are only meaningful (and `localToGlobal` only safe) if so.
  bool _hasAncestor(RenderBox ancestor) {
    RenderObject? node = parent;
    while (node != null) {
      if (identical(node, ancestor)) return true;
      node = node.parent;
    }
    return false;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final program = _GlassShaderProgram.programOrNull;
    final background = _backgroundBox();
    if (program != null &&
        background != null &&
        background.hasSize &&
        hasSize &&
        _smokeColors.length >= 6 &&
        _hasAncestor(background)) {
      final shader = _shader ??= program.fragmentShader();

      // The card's origin in the background's space: blob centers move into
      // card-local px so FlutterFragCoord matches (same convention as
      // box_shadow.frag).
      final cardOrigin = localToGlobal(Offset.zero, ancestor: background);
      final scale = background.size.width / smokeDesignWidth;

      var i = 0;
      for (final blob in smokeBlobsAt(_time.value)) {
        final center = blob.center * scale - cardOrigin;
        final sigma = blob.blur * scale;
        final color = _smokeColors[blob.colorIndex];
        shader
          ..setFloat(i++, center.dx)
          ..setFloat(i++, center.dy)
          ..setFloat(i++, blob.radius * scale)
          // Gaussian of a Gaussian: sigmas add in quadrature.
          ..setFloat(i++, math.sqrt(sigma * sigma + _blurSigma * _blurSigma))
          ..setFloat(i++, color.r)
          ..setFloat(i++, color.g)
          ..setFloat(i++, color.b)
          ..setFloat(i++, (blob.opacity * _opacityMultiplier).clamp(0.0, 1.0));
      }
      shader
        ..setFloat(i++, _baseColor.r)
        ..setFloat(i++, _baseColor.g)
        ..setFloat(i++, _baseColor.b);

      final canvas = context.canvas;
      canvas
        ..save()
        ..translate(offset.dx, offset.dy)
        ..clipRRect(_borderRadius.toRRect(Offset.zero & size))
        ..drawRect(Offset.zero & size, Paint()..shader = shader)
        ..restore();
    }
    super.paint(context, offset);
  }
}
