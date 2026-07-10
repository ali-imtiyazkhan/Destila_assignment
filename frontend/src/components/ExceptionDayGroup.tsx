import { useState, useRef, useEffect } from "react"
import type { ExceptionItem } from "../types"
import ExceptionCard from "./ExceptionCard"

interface Props {
  date: string
  exceptions: ExceptionItem[]
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
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
  selectedIds,
  onToggleSelect,
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(true)
  const checkboxRef = useRef<HTMLInputElement>(null)
  const selectedCount = exceptions.filter((e) => selectedIds.has(e.id)).length
  const allSelected = selectedCount === exceptions.length && exceptions.length > 0
  const someSelected = selectedCount > 0 && !allSelected

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const toggleAll = () => {
    exceptions.forEach((e) => {
      if (allSelected && selectedIds.has(e.id)) onToggleSelect(e.id)
      else if (!allSelected && !selectedIds.has(e.id)) onToggleSelect(e.id)
    })
  }

  return (
    <div className="day-group">
      <div className="day-header" onClick={() => setOpen(!open)}>
        <span className={`chevron ${open ? "open" : ""}`}>▶</span>
        <input
          ref={checkboxRef}
          type="checkbox"
          className="exception-checkbox"
          checked={allSelected}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select all exceptions for ${formatDate(date)}`}
        />
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
              detailSelected={selectedId === exc.id}
              checked={selectedIds.has(exc.id)}
              showCheckbox
              onToggleSelect={onToggleSelect}
              onClick={() => onSelect(exc.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
