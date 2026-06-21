// iPhone 15 Pro Max — 430 × 932, corner-radius 55, Dynamic Island 126×37 @ y=11
// design_v2: static, baked background (no animated smoke / no backdrop blur).
// The `smokeVariant` prop is accepted but ignored (kept for call-site parity).
// → Flutter: a Scaffold with a single DecoratedBox(gradient) background.
export default function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 430,
      height: 932,
      borderRadius: 55,
      background: 'var(--surface-0)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.08), 0 32px 80px rgba(var(--cs-shadow-rgb),0.8)',
    }}>
      {/* Static screen background — one baked gradient, no blur, no animation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-gradient)',
        zIndex: 0,
      }} />

      {/* Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: 11,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 126,
        height: 37,
        borderRadius: 20,
        background: 'rgba(var(--cs-shadow-rgb),1)',
        zIndex: 100,
      }} />

      {/* Content */}
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
