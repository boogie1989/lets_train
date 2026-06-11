import GlassCard from './GlassCard.jsx'

// 398×88, r=16, accent strip 5px left, content pad 20/18 gap 10
// kind: 'workout' (meta = N exercises) | 'meal' (meta = N kcal)
// onToggle (optional): tapping the card flips Completed/Planned; completed cards show a
// quiet emerald "Done" label on the right (status language: strip + label, no controls).
// missed: the item's day is in the past — uncompleted items get a muted "Missed" label.
export default function TaskItem({ title, time, exerciseCount, kcal, kind = 'workout', status = 'Planned', onToggle, missed = false }) {
  const completed = status === 'Completed'
  const label = completed
    ? { text: 'Done', color: 'var(--cs-tertiary)', opacity: 1 }
    : missed
      ? { text: 'Missed', color: 'var(--cs-error)', opacity: 0.75 }
      : null
  const accentColor = completed
    ? 'var(--cs-status-completed)'
    : 'var(--cs-status-planned)'

  return (
    <GlassCard level="Low" onClick={onToggle} style={{
      width: 398,
      height: 88,
      display: 'flex',
      overflow: 'hidden',
      flexShrink: 0,
      cursor: onToggle ? 'pointer' : 'default',
    }}>
      {/* 5px accent strip */}
      <div style={{ width: 5, background: accentColor, flexShrink: 0 }}/>

      {/* Content */}
      <div style={{
        flex: 1, minWidth: 0,
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
            {kind === 'meal' ? <MealIcon /> : <ActivityIcon />}
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--cs-on-surface-variant)',
            }}>
              {kind === 'meal' ? `${kcal} kcal` : `${exerciseCount} exercises`}
            </span>
          </div>
        </div>
      </div>

      {/* Status marker — quiet "Done" (emerald) / "Missed" (muted error) label */}
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 20, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--tt-font-family)',
            fontSize: 10,
            fontWeight: 500,
            color: label.color,
            opacity: label.opacity,
          }}>
            {label.text}
          </span>
        </div>
      )}
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

// Fork & knife — meal items
function MealIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" />
      <line x1="6" y1="12" x2="6" y2="21" />
      <path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" />
      <line x1="17" y1="11" x2="17" y2="21" />
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
