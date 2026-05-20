"""Shared test fixtures."""
from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.variables import ALL_VARIABLES, InputType
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def full_responses() -> dict[str, Any]:
    """Build a complete response payload from the current variable definitions."""
    responses: dict[str, Any] = {}
    for variable in ALL_VARIABLES:
        if variable.id in {"L0-1", "L0-2", "L0-3"}:
            responses[variable.id] = "A"
        elif variable.input_type == InputType.MULTI_SELECT:
            responses[variable.id] = variable.options[: min(2, len(variable.options))]
        elif variable.input_type == InputType.SINGLE_SELECT:
            responses[variable.id] = variable.options[0] if variable.options else ""
        elif variable.input_type == InputType.SLIDER_10:
            responses[variable.id] = 7
        elif variable.input_type == InputType.SLIDER_5:
            responses[variable.id] = 4
        elif variable.input_type == InputType.SLIDER_RATIO:
            responses[variable.id] = 0.6
        elif variable.input_type == InputType.NUMBER:
            responses[variable.id] = 1
        elif variable.input_type == InputType.PERCENT_SPLIT:
            responses[variable.id] = variable.options[0] if variable.options else ""
            responses[f"{variable.id}-detail"] = {
                "base": 70,
                "performance": 20,
                "equity": 10,
                "total": 100,
            }
    return responses
