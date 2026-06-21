import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import DateCell from '../../components/DateCell.jsx'
import { WEEKS, weekIndexOf, WD, TODAY } from '../calendar/calendarModel.js'
import {
  TT, NUM, card, StatusGlyph, PlayIcon, BarbellIcon, MealIcon, HeartIcon, ChevDown, ChevLeft, HomeFab,
} from './homeShared.jsx'
import {
  day, workouts, meals, nextWorkout, stats, nut, score, tier, readiness, WEEKDAY_FULL, dateLabel, isDone,
} from './homeData.js'

// CONCEPT "Agenda" — evolution of the calendar home: keep the week rail, but the
// DAY becomes the hero, grouped into Train / Eat / Recover with one primary action
// and detail on demand. Least risky; keeps the familiar planning mental model.
const wi = Math.max(0, weekIndexOf(TODAY))

export default function AgendaScreen() {
  return (
    <PhoneFrame>
      {/* opaque chrome slab: header + week rail */}
      <div style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border-subtle)', boxShadow: 'var(--elev-1)', flexShrink: 0 }}>
        <StatusBar />
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={iconBtn} aria-label="Previous"><ChevLeft s={18} /></button>
            <button style={{ ...TT, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--cs-on-surface)', fontSize: 15, fontWeight: 500 }}>
              {WEEKDAY_FULL[day.weekday]}, {dateLabel(TODAY)}
              <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)' }}><ChevDown s={13} /></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ display: 'flex', color: 'var(--cs-tertiary)' }}><HeartIcon s={14} /></span>
              <span style={{ ...NUM, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{score}</span>
            </div>
          </div>

          {/* week rail */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {WEEKS[wi].map((n, i) => (
              n == null
                ? <span key={`b${i}`} style={{ width: 52, height: 76, flexShrink: 0 }} />
                : <DateCell key={n} weekday={WD[i]} day={String(n)}
                    state={n === TODAY ? 'selected' : 'default'} />
            ))}
          </div>
        </div>
      </div>

      {/* day, grouped */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 96px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Group icon={<BarbellIcon s={16} />} tint="--cs-primary-rgb" title="Train"
          right={`${stats.wDone} / ${stats.wTotal}`}>
          {workouts.map((w, i) => {
            const now = w.id === nextWorkout.id
            return (
              <Row key={w.id} first={!i}>
                <StatusGlyph status={w.status} now={now} />
                <span style={{ ...NUM, width: 58, flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--cs-on-surface-variant)' }}>{w.time.replace(/ ?[AP]M/, '')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...TT, fontSize: 14.5, fontWeight: now ? 600 : 400, color: isDone(w) ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</p>
                  <p style={{ ...NUM, fontSize: 11.5, color: 'var(--cs-on-surface-variant)', opacity: 0.75, marginTop: 1 }}>
                    {isDone(w) && w.result ? `${w.result.tonnage.toLocaleString()} kg · RPE ${w.result.sessionRpe}` : `${w.exerciseCount} exercises`}
                  </p>
                </div>
                {now && (
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', background: 'var(--cs-primary)', color: 'var(--cs-on-primary)', boxShadow: 'var(--elev-1)', fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 600 }}>
                    <PlayIcon s={13} /> Start
                  </button>
                )}
              </Row>
            )
          })}
        </Group>

        <Group icon={<MealIcon s={16} />} tint="--cat-amber-rgb" title="Eat"
          right={`${nut.kcal.toLocaleString()} / ${nut.goal.toLocaleString()} kcal`}>
          {meals.map((m, i) => (
            <Row key={m.id} first={!i}>
              <StatusGlyph status={m.status} />
              <span style={{ ...NUM, width: 58, flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--cs-on-surface-variant)' }}>{m.time.replace(/ ?[AP]M/, '')}</span>
              <span style={{ ...TT, flex: 1, minWidth: 0, fontSize: 14.5, color: isDone(m) ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
              <span style={{ ...NUM, fontSize: 12.5, color: 'var(--cs-on-surface-variant)' }}>{m.kcal} kcal</span>
            </Row>
          ))}
        </Group>

        <Group icon={<HeartIcon s={15} />} tint="--cat-violet-rgb" title="Recover" right={tier}>
          <Row first>
            <span style={{ display: 'flex', color: 'var(--cs-tertiary)' }}><HeartIcon s={16} /></span>
            <span style={{ ...NUM, flex: 1, fontSize: 13.5, color: 'var(--cs-on-surface)' }}>
              Readiness <b style={{ fontWeight: 600 }}>{score}</b>
              <span style={{ color: 'var(--cs-on-surface-variant)' }}> · Sleep {readiness.sleep} · Energy {readiness.energy}</span>
            </span>
            <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>edit</span>
          </Row>
        </Group>
      </div>

      <div style={{ position: 'absolute', right: 16, bottom: 24 }}><HomeFab /></div>
    </PhoneFrame>
  )
}

const iconBtn = {
  width: 44, height: 44, borderRadius: 'var(--radius-xl)',
  background: 'var(--surface-2)', border: '1px solid var(--border-default)', boxShadow: 'var(--elev-1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
  color: 'var(--cs-on-surface)', flexShrink: 0,
}

function Group({ icon, tint, title, right, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 2 }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(var(${tint}),0.14)`, color: `rgba(var(${tint}),1)` }}>{icon}</span>
        <span style={{ ...TT, flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cs-on-surface)' }}>{title}</span>
        <span style={{ ...NUM, fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>{right}</span>
      </div>
      <div style={{ ...card, padding: '2px 0' }}>{children}</div>
    </div>
  )
}

function Row({ first, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: first ? 'none' : '1px solid var(--border-subtle)' }}>
      {children}
    </div>
  )
}
