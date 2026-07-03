import TabletFrame from '../../components/TabletFrame.jsx'
import StatusBar from '../../components/StatusBar.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import { LibrariesView } from '../libraries/index.js'
import { NEIGHBOR_MONTHS, TODAY } from './calendarModel.js'
import { MonthGrid } from './CalendarWidgets.jsx'
import ItemDetailDialog from './ItemDetailDialog.jsx'
import {
  slab, useCalendarState,
  CalendarTopBar, MonthHeader, DateCaption,
  ReadinessBlock, SummaryBlock, ScheduleBlock, ScheduleEmpty,
  FabFooter, SideDrawer,
} from './CalendarSections.jsx'

// Tablet portrait (iPad Pro 12.9", 1024×1366) — master-detail: the month grid
// is always visible in the left column (no week strip, no month toggle — the
// top-bar month label is static), the right column is the selected day's
// stats + timeline. The drawer stays an overlay — a permanent rail is the
// desktop's move.
export default function CalendarTabletScreen({ initialDay = TODAY }) {
  const cal = useCalendarState({ initialDay })

  return (
    <TabletFrame smokeVariant="shader">
      {/* Slim slab header — same recipe as the phone slab */}
      <div style={slab}>
        <StatusBar width="100%" />
        <div style={{ padding: '0 24px 12px' }}>
          {/* title only — month label + Today live in the MonthHeader below */}
          <CalendarTopBar
            onMenu={() => cal.setMenuOpen(true)}
            monthToggle={false}
            showMonth={false}
            showToday={false}
          />
        </div>
      </div>

      {/* Two columns: one app-style month + selected-day stats | timeline */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, padding: '24px 24px 24px' }}>
        <div style={{ width: 488, flexShrink: 0, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MonthHeader monthOffset={cal.monthOffset} onShiftMonth={cal.shiftMonth}
              isToday={cal.isToday} onToday={() => cal.selectDay(TODAY)} />
            <MonthGrid size="large" month={cal.month} selected={cal.selected} onSelect={cal.selectDay}
              ghost={cal.monthOffset !== 0 ? NEIGHBOR_MONTHS[cal.monthOffset] : null} />
          </div>
          <DateCaption weekday={cal.day.weekday} dayN={cal.selected} />
          <ReadinessBlock day={cal.day} isToday={cal.isToday} isPast={cal.isPast} onSet={cal.setReadiness} />
          {cal.items.length > 0 && <SummaryBlock stats={cal.stats} load={cal.dayLoad} nut={cal.nut} />}
        </div>

        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingBottom: 96, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cal.items.length > 0 ? (
            <ScheduleBlock items={cal.items} isPast={cal.isPast} onOpen={cal.setDetailId} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScheduleEmpty />
            </div>
          )}
        </div>
      </div>

      <FabFooter open={cal.fabOpen} setOpen={cal.setFabOpen} actions={cal.fabActions} padding="12px 24px 28px" />

      <Snackbar open={!!cal.snack} message={cal.snack?.msg} onAction={cal.undo} />

      {/* detail dialog docks bottom-right at phone width */}
      <ItemDetailDialog item={cal.detailItem} tense={cal.day.tense} month={cal.month} dayN={cal.selected}
        anchor={{ right: 24, bottom: 104, width: 430 }} {...cal.detailHandlers} />

      <SideDrawer open={cal.menuOpen} onClose={() => cal.setMenuOpen(false)} onNavigate={id => { cal.setLib(id); cal.setMenuOpen(false) }} />

      {cal.lib && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--cs-surface)' }}>
          <LibrariesView initialLibrary={cal.lib} mode="browse" onClose={() => cal.setLib(null)} />
        </div>
      )}
    </TabletFrame>
  )
}
