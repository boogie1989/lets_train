import { useEffect, useState } from 'react'
import { WEEKS, WD, TODAY, PLAN } from '../calendarModel.js'
import * as G from '../glyphs.jsx'

// Cupertino detail = page sheet (grabber, rounded top, slides up over a dimmed
// parent). → Flutter showCupertinoSheet / showModalBottomSheet w/ detents.
const TT = { fontFamily: 'var(--tt-font-family)', WebkitFontSmoothing: 'antialiased' }
const NUM = { ...TT, fontVariantNumeric: 'tabular-nums' }

export default function CupertinoDetail({ c }) {
  const item = c.detailItem
  const [shown, setShown] = useState(false)
  const [kept, setKept] = useState(null)
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (item) { setKept(item); setPicking(false); setEditing(false); const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); return () => cancelAnimationFrame(r) }
    setShown(false); const t = setTimeout(() => setKept(null), 320); return () => clearTimeout(t)
  }, [item])

  const it = item ?? kept
  if (!it) return null
  const completed = it.status === 'Completed'
  const isWorkout = it.kind !== 'meal'

  return (
    <>
      <div onClick={c.closeDetail} style={{ position: 'absolute', inset: 0, zIndex: 56, background: 'rgba(0,0,0,0.4)', opacity: shown ? 1 : 0, pointerEvents: item ? 'auto' : 'none', transition: 'opacity 0.32s' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 64, zIndex: 57, background: 'var(--ios-bg)', borderRadius: '14px 14px 0 0', transform: shown ? 'none' : 'translateY(100%)', transition: 'transform 0.36s cubic-bezier(0.32,0.72,0,1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0', flexShrink: 0 }}><div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--ios-label-3)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '4px 16px', flexShrink: 0 }}>
          <button onClick={c.closeDetail} style={{ ...TT, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 600, color: 'var(--ios-blue)' }}>Done</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '4px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <p style={{ ...TT, fontSize: 28, fontWeight: 700, color: 'var(--ios-label)' }}>{it.title}</p>
            <p style={{ ...NUM, fontSize: 15, color: 'var(--ios-label-2)', marginTop: 4 }}>{it.time} · {isWorkout ? `${it.exerciseCount} exercises` : `${it.kcal} kcal`}{it.fromPlan ? ` · ${PLAN.name}` : ''} · {completed ? 'Done' : 'Planned'}</p>
          </div>

          {isWorkout ? (
            <>
              <Group header="EXERCISES">
                {(it.exercises ?? []).map((ex, i) => (
                  <div key={i}>
                    {i > 0 && <Sep />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px' }}><span style={{ ...TT, fontSize: 16, color: 'var(--ios-label)' }}>{ex.name}</span><span style={{ ...NUM, fontSize: 15, color: 'var(--ios-label-2)' }}>{ex.sets} × {ex.reps}</span></div>
                  </div>
                ))}
              </Group>
              {completed && it.result && (
                <Group header="SESSION RESULT">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <Stat v={`${it.result.tonnage.toLocaleString()} kg`} l="Tonnage" b /><Stat v={it.result.sessionRpe} l="Session RPE" />
                    <Stat v={`${it.result.minutes} min`} l="Duration" bt b /><Stat v={`${it.result.setsMeasured}/${it.result.hardSets}`} l="Sets measured" bt />
                  </div>
                </Group>
              )}
            </>
          ) : (
            <Group header="MACROS">
              <div style={{ padding: '14px 16px' }}>
                <p style={{ ...NUM, fontSize: 28, fontWeight: 600, color: 'var(--ios-label)' }}>{it.kcal} <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--ios-label-2)' }}>kcal</span></p>
                <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>{[['P', it.p, '--cat-p-rgb'], ['C', it.c, '--cat-c-rgb'], ['F', it.f, '--cat-f-rgb']].map(([k, v, ch]) => <span key={k} style={{ ...NUM, fontSize: 14, color: 'var(--ios-label-2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: `rgba(var(${ch}),1)` }} /><b style={{ color: 'var(--ios-label)' }}>{k} {v}</b>g</span>)}</div>
              </div>
            </Group>
          )}

          {/* actions */}
          <Group>
            {!isWorkout && <><ActionRow color="var(--ios-blue)" onClick={() => c.setEaten(!completed)}>{completed ? 'Mark Not Eaten' : 'Mark Eaten'}</ActionRow><Sep /></>}
            <ActionRow color="var(--ios-blue)" onClick={() => setPicking(p => !p)}>Reschedule</ActionRow>
            {picking && <><Sep /><MonthPick c={c} /></>}
            <Sep />
            <ActionRow color="var(--ios-red)" onClick={c.deleteItem}>Delete</ActionRow>
          </Group>

          <NoteField it={it} editing={editing} setEditing={setEditing} onSave={c.setNote} />
        </div>
      </div>
    </>
  )
}

function Group({ header, children }) { return <div>{header && <p style={{ ...TT, fontSize: 13, color: 'var(--ios-label-2)', padding: '0 16px 6px', letterSpacing: '0.4px' }}>{header}</p>}<div style={{ background: 'var(--ios-card)', borderRadius: 'var(--ios-r-card)', overflow: 'hidden' }}>{children}</div></div> }
function Sep() { return <div style={{ height: '0.5px', background: 'var(--ios-separator)', marginLeft: 16 }} /> }
function Stat({ v, l, b, bt }) { return <div style={{ padding: '12px 16px', borderLeft: b ? 'none' : '0.5px solid var(--ios-separator)', borderTop: bt ? '0.5px solid var(--ios-separator)' : 'none' }}><p style={{ ...NUM, fontSize: 17, fontWeight: 600, color: 'var(--ios-label)' }}>{v}</p><p style={{ ...TT, fontSize: 12, color: 'var(--ios-label-2)', marginTop: 2 }}>{l}</p></div> }
function ActionRow({ color, children, onClick }) { return <button onClick={onClick} style={{ ...TT, width: '100%', textAlign: 'left', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color }}>{children}</button> }
function NoteField({ it, editing, setEditing, onSave }) {
  const [text, setText] = useState(it.note ?? '')
  if (editing) return <textarea autoFocus value={text} onChange={e => setText(e.target.value)} onBlur={() => { setEditing(false); onSave(text.trim()) }} placeholder="Session note…" rows={2} style={{ ...TT, width: '100%', resize: 'none', fontSize: 16, color: 'var(--ios-label)', background: 'var(--ios-card)', border: 'none', borderRadius: 'var(--ios-r-card)', padding: '12px 16px', outline: 'none' }} />
  return <Group header="NOTE"><button onClick={() => setEditing(true)} style={{ ...TT, width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: it.note ? 'var(--ios-label)' : 'var(--ios-blue)' }}>{it.note || 'Add note…'}</button></Group>
}
function MonthPick({ c }) {
  return (
    <div style={{ padding: '8px 10px 10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>{WD.map(d => <span key={d} style={{ ...TT, textAlign: 'center', fontSize: 11, color: 'var(--ios-label-2)' }}>{d[0]}</span>)}</div>
      {WEEKS.map((wk, wi) => <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>{wk.map((n, i) => n == null ? <span key={`b${i}`} style={{ height: 38 }} /> : <button key={n} onClick={() => c.moveItem(n)} style={{ height: 38, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 30, height: 30, borderRadius: '50%', background: n === c.selected ? 'var(--ios-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...NUM, fontSize: 15, color: n === c.selected ? '#fff' : n === TODAY ? 'var(--ios-red)' : 'var(--ios-label)' }}>{n}</span></span></button>)}</div>)}
    </div>
  )
}
