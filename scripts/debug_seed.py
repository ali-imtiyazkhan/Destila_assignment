import sys
sys.path.insert(0, "backend")
from seed import load_raw_csv, parse_date, clean_sku, parse_float

# Check plan dates
plan_rows = load_raw_csv("candidate_pack/data/production_plan.csv")
print(f"Total plan rows: {len(plan_rows)}")
bad_dates = 0
bad_units = 0
for r in plan_rows:
    d = parse_date(r["plan_date"])
    pu = parse_float(r["planned_units"])
    if d is None:
        bad_dates += 1
        if bad_dates <= 3:
            print(f"  Bad date: '{r['plan_date']}'")
    if pu is None:
        bad_units += 1
        if bad_units <= 3:
            print(f"  Bad units: '{r['planned_units']}' for date {r['plan_date']} sku {r['sku']}")
print(f"Bad dates: {bad_dates}, Bad units: {bad_units}")

# Check actual dates
actual_rows = load_raw_csv("candidate_pack/data/actual_production.csv")
print(f"Total actual rows: {len(actual_rows)}")
bad_dates_a = 0
for r in actual_rows:
    d = parse_date(r["date"])
    if d is None:
        bad_dates_a += 1
print(f"Bad actual dates: {bad_dates_a}")

# Build key sets
plan_keys = set()
for r in plan_rows:
    d = parse_date(r["plan_date"])
    pu = parse_float(r["planned_units"])
    sku = clean_sku(r["sku"])
    if d and pu:
        plan_keys.add((d, sku))

actual_keys = set()
for r in actual_rows:
    d = parse_date(r["date"])
    up = parse_float(r["units_produced"])
    sku = clean_sku(r["product_code"])
    if d and up:
        actual_keys.add((d, sku))

matching = plan_keys & actual_keys
print(f"Plan keys: {len(plan_keys)}, Actual keys: {len(actual_keys)}, Matching: {len(matching)}")

# Show a few matching keys
for k in list(matching)[:5]:
    print(f"  Match: {k}")

# Check key differences
only_plan = plan_keys - actual_keys
only_actual = actual_keys - plan_keys
print(f"Only in plan: {len(only_plan)}, e.g. {list(only_plan)[:3]}")
print(f"Only in actual: {len(only_actual)}, e.g. {list(only_actual)[:3]}")
