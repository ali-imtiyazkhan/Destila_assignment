import { useEffect, useState } from "react"
import type { SummaryData } from "../services/api"
import { fetchSummary } from "../services/api"

interface Props {
  refreshKey?: number
}

export default function Hero({ refreshKey = 0 }: Props) {
  const [data, setData] = useState<SummaryData | null>(null)

  useEffect(() => {
    fetchSummary()
      .then(setData)
      .catch(() => setData(null))
  }, [refreshKey])

  const stats = data
    ? [
        { label: "Total Exceptions", value: data.total, accent: "primary" },
        { label: "High Severity", value: data.high, accent: "danger" },
        { label: "Open Items", value: data.open, accent: "info" },
        { label: "Avg Deficit", value: `${data.avg_deficit_pct}%`, accent: "warning" },
      ]
    : []

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-badge">Manufacturing Intelligence</span>
          <h1 className="hero-title">
            Catch production gaps
            <br />
            <span>before they cascade</span>
          </h1>
          <p className="hero-subtitle">
            Plan-vs-actual deficit exceptions surfaced day by day — so planners
            can acknowledge, resolve, and keep production on track.
          </p>
          <div className="hero-actions">
            <a href="#inbox" className="btn btn-primary">
              View Inbox
            </a>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-hero-outline"
            >
              API Documentation
            </a>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className={`hero-stat hero-stat-${stat.accent}`}>
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
