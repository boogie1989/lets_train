import DesktopFrame from '../../components/DesktopFrame.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import { LibrariesView } from '../libraries/index.js'
import { NEIGHBOR_MONTHS, TODAY } from './calendarModel.js'
import { MonthGrid } from './CalendarWidgets.jsx'
import ItemDetailDialog from './ItemDetailDialog.jsx'
import {
  slab, useCalendarState,
  MonthHeader, DateCaption,
  ReadinessBlock, SummaryBlock, ScheduleBlock, ScheduleEmpty,
  FabFooter, NavPanelBody,
} from './CalendarSections.jsx'

const TT = { fontFamily: 'var(--tt-font-family)' }

// Desktop (1512×982) — the tablet's master-detail (calendar grid | day stats
// + timeline) plus a permanent nav side panel (the phone drawer promoted; no
// hamburger anywhere).
export default function CalendarDesktopScreen({ initialDay = TODAY }) {
  const cal = useCalendarState({ initialDay })

  return (
    <DesktopFrame smokeVariant="shader">
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* ── Nav side panel — the drawer's body, permanent ── */}
        <div style={{
          width: 260, flexShrink: 0,
          background: 'var(--glass-slab)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderRight: '1px solid rgba(var(--overlay-rgb),0.08)',
          display: 'flex', flexDirection: 'column', paddingTop: 24,
        }}>
          <NavPanelBody onNavigate={cal.setLib} onProfile={() => {}} />
        </div>

        {/* ── Content zone: slim top bar + two columns ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={slab}>
            <div style={{ height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* title only — month label, pagers and Today live in the
                  MonthHeader above the calendar card */}
              <span style={{
                ...TT,
                fontSize: 'var(--tt-title-large-size)',
                fontWeight: 'var(--tt-title-large-weight)',
                lineHeight: 'var(--tt-title-large-height)',
                color: 'var(--cs-on-surface)',
              }}>
                Calendar
              </span>
            </div>
          </div>

          {/* Two columns: one app-style month + selected-day stats | timeline */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 32, padding: '32px 32px 24px' }}>
            <div style={{ width: 560, flexShrink: 0, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

          <FabFooter open={cal.fabOpen} setOpen={cal.setFabOpen} actions={cal.fabActions} padding="12px 32px 28px" />
          <Snackbar open={!!cal.snack} message={cal.snack?.msg} onAction={cal.undo} />

          {/* Libraries overlay covers the content zone only — the side panel stays */}
          {cal.lib && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--cs-surface)' }}>
              <LibrariesView initialLibrary={cal.lib} mode="browse" onClose={() => cal.setLib(null)} />
            </div>
          )}
        </div>
      </div>

      {/* frame-level dialog: the scrim covers the whole window, the panel docks
          over the timeline column */}
      <ItemDetailDialog item={cal.detailItem} tense={cal.day.tense} month={cal.month} dayN={cal.selected}
        anchor={{ right: 32, bottom: 104, width: 430 }} {...cal.detailHandlers} />
    </DesktopFrame>
  )
}
