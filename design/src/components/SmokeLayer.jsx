// variant: 'center' | 'slate' | 'bottom' | 'scattered' | 'minimal'
// All variants use the same slate color palette — only positions differ.
const COLORS = ['var(--smoke-1)', 'var(--smoke-2)', 'var(--smoke-3)', 'var(--smoke-4)', 'var(--smoke-5)', 'var(--smoke-6)']

const VARIANTS = {
  // Large soft blobs centered — matches the reference screenshot
  center: {
    opacity: 0.10,
    spheres: [
      { w: 500, h: 500, top: 130, left: -35, blur: 160 },
      { w: 420, h: 420, top: 280, left:  10, blur: 140 },
      { w: 380, h: 380, top: 430, left:  25, blur: 150 },
      { w: 340, h: 340, top: 570, left:  45, blur: 130 },
      { w: 460, h: 460, top: 200, left: -20, blur: 170 },
      { w: 260, h: 260, top:  80, left: 110, blur: 110 },
    ],
  },
  // Figma exact — upper-left cluster
  slate: {
    opacity: 0.10,
    spheres: [
      { w: 420, h: 420, top:  88, left:  44, blur: 120 },
      { w: 350, h: 350, top: 176, left:  77, blur: 100 },
      { w: 316, h: 316, top: 472, left:  88, blur:  90 },
      { w: 280, h: 280, top: 604, left: 104, blur: 110 },
      { w: 420, h: 420, top: 254, left:   3, blur: 140 },
      { w: 210, h: 210, top:  44, left: 130, blur:  80 },
    ],
  },
  // Lower 2/3 of screen
  bottom: {
    opacity: 0.10,
    spheres: [
      { w: 420, h: 420, top: 480, left:  44, blur: 120 },
      { w: 350, h: 350, top: 580, left:  77, blur: 100 },
      { w: 316, h: 316, top: 680, left:  20, blur:  90 },
      { w: 280, h: 280, top: 720, left: 140, blur: 110 },
      { w: 420, h: 420, top: 540, left:  -8, blur: 140 },
      { w: 210, h: 210, top: 440, left: 190, blur:  80 },
    ],
  },
  // Spread — top-right + mid-left + bottom-right
  scattered: {
    opacity: 0.10,
    spheres: [
      { w: 380, h: 380, top:  60, left: 180, blur: 120 },
      { w: 320, h: 320, top: 300, left:  30, blur: 100 },
      { w: 280, h: 280, top: 600, left: 170, blur:  90 },
      { w: 360, h: 360, top: 440, left: -20, blur: 110 },
      { w: 420, h: 420, top: 170, left: -10, blur: 140 },
      { w: 220, h: 220, top: 730, left:  80, blur:  80 },
    ],
  },
  // Barely visible — same positions as slate
  minimal: {
    opacity: 0.07,
    spheres: [
      { w: 420, h: 420, top:  88, left:  44, blur: 120 },
      { w: 350, h: 350, top: 176, left:  77, blur: 100 },
      { w: 316, h: 316, top: 472, left:  88, blur:  90 },
      { w: 280, h: 280, top: 604, left: 104, blur: 110 },
      { w: 420, h: 420, top: 254, left:   3, blur: 140 },
      { w: 210, h: 210, top:  44, left: 130, blur:  80 },
    ],
  },
}

export default function SmokeLayer({ variant = 'slate' }) {
  const { opacity, spheres } = VARIANTS[variant] ?? VARIANTS.slate
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      borderRadius: 'inherit',
    }}>
      {spheres.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: s.w,
            height: s.h,
            top: s.top,
            left: s.left,
            borderRadius: '50%',
            background: COLORS[i],
            filter: `blur(${s.blur}px)`,
            opacity,
          }}
        />
      ))}
    </div>
  )
}
