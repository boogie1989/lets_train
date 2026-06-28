import { useState, useEffect } from 'react'

const TT = { fontFamily: 'var(--tt-font-family)' }
const MORPH = 'cubic-bezier(0.4,0,0.2,1)'

// ── styles ──
const tagChipSt = {
  ...TT, display: 'inline-flex', alignItems: 'center',
  height: 26, padding: '0 11px', borderRadius: 'var(--radius-2xl)',
  background: 'rgba(var(--cs-primary-rgb),0.14)', border: '1px solid rgba(var(--cs-primary-rgb),0.28)',
  fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)',
}
const tagChipRemovableSt = { ...tagChipSt, gap: 6, padding: '0 5px 0 11px' }
const tagXSt = {
  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, padding: 0,
  background: 'rgba(var(--cs-primary-rgb),0.20)', border: 'none', cursor: 'pointer', color: 'var(--cs-primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const tagFieldSt = {
  ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  minHeight: 28, padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
}
const tagRowSt = on => ({
  ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '11px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', border: 'none',
  background: on ? 'rgba(var(--cs-primary-rgb),0.10)' : 'transparent',
})
const tagCreateRowSt = {
  ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '11px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
  background: 'rgba(var(--cs-primary-rgb),0.08)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)',
  fontSize: 14, fontWeight: 500, color: 'var(--cs-primary)',
}

// ── icons ──
function TagIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
function ChevRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function XIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function PlusIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

/**
 * Tag trigger row — icon · chips (or placeholder) · chevron. Tapping calls `onOpen`.
 * Pair with <TagPickerSheet> rendered at the phone-container level. Used app-wide
 * (Workout Builder, Meal Builder) so tags look identical everywhere.
 */
export default function TagField({ tags = [], placeholder = 'Add tags', onOpen }) {
  return (
    <button onClick={onOpen} style={tagFieldSt}>
      <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.45, flexShrink: 0 }}><TagIcon /></span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {tags.length === 0
          ? <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{placeholder}</span>
          : tags.map(t => <span key={t} style={tagChipSt}>{t}</span>)}
      </div>
      <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4, flexShrink: 0 }}><ChevRightIcon /></span>
    </button>
  )
}

/**
 * Bottom-sheet tag picker — search · create · multi-select. Container-transform
 * slide-up. Render as a direct child of the phone-container (sibling of the scroll
 * area), never inside it. `presets` seeds the suggestion pool; free-create is allowed.
 */
export function TagPickerSheet({ open, onClose, tags = [], onChange, presets = [], title = 'Tags' }) {
  const [sheetIn, setSheetIn] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) { setSheetIn(false); return }
    setQuery('')
    const id = requestAnimationFrame(() => setSheetIn(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const pool = [...new Set([...presets, ...tags])]
  const q = query.trim().toLowerCase()
  const matches = pool.filter(t => !tags.includes(t) && t.toLowerCase().includes(q))
  const showCreate = query.trim() && !pool.some(t => t.toLowerCase() === query.trim().toLowerCase())

  const toggle = t => onChange(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])
  const create = name => {
    const t = name.trim()
    if (t && !tags.some(x => x.toLowerCase() === t.toLowerCase())) onChange([...tags, t])
    setQuery('')
  }

  return (
    <>
      <div onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(var(--cs-shadow-rgb),0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
          opacity: sheetIn ? 1 : 0, transition: `opacity 0.32s ${MORPH}` }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41, height: 600,
        display: 'flex', flexDirection: 'column',
        background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
        boxShadow: '0 -8px 32px rgba(var(--cs-shadow-rgb),0.55)',
        transform: sheetIn ? 'translateY(0)' : 'translateY(100%)',
        transition: `transform 0.32s ${MORPH}`,
      }}>
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} />
        </div>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 12px', flexShrink: 0 }}>
          <span style={{ ...TT, flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 'var(--radius-lg)', padding: 0, background: 'rgba(var(--overlay-rgb),0.05)', border: 'none', cursor: 'pointer', color: 'var(--cs-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon size={13} />
          </button>
        </div>
        {/* search / create input */}
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && showCreate) create(query) }}
            placeholder="Search or create a tag…"
            autoFocus
            style={{ ...TT, width: '100%', height: 42, boxSizing: 'border-box', padding: '0 14px', borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', outline: 'none', fontSize: 14, color: 'var(--cs-on-surface)' }}
          />
        </div>

        {/* selected tags — removable chips */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px', flexShrink: 0 }}>
            {tags.map(t => (
              <span key={t} style={tagChipRemovableSt}>
                {t}
                <button onClick={() => toggle(t)} style={tagXSt}><XIcon size={9} /></button>
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', flexShrink: 0, margin: '0 16px 4px' }} />

        {/* list — only not-yet-selected tags */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {showCreate && (
            <button onClick={() => create(query)} style={tagCreateRowSt}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'rgba(var(--cs-primary-rgb),0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cs-primary)' }}><PlusIcon size={12} /></span>
              Create “{query.trim()}”
            </button>
          )}
          {matches.map(t => (
            <button key={t} onClick={() => toggle(t)} style={tagRowSt(false)}>
              <span style={{ ...TT, flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 400, color: 'var(--cs-on-surface)' }}>{t}</span>
              <span style={{ color: 'var(--cs-on-surface-variant)', opacity: 0.4, display: 'flex' }}><PlusIcon size={13} /></span>
            </button>
          ))}
          {matches.length === 0 && !showCreate && (
            <p style={{ ...TT, textAlign: 'center', padding: '28px 0', fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
              {query.trim() ? 'No more tags' : 'All tags added'}
            </p>
          )}
        </div>
        {/* done */}
        <div style={{ padding: '10px 16px 24px', flexShrink: 0, borderTop: '1px solid rgba(var(--overlay-rgb),0.06)' }}>
          <button onClick={onClose} style={{
            ...TT, width: '100%', height: 48, borderRadius: 'var(--radius-xl)', cursor: 'pointer',
            background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
            border: '1px solid rgba(var(--overlay-rgb),0.18)', color: 'var(--cs-on-primary)', fontSize: 15, fontWeight: 500,
            boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)',
          }}>
            Done{tags.length ? ` · ${tags.length}` : ''}
          </button>
        </div>
      </div>
    </>
  )
}
