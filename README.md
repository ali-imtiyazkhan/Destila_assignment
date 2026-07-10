# Mini Exception Inbox

Ingests production plan and actual production CSVs, detects deficit exceptions (actual < 90% of planned), and serves them via a REST API.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  production_plan │    │                  │    │  FastAPI Backend │
│  actual_prod.csv │ →  │  seed.py         │ →  │  GET /exceptions │
│  (candidate_pack │    │  (ingest + clean │    │  GET /{id}       │
│   /data/)        │    │   + detect)      │    │  PATCH /{id}     │
└─────────────────┘    └──────┬───────────┘    └────────┬─────────┘
                              │                         │
                              ↓                         │
                       ┌──────────────┐                 │
                       │   SQLite DB  │ ←───────────────┘
                       │  exception_  │
                       │  inbox.db    │
                       └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| Server | Uvicorn |

## Database Schema

- **raw_plan** / **raw_actual** — raw CSV import, all text columns
- **clean_plan** / **clean_actual** — cleaned with proper types (Date, Float), rejects invalid rows
- **exceptions** — materialized deficit exceptions with severity (high/medium) and status (open/acknowledged/resolved)

## Running

### Without Docker

```bash
cd backend
pip install -r requirements.txt
python seed.py          # ingest CSVs and detect exceptions
uvicorn main:app --reload  # serves at http://localhost:8000
```

### With Docker (one command)

```bash
docker-compose up --build
```

API docs available at `http://localhost:8000/docs`.
