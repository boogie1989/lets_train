import { Card, Thumb, CardBody, MetaTag } from '../shared.jsx'

const DATA = [
  { id: 1, name: 'Greek Yogurt Bowl',    kcal: 320, p: 24, c: 38, f: 8,  mealType: 'Breakfast', diet: 'High-protein', prep: 5  },
  { id: 2, name: 'Chicken & Rice',       kcal: 560, p: 45, c: 62, f: 12, mealType: 'Lunch',     diet: 'Balanced',     prep: 25 },
  { id: 3, name: 'Salmon & Greens',      kcal: 480, p: 38, c: 14, f: 28, mealType: 'Dinner',    diet: 'Keto',         prep: 30 },
  { id: 4, name: 'Protein Shake',        kcal: 220, p: 30, c: 18, f: 4,  mealType: 'Snack',     diet: 'High-protein', prep: 3  },
  { id: 5, name: 'Tofu Stir-Fry',        kcal: 430, p: 22, c: 48, f: 16, mealType: 'Dinner',    diet: 'Vegan',        prep: 20 },
  { id: 6, name: 'Oatmeal & Berries',    kcal: 350, p: 12, c: 60, f: 7,  mealType: 'Breakfast', diet: 'Vegetarian',   prep: 10 },
  { id: 7, name: 'Turkey Wrap',          kcal: 410, p: 32, c: 40, f: 14, mealType: 'Lunch',     diet: 'Balanced',     prep: 12 },
  { id: 8, name: 'Avocado Egg Toast',    kcal: 380, p: 18, c: 30, f: 22, mealType: 'Breakfast', diet: 'Vegetarian',   prep: 8  },
]

export default {
  id: 'meals',
  label: 'Meals',
  searchPlaceholder: 'Search meals…',
  data: DATA,
  quickChips: { field: 'mealType', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
  filters: [
    { key: 'diet', label: 'Diet', control: 'chips', options: ['Balanced', 'High-protein', 'Keto', 'Vegan', 'Vegetarian'] },
    { key: 'kcal', label: 'Calories', control: 'segmented', options: [
      { key: '<300', label: '< 300', match: i => i.kcal < 300 },
      { key: '300-500', label: '300–500', match: i => i.kcal >= 300 && i.kcal <= 500 },
      { key: '500-700', label: '500–700', match: i => i.kcal > 500 && i.kcal <= 700 },
      { key: '700+', label: '700+', match: i => i.kcal > 700 },
    ] },
    { key: 'prep', label: 'Prep time', control: 'segmented', options: [
      { key: '<15', label: '< 15m', match: i => i.prep < 15 },
      { key: '15-30', label: '15–30m', match: i => i.prep >= 15 && i.prep <= 30 },
      { key: '30+', label: '30m+', match: i => i.prep > 30 },
    ] },
  ],
  renderCard: (it, { selected, onClick }) => (
    <Card key={it.id} selected={selected} onClick={onClick}>
      <Thumb kind="meal" />
      <CardBody title={it.name} meta={`${it.kcal} kcal · ${it.p}P ${it.c}C ${it.f}F`} />
      <MetaTag>{it.mealType}</MetaTag>
    </Card>
  ),
}
