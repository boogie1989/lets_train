// Shared primitives for the three home concepts: progress ring, sparkline bars,
// status glyphs. All v2 language (opaque surfaces, tabular numbers, one accent).
export const TT = { fontFamily: 'var(--tt-font-family)' }
export const NUM = { ...TT, fontVariantNumeric: 'tabular-nums' }

// Opaque card recipe → Flutter Card
export const card = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-2xl)',
  boxShadow: 'var(--elev-1)',
}

// ── Progress ring (SVG, stroke-dashoffset). → Flutter CircularProgressIndicator ──
export function Ring({ size = 64, stroke = 6, value = 0, color = 'var(--cs-primary)', track, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={track ?? 'rgba(var(--cs-on-surface-rgb),0.10)'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        {children}
      </div>
    </div>
  )
}

// ── Sparkline bars. → Flutter custom BarChart ──
export function Bars({ data, color = 'var(--cs-primary)', height = 36 }) {
  const max = Math.max(...data, 0.0001)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${Math.max(8, (v / max) * 100)}%`,
          background: v ? color : 'rgba(var(--cs-on-surface-rgb),0.10)',
          borderRadius: 2,
        }} />
      ))}
    </div>
  )
}

// ── Status glyph for a schedule row ──
export function StatusGlyph({ status, now }) {
  if (status === 'Completed') {
    return (
      <span style={{ display: 'flex', color: 'var(--cs-status-completed)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="8.5 12.2 11 14.7 15.5 9.5" /></svg>
      </span>
    )
  }
  if (now) {
    return (
      <span style={{ display: 'flex', color: 'var(--cs-primary)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="9" opacity="0.18" /><polygon points="10 8.5 16 12 10 15.5" /></svg>
      </span>
    )
  }
  return (
    <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /></svg>
    </span>
  )
}

// ── Icons ──
const g = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const PlayIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20 6 4" /></svg>
export const PlusIcon = ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
export const CalIcon = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
export const FlameIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><path d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 1-2 1-2 2 2 3 4 3 7a6 6 0 0 1-12 0c0-4 3-6 6-12z" /></svg>
export const BarbellIcon = ({ s = 16 }) => <svg width={s} height="9" viewBox="0 0 26 10" {...g}><rect x="0.8" y="1.5" width="4" height="7" rx="1" /><rect x="21.2" y="1.5" width="4" height="7" rx="1" /><line x1="4.8" y1="5" x2="21.2" y2="5" /></svg>
export const MealIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" /><path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" /></svg>
export const HeartIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><path d="M20.8 8.6a5 5 0 0 0-8.8-2.6A5 5 0 0 0 3.2 8.6c0 4 4.8 7 8.8 10 4-3 8.8-6 8.8-10z" /></svg>
export const TrendIcon = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" /></svg>
export const ChevDown = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><polyline points="6 9 12 15 18 9" /></svg>
export const ChevLeft = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}><polyline points="15 18 9 12 15 6" /></svg>

// ── FAB (shared recipe) — right-flush glass-free square. → FloatingActionButton ──
export function HomeFab() {
  return (
    <button style={{
      width: 56, height: 56, borderRadius: 'var(--radius-2xl)', flexShrink: 0,
      background: 'var(--cs-primary)', color: 'var(--cs-on-primary)',
      border: 'none', boxShadow: 'var(--elev-2)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} aria-label="Add">
      <PlusIcon s={22} />
    </button>
  )
}

// time-of-day greeting (static demo)
export const GREETING = 'Good morning'
export const USER_FIRST = 'Serhii'
