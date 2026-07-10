import sys
sys.path.insert(0, "backend")
from seed import load_raw_csv, parse_date, clean_sku, parse_float

plan_rows = load_raw_csv("candidate_pack/data/production_plan.csv")
actual_rows = load_raw_csv("candidate_pack/data/actual_production.csv")

# Build full plan map
plan_map = {}
for r in plan_rows:
    d = parse_date(r["plan_date"])
    sku = clean_sku(r["sku"])
    pu = parse_float(r["planned_units"])
    if d is None or pu is None:
        continue
    plan_map[(d, sku)] = pu

actual_map = {}
for r in actual_rows:
    d = parse_date(r["date"])
    sku = clean_sku(r["product_code"])
    up = parse_float(r["units_produced"])
    if d is None or up is None:
        continue
    actual_map[(d, sku)] = up

print(f"Plan entries: {len(plan_map)}, Actual entries: {len(actual_map)}")

matching = 0
exceptions = 0
for key, planned in plan_map.items():
    actual = actual_map.get(key)
    if actual is None:
        continue
    matching += 1
    if actual < 0.9 * planned:
        exceptions += 1

print(f"Matching entries: {matching}")
print(f"Exceptions found: {exceptions}")

# Check if actual has different data
if matching == 0:
    sample_plan_key = next(iter(plan_map))
    sample_actual_key = next(iter(actual_map))
    print(f"Sample plan key: {sample_plan_key}")
    print(f"Sample actual key: {sample_actual_key}")
    # Look for the plan key in actual keys at different variations
    date, sku = sample_plan_key
    print(f"Searching actual for date={date}, sku={sku}")
    for d, s in actual_map:
        if d == date and s == sku:
            print("  Found exact match!")
            break
    else:
        print("  No exact match found")
        # Try without the date
        for d, s in actual_map:
            if s == sku:
                print(f"  Found sku {sku} on date {d}")
                break
        else:
            print(f"  No entries for sku {sku}")
            # Show all unique SKUs in actual
            actual_skus = set(s for _, s in actual_map)
            print(f"  Actual SKUs: {sorted(actual_skus)[:5]}...")
            plan_skus = set(s for _, s in plan_map)
            print(f"  Plan SKUs: {sorted(plan_skus)[:5]}...")
            print(f"  Plan SKUs - Actual SKUs: {plan_skus - actual_skus}")
