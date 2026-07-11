import { useState } from "react"
import { fetchAiInsight } from "../services/api"

interface Props {
  exceptionId: number
}

export default function AiInsight({ exceptionId }: Props) {
  const [insight, setInsight] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  const handleAnalyze = async () => {
    if (insight) {
      setOpen((o) => !o)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const data = await fetchAiInsight(exceptionId)
      setInsight(data.insight)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-insight">
      <button
        className="btn btn-outline btn-sm ai-insight-btn"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "🤖 AI Insight"}
      </button>
      {error && <p className="ai-insight-error">Failed to get insight</p>}
      {open && insight && (
        <div className="ai-insight-panel">
          <p>{insight}</p>
        </div>
      )}
    </div>
  )
}
