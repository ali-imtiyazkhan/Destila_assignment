from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exception as ExceptionModel, CleanPlan, CleanActual
from app.schemas import ExceptionOut, ExceptionDetail, TrendPoint, ExceptionPatch, ExceptionListResponse, SummaryOut, BatchPatch

router = APIRouter()


@router.get("/exceptions", response_model=ExceptionListResponse)
def list_exceptions(
    product_code: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
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
        .offset(offset)
        .limit(limit)
        .all()
    )

    return ExceptionListResponse(
        exceptions=[ExceptionOut.model_validate(e) for e in exceptions],
        total=total,
    )


@router.get("/exceptions/summary", response_model=SummaryOut)
def get_summary(db: Session = Depends(get_db)):
    total = db.query(ExceptionModel).count()
    high = db.query(ExceptionModel).filter(ExceptionModel.severity == "high").count()
    medium = db.query(ExceptionModel).filter(ExceptionModel.severity == "medium").count()
    open_ = db.query(ExceptionModel).filter(ExceptionModel.status == "open").count()
    ack = db.query(ExceptionModel).filter(ExceptionModel.status == "acknowledged").count()
    resolved = db.query(ExceptionModel).filter(ExceptionModel.status == "resolved").count()
    avg = db.query(func.avg(ExceptionModel.deficit_pct)).scalar() or 0.0

    return SummaryOut(
        total=total, high=high, medium=medium,
        open=open_, acknowledged=ack, resolved=resolved,
        avg_deficit_pct=round(float(avg), 2),
    )


@router.patch("/exceptions/batch")
def batch_update(body: BatchPatch, db: Session = Depends(get_db)):
    if not body.ids:
        raise HTTPException(status_code=400, detail="At least one exception id is required")
    if body.status not in ("acknowledged", "resolved"):
        raise HTTPException(status_code=400, detail="Status must be 'acknowledged' or 'resolved'")

    updated = db.query(ExceptionModel).filter(
        ExceptionModel.id.in_(body.ids),
        ExceptionModel.status != body.status,
    ).update({"status": body.status}, synchronize_session=False)
    db.commit()
    return {"updated": updated}


@router.get("/exceptions/{exception_id}", response_model=ExceptionDetail)
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


@router.patch("/exceptions/{exception_id}", response_model=ExceptionOut)
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


@router.get("/products")
def list_products(db: Session = Depends(get_db)):
    results = db.query(ExceptionModel.product_code).distinct().all()
    return {"products": sorted(set(r[0] for r in results))}
