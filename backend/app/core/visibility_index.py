"""
HR 데이터 가시성 지수 (Visibility Index) — 시그니처 IP.

계산 로직:
- 기본 8개 항목 (항상 분모)
- 조건부 2개 항목 (해당 제도 운영 중일 때만 분모)
- 점수: 측정 = 1, 모름 = 0
- 2-3-2: 구조 유형만 = 0.5, 구조 유형 + 정량 = 1.0
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.core.variables import (
    VISIBILITY_BASE_ITEMS,
    VISIBILITY_CONDITIONAL_ITEMS,
    is_unknown_response,
)


@dataclass
class VisibilityResult:
    """가시성 지수 계산 결과."""

    score: float
    numerator: float
    denominator: int
    blind_spots: list[str]
    blind_spot_labels: list[str]

    @property
    def tier(self) -> str:
        """진단 분기 tier."""
        if self.score < 40:
            return "low"
        if self.score < 60:
            return "medium_low"
        if self.score < 70:
            return "medium"
        return "high"

    @property
    def tier_message(self) -> str:
        """tier별 안내 메시지."""
        messages = {
            "low": (
                "데이터 가시성이 매우 낮습니다. 정량 시뮬레이션은 보류하고, "
                "정성 권고와 데이터 인프라 구축을 우선합니다."
            ),
            "medium_low": (
                "데이터 가시성이 부족합니다. 본격 진단에 앞서 데이터 가시성 회복을 "
                "1단계 권고로 제시합니다."
            ),
            "medium": (
                "데이터 가시성이 중간 수준입니다. 시뮬레이션 결과의 신뢰구간을 "
                "보수적으로 적용합니다."
            ),
            "high": (
                "데이터 가시성이 양호합니다. 시뮬레이션 결과를 높은 신뢰도로 "
                "활용할 수 있습니다."
            ),
        }
        return messages[self.tier]


def calculate_visibility_index(responses: dict[str, Any]) -> VisibilityResult:
    """
    가시성 지수 계산.

    Args:
        responses: 진단 응답 딕셔너리.

    Returns:
        VisibilityResult.
    """
    all_items = list(VISIBILITY_BASE_ITEMS)

    for item_id, condition in VISIBILITY_CONDITIONAL_ITEMS.items():
        depends_on = condition["depends_on"]
        excluded_value = condition["excluded_value"]
        if responses.get(depends_on) != excluded_value:
            all_items.append(item_id)

    denominator = len(all_items)
    numerator = 0.0
    blind_spots: list[str] = []
    blind_spot_labels: list[str] = []

    for item_id in all_items:
        score = _score_item(item_id, responses)
        numerator += score
        if score < 1.0:
            blind_spots.append(item_id)
            blind_spot_labels.append(_get_short_label(item_id))

    visibility_score = (numerator / denominator) * 100 if denominator > 0 else 0.0

    return VisibilityResult(
        score=round(visibility_score, 1),
        numerator=numerator,
        denominator=denominator,
        blind_spots=blind_spots,
        blind_spot_labels=blind_spot_labels,
    )


def _score_item(item_id: str, responses: dict[str, Any]) -> float:
    """개별 항목 점수 (0.0, 0.5, 1.0)."""
    response = responses.get(item_id)
    if response is None:
        return 0.0

    if item_id == "2-3-2":
        archetype = responses.get("2-3-2")
        if archetype is None:
            return 0.0

        detail = responses.get("2-3-2-detail")
        if detail and isinstance(detail, dict):
            try:
                has_quantitative = any(
                    key != "total" and isinstance(value, int | float) and value > 0
                    for key, value in detail.items()
                )
                return 1.0 if has_quantitative else 0.5
            except (AttributeError, TypeError):
                return 0.5
        return 0.5

    return 0.0 if is_unknown_response(item_id, response) else 1.0


def _get_short_label(item_id: str) -> str:
    """가시성 리포트용 짧은 라벨."""
    labels = {
        "2-1-1": "자발적 이직률",
        "2-1-2": "핵심 인재 이탈",
        "2-1-3": "신규 입사자 조기 퇴사율",
        "2-1-4": "핵심 인재 식별 기준",
        "2-2-1": "채용 소요 기간",
        "2-2-5": "온보딩 적응 추적",
        "2-3-2": "보상 구조 정량 비율",
        "2-3-3": "매출 대비 인건비 비중",
        "2-3-4": "인건비 증가율",
        "2-3-5": "시장 대비 보상 위치",
        "2-4-5": "평가 운영 데이터",
        "2-5-3": "1on1 운영 데이터",
    }
    return labels.get(item_id, item_id)


if __name__ == "__main__":
    test_responses = {
        "2-1-1": "10% 미만",
        "2-1-2": "없음",
        "2-1-3": "모름 / 측정 안 함",
        "2-2-1": "2~4개월",
        "2-3-2": "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
        "2-3-3": "20~35%",
        "2-3-4": "모름 / 측정 안 함",
        "2-3-5": "중위",
        "2-4-1a": "반기 1회",
        "2-4-5": "알고 있음",
        "2-5-2": "일부 운영",
        "2-5-3": "기록·관리 안 함",
    }
    result = calculate_visibility_index(test_responses)
    print(f"Score: {result.score}%")
    print(f"Denominator: {result.denominator}")
    print(f"Blind spots: {result.blind_spot_labels}")
    print(f"Tier: {result.tier}")
