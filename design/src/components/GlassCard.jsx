// level: 'Low' | 'Mid' | 'High'
// Semi-transparent so backdrop-blur is visible against smoke backgrounds.
// Each level carries its own elevation shadow (ambient + key + inner top-highlight)
// so a glass card reads as lifted off the dark/smoke background by default — no
// per-usage boxShadow override needed. Override via `style` only for special cases.
const LEVELS = {
  Low: { bg: 'var(--glass-low-bg)', blur: 16, border: 'rgba(var(--overlay-rgb),0.04)', shadow: 'var(--shadow-glass-low)' },
  Mid: { bg: 'var(--glass-mid-bg)', blur: 24, border: 'rgba(var(--overlay-rgb),0.06)', shadow: 'var(--shadow-glass-mid)' },
  High: { bg: 'var(--glass-high-bg)', blur: 32, border: 'rgba(var(--overlay-rgb),0.08)', shadow: 'var(--shadow-glass-high)' },
}

export default function GlassCard({ level = 'Mid', children, style: extra, ...rest }) {
  const { bg, blur, border, shadow } = LEVELS[level]
  return (
    <div
      style={{
        background: bg,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${border}`,
        boxShadow: shadow,
        borderRadius: 'var(--radius-2xl)',
        ...extra,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
