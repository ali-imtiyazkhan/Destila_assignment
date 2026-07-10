import { useState, useEffect, useCallback } from "react"
import type { ExceptionItem } from "../types"
import { fetchExceptions, fetchProducts, fetchDates } from "../services/api"

const PAGE_SIZE = 20

export function useExceptions() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([])
  const [total, setTotal] = useState(0)
  const [products, setProducts] = useState<string[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("")
  const [filterDate, setFilterDate] = useState("")

  const load = useCallback(async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchExceptions({
        offset: (currentPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        product_code: filterProduct || undefined,
        severity: filterSeverity || undefined,
        date: filterDate || undefined,
      })
      setTotal(data.total)
      setExceptions(data.exceptions)
    } catch {
      setError("Failed to load exceptions")
      setExceptions([])
    } finally {
      setLoading(false)
    }
  }, [filterProduct, filterSeverity, filterDate])

  useEffect(() => {
    setPage(1)
    load(1)
  }, [load])

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
    fetchDates()
      .then(setDates)
      .catch(() => setDates([]))
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    load(p)
  }

  const handleFilterChange = (type: "product" | "severity" | "date", value: string) => {
    if (type === "product") setFilterProduct(value)
    else if (type === "severity") setFilterSeverity(value)
    else setFilterDate(value)
  }

  const handleStatusChange = (id: number, status: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: status as ExceptionItem["status"] } : e))
    )
  }

  return {
    exceptions,
    total,
    products,
    dates,
    loading,
    error,
    page,
    totalPages,
    hasPrev,
    hasNext,
    filterProduct,
    filterSeverity,
    filterDate,
    handleFilterChange,
    goToPage,
    handleStatusChange,
  }
}
