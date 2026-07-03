export default function StatusBar({ width = 430 }) {
  return (
    <div style={{
      width,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--cs-on-surface)',
      }}>9:41</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="var(--cs-on-surface)">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
          <rect x="9" y="3" width="3" height="9" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.35"/>
        </svg>
        {/* WiFi */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none" stroke="var(--cs-on-surface)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M7.5 9.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="var(--cs-on-surface)" stroke="none"/>
          <path d="M3 6.5C4.4 5.1 5.9 4.3 7.5 4.3s3.1.8 4.5 2.2"/>
          <path d="M.5 4C2.7 1.8 4.97.8 7.5.8S12.3 1.8 14.5 4" opacity="0.5"/>
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{
            width: 25, height: 12, borderRadius: 3,
            border: '1px solid rgba(var(--overlay-rgb),0.35)',
            padding: '1.5px 2px',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: '80%', height: '100%',
              background: 'var(--cs-on-surface)',
              borderRadius: 1.5,
            }}/>
          </div>
          <div style={{ width: 1.5, height: 5, background: 'rgba(var(--overlay-rgb),0.4)', borderRadius: 1 }}/>
        </div>
      </div>
    </div>
  )
}
