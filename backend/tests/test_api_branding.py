"""API branding contract tests."""
from __future__ import annotations

from app.main import app


def test_openapi_metadata_uses_hr_prism_branding():
    assert app.title == "HR Prism API"
    assert app.description == "HR Prism stateless diagnosis API"
