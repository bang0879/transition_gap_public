"""Issue title display copy tests."""
from __future__ import annotations

from app.core.analysis_engine import analyze_all_areas, issue_display_title


def _area_by_id(responses: dict[str, object], area_id: str):
    return {area.area_id: area for area in analyze_all_areas(responses)}[area_id]


def test_issue_display_title_reframes_internal_diagnostic_labels():
    assert issue_display_title("복리후생 과잉 투자") == "복리후생이 기본 보상보다 앞서 있음"
    assert issue_display_title("1on1 부재/형식화") == "1on1 정기 운영 미정착"
    assert issue_display_title("평가 데이터 사각지대") == "평가 결과 분포 미확보"


def test_recommendation_uses_display_title_without_changing_internal_issue_key():
    leadership = _area_by_id(
        {
            "2-5-1": "대부분 객관적으로 잘 수행함",
            "2-5-2": "운영 안 함",
            "2-5-4": "리더/담당자 1차 승인 후 CEO 확인",
            "2-5-5": "리더 권한 내 결정",
            "2-5-6": "명확한 기준으로 작동함",
        },
        "leadership",
    )

    assert leadership.issues[0].title == "1on1 부재/형식화"
    assert "'1on1 정기 운영 미정착'" in leadership.recommendation
    assert "'1on1 부재/형식화'" not in leadership.recommendation
