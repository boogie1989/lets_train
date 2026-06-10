// Shared SVG icons for the Libraries module.

export function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function FilterIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

export function PlusIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function ChevRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function ChevronSmall({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function ClockIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
    </svg>
  )
}

export function FlameIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-1.2.5-2 1-2.5C9 9 9 7 12 2z" />
    </svg>
  )
}

export function LayersIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 3 21 8 12 13 3 8 12 3" /><polyline points="3 13 12 18 21 13" />
    </svg>
  )
}

// ── Per-library thumbnail glyphs ────────────────────────────────────────────

export function ThumbGlyph({ kind }) {
  const s = 'rgba(var(--overlay-rgb),0.20)'
  if (kind === 'meal') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" />
      <path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" />
    </svg>
  )
  if (kind === 'workout') return (
    <svg width="22" height="10" viewBox="0 0 26 10" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1" /><rect x="21.5" y="1" width="4" height="8" rx="1" /><line x1="4.5" y1="5" x2="21.5" y2="5" />
    </svg>
  )
  if (kind === 'plan') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="7" y1="13" x2="9" y2="13" /><line x1="11" y1="13" x2="17" y2="13" />
      <line x1="7" y1="17" x2="9" y2="17" /><line x1="11" y1="17" x2="14" y2="17" />
    </svg>
  )
  // exercise barbell (default)
  return (
    <svg width="22" height="10" viewBox="0 0 26 10" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round">
      <rect x="0.5" y="1" width="4" height="8" rx="1" /><rect x="21.5" y="1" width="4" height="8" rx="1" /><line x1="4.5" y1="5" x2="21.5" y2="5" />
    </svg>
  )
}

// ── Equipment icons for the filter grid ─────────────────────────────────────

export function EquipmentIcon({ name, active }) {
  const c = active ? 'var(--cs-primary)' : 'rgba(var(--cs-on-surface-variant-rgb),0.50)'
  const sw = '1.6'
  if (name === 'Bodyweight') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" /><path d="M12 6v8" /><path d="M8 10h8" /><path d="M9 20l3-6 3 6" />
    </svg>
  )
  if (name === 'Barbell') return (
    <svg width="22" height="8" viewBox="0 0 26 8" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <rect x="0.5" y="0" width="3" height="8" rx="1" /><rect x="22.5" y="0" width="3" height="8" rx="1" /><line x1="3.5" y1="4" x2="22.5" y2="4" />
      <rect x="3" y="1.5" width="2" height="5" rx="0.5" /><rect x="21" y="1.5" width="2" height="5" rx="0.5" />
    </svg>
  )
  if (name === 'Dumbbell') return (
    <svg width="20" height="8" viewBox="0 0 22 8" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <rect x="0.5" y="1" width="2.5" height="6" rx="1" /><rect x="19" y="1" width="2.5" height="6" rx="1" /><line x1="3" y1="4" x2="19" y2="4" />
      <rect x="2.5" y="2" width="2" height="4" rx="0.5" /><rect x="17.5" y="2" width="2" height="4" rx="0.5" />
    </svg>
  )
  if (name === 'Cable') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V17" /><path d="M8 21h8l-1.5-4h-5L8 21z" />
    </svg>
  )
  if (name === 'Bands') return (
    <svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <ellipse cx="12" cy="8" rx="10" ry="5" /><ellipse cx="12" cy="8" rx="6" ry="2.5" />
    </svg>
  )
  if (name === 'Machine') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
  return null
}
