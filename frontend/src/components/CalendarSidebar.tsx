import { useState, useMemo, useCallback } from "react"

interface Props {
  dates: string[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function CalendarSidebar({ dates, selectedDate, onSelectDate }: Props) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const dateSet = useMemo(() => new Set(dates), [dates])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }, [viewMonth])

  const pad = (n: number) => String(n).padStart(2, "0")

  const cells: { day: number; dateStr: string; hasData: boolean }[] = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: 0, dateStr: "", hasData: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`
    cells.push({ day: d, dateStr, hasData: dateSet.has(dateStr) })
  }

  return (
    <aside className="calendar-sidebar">
      <div className="calendar-header">
        <button className="cal-nav" onClick={prevMonth}>&lsaquo;</button>
        <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextMonth}>&rsaquo;</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, i) =>
          cell.day === 0 ? (
            <div key={`empty-${i}`} className="cal-cell cal-empty" />
          ) : (
            <button
              key={cell.dateStr}
              className={`cal-cell cal-day${cell.dateStr === selectedDate ? " cal-selected" : ""}${!cell.hasData ? " cal-muted" : ""}`}
              onClick={() => onSelectDate(cell.dateStr)}
              disabled={!cell.hasData}
            >
              {cell.day}
              {cell.hasData && <span className="cal-dot" />}
            </button>
          )
        )}
      </div>
      {selectedDate && (
        <div className="cal-active-date">
          <button className="cal-clear" onClick={() => onSelectDate("")}>
            &times; Clear filter
          </button>
        </div>
      )}
    </aside>
  )
}
