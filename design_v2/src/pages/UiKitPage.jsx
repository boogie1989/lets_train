import { useState } from 'react'
import { ListTile, Button, IconButton, FAB, FabMenu, ConfirmDialog, SelectDialog, MultiSelectDialog, DropdownMenu, NavBar } from '../components/index.js'

// design_v2 UiKit — Calm Performance components, each labelled with its Flutter
// Material 3 widget equivalent. No glass / no smoke / no backdrop blur: every
// surface is opaque, separated by surface color + 1px border + one soft shadow.

const TT = { fontFamily: 'var(--tt-font-family)' }

export default function UiKitPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--surface-0)', minHeight: '100%' }}>

      {/* ── Surface elevation ladder ── */}
      <Section title="Surface elevation" flutter="Material(color: surfaceContainer*) — opaque, no blur">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {[
            { s: '--surface-0', n: 'surface-0', u: 'scaffold / screen bg' },
            { s: '--surface-1', n: 'surface-1', u: 'chrome: app bar, sidebar' },
            { s: '--surface-2', n: 'surface-2', u: 'default Card / tile' },
            { s: '--surface-3', n: 'surface-3', u: 'dialog / sheet / menu' },
            { s: '--surface-4', n: 'surface-4', u: 'raised / popover' },
          ].map((x) => (
            <div key={x.s} style={{
              width: 168, height: 104, borderRadius: 'var(--radius-2xl)',
              background: `var(${x.s})`, border: '1px solid var(--border-subtle)', boxShadow: 'var(--elev-1)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12,
            }}>
              <p style={{ ...TT, fontFamily: 'monospace', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{x.n}</p>
              <p style={{ ...TT, fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.7, marginTop: 2 }}>{x.u}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── NavBar ── */}
      <Section title="App bar" flutter="AppBar / SliverAppBar">
        <Stage width={430}>
          <NavBar>
            <NavRow>
              <NavBackBtn />
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Leg Day</span>
              <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>4 exercises</span>
            </NavRow>
          </NavBar>
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <NavBar>
            <NavRow>
              <NavBackBtn />
              <span style={{ ...TT, flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Leg Day</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)' }}>02:22</span>
                <Dot />
                <span style={{ ...TT, fontSize: 12, color: 'var(--cs-on-surface-variant)' }}>Set 2/4</span>
              </div>
            </NavRow>
          </NavBar>
        </Stage>
      </Section>

      {/* ── ListTiles + density ── */}
      <Section title="ListTile · density" flutter="ListTile (visualDensity: comfortable / compact)">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {['comfortable', 'compact'].map((mode) => (
            <div key={mode} data-density={mode === 'compact' ? 'compact' : undefined}>
              <GroupLabel>{mode}</GroupLabel>
              <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 'var(--density-gap)' }}>
                {TILE_ROWS.map((row) => (
                  <ListTile key={row.id} title={row.title} subtitle={row.subtitle}
                    leading={row.leading ? <TileLeadingIcon /> : undefined}
                    trailing={row.trailing ? <ChevronRightIcon /> : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons" flutter="FilledButton · FilledButton.tonal · OutlinedButton · TextButton">
        <Stage width={520} pad={24}>
          {BTN_ROWS.map((row) => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={ROW_LABEL}>{row.rowLabel}</span>
              <span style={FLUTTER_TAG}>{row.flutter}</span>
              <Button variant={row.variant} label={row.btnLabel} icon={btnIcon(row.icon)} />
              <Button variant={row.variant} label={row.btnLabel} icon={btnIcon(row.icon)} disabled />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={ROW_LABEL}>Submit</span>
            <span style={FLUTTER_TAG}>FilledButton(minimumSize)</span>
            <Button variant="submit" label="Save Changes" icon={<BtnArrowIcon />} style={{ flex: 1 }} />
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={ROW_LABEL}>IconButton</span>
            <span style={FLUTTER_TAG}>IconButton.filledTonal</span>
            <IconButton size="sm" /><IconButton size="md" /><IconButton size="lg" /><IconButton size="lg" state="disabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={ROW_LABEL}>FAB</span>
            <span style={FLUTTER_TAG}>FloatingActionButton</span>
            <FAB fabStyle="Glass" /><FAB fabStyle="Gradient" />
          </div>
        </Stage>
      </Section>

      {/* ── FabMenu ── */}
      <Section title="FabMenu · container transform" flutter="OpenContainer (size + fade + elevation, no blur)">
        <Stage width={300} height={320}>
          <FabMenuDemo />
          <p style={{ ...TT, position: 'absolute', left: 24, bottom: 24, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>
            tap the + to morph →
          </p>
        </Stage>
      </Section>

      {/* ── Dialogs ── */}
      <Section title="Dialogs & menus" flutter="Dialog · BottomSheet · MenuAnchor">
        <DialogShowcase />
      </Section>

    </div>
  )
}

// ── Layout helpers ────────────────────────────────────────────────

// Opaque component stage (replaces the old smoke/glass stage)
function Stage({ width, height, pad = 16, children }) {
  return (
    <div style={{
      width, minHeight: height, borderRadius: 'var(--radius-2xl)',
      background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--elev-1)',
      position: 'relative', overflow: 'hidden', padding: pad,
    }}>
      {children}
    </div>
  )
}

function Section({ title, flutter, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{ ...TT, fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{title}</h2>
        {flutter && (
          <p style={{ ...TT, fontFamily: 'monospace', fontSize: 11, color: 'var(--cs-on-surface-variant)', marginTop: 4, opacity: 0.7 }}>
            → Flutter · {flutter}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function GroupLabel({ children }) {
  return (
    <p style={{ ...TT, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', marginBottom: 10, opacity: 0.6 }}>
      {children}
    </p>
  )
}

function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-on-surface-variant)', opacity: 0.4, flexShrink: 0 }} />
}

// ── NavBar bits ───────────────────────────────────────────────────

const navIconBtn = {
  width: 44, height: 44, borderRadius: 'var(--radius-xl)',
  background: 'var(--surface-2)', border: '1px solid var(--border-default)', boxShadow: 'var(--elev-1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0,
}
function NavRow({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px', gap: 10 }}>{children}</div>
}
function NavBackBtn() {
  return (
    <button style={navIconBtn}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
  )
}

// ── ListTile rows ─────────────────────────────────────────────────

const TILE_ROWS = [
  { id: 'full',        title: 'Morning Strength', subtitle: 'Chest · Barbell · 8 exercises',         leading: true,  trailing: true  },
  { id: 'no-leading',  title: 'Leg Day',          subtitle: 'Quadriceps · Barbell · 12 exercises',   leading: false, trailing: true  },
  { id: 'title-only',  title: 'HIIT Cardio',      subtitle: null,                                    leading: false, trailing: false },
]

// ── Button rows ───────────────────────────────────────────────────

const BTN_ROWS = [
  { id: 'filled',      rowLabel: 'Filled',      flutter: 'FilledButton',        variant: 'filled',      btnLabel: 'Add Workout', icon: 'plus'  },
  { id: 'tonal',       rowLabel: 'Tonal',       flutter: 'FilledButton.tonal',  variant: 'tonal',       btnLabel: 'Add Workout', icon: null    },
  { id: 'outlined',    rowLabel: 'Outlined',    flutter: 'OutlinedButton',      variant: 'outlined',    btnLabel: 'Add Workout', icon: null    },
  { id: 'text',        rowLabel: 'Text',        flutter: 'TextButton',          variant: 'text',        btnLabel: 'View All',    icon: null    },
  { id: 'destructive', rowLabel: 'Destructive', flutter: 'FilledButton(error)', variant: 'destructive', btnLabel: 'Delete',      icon: 'trash' },
]

const ROW_LABEL = {
  width: 84, flexShrink: 0, ...TT, fontSize: 10, fontWeight: 500,
  color: 'var(--cs-on-surface-variant)', opacity: 0.55, letterSpacing: '0.5px', textTransform: 'uppercase',
}
const FLUTTER_TAG = {
  width: 132, flexShrink: 0, fontFamily: 'monospace', fontSize: 9.5,
  color: 'var(--cs-on-surface-variant)', opacity: 0.5,
}

function BtnPlusIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> }
function BtnArrowIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg> }
function BtnTrashIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg> }
function btnIcon(name) { if (name === 'plus') return <BtnPlusIcon />; if (name === 'trash') return <BtnTrashIcon />; return undefined }

// ── FabMenu demo ──────────────────────────────────────────────────

function FabMenuDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'absolute', right: 20, bottom: 20 }}>
      <FabMenu open={open} setOpen={setOpen} actions={[
        { label: 'Schedule workout', icon: <PlusGlyph />, onClick: () => {} },
        { label: 'Schedule meal', icon: <PlusGlyph />, onClick: () => {} },
        { label: 'Log meal', icon: <PlusGlyph />, dividerAbove: true, onClick: () => {} },
      ]} />
    </div>
  )
}
function PlusGlyph() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> }

// ── Dialog showcase ───────────────────────────────────────────────

function DialogStage({ height = 240, align = 'center', children }) {
  const justify = align === 'topright' ? 'flex-end' : 'center'
  const alignItems = align === 'topright' ? 'flex-start' : 'center'
  return (
    <div style={{
      width: 300, height, borderRadius: 'var(--radius-2xl)',
      background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--elev-1)',
      position: 'relative', overflow: 'hidden', display: 'flex', alignItems, justifyContent: justify, padding: 16,
    }}>
      <div style={{ width: align === 'topright' ? 'auto' : '100%', display: 'flex', justifyContent: justify }}>
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
        <p style={{ ...TT, fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>{label}</p>
        <p style={{ ...TT, fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.6, marginTop: 3 }}>{desc}</p>
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
      <DialogTile label="Multi select dialog" desc="multi select · icon rows" height={380}>
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

function MiniEdit() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> }
function MiniCopy() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> }
function MiniTrash() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> }
function MiniWeight() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M7 8.5h10l-1 8H8z" /><path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" /></svg> }
function MiniClock() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg> }
function MiniBody() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.5" r="2" /><path d="M12 6.5v8" /><path d="M8 10h8" /><path d="M9 21l3-6 3 6" /></svg> }
function MiniBar() { return <svg width="18" height="10" viewBox="0 0 26 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="0.5" y="1" width="4" height="8" rx="1" /><rect x="21.5" y="1" width="4" height="8" rx="1" /><line x1="4.5" y1="5" x2="21.5" y2="5" /></svg> }
function MiniCable() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V17" /><path d="M8 21h8l-1.5-4h-5L8 21z" /></svg> }
function MiniMachine() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> }

// ── ListTile icons ────────────────────────────────────────────────

function TileLeadingIcon() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 'var(--radius-xl)',
      background: 'var(--surface-3)', border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    </div>
  )
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
}
