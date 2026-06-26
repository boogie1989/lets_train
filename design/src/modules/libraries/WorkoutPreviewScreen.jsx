import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import workoutsConfig from './configs/workouts.jsx'
import ReadonlyExerciseList, { buildSampleContent } from './ReadonlyExerciseList.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const FOCUS_COLORS = { 'Full body': '--cs-tertiary-rgb', Upper: '--cat-blue-rgb', Lower: '--cat-amber-rgb', Push: '--cat-pink-rgb', Pull: '--cat-violet-rgb', Core: '--cat-cyan-rgb' }
const DIFF = {
  Easy:   { bg: 'rgba(var(--cs-tertiary-rgb),0.12)',  border: 'rgba(var(--cs-tertiary-rgb),0.22)',  color: 'var(--cs-tertiary)' },
  Medium: { bg: 'rgba(var(--cat-amber-rgb),0.12)',  border: 'rgba(var(--cat-amber-rgb),0.22)',  color: 'var(--cat-amber)' },
  Hard:   { bg: 'rgba(var(--cs-error-rgb),0.12)', border: 'rgba(var(--cs-error-rgb),0.22)', color: 'var(--cs-error)' },
  Expert: { bg: 'rgba(var(--cat-violet-rgb),0.12)', border: 'rgba(var(--cat-violet-rgb),0.22)', color: 'var(--cat-violet)' },
}
const DEFAULT_WORKOUT = workoutsConfig.data[0]

export function WorkoutPreviewView({ workout = DEFAULT_WORKOUT, onClose, cta = '+ Add to plan' }) {
  const colorCh = FOCUS_COLORS[workout.focus] ?? '--cs-primary-rgb'
  const d = DIFF[workout.difficulty] ?? DIFF.Medium
  const content = buildSampleContent(workout)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* hero */}
      <div style={{ height: 240, flexShrink: 0, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, rgba(var(${colorCh}),0.22) 0%, rgba(var(${colorCh}),0.02) 100%), var(--cs-surface-container)` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}><StatusBar /></div>
        <button onClick={onClose} style={glassBtn}><ChevronLeft /></button>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <svg width="58" height="22" viewBox="0 0 26 10" fill="none" stroke={`rgba(var(${colorCh}),1)`} strokeWidth="1.6" strokeLinecap="round" style={{ opacity: 0.7 }}>
            <rect x="0.5" y="1" width="4" height="8" rx="1" /><rect x="21.5" y="1" width="4" height="8" rx="1" /><line x1="4.5" y1="5" x2="21.5" y2="5" />
          </svg>
          <span style={{ ...TT, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: `rgba(var(${colorCh}),1)`, opacity: 0.8 }}>{workout.focus}</span>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ ...TT, fontSize: 22, fontWeight: 500, lineHeight: 1.2, color: 'var(--cs-on-surface)', flex: 1 }}>{workout.name}</span>
          <span style={{ ...TT, padding: '5px 12px', borderRadius: 'var(--radius-2xl)', flexShrink: 0, background: d.bg, border: `1px solid ${d.border}`, fontSize: 12, fontWeight: 500, color: d.color }}>{workout.difficulty}</span>
        </div>

        <GlassCard level="Low" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 8px' }}>
          <Stat label="Focus" value={workout.focus} />
          <Divider />
          <Stat label="Exercises" value={workout.exercises} />
          <Divider />
          <Stat label="Duration" value={`~${workout.minutes}m`} />
        </GlassCard>

        {workout.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {workout.tags.map(t => <span key={t} style={chip}>{t}</span>)}
            <span style={chip}>{workout.equipment}</span>
          </div>
        )}

        <Block title="Exercises" count={workout.exercises}>
          <ReadonlyExerciseList items={content} />
        </Block>
        <div style={{ height: 8 }} />
      </div>

      <Footer label={cta} onClick={onClose} />
    </div>
  )
}

export default function WorkoutPreviewScreen(props) {
  return <PhoneFrame smokeVariant="shader"><WorkoutPreviewView {...props} /></PhoneFrame>
}

// ── shared bits ──
function Block({ title, count, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionLabel count={count} style={{ display: 'flex' }}>{title}</SectionLabel>
      {children}
    </div>
  )
}
function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span>
      <span style={{ ...TT, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{label}</span>
    </div>
  )
}
function Divider() { return <div style={{ width: 1, height: 28, background: 'rgba(var(--cs-outline-rgb),0.40)' }} /> }
function Footer({ label, onClick }) {
  return (
    <div style={{ padding: '12px 16px 24px', flexShrink: 0, background: 'var(--glass-low-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)' }}>
      <button onClick={onClick} style={{ ...TT, width: '100%', height: 50, borderRadius: 'var(--radius-2xl)', cursor: 'pointer', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', color: 'var(--cs-on-primary)', fontSize: 15, fontWeight: 500, boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)' }}>{label}</button>
    </div>
  )
}
const chip = { ...TT, padding: '6px 12px', borderRadius: 'var(--radius-2xl)', background: 'var(--glass-control-strong)', border: '1px solid rgba(var(--cs-outline-rgb),0.35)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface-variant)' }
const glassBtn = { position: 'absolute', top: 58, left: 16, width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0, background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)', boxShadow: '0 4px 16px rgba(var(--cs-shadow-rgb),0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
  )
}
