// Hover style inspector — wraps a playbook page; when active, hovering any
// element inside shows a panel beside its phone frame listing the element's
// styles, reverse-mapped from resolved values back to design tokens.
//
// The reverse map is the point: app code uses var(--token) / rgba(var(--x-rgb), α)
// only (tokens.css forbids raw hex). getComputedStyle gives resolved rgb/px, so we
// probe every :root custom property once and build resolved-value → token lookups.
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../theme/ThemeProvider.jsx'

const PANEL_W = 312

// M3 TextTheme roles — kebab var fragment ↔ display name. Used to name a text
// element's font role from its resolved size + weight.
const TT_ROLES = [
  'display-large', 'display-medium', 'display-small',
  'headline-large', 'headline-medium', 'headline-small',
  'title-large', 'title-medium', 'title-small',
  'body-large', 'body-medium', 'body-small',
  'label-large', 'label-medium', 'label-small',
]

const norm = (v) => (v || '').replace(/\s+/g, '').toLowerCase()
const round2 = (n) => Math.round(n * 100) / 100

function parseColor(v) {
  const m = /rgba?\(([^)]+)\)/i.exec(v || '')
  if (!m) return null
  const p = m[1].split(',').map((s) => s.trim())
  if (p.length < 3) return null
  return { r: +p[0], g: +p[1], b: +p[2], a: p[3] === undefined ? 1 : +p[3] }
}

// One pass over the active stylesheets → every custom property declared on
// :root / [data-theme=…]. Same-origin here, so cssRules is readable.
function readTokenNames() {
  const names = new Set()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    if (!rules) continue
    for (const rule of Array.from(rules)) {
      if (rule.type !== 1) continue
      if (!/:root|\[data-theme/.test(rule.selectorText || '')) continue
      const style = rule.style
      for (let i = 0; i < style.length; i++) {
        const p = style[i]
        if (p.startsWith('--')) names.add(p)
      }
    }
  }
  return [...names]
}

// Probe-based reverse maps. Each category sets the matching CSS property on a
// hidden probe to `var(--token)` and reads the resolved value back — so the
// stored key is normalized identically to how a real element computes.
function buildMaps() {
  const names = readTokenNames()
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;pointer-events:none;'
  document.body.appendChild(probe)
  const resolve = (prop, expr) => {
    probe.style[prop] = ''
    probe.style[prop] = expr
    if (!probe.style[prop]) return null // invalid value → assignment rejected
    return getComputedStyle(probe)[prop]
  }

  const colorMap = new Map()    // 'rgb(a)…' → --token (solid + glass composites)
  const tripletMap = new Map()  // 'r,g,b'   → --token-rgb
  const radiusMap = new Map()
  const spaceMap = new Map()
  const shadowMap = new Map()
  const gradientMap = new Map()

  for (const name of names) {
    if (name.endsWith('-rgb')) {
      const c = resolve('color', `rgb(var(${name}))`)
      if (c) { const p = parseColor(c); if (p) tripletMap.set(`${p.r},${p.g},${p.b}`, name) }
    } else if (/^--(cs|glass|cat|smoke)-/.test(name) || name === '--app-bg' || name === '--node-center') {
      const c = resolve('color', `var(${name})`)
      if (c) colorMap.set(norm(c), name)
    } else if (name.startsWith('--radius-')) {
      const r = resolve('borderRadius', `var(${name})`)
      if (r) radiusMap.set(norm(r), name)
    } else if (name.startsWith('--sp-')) {
      const s = resolve('marginLeft', `var(${name})`)
      if (s && norm(s) !== '0px') spaceMap.set(norm(s), name)
    } else if (name.startsWith('--shadow-')) {
      const s = resolve('boxShadow', `var(${name})`)
      if (s) shadowMap.set(norm(s), name)
    } else if (name.startsWith('--gradient-')) {
      const g = resolve('backgroundImage', `var(${name})`)
      if (g) gradientMap.set(norm(g), name)
    }
  }

  // Text roles: resolved size + weight → 'title/large'
  const rs = getComputedStyle(document.documentElement)
  const roles = TT_ROLES.map((k) => ({
    name: k.replace('-', '/'),
    size: parseFloat(rs.getPropertyValue(`--tt-${k}-size`)),
    weight: parseInt(rs.getPropertyValue(`--tt-${k}-weight`), 10),
  })).filter((r) => r.size)

  probe.remove()
  return { colorMap, tripletMap, radiusMap, spaceMap, shadowMap, gradientMap, roles }
}

function matchColor(maps, v) {
  const n = norm(v)
  if (!n || n === 'rgba(0,0,0,0)' || n === 'transparent') return null
  if (maps.colorMap.has(n)) return `var(${maps.colorMap.get(n)})`
  const p = parseColor(v)
  if (p) {
    const name = maps.tripletMap.get(`${p.r},${p.g},${p.b}`)
    if (name) return p.a >= 1 ? `rgb(var(${name}))` : `rgba(var(${name}), ${round2(p.a)})`
  }
  return null
}

const matchScalar = (map, v) => {
  const t = map.get(norm(v))
  return t ? `var(${t})` : null
}

// Map each value in a padding/margin shorthand to a spacing token.
function matchSpacing(maps, v) {
  const parts = (v || '').trim().split(/\s+/)
  if (!parts.length) return null
  const out = parts.map((p) => maps.spaceMap.get(norm(p))?.replace('--', '') || null)
  return out.some(Boolean) ? out.map((t) => t || '·').join(' ') : null
}

function describe(el) {
  let s = el.tagName.toLowerCase()
  if (el.id) s += `#${el.id}`
  const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)
  if (cls.length) s += `.${cls.slice(0, 2).join('.')}`
  return s
}

// Build the rows shown in the panel for one element.
function inspect(maps, el) {
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const rows = []
  const add = (group, label, value, token) => {
    if (value == null || value === '' || value === 'none' || value === 'normal' || value === 'auto') return
    if (norm(value) === 'rgba(0,0,0,0)') return
    rows.push({ group, label, value, token })
  }

  // Typography
  const fs = parseFloat(cs.fontSize)
  const fw = parseInt(cs.fontWeight, 10)
  const role = maps.roles.find((r) => r.size === fs && r.weight === fw)
    || maps.roles.find((r) => r.size === fs)
  add('Type', 'role', role ? role.name : `${fs}px / ${fw}`, role ? `tt-${role.name.replace('/', '-')}` : null)
  add('Type', 'size', cs.fontSize)
  add('Type', 'weight', cs.fontWeight)
  add('Type', 'line', cs.lineHeight)
  add('Type', 'tracking', cs.letterSpacing)
  add('Type', 'color', cs.color, matchColor(maps, cs.color))

  // Color / surface
  add('Surface', 'background', cs.backgroundColor, matchColor(maps, cs.backgroundColor))
  if (cs.backgroundImage && cs.backgroundImage !== 'none')
    add('Surface', 'gradient', cs.backgroundImage, matchScalar(maps.gradientMap, cs.backgroundImage))
  if (parseFloat(cs.borderTopWidth) > 0)
    add('Surface', 'border', `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, matchColor(maps, cs.borderTopColor))
  add('Surface', 'shadow', cs.boxShadow, matchScalar(maps.shadowMap, cs.boxShadow))
  if (cs.opacity !== '1') add('Surface', 'opacity', cs.opacity)

  // Box
  add('Box', 'size', `${Math.round(rect.width)} × ${Math.round(rect.height)}`)
  add('Box', 'display', cs.display)
  if (cs.display.includes('flex')) {
    add('Box', 'direction', cs.flexDirection)
    add('Box', 'gap', cs.gap, matchScalar(maps.spaceMap, cs.gap))
  }
  add('Box', 'padding', cs.padding, matchSpacing(maps, cs.padding))
  add('Box', 'radius', cs.borderRadius, matchScalar(maps.radiusMap, cs.borderRadius))

  return { rows, descriptor: describe(el), rect }
}

const GROUP_ORDER = ['Type', 'Surface', 'Box']

export default function StyleInspector({ children }) {
  const [active, setActive] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [target, setTarget] = useState(null)
  const [tick, setTick] = useState(0) // re-read rect on scroll/resize
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const mapsRef = useRef(null)
  const { theme } = useTheme()

  // (Re)build the token maps whenever inspection starts or the theme flips.
  useEffect(() => { if (active) mapsRef.current = buildMaps() }, [active, theme])

  useEffect(() => {
    if (!active) { setTarget(null); setPinned(false); return }
    const root = rootRef.current
    const onMove = (e) => {
      if (pinned) return
      const el = e.target
      if (el instanceof Element && root.contains(el) && !panelRef.current?.contains(el)) setTarget(el)
    }
    const onClick = (e) => {
      const el = e.target
      if (panelRef.current?.contains(el)) return
      if (el instanceof Element && root.contains(el)) { e.preventDefault(); e.stopPropagation(); setPinned((p) => !p); setTarget(el) }
    }
    const onKey = (e) => { if (e.key === 'Escape') setActive(false) }
    const onScroll = () => setTick((n) => n + 1)
    root.addEventListener('mousemove', onMove)
    root.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [active, pinned])

  const data = useMemo(
    () => (active && target && mapsRef.current && document.contains(target) ? inspect(mapsRef.current, target) : null),
    [active, target, theme, tick],
  )

  // Position the panel beside the hovered element's phone frame.
  let panelPos = null
  if (data) {
    const frame = target.closest('[data-phone-frame]')
    const fr = frame ? frame.getBoundingClientRect() : data.rect
    const onRight = fr.right + 16 + PANEL_W <= window.innerWidth
    const left = onRight ? fr.right + 16 : Math.max(16, fr.left - 16 - PANEL_W)
    const top = Math.min(Math.max(16, fr.top), window.innerHeight - 360)
    panelPos = { left, top }
  }

  const fontMono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      {children}

      {/* Toggle */}
      {createPortal(
        <button
          onClick={() => setActive((a) => !a)}
          style={{
            position: 'fixed', right: 20, bottom: 20, zIndex: 9000,
            padding: '9px 14px', borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(var(--cs-outline-rgb),0.35)',
            background: active ? 'var(--cs-primary)' : 'var(--glass-popover)',
            color: active ? 'var(--cs-on-primary)' : 'var(--cs-on-surface)',
            backdropFilter: 'blur(12px)', cursor: 'pointer',
            fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500,
            boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          <span style={{ fontSize: 13 }}>⌖</span>
          {active ? 'Inspecting · Esc' : 'Inspect styles'}
        </button>,
        document.body,
      )}

      {/* Highlight overlay */}
      {data && createPortal(
        <div style={{
          position: 'fixed', zIndex: 8990, pointerEvents: 'none',
          left: data.rect.left, top: data.rect.top, width: data.rect.width, height: data.rect.height,
          outline: '1px solid var(--cs-primary)',
          background: 'rgba(var(--cs-primary-rgb),0.10)',
          boxShadow: '0 0 0 1px rgba(var(--cs-primary-rgb),0.35)',
        }} />,
        document.body,
      )}

      {/* Panel */}
      {data && panelPos && createPortal(
        <div ref={panelRef} style={{
          position: 'fixed', zIndex: 9001, left: panelPos.left, top: panelPos.top, width: PANEL_W,
          maxHeight: '70vh', overflowY: 'auto',
          background: 'var(--glass-popover)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(var(--cs-outline-rgb),0.30)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-glass-high)', padding: 14,
          fontFamily: 'var(--tt-font-family)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: fontMono, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)' }}>
              {data.descriptor}
            </span>
            <span style={{ fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>
              {pinned ? '📌 pinned' : 'click to pin'}
            </span>
          </div>

          {GROUP_ORDER.map((group) => {
            const rows = data.rows.filter((r) => r.group === group)
            if (!rows.length) return null
            return (
              <div key={group} style={{ marginBottom: 10 }}>
                <p style={{
                  fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--cs-on-surface-variant)', opacity: 0.5, margin: '0 0 6px',
                }}>{group}</p>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', alignItems: 'baseline' }}>
                    <span style={{ flex: '0 0 64px', fontSize: 11, color: 'var(--cs-on-surface-variant)' }}>{r.label}</span>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {r.token && (
                        <code style={{
                          fontFamily: fontMono, fontSize: 11, color: 'var(--cs-primary)',
                          background: 'rgba(var(--cs-primary-rgb),0.10)', borderRadius: 'var(--radius-sm)',
                          padding: '1px 5px', alignSelf: 'flex-start', wordBreak: 'break-all',
                        }}>{r.token}</code>
                      )}
                      <span style={{
                        fontFamily: fontMono, fontSize: 11, lineHeight: 1.45,
                        color: r.token ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)',
                        opacity: r.token ? 0.6 : 1, overflowWrap: 'anywhere', whiteSpace: 'normal',
                      }}>{r.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </div>
  )
}
