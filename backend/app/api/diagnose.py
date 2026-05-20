"""POST /api/diagnose endpoint."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from app.core.analysis_engine import analyze_all_areas, get_cross_domain_insights
from app.core.trade_off import calc_to_be_coordinates, calculate_coordinates
from app.core.visibility_index import calculate_visibility_index
from app.schemas.analysis import (
    AreaAnalysisOut,
    BlindSpotTip,
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
        pain_point_dispersion=coords.pain_point_dispersion,
    )

    insights = get_cross_domain_insights(areas, responses)
    insights_out = [
        InsightOut(headline=item["headline"], detail=item["detail"], source=item["source"])
        for item in insights
    ]

    return DiagnoseResponse(
        areas=areas_out,
        visibility=visibility_out,
        matrix=matrix_out,
        insights=insights_out,
    )


def _matrix_a_quadrant(x: float, y: float) -> str:
    """Return Matrix A quadrant label for To-Be coordinates."""
    if x >= 0.5 and y >= 0.5:
        return "Q1: 단기 성과형 협업조직"
    if x < 0.5 and y < 0.5:
        return "Q2: 장기 비전형 공동체 조직"
    if x >= 0.5 and y < 0.5:
        return "Q3: 평균형 안정형"
    return "Q4: 소수정예 중심형"
