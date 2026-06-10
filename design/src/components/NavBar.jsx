const slabSt = {
  width: '100%', flexShrink: 0,
  background: 'var(--glass-slab)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  borderTop: '1px solid rgba(var(--overlay-rgb),0.05)',
  borderBottom: '1px solid rgba(var(--overlay-rgb),0.05)',
  boxShadow: '0 12px 32px rgba(var(--cs-shadow-rgb),0.60)',
  display: 'flex', flexDirection: 'column',
}

export default function NavBar({ children, style }) {
  return (
    <div style={{ ...slabSt, ...style }}>
      {children}
    </div>
  )
}
