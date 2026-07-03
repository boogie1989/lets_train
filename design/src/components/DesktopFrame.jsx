import SmokeLayer from './SmokeLayer.jsx'
import AnimatedSmokeLayer from './AnimatedSmokeLayer.jsx'
import ShaderSmokeLayer from './ShaderSmokeLayer.jsx'

// Desktop window — 1512 × 982 (MacBook Pro 14" logical). Same device language
// as PhoneFrame (surface fill, ring + deep drop shadow, smoke background); the
// radius-12 ring reads as a window on its own — no fake OS chrome, the
// screen's own top bar is the chrome.
// smokeVariant: same values as PhoneFrame.
export default function DesktopFrame({ children, smokeVariant = 'slate' }) {
  return (
    <div data-desktop-frame style={{
      width: 1512,
      height: 982,
      borderRadius: 12,
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
