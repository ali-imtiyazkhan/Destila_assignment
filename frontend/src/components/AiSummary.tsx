import { useEffect, useState } from "react"
import { fetchAiSummary } from "../services/api"

interface Props {
  refreshKey?: number
}

export default function AiSummary({ refreshKey = 0 }: Props) {
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAiSummary()
      .then((data) => setSummary(data.summary))
      .catch(() => setSummary(""))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (!summary && !loading) return null

  return (
    <div className="ai-summary">
      <div className="ai-summary-icon">🤖</div>
      <div className="ai-summary-body">
        {loading ? (
          <span className="ai-summary-loading">Generating summary...</span>
        ) : (
          <p>{summary}</p>
        )}
      </div>
    </div>
  )
}
