#version 460 core
#include <flutter/runtime_effect.glsl>

// ════════════════════════════════════════════════════════════════════
// box_shadow — analytic rounded-rect drop shadow for a List<BoxShadow>.
//
// Renders up to MAX_SHADOWS Gaussian-blurred rounded rectangles in one pass,
// reproducing Flutter's BoxShadow semantics (offset, blurSigma, spreadRadius,
// color) WITHOUT MaskFilter.blur / saveLayer. Uses the Evan Wallace technique:
// the exact shadow of a box is a product of two 1-D error functions; for a
// rounded box we integrate a 1-D Gaussian over y and use erf() across x, with a
// per-row corner correction. ~4 samples is plenty for soft shadows.
//
// All geometry is in the canvas' logical px (FlutterFragCoord space) — the Dart
// painter passes values un-scaled, matching the smoke shader's convention.
//
//   uRect       = (left, top, right, bottom)        the container rect
//   uParams     = (cornerRadius, shadowCount, contourOnly, _)
//   uShadowGeomN= (offset.x, offset.y, sigma, spread)
//   uShadowColorN=(r, g, b, a)   straight alpha
//
// When contourOnly == 1 the shadow is knocked out inside the container's
// footprint (the analytic equivalent of a Path.combine(difference) clip), so it
// never paints over a transparent glass interior.
// ════════════════════════════════════════════════════════════════════

uniform vec4 uRect;
uniform vec4 uParams;

uniform vec4 uShadowGeom0; uniform vec4 uShadowColor0;
uniform vec4 uShadowGeom1; uniform vec4 uShadowColor1;
uniform vec4 uShadowGeom2; uniform vec4 uShadowColor2;
uniform vec4 uShadowGeom3; uniform vec4 uShadowColor3;

out vec4 fragColor;

const float PI = 3.141592653589793;

float gaussian(float x, float sigma) {
  return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * PI) * sigma);
}

// erf() approximation (Abramowitz & Stegun 7.1.26), vec2 form.
vec2 erf(vec2 x) {
  vec2 s = sign(x), a = abs(x);
  x = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a * a)) * a) * a;
  x *= x;
  return s - s / (x * x);
}

// Horizontal coverage of the blurred rounded box at a given (x, y), with the
// box's left/right edges pulled in near the corners.
float roundedBoxShadowX(float x, float y, float sigma, float corner, vec2 halfSize) {
  float delta = min(halfSize.y - corner - abs(y), 0.0);
  float curved = halfSize.x - corner + sqrt(max(0.0, corner * corner - delta * delta));
  vec2 integral = 0.5 + 0.5 * erf((x + vec2(-curved, curved)) * (sqrt(0.5) / sigma));
  return integral.y - integral.x;
}

// Coverage in [0,1] of a rounded box [lower,upper] blurred by `sigma`, at `point`.
float roundedBoxShadow(vec2 lower, vec2 upper, vec2 point, float sigma, float corner) {
  vec2 center = (lower + upper) * 0.5;
  vec2 halfSize = (upper - lower) * 0.5;
  point -= center;
  corner = clamp(corner, 0.0, min(halfSize.x, halfSize.y));

  // Only the ±3σ band around the box contributes — clamp the integration range.
  float low = point.y - halfSize.y;
  float high = point.y + halfSize.y;
  float start = clamp(-3.0 * sigma, low, high);
  float end = clamp(3.0 * sigma, low, high);
  float step = (end - start) / 4.0;

  float y = start + step * 0.5;
  float value = 0.0;
  for (int i = 0; i < 4; i++) {
    value += roundedBoxShadowX(point.x, point.y - y, sigma, corner, halfSize)
           * gaussian(y, sigma) * step;
    y += step;
  }
  return value;
}

// Signed distance to a rounded box (negative inside) — used for the contour knockout.
float sdRoundBox(vec2 p, vec2 halfSize, float corner) {
  vec2 q = abs(p) - halfSize + corner;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - corner;
}

// Composite one shadow over the running premultiplied result (source-over).
void over(inout vec3 pre, inout float trans, vec2 p, vec4 geom, vec4 col, float corner) {
  float sigma = max(geom.z, 1.0e-3);
  float spread = geom.w;
  vec2 lower = uRect.xy + geom.xy - spread;
  vec2 upper = uRect.zw + geom.xy + spread;
  float coverage = roundedBoxShadow(lower, upper, p, sigma, corner);
  float ai = clamp(col.a * coverage, 0.0, 1.0);
  pre += col.rgb * (ai * trans);
  trans *= (1.0 - ai);
}

float hash(vec2 p, vec2 k) { return fract(sin(dot(p, k)) * 43758.5453); }

float dither(vec2 p) {
  return hash(p, vec2(12.9898, 78.233)) - hash(p, vec2(39.346, 11.135));
}

void main() {
  vec2 p = FlutterFragCoord().xy;
  float corner = uParams.x;
  int count = int(uParams.y + 0.5);
  float contourOnly = uParams.z;

  vec3 pre = vec3(0.0);
  float trans = 1.0;

  // Front (highest index) → back (0), so source-over stacks correctly.
  if (count > 3) over(pre, trans, p, uShadowGeom3, uShadowColor3, corner);
  if (count > 2) over(pre, trans, p, uShadowGeom2, uShadowColor2, corner);
  if (count > 1) over(pre, trans, p, uShadowGeom1, uShadowColor1, corner);
  if (count > 0) over(pre, trans, p, uShadowGeom0, uShadowColor0, corner);

  float alpha = 1.0 - trans;

  // Knock out the container's interior (transparent glass must show through).
  if (contourOnly > 0.5) {
    vec2 center = (uRect.xy + uRect.zw) * 0.5;
    vec2 halfSize = (uRect.zw - uRect.xy) * 0.5;
    float r = clamp(corner, 0.0, min(halfSize.x, halfSize.y));
    float sd = sdRoundBox(p - center, halfSize, r);
    float inside = 1.0 - smoothstep(-0.75, 0.75, sd);
    float k = 1.0 - inside;
    pre *= k;
    alpha *= k;
  }

  alpha += dither(p) / 255.0;
  fragColor = vec4(pre, alpha);
}
