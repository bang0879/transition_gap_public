"""Shared API dependencies.

Authentication is intentionally not enforced in Phase A. This file keeps the
future JWT seam in one place so Phase 2 can add validation without reshaping
the route modules.
"""
from __future__ import annotations

from typing import Any

from fastapi import Request


async def get_current_session(request: Request) -> dict[str, Any]:
    """Return request session metadata.

    Phase 2 will decode the Authorization bearer token and return fields such
    as session_id and company_alias. For now, the API remains unauthenticated.
    """
    _ = request
    return {}
