import { useState, useEffect, useCallback } from 'react'
import { PhoneFrame, GlassCard, ListTile, Button, IconButton, FAB, ConfirmDialog, SelectDialog, MultiSelectDialog, DropdownMenu, NavBar } from '../components/index.js'
import AnimatedSmokeLayer from '../components/AnimatedSmokeLayer.jsx'

// ── Config ────────────────────────────────────────────────────────

const PHONE_SCALE = 0.32  // 430×932 → ~138×298

const SMOKE_VARIANTS = [
  { variant: 'slate',    label: 'Slate',    desc: 'Figma exact — upper left' },
  { variant: 'minimal',  label: 'Minimal',  desc: 'Barely visible' },
  { variant: 'animated', label: 'Animated', desc: 'Spheres drift in real time' },
]

const GLASS_LEVELS = [
  { level: 'Low',  desc: 'bg 55% · blur 16px' },
  { level: 'Mid',  desc: 'bg 72% · blur 24px' },
  { level: 'High', desc: 'bg 88% · blur 32px' },
]

// ── Page ──────────────────────────────────────────────────────────

export default function UiKitPage() {
  const [preview, setPreview] = useState(null)

  return (
    <>
      {/* Canvas background — lighter than phone black so frames stand out */}
      <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%' }}>

        {/* PhoneFrame */}
        <Section title="PhoneFrame · smoke backgrounds">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {SMOKE_VARIANTS.map(({ variant, label, desc }) => (
              <PhoneThumbnail
                key={variant}
                label={label}
                desc={desc}
                onPreview={() => setPreview({ type: 'phone', payload: variant })}
              >
                <PhoneFrame smokeVariant={variant} />
              </PhoneThumbnail>
            ))}
          </div>
        </Section>

        {/* NavBar */}
        <Section title="NavBar">
          <NavBarShowcase />
        </Section>

        {/* ListTiles */}
        <Section title="ListTiles">
          <ListTileShowcase onPreview={(level) => setPreview({ type: 'listTile', payload: level })} />
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <ButtonShowcase onPreview={() => setPreview({ type: 'buttons' })} />
        </Section>

        {/* Dialogs */}
        <Section title="Dialogs">
          <DialogShowcase />
        </Section>

        {/* Containers */}
        <Section title="Containers">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {GLASS_LEVELS.map(({ level, desc }) => (
              <GlassContainerThumbnail
                key={level}
                label={`GlassCard · ${level}`}
                desc={desc}
                level={level}
                onPreview={() => setPreview({ type: 'glass', payload: level })}
              />
            ))}
          </div>
        </Section>

      </div>

      {/* Overlays */}
      {preview?.type === 'phone' && (
        <PreviewOverlay onClose={() => setPreview(null)}>
          <PhoneFrame smokeVariant={preview.payload} />
        </PreviewOverlay>
      )}

      {preview?.type === 'listTile' && (
        <PreviewOverlay onClose={() => setPreview(null)}>
          <ListTilePreviewContent initialLevel={preview.payload} />
        </PreviewOverlay>
      )}

      {preview?.type === 'buttons' && (
        <PreviewOverlay onClose={() => setPreview(null)}>
          <ButtonAllVariantsStage />
        </PreviewOverlay>
      )}

      {preview?.type === 'glass' && (
        <PreviewOverlay onClose={() => setPreview(null)}>
          <GlassStage width={480} height={320} level={preview.payload} />
        </PreviewOverlay>
      )}
    </>
  )
}

// ── NavBar showcase ───────────────────────────────────────────────

const TT_UI = { fontFamily: 'var(--tt-font-family)' }

const navIconBtnSt = {
  width: 44, height: 44, borderRadius: 'var(--radius-xl)',
  background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.40)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, cursor: 'pointer', padding: 0,
}

function NavBarShowcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 430,
        borderRadius: 14,
        background: 'var(--cs-surface)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.07)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <AnimatedSmokeLayer />

        {/* Variant 1: back + title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar>
            <NavBarRow>
              <NavBackBtn />
              <span style={{ ...TT_UI, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Leg Day</span>
            </NavBarRow>
          </NavBar>
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.04)' }} />

        {/* Variant 2: back + title + text trailing */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar>
            <NavBarRow>
              <NavBackBtn />
              <span style={{ ...TT_UI, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Leg Day</span>
              <span style={{ ...TT_UI, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.40 }}>4 exercises</span>
            </NavBarRow>
          </NavBar>
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.04)' }} />

        {/* Variant 3: back + title + meta trailing */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar>
            <NavBarRow>
              <NavBackBtn />
              <span style={{ ...TT_UI, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Leg Day</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ ...TT_UI, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)', opacity: 0.75 }}>02:22</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT_UI, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>Set 2/4</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.20, flexShrink: 0 }} />
                <span style={{ ...TT_UI, fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.45 }}>2/5</span>
              </div>
            </NavBarRow>
          </NavBar>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>
          NavBar
        </p>
        <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 3 }}>
          glass slab container · 3 content variants
        </p>
      </div>
    </div>
  )
}

function NavBarRow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>
      {children}
    </div>
  )
}

function NavBackBtn() {
  return (
    <button style={navIconBtnSt}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  )
}

// ── ListTile showcase ─────────────────────────────────────────────

const TILE_ROWS = [
  { id: 'full',        title: 'Morning Strength', subtitle: 'Chest · Barbell · 8 exercises',        leading: true,  trailing: true  },
  { id: 'no-leading',  title: 'Leg Day',           subtitle: 'Quadriceps · Barbell · 12 exercises', leading: false, trailing: true  },
  { id: 'no-trailing', title: 'Evening Yoga',      subtitle: 'Full body · Bodyweight · 5 exercises',leading: true,  trailing: false },
  { id: 'icon-title',  title: 'Core Workout',      subtitle: null,                                   leading: true,  trailing: false },
  { id: 'icon-chev',   title: 'Upper Body',        subtitle: null,                                   leading: true,  trailing: true  },
  { id: 'title-only',  title: 'HIIT Cardio',       subtitle: null,                                   leading: false, trailing: false },
]

function ListTileAllVariantsStage({ level = 'Mid' }) {
  return (
    <div style={{
      width: 480,
      borderRadius: 20,
      background: 'var(--cs-surface)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.07)',
    }}>
      <AnimatedSmokeLayer />
      {TILE_ROWS.map(row => (
        <div key={row.id} style={{ position: 'relative', zIndex: 1 }}>
          <ListTile
            title={row.title}
            subtitle={row.subtitle}
            leading={row.leading ? <TileLeadingIcon /> : undefined}
            trailing={row.trailing ? <ChevronRightIcon /> : undefined}
            level={level}
          />
        </div>
      ))}
    </div>
  )
}

function LevelSwitcher({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {['Low', 'Mid', 'High'].map(l => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: value === l
              ? '1px solid rgba(var(--cs-primary-rgb),0.35)'
              : '1px solid rgba(var(--cs-outline-rgb),0.50)',
            background: value === l
              ? 'rgba(var(--cs-primary-rgb),0.12)'
              : 'var(--glass-control-stronger)',
            color: value === l ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)',
            fontFamily: 'var(--tt-font-family)',
            fontSize: 12,
            fontWeight: value === l ? 500 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function ListTileShowcase({ onPreview }) {
  const [level, setLevel] = useState('Mid')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ListTileAllVariantsStage level={level} />
        <LevelSwitcher value={level} onChange={setLevel} />
      </div>
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>
            ListTile
          </p>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 3 }}>
            Glass · {level} · {TILE_ROWS.length} variants
          </p>
        </div>
        <button
          onClick={() => onPreview(level)}
          title="Open preview"
          style={{
            width: 28, height: 28, flexShrink: 0,
            border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
            borderRadius: 7,
            background: 'var(--glass-control-stronger)',
            color: 'var(--cs-on-surface-variant)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <ExpandIcon />
        </button>
      </div>
    </div>
  )
}

function ListTilePreviewContent({ initialLevel = 'Mid' }) {
  const [level, setLevel] = useState(initialLevel)
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <ListTileAllVariantsStage level={level} />
      <LevelSwitcher value={level} onChange={setLevel} />
    </div>
  )
}

// ── Button showcase ───────────────────────────────────────────────

const BTN_ROWS = [
  { id: 'filled',      rowLabel: 'Filled',      variant: 'filled',      btnLabel: 'Add Workout', icon: 'plus'  },
  { id: 'tonal',       rowLabel: 'Tonal',       variant: 'tonal',       btnLabel: 'Add Workout', icon: null    },
  { id: 'outlined',    rowLabel: 'Outlined',    variant: 'outlined',    btnLabel: 'Add Workout', icon: null    },
  { id: 'text',        rowLabel: 'Text',        variant: 'text',        btnLabel: 'View All',    icon: null    },
  { id: 'destructive', rowLabel: 'Destructive', variant: 'destructive', btnLabel: 'Delete',      icon: 'trash' },
]

function BtnPlusIcon()  {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function BtnArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}
function BtnTrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
}

function btnIcon(name) {
  if (name === 'plus')  return <BtnPlusIcon />
  if (name === 'trash') return <BtnTrashIcon />
  return undefined
}

const ROW_LABEL_STYLE = {
  width: 84, flexShrink: 0,
  fontFamily: 'var(--tt-font-family)',
  fontSize: 10, fontWeight: 500,
  color: 'var(--cs-on-surface-variant)',
  opacity: 0.45,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}

function ButtonAllVariantsStage() {
  return (
    <div style={{
      width: 520,
      borderRadius: 20,
      background: 'var(--cs-surface)',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.07)',
    }}>
      <AnimatedSmokeLayer />

      {/* Variant rows */}
      {BTN_ROWS.map(row => (
        <div key={row.id} style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={ROW_LABEL_STYLE}>{row.rowLabel}</span>
          <Button variant={row.variant} label={row.btnLabel} icon={btnIcon(row.icon)} />
          <Button variant={row.variant} label={row.btnLabel} icon={btnIcon(row.icon)} disabled />
        </div>
      ))}

      {/* Submit — stretched */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={ROW_LABEL_STYLE}>Submit</span>
        <Button variant="submit" label="Save Changes" icon={<BtnArrowIcon />} style={{ flex: 1 }} />
      </div>

      {/* Divider */}
      <div style={{ position: 'relative', zIndex: 1, height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '2px 0' }} />

      {/* IconButton sizes */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={ROW_LABEL_STYLE}>IconButton</span>
        <IconButton size="sm" />
        <IconButton size="md" />
        <IconButton size="lg" />
        <IconButton size="lg" state="disabled" />
      </div>

      {/* FAB */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={ROW_LABEL_STYLE}>FAB</span>
        <FAB fabStyle="Glass" />
        <FAB fabStyle="Gradient" />
      </div>
    </div>
  )
}

function ButtonShowcase({ onPreview }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <ButtonAllVariantsStage />
      <div style={{ width: 520, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>
            Buttons
          </p>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 3 }}>
            filled · tonal · outlined · text · submit · destructive · icon · fab
          </p>
        </div>
        <button
          onClick={onPreview}
          title="Open preview"
          style={{
            width: 28, height: 28, flexShrink: 0,
            border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
            borderRadius: 7,
            background: 'var(--glass-control-stronger)',
            color: 'var(--cs-on-surface-variant)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <ExpandIcon />
        </button>
      </div>
    </div>
  )
}

// ── Animated smoke stage — one GlassCard level per instance ──────

function GlassStage({ width = 480, height = 320, level = 'Mid' }) {
  return (
    <div style={{
      width, height,
      borderRadius: 20,
      background: 'var(--cs-surface)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      boxShadow: '0 0 0 1px rgba(var(--overlay-rgb),0.07)',
    }}>
      <AnimatedSmokeLayer />
      <GlassCard
        level={level}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

// ── Thumbnails ────────────────────────────────────────────────────

function PhoneThumbnail({ label, desc, onPreview, children }) {
  const w = Math.round(430 * PHONE_SCALE)
  const h = Math.round(932 * PHONE_SCALE)
  const r = Math.round(55  * PHONE_SCALE)
  return (
    <ItemCard label={label} desc={desc} onPreview={onPreview}>
      <div style={{ width: w, height: h, borderRadius: r, overflow: 'hidden', boxShadow: '0 4px 20px rgba(var(--cs-shadow-rgb),0.6)' }}>
        <div style={{ width: 430, height: 932, transform: `scale(${PHONE_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          {children}
        </div>
      </div>
    </ItemCard>
  )
}

const GLASS_THUMB_SCALE = 0.45
const STAGE_W = 480
const STAGE_H = 320

function GlassContainerThumbnail({ label, desc, level, onPreview }) {
  const tw = Math.round(STAGE_W * GLASS_THUMB_SCALE)
  const th = Math.round(STAGE_H * GLASS_THUMB_SCALE)
  return (
    <ItemCard label={label} desc={desc} onPreview={onPreview}>
      <div style={{ width: tw, height: th, borderRadius: Math.round(20 * GLASS_THUMB_SCALE), overflow: 'hidden', boxShadow: '0 4px 20px rgba(var(--cs-shadow-rgb),0.6)' }}>
        <div style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${GLASS_THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <GlassStage width={STAGE_W} height={STAGE_H} level={level} />
        </div>
      </div>
    </ItemCard>
  )
}

// ── Shared card shell ─────────────────────────────────────────────

function ItemCard({ label, desc, onPreview, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {children}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>
            {label}
          </p>
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 3 }}>
            {desc}
          </p>
        </div>
        <button
          onClick={onPreview}
          title="Open preview"
          style={{
            width: 28, height: 28, flexShrink: 0,
            border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
            borderRadius: 7,
            background: 'var(--glass-control-stronger)',
            color: 'var(--cs-on-surface-variant)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <ExpandIcon />
        </button>
      </div>
    </div>
  )
}

// ── Preview overlay ───────────────────────────────────────────────

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25

function PreviewOverlay({ children, onClose }) {
  const [zoom, setZoom] = useState(1)

  const clampZoom = useCallback((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)), [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoom(z => clampZoom(z + ZOOM_STEP))
      if (e.key === '-') setZoom(z => clampZoom(z - ZOOM_STEP))
      if (e.key === '0') setZoom(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, clampZoom])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    setZoom(z => clampZoom(z - e.deltaY * 0.0008))
  }, [clampZoom])

  return (
    <div
      onClick={onClose}
      onWheel={onWheel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--cs-surface-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.12s ease' }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--glass-popover)',
          border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
          borderRadius: 10,
          padding: '4px 8px',
        }}
      >
        <ZoomBtn onClick={() => setZoom(z => clampZoom(z - ZOOM_STEP))}>−</ZoomBtn>
        <button
          onClick={() => setZoom(1)}
          style={{
            minWidth: 44, height: 26,
            background: 'none', border: 'none',
            color: 'var(--cs-on-surface-variant)',
            fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500,
            cursor: 'pointer', padding: '0 4px',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <ZoomBtn onClick={() => setZoom(z => clampZoom(z + ZOOM_STEP))}>+</ZoomBtn>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 36, height: 36,
          border: '1px solid rgba(var(--cs-outline-rgb),0.50)',
          borderRadius: 9,
          background: 'var(--cs-surface-container)',
          color: 'var(--cs-on-surface)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

function ZoomBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 26, height: 26,
        background: 'none', border: 'none',
        color: 'var(--cs-on-surface)',
        fontFamily: 'var(--tt-font-family)', fontSize: 16, fontWeight: 400,
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6,
      }}
    >
      {children}
    </button>
  )
}

// ── DialogShowcase ────────────────────────────────────────────────

function DialogStage({ height = 200, align = 'center', children }) {
  const justify = align === 'topright' ? 'flex-end' : 'center'
  const alignItems = align === 'topright' ? 'flex-start' : 'center'
  return (
    <div style={{
      width: 300, height, borderRadius: 'var(--radius-2xl)', background: 'var(--cs-surface)',
      border: '1px solid rgba(var(--overlay-rgb),0.05)', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems, justifyContent: justify, padding: 16,
    }}>
      <AnimatedSmokeLayer />
      <div style={{ position: 'relative', zIndex: 1, width: align === 'topright' ? 'auto' : '100%', display: 'flex', justifyContent: justify }}>
        {children}
      </div>
    </div>
  )
}

function DialogTile({ label, desc, height, align, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <DialogStage height={height} align={align}>{children}</DialogStage>
      <div>
        <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>{label}</p>
        <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.5, marginTop: 3 }}>{desc}</p>
      </div>
    </div>
  )
}

function DialogShowcase() {
  const [unit, setUnit] = useState('kg')
  const [equip, setEquip] = useState(['Barbell', 'Dumbbell'])
  const toggleEquip = id => setEquip(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <DialogTile label="Confirm dialog" desc="icon hero · Cancel / Confirm" height={250}>
        <ConfirmDialog title="Save changes?" message="Your plan will be updated." destructive={false} confirmLabel="Confirm" onCancel={() => {}} onConfirm={() => {}} />
      </DialogTile>

      <DialogTile label="Remove dialog" desc="destructive · Cancel / Remove" height={250}>
        <ConfirmDialog title="Remove exercise?" message="It will be removed from your plan." confirmLabel="Remove" onCancel={() => {}} onConfirm={() => {}} />
      </DialogTile>

      <DialogTile label="Item select dialog" desc="single select · accent rail + check" height={330}>
        <SelectDialog title="Weight unit" subtitle="Used across this exercise" value={unit} onSelect={setUnit} onCancel={() => {}}
          options={[
            { id: 'kg', label: 'Kilograms', subtitle: 'kg', icon: <MiniWeight /> },
            { id: 'lbs', label: 'Pounds', subtitle: 'lbs', icon: <MiniWeight /> },
            { id: 'time', label: 'Time', subtitle: 'seconds', icon: <MiniClock /> },
          ]} />
      </DialogTile>

      <DialogTile label="Multi item select dialog" desc="multi select · icon rows" height={380}>
        <MultiSelectDialog title="Equipment" subtitle="Filter the library" values={equip} onToggle={toggleEquip} onCancel={() => {}} onConfirm={() => {}}
          options={[
            { id: 'Bodyweight', label: 'Bodyweight', icon: <MiniBody /> },
            { id: 'Barbell', label: 'Barbell', icon: <MiniBar /> },
            { id: 'Dumbbell', label: 'Dumbbell', icon: <MiniBar /> },
            { id: 'Cable', label: 'Cable', icon: <MiniCable /> },
            { id: 'Machine', label: 'Machine', icon: <MiniMachine /> },
          ]} />
      </DialogTile>

      <DialogTile label="Dropdown menu" desc="anchored action menu" height={220} align="topright">
        <DropdownMenu defaultOpen backdrop={false} align="right" items={[
          { label: 'Edit', icon: <MiniEdit />, onClick: () => {} },
          { label: 'Duplicate', icon: <MiniCopy />, onClick: () => {} },
          { label: 'Delete', icon: <MiniTrash />, danger: true, divider: true, onClick: () => {} },
        ]} />
      </DialogTile>
    </div>
  )
}

function MiniEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
}
function MiniCopy() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
}
function MiniTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}
function MiniWeight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M7 8.5h10l-1 8H8z" /><path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" /></svg>
}
function MiniClock() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>
}
function MiniBody() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.5" r="2" /><path d="M12 6.5v8" /><path d="M8 10h8" /><path d="M9 21l3-6 3 6" /></svg>
}
function MiniBar() {
  return <svg width="18" height="10" viewBox="0 0 26 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="0.5" y="1" width="4" height="8" rx="1" /><rect x="21.5" y="1" width="4" height="8" rx="1" /><line x1="4.5" y1="5" x2="21.5" y2="5" /></svg>
}
function MiniCable() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V17" /><path d="M8 21h8l-1.5-4h-5L8 21z" /></svg>
}
function MiniMachine() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}

// ── Section ───────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 24, paddingBottom: 10, borderBottom: '1px solid rgba(var(--overlay-rgb),0.07)' }}>
        <h2 style={{ fontFamily: 'var(--tt-font-family)', fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

// ── Icons ─────────────────────────────────────────────────────────

function TileLeadingIcon() {
  return (
    <div style={{
      width: 40, height: 40,
      borderRadius: 'var(--radius-xl)',
      background: 'var(--cs-surface-container-highest)',
      border: '1px solid rgba(var(--overlay-rgb),0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    </div>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="var(--cs-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
