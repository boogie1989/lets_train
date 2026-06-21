import { useRef, useEffect } from 'react'

/* ════════════════════════════════════════════════════════════════════
   ShaderSmokeLayer — GPU smoke/atmosphere background (single draw call)

   Web preview = WebGL. The FRAGMENT SHADER CORE below is intentionally
   written to port near 1:1 to other Skia-based runtimes:

     • Flutter  → drop the body of `main()` into an `.frag` (FragmentProgram),
                  swap `gl_FragCoord`/`gl_FragColor` for the Flutter idiom,
                  feed the same uniforms (uResolution, uTime, uColors, uOpacity).
     • RN Skia  → wrap in `vec4 main(vec2 fragCoord){ ... return color; }`,
                  build with Skia.RuntimeEffect.Make, push the same uniforms.

   What's portable:  the blob math, the color-as-uniform theming, time drift.
   What's per-platform:  the entry-point signature + how uniforms are bound.

   The number of blobs (6) is baked into the shader. The COLORS are dynamic
   uniforms sourced from the CSS smoke tokens (--smoke-1..6, --smoke-opacity),
   so the layer follows the active theme (dark/light) automatically.
   ═══════════════════════════════════════════════════════════════════ */

const VERT_SRC = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// ── Fragment shader core (portable to Flutter .frag / RN Skia SkSL) ──
//
// Faithful to the CSS SmokeLayer (slate variant): 6 soft spheres in a roughly
// vertical cluster, each a heavily-blurred low-opacity slate blob, composited
// normal-over a transparent layer. Coordinates use the ORIGINAL sphere centers
// (in px on the 430×932 frame), normalized by frame HEIGHT so blobs stay round.
//
// Two things make it read like the blurred original rather than a flat haze:
//   • Gaussian falloff (exp(-d²/2σ²)) = the real shape of a CSS blur, not a
//     hard-edged smoothstep — soft cores fading smoothly to nothing.
//   • Proper normal-over compositing — where every blob's falloff is ~0 the
//     alpha goes to 0, so the gaps reveal the dark phone background.
const FRAG_SRC = `
precision highp float;

uniform vec2  uResolution;   // px
uniform float uTime;         // seconds
uniform vec3  uColors[6];    // smoke-1..6, linear 0..1 rgb
uniform float uOpacity;      // per-sphere base opacity (≈ --smoke-opacity)

// composite one blurred sphere over the running result (normal "source-over")
void over(inout vec3 pre, inout float trans, vec2 p, vec2 c, float sigma, vec3 color, float op) {
  float d2 = dot(p - c, p - c);
  float g  = exp(-d2 / (2.0 * sigma * sigma));   // Gaussian = CSS-blur shape
  float ai = clamp(op * g, 0.0, 1.0);            // this sphere's local alpha
  pre   += color * (ai * trans);                 // premultiplied accumulation
  trans *= (1.0 - ai);
}

void main() {
  // p in units of (px / height), origin top-left → matches the design's
  // top-down sphere coordinates. x spans 0..aspect, y spans 0..1.
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution.y;
  float t = uTime;
  float o = uOpacity;

  // gentle drift + opacity "breathing", mirroring AnimatedSmokeLayer's motion
  #define DRIFT(ax, sx, px, ay, sy, py) (vec2((ax) * sin(t * (sx) + (px)), (ay) * cos(t * (sy) + (py))))
  #define BREATHE(sp, ph) (0.80 + 0.40 * sin(t * (sp) + (ph)))

  vec3  pre   = vec3(0.0);
  float trans = 1.0;

  // centers = original slate sphere centers (cx/932, cy/932); sigma ≈ (w/2+blur)/932
  over(pre, trans, p, vec2(0.272, 0.320) + DRIFT(0.030,0.42,0.0, 0.022,0.37,1.1), 0.35, uColors[0], o * BREATHE(0.50,0.0));
  over(pre, trans, p, vec2(0.270, 0.377) + DRIFT(0.026,0.31,2.0, 0.030,0.45,0.4), 0.29, uColors[1], o * BREATHE(0.45,1.0));
  over(pre, trans, p, vec2(0.264, 0.676) + DRIFT(0.030,0.39,4.0, 0.020,0.29,2.3), 0.27, uColors[2], o * BREATHE(0.55,2.0));
  over(pre, trans, p, vec2(0.262, 0.798) + DRIFT(0.022,0.27,1.5, 0.028,0.41,3.1), 0.27, uColors[3], o * BREATHE(0.50,3.0));
  over(pre, trans, p, vec2(0.228, 0.498) + DRIFT(0.026,0.47,3.3, 0.026,0.33,0.7), 0.37, uColors[4], o * BREATHE(0.40,0.5));
  over(pre, trans, p, vec2(0.252, 0.160) + DRIFT(0.026,0.35,5.0, 0.022,0.49,1.9), 0.20, uColors[5], o * BREATHE(0.60,1.5));

  float alpha = 1.0 - trans;                       // total coverage
  vec3  rgb   = pre / max(alpha, 1e-4);            // un-premultiply → straight color
  gl_FragColor = vec4(rgb, alpha);
}
`

// ── helpers ─────────────────────────────────────────────────────────

// "#475569" / "#abc" → [r,g,b] in 0..1
function hexToRgb01(hex) {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// read the 6 smoke colors + base opacity from the live CSS tokens
function readSmokeTokens() {
  const cs = getComputedStyle(document.documentElement)
  const colors = []
  for (let i = 1; i <= 6; i++) {
    const v = cs.getPropertyValue(`--smoke-${i}`)
    colors.push(...hexToRgb01(v || '#475569'))
  }
  const op = parseFloat(cs.getPropertyValue('--smoke-opacity')) || 0.1
  return { colors, op }
}

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader compile error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

// ── component ───────────────────────────────────────────────────────
// Drop-in sibling of AnimatedSmokeLayer: absolutely fills its positioned
// parent, ignores pointer events, inherits border-radius.
//   opacity — multiplier over the token --smoke-opacity (1 = faithful to CSS)
//   speed   — time multiplier (1 = default, 0 = frozen)
export default function ShaderSmokeLayer({ opacity = 0.5, speed = 1, style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
    if (!gl) return  // no WebGL → render nothing (graceful)

    // program
    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('program link error:', gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    // full-screen quad (two triangles)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(prog, 'uResolution')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uColors = gl.getUniformLocation(prog, 'uColors')
    const uOpacity = gl.getUniformLocation(prog, 'uOpacity')

    // No GL blending: the shader composites all 6 blobs internally in a single
    // fullscreen pass and outputs final straight-alpha rgba. The browser
    // compositor does the over-background blend. Enabling SRC_ALPHA blend here
    // while the context is premultipliedAlpha:false would darken by alpha twice
    // (rgb·a² ≈ black). Leave blending off.

    // theme-driven uniforms (re-read on theme switch)
    let tokens = readSmokeTokens()
    const applyTokens = () => { tokens = readSmokeTokens() }
    const themeObserver = new MutationObserver(applyTokens)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // size handling (DPR-aware, capped for perf)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // respect reduced-motion: freeze at a pleasant mid-cycle frame
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let start = null
    const render = (ts) => {
      if (start === null) start = ts
      const t = reduceMotion ? 6.0 : ((ts - start) / 1000) * speed
      resize()
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform3fv(uColors, tokens.colors)
      gl.uniform1f(uOpacity, tokens.op * opacity)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      themeObserver.disconnect()
      // NOTE: do NOT loseContext() here — getContext('webgl') returns the SAME
      // context object on a remount (e.g. StrictMode's double-invoke), so losing
      // it would leave the surviving effect rendering into a dead context. The
      // context is released by GC when the canvas unmounts.
    }
  }, [opacity, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        ...style,
      }}
    />
  )
}
