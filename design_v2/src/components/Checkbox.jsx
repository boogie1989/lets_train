// size: 'sm'(16) | 'md'(20) | 'lg'(24)   state: 'unchecked' | 'checked' | 'disabled'
const dimMap = { sm: 16, md: 20, lg: 24 }

export default function Checkbox({ size = 'md', state = 'unchecked', onChange }) {
  const dim = dimMap[size]
  const checked  = state === 'checked'
  const disabled = state === 'disabled'

  return (
    <div
      onClick={!disabled ? onChange : undefined}
      style={{
        width: dim, height: dim,
        borderRadius: dim * 0.25,
        border: checked ? 'none' : `1.5px solid var(--cs-outline)`,
        background: checked ? 'var(--cs-primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0, transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width={dim * 0.6} height={dim * 0.6} viewBox="0 0 12 12" fill="none">
          <polyline points="2,6 5,9 10,3"
            stroke="var(--cs-on-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}
