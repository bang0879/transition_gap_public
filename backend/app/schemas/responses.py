"""Diagnosis request schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, model_validator


_INT_VARIABLES = {"2-3-1", "2-4-2", "2-4-3-ceo", "2-4-3-employee"}
_LIST_VARIABLES = {"L1-1", "2-2-2", "2-4-4"}


class DiagnoseRequest(BaseModel):
    """POST /api/diagnose request body."""

    responses: dict[str, Any]

    @model_validator(mode="after")
    def normalize_response_types(self) -> "DiagnoseRequest":
        """Normalize simple frontend type drift without rejecting the request."""
        for var_id in _INT_VARIABLES:
            val = self.responses.get(var_id)
            if isinstance(val, str):
                try:
                    self.responses[var_id] = int(val)
                except ValueError:
                    pass
            elif isinstance(val, float):
                self.responses[var_id] = int(val)

        for var_id in _LIST_VARIABLES:
            val = self.responses.get(var_id)
            if isinstance(val, str):
                self.responses[var_id] = [val]

        return self
