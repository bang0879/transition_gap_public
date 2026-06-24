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


class StageGuidanceOut(BaseModel):
    current_choice: str
    valid_until: str
    defer_now: list[str]
    do_now: list[str]
    self_serve_actions: list[str]
    needs_help_later: list[str]


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
    stage_guidance: StageGuidanceOut | None = None


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
    b_quadrant_to_be: str
    pain_point_dispersion: float


class AlignmentConflictOut(BaseModel):
    id: str
    title: str
    detail: str
    severity: str
    penalty: int
    domains: list[str]


class AlignmentOut(BaseModel):
    score: int
    base_score: int
    total_penalty: int
    conflicts: list[AlignmentConflictOut]


class AlignmentMapVectorOut(BaseModel):
    domain_id: str
    domain_name: str
    x: float
    y: float
    magnitude: float
    direction_label: str
    evidence: list[str]


class AlignmentMapConflictOut(BaseModel):
    id: str
    title: str
    detail: str
    domains: list[str]
    severity: str


class AlignmentAxisOut(BaseModel):
    domain_id: str
    domain_name: str
    left_label: str
    right_label: str
    philosophy_label: str
    philosophy_note: str | None
    actual_label: str
    policy_direction: str
    alignment_percent: int
    status_label: str
    philosophy_position: float
    actual_position: float
    tension: float
    tension_level: str
    headline: str
    evidence: list[str]
    business_risk: str | None


class AlignmentMapOut(BaseModel):
    alignment_score: int
    alignment_level: str
    dispersion: float
    centroid_x: float
    centroid_y: float
    headline: str
    summary: str
    vectors: list[AlignmentMapVectorOut]
    axes: list[AlignmentAxisOut]
    conflicts: list[AlignmentMapConflictOut]


class InsightOut(BaseModel):
    headline: str
    detail: str
    source: str


class DiagnosisSignalOut(BaseModel):
    id: str
    domain_id: str
    domain_name: str
    title: str
    detail: str
    severity: str


class DiagnoseResponse(BaseModel):
    areas: list[AreaAnalysisOut]
    visibility: VisibilityOut
    matrix: MatrixOut
    alignment: AlignmentOut
    alignment_map: AlignmentMapOut
    diagnosis_mode: str
    foundation_signals: list[DiagnosisSignalOut]
    alignment_signals: list[DiagnosisSignalOut]
    insights: list[InsightOut]
