import { useState } from 'react'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import NavBar from '../../components/NavBar.jsx'
import SurfaceContainer from '../../components/SurfaceContainer.jsx'
import IconButton from '../../components/IconButton.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import FabMenu from '../../components/FabMenu.jsx'
import Segmented from '../../components/Segmented.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import TitleDescription from '../../components/TitleDescription.jsx'
import TagField, { TagPickerSheet } from '../../components/TagField.jsx'
import Stepper from '../../components/Stepper.jsx'
import * as M from './mealModel.js'
import { ChevLeftIcon, CheckIcon, PlusIcon, XIcon, ChevDownIcon, GripIcon, CameraIcon } from './icons.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }
const MORPH = 'cubic-bezier(0.4,0,0.2,1)'
const MACROS = [
  { key: 'p', label: 'Protein', ch: '--cat-blue-rgb' },
  { key: 'c', label: 'Carbs', ch: '--cat-amber-rgb' },
  { key: 'f', label: 'Fat', ch: '--cat-pink-rgb' },
]

const labelSt = { ...TT, display: 'block', marginBottom: 8, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45 }
const addBtnSt = { ...TT, width: '100%', height: 44, borderRadius: 'var(--radius-2xl)', border: '1.5px dashed rgba(var(--overlay-rgb),0.14)', background: 'rgba(var(--overlay-rgb),0.02)', color: 'var(--cs-on-surface-variant)', opacity: 0.75, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }
const fieldBoxSt = { display: 'flex', alignItems: 'baseline', gap: 4, padding: '9px 11px', borderRadius: 'var(--radius-lg)', background: 'rgba(var(--overlay-rgb),0.05)', boxShadow: 'var(--shadow-glass-low)' }
const bareInputSt = { ...TT, width: '100%', minWidth: 0, fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', background: 'none', border: 'none', outline: 'none', padding: 0 }
const num = v => (v === '' || v == null ? 0 : Math.max(0, +v))

export default function MealBuilderScreen({ initialStep = 'edit' }) {
  const [meal, setMeal] = useState(() => (initialStep === 'empty' ? M.emptyMeal() : M.demoMeal()))
  const [expanded, setExpanded] = useState(initialStep === 'ingredient' ? -1 : null) // ingredient id, or -1 = last
  const [tagOpen, setTagOpen] = useState(false)
  const [removeAsk, setRemoveAsk] = useState(null) // { kind:'ingredient'|'step', id|idx, name }
  const [perServing, setPerServing] = useState(true)
  const [dragIng, setDragIng] = useState(null)
  const [dragStep, setDragStep] = useState(null)

  const nut = M.computeNutrition(meal)
  const shown = perServing ? nut.per : nut.total
  const macroTotal = shown.p + shown.c + shown.f
  const expandedId = expanded === -1 ? meal.ingredients[meal.ingredients.length - 1]?.id : expanded

  const [fabOpen, setFabOpen] = useState(false)

  const up = patch => setMeal(m => ({ ...m, ...patch }))
  const upIng = (id, patch) => setMeal(m => M.updateIngredient(m, id, patch))

  return (
    <PhoneFrame smokeVariant="shader">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <NavBar>
          <StatusBar />
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px', gap: 8 }}>
            <IconButton size="md" icon={<ChevLeftIcon />} aria-label="Back" />
            <span style={{ ...TT, flex: 1, fontSize: 16, fontWeight: 500, color: 'var(--cs-on-surface)', textAlign: 'center' }}>{initialStep === 'empty' ? 'New Meal' : 'Edit Meal'}</span>
            <div style={{ width: 44, flexShrink: 0 }} />
          </div>
        </NavBar>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 92px' }}>

          {/* ── Cover photo (stub) ── */}
          <button style={{
            width: '100%', height: 138, marginTop: 12, borderRadius: 'var(--radius-3xl)', cursor: 'pointer', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: 'linear-gradient(150deg, rgba(var(--cs-tertiary-rgb),0.20) 0%, rgba(var(--cs-tertiary-rgb),0.04) 100%), var(--cs-surface-container)',
            border: '1px dashed rgba(var(--cs-outline-rgb),0.30)', boxShadow: 'var(--shadow-glass-low)', color: 'var(--cs-on-surface-variant)',
          }}>
            <CameraIcon />
            <span style={{ ...TT, fontSize: 12.5, fontWeight: 500 }}>Add cover photo</span>
          </button>

          {/* ── Details ── */}
          <SurfaceContainer level="Low" style={{ padding: '14px 16px', margin: '14px 0' }}>
            <TitleDescription
              name={meal.name} onNameChange={v => up({ name: v })} namePlaceholder="Meal name"
              description={meal.description} onDescriptionChange={v => up({ description: v })} descriptionPlaceholder="Add a short description…"
            />
            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '11px 0 14px' }} />

            <span style={labelSt}>Meal type</span>
            <div style={{ marginBottom: 16 }}>
              <Segmented options={M.MEAL_TYPES.map(t => ({ id: t, label: t }))} value={meal.mealType} onChange={t => up({ mealType: t })} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Stepper label="Servings" value={meal.servings} onChange={n => setMeal(m => M.setServings(m, n))} />
              <Stepper label="Prep" value={meal.prepMin} suffix="m" step={5} onChange={n => setMeal(m => M.setMinutes(m, 'prepMin', n))} />
              <Stepper label="Cook" value={meal.cookMin} suffix="m" step={5} onChange={n => setMeal(m => M.setMinutes(m, 'cookMin', n))} />
            </div>

            <div style={{ height: 1, background: 'rgba(var(--overlay-rgb),0.06)', margin: '0 0 14px' }} />
            <TagField tags={meal.tags} onOpen={() => setTagOpen(true)} />
          </SurfaceContainer>

          {/* ── Nutrition (auto) ── */}
          <SurfaceContainer level="Low" style={{ padding: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ ...TT, fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>Nutrition</span>
              <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 'var(--radius-2xl)', background: 'rgba(var(--overlay-rgb),0.05)', border: '1px solid rgba(var(--overlay-rgb),0.08)' }}>
                {[['per', 'Per serving'], ['total', 'Total']].map(([k, lbl]) => {
                  const on = (k === 'per') === perServing
                  return <button key={k} onClick={() => setPerServing(k === 'per')} style={{ ...TT, padding: '4px 10px', borderRadius: 'calc(var(--radius-2xl) - 2px)', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: on ? 'rgba(var(--cs-primary-rgb),0.16)' : 'transparent', color: on ? 'var(--cs-primary)' : 'var(--cs-on-surface-variant)' }}>{lbl}</button>
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <span style={{ ...TT, fontSize: 30, fontWeight: 500, lineHeight: 1, color: 'var(--cs-on-surface)' }}>{shown.kcal.toLocaleString()}</span>
              <span style={{ ...TT, fontSize: 13, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>kcal{perServing ? ' / serving' : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {MACROS.map(mc => {
                const g = shown[mc.key]
                const pct = macroTotal ? Math.round((g / macroTotal) * 100) : 0
                return (
                  <div key={mc.key} style={{ flex: 1 }}>
                    <span style={{ ...TT, display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--cs-on-surface)', marginBottom: 6 }}>{g}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--cs-on-surface-variant)' }}>g</span></span>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(var(--overlay-rgb),0.06)', overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `rgba(var(${mc.ch}),1)`, opacity: 0.85 }} />
                    </div>
                    <span style={{ ...TT, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.5 }}>{mc.label}</span>
                  </div>
                )
              })}
            </div>
          </SurfaceContainer>

          {/* ── Ingredients ── */}
          <SectionLabel count={meal.ingredients.length} style={{ display: 'flex', margin: '0 2px 10px' }}>Ingredients</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {meal.ingredients.map((ing, i) => (
              <IngredientRow key={ing.id} ing={ing} open={expandedId === ing.id}
                onToggle={() => setExpanded(expandedId === ing.id ? null : ing.id)}
                onChange={patch => upIng(ing.id, patch)}
                onRemove={() => setRemoveAsk({ kind: 'ingredient', id: ing.id, name: ing.name || 'this ingredient' })}
                draggable onDragStart={() => setDragIng(i)} onDragEnter={() => { if (dragIng != null && dragIng !== i) { setMeal(m => M.moveIngredient(m, dragIng, i)); setDragIng(i) } }} onDrop={() => setDragIng(null)} />
            ))}
          </div>
          <button onClick={() => { setMeal(m => M.addIngredient(m)); setExpanded(-1) }} style={addBtnSt}><PlusIcon size={12} /> Add ingredient</button>

          {/* ── Recipe ── */}
          <div style={{ marginTop: 22 }}>
            <SectionLabel count={meal.steps.length ? `${meal.steps.length} steps` : null} style={{ display: 'flex', margin: '0 2px 10px' }}>Recipe</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {meal.steps.map((s, i) => (
              <SurfaceContainer level="Low" key={i} draggable onDragStart={() => setDragStep(i)} onDragEnter={() => { if (dragStep != null && dragStep !== i) { setMeal(m => M.moveStep(m, dragStep, i)); setDragStep(i) } }} onDragOver={e => e.preventDefault()} onDrop={() => setDragStep(null)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 10px 11px 8px' }}>
                <span style={{ color: 'rgba(var(--cs-primary-rgb),0.4)', flexShrink: 0, marginTop: 4 }}><GripIcon /></span>
                <span style={{ width: 24, height: 24, flexShrink: 0, marginTop: 1, borderRadius: '50%', border: '1.5px solid rgba(var(--cs-primary-rgb),0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...TT, fontSize: 11, fontWeight: 500, color: 'var(--cs-primary)' }}>{i + 1}</span>
                <textarea value={s} onChange={e => setMeal(m => M.updateStep(m, i, e.target.value))} placeholder="Describe this step…" rows={2}
                  style={{ ...TT, flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--cs-on-surface)', background: 'none', border: 'none', outline: 'none', resize: 'none', padding: '2px 0' }} />
                <button onClick={() => setMeal(m => M.removeStep(m, i))} style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', flexShrink: 0, padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(var(--cs-primary-rgb),0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={12} /></button>
              </SurfaceContainer>
            ))}
          </div>
          <button onClick={() => setMeal(m => M.addStep(m))} style={addBtnSt}><PlusIcon size={12} /> Add step</button>
        </div>

        {/* footer — page-action FabMenu (Save lives inside it) */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'linear-gradient(0deg, rgba(var(--cs-surface-rgb),0.94) 60%, transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FabMenu open={fabOpen} setOpen={setFabOpen} actions={[
              { label: 'Add ingredient', icon: <PlusIcon size={15} />, onClick: () => { setMeal(m => M.addIngredient(m)); setExpanded(-1) } },
              { label: 'Add step', icon: <PlusIcon size={15} />, onClick: () => setMeal(m => M.addStep(m)) },
              { label: 'Save Meal', icon: <CheckIcon />, primary: true, dividerAbove: true, onClick: () => { /* stub — save */ } },
            ]} />
          </div>
        </div>

        {/* tag picker — shared bottom sheet (search · create · multi-select) */}
        <TagPickerSheet open={tagOpen} onClose={() => setTagOpen(false)}
          tags={meal.tags} onChange={next => up({ tags: next })} presets={M.DIETS} title="Diet & tags" />

        {/* remove confirm — container-transform morph in */}
        {removeAsk && (
          <div onClick={() => setRemoveAsk(null)} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(var(--cs-shadow-rgb),0.55)' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', animation: `mb-morph 0.32s ${MORPH}` }}>
              <ConfirmDialog title="Remove ingredient?" message={`Remove ${removeAsk.name} from this meal.`} confirmLabel="Remove" cancelLabel="Cancel" destructive
                onCancel={() => setRemoveAsk(null)}
                onConfirm={() => { setMeal(m => M.removeIngredient(m, removeAsk.id)); setRemoveAsk(null) }} />
            </div>
          </div>
        )}

        <style>{`@keyframes mb-morph { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }`}</style>
      </div>
    </PhoneFrame>
  )
}

// ── meta stepper (servings / prep / cook) ──
// ── ingredient row (collapsed summary → expandable editor) ──
function IngredientRow({ ing, open, onToggle, onChange, onRemove, ...drag }) {
  return (
    <SurfaceContainer level="Low" {...drag} onDragOver={e => e.preventDefault()} style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 8px 11px 8px' }}>
        <span style={{ color: 'rgba(var(--cs-primary-rgb),0.4)', flexShrink: 0, padding: '0 2px' }}><GripIcon /></span>
        <button onClick={onToggle} style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...TT, display: 'block', fontSize: 14, fontWeight: 500, color: ing.name ? 'var(--cs-on-surface)' : 'var(--cs-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ing.name || 'New ingredient'}</span>
            <span style={{ ...TT, display: 'block', fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6, marginTop: 1 }}>{ing.qty} {ing.unit}{ing.kcal ? ` · ${ing.kcal} kcal` : ''}</span>
          </span>
          <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)', opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><ChevDownIcon /></span>
        </button>
        <button onClick={onRemove} style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', flexShrink: 0, padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(var(--cs-primary-rgb),0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={12} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '2px 12px 14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Field label="Name"><input value={ing.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. Chicken breast" style={{ ...bareInputSt, padding: '9px 11px', borderRadius: 'var(--radius-lg)', background: 'rgba(var(--overlay-rgb),0.05)', boxShadow: 'var(--shadow-glass-low)' }} /></Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <Field label="Amount" style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ ...fieldBoxSt, flex: 1 }}><input type="number" value={ing.qty} onChange={e => onChange({ qty: num(e.target.value) })} style={bareInputSt} /></div>
                  <UnitField value={ing.unit} onChange={u => onChange({ unit: u })} />
                </div>
              </Field>
              <Field label="Calories" style={{ width: 120 }}>
                <div style={fieldBoxSt}><input type="number" value={ing.kcal} onChange={e => onChange({ kcal: num(e.target.value) })} style={bareInputSt} /><span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>kcal</span></div>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {MACROS.map(mc => (
                <Field key={mc.key} label={mc.label} style={{ flex: 1 }}>
                  <div style={fieldBoxSt}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(var(${mc.ch}),1)`, flexShrink: 0, alignSelf: 'center' }} />
                    <input type="number" value={ing[mc.key]} onChange={e => onChange({ [mc.key]: num(e.target.value) })} style={bareInputSt} />
                    <span style={{ ...TT, fontSize: 11, color: 'var(--cs-on-surface-variant)', opacity: 0.6 }}>g</span>
                  </div>
                </Field>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SurfaceContainer>
  )
}

function Field({ label, children, style }) {
  return <div style={{ minWidth: 0, ...style }}><span style={labelSt}>{label}</span>{children}</div>
}

function UnitField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{ ...TT, ...fieldBoxSt, alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--cs-on-surface)' }}>
        {value} <span style={{ display: 'flex', color: 'var(--cs-on-surface-variant)' }}><ChevDownIcon size={13} /></span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 61, minWidth: 78, background: 'var(--glass-popover)', border: '1px solid rgba(var(--overlay-rgb),0.10)', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 28px rgba(var(--cs-shadow-rgb),0.5)', padding: 4, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            {M.UNITS.map(u => (
              <button key={u} onClick={() => { onChange(u); setOpen(false) }} style={{ ...TT, width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: u === value ? 'rgba(var(--cs-primary-rgb),0.14)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: u === value ? 500 : 400, color: u === value ? 'var(--cs-primary)' : 'var(--cs-on-surface)' }}>{u}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
