// 398×88, r=16, accent strip 5px left, content pad 20/18 gap 10
// v2: opaque Card (surface-2 + hairline border + one soft shadow) → Flutter Card.
// kind: 'workout' (meta = N exercises) | 'meal' (meta = N kcal)
// onClick (optional): tapping the card opens its detail dialog (a quiet trailing
// chevron marks the affordance). The card does NOT toggle status — workout
// completion comes from the Workout Runner, meals are logged from the detail.
// result (optional): completed workout's session result — the meta segment then
// shows the actual `tonnage kg · RPE x` instead of the planned exercise count.
// plan (optional): name of the training plan that scheduled this item — shown as a
// quiet third meta segment; ad-hoc items simply omit it.
// missed: the item's day is in the past — uncompleted items get a muted "Missed" label.
export default function TaskItem({ title, time, exerciseCount, kcal, kind = 'workout', status = 'Planned', onClick, plan, missed = false, result }) {
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
    <div onClick={onClick} style={{
      width: 398,
      height: 88,
      display: 'flex',
      overflow: 'hidden',
      flexShrink: 0,
      cursor: onClick ? 'pointer' : 'default',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--elev-1)',
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
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <ClockIcon />
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--cs-on-surface-variant)',
            }}>
              {time}
            </span>
          </div>

          <Dot />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {kind === 'meal' ? <MealIcon /> : <ActivityIcon />}
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--cs-on-surface-variant)',
            }}>
              {kind === 'meal'
                ? `${kcal} kcal`
                : result
                  ? `${result.tonnage.toLocaleString()} kg · RPE ${result.sessionRpe}`
                  : `${exerciseCount} exercises`}
            </span>
          </div>

          {/* plan tag — only on items scheduled by a training plan */}
          {plan && (
            <>
              <Dot />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <PlanIcon />
                <span style={{
                  fontFamily: 'var(--tt-font-family)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--cs-primary)',
                  opacity: 0.85,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {plan}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Trailing: quiet "Done" (emerald) / "Missed" (muted error) label + a
          faint chevron when the card opens a detail dialog */}
      {(label || onClick) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 16, flexShrink: 0 }}>
          {label && (
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 10,
              fontWeight: 500,
              color: label.color,
              opacity: label.opacity,
            }}>
              {label.text}
            </span>
          )}
          {onClick && <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.3 }}><ChevronIcon /></span>}
        </div>
      )}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

function Dot() {
  return (
    <div style={{
      width: 3, height: 3,
      borderRadius: '50%',
      background: 'var(--cs-on-surface)',
      opacity: 0.4,
      flexShrink: 0,
    }}/>
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

// Mini plan/calendar glyph — plan tag
function PlanIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85, flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  )
}
