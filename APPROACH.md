# Approach

## Problem Breakdown

1. **Data exploration** — inspected both CSVs for format inconsistencies, missing values, and edge cases
2. **Schema design** — raw/clean separation per assignment spec, materialized exceptions table
3. **Ingestion pipeline** — CSV → raw tables → clean tables (with validation) → exception detection
4. **API** — FastAPI with 4 endpoints, filtering, sorting, status mutation
5. **Frontend** — React inbox UI with day-by-day timeline, filters, detail panel, status updates
6. **Docker** — multi-service setup with nginx proxy and one-command run
7. **Tests** — 17 backend API tests (pytest) + 14 frontend component tests (vitest)

## Process Flow

```
production_plan.csv ──→ raw_plan ──→ clean_plan ──┐
                                                    ├──→ exceptions table ──→ FastAPI ──→ React UI
actual_production.csv → raw_actual → clean_actual ─┘                              ↑
                                                                           nginx proxy (Docker)
```

## Data Decisions

- **Mixed date formats**: `dateutil.parser` with `dayfirst=True` handles both `YYYY-MM-DD` and `DD/MM/YYYY`
- **Whitespace in SKUs**: stripped and uppercased for consistent matching
- **Negative/empty planned_units**: treated as invalid rows (rejected from clean tables)
- **Key matching**: exceptions matched on `(date, product_code)` composite key between plan and actual

## Schema & Why

- **raw_plan/raw_actual**: store CSV data verbatim (all text) for auditability
- **clean_plan/clean_actual**: typed columns, invalid rows excluded — the source of truth for computation
- **exceptions**: materialized per assignment spec; tracks severity and mutable status

## API Design Notes

- `deficit_pct` sorted descending within the same day (worst first per spec)
- CORS enabled for frontend development
- Pydantic v2 for request/response validation
- 7-day trend excludes the exception date (shows preceding days only)

## Frontend Design

- **React + TypeScript + Vite** for fast development
- **Seoptic-inspired design system**: orange primary, Inter fonts, pill badges, smooth transitions
- Day-by-day timeline with collapsible groups, filters (product, severity), slide-out detail panel
- Acknowledge/resolve buttons update UI instantly without full page reload

## Docker

- Multi-stage `Dockerfile` for frontend (Node build + nginx serve)
- `docker-compose.yml` with backend and frontend services
- Nginx proxies API requests to the backend container

## Tradeoffs & Shortcuts

- **SQLite** instead of Postgres — zero setup, sufficient for scope
- **Single plant** assumption — data only contains PLANT-1
- **No pagination** — dataset is small enough
- **No chart library** — 7-day trend shown as a table rather than a chart

## Next Steps

- Add pagination for larger datasets
- Support multiple plants dynamically
- Add a chart library (e.g., Chart.js) for visual 7-day trend
- Add dark mode support
