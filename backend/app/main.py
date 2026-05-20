"""FastAPI application entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.content import router as content_router
from app.api.diagnose import router as diagnose_router
from app.api.events import router as events_router
from app.db.events import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown hooks."""
    _ = app
    init_db()
    yield


app = FastAPI(
    title="Transition Gap API",
    version="0.2.0",
    description="Transition Gap stateless diagnosis API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diagnose_router, prefix="/api")
app.include_router(content_router, prefix="/api")
app.include_router(events_router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
