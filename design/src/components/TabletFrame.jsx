import SmokeLayer from './SmokeLayer.jsx'
import AnimatedSmokeLayer from './AnimatedSmokeLayer.jsx'
import ShaderSmokeLayer from './ShaderSmokeLayer.jsx'

// iPad Pro 12.9" portrait — 1024 × 1366 pt, thin uniform bezel (no Dynamic
// Island). Same device language as PhoneFrame: surface fill, ring + deep drop
// shadow, smoke background, clipped content column.
// smokeVariant: same values as PhoneFrame.
export default function TabletFrame({ children, smokeVariant = 'slate' }) {
  return (
    <div data-tablet-frame style={{
      width: 1024,
      height: 1366,
      borderRadius: 24,
      background: 'var(--cs-surface)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.08), 0 32px 80px rgba(var(--cs-shadow-rgb),0.8)',
    }}>
      {smokeVariant === 'shader'
        ? <ShaderSmokeLayer />
        : smokeVariant === 'animated'
          ? <AnimatedSmokeLayer />
          : <SmokeLayer variant={smokeVariant} />
      }

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}
