import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import mealsConfig from './configs/meals.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const ACCENT = '--cs-tertiary-rgb'   // channel triplet (composed via rgba below)
const MACRO_COLORS = { p: 'var(--cat-blue)', c: 'var(--cat-amber)', f: 'var(--cat-pink)' }
const DEFAULT_MEAL = mealsConfig.data[0]

// representative ingredient lists keyed loosely by meal name (mock content)
const INGREDIENTS = {
  default: ['Olive oil', 'Sea salt', 'Black pepper', 'Fresh herbs'],
}
function ingredientsFor(meal) {
  const map = {
    'Greek Yogurt Bowl': ['Greek yogurt', 'Granola', 'Mixed berries', 'Honey'],
    'Chicken & Rice': ['Chicken breast', 'Jasmine rice', 'Broccoli', 'Olive oil'],
    'Salmon & Greens': ['Salmon fillet', 'Mixed greens', 'Avocado', 'Lemon'],
    'Protein Shake': ['Whey protein', 'Banana', 'Almond milk', 'Peanut butter'],
    'Tofu Stir-Fry': ['Firm tofu', 'Brown rice', 'Bell peppers', 'Soy sauce'],
    'Oatmeal & Berries': ['Rolled oats', 'Blueberries', 'Almond milk', 'Chia seeds'],
    'Turkey Wrap': ['Turkey breast', 'Whole-wheat wrap', 'Lettuce', 'Hummus'],
    'Avocado Egg Toast': ['Sourdough', 'Avocado', 'Eggs', 'Chili flakes'],
  }
  return map[meal.name] ?? INGREDIENTS.default
}

export function MealPreviewView({ meal = DEFAULT_MEAL, onClose, cta = '+ Add to plan' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* hero */}
      <div style={{ height: 240, flexShrink: 0, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, rgba(var(${ACCENT}),0.22) 0%, rgba(var(${ACCENT}),0.02) 100%), var(--cs-surface-container)` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}><StatusBar /></div>
        <button onClick={onClose} style={glassBtn}><ChevronLeft /></button>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={`rgba(var(${ACCENT}),1)`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" />
            <path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" />
          </svg>
          <span style={{ ...TT, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: `rgba(var(${ACCENT}),1)`, opacity: 0.8 }}>{meal.mealType}</span>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ ...TT, fontSize: 22, fontWeight: 500, lineHeight: 1.2, color: 'var(--cs-on-surface)', flex: 1 }}>{meal.name}</span>
          <span style={{ ...TT, padding: '5px 12px', borderRadius: 'var(--radius-2xl)', flexShrink: 0, background: 'rgba(var(--cs-primary-rgb),0.12)', border: '1px solid rgba(var(--cs-primary-rgb),0.22)', fontSize: 12, fontWeight: 500, color: 'var(--cs-primary)' }}>{meal.mealType}</span>
        </div>

        {/* macro block */}
        <div style={{ padding: '16px', background: 'var(--glass-low-bg)', borderRadius: 'var(--radius-2xl)', border: '1px solid rgba(var(--cs-outline-rgb),0.20)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ ...TT, fontSize: 30, fontWeight: 600, color: 'var(--cs-on-surface)', lineHeight: 1 }}>{meal.kcal}</span>
            <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)' }}>kcal</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Macro label="Protein" g={meal.p} color={MACRO_COLORS.p} total={meal.p + meal.c + meal.f} />
            <Macro label="Carbs"   g={meal.c} color={MACRO_COLORS.c} total={meal.p + meal.c + meal.f} />
            <Macro label="Fat"     g={meal.f} color={MACRO_COLORS.f} total={meal.p + meal.c + meal.f} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={chip}>{meal.diet}</span>
          <span style={chip}>{meal.prep} min prep</span>
        </div>

        <Block title="Ingredients">
          {ingredientsFor(meal).map(ing => (
            <div key={ing} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'rgba(var(--overlay-rgb),0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(var(--cs-outline-rgb),0.18)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${ACCENT}),1)`, opacity: 0.7, flexShrink: 0 }} />
              <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface)' }}>{ing}</span>
            </div>
          ))}
        </Block>
        <div style={{ height: 8 }} />
      </div>

      <Footer label={cta} onClick={onClose} />
    </div>
  )
}

export default function MealPreviewScreen(props) {
  return <PhoneFrame smokeVariant="shader"><MealPreviewView {...props} /></PhoneFrame>
}

// ── shared bits ──
function Macro({ label, g, color, total }) {
  const pct = total ? Math.round((g / total) * 100) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
        <span style={{ ...TT, fontSize: 16, fontWeight: 600, color: 'var(--cs-on-surface)' }}>{g}</span>
        <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>g</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, opacity: 0.8 }} />
      </div>
      <span style={{ ...TT, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{label}</span>
    </div>
  )
}
function Block({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ ...TT, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.55 }}>{title}</span>
      {children}
    </div>
  )
}
function Footer({ label, onClick }) {
  return (
    <div style={{ padding: '12px 16px 24px', flexShrink: 0, background: 'var(--glass-low-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(var(--cs-outline-rgb),0.20)' }}>
      <button onClick={onClick} style={{ ...TT, width: '100%', height: 50, borderRadius: 'var(--radius-2xl)', cursor: 'pointer', background: 'linear-gradient(180deg, rgba(var(--raise-rgb),0.09) 0%, rgba(var(--cs-shadow-rgb),0.08) 100%), var(--cs-primary)', border: '1px solid rgba(var(--overlay-rgb),0.18)', color: 'var(--cs-on-primary)', fontSize: 15, fontWeight: 500, boxShadow: 'inset 0 1px 0 rgba(var(--raise-rgb),0.22), 0 8px 24px rgba(var(--cs-primary-rgb),0.22)' }}>{label}</button>
    </div>
  )
}
const chip = { ...TT, padding: '6px 12px', borderRadius: 'var(--radius-2xl)', background: 'var(--glass-control-strong)', border: '1px solid rgba(var(--cs-outline-rgb),0.35)', fontSize: 12, fontWeight: 500, color: 'var(--cs-on-surface-variant)' }
const glassBtn = { position: 'absolute', top: 58, left: 16, width: 44, height: 44, borderRadius: 'var(--radius-2xl)', padding: 0, background: 'var(--glass-control)', border: '1px solid rgba(var(--cs-outline-rgb),0.50)', boxShadow: '0 4px 16px rgba(var(--cs-shadow-rgb),0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cs-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
  )
}
