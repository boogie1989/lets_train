// Meal data model + pure operations — everything to build a dish.
// Nutrition is computed by summing each ingredient's macros (entered for its
// amount); per-serving = total / servings.

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
export const UNITS = ['g', 'ml', 'pcs', 'cup', 'tbsp', 'tsp']
export const DIETS = ['High-protein', 'Low-carb', 'Keto', 'Balanced', 'Vegan', 'Vegetarian', 'Gluten-free', 'Dairy-free']

let _id = 100
const uid = () => ++_id
const move = (arr, from, to) => {
  if (to < 0 || to >= arr.length || from === to) return arr
  const next = [...arr]
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}

export const newIngredient = (over = {}) => ({ id: uid(), name: '', qty: 100, unit: 'g', kcal: 0, p: 0, c: 0, f: 0, ...over })

export function emptyMeal() {
  return { name: '', description: '', mealType: 'Lunch', servings: 1, prepMin: 10, cookMin: 15, tags: [], ingredients: [], steps: [] }
}

export function demoMeal() {
  return {
    name: 'Chicken & Rice Bowl',
    description: 'Simple high-protein bowl — meal-prep friendly.',
    mealType: 'Lunch', servings: 2, prepMin: 10, cookMin: 20,
    tags: ['High-protein', 'Gluten-free'],
    ingredients: [
      { id: uid(), name: 'Chicken breast', qty: 300, unit: 'g', kcal: 495, p: 93, c: 0, f: 11 },
      { id: uid(), name: 'Jasmine rice, cooked', qty: 300, unit: 'g', kcal: 390, p: 8, c: 84, f: 1 },
      { id: uid(), name: 'Broccoli', qty: 150, unit: 'g', kcal: 51, p: 4, c: 10, f: 1 },
      { id: uid(), name: 'Olive oil', qty: 1, unit: 'tbsp', kcal: 119, p: 0, c: 0, f: 14 },
    ],
    steps: [
      'Season the chicken with salt and pepper, sear 5–6 min per side until cooked through.',
      'Steam the broccoli for about 4 minutes — keep it bright and crisp.',
      'Slice the chicken, plate over the rice with broccoli, and drizzle with olive oil.',
    ],
  }
}

// ── meta ──
export const setField = (m, key, value) => ({ ...m, [key]: value })
export const setServings = (m, n) => ({ ...m, servings: Math.max(1, Math.min(20, n)) })
export const setMinutes = (m, key, n) => ({ ...m, [key]: Math.max(0, Math.min(600, n)) })

// ── ingredients ──
export const addIngredient = (m, over) => ({ ...m, ingredients: [...m.ingredients, newIngredient(over)] })
export const updateIngredient = (m, id, patch) => ({ ...m, ingredients: m.ingredients.map(i => (i.id === id ? { ...i, ...patch } : i)) })
export const removeIngredient = (m, id) => ({ ...m, ingredients: m.ingredients.filter(i => i.id !== id) })
export const moveIngredient = (m, from, to) => ({ ...m, ingredients: move(m.ingredients, from, to) })

// ── recipe steps ──
export const addStep = m => ({ ...m, steps: [...m.steps, ''] })
export const updateStep = (m, idx, value) => ({ ...m, steps: m.steps.map((s, i) => (i === idx ? value : s)) })
export const removeStep = (m, idx) => ({ ...m, steps: m.steps.filter((_, i) => i !== idx) })
export const moveStep = (m, from, to) => ({ ...m, steps: move(m.steps, from, to) })

// ── derived ──
export function computeNutrition(m) {
  const total = m.ingredients.reduce((a, i) => ({
    kcal: a.kcal + (+i.kcal || 0), p: a.p + (+i.p || 0), c: a.c + (+i.c || 0), f: a.f + (+i.f || 0),
  }), { kcal: 0, p: 0, c: 0, f: 0 })
  const s = Math.max(1, m.servings || 1)
  const per = { kcal: Math.round(total.kcal / s), p: Math.round(total.p / s), c: Math.round(total.c / s), f: Math.round(total.f / s) }
  return { total: { kcal: Math.round(total.kcal), p: Math.round(total.p), c: Math.round(total.c), f: Math.round(total.f) }, per }
}

export const totalMinutes = m => (m.prepMin || 0) + (m.cookMin || 0)
export const validateMeal = m => m.name.trim().length > 0 && m.ingredients.length > 0
