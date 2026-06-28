const TT = { fontFamily: 'var(--tt-font-family)' }
const dividerSt = { height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0' }

const nameSt = { ...TT, fontSize: 'var(--tt-title-medium-size)', fontWeight: 500, color: 'var(--cs-on-surface)', background: 'none', border: 'none', outline: 'none', padding: 0, width: '100%', boxSizing: 'border-box' }
const descSt = { ...TT, fontSize: 'var(--tt-body-small-size)', lineHeight: 'var(--tt-body-small-height)', letterSpacing: 'var(--tt-body-small-tracking)', color: 'var(--cs-on-surface-variant)', background: 'none', border: 'none', outline: 'none', resize: 'none', padding: 0, width: '100%', boxSizing: 'border-box', display: 'block' }

/**
 * Shared title + description form fields (name input · hairline · description textarea).
 * Render inside a GlassCard. Used by Workout Builder and Meal Builder.
 */
export default function TitleDescription({
  name, onNameChange, namePlaceholder = 'Name',
  description, onDescriptionChange, descriptionPlaceholder = 'Add a description…',
  rows = 2,
}) {
  return (
    <>
      <input value={name} onChange={e => onNameChange(e.target.value)} placeholder={namePlaceholder} style={nameSt} />
      <div style={dividerSt} />
      <textarea value={description} onChange={e => onDescriptionChange(e.target.value)} placeholder={descriptionPlaceholder} rows={rows} style={descSt} />
    </>
  )
}
