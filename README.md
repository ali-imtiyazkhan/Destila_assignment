# Mini Exception Inbox

Ingests production plan and actual production CSVs, detects deficit exceptions (actual < 90% of planned), and serves them through a REST API with a React inbox UI.

## Architecture

```
production_plan.csv ──→ raw_plan ──→ clean_plan ──┐
                                                    ├──→ exceptions table ──→ FastAPI ──→ React UI
actual_production.csv → raw_actual → clean_actual ─┘                              ↑
                                                                           nginx proxy (Docker)
```

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  React Frontend │ ←── │  nginx / Vite    │ ←── │  FastAPI Backend │
│  (Inbox UI)     │     │  (proxy /api)    │     │  GET /exceptions │
└─────────────────┘     └──────────────────┘     │  PATCH /{id}     │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │   SQLite DB      │
                                                  │ exception_inbox.db │
                                                  └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.12) |
| Database | SQLite via SQLAlchemy |
| Server | Uvicorn |
| Frontend | React 19 + TypeScript + Vite |
| Charts | Recharts (7-day trend) |
| Tests | pytest (backend) + Vitest (frontend) |

## Database Schema

- **raw_plan** / **raw_actual** — raw CSV import, all text columns
- **clean_plan** / **clean_actual** — cleaned with proper types (Date, Float), rejects invalid rows
- **exceptions** — materialized deficit exceptions with severity (high/medium) and status (open/acknowledged/resolved)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/exceptions` | List exceptions (filter by `product_code`, `severity`; paginated) |
| GET | `/exceptions/summary` | Aggregate counts and avg deficit |
| GET | `/exceptions/{id}` | Detail with 7-day trend |
| PATCH | `/exceptions/{id}` | Set status to `acknowledged` or `resolved` |
| PATCH | `/exceptions/batch` | Batch status update |
| GET | `/products` | Distinct product codes |

## Running

### One command (Docker)

```bash
docker-compose up --build
```

- **Frontend:** http://localhost
- **API docs:** http://localhost/docs

### Without Docker

**Backend:**

```bash
cd backend
pip install -r requirements.txt
python -m app.seed          # ingest CSVs and detect exceptions
uvicorn app.main:app --reload --port 8000
```

**Frontend (separate terminal):**

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies API to :8000)
```

## Deployment

### Backend → Render

1. Push repo to GitHub and connect it to [Render](https://render.com).
2. Create a **Web Service**, select the repo.
3. Set:
   - **Root Directory:** *leave blank*
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add any env vars (`LLM_PROVIDER`, `LLM_API_KEY`, etc.) in the Render dashboard.
5. Deploy. Copy the URL (e.g. `https://your-app.onrender.com`).

### Frontend → Vercel

1. Push repo to GitHub and connect it to [Vercel](https://vercel.com).
2. Vercel auto-detects Vite. Set:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add an environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://your-app.onrender.com`)
4. Deploy.

### Tests

```bash
# Backend (29 tests)
cd backend && python -m pytest tests/ -v

# Frontend (17 tests)
cd frontend && npm test
```

## Features

- Day-by-day timeline inbox (newest first, worst deficit first within each day)
- Collapsible day groups with batch acknowledge/resolve
- Product and severity filters
- Slide-out detail panel with stats and 7-day bar chart
- Status updates without page reload
- Summary cards with live refresh
- Dark mode toggle
- CSV export
