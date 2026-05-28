"""Vector-based HR system alignment map."""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AlignmentMapVector:
    """A domain direction on the alignment map."""

    domain_id: str
    domain_name: str
    x: float
    y: float
    magnitude: float
    direction_label: str
    evidence: list[str]


@dataclass(frozen=True)
class AlignmentMapConflict:
    """A visible mismatch between domain vectors."""

    id: str
    title: str
    detail: str
    domains: tuple[str, ...]
    severity: str


@dataclass(frozen=True)
class AlignmentMapAnalysis:
    """Alignment map payload for visualization."""

    alignment_score: int
    alignment_level: str
    dispersion: float
    centroid_x: float
    centroid_y: float
    headline: str
    summary: str
    vectors: list[AlignmentMapVector]
    conflicts: list[AlignmentMapConflict]


def analyze_alignment_map(responses: dict[str, Any], areas: list[Any]) -> AlignmentMapAnalysis:
    """Return vector map analysis for the result summary."""
    _ = areas
    vectors = [
        _compensation_vector(responses),
        _evaluation_vector(responses),
        _recruitment_vector(responses),
        _retention_vector(responses),
        _leadership_vector(responses),
    ]
    centroid_x = sum(vector.x for vector in vectors) / len(vectors)
    centroid_y = sum(vector.y for vector in vectors) / len(vectors)
    dispersion = (
        sum(math.hypot(vector.x - centroid_x, vector.y - centroid_y) for vector in vectors)
        / len(vectors)
    )
    alignment_score = max(0, min(100, round(100 - dispersion * 70)))
    if alignment_score >= 75:
        level = "대체로 정합"
        headline = "제도들이 대체로 같은 방향을 보고 있습니다."
    elif alignment_score >= 55:
        level = "정렬 필요"
        headline = "일부 제도가 서로 다른 방향을 보고 있습니다."
    else:
        level = "엇박자 큼"
        headline = "핵심 제도들이 각자 다른 방향을 보고 있습니다."

    return AlignmentMapAnalysis(
        alignment_score=alignment_score,
        alignment_level=level,
        dispersion=round(dispersion, 3),
        centroid_x=round(centroid_x, 3),
        centroid_y=round(centroid_y, 3),
        headline=headline,
        summary=(
            "화살표가 한곳으로 모이면 정합성이 높고, 서로 다른 사분면으로 흩어지면 실행 과정에서 "
            "메시지 충돌이 커집니다. 이 맵은 좋은 제도를 고르는 화면이 아니라 현재 제도들이 같은 "
            "조직 철학을 향하는지 확인하는 화면입니다."
        ),
        vectors=vectors,
        conflicts=_build_conflicts(vectors),
    )


def _compensation_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    philosophy = _as_int(responses.get("2-3-1"), 3)
    structure = _text(responses.get("2-3-2"))
    market = _text(responses.get("2-3-5"))
    x = _score_to_axis(philosophy)
    if "단기 성과형" in structure or "인센티브" in structure:
        x += 0.25
    if market == "하위":
        x -= 0.15
    elif market == "상위":
        x += 0.15

    y = 0.2
    if "밴드" in structure or "성과형" in structure:
        y += 0.35
    if "현금 안정형" in structure:
        y -= 0.1

    clamped_x = _clamp(x)
    clamped_y = _clamp(y)
    return AlignmentMapVector(
        domain_id="compensation",
        domain_name="보상",
        x=clamped_x,
        y=clamped_y,
        magnitude=min(1.0, 0.55 + abs(clamped_x) * 0.25 + abs(clamped_y) * 0.2),
        direction_label=_direction_label(clamped_x, clamped_y),
        evidence=[
            f"보상 철학 {philosophy}점",
            f"보상 구조: {structure}",
            f"시장 대비 보상 위치: {market}",
        ],
    )


def _evaluation_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    cycle = _text(responses.get("2-4-1a"))
    eval_link = _as_int(responses.get("2-4-2"), 3)
    ceo_fair = _as_int(responses.get("2-4-3-ceo"), 5)
    employee_fair = _as_int(responses.get("2-4-3-employee"), 5)
    eval_data = _text(responses.get("2-4-5"))
    active = cycle not in ("운영하지 않음", "없음", "비정기", "미입력")

    x = _score_to_axis(eval_link)
    if active and eval_link <= 2:
        x -= 0.2

    y = 0.45 if active else -0.35
    if eval_data in ("모름 / 측정 안 함", "미입력"):
        y -= 0.35
    if max(0, ceo_fair - employee_fair) >= 3:
        y -= 0.15

    clamped_x = _clamp(x)
    clamped_y = _clamp(y)
    return AlignmentMapVector(
        domain_id="evaluation",
        domain_name="평가",
        x=clamped_x,
        y=clamped_y,
        magnitude=0.35 if not active else min(1.0, 0.6 + abs(clamped_x) * 0.2 + abs(clamped_y) * 0.2),
        direction_label=_direction_label(clamped_x, clamped_y),
        evidence=[
            f"평가 주기: {cycle}",
            f"평가-보상 연동: {eval_link}점",
            f"평가 운영 데이터: {eval_data}",
        ],
    )


def _recruitment_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    hiring_plan = _text(responses.get("L1-4"))
    duration = _text(responses.get("2-2-1"))
    channel_count = _text(responses.get("2-2-2"))
    market = _text(responses.get("2-3-5"))

    x = 0.35 if hiring_plan.startswith("공격적") else -0.1
    if market == "하위":
        x -= 0.25
    elif market == "상위":
        x += 0.15

    y = 0.15
    if duration in ("4~6개월", "6개월 초과", "4개월 초과"):
        y -= 0.25
    if channel_count in ("1개", "1~2개"):
        y -= 0.2
    else:
        y += 0.15

    clamped_x = _clamp(x)
    clamped_y = _clamp(y)
    return AlignmentMapVector(
        domain_id="recruitment",
        domain_name="채용",
        x=clamped_x,
        y=clamped_y,
        magnitude=min(1.0, 0.55 + abs(clamped_x) * 0.25 + abs(clamped_y) * 0.2),
        direction_label=_direction_label(clamped_x, clamped_y),
        evidence=[
            f"채용 기조: {hiring_plan}",
            f"채용 소요 기간: {duration}",
            f"채용 채널 수: {channel_count}",
        ],
    )


def _retention_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    turnover = _text(responses.get("2-1-1"))
    core_loss = _text(responses.get("2-1-2"))
    early_quit = _text(responses.get("2-1-3"))

    x = -0.25
    if core_loss in ("2~3명", "4명 이상"):
        x += 0.25
    if turnover in ("20% 초과", "20% 이상"):
        x += 0.15

    y = 0.25
    if turnover == "모름 / 측정 안 함" or early_quit == "모름 / 측정 안 함":
        y -= 0.45

    clamped_x = _clamp(x)
    clamped_y = _clamp(y)
    return AlignmentMapVector(
        domain_id="retention",
        domain_name="인력",
        x=clamped_x,
        y=clamped_y,
        magnitude=min(1.0, 0.5 + abs(clamped_x) * 0.25 + abs(clamped_y) * 0.25),
        direction_label=_direction_label(clamped_x, clamped_y),
        evidence=[
            f"자발적 이직률: {turnover}",
            f"핵심 인재 이탈: {core_loss}",
            f"조기 퇴사율: {early_quit}",
        ],
    )


def _leadership_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    feedback = _text(responses.get("2-5-1"))
    one_on_one = _text(responses.get("2-5-2"))
    hiring_approval = _text(responses.get("2-5-4"))
    release_decision = _text(responses.get("2-5-5"))
    core_values = _text(responses.get("2-5-6"))
    ceo_bottleneck = "CEO가 모든 인원" in hiring_approval or release_decision == "CEO 최종 승인 필요"

    x = -0.2
    if ceo_bottleneck:
        x += 0.35
    if one_on_one == "운영함":
        x -= 0.15

    y = 0.2
    if ceo_bottleneck:
        y -= 0.25
    if core_values == "명확한 기준으로 작동함":
        y += 0.35
    elif core_values == "문서로만 존재함":
        y -= 0.2
    if feedback == "대부분 객관적으로 잘 수행함":
        y += 0.15

    clamped_x = _clamp(x)
    clamped_y = _clamp(y)
    return AlignmentMapVector(
        domain_id="leadership",
        domain_name="리더십",
        x=clamped_x,
        y=clamped_y,
        magnitude=min(1.0, 0.5 + abs(clamped_x) * 0.2 + abs(clamped_y) * 0.3),
        direction_label=_direction_label(clamped_x, clamped_y),
        evidence=[
            f"리더 피드백: {feedback}",
            f"1on1: {one_on_one}",
            f"의사결정 구조: {release_decision}",
        ],
    )


def _build_conflicts(vectors: list[AlignmentMapVector]) -> list[AlignmentMapConflict]:
    by_id = {vector.domain_id: vector for vector in vectors}
    conflicts: list[AlignmentMapConflict] = []
    compensation = by_id["compensation"]
    evaluation = by_id["evaluation"]
    recruitment = by_id["recruitment"]
    leadership = by_id["leadership"]

    if compensation.x >= 0.35 and evaluation.y <= 0.15:
        conflicts.append(
            AlignmentMapConflict(
                id="reward_points_to_performance_eval_points_to_low_basis",
                title="보상은 성과주의를 말하지만, 평가 근거가 따라오지 않습니다.",
                detail=(
                    "보상 화살표는 성과·시장 방향인데 평가 화살표가 제도·데이터 방향으로 충분히 "
                    "올라오지 못하면 차등 보상이 재량처럼 보일 수 있습니다."
                ),
                domains=("compensation", "evaluation"),
                severity="high",
            )
        )

    if recruitment.x >= 0.25 and compensation.x <= 0.1:
        conflicts.append(
            AlignmentMapConflict(
                id="hiring_points_to_growth_reward_points_to_low_market",
                title="채용은 확장을 보지만, 보상 메시지가 후보자를 설득하기 어렵습니다.",
                detail=(
                    "공격적 채용을 하려면 오퍼와 보상 철학이 같은 방향을 봐야 합니다. 보상 경쟁력이 "
                    "낮으면 채용 속도는 계획보다 느려집니다."
                ),
                domains=("recruitment", "compensation"),
                severity="high",
            )
        )

    if evaluation.x >= 0.25 and leadership.y <= 0.05:
        conflicts.append(
            AlignmentMapConflict(
                id="evaluation_points_to_performance_leadership_points_to_bottleneck",
                title="평가는 성과 기준을 요구하지만, 리더 운영은 병목에 가깝습니다.",
                detail=(
                    "성과 기준을 세워도 리더가 피드백과 의사결정을 감당하지 못하면 제도는 "
                    "문서로만 남습니다."
                ),
                domains=("evaluation", "leadership"),
                severity="medium",
            )
        )

    if not conflicts:
        conflicts.append(
            AlignmentMapConflict(
                id="no_major_vector_conflict",
                title="큰 방향 충돌은 제한적입니다.",
                detail="현재 입력 기준으로는 제도 방향이 크게 흩어지지 않았습니다. 세부 실행 부담은 영역별 상세 분석에서 확인합니다.",
                domains=tuple(vector.domain_id for vector in vectors[:2]),
                severity="low",
            )
        )

    return conflicts[:3]


def _clamp(value: float, low: float = -1.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _as_int(value: Any, default: int) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default


def _score_to_axis(value: int, midpoint: int = 3) -> float:
    return _clamp((value - midpoint) / 2)


def _text(value: Any) -> str:
    return str(value) if value not in (None, "") else "미입력"


def _direction_label(x: float, y: float) -> str:
    if abs(x) < 0.18 and abs(y) < 0.18:
        return "방향 약함"
    horizontal = "성과·시장" if x >= 0.18 else "공동체·장기 신뢰" if x <= -0.18 else "중립"
    vertical = "제도·데이터" if y >= 0.18 else "관계·자율" if y <= -0.18 else "중립"
    if horizontal == "중립":
        return vertical
    if vertical == "중립":
        return horizontal
    return f"{horizontal} / {vertical}"
