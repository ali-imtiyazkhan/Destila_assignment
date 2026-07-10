# AI Usage Report

## Tools Used

- **OpenCode (DeepSeek V4 Flash Free)** — used to generate the backend code (models, schemas, seed script, API endpoints), debug scripts, and supporting documents. All work was done interactively through the OpenCode CLI tool.

## Key Prompts

1. *"Look at the data files and help me understand what quirks they have — date formats, whitespace, missing values, etc."* → The AI explored the CSVs and identified mixed date formats, whitespace in SKUs, negative/empty planned_units. I used this to build the cleaning logic.

2. *"Generate the FastAPI backend with SQLAlchemy models for raw/clean/exceptions tables, seed script, and API endpoints."* → AI produced the full backend scaffold. I reviewed and adjusted the sorting order and trend query after reading the assignment spec more carefully.

3. *"Create the debug scripts to validate the data and exception counts."* → AI generated debug_seed.py and debug_seed2.py. I ran these to verify the seed logic produced correct results.

## Where AI Was Wrong & How I Caught It

The AI initially sorted exceptions with `deficit_pct ASC` (ascending), which puts the smallest deficit first. The assignment spec says "within the same day, sort worst deficit first" — meaning largest deficit first. I caught this by re-reading the spec while testing and corrected it to `DESC`. Similarly, the 7-day trend included the exception date itself; the spec asks for the "last-7-days" trend, so I changed the filter from `<=` to `<` to show only preceding days.

## AI vs Hand-Written Split

- AI-generated (minor edits): ~85%
- Heavily edited / hand-written: ~15%
