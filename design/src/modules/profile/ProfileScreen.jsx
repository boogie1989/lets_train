import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import NavBar from '../../components/NavBar.jsx'
import GlassCard from '../../components/GlassCard.jsx'
import { GearIcon, UserGlyph, DumbbellIcon, FlameIcon, ClockIcon, ChevRightIcon, EditIcon, HelpIcon, LogOutIcon } from './icons.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }

const iconBtnSt = { width: 40, height: 40, borderRadius: 'var(--radius-2xl)', flexShrink: 0, background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: 'var(--cs-on-surface-variant)' }
const primaryBtnSt = { ...TT, fontWeight: 500, color: 'var(--cs-on-primary)', cursor: 'pointer', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)' }
const ghostBtnSt = { ...TT, fontWeight: 500, cursor: 'pointer', background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.10)', color: 'var(--cs-on-surface)' }
const labelSt = { ...TT, display: 'block', margin: '0 2px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }

// demo content
const USER = { name: 'Serhii Buhai', email: 'serhii.work@gmail.com', initials: 'SB', plan: 'Free plan' }
const WK = { workouts: 4, streak: 6, time: '3h 20m', bars: [1, 0, 1, 0, 1, 1, 0] }
const NUT = { kcal: 1840, goal: 2200, p: 132, c: 180, f: 58 }

function Avatar({ authed }) {
  return (
    <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, padding: 2.5, display: 'flex', background: authed ? 'var(--gradient-slate-accent)' : 'rgba(var(--overlay-rgb),0.10)' }}>
      <div style={{ flex: 1, borderRadius: '50%', background: 'var(--cs-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: authed ? 'var(--cs-on-surface)' : 'var(--cs-on-surface-variant)' }}>
        {authed ? <span style={{ ...TT, fontSize: 24, fontWeight: 600 }}>{USER.initials}</span> : <UserGlyph />}
      </div>
    </div>
  )
}

function StatTile({ icon, ch, value, label, muted }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9, padding: '12px 12px 13px', borderRadius: 'var(--radius-xl)', background: 'rgba(var(--overlay-rgb),0.03)', border: '1px solid rgba(var(--overlay-rgb),0.06)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(var(${ch}),0.14)`, color: muted ? 'var(--cs-on-surface-variant)' : `rgba(var(${ch}),1)`, opacity: muted ? 0.5 : 1 }}>{icon}</span>
      <div>
        <div style={{ ...TT, fontSize: 18, fontWeight: 600, lineHeight: 1.1, color: muted ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)', opacity: muted ? 0.5 : 1 }}>{muted ? '—' : value}</div>
        <div style={{ ...TT, fontSize: 10.5, color: 'var(--cs-on-surface-variant)', opacity: 0.55, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

function WeekBars({ bars, muted }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ width: '100%', height: 34, borderRadius: 6, background: 'rgba(var(--overlay-rgb),0.05)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: (!muted && bars[i]) ? '100%' : '0%', borderRadius: 6, background: 'var(--cs-primary)', opacity: 0.85, transition: 'height 0.25s' }} />
          </div>
          <span style={{ ...TT, fontSize: 9, color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}>{d}</span>
        </div>
      ))}
    </div>
  )
}

function MacroBar({ label, g, ch, total, muted }) {
  const pct = total ? Math.round((g / total) * 100) : 0
  return (
    <div style={{ flex: 1 }}>
      <span style={{ ...TT, display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, color: muted ? 'var(--cs-on-surface-variant)' : 'var(--cs-on-surface)', opacity: muted ? 0.5 : 1 }}>{muted ? '—' : `${g}g`}</span>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: muted ? '0%' : `${pct}%`, height: '100%', background: `rgba(var(${ch}),1)`, opacity: 0.85 }} />
      </div>
      <span style={{ ...TT, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{label}</span>
    </div>
  )
}

function Divider() { return <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '0 12px' }} /> }
function AccountRow({ icon, label, danger, onClick }) {
  return (
    <button onClick={onClick} style={{ ...TT, width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(var(--cs-error-rgb),0.12)' : 'rgba(var(--overlay-rgb),0.05)', color: danger ? 'rgba(var(--cs-error-rgb),0.9)' : 'var(--cs-on-surface-variant)' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? 'rgba(var(--cs-error-rgb),0.9)' : 'var(--cs-on-surface)' }}>{label}</span>
      {!danger && <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4 }}><ChevRightIcon /></span>}
    </button>
  )
}

export default function ProfileScreen({ initialAuthed = true }) {
  const [authed, setAuthed] = useState(initialAuthed)
  const macroTotal = NUT.p + NUT.c + NUT.f
  const kcalPct = Math.min(100, Math.round((NUT.kcal / NUT.goal) * 100))

  return (
    <PhoneFrame smokeVariant="minimal">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <NavBar>
          <StatusBar />
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px', gap: 8 }}>
            <span style={{ ...TT, flex: 1, fontSize: 20, fontWeight: 600, color: 'var(--cs-on-surface)' }}>Profile</span>
            <button style={iconBtnSt} aria-label="Settings"><GearIcon /></button>
          </div>
        </NavBar>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>

          {/* ── Identity hero (anon vs authed) ── */}
          <GlassCard level="Low" style={{ padding: authed ? '16px' : '22px 16px 16px', marginBottom: 18 }}>
            {authed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar authed />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...TT, fontSize: 18, fontWeight: 600, color: 'var(--cs-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.name}</div>
                  <div style={{ ...TT, fontSize: 12.5, color: 'var(--cs-on-surface-variant)', opacity: 0.7, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.email}</div>
                  <span style={{ ...TT, display: 'inline-block', marginTop: 9, fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--cs-primary-rgb),0.14)', border: '1px solid rgba(var(--cs-primary-rgb),0.30)', color: 'var(--cs-primary)' }}>{USER.plan}</span>
                </div>
                <button aria-label="Edit profile" style={{ ...iconBtnSt, width: 36, height: 36, boxShadow: 'none', background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.09)' }}><EditIcon /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                <Avatar authed={false} />
                <div style={{ ...TT, fontSize: 18, fontWeight: 600, color: 'var(--cs-on-surface)', marginTop: 10 }}>You're a guest</div>
                <p style={{ ...TT, fontSize: 13, lineHeight: 1.5, color: 'var(--cs-on-surface-variant)', opacity: 0.7, margin: '0 0 8px', maxWidth: 260 }}>Create an account to sync your workouts, plans & progress across devices.</p>
                <button onClick={() => setAuthed(true)} style={{ ...primaryBtnSt, width: '100%', height: 48, borderRadius: 'var(--radius-2xl)', fontSize: 15 }}>Create account</button>
                <button onClick={() => setAuthed(true)} style={{ ...ghostBtnSt, width: '100%', height: 46, borderRadius: 'var(--radius-2xl)', fontSize: 14, marginTop: 8 }}>Log in</button>
              </div>
            )}
          </GlassCard>

          {/* ── Workout stats ── */}
          <span style={labelSt}>Workouts · this week</span>
          <GlassCard level="Low" style={{ padding: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <StatTile icon={<DumbbellIcon />} ch="--cs-primary-rgb" value={WK.workouts} label="Workouts" muted={!authed} />
              <StatTile icon={<FlameIcon />} ch="--cat-amber-rgb" value={`${WK.streak}d`} label="Streak" muted={!authed} />
              <StatTile icon={<ClockIcon />} ch="--cat-blue-rgb" value={WK.time} label="Active time" muted={!authed} />
            </div>
            <WeekBars bars={WK.bars} muted={!authed} />
          </GlassCard>

          {/* ── Nutrition stats ── */}
          <span style={labelSt}>Nutrition · today</span>
          <GlassCard level="Low" style={{ padding: 16, marginBottom: authed ? 18 : 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...TT, fontSize: 28, fontWeight: 600, lineHeight: 1, color: authed ? 'var(--cs-on-surface)' : 'var(--cs-on-surface-variant)', opacity: authed ? 1 : 0.5 }}>{authed ? NUT.kcal.toLocaleString() : '—'}</span>
                <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>/ {NUT.goal.toLocaleString()} kcal</span>
              </div>
              {authed && <span style={{ ...TT, fontSize: 11, fontWeight: 600, color: 'var(--cs-tertiary)' }}>{kcalPct}%</span>}
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: authed ? `${kcalPct}%` : '0%', height: '100%', borderRadius: 3, background: 'var(--cs-tertiary)', opacity: 0.85 }} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <MacroBar label="Protein" g={NUT.p} ch="--cat-blue-rgb" total={macroTotal} muted={!authed} />
              <MacroBar label="Carbs" g={NUT.c} ch="--cat-amber-rgb" total={macroTotal} muted={!authed} />
              <MacroBar label="Fat" g={NUT.f} ch="--cat-pink-rgb" total={macroTotal} muted={!authed} />
            </div>
          </GlassCard>

          {/* ── Account (authed) / sign-in nudge (anon) ── */}
          {authed ? (
            <>
              <span style={labelSt}>Account</span>
              <GlassCard level="Low" style={{ padding: 4, overflow: 'hidden' }}>
                <AccountRow icon={<EditIcon />} label="Edit profile" onClick={() => {}} />
                <Divider />
                <AccountRow icon={<GearIcon size={16} />} label="Settings" onClick={() => {}} />
                <Divider />
                <AccountRow icon={<HelpIcon />} label="Help & support" onClick={() => {}} />
                <Divider />
                <AccountRow icon={<LogOutIcon />} label="Log out" danger onClick={() => setAuthed(false)} />
              </GlassCard>
            </>
          ) : (
            <p style={{ ...TT, textAlign: 'center', fontSize: 11.5, lineHeight: 1.5, color: 'var(--cs-on-surface-variant)', opacity: 0.45, margin: '8px 12px 0' }}>
              Your stats stay empty until you sign in — then we track every workout and meal automatically.
            </p>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
