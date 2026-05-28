"""Cross-domain HR alignment analysis."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AlignmentConflict:
    """A conflict between HR system domains."""

    id: str
    title: str
    detail: str
    severity: str
    penalty: int
    domains: tuple[str, ...]


@dataclass(frozen=True)
class AlignmentAnalysis:
    """Overall alignment score and conflict list."""

    score: int
    base_score: int
    total_penalty: int
    conflicts: list[AlignmentConflict]


def analyze_alignment(areas: list[Any], responses: dict[str, Any]) -> AlignmentAnalysis:
    """Return current alignment analysis."""
    base_score = round(sum(area.score for area in areas) / len(areas)) if areas else 0
    area_map = {area.area_id: area for area in areas}
    conflicts: list[AlignmentConflict] = []

    compensation = area_map.get("compensation")
    evaluation = area_map.get("evaluation")
    leadership = area_map.get("leadership")

    reward_structure = str(responses.get("2-3-2", ""))
    evaluation_data = responses.get("2-4-5")
    if (
        ("단기 성과형" in reward_structure or "인센티브" in reward_structure)
        and ((evaluation and evaluation.score < 65) or evaluation_data in (None, "모름 / 측정 안 함"))
    ):
        conflicts.append(
            AlignmentConflict(
                id="performance_reward_without_eval",
                title="성과 보상 메시지를 뒷받침할 평가 근거가 약합니다.",
                detail=(
                    "보상은 성과주의 쪽으로 기울어 있는데 평가 데이터나 평가 운영 신뢰가 약하면, "
                    "구성원은 보상 차등을 성과가 아니라 재량으로 받아들일 수 있습니다."
                ),
                severity="high",
                penalty=15 if evaluation and evaluation.score < 55 else 10,
                domains=("compensation", "evaluation"),
            )
        )

    if responses.get("L0-1") == "B" and (
        responses.get("2-5-1") == "대표인 내가 직접 나서야 해결됨"
        or _has_ceo_bottleneck(responses)
    ):
        conflicts.append(
            AlignmentConflict(
                id="collaboration_reward_with_ceo_bottleneck",
                title="협업 보상 철학과 중앙집중 의사결정이 충돌합니다.",
                detail=(
                    "협업과 팀 기여를 강조하면서 실제 결정은 CEO에게 모이면, 리더와 구성원은 "
                    "팀 기준보다 최종 승인권자의 판단을 더 크게 의식하게 됩니다."
                ),
                severity="medium",
                penalty=10,
                domains=("compensation", "leadership"),
            )
        )

    if _is_aggressive_hiring(responses.get("L1-4")) and responses.get("2-3-5") in ("하위", "중위"):
        conflicts.append(
            AlignmentConflict(
                id="aggressive_hiring_low_pay",
                title="채용 확장 속도와 보상 경쟁력이 맞지 않습니다.",
                detail=(
                    "공격적으로 채용하려는 계획이 있어도 시장 대비 보상이 낮으면, 후보자는 "
                    "오퍼 단계에서 이탈하고 채용 리드타임이 길어질 가능성이 큽니다."
                ),
                severity="high",
                penalty=10,
                domains=("recruitment", "compensation"),
            )
        )

    if responses.get("L0-2") == "A" and responses.get("2-5-1") in (
        "갈등을 피하거나 온정주의가 있음",
        "대표인 내가 직접 나서야 해결됨",
        "어려워함",
        "회피함",
    ):
        conflicts.append(
            AlignmentConflict(
                id="high_performance_low_feedback",
                title="성과 피드백 철학을 리더가 실행하기 어렵습니다.",
                detail=(
                    "명확한 성과 추적과 솔직한 피드백을 원하지만 리더가 어려운 피드백을 "
                    "주지 못하면 평가 제도는 실행 단계에서 갈등을 키웁니다."
                ),
                severity="high",
                penalty=10,
                domains=("evaluation", "leadership"),
            )
        )

    if responses.get("L0-3") == "B" and responses.get("2-5-6") in (
        "문서로만 존재함",
        "일부 참고함",
    ):
        conflicts.append(
            AlignmentConflict(
                id="culture_fit_without_core_value",
                title="내부 육성 철학을 받쳐줄 핵심가치 기준이 약합니다.",
                detail=(
                    "내부에서 오래 키울 인재를 중시한다면 채용과 평가에서 핵심가치가 실제 기준으로 "
                    "작동해야 합니다. 그렇지 않으면 '우리다운 인재'가 무엇인지 흐려집니다."
                ),
                severity="medium",
                penalty=8,
                domains=("recruitment", "leadership"),
            )
        )

    total_penalty = sum(conflict.penalty for conflict in conflicts)
    score = max(0, min(100, base_score - total_penalty))
    return AlignmentAnalysis(
        score=score,
        base_score=base_score,
        total_penalty=total_penalty,
        conflicts=conflicts,
    )


def _has_ceo_bottleneck(responses: dict[str, Any]) -> bool:
    return (
        responses.get("2-5-4") == "CEO가 모든 인원 최종 면접 및 승인"
        or responses.get("2-5-5") == "CEO 최종 승인 필요"
    )


def _is_aggressive_hiring(value: Any) -> bool:
    return str(value).startswith("공격적")
