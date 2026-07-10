import csv
import re
from datetime import datetime
from dateutil import parser as dateparser
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import RawPlan, RawActual, CleanPlan, CleanActual, Exception

CSV_DIR = r"C:\Users\my\Downloads\Destila_Intern\candidate_pack\data"


def load_raw_csv(filepath: str):
    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def clean_sku(sku: str) -> str:
    return sku.strip().upper()


def parse_date(val: str):
    val = val.strip()
    try:
        return dateparser.parse(val, dayfirst=True).date()
    except (ValueError, TypeError):
        return None


def parse_float(val: str):
    if val is None:
        return None
    val = val.strip()
    if val == "":
        return None
    try:
        v = float(val)
        if v < 0:
            return None
        return v
    except (ValueError, TypeError):
        return None


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(Exception).first()
    if existing:
        print("Database already seeded. Skipping.")
        db.close()
        return

    raw_plan_rows = load_raw_csv(f"{CSV_DIR}/production_plan.csv")
    for r in raw_plan_rows:
        db.add(RawPlan(**r))
    db.commit()

    raw_actual_rows = load_raw_csv(f"{CSV_DIR}/actual_production.csv")
    for r in raw_actual_rows:
        db.add(RawActual(**r))
    db.commit()
    print(f"Loaded {len(raw_plan_rows)} raw plan rows, {len(raw_actual_rows)} raw actual rows")

    cleaned_plans = []
    for r in raw_plan_rows:
        d = parse_date(r["plan_date"])
        sku = clean_sku(r["sku"])
        pu = parse_float(r["planned_units"])
        if d is None or pu is None:
            continue
        cleaned_plans.append(CleanPlan(date=d, plant=r["plant"].strip(), product_code=sku, planned_units=pu))
    db.add_all(cleaned_plans)
    db.commit()
    print(f"Inserted {len(cleaned_plans)} clean plan rows")

    cleaned_actuals = []
    for r in raw_actual_rows:
        d = parse_date(r["date"])
        sku = clean_sku(r["product_code"])
        up = parse_float(r["units_produced"])
        if d is None or up is None:
            continue
        cleaned_actuals.append(CleanActual(date=d, plant_id=r["plant_id"].strip(), product_code=sku, units_produced=up))
    db.add_all(cleaned_actuals)
    db.commit()
    print(f"Inserted {len(cleaned_actuals)} clean actual rows")

    plan_map = {}
    for p in cleaned_plans:
        plan_map[(p.date, p.product_code)] = p.planned_units

    actual_map = {}
    for a in cleaned_actuals:
        key = (a.date, a.product_code)
        actual_map[key] = a.units_produced

    exceptions = []
    for (date_key, product_code), planned in plan_map.items():
        actual = actual_map.get((date_key, product_code))
        if actual is None:
            continue
        if actual < 0.9 * planned:
            deficit_pct = round((planned - actual) / planned * 100, 2)
            severity = "high" if actual < 0.7 * planned else "medium"
            exceptions.append(
                Exception(
                    product_code=product_code,
                    plant="PLANT-1",
                    date=date_key,
                    planned_units=planned,
                    units_produced=actual,
                    deficit_pct=deficit_pct,
                    severity=severity,
                    status="open",
                )
            )

    db.add_all(exceptions)
    db.commit()
    print(f"Created {len(exceptions)} exceptions")

    db.close()


if __name__ == "__main__":
    seed()
