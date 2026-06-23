"""Dynamic benchmark tests."""
from __future__ import annotations

from app.core.analysis_engine import analyze_all_areas


def _area_by_id(responses: dict[str, object], area_id: str):
    return {area.area_id: area for area in analyze_all_areas(responses)}[area_id]


def test_small_company_has_lower_retention_benchmark_than_large_company():
    small_retention = _area_by_id({"L1-2": "20인 이하"}, "retention")
    large_retention = _area_by_id({"L1-2": "100~500인"}, "retention")

    assert small_retention.benchmark < large_retention.benchmark


def test_large_company_has_higher_leadership_benchmark_than_small_company():
    small_leadership = _area_by_id({"L1-2": "20인 이하"}, "leadership")
    large_leadership = _area_by_id({"L1-2": "100~500인"}, "leadership")

    assert large_leadership.benchmark > small_leadership.benchmark


def test_50_to_100_company_uses_protected_growth_benchmarks():
    responses = {"L1-2": "50~100인"}

    assert _area_by_id(responses, "evaluation").benchmark == 72
    assert _area_by_id(responses, "leadership").benchmark == 72
    assert _area_by_id(responses, "retention").benchmark == 69
    assert _area_by_id(responses, "recruitment").benchmark == 73
    assert _area_by_id(responses, "compensation").benchmark == 70


def test_100_to_500_company_does_not_get_extra_enterprise_benchmark_pressure():
    responses = {"L1-2": "100~500인"}

    assert _area_by_id(responses, "evaluation").benchmark == 75
    assert _area_by_id(responses, "leadership").benchmark == 75

def test_evaluation_fairness_not_operated_is_scored_as_missing_basis():
    leadership = _area_by_id(
        {
            "2-4-1a": "반기 1회",
            "2-4-3-ceo": 0,
            "2-4-3-employee": 0,
        },
        "evaluation",
    )

    breakdown = {item["factor"]: item for item in leadership.score_breakdown}

    assert breakdown["평가 공정성 평균"]["value"] == "운영하지 않음"
    assert breakdown["공정성 인식 차이"]["value"] == "판단 기준 없음"
    assert "평가 공정성 판단 기준 부재" in leadership.tags
