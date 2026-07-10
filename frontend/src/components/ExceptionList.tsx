import { useState, useCallback } from "react"
import type { ExceptionItem } from "../types"
import type { useExceptions } from "../hooks/useExceptions"
import { batchUpdateStatus } from "../services/api"
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
  hook: ReturnType<typeof useExceptions>
  onToast?: (text: string, type?: "success" | "error") => void
  onDataChange?: () => void
}

export default function ExceptionList({ hook, onToast }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const {
    exceptions,
    total,
    products,
    loading,
    page,
    totalPages,
    hasPrev,
    hasNext,
    filterProduct,
    filterSeverity,
    handleFilterChange,
    goToPage,
    handleStatusChange,
  } = hook

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBatchResolve = async () => {
    if (selectedIds.size === 0) return
    setBatchLoading(true)
    const ids = Array.from(selectedIds)
    try {
      await batchUpdateStatus(ids, "resolved")
      ids.forEach((id) => handleStatusChange(id, "resolved"))
      setSelectedIds(new Set())
      onToast?.(`${ids.length} exception${ids.length !== 1 ? "s" : ""} resolved`, "success")
    } catch {
      onToast?.("Failed to resolve exceptions", "error")
    }
    setBatchLoading(false)
  }

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

      {selectedIds.size > 0 && (
        <div className="batch-bar">
          <span className="batch-count">{selectedIds.size} selected</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBatchResolve}
            disabled={batchLoading}
          >
            {batchLoading ? "Resolving..." : "Resolve Selected"}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}

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
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setSelectedIds(new Set())
              }}
            />
          ))}

          <div className="pagination-bar">
            <button
              className="btn btn-outline btn-sm"
              disabled={!hasPrev || loading}
              onClick={() => goToPage(page - 1)}
            >
              &larr; Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={!hasNext || loading}
              onClick={() => goToPage(page + 1)}
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}

      {selectedId && (
        <ExceptionDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status)
            setSelectedIds(new Set())
          }}
          onToast={onToast}
        />
      )}
    </div>
  )
}
