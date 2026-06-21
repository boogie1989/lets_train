import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import {
  TT, NUM, card, Bars, StatusGlyph, PlayIcon, CalIcon, HeartIcon, TrendIcon, HomeFab, GREETING, USER_FIRST,
} from './homeShared.jsx'
import {
  items, nextWorkout, stats, nut, load, score, tier, weekTonnage, weekTonnageTotal, weekTrendPct, isDone,
} from './homeData.js'

// CONCEPT "Now" — the home screen is the next ACTION, not a calendar.
// Hero next-workout with a full-width Start, then a quiet day timeline, then a
// week-load sparkline (closes the "input → progress" gap). Calendar is elsewhere.
const estMin = nextWorkout.exerciseCount * 4 + 8

export default function NowScreen() {
  return (
    <PhoneFrame>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* greeting + readiness chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)' }}>{GREETING},</p>
            <p style={{ ...TT, fontSize: 24, fontWeight: 500, color: 'var(--cs-on-surface)', marginTop: 1 }}>{USER_FIRST}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'flex', color: 'var(--cs-tertiary)' }}><HeartIcon s={15} /></span>
            <span style={{ ...NUM, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{score}</span>
            <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>{tier}</span>
          </div>
        </div>

        {/* hero — the next action */}
        <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ ...TT, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-primary)' }}>Up next · {nextWorkout.time}</p>
              <p style={{ ...TT, fontSize: 26, fontWeight: 500, color: 'var(--cs-on-surface)', marginTop: 6 }}>{nextWorkout.title}</p>
              <p style={{ ...NUM, fontSize: 13, color: 'var(--cs-on-surface-variant)', marginTop: 4 }}>{nextWorkout.exerciseCount} exercises · ~{estMin} min</p>
            </div>
          </div>
          <button style={{
            width: '100%', height: 52, borderRadius: 'var(--radius-xl)', border: 'none', cursor: 'pointer',
            background: 'var(--cs-primary)', color: 'var(--cs-on-primary)', boxShadow: 'var(--elev-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'var(--tt-font-family)', fontSize: 16, fontWeight: 600,
          }}>
            <PlayIcon s={16} /> Start workout
          </button>
        </div>

        {/* today timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...TT, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)' }}>Today</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ ...NUM, fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>{stats.wDone} / {stats.wTotal} done</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: stats.wTotal }, (_, i) => (
                  <div key={i} style={{ width: 14, height: 5, borderRadius: 3, background: i < stats.wDone ? 'var(--cs-status-completed)' : 'rgba(var(--cs-on-surface-rgb),0.12)' }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '4px 0' }}>
            {items.map((it, i) => {
              const now = it.id === nextWorkout.id
              return (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                  <StatusGlyph status={it.status} now={now} />
                  <span style={{ ...NUM, width: 64, flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--cs-on-surface-variant)' }}>{it.time.replace(/ ?[AP]M/, '')}</span>
                  <span style={{ ...TT, flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: now ? 600 : 400, color: isDone(it) ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.title}
                  </span>
                  {now && <span style={{ ...TT, fontSize: 10, fontWeight: 600, color: 'var(--cs-primary)', padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'rgba(var(--cs-primary-rgb),0.12)' }}>NOW</span>}
                  {it.kind === 'meal' && <span style={{ ...NUM, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.8 }}>{it.kcal} kcal</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* week load — the progress the old design never surfaced */}
        <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>This week</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--cs-tertiary)' }}>
              <TrendIcon s={14} />
              <span style={{ ...NUM, fontSize: 12, fontWeight: 500 }}>+{weekTrendPct}%</span>
            </span>
          </div>
          <Bars data={weekTonnage} color="var(--cs-primary)" />
          <div style={{ display: 'flex', gap: 20 }}>
            <Metric value={`${weekTonnageTotal.toFixed(1)} t`} label="tonnage" />
            <Metric value={`${load.au} AU`} label="today load" />
          </div>
        </div>
      </div>

      {/* footer: calendar entry + add */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 26px', display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(0deg, var(--surface-0) 60%, transparent)' }}>
        <button style={{
          flex: 1, height: 52, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
          background: 'var(--surface-2)', border: '1px solid var(--border-default)', boxShadow: 'var(--elev-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          color: 'var(--cs-on-surface)', fontFamily: 'var(--tt-font-family)', fontSize: 15, fontWeight: 500,
        }}>
          <CalIcon s={17} /> Calendar
        </button>
        <HomeFab />
      </div>
    </PhoneFrame>
  )
}

function Metric({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...NUM, fontSize: 16, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span>
      <span style={{ ...TT, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{label}</span>
    </div>
  )
}
