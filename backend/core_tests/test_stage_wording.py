"""Stage-aware CEO-facing wording tests."""
from __future__ import annotations

from app.core.analysis_engine import analyze_all_areas


def _area_by_id(responses: dict[str, object], area_id: str):
    return {area.area_id: area for area in analyze_all_areas(responses)}[area_id]


def test_small_org_without_formal_evaluation_is_not_framed_as_defect():
    evaluation = _area_by_id(
        {
            "L1-2": "20~50인",
            "2-4-1a": "운영하지 않음",
            "2-4-3-ceo": 0,
            "2-4-3-employee": 0,
        },
        "evaluation",
    )

    assert "합리적 선택" in evaluation.status_text
    assert "공식 평가 체계가 부재" not in evaluation.status_text
    assert "MBO 기본 도입" not in evaluation.recommendation
    assert "보상 차등" in evaluation.recommendation


def test_small_org_ceo_decision_center_is_not_framed_as_immediate_bottleneck():
    leadership = _area_by_id(
        {
            "L1-2": "20~50인",
            "2-5-1": "대부분 객관적으로 잘 수행함",
            "2-5-2": "운영함",
            "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
            "2-5-5": "CEO 최종 승인 필요",
            "2-5-6": "명확한 기준으로 작동함",
        },
        "leadership",
    )

    assert "강점" in leadership.recommendation
    assert "반복 결정 3개" in leadership.recommendation
    assert "전결권 위임 체계를 설계" not in leadership.recommendation
