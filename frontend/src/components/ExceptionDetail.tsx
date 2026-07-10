import { useEffect, useState } from "react"
import type { ExceptionDetail as ExceptionDetailType } from "../types"
import { fetchExceptionDetail, updateExceptionStatus } from "../api"
import SeverityBadge from "./SeverityBadge"

interface Props {
  id: number
  onClose: () => void
  onStatusChange: (id: number, status: string) => void
}

export default function ExceptionDetail({
  id,
  onClose,
  onStatusChange,
}: Props) {
  const [detail, setDetail] = useState<ExceptionDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchExceptionDetail(id).then((data) => {
      setDetail(data)
      setLoading(false)
    })
  }, [id])

  const handleStatus = async (status: string) => {
    await updateExceptionStatus(id, status)
    onStatusChange(id, status)
    setDetail((prev) => (prev ? { ...prev, status: status as any } : prev))
  }

  if (loading) {
    return (
      <div className="detail-overlay" onClick={onClose}>
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (!detail) return null

  const deficitClass =
    detail.deficit_pct > 0 ? "negative" : "positive"

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>{detail.product_code}</h2>
        <div className="detail-date">{detail.date}</div>

        <div className="detail-stats">
          <div className="stat-card">
            <div className="stat-label">Planned</div>
            <div className="stat-value">{detail.planned_units}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Actual</div>
            <div className="stat-value">{detail.units_produced}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Deficit</div>
            <div className={`stat-value ${deficitClass}`}>
              {detail.deficit_pct}%
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Severity</div>
            <div className="stat-value">
              <SeverityBadge severity={detail.severity} />
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <SeverityBadge severity={detail.severity} />
          <span className={`status-badge ${detail.status}`}>
            {detail.status}
          </span>
        </div>

        <div className="status-actions">
          <button
            className={`status-btn ${detail.status === "acknowledged" ? "active" : ""}`}
            disabled={detail.status === "acknowledged"}
            onClick={() => handleStatus("acknowledged")}
          >
            Acknowledge
          </button>
          <button
            className={`status-btn ${detail.status === "resolved" ? "active" : ""}`}
            disabled={detail.status === "resolved"}
            onClick={() => handleStatus("resolved")}
          >
            Resolve
          </button>
        </div>

        <div className="trend-section" style={{ marginTop: "2rem" }}>
          <h3>7-Day Trend</h3>
          <table className="trend-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Deficit</th>
              </tr>
            </thead>
            <tbody>
              {detail.trend.map((point) => {
                const deficit = point.planned_units
                  ? (
                      ((point.planned_units - point.units_produced) /
                        point.planned_units) *
                      100
                    ).toFixed(1)
                  : "—"
                const isNegative = parseFloat(deficit as string) > 0
                return (
                  <tr key={point.date}>
                    <td>{point.date}</td>
                    <td>{point.planned_units}</td>
                    <td>{point.units_produced}</td>
                    <td
                      className={`deficit-cell ${isNegative ? "negative" : "positive"}`}
                    >
                      {deficit}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
