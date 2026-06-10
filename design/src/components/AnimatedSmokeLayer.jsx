const SPHERES = [
  { w: 420, h: 420, top:  88, left:  44, color: 'var(--smoke-1)', blur: 120 },
  { w: 350, h: 350, top: 176, left:  77, color: 'var(--smoke-2)', blur: 100 },
  { w: 316, h: 316, top: 472, left:  88, color: 'var(--smoke-3)', blur:  90 },
  { w: 280, h: 280, top: 604, left: 104, color: 'var(--smoke-4)', blur: 110 },
  { w: 420, h: 420, top: 254, left:   3, color: 'var(--smoke-5)', blur: 140 },
  { w: 210, h: 210, top:  44, left: 130, color: 'var(--smoke-6)', blur:  80 },
]

// Each sphere: drift path, opacity range, duration, start-offset (negative delay)
const MOTION = [
  { x: [ 0,  40,  60, -20,  0], y: [ 0, -50,  28,  55,  0], o: [0.10, 0.20, 0.07, 0.17, 0.10], dur: 13, offset:  0   },
  { x: [ 0, -35,  22,  50,  0], y: [ 0,  40, -55, -18,  0], o: [0.08, 0.18, 0.12, 0.07, 0.08], dur: 17, offset:  3.2 },
  { x: [ 0,  48, -30,  14,  0], y: [ 0,  18,  48, -40,  0], o: [0.10, 0.07, 0.20, 0.10, 0.10], dur: 15, offset:  6.5 },
  { x: [ 0, -18,  36, -48,  0], y: [ 0, -35, -18,  44,  0], o: [0.12, 0.08, 0.19, 0.10, 0.12], dur: 19, offset:  9.1 },
  { x: [ 0,  30, -50,  20,  0], y: [ 0,  50, -14, -52,  0], o: [0.08, 0.18, 0.07, 0.14, 0.08], dur: 11, offset:  1.8 },
  { x: [ 0, -50,  28,  36,  0], y: [ 0,  14,  58, -22,  0], o: [0.10, 0.20, 0.08, 0.16, 0.10], dur: 16, offset:  4.7 },
]

const KEYFRAMES = MOTION.map((m, i) => `
@keyframes asd${i} {
  0%   { transform: translate(${m.x[0]}px,${m.y[0]}px); opacity:${m.o[0]}; }
  25%  { transform: translate(${m.x[1]}px,${m.y[1]}px); opacity:${m.o[1]}; }
  50%  { transform: translate(${m.x[2]}px,${m.y[2]}px); opacity:${m.o[2]}; }
  75%  { transform: translate(${m.x[3]}px,${m.y[3]}px); opacity:${m.o[3]}; }
  100% { transform: translate(${m.x[4]}px,${m.y[4]}px); opacity:${m.o[4]}; }
}`).join('')

export default function AnimatedSmokeLayer() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit',
      }}>
        {SPHERES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: s.w, height: s.h,
            top: s.top, left: s.left,
            borderRadius: '50%',
            background: s.color,
            filter: `blur(${s.blur}px)`,
            willChange: 'transform, opacity',
            // delay as negative offset so animation is mid-cycle on mount
            animation: `asd${i} ${MOTION[i].dur}s ease-in-out -${MOTION[i].offset}s infinite`,
          }}/>
        ))}
      </div>
    </>
  )
}
