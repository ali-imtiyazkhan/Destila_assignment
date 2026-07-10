import { useState, useEffect, useCallback } from "react"
import type { ExceptionItem } from "../types"
import { fetchExceptions, fetchProducts } from "../services/api"

const PAGE_SIZE = 50

export function useExceptions() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([])
  const [total, setTotal] = useState(0)
  const [products, setProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("")

  const load = useCallback(async (currentOffset: number) => {
    setLoading(true)
    const data = await fetchExceptions({
      offset: currentOffset,
      limit: PAGE_SIZE,
      product_code: filterProduct || undefined,
      severity: filterSeverity || undefined,
    })
    setTotal(data.total)
    if (currentOffset === 0) {
      setExceptions(data.exceptions)
    } else {
      setExceptions((prev) => [...prev, ...data.exceptions])
    }
    setLoading(false)
  }, [filterProduct, filterSeverity])

  useEffect(() => {
    load(0)
    setOffset(0)
  }, [load])

  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])

  const loadMore = () => {
    const next = offset + PAGE_SIZE
    setOffset(next)
    load(next)
  }

  const handleFilterChange = (type: "product" | "severity", value: string) => {
    if (type === "product") setFilterProduct(value)
    else setFilterSeverity(value)
  }

  const handleStatusChange = (id: number, status: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: status as any } : e))
    )
  }

  const hasMore = exceptions.length < total

  return {
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
  }
}
