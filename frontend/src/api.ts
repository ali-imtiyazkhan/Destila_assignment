import type { ExceptionListResponse, ExceptionDetail } from "./types"

const BASE = ""

export async function fetchExceptions(params: {
  product_code?: string
  severity?: string
}): Promise<ExceptionListResponse> {
  const qs = new URLSearchParams()
  if (params.product_code) qs.set("product_code", params.product_code)
  if (params.severity) qs.set("severity", params.severity)
  const res = await fetch(`${BASE}/exceptions?${qs}`)
  return res.json()
}

export async function fetchExceptionDetail(
  id: number
): Promise<ExceptionDetail> {
  const res = await fetch(`${BASE}/exceptions/${id}`)
  return res.json()
}

export async function updateExceptionStatus(
  id: number,
  status: string
): Promise<void> {
  await fetch(`${BASE}/exceptions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
}

export async function fetchProducts(): Promise<string[]> {
  const res = await fetch(`${BASE}/products`)
  const data = await res.json()
  return data.products
}
