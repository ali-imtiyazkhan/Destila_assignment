export interface ExceptionItem {
  id: number
  product_code: string
  plant: string
  date: string
  planned_units: number
  units_produced: number
  deficit_pct: number
  severity: "high" | "medium"
  status: "open" | "acknowledged" | "resolved"
}

export interface TrendPoint {
  date: string
  planned_units: number
  units_produced: number
}

export interface ExceptionDetail extends ExceptionItem {
  trend: TrendPoint[]
}

export interface ExceptionListResponse {
  exceptions: ExceptionItem[]
  total: number
}
