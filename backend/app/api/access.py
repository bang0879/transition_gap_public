"""Diagnosis access verification route."""
from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status

from app.core.access_control import issue_access_token, verify_access_code
from app.schemas.access import AccessVerifyRequest, AccessVerifyResponse

router = APIRouter()


@router.post("/access/verify", response_model=AccessVerifyResponse)
async def verify_access(request: AccessVerifyRequest) -> AccessVerifyResponse:
    """Verify the diagnosis code and return a signed access token."""
    if not verify_access_code(request.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid diagnosis access code",
        )

    token, expires_at = issue_access_token()
    expires_at_iso = datetime.fromtimestamp(expires_at, tz=UTC).isoformat()
    return AccessVerifyResponse(token=token, expires_at=expires_at_iso)
