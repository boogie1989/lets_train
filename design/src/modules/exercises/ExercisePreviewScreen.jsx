import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import Button from '../../components/Button.jsx'

const stepTint = ch => `linear-gradient(160deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.04) 100%), var(--cs-surface-container)`
const MEDIA = [
  { label: 'Start position', bg: stepTint('--cat-blue-rgb') },
  { label: 'Mid movement',   bg: stepTint('--cat-violet-rgb') },
  { label: 'End position',   bg: stepTint('--cat-cyan-rgb') },
]

const INSTRUCTIONS = [
  'Stand with feet shoulder-width apart, bar resting on upper traps.',
  'Brace your core and take a deep breath into your belly.',
  'Push hips back and bend knees, descending until thighs are parallel to the floor.',
  'Keep chest up and knees tracking over toes throughout the movement.',
  'Drive through heels to return to the starting position.',
  'Exhale at the top of the movement and reset for the next rep.',
]

const PRIMARY_MUSCLES   = ['Quadriceps', 'Glutes']
const SECONDARY_MUSCLES = ['Hamstrings', 'Core', 'Lower Back']
const EQUIPMENT         = ['Barbell', 'Weight Plates', 'Squat Rack']

export default function ExercisePreviewScreen() {
  const [mediaIndex, setMediaIndex] = useState(0)

  return (
    <PhoneFrame smokeVariant="shader">

      {/* ── Media (extends to cover status bar area) ── */}
      <div style={{ height: 324, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {MEDIA.map((m, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            background: m.bg,
            opacity: i === mediaIndex ? 1 : 0,
            transition: 'opacity 0.25s ease',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <BarbellFigure />
            <span style={{
              fontFamily: 'var(--tt-font-family)',
              fontSize: 11, letterSpacing: '0.08em',
              color: 'rgba(var(--overlay-rgb),0.25)',
            }}>{m.label.toUpperCase()}</span>
          </div>
        ))}

        {/* StatusBar overlaid on media gradient */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
          <StatusBar />
        </div>

        {/* Back button — below status bar */}
        <button style={glassBtn({ top: 58, left: 16 })}>
          <ChevronLeft />
        </button>


        {/* Pager dots */}
        <div style={{ position: 'absolute', bottom: 14, insetInline: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {MEDIA.map((_, i) => (
            <button key={i} onClick={() => setMediaIndex(i)} style={{
              width: i === mediaIndex ? 18 : 6, height: 6,
              borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer',
              background: i === mediaIndex ? 'var(--cs-primary)' : 'rgba(var(--overlay-rgb),0.28)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Title + difficulty */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--tt-font-family)',
            fontSize: 22, fontWeight: 500, lineHeight: 1.2,
            color: 'var(--cs-on-surface)', flex: 1,
          }}>Barbell Back Squat</span>
          <DifficultyChip level="Hard" />
        </div>

        {/* Quick stats */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '12px 8px',
          background: 'var(--glass-low-bg)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(var(--cs-outline-rgb),0.20)',
        }}>
          <StatItem icon={<MuscleIcon />} label="5 muscles" />
          <Divider />
          <StatItem icon={<EquipmentIcon />} label="3 items" />
          <Divider />
          <StatItem icon={<SetsIcon />} label="3–5 sets" />
        </div>

        {/* Instructions */}
        <Block title="Instructions">
          {INSTRUCTIONS.map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '10px 14px',
              background: 'var(--glass-slab)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(var(--cs-outline-rgb),0.18)',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                background: 'var(--cs-primary-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500,
                color: 'var(--cs-on-primary-container)',
              }}>{i + 1}</span>
              <span style={{
                fontFamily: 'var(--tt-font-family)',
                fontSize: 13, lineHeight: 1.55,
                color: 'var(--cs-on-surface-variant)',
              }}>{step}</span>
            </div>
          ))}
        </Block>

        {/* Muscles */}
        <Block title="Muscle Groups">
          <MuscleRow label="Primary"   chips={PRIMARY_MUSCLES}   accent />
          <MuscleRow label="Secondary" chips={SECONDARY_MUSCLES} />
        </Block>

        {/* Equipment */}
        <Block title="Equipment">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPMENT.map(eq => (
              <span key={eq} style={equipChip}>{eq}</span>
            ))}
          </div>
        </Block>

        <div style={{ height: 8 }} />
      </div>

      {/* ── Fixed bottom CTA ────────────────────── */}
      <div style={{
        padding: '12px 16px 24px', flexShrink: 0,
        background: 'var(--glass-low-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)',
      }}>
        <Button variant="submit" label="+ Add to Workout" fullWidth />
      </div>
    </PhoneFrame>
  )
}

// ─── Sub-components ───────────────────────────

function Block({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--cs-on-surface-variant)', opacity: 0.55,
      }}>{title}</span>
      {children}
    </div>
  )
}

function MuscleRow({ label, chips, accent = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{
        fontFamily: 'var(--tt-font-family)', fontSize: 11,
        color: 'var(--cs-on-surface-variant)', opacity: 0.45, minWidth: 58,
      }}>{label}</span>
      {chips.map(c => (
        <span key={c} style={{
          padding: '4px 10px', borderRadius: 'var(--radius-pill)',
          background: accent ? 'rgba(var(--cs-tertiary-rgb),0.10)' : 'rgba(var(--cs-outline-rgb),0.28)',
          border: `1px solid ${accent ? 'rgba(var(--cs-tertiary-rgb),0.22)' : 'rgba(var(--cs-outline-rgb),0.35)'}`,
          fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500,
          color: accent ? 'var(--cs-tertiary)' : 'var(--cs-on-surface-variant)',
        }}>{c}</span>
      ))}
    </div>
  )
}

function StatItem({ icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {icon}
      <span style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)' }}>{label}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 28, background: 'rgba(var(--cs-outline-rgb),0.40)' }} />
}

function DifficultyChip({ level }) {
  const map = {
    Easy:   { bg: 'rgba(var(--cs-tertiary-rgb),0.12)',  border: 'rgba(var(--cs-tertiary-rgb),0.22)',  color: 'var(--cs-tertiary)' },
    Medium: { bg: 'rgba(var(--cat-amber-rgb),0.12)',  border: 'rgba(var(--cat-amber-rgb),0.22)',  color: 'var(--cat-amber)' },
    Hard:   { bg: 'rgba(var(--cs-error-rgb),0.12)', border: 'rgba(var(--cs-error-rgb),0.22)', color: 'var(--cs-error)' },
    Expert: { bg: 'rgba(var(--cat-violet-rgb),0.12)', border: 'rgba(var(--cat-violet-rgb),0.22)', color: 'var(--cat-violet)' },
  }
  const c = map[level] ?? map.Medium
  return (
    <span style={{
      padding: '5px 12px', borderRadius: 'var(--radius-pill)', flexShrink: 0,
      background: c.bg, border: `1px solid ${c.border}`,
      fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: c.color,
    }}>{level}</span>
  )
}

const equipChip = {
  padding: '6px 12px', borderRadius: 'var(--radius-pill)',
  background: 'var(--glass-control-strong)', border: '1px solid rgba(var(--cs-outline-rgb),0.35)',
  fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500,
  color: 'var(--cs-on-surface-variant)',
}

function glassBtn({ top, left, right } = {}) {
  return {
    position: 'absolute', top, left, right,
    width: 44, height: 44, borderRadius: 'var(--radius-xl)', padding: 0,
    background: 'var(--glass-control)',
    border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
    boxShadow: '0 4px 16px rgba(var(--cs-shadow-rgb),0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  }
}

// ─── SVG Icons ────────────────────────────────

function BarbellFigure() {
  return (
    <svg width="80" height="28" viewBox="0 0 80 28" fill="none" stroke="rgba(var(--overlay-rgb),0.12)" strokeWidth="2.5" strokeLinecap="round">
      <rect x="0"  y="6"  width="10" height="16" rx="2" />
      <rect x="12" y="9"  width="6"  height="10" rx="1.5" />
      <line x1="18" y1="14" x2="62" y2="14" />
      <rect x="62" y="9"  width="6"  height="10" rx="1.5" />
      <rect x="70" y="6"  width="10" height="16" rx="2" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}


function MuscleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5c1-2 3-3 5-2.5s3 2 3 4-1 3-2 4l-2 2c-1 1-1 2.5 0 3.5s2.5 1 3.5 0" />
      <path d="M10 14c1.5 1 2 2.5 1.5 4S9 20.5 7.5 20" />
    </svg>
  )
}

function EquipmentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 80 28" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="5" strokeLinecap="round">
      <rect x="1"  y="7"  width="12" height="14" rx="3" />
      <rect x="67" y="7"  width="12" height="14" rx="3" />
      <line x1="13" y1="14" x2="67" y2="14" />
    </svg>
  )
}

function SetsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="1.7" strokeLinecap="round">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  )
}
