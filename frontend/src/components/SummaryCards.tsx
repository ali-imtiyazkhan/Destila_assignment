import { useEffect, useState } from "react"
import type { SummaryData } from "../services/api"
import { fetchSummary } from "../services/api"

export default function SummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null)

  useEffect(() => {
    fetchSummary().then(setData)
  }, [])

  if (!data) return null

  const cards = [
    { label: "Total", value: data.total, color: "var(--color-text)" },
    { label: "High", value: data.high, color: "#dc2626" },
    { label: "Medium", value: data.medium, color: "#d97706" },
    { label: "Open", value: data.open, color: "#2563eb" },
    { label: "Avg Deficit", value: `${data.avg_deficit_pct}%`, color: "var(--color-text)" },
  ]

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className="summary-card">
          <div className="summary-label">{card.label}</div>
          <div className="summary-value" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
