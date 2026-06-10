import { Card, Thumb, CardBody, DiffDot } from '../shared.jsx'

const DATA = [
  { id: 1, name: 'Leg Day',          focus: 'Lower',     exercises: 6, minutes: 55, difficulty: 'Hard',   equipment: 'Barbell',    tags: ['Strength'] },
  { id: 2, name: 'Push Power',       focus: 'Push',      exercises: 5, minutes: 45, difficulty: 'Medium', equipment: 'Barbell',    tags: ['Strength', 'Hypertrophy'] },
  { id: 3, name: 'Pull Day',         focus: 'Pull',      exercises: 5, minutes: 48, difficulty: 'Medium', equipment: 'Cable',      tags: ['Hypertrophy'] },
  { id: 4, name: 'Full Body Express',focus: 'Full body', exercises: 4, minutes: 25, difficulty: 'Easy',   equipment: 'Dumbbell',   tags: ['Conditioning'] },
  { id: 5, name: 'Core Crusher',     focus: 'Core',      exercises: 7, minutes: 20, difficulty: 'Easy',   equipment: 'Bodyweight', tags: ['Core'] },
  { id: 6, name: 'Upper Hypertrophy',focus: 'Upper',     exercises: 8, minutes: 62, difficulty: 'Hard',   equipment: 'Dumbbell',   tags: ['Hypertrophy'] },
  { id: 7, name: 'HIIT Burnout',     focus: 'Full body', exercises: 6, minutes: 30, difficulty: 'Medium', equipment: 'Bodyweight', tags: ['Conditioning'] },
]

export default {
  id: 'workouts',
  label: 'Workouts',
  searchPlaceholder: 'Search workouts…',
  data: DATA,
  quickChips: { field: 'focus', options: ['Full body', 'Upper', 'Lower', 'Push', 'Pull', 'Core'] },
  filters: [
    { key: 'duration', label: 'Duration', control: 'segmented', options: [
      { key: '<30', label: '< 30m', match: i => i.minutes < 30 },
      { key: '30-45', label: '30–45m', match: i => i.minutes >= 30 && i.minutes <= 45 },
      { key: '45-60', label: '45–60m', match: i => i.minutes > 45 && i.minutes <= 60 },
      { key: '60+', label: '60m+', match: i => i.minutes > 60 },
    ] },
    { key: 'difficulty', label: 'Difficulty', control: 'dots', options: [
      { key: 'Easy', dots: 1 }, { key: 'Medium', dots: 2 }, { key: 'Hard', dots: 3 }, { key: 'Expert', dots: 4 },
    ] },
    { key: 'equipment', label: 'Equipment', control: 'grid', options: [
      { key: 'Bodyweight', label: 'Body' }, { key: 'Barbell', label: 'Barbell' }, { key: 'Dumbbell', label: 'Dumbbell' },
      { key: 'Cable', label: 'Cable' }, { key: 'Bands', label: 'Bands' }, { key: 'Machine', label: 'Machine' },
    ] },
    { key: 'tags', label: 'Tags', control: 'chips', advanced: true, options: ['Strength', 'Hypertrophy', 'Conditioning', 'Core'] },
  ],
  renderCard: (it, { selected, onClick }) => (
    <Card key={it.id} selected={selected} onClick={onClick}>
      <Thumb kind="workout" />
      <CardBody title={it.name} meta={`${it.focus} · ${it.exercises} ex · ${it.minutes} min`} />
      <DiffDot level={it.difficulty} />
    </Card>
  ),
}
