// Stepper — numeric −/＋ control with a centered value. Generic base primitive.
// Optional `label` (uppercase micro-label above), `suffix` appended to the value,
// optional `min`/`max` clamp (omit to let the caller's model own clamping).
const TT = { fontFamily: 'var(--tt-font-family)' }

const labelSt = { ...TT, display: 'block', marginBottom: 8, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }

function MinusIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function PlusIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}

export default function Stepper({ label, value, onChange, step = 1, min, max, suffix = '', btnSize = 30, valueStyle, style }) {
  const clamp = v => (min != null && v < min ? min : max != null && v > max ? max : v)
  const stepBtn = { width: btnSize, height: btnSize, borderRadius: 'var(--radius-lg)', flexShrink: 0, padding: 0, cursor: 'pointer', background: 'rgba(var(--overlay-rgb),0.06)', border: '1px solid rgba(var(--overlay-rgb),0.09)', color: 'var(--cs-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  return (
    <div style={{ ...(label ? { flex: 1, minWidth: 0 } : {}), ...style }}>
      {label && <span style={labelSt}>{label}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onChange(clamp(value - step))} style={stepBtn}><MinusIcon /></button>
        <span style={{ ...TT, flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center', fontVariantNumeric: 'tabular-nums', ...valueStyle }}>{value}{suffix}</span>
        <button onClick={() => onChange(clamp(value + step))} style={stepBtn}><PlusIcon /></button>
      </div>
    </div>
  )
}
