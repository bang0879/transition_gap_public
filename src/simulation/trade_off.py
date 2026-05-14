"""
시뮬레이션 모듈 — As-Is 자동 배치 좌표 계산.

진단 응답을 매트릭스 A·B 좌표와 페인포인트 분산도로 변환한다.
매핑 가중치는 spec_v0.1.md §3-2를 기준으로 한다.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from src.diagnosis.variables import PAIN_POINT_Y_VALUES


@dataclass(frozen=True)
class MatrixCoordinates:
    """매트릭스 좌표 결과."""

    matrix_a_x: float
    matrix_a_y: float
    matrix_b_x: float
    matrix_b_y: float
    pain_point_dispersion: float

    @property
    def matrix_a_quadrant(self) -> str:
        """매트릭스 A의 사분면 명칭."""
        if self.matrix_a_x >= 0.5 and self.matrix_a_y >= 0.5:
            return "Q1: 단기 성과형 용병조직"
        if self.matrix_a_x < 0.5 and self.matrix_a_y < 0.5:
            return "Q2: 장기 비전형 공동체 조직"
        if self.matrix_a_x >= 0.5 and self.matrix_a_y < 0.5:
            return "Q3: 평균의 함정형"
        return "Q4: 소수정예 중심형"

    @property
    def matrix_b_quadrant(self) -> str:
        """매트릭스 B의 사분면 명칭."""
        if self.matrix_b_x < 0.5 and self.matrix_b_y < 0.5:
            return "Q1: 개인플레이어 중심형"
        if self.matrix_b_x < 0.5 and self.matrix_b_y >= 0.5:
            return "Q2: 가족형 자율 조직"
        if self.matrix_b_x >= 0.5 and self.matrix_b_y < 0.5:
            return "Q3: 에이전시형 분업/기능 조직"
        return "Q4: 대기업 공채 시스템형"


def calculate_matrix_a_x(responses: dict[str, Any]) -> float:
    """매트릭스 A X축: 지분/비전 (0.0) ↔ 현금/인센티브 (1.0)."""
    archetype_map = {
        "현금 안정형 (기본급 압도적 위주)": 1.0,
        "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)": 0.7,
        "혼합형 (위 세 가지가 직급별/직군별로 다름)": 0.5,
        "장기 비전형 (기본급 + 스톡옵션/RSU 등 지분 보상 적극 활용)": 0.0,
    }
    archetype_score = archetype_map.get(responses.get("2-3-2"), 0.5)

    detail = responses.get("2-3-2-detail")
    has_detail = _has_quantitative_reward_detail(detail)
    quantitative_score = None
    if has_detail and isinstance(detail, dict):
        equity_pct = _as_float(detail.get("equity", 0.0))
        quantitative_score = max(0.0, 1.0 - (equity_pct / 30.0))

    philosophy = _as_int(responses.get("2-3-1"), default=3)
    philosophy_score = (philosophy - 1) / 4

    if quantitative_score is not None:
        x = (archetype_score * 0.5) + (quantitative_score * 0.3) + (philosophy_score * 0.2)
    else:
        x = ((archetype_score * 0.5) + (philosophy_score * 0.2)) / 0.7

    return _clamp(x)


def calculate_matrix_a_y(responses: dict[str, Any]) -> float:
    """매트릭스 A Y축: 팀 시너지 (0.0) ↔ 개인 압도적 성과 (1.0)."""
    linkage = _as_int(responses.get("2-4-2"), default=3)
    linkage_score = (linkage - 1) / 4

    eval_method_map = {"없음": 0.2, "비공식": 0.4, "정기 운영": 0.6}
    eval_method_score = eval_method_map.get(responses.get("2-4-1"), 0.4)

    pain_points = responses.get("L1-1", [])
    if isinstance(pain_points, list) and pain_points:
        pain_point_score = sum(_pain_point_score(point) for point in pain_points) / len(pain_points)
    else:
        pain_point_score = 0.5

    y = (linkage_score * 0.5) + (eval_method_score * 0.2) + (pain_point_score * 0.3)
    return _clamp(y)


def calculate_matrix_b_x(responses: dict[str, Any]) -> float:
    """매트릭스 B X축: 자율 (0.0) ↔ 통제 (1.0)."""
    hiring_gov_map = {
        "실무 팀장 전결": 0.0,
        "C-Level 전결": 0.5,
        "CEO가 모든 인원 최종 면접 및 승인": 1.0,
    }
    hiring_score = hiring_gov_map.get(responses.get("2-5-4"), 0.5)

    release_gov_map = {
        "실무팀 자율": 0.0,
        "팀장 / PM 결정": 0.3,
        "C-Level 결정": 0.7,
        "CEO 최종 승인 필요": 1.0,
    }
    release_score = release_gov_map.get(responses.get("2-5-5"), 0.5)

    layer_map = {
        "수평형 (CEO + 실무자, 별도 중간 관리자 없음)": 0.1,
        "3단계 (CEO - 리더 - 실무자)": 0.3,
        "4단계 (CEO - 임원/실장 - 팀장 - 실무자)": 0.7,
        "5단계 이상 (사업부/본부 체계 도입)": 0.9,
        "직군별 상이 (예: 개발은 수평, 사업은 위계)": 0.5,
        "4단계 이상": 0.8,
    }
    layer_score = layer_map.get(responses.get("L1-3"), 0.5)

    headcount_map = {
        "20인 이하": 0.2,
        "20~50인": 0.4,
        "50~100인": 0.6,
        "100인 초과": 0.8,
    }
    headcount_score = headcount_map.get(responses.get("L1-2"), 0.5)

    x = (
        (hiring_score * 0.35)
        + (release_score * 0.35)
        + (layer_score * 0.15)
        + (headcount_score * 0.15)
    )
    return _clamp(x)


def calculate_matrix_b_y(responses: dict[str, Any]) -> float:
    """매트릭스 B Y축: 스킬 (0.0) ↔ 컬처핏 (1.0)."""
    core_value_map = {
        "문서로만 존재함": 0.2,
        "일부 참고함": 0.5,
        "명확한 기준으로 작동함": 1.0,
    }
    core_value_score = core_value_map.get(responses.get("2-5-6"), 0.5)

    hiring_stance_map = {
        "공격적 확장 (30%+ 인원 증가)": 0.2,
        "안정적 성장 (10~30% 증가)": 0.5,
        "결원 보충 및 유지 (10% 미만)": 0.8,
        "결원 보충 및 유지": 0.8,
        "채용 동결 및 감축": 0.5,
    }
    hiring_stance_score = hiring_stance_map.get(responses.get("L1-4"), 0.5)

    early_quit_map = {
        "10% 미만": 0.7,
        "10~30%": 0.5,
        "30% 초과": 0.2,
        "모름 / 측정 안 함": 0.5,
    }
    early_quit_score = early_quit_map.get(responses.get("2-1-3"), 0.5)

    leader_feedback_map = {
        "대부분 객관적으로 잘 수행함": 0.8,
        "갈등을 피하거나 온정주의가 있음": 0.4,
        "대표인 내가 직접 나서야 해결됨": 0.2,
    }
    leader_feedback_score = leader_feedback_map.get(responses.get("2-5-1"), 0.5)

    y = (
        (core_value_score * 0.45)
        + (hiring_stance_score * 0.25)
        + (early_quit_score * 0.15)
        + (leader_feedback_score * 0.15)
    )
    return _clamp(y)


def calculate_pain_point_dispersion(responses: dict[str, Any]) -> float:
    """페인포인트 분산도 (0.0 = 근접, 1.0 = 극단)."""
    pain_points = responses.get("L1-1", [])
    if not isinstance(pain_points, list) or len(pain_points) < 2:
        return 0.0

    values = [_pain_point_score(point) for point in pain_points[:2]]
    dispersion = abs(values[0] - values[1]) / 0.70
    return _clamp(dispersion)


def calculate_coordinates(responses: dict[str, Any]) -> MatrixCoordinates:
    """매트릭스 A·B 좌표와 페인포인트 분산도를 계산한다."""
    return MatrixCoordinates(
        matrix_a_x=calculate_matrix_a_x(responses),
        matrix_a_y=calculate_matrix_a_y(responses),
        matrix_b_x=calculate_matrix_b_x(responses),
        matrix_b_y=calculate_matrix_b_y(responses),
        pain_point_dispersion=calculate_pain_point_dispersion(responses),
    )


def _has_quantitative_reward_detail(detail: Any) -> bool:
    """2-3-2-detail에 실제 정량 입력이 있는지 확인한다."""
    if not isinstance(detail, dict):
        return False
    quantitative_values = [
        _as_float(value)
        for key, value in detail.items()
        if key != "total"
    ]
    return sum(quantitative_values) > 0


def _pain_point_score(pain_point: str) -> float:
    """알 수 없는 페인포인트는 중립값으로 처리한다."""
    return PAIN_POINT_Y_VALUES.get(pain_point, 0.5)


def _as_int(value: Any, default: int) -> int:
    """정수형 응답이 아니면 기본값을 반환한다."""
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default


def _as_float(value: Any) -> float:
    """숫자형 응답이 아니면 0.0을 반환한다."""
    if isinstance(value, int | float):
        return float(value)
    return 0.0


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """값을 [lo, hi] 범위로 제한한다."""
    return max(lo, min(hi, value))
