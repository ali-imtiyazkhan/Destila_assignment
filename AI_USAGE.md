# AI Usage Report

## Tools Used

- **OpenCode (DeepSeek V4 Flash Free)** — used to generate the backend code (models, schemas, seed script, API endpoints), debug scripts, supporting documents, React frontend components, Docker setup, and test suites. All work was done interactively through the OpenCode CLI tool.

## Key Prompts

1. *"Look at the data files and help me understand what quirks they have — date formats, whitespace, missing values, etc."* → The AI explored the CSVs and identified mixed date formats, whitespace in SKUs, negative/empty planned_units. I used this to build the cleaning logic.

2. *"Generate the FastAPI backend with SQLAlchemy models for raw/clean/exceptions tables, seed script, and API endpoints."* → AI produced the full backend scaffold. I reviewed and adjusted the sorting order and trend query after reading the assignment spec more carefully.

3. *"Create a React inbox UI with day-by-day timeline, collapsible day groups, severity badges, filters, detail panel with 7-day trend, and acknowledge/resolve buttons."* → AI generated all React components (Header, SeverityBadge, ExceptionCard, ExceptionDayGroup, ExceptionDetail, ExceptionList), the API layer, TypeScript types, and styling using the Seoptic design system.

4. *"Add Docker setup for one-command run of both backend and frontend."* → AI created multi-stage Dockerfile for the frontend with nginx, updated docker-compose.yml with both services, and added nginx config for API proxying.

5. *"Add full-stack tests: backend API tests and frontend component tests."* → AI generated 17 pytest tests covering all API endpoints (list, filter, detail, patch, products) and 14 vitest tests covering frontend components (Header, SeverityBadge, ExceptionCard, ExceptionDayGroup).

6. *"Add AI features: root cause analysis, daily summary, natural language search with Gemini support."* → AI created the LLM provider abstraction (mock/OpenAI/Gemini), AI router with 3 endpoints, and frontend components (AiInsight, AiSummary, AiFilterBar). I configured the Gemini provider to use its native API format.

## Where AI Was Wrong & How I Caught It

1. **Sort order**: The AI initially sorted exceptions with `deficit_pct ASC` (ascending), which puts the smallest deficit first. The assignment spec says "within the same day, sort worst deficit first" — meaning largest deficit first. I caught this by re-reading the spec while testing and corrected it to `DESC`.

2. **7-day trend window**: The AI's trend query included the exception date itself (`<= exc.date`); the spec asks for the "last-7-days" trend, meaning preceding days only. I changed the filter from `<=` to `<`.

3. **SQLite in-memory test DB**: The AI's test setup used `sqlite:///:memory:` without `StaticPool`, which caused "no such table" errors because each SQLite connection gets its own in-memory database. I added `poolclass=StaticPool` to share the same connection across the test session.

## AI vs Hand-Written Split

- AI-generated (minor edits): ~75%
- Heavily edited / hand-written: ~25%
