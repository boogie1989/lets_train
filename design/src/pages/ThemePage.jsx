/* ─────────────────────────────────────────────
   Theme — colors, text styles, gradients.
   Every swatch is painted from a live CSS token (var(--…)); the value
   label is read back via getComputedStyle so it tracks the active theme.
   The global Dark/Light toggle (top bar) flips [data-theme] on <html>.
   ───────────────────────────────────────────── */
import { useEffect, useState } from 'react'
import { useTheme } from '../theme/ThemeProvider.jsx'

const COLOR_GROUPS = [
  {
    label: 'Primary',
    swatches: ['--cs-primary', '--cs-on-primary', '--cs-primary-container', '--cs-on-primary-container'],
  },
  {
    label: 'Secondary',
    swatches: ['--cs-secondary', '--cs-on-secondary', '--cs-secondary-container', '--cs-on-secondary-container'],
  },
  {
    label: 'Tertiary',
    swatches: ['--cs-tertiary', '--cs-on-tertiary', '--cs-tertiary-container', '--cs-on-tertiary-container'],
  },
  {
    label: 'Error',
    swatches: ['--cs-error', '--cs-on-error', '--cs-error-container', '--cs-on-error-container'],
  },
  {
    label: 'Surface',
    swatches: [
      '--cs-surface', '--cs-on-surface', '--cs-on-surface-variant', '--cs-surface-dim', '--cs-surface-bright',
      '--cs-surface-container-lowest', '--cs-surface-container-low', '--cs-surface-container',
      '--cs-surface-container-high', '--cs-surface-container-highest',
    ],
  },
  {
    label: 'Outline & Utility',
    swatches: ['--cs-outline', '--cs-outline-variant', '--cs-scrim', '--cs-inverse-surface', '--cs-inverse-primary', '--cs-surface-tint'],
  },
  {
    label: 'Status',
    swatches: ['--cs-status-completed', '--cs-status-planned'],
  },
  {
    label: 'Glass surfaces',
    swatches: ['--app-bg', '--glass-slab', '--glass-low-bg', '--glass-mid-bg', '--glass-high-bg', '--glass-sidebar', '--glass-popover', '--glass-control', '--node-center'],
  },
  {
    label: 'Category / focus',
    swatches: ['--cat-green', '--cat-blue', '--cat-amber', '--cat-pink', '--cat-violet', '--cat-cyan'],
  },
  {
    label: 'Smoke / atmosphere',
    swatches: ['--smoke-1', '--smoke-2', '--smoke-3', '--smoke-4', '--smoke-5', '--smoke-6'],
  },
]

// Neutral overlay channels — shown as rgba samples at a few alphas.
const OVERLAYS = [
  { name: 'overlay (fills, hairlines)', token: '--overlay-rgb', alphas: [0.04, 0.08, 0.12, 0.18] },
  { name: 'raise (specular highlights)', token: '--raise-rgb', alphas: [0.05, 0.10, 0.18, 0.22] },
]

const CHANNELS = ['--cs-primary-rgb', '--cs-on-surface-variant-rgb', '--cs-outline-rgb', '--cs-error-rgb', '--cs-tertiary-rgb', '--danger-rgb']

const TEXT_ROLES = [
  { role: 'displayLarge',    prefix: 'display-large',   sample: 'Display Large' },
  { role: 'displayMedium',   prefix: 'display-medium',  sample: 'Display Medium' },
  { role: 'displaySmall',    prefix: 'display-small',   sample: 'Display Small' },
  { role: 'headlineLarge',   prefix: 'headline-large',  sample: 'Headline Large' },
  { role: 'headlineMedium',  prefix: 'headline-medium', sample: 'Headline Medium' },
  { role: 'headlineSmall',   prefix: 'headline-small',  sample: 'Headline Small' },
  { role: 'titleLarge',      prefix: 'title-large',     sample: 'Title Large' },
  { role: 'titleMedium',     prefix: 'title-medium',    sample: 'Title Medium' },
  { role: 'titleSmall',      prefix: 'title-small',     sample: 'Title Small' },
  { role: 'bodyLarge',       prefix: 'body-large',      sample: 'Body Large — The quick brown fox jumps over the lazy dog' },
  { role: 'bodyMedium',      prefix: 'body-medium',     sample: 'Body Medium — The quick brown fox jumps over the lazy dog' },
  { role: 'bodySmall',       prefix: 'body-small',      sample: 'Body Small — The quick brown fox jumps over the lazy dog' },
  { role: 'labelLarge',      prefix: 'label-large',     sample: 'Label Large' },
  { role: 'labelMedium',     prefix: 'label-medium',    sample: 'Label Medium' },
  { role: 'labelSmall',      prefix: 'label-small',     sample: 'LABEL SMALL' },
]

const SPACING = [
  { token: '--sp-0',   px:  0, usage: '—' },
  { token: '--sp-1',   px:  4, usage: 'icon gap, dot divider' },
  { token: '--sp-2',   px:  8, usage: 'date cell gap, tight inline gap' },
  { token: '--sp-3',   px: 12, usage: 'compact section gap' },
  { token: '--sp-4',   px: 16, usage: 'screen h-padding, card padding, item list gap' },
  { token: '--sp-5',   px: 20, usage: 'card content side padding' },
  { token: '--sp-6',   px: 24, usage: 'calendar → schedule gap, section gap' },
  { token: '--sp-8',   px: 32, usage: 'large section divider' },
  { token: '--sp-10',  px: 40, usage: 'page top padding' },
  { token: '--sp-12',  px: 48, usage: 'page horizontal padding' },
  { token: '--sp-16',  px: 64, usage: 'vertical rhythm between major blocks' },
  { token: '--sp-20',  px: 80, usage: 'bottom nav height, hero vertical gap' },
]

const GRADIENTS = [
  { name: 'slateAccent',        var: '--gradient-slate-accent', desc: 'Selected date cell, active elements' },
  { name: 'carbonBase',         var: '--gradient-carbon-base',  desc: 'Deep surface backgrounds' },
  { name: 'vignetteTopRight',   var: '--gradient-vignette-tr',  desc: 'Atmospheric corner accent' },
  { name: 'vignetteBottomLeft', var: '--gradient-vignette-bl',  desc: 'Depth shadow in corners' },
]

// ─── helpers ──────────────────────────────────
// Read a token's resolved value for the active theme.
function cssValue(name) {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
// Parse a resolved color ("#rrggbb" or "rgb(r,g,b)") → [r,g,b] for luminance.
function parseRGB(str) {
  const hex = str.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16))
  const rgb = str.match(/(\d+)\D+(\d+)\D+(\d+)/)
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]]
  return null
}
function isLight(value) {
  const c = parseRGB(value)
  if (!c) return false
  return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 > 140
}

// ─────────────────────────────────────────────

export default function ThemePage() {
  const { theme } = useTheme()
  // re-read computed values whenever the theme flips
  const [, force] = useState(0)
  useEffect(() => { force(n => n + 1) }, [theme])

  return (
    <div style={{ padding: '40px 48px', maxWidth: 960, margin: '0 auto' }}>

      {/* ── Colors ── */}
      <Section title="ColorScheme" subtitle={`--cs-* · Material 3 · ${theme} theme · slate accent`}>
        {COLOR_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 32 }}>
            <GroupLabel>{group.label}</GroupLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {group.swatches.map((cssVar) => (
                <ColorSwatch key={cssVar} cssVar={cssVar} themeKey={theme} />
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ── Overlays + channels ── */}
      <Section title="Overlays & channels" subtitle="neutral overlays flip dark↔light · channels compose via rgba(var(--x), α)">
        {OVERLAYS.map((o) => (
          <div key={o.token} style={{ marginBottom: 20 }}>
            <GroupLabel>{o.name} · {o.token}</GroupLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {o.alphas.map((a) => (
                <div key={a} style={{
                  width: 86, height: 48, borderRadius: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 5,
                  background: `rgba(var(${o.token}),${a})`, border: '1px solid rgba(var(--cs-outline-rgb),0.30)',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--cs-on-surface-variant)' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <GroupLabel>channel triplets</GroupLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {CHANNELS.map((cssVar) => (
            <div key={cssVar} style={{ width: 150, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(var(--cs-outline-rgb),0.30)', flexShrink: 0 }}>
              <div style={{ height: 40, background: `rgba(var(${cssVar}),1)` }} />
              <div style={{ padding: '6px 8px', background: 'var(--cs-surface-container)' }}>
                <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--cs-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cssVar}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Text styles ── */}
      <Section title="TextTheme" subtitle="--tt-* · Inter 400/500 · M3 scale (customised)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TEXT_ROLES.map((t) => (
            <TextRow key={t.role} {...t} />
          ))}
        </div>
      </Section>

      {/* ── Spacing ── */}
      <Section title="Spacing" subtitle="--sp-* · 4 pt scale · used for padding and margin">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SPACING.map((s) => (
            <SpacingRow key={s.token} {...s} />
          ))}
        </div>
      </Section>

      {/* ── Gradients ── */}
      <Section title="Gradients" subtitle="--gradient-*">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {GRADIENTS.map((g) => (
            <GradientSwatch key={g.name} {...g} themeKey={theme} />
          ))}
        </div>
      </Section>

    </div>
  )
}

// ─── Sub-components ───────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(var(--cs-outline-rgb),0.30)' }}>
        <h2 style={{ fontFamily: 'var(--tt-font-family)', fontSize: 20, fontWeight: 500, color: 'var(--cs-on-surface)', letterSpacing: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, fontWeight: 400, color: 'var(--cs-on-surface-variant)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function GroupLabel({ children }) {
  return (
    <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', marginBottom: 10, opacity: 0.6 }}>
      {children}
    </p>
  )
}

function ColorSwatch({ cssVar }) {
  const value = cssValue(cssVar)
  const name = cssVar.replace(/^--cs-/, '').replace(/^--/, '')
  return (
    <div style={{ width: 120, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(var(--cs-outline-rgb),0.30)', flexShrink: 0 }}>
      <div style={{ height: 56, background: `var(${cssVar})`, position: 'relative' }}>
        <span style={{
          position: 'absolute', bottom: 6, right: 8, fontSize: 9, fontWeight: 500, fontFamily: 'monospace',
          color: isLight(value) ? 'rgba(var(--cs-shadow-rgb),0.55)' : 'rgba(var(--raise-rgb),0.5)', letterSpacing: '0.03em',
        }}>
          {value}
        </span>
      </div>
      <div style={{ padding: '6px 8px', background: 'var(--cs-surface-container)' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 500, color: 'var(--cs-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--cs-on-surface-variant)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.6 }}>{cssVar}</p>
      </div>
    </div>
  )
}

function TextRow({ role, prefix, sample }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(var(--cs-outline-rgb),0.15)' }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{role}</p>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.4, marginTop: 2 }}>--tt-{prefix}-*</p>
      </div>
      <span style={{
        fontFamily: 'var(--tt-font-family)',
        fontSize: `var(--tt-${prefix}-size)`,
        fontWeight: `var(--tt-${prefix}-weight)`,
        lineHeight: `var(--tt-${prefix}-height)`,
        letterSpacing: `var(--tt-${prefix}-tracking)`,
        color: 'var(--cs-on-surface)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {sample}
      </span>
    </div>
  )
}

function SpacingRow({ token, px, usage }) {
  const MAX_PX = 80
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '7px 0', borderBottom: '1px solid rgba(var(--cs-outline-rgb),0.15)' }}>
      <div style={{ width: 80, flexShrink: 0 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{token}</p>
      </div>
      <div style={{ width: 36, flexShrink: 0, textAlign: 'right' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{px}px</p>
      </div>
      <div style={{ width: 200, flexShrink: 0, height: 6, background: 'rgba(var(--cs-outline-rgb),0.25)', borderRadius: 3, overflow: 'hidden' }}>
        {px > 0 && (
          <div style={{ height: '100%', width: `${(px / MAX_PX) * 100}%`, background: 'var(--cs-primary)', borderRadius: 3, opacity: 0.7 }} />
        )}
      </div>
      <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 12, color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{usage}</p>
    </div>
  )
}

function GradientSwatch({ name, var: cssVar, desc }) {
  return (
    <div style={{ width: 200, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(var(--cs-outline-rgb),0.30)', flexShrink: 0 }}>
      <div style={{ height: 80, background: `var(${cssVar})` }} />
      <div style={{ padding: '8px 10px', background: 'var(--cs-surface-container)' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{name}</p>
        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--cs-on-surface-variant)', marginTop: 2, opacity: 0.6 }}>{cssVar}</p>
        <p style={{ fontFamily: 'var(--tt-font-family)', fontSize: 11, color: 'var(--cs-on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>{desc}</p>
      </div>
    </div>
  )
}
