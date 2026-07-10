from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class TrendPoint(BaseModel):
    date: date
    planned_units: float
    units_produced: float
    model_config = ConfigDict(from_attributes=True)


class ExceptionDetail(BaseModel):
    id: int
    product_code: str
    plant: str
    date: date
    planned_units: float
    units_produced: float
    deficit_pct: float
    severity: str
    status: str
    trend: list[TrendPoint]
    model_config = ConfigDict(from_attributes=True)


class ExceptionOut(BaseModel):
    id: int
    product_code: str
    plant: str
    date: date
    planned_units: float
    units_produced: float
    deficit_pct: float
    severity: str
    status: str
    model_config = ConfigDict(from_attributes=True)


class ExceptionPatch(BaseModel):
    status: str


class ExceptionListResponse(BaseModel):
    exceptions: list[ExceptionOut]
    total: int
