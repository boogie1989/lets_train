import PhoneFrame from '../../components/PhoneFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import { LibrariesView } from '../libraries/index.js'
import { TODAY } from './calendarModel.js'
import ItemDetailDialog from './ItemDetailDialog.jsx'
import {
  slab, useCalendarState,
  CalendarTopBar, DateStrip, DateCaption,
  ReadinessBlock, SummaryBlock, ScheduleBlock, ScheduleEmpty,
  FabFooter, SideDrawer,
} from './CalendarSections.jsx'

// The phone calendar — the pixel reference of the design system. Composes the
// shared sections from CalendarSections.jsx (which were lifted from this file
// verbatim); the tablet / desktop variants re-compose the same sections.
export default function CalendarScreen({ initialDay = TODAY, initialMonthOpen = false, initialDetailId = null, timeline = true }) {
  const cal = useCalendarState({ initialDay, initialMonthOpen, initialDetailId })

  return (
    <PhoneFrame smokeVariant="shader">
      {/* Calendar Card — unified glass slab, full-bleed from top, no border-radius */}
      <div style={slab}>
        <StatusBar />

        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <CalendarTopBar
            onMenu={() => cal.setMenuOpen(true)}
            monthOpen={cal.monthOpen}
            monthOffset={cal.monthOffset}
            onToggleMonth={() => { cal.setMonthOpen(o => !o); cal.setMonthOffset(0) }}
            isToday={cal.isToday}
            onToday={() => cal.selectDay(TODAY)}
          />
          <DateStrip
            month={cal.month}
            selected={cal.selected}
            weekIdx={cal.weekIdx}
            monthOpen={cal.monthOpen}
            monthOffset={cal.monthOffset}
            onSelectDay={cal.selectDay}
            onShiftWeek={cal.shiftWeek}
            onShiftMonth={cal.shiftMonth}
            dayCompleted={cal.dayCompleted}
          />
        </div>
      </div>

      {/* Schedule section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '20px 16px 96px',
        overflowY: 'auto',
      }}>
        <DateCaption weekday={cal.day.weekday} dayN={cal.selected} />

        <ReadinessBlock day={cal.day} isToday={cal.isToday} isPast={cal.isPast} onSet={cal.setReadiness} />

        {cal.items.length > 0 ? (
          <>
            <SummaryBlock stats={cal.stats} load={cal.dayLoad} nut={cal.nut} />
            <ScheduleBlock items={cal.items} isPast={cal.isPast} timeline={timeline} onOpen={cal.setDetailId} />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScheduleEmpty />
          </div>
        )}
      </div>

      {/* ── Footer — FAB menu (shared FabMenu, same recipe as Workout Builder) ── */}
      <FabFooter open={cal.fabOpen} setOpen={cal.setFabOpen} actions={cal.fabActions} />

      {/* ── Undo snackbar — move / delete / eaten ops are reversible ── */}
      <Snackbar open={!!cal.snack} message={cal.snack?.msg} onAction={cal.undo} />

      {/* ── Item detail dialog — container transform per the FabMenu recipe ── */}
      <ItemDetailDialog item={cal.detailItem} tense={cal.day.tense} month={cal.month} dayN={cal.selected} {...cal.detailHandlers} />

      {/* ── Side menu drawer ── */}
      <SideDrawer open={cal.menuOpen} onClose={() => cal.setMenuOpen(false)} onNavigate={id => { cal.setLib(id); cal.setMenuOpen(false) }} />

      {/* ── Library overlay (opened from the drawer nav) ── */}
      {cal.lib && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--cs-surface)' }}>
          <LibrariesView initialLibrary={cal.lib} mode="browse" onClose={() => cal.setLib(null)} />
        </div>
      )}
    </PhoneFrame>
  )
}
