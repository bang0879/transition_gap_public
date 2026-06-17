"""Diagnosis mode classifier for Foundation/Alignment/Hybrid gaps."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable


DiagnosisMode = str

FOUNDATION_THRESHOLD = 3
HYBRID_ALIGNMENT_THRESHOLD = 2


@dataclass(frozen=True)
class DiagnosisSignal:
    id: str
    domain_id: str
    domain_name: str
    title: str
    detail: str
    severity: str


@dataclass(frozen=True)
class DiagnosisModeAnalysis:
    diagnosis_mode: DiagnosisMode
    foundation_signals: list[DiagnosisSignal]
    alignment_signals: list[DiagnosisSignal]


def analyze_diagnosis_mode(
    responses: dict[str, Any],
    alignment_conflicts: Iterable[Any] = (),
) -> DiagnosisModeAnalysis:
    """Classify the diagnosis into foundation, alignment, or hybrid mode."""
    foundation_signals = _foundation_signals(responses)
    alignment_signals = _alignment_signals(alignment_conflicts)

    foundation_count = len(foundation_signals)
    alignment_count = len(alignment_signals)
    foundation_ids = {signal.id for signal in foundation_signals}
    has_core_absence_pair = {
        "compensation_ad_hoc",
        "evaluation_not_operated",
    }.issubset(foundation_ids)

    if has_core_absence_pair:
        diagnosis_mode = "hybrid" if alignment_count >= HYBRID_ALIGNMENT_THRESHOLD else "foundation"
    elif foundation_count >= FOUNDATION_THRESHOLD and alignment_count >= HYBRID_ALIGNMENT_THRESHOLD:
        diagnosis_mode = "hybrid"
    elif foundation_count >= FOUNDATION_THRESHOLD:
        diagnosis_mode = "foundation"
    elif foundation_count >= 2 and alignment_count >= 1:
        diagnosis_mode = "hybrid"
    else:
        diagnosis_mode = "alignment"

    return DiagnosisModeAnalysis(
        diagnosis_mode=diagnosis_mode,
        foundation_signals=foundation_signals,
        alignment_signals=alignment_signals,
    )


def _foundation_signals(responses: dict[str, Any]) -> list[DiagnosisSignal]:
    signals: list[DiagnosisSignal] = []

    reward_structure = _text(responses.get("2-3-2"))
    eval_cycle = _text(responses.get("2-4-1a"))
    eval_link = responses.get("2-4-2")
    eval_data = _text(responses.get("2-4-5"))
    one_on_one = _text(responses.get("2-5-2"))
    feedback = _text(responses.get("2-5-1"))
    hiring_approval = _text(responses.get("2-5-4"))
    release_decision = _text(responses.get("2-5-5"))
    core_values = _text(responses.get("2-5-6"))

    eval_active = _is_evaluation_active(eval_cycle)

    if _is_ad_hoc_compensation(reward_structure):
        signals.append(
            DiagnosisSignal(
                id="compensation_ad_hoc",
                domain_id="compensation",
                domain_name="보상",
                title="보상 기준이 입사·협상별로 결정되고 있습니다.",
                detail=(
                    "보상 판단이 누적 기준보다 개별 협상에 의존하면, 같은 역할 안에서도 "
                    "형평성 이슈가 뒤늦게 드러날 수 있습니다."
                ),
                severity="high",
            )
        )

    if not eval_active:
        signals.append(
            DiagnosisSignal(
                id="evaluation_not_operated",
                domain_id="evaluation",
                domain_name="평가",
                title="정기 평가 루프가 아직 운영되지 않습니다.",
                detail=(
                    "평가 루프가 없으면 성과 피드백, 연봉 조정, 역할 기대치를 설명할 "
                    "공식 근거가 약해집니다."
                ),
                severity="high",
            )
        )

    if eval_active and _is_subjective_reward_link(eval_link):
        signals.append(
            DiagnosisSignal(
                id="evaluation_reward_discretion",
                domain_id="evaluation",
                domain_name="평가",
                title="평가-보상 연결이 대표/리더 재량에 기대고 있습니다.",
                detail=(
                    "차등은 있지만 공식 기준보다 주관 판단이 크면, 구성원은 성과 차등을 "
                    "기준이 아니라 사람의 판단으로 받아들일 수 있습니다."
                ),
                severity="medium",
            )
        )

    if eval_active and eval_data in ("모름 / 측정 안 함", "미입력", "모르겠음"):
        signals.append(
            DiagnosisSignal(
                id="evaluation_data_unknown",
                domain_id="evaluation",
                domain_name="평가",
                title="평가 결과 분포와 보상 차등 데이터를 보지 못하고 있습니다.",
                detail=(
                    "평가를 운영해도 결과 분포와 보상 차등 폭이 보이지 않으면, 제도 수용성 "
                    "문제를 늦게 발견할 가능성이 큽니다."
                ),
                severity="medium",
            )
        )

    if one_on_one == "운영 안 함":
        signals.append(
            DiagnosisSignal(
                id="leadership_one_on_one_absent",
                domain_id="leadership",
                domain_name="리더십",
                title="리더와 구성원 사이의 정기 1on1 채널이 없습니다.",
                detail=(
                    "정기 대화 채널이 없으면 불만, 이탈 신호, 성과 문제를 대표나 HR이 "
                    "늦게 알게 됩니다."
                ),
                severity="medium",
            )
        )

    if _has_ceo_dependency(feedback, hiring_approval, release_decision):
        signals.append(
            DiagnosisSignal(
                id="leadership_ceo_bottleneck",
                domain_id="leadership",
                domain_name="리더십",
                title="핵심 판단이 대표에게 집중되어 있습니다.",
                detail=(
                    "채용, 피드백, 배포 같은 반복 의사결정이 대표에게 모이면 규모가 커질수록 "
                    "조직 속도가 특정 의사결정자 일정에 묶입니다."
                ),
                severity="medium",
            )
        )

    if _core_values_are_weak(core_values):
        signals.append(
            DiagnosisSignal(
                id="leadership_core_values_weak",
                domain_id="leadership",
                domain_name="리더십",
                title="핵심가치가 채용·평가 기준으로 충분히 작동하지 않습니다.",
                detail=(
                    "핵심가치가 선언에 머물거나 리더별로 다르게 적용되면, 회사가 말하는 기준과 "
                    "현장의 판단 기준이 갈라질 수 있습니다."
                ),
                severity="medium",
            )
        )

    return signals


def _alignment_signals(alignment_conflicts: Iterable[Any]) -> list[DiagnosisSignal]:
    signals: list[DiagnosisSignal] = []
    seen: set[str] = set()
    for conflict in alignment_conflicts:
        conflict_id = _text(getattr(conflict, "id", ""))
        if not conflict_id or conflict_id in seen:
            continue
        seen.add(conflict_id)
        domains = list(getattr(conflict, "domains", []) or [])
        domain_id = _text(domains[0]) if domains else "alignment"
        signals.append(
            DiagnosisSignal(
                id=conflict_id,
                domain_id=domain_id,
                domain_name=_domain_name(domain_id),
                title=_text(getattr(conflict, "title", "")),
                detail=_text(getattr(conflict, "detail", "")),
                severity=_text(getattr(conflict, "severity", "medium")) or "medium",
            )
        )
    return signals[:5]


def _is_ad_hoc_compensation(value: str) -> bool:
    return "입사·협상" in value or "정해진 보상 체계 없음" in value or "개별 결정" in value


def _is_evaluation_active(value: str) -> bool:
    return value not in ("운영하지 않음", "없음", "비정기", "미입력", "")


def _is_subjective_reward_link(value: Any) -> bool:
    if isinstance(value, (int, float)):
        return int(value) <= 2
    text = _text(value)
    return "대표 재량" in text or "주관적 판단" in text or "공식적인 룰" in text


def _has_ceo_dependency(feedback: str, hiring_approval: str, release_decision: str) -> bool:
    return (
        "대표인 내가 직접" in feedback
        or "CEO가 모든 인원" in hiring_approval
        or "CEO 최종 승인" in release_decision
    )


def _core_values_are_weak(value: str) -> bool:
    return (
        "홈페이지" in value
        or "들쭉날쭉" in value
        or "문서로만" in value
        or "일부 참고" in value
        or "선언" in value
    )


def _domain_name(domain_id: str) -> str:
    return {
        "compensation": "보상",
        "evaluation": "평가",
        "recruitment": "채용",
        "retention": "인력운영",
        "leadership": "리더십",
    }.get(domain_id, "정합성")


def _text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()
