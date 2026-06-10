import { Card, Thumb, CardBody, DiffDot, THUMB_COLORS } from '../shared.jsx'

const DATA = [
  { id: 1,  name: 'Barbell Back Squat', muscle: 'Legs',      equipment: 'Barbell',    difficulty: 'Hard',   type: 'Strength',   force: 'Push', mechanic: 'Compound'  },
  { id: 2,  name: 'Romanian Deadlift',  muscle: 'Back',      equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',   force: 'Pull', mechanic: 'Compound'  },
  { id: 3,  name: 'Bench Press',        muscle: 'Chest',     equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',   force: 'Push', mechanic: 'Compound'  },
  { id: 4,  name: 'Pull-ups',           muscle: 'Back',      equipment: 'Bodyweight', difficulty: 'Hard',   type: 'Strength',   force: 'Pull', mechanic: 'Compound'  },
  { id: 5,  name: 'Dumbbell Lunges',    muscle: 'Legs',      equipment: 'Dumbbell',   difficulty: 'Easy',   type: 'Strength',   force: 'Push', mechanic: 'Compound'  },
  { id: 6,  name: 'Overhead Press',     muscle: 'Shoulders', equipment: 'Barbell',    difficulty: 'Medium', type: 'Strength',   force: 'Push', mechanic: 'Compound'  },
  { id: 7,  name: 'Cable Rows',         muscle: 'Back',      equipment: 'Cable',      difficulty: 'Easy',   type: 'Strength',   force: 'Pull', mechanic: 'Compound'  },
  { id: 8,  name: 'Box Jumps',          muscle: 'Legs',      equipment: 'Bodyweight', difficulty: 'Medium', type: 'Plyometric', force: 'Push', mechanic: 'Compound'  },
  { id: 9,  name: 'Tricep Pushdown',    muscle: 'Arms',      equipment: 'Cable',      difficulty: 'Easy',   type: 'Strength',   force: 'Push', mechanic: 'Isolation' },
  { id: 10, name: 'Plank Hold',         muscle: 'Core',      equipment: 'Bodyweight', difficulty: 'Easy',   type: 'Strength',   force: 'Static', mechanic: 'Isolation' },
]

export default {
  id: 'exercises',
  label: 'Exercises',
  searchPlaceholder: 'Search exercises…',
  data: DATA,
  quickChips: { field: 'muscle', options: ['Legs', 'Back', 'Chest', 'Arms', 'Core', 'Shoulders'] },
  filters: [
    { key: 'equipment', label: 'Equipment', control: 'grid', options: [
      { key: 'Bodyweight', label: 'Body' }, { key: 'Barbell', label: 'Barbell' }, { key: 'Dumbbell', label: 'Dumbbell' },
      { key: 'Cable', label: 'Cable' }, { key: 'Bands', label: 'Bands' }, { key: 'Machine', label: 'Machine' },
    ] },
    { key: 'type', label: 'Type', control: 'segmented', options: ['Strength', 'Cardio', 'Flexibility', 'Plyometric'] },
    { key: 'difficulty', label: 'Difficulty', control: 'dots', options: [
      { key: 'Easy', dots: 1 }, { key: 'Medium', dots: 2 }, { key: 'Hard', dots: 3 }, { key: 'Expert', dots: 4 },
    ] },
    { key: 'force', label: 'Force', control: 'chips', advanced: true, options: ['Push', 'Pull', 'Static'] },
    { key: 'mechanic', label: 'Mechanic', control: 'chips', advanced: true, options: ['Compound', 'Isolation'] },
  ],
  renderCard: (it, { selected, onClick }) => (
    <Card key={it.id} selected={selected} onClick={onClick}>
      <Thumb kind="exercise" color={THUMB_COLORS[it.muscle]} />
      <CardBody title={it.name} meta={`${it.muscle} · ${it.equipment}`} />
      <DiffDot level={it.difficulty} />
    </Card>
  ),
}
