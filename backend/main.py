from datetime import date
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from database import get_db, engine, Base
from models import Exception as ExceptionModel, CleanPlan, CleanActual
from schemas import ExceptionOut, ExceptionDetail, TrendPoint, ExceptionPatch, ExceptionListResponse

app = FastAPI(title="Mini Exception Inbox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/exceptions", response_model=ExceptionListResponse)
def list_exceptions(
    product_code: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ExceptionModel)

    if product_code:
        query = query.filter(ExceptionModel.product_code == product_code.upper())
    if severity:
        query = query.filter(ExceptionModel.severity == severity)

    total = query.count()

    exceptions = (
        query
        .order_by(desc(ExceptionModel.date), desc(ExceptionModel.deficit_pct))
        .all()
    )

    return ExceptionListResponse(
        exceptions=[ExceptionOut.model_validate(e) for e in exceptions],
        total=total,
    )


@app.get("/exceptions/{exception_id}", response_model=ExceptionDetail)
def get_exception(exception_id: int, db: Session = Depends(get_db)):
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
        .order_by(desc(CleanPlan.date))
        .limit(7)
        .all()
    )

    trend = []
    for plan, actual in reversed(trend_rows):
        trend.append(
            TrendPoint(
                date=plan.date,
                planned_units=plan.planned_units,
                units_produced=actual.units_produced if actual else 0,
            )
        )

    return ExceptionDetail(
        id=exc.id,
        product_code=exc.product_code,
        plant=exc.plant,
        date=exc.date,
        planned_units=exc.planned_units,
        units_produced=exc.units_produced,
        deficit_pct=exc.deficit_pct,
        severity=exc.severity,
        status=exc.status,
        trend=trend,
    )


@app.patch("/exceptions/{exception_id}", response_model=ExceptionOut)
def update_exception_status(exception_id: int, body: ExceptionPatch, db: Session = Depends(get_db)):
    if body.status not in ("acknowledged", "resolved"):
        raise HTTPException(status_code=400, detail="Status must be 'acknowledged' or 'resolved'")

    exc = db.query(ExceptionModel).filter(ExceptionModel.id == exception_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    exc.status = body.status
    db.commit()
    db.refresh(exc)

    return ExceptionOut.model_validate(exc)


@app.get("/products")
def list_products(db: Session = Depends(get_db)):
    results = db.query(ExceptionModel.product_code).distinct().all()
    return {"products": sorted(set(r[0] for r in results))}
