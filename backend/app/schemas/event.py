"""Event logging schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class EventIn(BaseModel):
    """POST /api/events request body."""

    session_id: str
    event_type: str
    page: str | None = None
    metadata: dict[str, Any] | None = None
    timestamp: str


class EventOut(BaseModel):
    """POST /api/events response body."""

    id: int
    status: str = "ok"
