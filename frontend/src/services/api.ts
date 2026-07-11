import type { ExceptionListResponse, ExceptionDetail, ExceptionItem } from "../types"

const BASE = import.meta.env.VITE_API_URL ?? ""

export async function fetchExceptions(params: {
  product_code?: string
  severity?: string
  date?: string
  offset?: number
  limit?: number
}): Promise<ExceptionListResponse> {
  const qs = new URLSearchParams()
  if (params.product_code) qs.set("product_code", params.product_code)
  if (params.severity) qs.set("severity", params.severity)
  if (params.date) qs.set("date", params.date)
  if (params.offset !== undefined) qs.set("offset", String(params.offset))
  if (params.limit !== undefined) qs.set("limit", String(params.limit))
  const res = await fetch(`${BASE}/exceptions?${qs}`)
  if (!res.ok) throw new Error(`Failed to fetch exceptions: ${res.status}`)
  return res.json()
}

export async function fetchExceptionDetail(
  id: number
): Promise<ExceptionDetail> {
  const res = await fetch(`${BASE}/exceptions/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch exception detail: ${res.status}`)
  return res.json()
}

export async function batchUpdateStatus(
  ids: number[],
  status: string
): Promise<{ updated: number }> {
  const res = await fetch(`${BASE}/exceptions/batch`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, status }),
  })
  if (!res.ok) throw new Error(`Failed to batch update: ${res.status}`)
  return res.json()
}

export async function updateExceptionStatus(
  id: number,
  status: string
): Promise<void> {
  const res = await fetch(`${BASE}/exceptions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Failed to update status: ${res.status}`)
}

export interface SummaryData {
  total: number
  high: number
  medium: number
  open: number
  acknowledged: number
  resolved: number
  avg_deficit_pct: number
}

export async function fetchSummary(): Promise<SummaryData> {
  const res = await fetch(`${BASE}/exceptions/summary`)
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`)
  return res.json()
}

export async function fetchDates(): Promise<string[]> {
  const res = await fetch(`${BASE}/exceptions/dates`)
  if (!res.ok) throw new Error(`Failed to fetch dates: ${res.status}`)
  const data = await res.json()
  return data.dates
}

export async function fetchProducts(): Promise<string[]> {
  const res = await fetch(`${BASE}/products`)
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  const data = await res.json()
  return data.products
}

export async function fetchAiSummary(): Promise<{ summary: string }> {
  const res = await fetch(`${BASE}/exceptions/summary/ai`)
  if (!res.ok) throw new Error(`Failed to fetch AI summary: ${res.status}`)
  return res.json()
}

export async function fetchAiInsight(id: number): Promise<{ insight: string }> {
  const res = await fetch(`${BASE}/exceptions/${id}/analyze`)
  if (!res.ok) throw new Error(`Failed to fetch AI insight: ${res.status}`)
  return res.json()
}

export interface NLSearchResult {
  query: string
  params: Record<string, string | null>
  exceptions: ExceptionItem[]
  total: number
}

export async function nlSearch(query: string): Promise<NLSearchResult> {
  const res = await fetch(`${BASE}/exceptions/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`NL search failed: ${res.status}`)
  return res.json()
}
