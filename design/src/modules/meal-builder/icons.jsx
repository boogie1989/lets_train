const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function ChevLeftIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...base} stroke="var(--cs-on-surface)" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
}
export function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...base} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
}
export function PlusIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
export function MinusIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
export function XIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
export function ChevDownIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base}><polyline points="6 9 12 15 18 9" /></svg>
}
export function GripIcon() {
  const dot = { width: 3, height: 3, borderRadius: '50%', background: 'currentColor' }
  const row = { display: 'flex', gap: 3 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, cursor: 'grab' }}>
      {[0, 1, 2].map(i => <div key={i} style={row}><span style={dot} /><span style={dot} /></div>)}
    </div>
  )
}
export function CameraIcon({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.4" /></svg>
}
export function ClockIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
}
export function TagIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M20.6 13.4 13 21a1.5 1.5 0 0 1-2.1 0l-7.4-7.4A2 2 0 0 1 3 12.2V4a1 1 0 0 1 1-1h8.2a2 2 0 0 1 1.4.6l7 7a1.5 1.5 0 0 1 0 2.8z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
}
