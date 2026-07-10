from sqlalchemy import Column, Integer, String, Float, Date, Text
from app.database import Base


class RawPlan(Base):
    __tablename__ = "raw_plan"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_date = Column(Text)
    plant = Column(Text)
    sku = Column(Text)
    planned_units = Column(Text)


class RawActual(Base):
    __tablename__ = "raw_actual"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Text)
    plant_id = Column(Text)
    product_code = Column(Text)
    units_produced = Column(Text)


class CleanPlan(Base):
    __tablename__ = "clean_plan"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    plant = Column(Text, nullable=False)
    product_code = Column(Text, nullable=False)
    planned_units = Column(Float, nullable=False)


class CleanActual(Base):
    __tablename__ = "clean_actual"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    plant_id = Column(Text, nullable=False)
    product_code = Column(Text, nullable=False)
    units_produced = Column(Float, nullable=False)


class Exception(Base):
    __tablename__ = "exceptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_code = Column(Text, nullable=False)
    plant = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    planned_units = Column(Float, nullable=False)
    units_produced = Column(Float, nullable=False)
    deficit_pct = Column(Float, nullable=False)
    severity = Column(Text, nullable=False)
    status = Column(Text, nullable=False, default="open")
