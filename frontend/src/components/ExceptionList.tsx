import { useState } from "react"
import type { ExceptionItem } from "../types"
import { useExceptions } from "../hooks/useExceptions"
import ExceptionDayGroup from "./ExceptionDayGroup"
import ExceptionDetail from "./ExceptionDetail"

function exportCSV(exceptions: ExceptionItem[]) {
  const headers = ["ID", "Product Code", "Plant", "Date", "Planned Units", "Units Produced", "Deficit %", "Severity", "Status"]
  const rows = exceptions.map((e) =>
    [e.id, e.product_code, e.plant, e.date, e.planned_units, e.units_produced, e.deficit_pct, e.severity, e.status].join(",")
  )
  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "exceptions.csv"
  a.click()
  URL.revokeObjectURL(url)
}

function groupByDate(exceptions: ExceptionItem[]) {
  const map = new Map<string, ExceptionItem[]>()
  for (const exc of exceptions) {
    const existing = map.get(exc.date) || []
    existing.push(exc)
    map.set(exc.date, existing)
  }
  return Array.from(map.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  )
}

interface Props {
  onToast?: (text: string, type?: "success" | "error") => void
}

export default function ExceptionList({ onToast }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const {
    exceptions,
    total,
    products,
    loading,
    hasMore,
    filterProduct,
    filterSeverity,
    handleFilterChange,
    loadMore,
    handleStatusChange,
  } = useExceptions()

  const groups = groupByDate(exceptions)

  return (
    <div>
      <div className="filters-bar">
        <div className="filter-group">
          <label>Product</label>
          <select
            className="filter-select"
            value={filterProduct}
            onChange={(e) => handleFilterChange("product", e.target.value)}
          >
            <option value="">All</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
          <select
            className="filter-select"
            value={filterSeverity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="filter-count">
          <strong>{total}</strong> exception
          {total !== 1 ? "s" : ""}
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => exportCSV(exceptions)}
          disabled={exceptions.length === 0}
        >
          Export CSV
        </button>
      </div>

      {loading && exceptions.length === 0 ? (
        <div className="loading">Loading exceptions...</div>
      ) : exceptions.length === 0 ? (
        <div className="empty-state">
          <h3>No exceptions found</h3>
          <p>Try changing your filters.</p>
        </div>
      ) : (
        <>
          {groups.map(([date, excs]) => (
            <ExceptionDayGroup
              key={date}
              date={date}
              exceptions={excs}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}

          {hasMore && (
            <div className="load-more-wrapper">
              <button
                className="btn btn-outline load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : `Load more (${exceptions.length} of ${total})`}
              </button>
            </div>
          )}
        </>
      )}

      {selectedId && (
        <ExceptionDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onToast={onToast}
        />
      )}
    </div>
  )
}
