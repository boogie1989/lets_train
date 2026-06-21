// Headless calendar controller — ALL state + handlers, presentation-agnostic.
// Lifted from design_v2 CalendarScreen.jsx + ItemDetailDialog action wiring so the
// the design-language skins (cupertino / hybrid) share one brain and
// only differ in markup. RULE: skins never re-implement this logic.
import { useRef, useState } from 'react'
import {
  TODAY, WEEKS, WD, NEIGHBOR_MONTHS, weekIndexOf, dateLabel,
  initMonth, computeDayStats, computeNut, computeDayLoad, isDone,
  patchDay, addItem, moveItem as moveOp, deleteItem as deleteOp, setEaten as setEatenOp, setNote as setNoteOp,
} from './calendarModel.js'

export function useCalendar({ initialDay = TODAY, initialMonthOpen = false, initialDetailId = null } = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [month, setMonth] = useState(initMonth)
  const [selected, setSelected] = useState(initialDay)
  const [weekIdx, setWeekIdx] = useState(Math.max(0, weekIndexOf(initialDay)))
  const [monthOpen, setMonthOpen] = useState(initialMonthOpen)
  const [monthOffset, setMonthOffset] = useState(0) // -1 Apr / 0 May / 1 Jun (ghosts)
  const [fabOpen, setFabOpen] = useState(false)
  const [detailId, setDetailId] = useState(initialDetailId)

  const day = month[selected]
  const items = day.items
  const stats = computeDayStats(items)
  const nut = computeNut(items)
  const dayLoad = computeDayLoad(items)
  const isToday = selected === TODAY
  const isPast = day.tense === 'past'
  const dayCompleted = n => month[n].items.length > 0 && month[n].items.every(isDone)
  const ghostMonth = monthOffset !== 0 ? NEIGHBOR_MONTHS[monthOffset] : null

  const selectDay = n => { setSelected(n); setWeekIdx(Math.max(0, weekIndexOf(n))); setMonthOpen(false); setMonthOffset(0) }
  const toggleMonth = () => { setMonthOpen(o => !o); setMonthOffset(0) }

  // ── undo snackbar — planning ops keep the previous month snapshot ──
  const [snack, setSnack] = useState(null)
  const snackTimer = useRef(null)
  const showSnack = (msg, prev) => {
    clearTimeout(snackTimer.current)
    setSnack({ msg, prev })
    snackTimer.current = setTimeout(() => setSnack(null), 4000)
  }
  const undo = () => { clearTimeout(snackTimer.current); setMonth(snack.prev); setSnack(null) }

  // ── detail item + its planning ops (operate on selected day + detailId) ──
  const detailItem = detailId ? items.find(it => it.id === detailId) ?? null : null
  const openDetail = id => setDetailId(id)
  const closeDetail = () => setDetailId(null)
  const moveItem = toN => {
    const prev = month
    setMonth(m => moveOp(m, selected, detailId, toN)); setDetailId(null)
    showSnack(`Moved to ${dateLabel(toN)}`, prev)
  }
  const deleteItem = () => {
    const prev = month
    setMonth(m => deleteOp(m, selected, detailId)); setDetailId(null)
    showSnack('Deleted', prev)
  }
  const setEaten = eaten => {
    const prev = month
    setMonth(m => setEatenOp(m, selected, detailId, eaten)); setDetailId(null)
    showSnack(eaten ? 'Marked eaten' : 'Marked not eaten', prev)
  }
  const setNote = note => setMonth(m => setNoteOp(m, selected, detailId, note))
  const setReadiness = v => setMonth(m => patchDay(m, selected, { readiness: v }))

  // ── horizontal swipe: week view pages weeks, month view pages months ──
  const swipeStart = useRef(null)
  const [dragX, setDragX] = useState(0)
  const shiftWeek = dir => {
    const wi = Math.max(0, Math.min(WEEKS.length - 1, weekIdx + dir))
    if (wi === weekIdx) return
    setWeekIdx(wi)
    setSelected(WEEKS[wi][WD.indexOf(day.weekday)] ?? WEEKS[wi].find(x => x != null))
  }
  const swipeHandlers = {
    onPointerDown: e => { swipeStart.current = e.clientX },
    onPointerMove: e => { if (swipeStart.current != null) setDragX(e.clientX - swipeStart.current) },
    onPointerUp: () => {
      if (swipeStart.current == null) return
      const d = dragX
      swipeStart.current = null
      setDragX(0)
      if (Math.abs(d) < 60) return
      const dir = d < 0 ? 1 : -1 // swipe left → next
      if (monthOpen) setMonthOffset(o => Math.max(-1, Math.min(1, o + dir)))
      else shiftWeek(dir)
    },
    onPointerLeave: () => { if (swipeStart.current != null) { swipeStart.current = null; setDragX(0) } },
  }
  const dragShift = Math.max(-70, Math.min(70, dragX / 2))
  const weekPeek = (wi, edge) => {
    const days = (WEEKS[wi] ?? []).filter(n => n != null)
    if (!days.length) return null
    const n = edge === 'last' ? days[days.length - 1] : days[0]
    return { weekday: month[n].weekday, day: String(n) }
  }

  // ── FAB menu actions — demo items land in the selected day (ad-hoc) ──
  const scheduleWorkout = () => setMonth(m => addItem(m, selected, { kind: 'workout', title: 'Quick Workout', time: '05:00 PM', exerciseCount: 6, status: 'Planned' }))
  const scheduleMeal = () => setMonth(m => addItem(m, selected, { kind: 'meal', title: 'Snack', time: '04:00 PM', kcal: 280, p: 18, c: 30, f: 9, status: 'Planned' }))
  const logMeal = () => setMonth(m => addItem(m, selected, { kind: 'meal', title: 'Snack', time: '04:00 PM', kcal: 280, p: 18, c: 30, f: 9, status: 'Completed' }))

  return {
    // view state
    month, selected, day, items, weekIdx, monthOpen, monthOffset, ghostMonth,
    fabOpen, setFabOpen, menuOpen, setMenuOpen, detailId, detailItem,
    // derived
    stats, nut, dayLoad, isToday, isPast, dayCompleted,
    // view actions
    selectDay, toggleMonth, openDetail, closeDetail,
    // swipe
    swipeHandlers, dragShift, weekPeek,
    // planning ops
    moveItem, deleteItem, setEaten, setNote, setReadiness,
    scheduleWorkout, scheduleMeal, logMeal,
    // undo
    snack, undo,
  }
}
