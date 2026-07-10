import { useEffect, useState } from "react"
import type { SummaryData } from "../services/api"
import { fetchSummary } from "../services/api"

interface Props {
  refreshKey?: number
}

const CARD_CONFIG = [
  { key: "total" as const, label: "Total", icon: "📊", color: "var(--color-text)" },
  { key: "high" as const, label: "High", icon: "🔴", color: "#dc2626" },
  { key: "medium" as const, label: "Medium", icon: "🟡", color: "#d97706" },
  { key: "open" as const, label: "Open", icon: "📬", color: "#2563eb" },
  { key: "avg_deficit_pct" as const, label: "Avg Deficit", icon: "📉", color: "var(--color-text)", suffix: "%" },
]

export default function SummaryCards({ refreshKey = 0 }: Props) {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading && !data) {
    return (
      <div className="summary-grid">
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="summary-card summary-card-skeleton">
            <div className="summary-icon">{card.icon}</div>
            <div className="summary-label">{card.label}</div>
            <div className="summary-value">—</div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="summary-grid">
      {CARD_CONFIG.map((card) => {
        const raw = data[card.key]
        const value = card.suffix ? `${raw}${card.suffix}` : raw
        return (
          <div key={card.key} className="summary-card">
            <div className="summary-icon">{card.icon}</div>
            <div className="summary-label">{card.label}</div>
            <div className="summary-value" style={{ color: card.color }}>
              {value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
