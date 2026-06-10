import GlassCard from './GlassCard.jsx'

// 398×88, r=16, accent strip 5px left, content pad 20/18 gap 10
export default function TaskItem({ title, time, exerciseCount, status = 'Planned' }) {
  const accentColor = status === 'Completed'
    ? 'var(--cs-status-completed)'
    : 'var(--cs-status-planned)'

  return (
    <GlassCard level="Low" style={{
      width: 398,
      height: 88,
      display: 'flex',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* 5px accent strip */}
      <div style={{ width: 5, background: accentColor, flexShrink: 0 }}/>

      {/* Content */}
      <div style={{
        flex: 1,
        paddingLeft: 20, paddingRight: 20,
        paddingTop: 18, paddingBottom: 18,
        display: 'flex', flexDirection: 'column', gap: 10,
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--tt-font-family)',
          fontSize: 17,
          fontWeight: 500,
          lineHeight: '24px',
          color: 'var(--cs-on-surface)',
        }}>
          {title}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon />
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--cs-on-surface-variant)',
            }}>
              {time}
            </span>
          </div>

          <div style={{
            width: 3, height: 3,
            borderRadius: '50%',
            background: 'var(--cs-on-surface)',
            opacity: 0.4,
          }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ActivityIcon />
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--cs-on-surface-variant)',
            }}>
              {exerciseCount} exercises
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

// Activity/waveform icon — common fitness indicator
function ActivityIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}
