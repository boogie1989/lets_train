// iPhone 15 Pro Max — 430 × 932, corner-radius 55, Dynamic Island 126×37 @ y=11.
// design_v3: the screen background is set per design language. `background`
// defaults to the active language's `--ds-screen-bg`
// (iOS systemGroupedBackground / Hybrid calm surface).
export default function PhoneFrame({ children, background = 'var(--ds-screen-bg)' }) {
  return (
    <div style={{
      width: 430,
      height: 932,
      borderRadius: 55,
      background,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 0 0 1px rgba(0,0,0,0.18), 0 32px 80px rgba(0,0,0,0.55)',
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: 11,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 126,
        height: 37,
        borderRadius: 20,
        background: '#000000',
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
