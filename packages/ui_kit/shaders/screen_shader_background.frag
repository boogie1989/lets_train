#version 460 core
#include <flutter/runtime_effect.glsl>

// ════════════════════════════════════════════════════════════════════
// screen_shader_background — GPU smoke/atmosphere background.
//
// Renders the SAME six-sphere field as the gradient/blur variant
// (ScreenGradientBackground), so the two ScreenBackground variants look
// alike. Sphere placement, motion and opacity are computed on the Dart side
// (the shared smokeBlobsAt() field) and pushed in as uniforms; this shader
// just composites each sphere as a Gaussian-blurred disc — the GPU analog of
// MaskFilter.blur over a filled circle.
//
// Each sphere arrives as two vec4s, already scaled to device px:
//   uSphereN = (center.x, center.y, radius, blurSigma)
//   uTintN   = (r, g, b, opacity)
// Spheres are listed back (0) to front (5); we composite front→back.
// ════════════════════════════════════════════════════════════════════

uniform vec4 uSphere0; uniform vec4 uTint0;
uniform vec4 uSphere1; uniform vec4 uTint1;
uniform vec4 uSphere2; uniform vec4 uTint2;
uniform vec4 uSphere3; uniform vec4 uTint3;
uniform vec4 uSphere4; uniform vec4 uTint4;
uniform vec4 uSphere5; uniform vec4 uTint5;

out vec4 fragColor;

// composite one blurred disc over the running result (normal "source-over").
// coverage approximates a filled circle (radius s.z) blurred by Gaussian
// sigma s.w: a soft edge spanning ~4·sigma centered on the radius.
void over(inout vec3 pre, inout float trans, vec2 frag, vec4 s, vec4 t) {
  float d = distance(frag, s.xy);
  float edge = max(s.w, 1.0) * 2.0;               // ~4·sigma transition width
  float coverage = 1.0 - smoothstep(s.z - edge, s.z + edge, d);
  float ai = clamp(t.w * coverage, 0.0, 1.0);     // this disc's local alpha
  pre   += t.rgb * (ai * trans);                  // premultiplied accumulation
  trans *= (1.0 - ai);
}

float hash(vec2 p, vec2 k) { return fract(sin(dot(p, k)) * 43758.5453); }

// Triangular-PDF dither (two hashes differenced) at ±1 LSB. Scatters the 1/255
// alpha steps over the near-black gradient so it reads perfectly smooth.
float dither(vec2 p) {
  return hash(p, vec2(12.9898, 78.233)) - hash(p, vec2(39.346, 11.135));
}

void main() {
  vec2 frag = FlutterFragCoord().xy;

  vec3  pre   = vec3(0.0);
  float trans = 1.0;

  // front (5) → back (0), matching the gradient painter's draw order.
  over(pre, trans, frag, uSphere5, uTint5);
  over(pre, trans, frag, uSphere4, uTint4);
  over(pre, trans, frag, uSphere3, uTint3);
  over(pre, trans, frag, uSphere2, uTint2);
  over(pre, trans, frag, uSphere1, uTint1);
  over(pre, trans, frag, uSphere0, uTint0);

  // pre is already premultiplied; emit it directly (Flutter blends premultiplied).
  float alpha = 1.0 - trans;                       // total coverage
  alpha += dither(frag) / 255.0;                   // deband
  fragColor = vec4(pre, alpha);
}
