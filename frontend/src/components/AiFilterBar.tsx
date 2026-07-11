import { useState, useRef } from "react"
import { nlSearch } from "../services/api"
import type { ExceptionItem } from "../types"

interface Props {
  onResult: (exceptions: ExceptionItem[], total: number, query: string) => void
  onToast?: (text: string, type?: "success" | "error") => void
}

export default function AiFilterBar({ onResult, onToast }: Props) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const data = await nlSearch(trimmed)
      onResult(data.exceptions, data.total, trimmed)
      onToast?.(`Found ${data.total} exceptions`, "success")
    } catch {
      onToast?.("Search failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="ai-filter-bar">
      <div className="ai-filter-input-wrap">
        <span className="ai-filter-icon">✨</span>
        <input
          ref={inputRef}
          type="text"
          className="ai-filter-input"
          placeholder='Ask naturally e.g. "high severity FG-002"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHint(true)}
          onBlur={() => setTimeout(() => setShowHint(false), 200)}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? "..." : "Search"}
        </button>
      </div>
      {showHint && (
        <div className="ai-filter-hint">
          Try: <em>"high severity exceptions"</em>, <em>"FG-002 issues"</em>, <em>"show me January 5th"</em>
        </div>
      )}
    </div>
  )
}
