"""User behavior event logging route."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.api.deps import require_diagnosis_access

from app.db.events import insert_event
from app.schemas.event import EventIn, EventOut

router = APIRouter(dependencies=[Depends(require_diagnosis_access)])
logger = logging.getLogger(__name__)


@router.post("/events", response_model=EventOut)
def log_event(event: EventIn) -> EventOut:
    """Persist a user behavior event.

    Logging failures return 200 with an error status so analytics never blocks
    the diagnosis experience.
    """
    try:
        row_id = insert_event(
            session_id=event.session_id,
            event_type=event.event_type,
            page=event.page,
            metadata=event.metadata,
            timestamp=event.timestamp,
        )
        return EventOut(id=row_id)
    except Exception:
        logger.exception("Failed to persist event")
        return EventOut(id=0, status="error_logged")
