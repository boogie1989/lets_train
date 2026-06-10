import { Card, Thumb, CardBody, MetaTag } from '../shared.jsx'

const DATA = [
  { id: 1, name: 'Starting Strength',    weeks: 12, daysPerWeek: 3, level: 'Beginner',     goal: 'Strength' },
  { id: 2, name: 'PPL Hypertrophy',      weeks: 8,  daysPerWeek: 6, level: 'Intermediate', goal: 'Hypertrophy' },
  { id: 3, name: 'Lean & Cut',           weeks: 6,  daysPerWeek: 4, level: 'Intermediate', goal: 'Fat loss' },
  { id: 4, name: '5/3/1 Powerbuilding',  weeks: 16, daysPerWeek: 4, level: 'Advanced',     goal: 'Strength' },
  { id: 5, name: 'Runner Base Build',    weeks: 10, daysPerWeek: 5, level: 'Intermediate', goal: 'Endurance' },
  { id: 6, name: 'Home Beginner Plan',   weeks: 4,  daysPerWeek: 3, level: 'Beginner',     goal: 'Fat loss' },
  { id: 7, name: 'Full Body Foundations',weeks: 8,  daysPerWeek: 3, level: 'Beginner',     goal: 'Hypertrophy' },
]

export default {
  id: 'plans',
  label: 'Plans',
  searchPlaceholder: 'Search plans…',
  data: DATA,
  quickChips: { field: 'goal', options: ['Strength', 'Hypertrophy', 'Fat loss', 'Endurance'] },
  filters: [
    { key: 'level', label: 'Level', control: 'segmented', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'weeks', label: 'Duration', control: 'segmented', options: [
      { key: '4-6', label: '4–6 wk', match: i => i.weeks <= 6 },
      { key: '8-12', label: '8–12 wk', match: i => i.weeks >= 8 && i.weeks <= 12 },
      { key: '12+', label: '12+ wk', match: i => i.weeks > 12 },
    ] },
    { key: 'daysPerWeek', label: 'Days / week', control: 'segmented', options: [
      { key: '3', label: '≤ 3', match: i => i.daysPerWeek <= 3 },
      { key: '4', label: '4', match: i => i.daysPerWeek === 4 },
      { key: '5+', label: '5+', match: i => i.daysPerWeek >= 5 },
    ] },
  ],
  renderCard: (it, { selected, onClick }) => (
    <Card key={it.id} selected={selected} onClick={onClick}>
      <Thumb kind="plan" />
      <CardBody title={it.name} meta={`${it.weeks} weeks · ${it.daysPerWeek} days/wk · ${it.goal}`} />
      <MetaTag>{it.level}</MetaTag>
    </Card>
  ),
}
