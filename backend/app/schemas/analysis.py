"""Diagnosis response schemas."""
from __future__ import annotations

from pydantic import BaseModel


class IssueOut(BaseModel):
    title: str
    description: str
    severity: str


class ScoreBreakdownItem(BaseModel):
    factor: str
    value: str
    impact: int
    note: str
    implication: str


class AreaAnalysisOut(BaseModel):
    area_id: str
    area_name: str
    score: int
    benchmark: int
    gap: int
    priority: int
    difficulty: str
    status_text: str
    issues: list[IssueOut]
    recommendation: str
    tags: list[str]
    score_breakdown: list[ScoreBreakdownItem]


class BlindSpotTip(BaseModel):
    label: str
    tip: str
    formula: str


class VisibilityOut(BaseModel):
    score: float
    tier: str
    tier_message: str
    blind_spots: list[str]
    blind_spot_labels: list[str]
    blind_spot_tips: list[BlindSpotTip]


class MatrixOut(BaseModel):
    a_x_as_is: float
    a_y_as_is: float
    a_x_to_be: float
    a_y_to_be: float
    b_x_as_is: float
    b_y_as_is: float
    b_x_to_be: float | None = None
    b_y_to_be: float | None = None
    a_quadrant_as_is: str
    a_quadrant_to_be: str
    b_quadrant_as_is: str
    pain_point_dispersion: float


class InsightOut(BaseModel):
    headline: str
    detail: str
    source: str


class DiagnoseResponse(BaseModel):
    areas: list[AreaAnalysisOut]
    visibility: VisibilityOut
    matrix: MatrixOut
    insights: list[InsightOut]
