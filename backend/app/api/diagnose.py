"""POST /api/diagnose endpoint."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from app.core.alignment_engine import analyze_alignment
from app.core.alignment_map import analyze_alignment_map
from app.core.analysis_engine import analyze_all_areas, get_cross_domain_insights
from app.core.diagnosis_mode import analyze_diagnosis_mode
from app.core.trade_off import calc_to_be_coordinates, calculate_coordinates
from app.core.visibility_index import calculate_visibility_index
from app.schemas.analysis import (
    AlignmentAxisOut,
    AlignmentConflictOut,
    AlignmentMapConflictOut,
    AlignmentMapOut,
    AlignmentMapVectorOut,
    AlignmentOut,
    AreaAnalysisOut,
    BlindSpotTip,
    DiagnosisSignalOut,
    DiagnoseResponse,
    InsightOut,
    IssueOut,
    MatrixOut,
    ScoreBreakdownItem,
    VisibilityOut,
)
from app.schemas.responses import DiagnoseRequest

router = APIRouter()

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"
_tips_cache: dict[str, Any] | None = None


def _load_tips() -> dict[str, Any]:
    global _tips_cache
    if _tips_cache is None:
        with open(CONTENT_DIR / "hr_tips.json", encoding="utf-8") as f:
            _tips_cache = json.load(f)
    return _tips_cache


@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(request: DiagnoseRequest) -> DiagnoseResponse:
    """Return area analysis, visibility, matrix coordinates, and insights."""
    responses = request.responses

    areas = analyze_all_areas(responses)
    areas_out = [
        AreaAnalysisOut(
            area_id=area.area_id,
            area_name=area.area_name,
            score=area.score,
            benchmark=area.benchmark,
            gap=area.gap,
            priority=area.priority,
            difficulty=area.difficulty,
            status_text=area.status_text,
            issues=[
                IssueOut(
                    title=issue.title,
                    description=issue.description,
                    severity=issue.severity,
                )
                for issue in area.issues
            ],
            recommendation=area.recommendation,
            tags=area.tags,
            score_breakdown=[
                ScoreBreakdownItem(
                    factor=item["factor"],
                    value=item["value"],
                    impact=item["impact"],
                    note=item.get("note", ""),
                    implication=item.get("implication", ""),
                )
                for item in area.score_breakdown
            ],
        )
        for area in areas
    ]

    visibility = calculate_visibility_index(responses)
    tips = _load_tips()
    blind_spot_tips = [
        BlindSpotTip(
            label=label,
            tip=tips.get(label, {}).get("tip", ""),
            formula=tips.get(label, {}).get("formula", ""),
        )
        for label in visibility.blind_spot_labels
    ]
    visibility_out = VisibilityOut(
        score=visibility.score,
        tier=visibility.tier,
        tier_message=visibility.tier_message,
        blind_spots=visibility.blind_spots,
        blind_spot_labels=visibility.blind_spot_labels,
        blind_spot_tips=blind_spot_tips,
    )

    coords = calculate_coordinates(responses)
    to_be = calc_to_be_coordinates(responses)
    matrix_out = MatrixOut(
        a_x_as_is=coords.matrix_a_x,
        a_y_as_is=coords.matrix_a_y,
        a_x_to_be=to_be["matrix_a"]["x"],
        a_y_to_be=to_be["matrix_a"]["y"],
        b_x_as_is=coords.matrix_b_x,
        b_y_as_is=coords.matrix_b_y,
        b_x_to_be=to_be["matrix_b"]["x"],
        b_y_to_be=to_be["matrix_b"]["y"],
        a_quadrant_as_is=coords.matrix_a_quadrant,
        a_quadrant_to_be=_matrix_a_quadrant(to_be["matrix_a"]["x"], to_be["matrix_a"]["y"]),
        b_quadrant_as_is=coords.matrix_b_quadrant,
        b_quadrant_to_be=_matrix_b_quadrant(to_be["matrix_b"]["x"], to_be["matrix_b"]["y"]),
        pain_point_dispersion=coords.pain_point_dispersion,
    )

    insights = get_cross_domain_insights(areas, responses)
    insights_out = [
        InsightOut(headline=item["headline"], detail=item["detail"], source=item["source"])
        for item in insights
    ]
    alignment = analyze_alignment(areas, responses)
    alignment_out = AlignmentOut(
        score=alignment.score,
        base_score=alignment.base_score,
        total_penalty=alignment.total_penalty,
        conflicts=[
            AlignmentConflictOut(
                id=conflict.id,
                title=conflict.title,
                detail=conflict.detail,
                severity=conflict.severity,
                penalty=conflict.penalty,
                domains=list(conflict.domains),
            )
            for conflict in alignment.conflicts
        ],
    )
    alignment_map = analyze_alignment_map(responses, areas)
    alignment_map_out = AlignmentMapOut(
        alignment_score=alignment_map.alignment_score,
        alignment_level=alignment_map.alignment_level,
        dispersion=alignment_map.dispersion,
        centroid_x=alignment_map.centroid_x,
        centroid_y=alignment_map.centroid_y,
        headline=alignment_map.headline,
        summary=alignment_map.summary,
        vectors=[
            AlignmentMapVectorOut(
                domain_id=vector.domain_id,
                domain_name=vector.domain_name,
                x=vector.x,
                y=vector.y,
                magnitude=vector.magnitude,
                direction_label=vector.direction_label,
                evidence=vector.evidence,
            )
            for vector in alignment_map.vectors
        ],
        axes=[
            AlignmentAxisOut(
                domain_id=axis.domain_id,
                domain_name=axis.domain_name,
                left_label=axis.left_label,
                right_label=axis.right_label,
                philosophy_label=axis.philosophy_label,
                philosophy_note=axis.philosophy_note,
                actual_label=axis.actual_label,
                policy_direction=axis.policy_direction,
                alignment_percent=axis.alignment_percent,
                status_label=axis.status_label,
                philosophy_position=axis.philosophy_position,
                actual_position=axis.actual_position,
                tension=axis.tension,
                tension_level=axis.tension_level,
                headline=axis.headline,
                evidence=axis.evidence,
                business_risk=axis.business_risk,
            )
            for axis in alignment_map.axes
        ],
        conflicts=[
            AlignmentMapConflictOut(
                id=conflict.id,
                title=conflict.title,
                detail=conflict.detail,
                domains=list(conflict.domains),
                severity=conflict.severity,
            )
            for conflict in alignment_map.conflicts
        ],
    )
    diagnosis_mode = analyze_diagnosis_mode(
        responses,
        [*alignment.conflicts, *alignment_map.conflicts],
    )
    foundation_signals_out = [
        DiagnosisSignalOut(
            id=signal.id,
            domain_id=signal.domain_id,
            domain_name=signal.domain_name,
            title=signal.title,
            detail=signal.detail,
            severity=signal.severity,
        )
        for signal in diagnosis_mode.foundation_signals
    ]
    alignment_signals_out = [
        DiagnosisSignalOut(
            id=signal.id,
            domain_id=signal.domain_id,
            domain_name=signal.domain_name,
            title=signal.title,
            detail=signal.detail,
            severity=signal.severity,
        )
        for signal in diagnosis_mode.alignment_signals
    ]

    return DiagnoseResponse(
        areas=areas_out,
        visibility=visibility_out,
        matrix=matrix_out,
        alignment=alignment_out,
        alignment_map=alignment_map_out,
        diagnosis_mode=diagnosis_mode.diagnosis_mode,
        foundation_signals=foundation_signals_out,
        alignment_signals=alignment_signals_out,
        insights=insights_out,
    )


def _matrix_a_quadrant(x: float, y: float) -> str:
    """Return Matrix A quadrant label for To-Be coordinates."""
    if x >= 0.5 and y >= 0.5:
        return "Q1: 단기 성과 집중형"
    if x < 0.5 and y >= 0.5:
        return "Q2: 장기 비전형 공동체"
    if x < 0.5 and y < 0.5:
        return "Q3: 평균 기준형"
    return "Q4: 소수정예 중심형"


def _matrix_b_quadrant(x: float, y: float) -> str:
    """Return Matrix B quadrant label for To-Be coordinates."""
    if x < 0.5 and y < 0.5:
        return "Q1: 개인 플레이어 중심형"
    if x < 0.5 and y >= 0.5:
        return "Q2: 가족형 자율 조직"
    if x >= 0.5 and y < 0.5:
        return "Q3: 에이전시형 분업/기능 조직"
    return "Q4: 대기업 공채 시스템형"
