"""Schemas for diagnosis access verification."""
from __future__ import annotations

from pydantic import BaseModel, Field


class AccessVerifyRequest(BaseModel):
    code: str = Field(min_length=1)


class AccessVerifyResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    expires_at: str
