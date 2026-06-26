// Canonical section label — the quiet uppercase caption above a content block.
// Spec locked from the Calendar reference (CalendarScreen.jsx `sectionLabel`):
// 11px / 600 / 0.07em tracking / uppercase / on-surface-variant @ opacity 0.5.
// Use this everywhere instead of per-module labelSt / lblSt / microLblSt copies.
//
// count (optional): a trailing quiet figure, e.g. <SectionLabel count="4 steps">Recipe</SectionLabel>
// renders "RECIPE · 4 STEPS" in the same muted style.
const baseSt = {
  fontFamily: 'var(--tt-font-family)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--cs-on-surface-variant)',
  opacity: 0.5,
}

export default function SectionLabel({ children, count, style: extra }) {
  return (
    <span style={{ ...baseSt, paddingLeft: 2, display: 'inline-flex', alignItems: 'center', gap: 6, ...extra }}>
      {children}
      {count != null && <span style={{ opacity: 0.7 }}>· {count}</span>}
    </span>
  )
}

export { baseSt as sectionLabelStyle }
