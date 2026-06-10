import { useState, useMemo } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import SearchInput from '../../components/SearchInput.jsx'
import Segmented from '../../components/Segmented.jsx'
import { LIBRARIES } from './configs/index.js'
import {
  SectionLabel, chipSt, gridBtnSt, segBtnSt, dotsBtnSt, wrapChipSt, DIFF_COLORS,
} from './shared.jsx'
import { BackChevron, FilterIcon, EquipmentIcon, ChevronSmall } from './icons.jsx'
import { WorkoutPreviewView } from './WorkoutPreviewScreen.jsx'
import { MealPreviewView } from './MealPreviewScreen.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const isMulti = f => f.control === 'grid' || f.control === 'chips'
const normOpt = o => (typeof o === 'string' ? { key: o, label: o } : o)
const labelText = on => ({ ...TT, fontSize: 10, fontWeight: on ? 500 : 400, color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)' })

function emptyFilters(config) {
  const f = {}
  if (config.quickChips) f[config.quickChips.field] = []
  for (const flt of config.filters) f[flt.key] = isMulti(flt) ? [] : null
  return f
}

function optMatch(filter, key, item) {
  const opt = filter.options.map(normOpt).find(o => o.key === key)
  if (opt && opt.match) return opt.match(item)
  const v = item[filter.key]
  return Array.isArray(v) ? v.includes(key) : v === key
}

function matchItem(item, query, filters, config) {
  if (query && !String(item.name).toLowerCase().includes(query.toLowerCase())) return false
  const qf = config.quickChips
  if (qf) {
    const sel = filters[qf.field] || []
    if (sel.length && !sel.includes(item[qf.field])) return false
  }
  for (const f of config.filters) {
    const val = filters[f.key]
    if (isMulti(f)) {
      const arr = val || []
      if (arr.length && !arr.some(k => optMatch(f, k, item))) return false
    } else if (val != null && !optMatch(f, val, item)) return false
  }
  return true
}

// ── Generic filter control (grid / segmented / dots / chips) ─────────────────
function FilterControl({ filter, filters, toggleMulti, setSingle }) {
  const opts = filter.options.map(normOpt)
  return (
    <div style={{ marginBottom: 18 }}>
      <SectionLabel>{filter.label}</SectionLabel>

      {filter.control === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {opts.map(o => {
            const on = (filters[filter.key] || []).includes(o.key)
            return (
              <button key={o.key} onClick={() => toggleMulti(filter.key, o.key)} style={gridBtnSt(on)}>
                <EquipmentIcon name={o.key} active={on} />
                <span style={labelText(on)}>{o.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {filter.control === 'segmented' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {opts.map(o => {
            const on = filters[filter.key] === o.key
            return <button key={o.key} onClick={() => setSingle(filter.key, o.key)} style={segBtnSt(on)}>{o.label}</button>
          })}
        </div>
      )}

      {filter.control === 'dots' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {opts.map(o => {
            const on = filters[filter.key] === o.key
            return (
              <button key={o.key} onClick={() => setSingle(filter.key, o.key)} style={dotsBtnSt(on)}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < o.dots ? DIFF_COLORS[o.key] : 'rgba(var(--overlay-rgb),0.12)', opacity: i < o.dots ? (on ? 1 : 0.7) : 1 }} />
                  ))}
                </div>
                <span style={labelText(on)}>{o.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {filter.control === 'chips' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {opts.map(o => {
            const on = (filters[filter.key] || []).includes(o.key)
            return <button key={o.key} onClick={() => toggleMulti(filter.key, o.key)} style={wrapChipSt(on)}>{o.label}</button>
          })}
        </div>
      )}
    </div>
  )
}

const primaryBtnSt = {
  ...TT, fontWeight: 500, color: 'var(--cs-on-primary)', cursor: 'pointer',
  background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)',
  border: '1px solid rgba(var(--overlay-rgb),0.18)',
  boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 2px 4px rgba(var(--cs-shadow-rgb),0.28), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)',
}

// LibrariesView is the screen body (no PhoneFrame), so it can be embedded as an
// in-phone picker overlay. lockLibrary hides the switcher; onConfirm/onClose wire
// the selection bar's Add/Choose and the header back when used as a picker.
export function LibrariesView({ initialLibrary = 'exercises', mode = 'browse', initialSelected = [], sheetOpenInitial = false, lockLibrary = false, onConfirm, onClose }) {
  const [libraryId, setLibraryId] = useState(initialLibrary)
  const config = LIBRARIES.find(l => l.id === libraryId) ?? LIBRARIES[0]

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(() => emptyFilters(config))
  const [sheetOpen, setSheetOpen] = useState(sheetOpenInitial)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [preview, setPreview] = useState(null)   // browse: tap a workout/meal card → detail
  const [selected, setSelected] = useState(() =>
    mode === 'multi' ? new Set(initialSelected) : mode === 'single' ? (initialSelected[0] ?? null) : null
  )

  function switchLibrary(id) {
    const next = LIBRARIES.find(l => l.id === id)
    setLibraryId(id)
    setFilters(emptyFilters(next))
    setQuery('')
    setAdvancedOpen(false)
    setSheetOpen(false)
    setSelected(mode === 'multi' ? new Set() : null)
  }

  function toggleMulti(key, value) {
    setFilters(p => {
      const cur = p[key] || []
      return { ...p, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] }
    })
  }
  function setSingle(key, value) { setFilters(p => ({ ...p, [key]: p[key] === value ? null : value })) }

  const results = useMemo(() => config.data.filter(it => matchItem(it, query, filters, config)), [config, query, filters])

  const activeCount = config.filters.reduce((n, f) => n + (isMulti(f) ? (filters[f.key] || []).length : (filters[f.key] != null ? 1 : 0)), 0)

  const qf = config.quickChips
  const advanced = config.filters.filter(f => f.advanced)
  const basic = config.filters.filter(f => !f.advanced)

  // selection helpers
  const isSelected = it => mode === 'multi' ? selected.has(it.id) : mode === 'single' ? selected === it.id : false
  const hasSelection = mode === 'multi' ? selected.size > 0 : mode === 'single' ? selected != null : false
  function onCardClick(it) {
    if (mode === 'multi') setSelected(prev => { const n = new Set(prev); n.has(it.id) ? n.delete(it.id) : n.add(it.id); return n })
    else if (mode === 'single') setSelected(it.id)
    else if (libraryId === 'workouts' || libraryId === 'meals') setPreview({ kind: libraryId === 'workouts' ? 'workout' : 'meal', item: it })  // browse → detail
  }
  const selectedItem = mode === 'single' && selected != null ? config.data.find(d => d.id === selected) : null

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* ── Header (glass slab) ── */}
      <div style={{
        background: 'var(--glass-slab)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(var(--overlay-rgb),0.05)', borderBottom: '1px solid rgba(var(--overlay-rgb),0.05)',
        boxShadow: '0 12px 32px rgba(var(--cs-shadow-rgb),0.60)', flexShrink: 0,
      }}>
        <StatusBar />

        {/* search row */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px 10px' }}>
          <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0, flexShrink: 0, background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <BackChevron />
          </button>
          <div style={{ flex: 1 }}>
            <SearchInput placeholder={config.searchPlaceholder} value={query} state={query ? 'filled' : 'default'} onChange={e => setQuery(e.target.value)} />
          </div>
          <button onClick={() => setSheetOpen(o => !o)} style={{
            width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0, flexShrink: 0, position: 'relative',
            background: sheetOpen || activeCount > 0 ? 'rgba(var(--cs-primary-rgb),0.15)' : 'var(--glass-control)',
            border: sheetOpen || activeCount > 0 ? '1px solid rgba(var(--cs-primary-rgb),0.35)' : '1px solid rgba(var(--cs-outline-rgb),0.50)',
            boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <FilterIcon active={sheetOpen || activeCount > 0} />
            {activeCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 9, background: 'var(--cs-primary)', color: 'var(--cs-on-primary)', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '1.5px solid var(--cs-surface)' }}>{activeCount}</span>
            )}
          </button>
        </div>

        {/* library switcher (hidden when used as a focused picker) */}
        {!lockLibrary && (
          <div style={{ padding: '0 16px 10px' }}>
            <Segmented options={LIBRARIES.map(l => ({ id: l.id, label: l.label }))} value={libraryId} onChange={switchLibrary} />
          </div>
        )}

        {/* quick chips */}
        {qf && (
          <>
            <style>{`.qchips::-webkit-scrollbar{display:none}`}</style>
            <div className="qchips" style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              <button onClick={() => setFilters(p => ({ ...p, [qf.field]: [] }))} style={chipSt((filters[qf.field] || []).length === 0)}>All</button>
              {qf.options.map(m => (
                <button key={m} onClick={() => toggleMulti(qf.field, m)} style={chipSt((filters[qf.field] || []).includes(m))}>{m}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Results + selection bar ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: `12px 16px ${hasSelection ? 76 : 12}px`, transition: 'padding-bottom 0.22s ease' }}>
          {results.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <span style={{ ...TT, fontSize: 14, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>Nothing found</span>
            </div>
          ) : results.map(it => config.renderCard(it, { selected: isSelected(it), onClick: () => onCardClick(it) }))}
        </div>

        {mode !== 'browse' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: hasSelection ? 64 : 0, overflow: 'hidden',
            transition: 'height 0.22s ease', background: 'var(--glass-popover)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(var(--cs-outline-rgb),0.30)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
          }}>
            <span style={{ flex: 1, minWidth: 0, ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {mode === 'multi' ? `${selected.size} selected` : (selectedItem ? selectedItem.name : '')}
            </span>
            <button
              onClick={() => onConfirm && onConfirm(mode === 'multi' ? Array.from(selected) : (selected != null ? [selected] : []))}
              style={{ ...primaryBtnSt, height: 40, padding: '0 18px', borderRadius: 'var(--radius-2xl)', fontSize: 13, flexShrink: 0 }}>
              {mode === 'multi' ? `Add${selected.size ? ` (${selected.size})` : ''}` : 'Choose'}
            </button>
          </div>
        )}
      </div>

      {/* ── Filter backdrop + sheet (overlay, slides over the list) ── */}
      <div onClick={() => setSheetOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(var(--cs-shadow-rgb),0.45)', opacity: sheetOpen ? 1 : 0, pointerEvents: sheetOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 31, height: 470,
        transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        background: 'var(--glass-popover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(var(--cs-outline-rgb),0.35)', borderRadius: '18px 18px 0 0', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div onClick={() => setSheetOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0 6px', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.16)' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2px 16px 0' }}>
          {basic.map(f => <FilterControl key={f.key} filter={f} filters={filters} toggleMulti={toggleMulti} setSingle={setSingle} />)}

          {advanced.length > 0 && (
            <>
              <button onClick={() => setAdvancedOpen(o => !o)} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, textAlign: 'left', ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>
                <ChevronSmall open={advancedOpen} /> Advanced
              </button>
              <div style={{ maxHeight: advancedOpen ? 240 : 0, overflow: 'hidden', transition: 'max-height 0.22s ease' }}>
                {advanced.map(f => <FilterControl key={f.key} filter={f} filters={filters} toggleMulti={toggleMulti} setSingle={setSingle} />)}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '10px 16px 20px', flexShrink: 0, borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)' }}>
          <button onClick={() => setFilters(emptyFilters(config))} style={{ ...TT, height: 44, padding: '0 20px', borderRadius: 'var(--radius-2xl)', background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.40)', fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface-variant)', cursor: 'pointer', flexShrink: 0 }}>Reset</button>
          <button onClick={() => setSheetOpen(false)} style={{ ...primaryBtnSt, flex: 1, height: 44, borderRadius: 'var(--radius-2xl)', fontSize: 14 }}>
            Show {results.length} {results.length === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>

      {/* ── Detail preview overlay (browse tap on a workout / meal) ── */}
      {preview && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--cs-surface)' }}>
          {preview.kind === 'workout'
            ? <WorkoutPreviewView workout={preview.item} onClose={() => setPreview(null)} cta="Done" />
            : <MealPreviewView meal={preview.item} onClose={() => setPreview(null)} cta="Done" />}
        </div>
      )}
    </div>
  )
}

export default function LibrariesScreen(props) {
  return (
    <PhoneFrame smokeVariant="animated">
      <LibrariesView {...props} />
    </PhoneFrame>
  )
}
