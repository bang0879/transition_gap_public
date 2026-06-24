"""Access-code verification and signed diagnosis access tokens."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 12
_LOCAL_SECRET = "hr-prism-local-access-secret"


def verify_access_code(code: str) -> bool:
    """Return whether the submitted code matches the configured diagnosis code."""
    expected = os.getenv("DIAGNOSIS_ACCESS_CODE")
    return bool(expected) and hmac.compare_digest(code.strip(), expected)


def issue_access_token(now: int | None = None) -> tuple[str, int]:
    """Issue a short-lived signed token for protected diagnosis APIs."""
    issued_at = int(now if now is not None else time.time())
    expires_at = issued_at + ACCESS_TOKEN_TTL_SECONDS
    payload = {"iat": issued_at, "exp": expires_at}
    payload_part = _b64_json(payload)
    signature_part = _sign(payload_part)
    return f"{payload_part}.{signature_part}", expires_at


def validate_access_token(token: str, now: int | None = None) -> bool:
    """Validate a signed diagnosis access token."""
    try:
        payload_part, signature_part = token.split(".", 1)
    except ValueError:
        return False

    if not hmac.compare_digest(_sign(payload_part), signature_part):
        return False

    try:
        payload = _decode_json(payload_part)
    except (ValueError, json.JSONDecodeError):
        return False

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        return False

    current_time = int(now if now is not None else time.time())
    return expires_at > current_time


def _secret() -> bytes:
    secret = os.getenv("DIAGNOSIS_ACCESS_SECRET") or os.getenv("DIAGNOSIS_ACCESS_CODE") or _LOCAL_SECRET
    return secret.encode("utf-8")


def _b64_json(payload: dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return _b64_encode(raw)


def _decode_json(payload_part: str) -> dict[str, Any]:
    return json.loads(_b64_decode(payload_part))


def _sign(payload_part: str) -> str:
    signature = hmac.new(_secret(), payload_part.encode("utf-8"), hashlib.sha256).digest()
    return _b64_encode(signature)


def _b64_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")
