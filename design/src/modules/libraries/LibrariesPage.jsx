import LibrariesScreen from './LibrariesScreen.jsx'
import WorkoutPreviewScreen from './WorkoutPreviewScreen.jsx'
import MealPreviewScreen from './MealPreviewScreen.jsx'

function PhoneColumn({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flexShrink: 0 }}>
      <span style={{
        fontFamily: 'var(--tt-font-family)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--cs-on-surface-variant)', opacity: 0.45,
      }}>{label}</span>
      {children}
    </div>
  )
}

export default function LibrariesPage() {
  return (
    <div style={{ padding: '40px 48px', background: 'var(--cs-surface-container)', minHeight: '100%', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      <PhoneColumn label="Exercises">
        <LibrariesScreen initialLibrary="exercises" mode="browse" />
      </PhoneColumn>
      <PhoneColumn label="Workouts">
        <LibrariesScreen initialLibrary="workouts" mode="browse" />
      </PhoneColumn>
      <PhoneColumn label="Meals">
        <LibrariesScreen initialLibrary="meals" mode="browse" />
      </PhoneColumn>
      <PhoneColumn label="Plans">
        <LibrariesScreen initialLibrary="plans" mode="browse" />
      </PhoneColumn>
      <PhoneColumn label="Multi-select">
        <LibrariesScreen initialLibrary="exercises" mode="multi" initialSelected={[1, 5]} />
      </PhoneColumn>
      <PhoneColumn label="Single-select">
        <LibrariesScreen initialLibrary="plans" mode="single" initialSelected={[2]} />
      </PhoneColumn>
      <PhoneColumn label="Filters">
        <LibrariesScreen initialLibrary="meals" mode="browse" sheetOpenInitial />
      </PhoneColumn>
      <PhoneColumn label="Workout preview">
        <WorkoutPreviewScreen />
      </PhoneColumn>
      <PhoneColumn label="Meal preview">
        <MealPreviewScreen />
      </PhoneColumn>
    </div>
  )
}
