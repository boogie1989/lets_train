// variant: 'filled' | 'tonal' | 'outlined' | 'text' | 'submit' | 'destructive'
// size: 'sm' | 'md'

const STYLES = {
  filled:      { bg: 'var(--cs-primary)',                                      color: 'var(--cs-on-primary)',          border: 'none',                       shadow: 'none'                             },
  tonal:       { bg: 'var(--cs-primary-container)',                            color: 'var(--cs-on-primary-container)',border: 'none',                       shadow: 'none'                             },
  outlined:    { bg: 'transparent',                                            color: 'var(--cs-primary)',             border: '1px solid var(--cs-outline)', shadow: 'none'                             },
  text:        { bg: 'transparent',                                            color: 'var(--cs-primary)',             border: 'none',                       shadow: 'none'                             },
  submit:      { bg: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)', color: 'var(--cs-on-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', shadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 2px 4px rgba(var(--cs-shadow-rgb),0.28), 0 8px 24px rgba(var(--cs-primary-rgb),0.22), 0 16px 40px rgba(var(--cs-shadow-rgb),0.14)'},
  destructive: { bg: 'var(--cs-error-container)',                              color: 'var(--cs-on-error-container)',  border: 'none',                       shadow: 'none'                             },
}

const SIZES = {
  sm: { height: 36, fontSize: 13, px: 14, gap: 6 },
  md: { height: 44, fontSize: 14, px: 20, gap: 8 },
}

export default function Button({
  variant = 'filled',
  label,
  icon,
  disabled = false,
  fullWidth = false,
  size = 'md',
  onClick,
  style: extra,
}) {
  const st = STYLES[variant] ?? STYLES.filled
  const sz = SIZES[size] ?? SIZES.md
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        height: sz.height,
        padding: `0 ${sz.px}px`,
        width: fullWidth ? '100%' : 'auto',
        borderRadius: 'var(--radius-xl)',
        background: st.bg,
        color: st.color,
        border: st.border,
        boxShadow: st.shadow,
        fontFamily: 'var(--tt-font-family)',
        fontSize: sz.fontSize,
        fontWeight: 500,
        letterSpacing: '0.1px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...extra,
      }}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      {label}
    </button>
  )
}
