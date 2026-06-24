"""Static content routes."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.api.deps import require_diagnosis_access

router = APIRouter(dependencies=[Depends(require_diagnosis_access)])

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"


@lru_cache(maxsize=8)
def _load_raw(filename: str) -> str:
    """Read a JSON file as immutable raw text and cache it."""
    return (CONTENT_DIR / filename).read_text(encoding="utf-8")


def _json_response(filename: str) -> Response:
    """Return cached JSON text directly as an HTTP response."""
    return Response(content=_load_raw(filename), media_type="application/json")


@router.get("/schema")
async def get_schema() -> Response:
    """Return the diagnosis variable schema."""
    return _json_response("schema.json")


@router.get("/scenarios")
async def get_scenarios() -> Response:
    """Return scenario data."""
    return _json_response("scenarios.json")


@router.get("/options")
async def get_options() -> Response:
    """Return HR option and benchmark data."""
    return _json_response("hr_options.json")
