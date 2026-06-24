"""Shared API dependencies."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import Header, HTTPException, Request, status

from app.core.access_control import validate_access_token


async def get_current_session(request: Request) -> dict[str, Any]:
    """Return request session metadata.

    The current MVP does not attach customer identity to the access token. This
    keeps the dependency shape stable for a later authenticated workspace model.
    """
    _ = request
    return {}


async def require_diagnosis_access(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    """Require a valid diagnosis access bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Diagnosis access token is required",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not validate_access_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Diagnosis access token is invalid or expired",
        )
