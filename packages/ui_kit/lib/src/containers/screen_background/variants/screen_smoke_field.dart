import 'package:flutter/material.dart';
import 'package:ui_kit/src/containers/screen_background/variants/screen_smoke_palette.dart';

/// Shared smoke "field" definition — the single source of truth for sphere
/// placement and motion used by BOTH [ScreenBackground] variants, so the GPU
/// shader and the gradient/blur renderer composite an identical layout.
///
/// Ported from design/src/components/AnimatedSmokeLayer.jsx. Coordinates are
/// authored in px against the [smokeDesignWidth]-wide design frame; each
/// painter scales them to its own size.

/// One smoke sphere's static placement (px on the design frame).
class SmokeSphere {
  const SmokeSphere({
    required this.size,
    required this.top,
    required this.left,
    required this.blur,
    required this.colorIndex,
  });

  final double size;
  final double top;
  final double left;
  final double blur;
  final int colorIndex;
}

/// One sphere's 5-stop keyframe motion (0/25/50/75/100%) + loop timing.
class SmokeMotion {
  const SmokeMotion({
    required this.x,
    required this.y,
    required this.o,
    required this.dur,
    required this.offset,
  });

  final List<double> x;
  final List<double> y;
  final List<double> o;
  final double dur;
  final double offset;
}

/// A sphere resolved to a concrete state at a point in time (design-space px).
class SmokeBlob {
  const SmokeBlob({
    required this.center,
    required this.radius,
    required this.blur,
    required this.color,
    required this.opacity,
  });

  /// Center in design-space px (scale by `size.width / smokeDesignWidth`).
  final Offset center;

  /// Radius in design-space px.
  final double radius;

  /// Blur sigma in design-space px.
  final double blur;

  final Color color;
  final double opacity;
}

/// Design frame width the sphere coordinates are authored against.
const double smokeDesignWidth = 430;

const List<SmokeSphere> smokeSpheres = <SmokeSphere>[
  SmokeSphere(size: 420, top: 88, left: 44, blur: 120, colorIndex: 0),
  SmokeSphere(size: 350, top: 176, left: 77, blur: 100, colorIndex: 1),
  SmokeSphere(size: 316, top: 472, left: 88, blur: 90, colorIndex: 2),
  SmokeSphere(size: 280, top: 604, left: 104, blur: 110, colorIndex: 3),
  SmokeSphere(size: 420, top: 254, left: 3, blur: 140, colorIndex: 4),
  SmokeSphere(size: 210, top: 44, left: 130, blur: 80, colorIndex: 5),
];

const List<SmokeMotion> smokeMotions = <SmokeMotion>[
  SmokeMotion(
    x: <double>[0, 40, 60, -20, 0],
    y: <double>[0, -50, 28, 55, 0],
    o: <double>[0.10, 0.20, 0.07, 0.17, 0.10],
    dur: 13,
    offset: 0,
  ),
  SmokeMotion(
    x: <double>[0, -35, 22, 50, 0],
    y: <double>[0, 40, -55, -18, 0],
    o: <double>[0.08, 0.18, 0.12, 0.07, 0.08],
    dur: 17,
    offset: 3.2,
  ),
  SmokeMotion(
    x: <double>[0, 48, -30, 14, 0],
    y: <double>[0, 18, 48, -40, 0],
    o: <double>[0.10, 0.07, 0.20, 0.10, 0.10],
    dur: 15,
    offset: 6.5,
  ),
  SmokeMotion(
    x: <double>[0, -18, 36, -48, 0],
    y: <double>[0, -35, -18, 44, 0],
    o: <double>[0.12, 0.08, 0.19, 0.10, 0.12],
    dur: 19,
    offset: 9.1,
  ),
  SmokeMotion(
    x: <double>[0, 30, -50, 20, 0],
    y: <double>[0, 50, -14, -52, 0],
    o: <double>[0.08, 0.18, 0.07, 0.14, 0.08],
    dur: 11,
    offset: 1.8,
  ),
  SmokeMotion(
    x: <double>[0, -50, 28, 36, 0],
    y: <double>[0, 14, 58, -22, 0],
    o: <double>[0.10, 0.20, 0.08, 0.16, 0.10],
    dur: 16,
    offset: 4.7,
  ),
];

/// Interpolate a 5-stop keyframe track (0/.25/.5/.75/1) with ease-in-out per
/// segment, matching the CSS `ease-in-out` timing between stops.
double _track(List<double> stops, double phase) {
  final scaled = phase * 4; // 4 segments
  final segment = scaled.floor().clamp(0, 3);
  final localT = Curves.easeInOut.transform(scaled - segment);
  return stops[segment] + (stops[segment + 1] - stops[segment]) * localT;
}

/// Resolve all six spheres to their concrete [SmokeBlob] state at [time]
/// seconds. Both variants call this so their motion is bit-for-bit identical.
List<SmokeBlob> smokeBlobsAt(double time) {
  return <SmokeBlob>[
    for (var i = 0; i < smokeSpheres.length; i++)
      _blobAt(smokeSpheres[i], smokeMotions[i], time),
  ];
}

SmokeBlob _blobAt(SmokeSphere sphere, SmokeMotion motion, double time) {
  // Negative delay → start mid-cycle on the first frame.
  final phase = ((time + motion.offset) % motion.dur) / motion.dur;
  final dx = _track(motion.x, phase);
  final dy = _track(motion.y, phase);
  final opacity = _track(motion.o, phase).clamp(0.0, 1.0);

  return SmokeBlob(
    center: Offset(
      sphere.left + sphere.size / 2 + dx,
      sphere.top + sphere.size / 2 + dy,
    ),
    radius: sphere.size / 2,
    blur: sphere.blur,
    color: ScreenSmokePalette.smokeColors[sphere.colorIndex],
    opacity: opacity,
  );
}
