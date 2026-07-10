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
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchExceptionDetail(id)
      .then((data) => {
        setDetail(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load exception details")
        setLoading(false)
      })
  }, [id])

  const handleStatus = async (status: string) => {
    if (!detail || updating) return
    setUpdating(true)
    try {
      await updateExceptionStatus(id, status)
      onStatusChange(id, status)
      setDetail((prev) => (prev ? { ...prev, status: status as ExceptionDetailType["status"] } : prev))
      onToast?.(`${detail.product_code} marked as ${status}`, "success")
    } catch {
      onToast?.("Failed to update status", "error")
    } finally {
      setUpdating(false)
    }
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

  if (error || !detail) {
    return (
      <div className="detail-overlay" onClick={onClose}>
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="empty-state" style={{ marginTop: "2rem" }}>
            <h3>Could not load details</h3>
            <p>{error ?? "Exception not found"}</p>
          </div>
        </div>
      </div>
    )
  }

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
            disabled={detail.status === "acknowledged" || updating}
            onClick={() => handleStatus("acknowledged")}
          >
            Acknowledge
          </button>
          <button
            className={`status-btn ${detail.status === "resolved" ? "active" : ""}`}
            disabled={detail.status === "resolved" || updating}
            onClick={() => handleStatus("resolved")}
          >
            Resolve
          </button>
        </div>

        <div className="trend-section" style={{ marginTop: "2rem" }}>
          <h3>7-Day Trend</h3>
          {detail.trend.length === 0 ? (
            <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)" }}>
              No prior production data available.
            </p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
