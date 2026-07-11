from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.llm import llm_chat
from app.models import Exception as ExceptionModel, CleanPlan, CleanActual

router = APIRouter()


@router.get("/exceptions/summary/ai")
async def ai_summary(db: Session = Depends(get_db)):
    total = db.query(ExceptionModel).count()
    if total == 0:
        return {"summary": "No exceptions to report."}

    high = db.query(ExceptionModel).filter(ExceptionModel.severity == "high").count()
    medium = db.query(ExceptionModel).filter(ExceptionModel.severity == "medium").count()
    open_ = db.query(ExceptionModel).filter(ExceptionModel.status == "open").count()
    ack = db.query(ExceptionModel).filter(ExceptionModel.status == "acknowledged").count()
    resolved = db.query(ExceptionModel).filter(ExceptionModel.status == "resolved").count()
    avg = round(float(db.query(func.avg(ExceptionModel.deficit_pct)).scalar() or 0.0), 2)

    prompt = (
        f"Total exceptions: {total}. High severity: {high}, Medium: {medium}. "
        f"Open: {open_}, Acknowledged: {ack}, Resolved: {resolved}. "
        f"Average deficit: {avg}%."
    )

    summary = await llm_chat([{"role": "user", "content": prompt}], tool="summary")
    return {"summary": summary}


@router.get("/exceptions/{exception_id}/analyze")
async def analyze_exception(exception_id: int, db: Session = Depends(get_db)):
    exc = db.query(ExceptionModel).filter(ExceptionModel.id == exception_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    trend_rows = (
        db.query(CleanPlan, CleanActual)
        .outerjoin(
            CleanActual,
            (CleanPlan.date == CleanActual.date)
            & (CleanPlan.product_code == CleanActual.product_code),
        )
        .filter(
            CleanPlan.product_code == exc.product_code,
            CleanPlan.date < exc.date,
        )
        .order_by(CleanPlan.date.desc())
        .limit(7)
        .all()
    )

    trend_str = "; ".join(
        f"{p.date}: planned {p.planned_units}, actual {a.units_produced if a else 0}"
        for p, a in reversed(trend_rows)
    )

    prompt = (
        f"Product: {exc.product_code}, Plant: {exc.plant}, Date: {exc.date}, "
        f"Planned: {exc.planned_units}, Actual: {exc.units_produced}, "
        f"Deficit: {exc.deficit_pct}%, Severity: {exc.severity}. "
        f"Prior 7-day trend: {trend_str}"
    )

    insight = await llm_chat([{"role": "user", "content": prompt}], tool="analyze")
    return {"insight": insight}


class NLSearchBody:
    def __init__(self, query: str):
        self.query = query


from pydantic import BaseModel


class NLSearchRequest(BaseModel):
    query: str


@router.post("/exceptions/search")
async def nl_search(body: NLSearchRequest, db: Session = Depends(get_db)):
    result = await llm_chat(
        [{"role": "user", "content": body.query}],
        tool="translate",
    )

    import json as json_mod

    try:
        params = json_mod.loads(result)
    except (json_mod.JSONDecodeError, ValueError):
        params = {}

    product_code = params.get("product_code")
    severity = params.get("severity")
    date_str = params.get("date")

    query = db.query(ExceptionModel)
    if product_code:
        query = query.filter(ExceptionModel.product_code == product_code.upper())
    if severity:
        query = query.filter(ExceptionModel.severity == severity)
    if date_str:
        query = query.filter(ExceptionModel.date == date_str)

    total = query.count()
    exceptions = query.order_by(ExceptionModel.date.desc(), ExceptionModel.deficit_pct.desc()).limit(50).all()

    from app.schemas import ExceptionOut

    return {
        "query": body.query,
        "params": params,
        "exceptions": [ExceptionOut.model_validate(e) for e in exceptions],
        "total": total,
    }
