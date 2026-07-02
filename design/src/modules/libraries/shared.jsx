// Shared primitives + styles for the Libraries module (used by the shell and
// every library config). No imports from configs — keeps the graph acyclic.
import SurfaceContainer from '../../components/SurfaceContainer.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import { ThumbGlyph } from './icons.jsx'

export { SectionLabel }

const TT = { fontFamily: 'var(--tt-font-family)' }

export const DIFF_COLORS = { Easy: 'var(--cs-tertiary)', Medium: 'var(--cat-amber)', Hard: 'var(--cs-error)', Expert: 'var(--cat-violet)' }
// category-tinted thumbnail panel — adapts to theme (tint over surface)
export const thumbTint = ch => `linear-gradient(150deg, rgba(var(${ch}),0.22) 0%, rgba(var(${ch}),0.06) 100%), var(--cs-surface-container-high)`
export const THUMB_COLORS = {
  Legs: thumbTint('--cat-blue-rgb'), Back: thumbTint('--cat-violet-rgb'), Chest: thumbTint('--cat-pink-rgb'),
  Shoulders: thumbTint('--cat-amber-rgb'), Arms: thumbTint('--cat-cyan-rgb'), Core: thumbTint('--cs-tertiary-rgb'),
  meal: thumbTint('--cs-tertiary-rgb'), plan: thumbTint('--cat-violet-rgb'), workout: thumbTint('--cat-blue-rgb'),
}

// ── Card chrome — SurfaceContainer + accent strip + selected highlight ──────────────
// Library cards differ only in their inner content; the chrome is shared so
// the selection visuals (multi/single) live in one place.
export function Card({ accent = 'transparent', selected = false, onClick, children }) {
  return (
    <SurfaceContainer level="Low" onClick={onClick} style={{
      display: 'flex', overflow: 'hidden', cursor: 'pointer',
      ...(selected && { background: 'rgba(var(--cs-primary-rgb),0.14)' }),
      transition: 'background 0.15s',
    }}>
      <div style={{ width: 5, flexShrink: 0, background: selected ? 'var(--cs-primary)' : accent, transition: 'background 0.15s' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
        {children}
      </div>
    </SurfaceContainer>
  )
}

export function Thumb({ kind = 'exercise', color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 11, flexShrink: 0,
      background: color ?? THUMB_COLORS[kind] ?? thumbTint('--cs-primary-rgb'),
      border: '1px solid rgba(var(--cs-outline-rgb),0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <ThumbGlyph kind={kind} />
    </div>
  )
}

export function CardBody({ title, meta }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
      <span style={{ ...TT, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>{meta}</span>
    </div>
  )
}

export function DiffDot({ level }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: DIFF_COLORS[level] ?? 'var(--cs-on-surface-variant)', opacity: 0.8 }} />
}

export function MetaTag({ children }) {
  return (
    <span style={{ ...TT, flexShrink: 0, fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--cs-primary-rgb),0.12)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)', color: 'var(--cs-primary)', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// ── Quick-chip + filter-control styles (ported from ExerciseSearchScreen) ────

export function chipSt(active) {
  return {
    ...TT, flexShrink: 0, padding: '5px 12px', borderRadius: 'var(--radius-2xl)',
    background: active ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
    border: active ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
    fontSize: 12, fontWeight: active ? 500 : 400,
    color: active ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  }
}

export function gridBtnSt(on) {
  return {
    height: 52, borderRadius: 'var(--radius-lg)',
    background: on ? 'rgba(var(--cs-primary-rgb),0.12)' : 'var(--glass-control)',
    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.30)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

export function segBtnSt(on) {
  return {
    ...TT, flex: 1, height: 34, borderRadius: 'var(--radius-2xl)',
    background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
    fontSize: 10, fontWeight: on ? 500 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

export function dotsBtnSt(on) {
  return {
    flex: 1, height: 50, borderRadius: 'var(--radius-lg)',
    background: on ? 'rgba(var(--cs-primary-rgb),0.12)' : 'var(--glass-control)',
    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.30)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

export function wrapChipSt(on) {
  return {
    ...TT, flex: 1, minWidth: 70, height: 32, borderRadius: 'var(--radius-2xl)',
    background: on ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control-strong)',
    border: on ? '1px solid rgba(var(--cs-primary-rgb),0.40)' : '1px solid rgba(var(--cs-outline-rgb),0.35)',
    fontSize: 11, fontWeight: on ? 500 : 400,
    color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
    cursor: 'pointer', transition: 'all 0.15s',
  }
}
