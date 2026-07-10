import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date

from database import Base
from models import CleanPlan, CleanActual, Exception as ExceptionModel
from main import app, get_db

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    db.add(CleanPlan(date=date(2017, 1, 5), plant="PLANT-1", product_code="FG-001", planned_units=100.0))
    db.add(CleanPlan(date=date(2017, 1, 5), plant="PLANT-1", product_code="FG-002", planned_units=200.0))
    db.add(CleanPlan(date=date(2017, 1, 4), plant="PLANT-1", product_code="FG-001", planned_units=100.0))
    db.add(CleanPlan(date=date(2017, 1, 3), plant="PLANT-1", product_code="FG-001", planned_units=100.0))
    db.add(CleanPlan(date=date(2017, 1, 2), plant="PLANT-1", product_code="FG-001", planned_units=100.0))
    db.add(CleanPlan(date=date(2017, 1, 1), plant="PLANT-1", product_code="FG-001", planned_units=100.0))

    db.add(CleanActual(date=date(2017, 1, 5), plant_id="PLANT-1", product_code="FG-001", units_produced=50.0))
    db.add(CleanActual(date=date(2017, 1, 5), plant_id="PLANT-1", product_code="FG-002", units_produced=190.0))
    db.add(CleanActual(date=date(2017, 1, 4), plant_id="PLANT-1", product_code="FG-001", units_produced=85.0))
    db.add(CleanActual(date=date(2017, 1, 3), plant_id="PLANT-1", product_code="FG-001", units_produced=90.0))
    db.add(CleanActual(date=date(2017, 1, 2), plant_id="PLANT-1", product_code="FG-001", units_produced=95.0))
    db.add(CleanActual(date=date(2017, 1, 1), plant_id="PLANT-1", product_code="FG-001", units_produced=100.0))

    db.add(ExceptionModel(product_code="FG-001", plant="PLANT-1", date=date(2017, 1, 5),
                          planned_units=100.0, units_produced=50.0, deficit_pct=50.0,
                          severity="high", status="open"))
    db.add(ExceptionModel(product_code="FG-002", plant="PLANT-1", date=date(2017, 1, 5),
                          planned_units=200.0, units_produced=190.0, deficit_pct=5.0,
                          severity="medium", status="open"))
    db.add(ExceptionModel(product_code="FG-001", plant="PLANT-1", date=date(2017, 1, 4),
                          planned_units=100.0, units_produced=85.0, deficit_pct=15.0,
                          severity="medium", status="acknowledged"))

    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)
