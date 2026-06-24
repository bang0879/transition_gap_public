"""Alignment engine tests that do not require FastAPI TestClient."""
from __future__ import annotations

import asyncio

from app.api.diagnose import diagnose
from app.core.alignment_engine import analyze_alignment
from app.core.analysis_engine import analyze_all_areas
from app.schemas.responses import DiagnoseRequest


def contradictory_responses() -> dict[str, object]:
    return {
        "L0-1": "A",
        "L0-2": "A",
        "L0-3": "B",
        "L1-2": "50~100인",
        "L1-4": "공격적 확장 (30%+ 인원 증가)",
        "2-3-2": "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
        "2-3-5": "하위",
        "2-4-1a": "연 1회",
        "2-4-2": 4,
        "2-4-5": "모름 / 측정 안 함",
        "2-5-1": "대표인 내가 직접 나서야 해결됨",
        "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
        "2-5-5": "CEO 최종 승인 필요",
        "2-5-6": "문서로만 존재함",
    }


def test_alignment_engine_penalizes_cross_domain_conflicts():
    responses = contradictory_responses()
    areas = analyze_all_areas(responses)

    alignment = analyze_alignment(areas, responses)

    conflict_ids = {conflict.id for conflict in alignment.conflicts}
    assert "performance_reward_without_eval" in conflict_ids
    assert "aggressive_hiring_low_pay" in conflict_ids
    assert "high_performance_low_feedback" in conflict_ids
    assert alignment.total_penalty > 0
    assert alignment.score < alignment.base_score


def test_alignment_engine_does_not_flag_performance_reward_with_exception_retention():
    responses = {
        **contradictory_responses(),
        "L0-1": "A",
        "L0-4": "B",
    }
    alignment = analyze_alignment(analyze_all_areas(responses), responses)

    conflict_ids = {conflict.id for conflict in alignment.conflicts}
    assert "stable_reward_with_exception_retention" not in conflict_ids


def test_alignment_engine_flags_stable_reward_with_exception_retention():
    responses = {
        **contradictory_responses(),
        "L0-1": "B",
        "L0-4": "B",
    }
    alignment = analyze_alignment(analyze_all_areas(responses), responses)

    conflict_ids = {conflict.id for conflict in alignment.conflicts}
    assert "stable_reward_with_exception_retention" in conflict_ids

def test_diagnose_response_includes_alignment_analysis():
    request = DiagnoseRequest(responses=contradictory_responses())

    result = asyncio.run(diagnose(request))

    assert result.alignment.total_penalty > 0
    assert result.alignment.conflicts[0].title
