#version 460 core
#include <flutter/runtime_effect.glsl>

// ════════════════════════════════════════════════════════════════════
// surface_glass — analytic "backdrop blur" for SurfaceContainer over the
// smoke background.
//
// The backdrop behind a glass card is our own procedural field (base color +
// Gaussian-blurred discs, see screen_shader_background.frag), so the blurred
// backdrop is COMPUTED exactly instead of sampled from the framebuffer: a
// Gaussian blur (sigma b) of a disc already blurred by sigma s is the same
// disc blurred by sqrt(s² + b²). No saveLayer, no readback.
//
// The Dart side folds the glass blur sigma into each sphere's sigma and
// passes centers already transformed to the card's local px:
//   uSphereN = (center.x, center.y, radius, blurSigma)   card-local px
//   uTintN   = (r, g, b, opacity)
//   uBase    = ScreenBackground base color (r, g, b)
// Spheres are listed back (0) to front (5); we composite front→back.
//
// Output is OPAQUE (base + smoke): it fully replaces the sharp backdrop, and
// the translucent glass fill is painted on top of it by the widget.
// ════════════════════════════════════════════════════════════════════

uniform vec4 uSphere0; uniform vec4 uTint0;
uniform vec4 uSphere1; uniform vec4 uTint1;
uniform vec4 uSphere2; uniform vec4 uTint2;
uniform vec4 uSphere3; uniform vec4 uTint3;
uniform vec4 uSphere4; uniform vec4 uTint4;
uniform vec4 uSphere5; uniform vec4 uTint5;
uniform vec3 uBase;

out vec4 fragColor;

// composite one blurred disc over the running result (normal "source-over").
// Identical to screen_shader_background.frag so the un-blurred field matches
// the background bit-for-bit.
void over(inout vec3 pre, inout float trans, vec2 frag, vec4 s, vec4 t) {
  float d = distance(frag, s.xy);
  float edge = max(s.w, 1.0) * 2.0;               // ~4·sigma transition width
  float coverage = 1.0 - smoothstep(s.z - edge, s.z + edge, d);
  float ai = clamp(t.w * coverage, 0.0, 1.0);     // this disc's local alpha
  pre   += t.rgb * (ai * trans);                  // premultiplied accumulation
  trans *= (1.0 - ai);
}

float hash(vec2 p, vec2 k) { return fract(sin(dot(p, k)) * 43758.5453); }

// Triangular-PDF dither at ±1 LSB — debands the near-black gradient.
float dither(vec2 p) {
  return hash(p, vec2(12.9898, 78.233)) - hash(p, vec2(39.346, 11.135));
}

void main() {
  vec2 frag = FlutterFragCoord().xy;

  vec3  pre   = vec3(0.0);
  float trans = 1.0;

  // front (5) → back (0), matching the background's draw order.
  over(pre, trans, frag, uSphere5, uTint5);
  over(pre, trans, frag, uSphere4, uTint4);
  over(pre, trans, frag, uSphere3, uTint3);
  over(pre, trans, frag, uSphere2, uTint2);
  over(pre, trans, frag, uSphere1, uTint1);
  over(pre, trans, frag, uSphere0, uTint0);

  vec3 rgb = pre + uBase * trans;                  // smoke over the base color
  rgb += dither(frag) / 255.0;
  fragColor = vec4(rgb, 1.0);
}
