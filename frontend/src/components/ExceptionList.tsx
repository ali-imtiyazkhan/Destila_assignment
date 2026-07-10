import { useEffect, useState, useCallback } from "react"
import type { ExceptionItem } from "../types"
import { fetchExceptions, fetchProducts } from "../api"
import ExceptionDayGroup from "./ExceptionDayGroup"
import ExceptionDetail from "./ExceptionDetail"

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

export default function ExceptionList() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([])
  const [products, setProducts] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchExceptions({
      product_code: filterProduct || undefined,
      severity: filterSeverity || undefined,
    })
    setExceptions(data.exceptions)
    setLoading(false)
  }, [filterProduct, filterSeverity])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])

  const handleStatusChange = (id: number, status: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: status as any } : e))
    )
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
            onChange={(e) => setFilterProduct(e.target.value)}
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
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="filter-count">
          <strong>{exceptions.length}</strong> exception
          {exceptions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading exceptions...</div>
      ) : exceptions.length === 0 ? (
        <div className="empty-state">
          <h3>No exceptions found</h3>
          <p>Try changing your filters.</p>
        </div>
      ) : (
        groups.map(([date, excs]) => (
          <ExceptionDayGroup
            key={date}
            date={date}
            exceptions={excs}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))
      )}

      {selectedId && (
        <ExceptionDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
