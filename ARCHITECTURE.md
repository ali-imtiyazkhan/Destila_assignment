# Architecture — Mini Exception Inbox

## System Overview

A full-stack application that ingests production plan and actual production CSVs, detects deficit exceptions (actual < 90% of planned), and serves them through a FastAPI REST API with a React inbox UI. Includes LLM-powered root cause analysis, daily summaries, and natural language search.

## Architecture Diagram

```
production_plan.csv ──→ raw_plan ──→ clean_plan ──┐
                                                    ├──→ exceptions table ──→ FastAPI ──→ React UI
actual_production.csv → raw_actual → clean_actual ─┘                              ↑
                                                                         nginx / Vite proxy (dev)
                                                                         Vercel → Render (prod)
                                            ┌─────────────────────┐
                                            │  LLM Provider       │
                                            │  (mock / OpenAI /   │
                                            │   Gemini)           │
                                            └─────────┬───────────┘
                                                      ↑
                                            analyze, summary, search
```

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Database | SQLite via SQLAlchemy | Zero setup, sufficient for scope |
| Backend | FastAPI (Python 3.12) | Automatic OpenAPI docs, async support |
| Server | Uvicorn | ASGI server for FastAPI |
| Frontend | React 19 + TypeScript + Vite | Fast dev loop, type safety |
| Charts | Recharts | Declarative React charting |
| LLM | OpenAI-compatible / Gemini / Mock | Pluggable AI for insights |
| Container | Docker + Docker Compose | Reproducible environment |
| Prod Backend | Render | Simple Python deployment |
| Prod Frontend | Vercel | Zero-config Vite deployment |

## Database Schema

```
raw_plan (id, plan_date, plant, sku, planned_units)        ← raw CSV, all text
raw_actual (id, date, plant_id, product_code, units_produced) ← raw CSV, all text
     ↓ (parse + validate)                          ↓
clean_plan (id, date, plant, product_code, planned_units)  ← typed, invalid rows excluded
clean_actual (id, date, plant_id, product_code, units_produced) ← typed, invalid rows excluded
     ↓ (join on date + product_code, deficit < 90%)
exceptions (id, product_code, plant, date, planned_units, units_produced, deficit_pct, severity, status)
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           — FastAPI app, lifespan, CORS, router registration
│   │   ├── config.py         — Paths, DB URL, LLM provider settings
│   │   ├── database.py       — SQLAlchemy engine, session, Base
│   │   ├── models.py         — ORM models (RawPlan, RawActual, CleanPlan, CleanActual, Exception)
│   │   ├── schemas.py        — Pydantic request/response models
│   │   ├── seed.py           — CSV ingestion, cleaning, exception detection
│   │   ├── llm.py            — LLM client (mock / OpenAI / Gemini providers)
│   │   └── routers/
│   │       ├── exceptions.py — CRUD endpoints for exceptions
│   │       └── ai.py         — AI analysis, summary, NL search endpoints
│   ├── tests/
│   │   ├── conftest.py       — Test DB fixture with seed data
│   │   └── test_api.py       — 29 API tests
│   ├── requirements.txt
│   └── pyproject.toml        — Ruff config
├── frontend/
│   ├── src/
│   │   ├── App.tsx           — Root component, layout
│   │   ├── App.css           — Full app styling + responsive breakpoints
│   │   ├── components/
│   │   │   ├── Header.tsx, Hero.tsx, Footer.tsx
│   │   │   ├── ExceptionList.tsx, ExceptionDayGroup.tsx, ExceptionCard.tsx
│   │   │   ├── ExceptionDetail.tsx, SeverityBadge.tsx
│   │   │   ├── SummaryCards.tsx, CalendarSidebar.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── AiInsight.tsx     — Root cause analysis button
│   │   │   ├── AiSummary.tsx     — Daily NL summary
│   │   │   └── AiFilterBar.tsx   — NL search bar
│   │   ├── hooks/
│   │   │   ├── useExceptions.ts  — Exception data, filters, pagination
│   │   │   └── useDarkMode.ts    — Dark mode toggle
│   │   ├── services/api.ts       — All API calls
│   │   └── types/index.ts        — TypeScript interfaces
│   ├── __tests__/               — 6 test files, 28 tests
│   ├── vercel.json              — SPA rewrites
│   └── vite.config.ts
├── data/                        — CSV input files
├── .dockerignore, Dockerfile, docker-compose.yml
├── Procfile                     — Render start command
├── .env.example
├── AI_USAGE.md
├── APPROACH.md
└── README.md
```

## Key Decisions

- **SQLite over Postgres**: Zero setup, sufficient for this scope. The DB is ephemeral on Render (seeded on each deploy).
- **Raw/Clean table separation**: Keeps raw CSV data for auditability while providing typed tables for computation.
- **Materialized exceptions table**: Pre-computed at seed time for fast reads, avoids expensive joins on every request.
- **LLM provider abstraction**: Pluggable mock/OpenAI/Gemini via env vars. Defaults to mock so the app works without any API key.
- **Day-by-day timeline**: Exceptions grouped by date, sorted newest first, worst deficit first within each day (per spec).
- **Slide-out detail panel**: Side panel instead of page navigation for quick scanning of the inbox.
- **Vite proxy in dev, env var in prod**: Dev uses local proxy to backend; production uses `VITE_API_URL` pointing to Render.

## Running

See [README.md](./README.md) for full instructions. Quick start:

```bash
docker-compose up --build
```
