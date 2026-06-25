"""FastAPI application entrypoint."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.access import router as access_router
from app.api.content import router as content_router
from app.api.diagnose import router as diagnose_router
from app.api.events import router as events_router
from app.db.events import init_db


def _csv_env(name: str, fallback: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return fallback
    return [item.strip() for item in raw.split(",") if item.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown hooks."""
    _ = app
    init_db()
    yield


app = FastAPI(
    title="HR Prism API",
    version="0.2.0",
    description="HR Prism stateless diagnosis API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_csv_env(
        "ALLOWED_ORIGINS",
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ],
    ),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(access_router, prefix="/api")
app.include_router(diagnose_router, prefix="/api")
app.include_router(content_router, prefix="/api")
app.include_router(events_router, prefix="/api")


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    """Send browser visits on the API port to the frontend app."""
    return RedirectResponse(url=os.getenv("FRONTEND_URL", "http://127.0.0.1:3000/"))


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
