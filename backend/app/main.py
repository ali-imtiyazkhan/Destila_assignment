from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers.exceptions import router as exceptions_router

app = FastAPI(title="Mini Exception Inbox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exceptions_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
