"""CEO-facing copy reframe tests."""
from __future__ import annotations

from app.core.analysis_engine import AreaAnalysis, Issue, _get_trigger_reason, get_cross_domain_insights


def _area(area_id: str, issues: list[Issue] | None = None, gap: int = 0) -> AreaAnalysis:
    return AreaAnalysis(
        area_id=area_id,
        area_name=area_id,
        score=60,
        benchmark=70,
        gap=gap,
        priority=0,
        difficulty="중간",
        status_text="",
        issues=issues or [],
        recommendation="",
    )


def test_cross_domain_insight_headlines_are_decision_framed():
    insights = get_cross_domain_insights(
        [
            _area("compensation"),
            _area("recruitment", [Issue("오퍼 경쟁력 부족", "", "high")]),
            _area("evaluation", [Issue("평가 체계 부재", "", "high")], gap=15),
            _area("leadership", [Issue("리더 피드백 역량 부족", "", "high"), Issue("의사결정 병목", "", "high")]),
        ],
        {"L1-2": "100~500인"},
    )

    headlines = [insight["headline"] for insight in insights]

    assert "제도 도입 전에 데이터가 먼저 보여야 효과 측정이 됩니다." in headlines
    assert "오퍼 경쟁력보다 채용 채널을 먼저 늘리면 비용이 후행 손실로 돌아옵니다." in headlines
    assert "평가 제도 도입은 리더의 피드백 운영 리듬이 잡힌 뒤에 효과가 납니다." in headlines
    assert all("관리할 수 없습니다" not in headline for headline in headlines)
    assert all("밑 빠진 독" not in headline for headline in headlines)
    assert all("만들지 마세요" not in headline for headline in headlines)


def test_ceo_bottleneck_insight_is_framed_as_delegation_readiness():
    insights = get_cross_domain_insights(
        [_area("leadership", [Issue("의사결정 병목", "", "high")])],
        {"L1-2": "100~500인", "2-2-5": "정기적으로 추적함"},
    )

    headlines = [insight["headline"] for insight in insights]

    assert "100인 전후부터는 반복 의사결정 위임 기준이 필요합니다." in headlines
    assert all("100명이 10명처럼" not in headline for headline in headlines)


def test_trigger_reasons_avoid_judgmental_phrasing():
    assert (
        _get_trigger_reason(Issue("높은 자발적 이직률", "", "high"), {})
        == "이탈 원인과 남은 구성원의 부담을 함께 확인해야 하는"
    )
    assert (
        _get_trigger_reason(Issue("리더 피드백 역량 부족", "", "high"), {})
        == "팀장별 피드백 운영 리듬을 먼저 맞춰야 하는"
    )
    assert (
        _get_trigger_reason(Issue("의사결정 병목", "", "high"), {})
        == "반복 의사결정의 위임 기준을 정리해야 하는"
    )
