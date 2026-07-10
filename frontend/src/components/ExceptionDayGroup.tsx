import { useState } from "react"
import type { ExceptionItem } from "../types"
import ExceptionCard from "./ExceptionCard"

interface Props {
  date: string
  exceptions: ExceptionItem[]
  selectedId: number | null
  onSelect: (id: number) => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ExceptionDayGroup({
  date,
  exceptions,
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="day-group">
      <div className="day-header" onClick={() => setOpen(!open)}>
        <span className={`chevron ${open ? "open" : ""}`}>▶</span>
        <h2>{formatDate(date)}</h2>
        <span className="day-count">
          {exceptions.length} exception{exceptions.length !== 1 ? "s" : ""}
        </span>
      </div>
      {open && (
        <div className="day-body">
          {exceptions.map((exc) => (
            <ExceptionCard
              key={exc.id}
              exception={exc}
              selected={selectedId === exc.id}
              onClick={() => onSelect(exc.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
