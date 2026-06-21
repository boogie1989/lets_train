// state: 'default' | 'focused' | 'filled' | 'disabled'
export default function SearchInput({ placeholder = 'Search exercises...', value = '', state = 'default', onChange }) {
  const isFocused  = state === 'focused'
  const isDisabled = state === 'disabled'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      borderRadius: 'var(--radius-2xl)',
      background: 'var(--cs-surface-container-highest)',
      border: `1px solid ${isFocused ? 'var(--cs-secondary)' : 'var(--cs-outline)'}`,
      boxShadow: isFocused ? '0 0 0 3px rgba(var(--cs-primary-rgb),0.20)' : 'none',
      opacity: isDisabled ? 0.4 : 1,
      cursor: isDisabled ? 'not-allowed' : 'text',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={isDisabled}
        onChange={onChange}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: 'var(--tt-font-family)',
          fontSize: 'var(--tt-body-large-size)',
          fontWeight: 'var(--tt-body-large-weight)',
          color: 'var(--cs-on-surface)',
          cursor: isDisabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  )
}
