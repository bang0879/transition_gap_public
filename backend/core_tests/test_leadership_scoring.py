"""Leadership scoring calibration tests."""
from __future__ import annotations

from app.core.analysis_engine import analyze_all_areas


def _leadership_area(responses: dict[str, object]):
    return {area.area_id: area for area in analyze_all_areas(responses)}["leadership"]


def _breakdown_by_factor(area):
    return {item["factor"]: item for item in area.score_breakdown}


def test_warm_conflict_avoidance_is_lightly_weighted_for_korean_startups():
    leadership = _leadership_area({"2-5-1": "갈등을 피하거나 온정주의가 있음"})

    assert leadership.score == 57
    assert _breakdown_by_factor(leadership)["리더 피드백 역량"]["impact"] == -3


def test_ceo_direct_intervention_keeps_signal_without_collapsing_score():
    leadership = _leadership_area({"2-5-1": "대표인 내가 직접 나서야 해결됨"})

    assert leadership.score == 52
    assert _breakdown_by_factor(leadership)["리더 피드백 역량"]["impact"] == -8
