import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { WEEKS, WD, TODAY, PLAN } from '../calendarModel.js'
import * as G from '../glyphs.jsx'

// Hybrid detail = the SAME container-transform as design/: ONE panel anchored above
// the footer morphs height/radius/background/shadow (0.32s) from a 54px pill into the
// full panel; content sections stagger-fade in (0.1s + 40ms·i); scrim fades; close
// reverses. (Container transform IS a Material motion pattern → fits Hybrid's grammar.)
const TT = { fontFamily: 'var(--tt-font-family)' }
const NUM = { ...TT, fontVariantNumeric: 'tabular-nums' }
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

export default function HybridDetail({ c }) {
  const item = c.detailItem
  const [shown, setShown] = useState(false)
  const [kept, setKept] = useState(null)
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(false)
  const [height, setHeight] = useState(54)
  const contentRef = useRef(null)

  useEffect(() => {
    if (item) {
      setKept(item); setPicking(false); setEditing(false)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(r)
    }
    setShown(false)
    const t = setTimeout(() => setKept(null), 360)
    return () => clearTimeout(t)
  }, [item])

  const it = item ?? kept
  // re-measure every render so inline expansions (reschedule grid, note editor)
  // animate through the same height transition
  useLayoutEffect(() => {
    if (!contentRef.current) return
    const h = contentRef.current.offsetHeight
    if (h !== height) setHeight(h)
  })

  if (!it) return null
  const completed = it.status === 'Completed'
  const isWorkout = it.kind !== 'meal'
  const accent = completed ? 'var(--hy-done)' : 'var(--hy-label-3)'

  // stagger helper — content sections fade up in sequence
  let si = 0
  const stagger = () => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(6px)',
    transition: `opacity 0.2s ease ${shown ? 0.1 + si * 0.04 : 0}s, transform 0.2s ease ${shown ? 0.1 + si++ * 0.04 : 0}s`,
  })

  return (
    <>
      <div onClick={c.closeDetail} style={{ position: 'absolute', inset: 0, zIndex: 54, background: 'rgba(0,0,0,0.45)', opacity: shown ? 1 : 0, pointerEvents: item ? 'auto' : 'none', transition: 'opacity 0.3s ease' }} />

      {/* morphing container — grows up from a 54px pill anchored above the footer */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 104, zIndex: 55,
        height: shown ? Math.min(height, 720) : 54,
        borderRadius: shown ? 'var(--hy-r-sheet)' : 'var(--hy-r)',
        background: 'var(--hy-elevated)',
        boxShadow: shown ? 'var(--hy-e2)' : 'var(--hy-e1)',
        overflow: 'hidden',
        transition: `height 0.32s ${EASE}, border-radius 0.32s ${EASE}, box-shadow 0.32s ${EASE}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
          <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* status accent strip */}
            <div style={{ height: 4, background: accent, flexShrink: 0 }} />

            <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* header */}
              <div style={{ ...stagger(), display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...TT, fontSize: 20, fontWeight: 600, color: 'var(--hy-label)' }}>{it.title}</p>
                  <p style={{ ...NUM, fontSize: 13.5, color: 'var(--hy-label-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.time} · {isWorkout ? `${it.exerciseCount} exercises` : `${it.kcal} kcal`}{it.fromPlan ? ` · ${PLAN.name}` : ''} · {completed ? 'Done' : 'Planned'}</p>
                </div>
                <button onClick={c.closeDetail} style={{ width: 30, height: 30, border: 'none', background: 'var(--hy-fill)', borderRadius: '50%', color: 'var(--hy-label-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><G.Close s={16} /></button>
              </div>

              {isWorkout ? (
                <>
                  <div style={stagger()}>
                    <Group header="EXERCISES">
                      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {(it.exercises ?? []).map((ex, i) => <div key={i}>{i > 0 && <Sep />}<div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px' }}><span style={{ ...TT, fontSize: 15, color: 'var(--hy-label)' }}>{ex.name}</span><span style={{ ...NUM, fontSize: 14, color: 'var(--hy-label-2)' }}>{ex.sets} × {ex.reps}</span></div></div>)}
                      </div>
                    </Group>
                  </div>
                  {completed && it.result && (
                    <div style={stagger()}>
                      <Group header="SESSION RESULT">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <Stat v={`${it.result.tonnage.toLocaleString()} kg`} l="Tonnage" /><Stat v={it.result.sessionRpe} l="Session RPE" lft />
                          <Stat v={`${it.result.minutes} min`} l="Duration" top /><Stat v={`${it.result.setsMeasured}/${it.result.hardSets}`} l="Sets measured" top lft />
                        </div>
                      </Group>
                    </div>
                  )}
                  <div style={stagger()}><NoteField it={it} editing={editing} setEditing={setEditing} onSave={c.setNote} /></div>
                </>
              ) : (
                <div style={stagger()}>
                  <Group header="MACROS">
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ ...NUM, fontSize: 26, fontWeight: 600, color: 'var(--hy-label)' }}>{it.kcal} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--hy-label-2)' }}>kcal</span></p>
                      <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>{[['P', it.p, '--cat-p-rgb'], ['C', it.c, '--cat-c-rgb'], ['F', it.f, '--cat-f-rgb']].map(([k, v, ch]) => <span key={k} style={{ ...NUM, fontSize: 13, color: 'var(--hy-label-2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: `rgba(var(${ch}),1)` }} /><b style={{ color: 'var(--hy-label)' }}>{k} {v}</b>g</span>)}</div>
                    </div>
                  </Group>
                </div>
              )}

              {/* actions */}
              <div style={stagger()}>
                <Group>
                  {!isWorkout && <><ActionRow color="var(--hy-accent)" icon={<G.Check s={17} />} onClick={() => c.setEaten(!completed)}>{completed ? 'Mark not eaten' : 'Mark eaten'}</ActionRow><Sep /></>}
                  <ActionRow color="var(--hy-accent)" icon={<G.Move s={17} />} onClick={() => setPicking(p => !p)}>Reschedule</ActionRow>
                  {picking && <><Sep /><MonthPick c={c} /></>}
                  <Sep />
                  <ActionRow color="var(--hy-missed)" icon={<G.Trash s={16} />} onClick={c.deleteItem}>Delete</ActionRow>
                </Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Group({ header, children }) { return <div>{header && <p style={{ ...TT, fontSize: 13, color: 'var(--hy-label-2)', padding: '0 16px 6px', letterSpacing: '0.4px' }}>{header}</p>}<div style={{ background: 'var(--hy-card)', borderRadius: 'var(--hy-r-card)', overflow: 'hidden' }}>{children}</div></div> }
function Sep() { return <div style={{ height: '0.5px', background: 'var(--hy-separator)', marginLeft: 16 }} /> }
function Stat({ v, l, top, lft }) { return <div style={{ padding: '12px 16px', borderLeft: lft ? '0.5px solid var(--hy-separator)' : 'none', borderTop: top ? '0.5px solid var(--hy-separator)' : 'none' }}><p style={{ ...NUM, fontSize: 17, fontWeight: 600, color: 'var(--hy-label)' }}>{v}</p><p style={{ ...TT, fontSize: 12, color: 'var(--hy-label-2)', marginTop: 2 }}>{l}</p></div> }
function ActionRow({ color, icon, children, onClick }) { return <button onClick={onClick} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 16, color }}><span style={{ display: 'flex', color }}>{icon}</span>{children}</button> }
function NoteField({ it, editing, setEditing, onSave }) {
  const [text, setText] = useState(it.note ?? '')
  if (editing) return <Group header="NOTE"><textarea autoFocus value={text} onChange={e => setText(e.target.value)} onBlur={() => { setEditing(false); onSave(text.trim()) }} placeholder="Session note…" rows={2} style={{ ...TT, width: '100%', resize: 'none', fontSize: 15, color: 'var(--hy-label)', background: 'transparent', border: 'none', padding: '12px 16px', outline: 'none' }} /></Group>
  return <Group header="NOTE"><button onClick={() => setEditing(true)} style={{ ...TT, width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: it.note ? 'var(--hy-label)' : 'var(--hy-accent)' }}>{it.note || 'Add note…'}</button></Group>
}
function MonthPick({ c }) {
  return (
    <div style={{ padding: '8px 10px 10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>{WD.map(d => <span key={d} style={{ ...TT, textAlign: 'center', fontSize: 11, color: 'var(--hy-label-2)' }}>{d[0]}</span>)}</div>
      {WEEKS.map((wk, wi) => <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>{wk.map((n, i) => n == null ? <span key={`b${i}`} style={{ height: 38 }} /> : <button key={n} onClick={() => c.moveItem(n)} style={{ height: 38, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 30, height: 30, borderRadius: '50%', background: n === c.selected ? 'var(--hy-accent)' : 'transparent', border: n === TODAY && n !== c.selected ? '1.5px solid var(--hy-accent)' : '1.5px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...NUM, fontSize: 15, color: n === c.selected ? 'var(--hy-on-accent)' : n === TODAY ? 'var(--hy-accent)' : 'var(--hy-label)' }}>{n}</span></span></button>)}</div>)}
    </div>
  )
}
