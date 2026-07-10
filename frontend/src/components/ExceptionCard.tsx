import type { ExceptionItem } from "../types"
import SeverityBadge from "./SeverityBadge"

interface Props {
  exception: ExceptionItem
  detailSelected: boolean
  checked?: boolean
  showCheckbox?: boolean
  onToggleSelect?: (id: number) => void
  onClick: () => void
}

export default function ExceptionCard({
  exception,
  detailSelected,
  checked = false,
  showCheckbox,
  onToggleSelect,
  onClick,
}: Props) {
  return (
    <div className={`exception-card ${detailSelected ? "selected" : ""}`}>
      {showCheckbox && (
        <input
          type="checkbox"
          className="exception-checkbox"
          checked={checked}
          onChange={() => onToggleSelect?.(exception.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${exception.product_code}`}
        />
      )}
      <SeverityBadge severity={exception.severity} />
      <div className="exception-info" onClick={onClick}>
        <span className="product-code">{exception.product_code}</span>
        <span className="deficit">
          <strong>{exception.deficit_pct}%</strong> deficit &middot;{" "}
          {exception.planned_units} planned, {exception.units_produced} actual
        </span>
      </div>
      <span className={`status-badge ${exception.status}`}>
        {exception.status}
      </span>
    </div>
  )
}
