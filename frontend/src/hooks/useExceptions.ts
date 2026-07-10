import { useState, useEffect, useCallback } from "react"
import type { ExceptionItem } from "../types"
import { fetchExceptions, fetchProducts } from "../services/api"

export function useExceptions() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([])
  const [products, setProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("")

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

  return {
    exceptions,
    products,
    loading,
    filterProduct,
    filterSeverity,
    setFilterProduct,
    setFilterSeverity,
    handleStatusChange,
  }
}
