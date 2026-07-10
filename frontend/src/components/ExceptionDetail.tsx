import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts"
import type { ExceptionDetail as ExceptionDetailType } from "../types"
import { fetchExceptionDetail, updateExceptionStatus } from "../services/api"
import SeverityBadge from "./SeverityBadge"

interface Props {
  id: number
  onClose: () => void
  onStatusChange: (id: number, status: string) => void
  onToast?: (text: string, type?: "success" | "error") => void
}

export default function ExceptionDetail({
  id,
  onClose,
  onStatusChange,
  onToast,
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
    onToast?.(`${detail?.product_code} marked as ${status}`, "success")
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

  const chartData = detail.trend.map((p) => ({
    date: p.date.slice(5),
    Planned: p.planned_units,
    Actual: p.units_produced,
  }))

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
            <div className="stat-value negative">
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
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-body)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Planned" fill="#ff5a03" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
