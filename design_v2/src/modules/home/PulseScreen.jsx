import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import {
  TT, NUM, card, Ring, Bars, PlayIcon, BarbellIcon, FlameIcon, HeartIcon, TrendIcon, HomeFab,
} from './homeShared.jsx'
import {
  nextWorkout, stats, nut, readinessPct, tier, recoveryHours,
  weekTonnage, weekTonnageTotal, weekTrendPct, weekSessions,
} from './homeData.js'

// CONCEPT "Pulse" — the home screen is STATE & PROGRESS. A big readiness score,
// three activity rings (Train / Fuel / Recover), one "up next" action, and a week
// trend. Data-forward for advanced/pro users (Whoop/Oura logic).
const TABS = ['Today', 'Week', 'Trends']

export default function PulseScreen() {
  const [tab, setTab] = useState('Today')
  return (
    <PhoneFrame>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* hero readiness score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 8 }}>
          <Ring size={156} stroke={12} value={readinessPct / 100} color="var(--cs-tertiary)">
            <span style={{ ...NUM, fontSize: 46, fontWeight: 500, color: 'var(--cs-on-surface)', lineHeight: 1 }}>{readinessPct}</span>
            <span style={{ ...TT, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)' }}>Readiness</span>
          </Ring>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cs-tertiary)' }}>
            <HeartIcon s={15} />
            <span style={{ ...TT, fontSize: 14, fontWeight: 500 }}>{tier} · ready to train</span>
          </span>
        </div>

        {/* three activity rings */}
        <div style={{ ...card, padding: '18px 12px', display: 'flex', justifyContent: 'space-around' }}>
          <MiniRing value={stats.wDone / stats.wTotal} color="var(--cs-primary)" icon={<BarbellIcon s={15} />}
            big={`${stats.wDone}/${stats.wTotal}`} label="Train" />
          <MiniRing value={nut.kcal / nut.goal} color="var(--cat-amber)" icon={<FlameIcon s={15} />}
            big={nut.kcal.toLocaleString()} label="Fuel · kcal" />
          <MiniRing value={recoveryHours / 8} color="var(--cat-violet)" icon={<HeartIcon s={14} />}
            big={`${recoveryHours}h`} label="Recover" />
        </div>

        {/* up next action */}
        <div style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', flexShrink: 0, background: 'rgba(var(--cs-primary-rgb),0.14)', color: 'var(--cs-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarbellIcon s={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...TT, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)' }}>Up next · {nextWorkout.time}</p>
            <p style={{ ...NUM, fontSize: 16, fontWeight: 500, color: 'var(--cs-on-surface)', marginTop: 2 }}>{nextWorkout.title} · {nextWorkout.exerciseCount} ex</p>
          </div>
          <button style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', flexShrink: 0, border: 'none', cursor: 'pointer', background: 'var(--cs-primary)', color: 'var(--cs-on-primary)', boxShadow: 'var(--elev-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Start">
            <PlayIcon s={15} />
          </button>
        </div>

        {/* week trend */}
        <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>This week</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--cs-tertiary)' }}>
              <TrendIcon s={14} /><span style={{ ...NUM, fontSize: 12, fontWeight: 500 }}>+{weekTrendPct}%</span>
            </span>
          </div>
          <Bars data={weekTonnage} color="var(--cs-primary)" height={42} />
          <div style={{ display: 'flex', gap: 24 }}>
            <Stat value={`${weekTonnageTotal.toFixed(1)} t`} label="tonnage" />
            <Stat value={weekSessions} label="sessions" />
            <Stat value="on track" label="vs plan" />
          </div>
        </div>
      </div>

      {/* bottom tabs */}
      <div style={{ flexShrink: 0, padding: '10px 20px 26px', background: 'linear-gradient(0deg, var(--surface-0) 70%, transparent)' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, height: 38, borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--cs-primary)' : 'transparent',
              color: tab === t ? 'var(--cs-on-primary)' : 'var(--cs-on-surface-variant)',
              fontFamily: 'var(--tt-font-family)', fontSize: 13, fontWeight: 500,
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', right: 20, bottom: 92 }}><HomeFab /></div>
    </PhoneFrame>
  )
}

function MiniRing({ value, color, icon, big, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Ring size={72} stroke={7} value={value} color={color}>
        <span style={{ display: 'flex', color }}>{icon}</span>
      </Ring>
      <div style={{ textAlign: 'center' }}>
        <p style={{ ...NUM, fontSize: 15, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{big}</p>
        <p style={{ ...TT, fontSize: 10, color: 'var(--cs-on-surface-variant)', opacity: 0.8, marginTop: 1 }}>{label}</p>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...NUM, fontSize: 15, fontWeight: 500, color: 'var(--cs-on-surface)' }}>{value}</span>
      <span style={{ ...TT, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.7 }}>{label}</span>
    </div>
  )
}
