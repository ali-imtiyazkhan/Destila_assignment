import type { ExceptionItem } from "../types"
import SeverityBadge from "./SeverityBadge"

interface Props {
  exception: ExceptionItem
  selected: boolean
  onClick: () => void
}

export default function ExceptionCard({ exception, selected, onClick }: Props) {
  return (
    <div
      className={`exception-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <SeverityBadge severity={exception.severity} />
      <div className="exception-info">
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
