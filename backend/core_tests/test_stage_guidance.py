"""Stage-aware guidance tests."""
from __future__ import annotations

from app.core.analysis_engine import analyze_all_areas


def _area_by_id(responses: dict[str, object], area_id: str):
    return {area.area_id: area for area in analyze_all_areas(responses)}[area_id]


def test_small_org_without_formal_evaluation_gets_choice_framed_guidance():
    evaluation = _area_by_id(
        {
            "L1-2": "20~50인",
            "2-4-1a": "운영하지 않음",
            "2-4-3-ceo": 0,
            "2-4-3-employee": 0,
        },
        "evaluation",
    )

    guidance = evaluation.stage_guidance

    assert "합리적 선택" in guidance.current_choice
    assert "50인" in guidance.valid_until
    assert any("360도" in item for item in guidance.defer_now)
    assert any("분기 1회 목표" in item for item in guidance.do_now)
    assert any("대표님 혼자" in item or "엑셀" in item for item in guidance.self_serve_actions)


def test_small_org_ceo_centered_leadership_gets_condition_framed_guidance():
    leadership = _area_by_id(
        {
            "L1-2": "20~50인",
            "2-5-1": "갈등을 피하거나 온정주의가 있음",
            "2-5-2": "운영 안 함",
            "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
            "2-5-5": "CEO 최종 승인 필요",
        },
        "leadership",
    )

    guidance = leadership.stage_guidance

    assert "초기 조직" in guidance.current_choice
    assert "50인" in guidance.valid_until
    assert any("전결권" in item for item in guidance.do_now)
    assert any("역할" in item for item in guidance.needs_help_later)
