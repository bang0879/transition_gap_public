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
class AlignmentAxis:
    """A domain-specific tension axis between CEO philosophy and actual system."""

    domain_id: str
    domain_name: str
    left_label: str
    right_label: str
    philosophy_label: str
    philosophy_note: str | None
    actual_label: str
    policy_direction: str
    alignment_percent: int
    status_label: str
    philosophy_position: float
    actual_position: float
    tension: float
    tension_level: str
    headline: str
    evidence: list[str]
    business_risk: str | None


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
    axes: list[AlignmentAxis]
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
        axes=_build_axes(responses),
        conflicts=_build_conflicts(vectors),
    )


def _build_axes(responses: dict[str, Any]) -> list[AlignmentAxis]:
    axes = [
        _compensation_axis(responses),
        _evaluation_axis(responses),
        _recruitment_axis(responses),
        _retention_axis(responses),
        _leadership_axis(responses),
    ]
    return [
        AlignmentAxis(
            domain_id=axis.domain_id,
            domain_name=axis.domain_name,
            left_label=axis.left_label,
            right_label=axis.right_label,
            philosophy_label=axis.philosophy_label,
            philosophy_note=axis.philosophy_note,
            actual_label=axis.actual_label,
            policy_direction=axis.policy_direction,
            alignment_percent=axis.alignment_percent,
            status_label=axis.status_label,
            philosophy_position=axis.philosophy_position,
            actual_position=axis.actual_position,
            tension=axis.tension,
            tension_level=axis.tension_level,
            headline=axis.headline,
            evidence=axis.evidence,
            business_risk=_business_risk_for_axis(axis),
        )
        for axis in axes
    ]


def _compensation_axis(responses: dict[str, Any]) -> AlignmentAxis:
    philosophy = _choice_position(
        responses.get("L0-1"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("파격", "상위 고성과자"),
        b_keywords=("협업", "평균 보상", "팀 기여"),
    )
    reward_philosophy = _as_int(responses.get("2-3-1"), 3)
    structure = _text(responses.get("2-3-2"))
    eval_link = _as_int(responses.get("2-4-2"), 3)

    actual = -_score_to_axis(reward_philosophy)
    if "단기 성과형" in structure or "인센티브" in structure:
        actual -= 0.25
    if "현금 안정형" in structure or "기본급" in structure:
        actual += 0.2
    if eval_link >= 4:
        actual -= 0.15
    elif eval_link <= 2:
        actual += 0.15

    return _axis(
        domain_id="compensation",
        domain_name="보상",
        left_label="차등/파격",
        right_label="균등/안정",
        philosophy_label=_side_label(philosophy, "차등/파격 보상", "균등/안정 보상"),
        philosophy_note=_compensation_philosophy_note(responses),
        actual_label=_compensation_actual_label(structure, actual),
        policy_direction=_policy_direction(actual),
        philosophy_position=philosophy,
        actual_position=actual,
        evidence=[
            _philosophy_evidence("보상 철학", responses.get("L0-1")),
            f"보상 구조: {structure}",
            f"평가-보상 연동: {eval_link}점",
        ],
    )


def _evaluation_axis(responses: dict[str, Any]) -> AlignmentAxis:
    reward_philosophy = _choice_position(
        responses.get("L0-1"),
        option_a=-0.75,
        option_b=0.45,
        a_keywords=("파격", "상위 고성과자"),
        b_keywords=("협업", "평균 보상", "팀 기여"),
    )
    leadership_philosophy = _choice_position(
        responses.get("L0-2"),
        option_a=-0.65,
        option_b=0.55,
        a_keywords=("성과 추적", "솔직한 피드백", "저성과"),
        b_keywords=("1:1", "고충", "심리적 안전"),
    )
    philosophy = (reward_philosophy + leadership_philosophy) / 2
    philosophy_label = _side_label(philosophy, "정교/엄격한 평가", "관대/유연한 평가")

    cycle = _text(responses.get("2-4-1a"))
    eval_link = _as_int(responses.get("2-4-2"), 3)
    ceo_fair = _as_int(responses.get("2-4-3-ceo"), 5)
    employee_fair = _as_int(responses.get("2-4-3-employee"), 5)
    eval_data = _text(responses.get("2-4-5"))
    active = cycle not in ("운영하지 않음", "없음", "비정기", "미입력")

    actual = -_score_to_axis(eval_link)
    if not active:
        actual += 0.45
    if eval_data in ("모름 / 측정 안 함", "미입력"):
        actual += 0.3
    if max(0, ceo_fair - employee_fair) >= 3:
        actual += 0.15
    if cycle in ("분기 1회", "월 1회", "상시"):
        actual -= 0.15

    return _axis(
        domain_id="evaluation",
        domain_name="평가",
        left_label="정교/엄격",
        right_label="관대/유연",
        philosophy_label=philosophy_label,
        philosophy_note=_evaluation_philosophy_note(responses),
        actual_label=_evaluation_actual_label(cycle, eval_data, actual),
        policy_direction=_policy_direction(actual),
        philosophy_position=philosophy,
        actual_position=actual,
        evidence=[
            _philosophy_evidence("성과/피드백 철학", responses.get("L0-2")),
            f"평가 주기: {cycle}",
            f"평가 운영 데이터: {eval_data}",
        ],
    )


def _recruitment_axis(responses: dict[str, Any]) -> AlignmentAxis:
    philosophy = _choice_position(
        responses.get("L0-3"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("외부", "S급", "즉시 전력"),
        b_keywords=("내부", "주니어", "육성"),
    )
    hiring_plan = _text(responses.get("L1-4"))
    duration = _text(responses.get("2-2-1"))
    offer_issue = _text(responses.get("2-2-3"))
    market = _text(responses.get("2-3-5"))
    branding = _text(responses.get("2-2-4"))
    onboarding = _text(responses.get("2-2-5"))

    actual = 0.15
    if hiring_plan.startswith("공격적"):
        actual -= 0.4
    if duration in ("1개월 미만", "1~2개월"):
        actual -= 0.15
    elif duration in ("4~6개월", "6개월 초과", "4개월 초과"):
        actual += 0.2
    if market == "상위":
        actual -= 0.15
    elif market == "하위":
        actual += 0.15
    if "자주" in offer_issue or "높음" in offer_issue:
        actual += 0.1
    if branding == "채용 페이지/컬처덱/인터뷰 자료가 있음":
        actual -= 0.1
    elif branding == "거의 없음":
        actual += 0.12
    if onboarding == "정기적으로 추적함":
        actual += 0.08
    elif onboarding == "추적하지 않음":
        actual -= 0.08

    return _axis(
        domain_id="recruitment",
        domain_name="채용",
        left_label="외부 수혈/속도",
        right_label="내부 육성/적합성",
        philosophy_label=_side_label(philosophy, "외부 영입/속도 중심", "내부 육성/적합성 중심"),
        philosophy_note=_recruitment_philosophy_note(responses),
        actual_label=_recruitment_actual_label(hiring_plan, duration, actual),
        policy_direction=_policy_direction(actual),
        philosophy_position=philosophy,
        actual_position=actual,
        evidence=[
            _philosophy_evidence("채용 철학", responses.get("L0-3")),
            f"채용 기조: {hiring_plan}",
            f"채용 소요 기간: {duration}",
            f"채용 브랜딩: {branding}",
        ],
    )


def _retention_axis(responses: dict[str, Any]) -> AlignmentAxis:
    philosophy = _choice_position(
        responses.get("L0-4"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("형평성", "보상 원칙", "원칙대로 내보낸다"),
        b_keywords=("비즈니스 공백", "예외를 인정", "파격적으로 잡는다"),
    )
    turnover = _text(responses.get("2-1-1"))
    core_loss = _text(responses.get("2-1-2"))
    early_quit = _text(responses.get("2-1-3"))
    talent_criteria = _text(responses.get("2-1-4"))
    succession = _text(responses.get("2-1-5"))

    actual = 0.35
    if core_loss in ("2~3명", "4명 이상"):
        actual -= 0.45
    if turnover in ("20% 초과", "20% 이상"):
        actual -= 0.25
    if early_quit in ("20% 이상", "30% 이상"):
        actual -= 0.15
    if turnover == "모름 / 측정 안 함" or early_quit == "모름 / 측정 안 함":
        actual -= 0.15
    if talent_criteria == "별도 기준 없음":
        actual -= 0.12
    elif talent_criteria == "명확한 기준과 명단이 있음":
        actual += 0.08
    if succession == "거의 없음":
        actual -= 0.12
    elif succession == "후임/백업 후보가 정해져 있음":
        actual += 0.08

    return _axis(
        domain_id="retention",
        domain_name="인력운영",
        left_label="자연 교체 허용",
        right_label="안정 최우선",
        philosophy_label=_side_label(philosophy, "자연 교체 허용", "핵심 인재 보존"),
        philosophy_note=_retention_philosophy_note(responses),
        actual_label=_retention_actual_label(turnover, core_loss, actual),
        policy_direction=_policy_direction(actual),
        philosophy_position=philosophy,
        actual_position=actual,
        evidence=[
            _philosophy_evidence("인력운영 철학", responses.get("L0-4")),
            f"자발적 이직률: {turnover}",
            f"핵심 인재 이탈: {core_loss}",
            f"핵심 인재 기준: {talent_criteria}",
        ],
    )


def _leadership_axis(responses: dict[str, Any]) -> AlignmentAxis:
    philosophy = _choice_position(
        responses.get("L0-2"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("성과 추적", "솔직한 피드백", "저성과"),
        b_keywords=("1:1", "고충", "심리적 안전"),
    )
    feedback = _text(responses.get("2-5-1"))
    one_on_one = _text(responses.get("2-5-2"))
    release_decision = _text(responses.get("2-5-5"))
    core_values = _text(responses.get("2-5-6"))

    actual = 0.1
    if "객관적으로" in feedback or core_values == "명확한 기준으로 작동함":
        actual -= 0.35
    if one_on_one == "운영함":
        actual += 0.25
    if "대표인 내가 직접" in feedback or release_decision == "CEO 최종 승인 필요":
        actual -= 0.2
    if core_values == "문서로만 존재함":
        actual += 0.15

    return _axis(
        domain_id="leadership",
        domain_name="리더십",
        left_label="성과 추적/단호함",
        right_label="관계 관리/심리적 안전",
        philosophy_label=_side_label(philosophy, "성과 추적/단호함", "관계 관리/심리적 안전"),
        philosophy_note=_leadership_philosophy_note(responses),
        actual_label=_leadership_actual_label(feedback, one_on_one, core_values, actual),
        policy_direction=_policy_direction(actual),
        philosophy_position=philosophy,
        actual_position=actual,
        evidence=[
            _philosophy_evidence("리더십 철학", responses.get("L0-2")),
            f"리더 피드백: {feedback}",
            f"핵심가치 작동: {core_values}",
        ],
    )


def _axis(
    *,
    domain_id: str,
    domain_name: str,
    left_label: str,
    right_label: str,
    philosophy_label: str,
    philosophy_note: str | None,
    actual_label: str,
    policy_direction: str,
    philosophy_position: float,
    actual_position: float,
    evidence: list[str],
) -> AlignmentAxis:
    philosophy = round(_clamp(philosophy_position), 3)
    actual = round(_clamp(actual_position), 3)
    tension = round(abs(actual - philosophy), 3)
    alignment_percent = _alignment_percent(tension)
    return AlignmentAxis(
        domain_id=domain_id,
        domain_name=domain_name,
        left_label=left_label,
        right_label=right_label,
        philosophy_label=philosophy_label,
        philosophy_note=philosophy_note,
        actual_label=actual_label,
        policy_direction=policy_direction,
        alignment_percent=alignment_percent,
        status_label=_status_label(alignment_percent),
        philosophy_position=philosophy,
        actual_position=actual,
        tension=tension,
        tension_level=_tension_level(tension),
        headline=_axis_headline(domain_name, philosophy, actual, left_label, right_label),
        evidence=evidence,
        business_risk=None,
    )


def _choice_position(
    value: Any,
    *,
    option_a: float,
    option_b: float,
    a_keywords: tuple[str, ...],
    b_keywords: tuple[str, ...],
) -> float:
    text = _text(value)
    if text == "A" or any(keyword in text for keyword in a_keywords):
        return option_a
    if text == "B" or any(keyword in text for keyword in b_keywords):
        return option_b
    return 0.0


def _philosophy_evidence(label: str, value: Any) -> str:
    text = _text(value)
    if text == "A":
        return f"{label}: A안"
    if text == "B":
        return f"{label}: B안"
    return f"{label}: {text}"


def _side_label(position: float, left_label: str, right_label: str) -> str:
    if position < -0.15:
        return left_label
    if position > 0.15:
        return right_label
    return "혼합형"


def _policy_direction(actual_position: float) -> str:
    return "성과주의" if actual_position < 0 else "공동체"


def _alignment_percent(tension: float) -> int:
    return max(0, min(100, round((1 - tension / 2) * 100)))


def _status_label(alignment_percent: int) -> str:
    if alignment_percent >= 80:
        return "일치"
    if alignment_percent >= 50:
        return "주의"
    return "심각"


def _tension_level(tension: float) -> str:
    if tension >= 0.75:
        return "misaligned"
    if tension >= 0.35:
        return "watch"
    return "aligned"


def _axis_headline(
    domain_name: str,
    philosophy_position: float,
    actual_position: float,
    left_label: str,
    right_label: str,
) -> str:
    philosophy_label = left_label if philosophy_position < 0 else right_label if philosophy_position > 0 else "중앙"
    actual_label = left_label if actual_position < 0 else right_label if actual_position > 0 else "중앙"
    return f"{domain_name}: 대표 철학은 {philosophy_label}, 실제 제도는 {actual_label}에 가깝습니다."


def _evaluation_philosophy_note(responses: dict[str, Any]) -> str:
    reward = _choice_position(
        responses.get("L0-1"),
        option_a=-0.75,
        option_b=0.45,
        a_keywords=("파격", "상위 고성과자"),
        b_keywords=("협업", "평균 보상", "팀 기여"),
    )
    leadership = _choice_position(
        responses.get("L0-2"),
        option_a=-0.65,
        option_b=0.55,
        a_keywords=("성과 추적", "솔직한 피드백", "저성과"),
        b_keywords=("1:1", "고충", "심리적 안전"),
    )
    if reward < 0 and leadership > 0:
        return "차등 보상을 하려면 정교한 평가가 필요합니다."
    if reward > 0 and leadership < 0:
        return "균등 보상 철학에서는 엄격한 평가는 불필요한 긴장을 만들 수 있습니다."
    combined = (reward + leadership) / 2
    if combined < -0.15:
        return "회사는 평가 기준을 명확히 세우고 성과 차이를 비교적 엄격하게 다루는 방향을 중시합니다."
    if combined > 0.15:
        return "회사는 평가를 통제보다 코칭과 수용성 관리의 장치로 쓰는 방향을 중시합니다."
    return "회사는 평가의 엄격함과 구성원 수용성 사이의 균형을 중시합니다."


def _compensation_philosophy_note(responses: dict[str, Any]) -> str:
    position = _choice_position(
        responses.get("L0-1"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("?뚭꺽", "?곸쐞 怨좎꽦怨쇱옄"),
        b_keywords=("?묒뾽", "?됯퇏 蹂댁긽", "? 湲곗뿬"),
    )
    if position < -0.15:
        return "회사는 핵심 고성과자에게 더 큰 보상을 주는 차등 배분을 중시합니다."
    if position > 0.15:
        return "회사는 소수 파격 보상보다 협업과 안정적인 보상 질서를 중시합니다."
    return "회사는 보상 차등과 안정성 사이의 균형을 중시합니다."


def _recruitment_philosophy_note(responses: dict[str, Any]) -> str:
    position = _choice_position(
        responses.get("L0-3"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("?몃?", "S湲?", "利됱떆 ?꾨젰"),
        b_keywords=("?대?", "二쇰땲??", "?≪꽦"),
    )
    if position < -0.15:
        return "회사는 검증된 외부 인재를 빠르게 영입해 성장 속도를 높이는 방향을 중시합니다."
    if position > 0.15:
        return "회사는 회사 맥락에 맞는 사람을 내부에서 오래 키우는 방향을 중시합니다."
    return "회사는 외부 영입과 내부 육성의 균형을 중시합니다."


def _retention_philosophy_note(responses: dict[str, Any]) -> str:
    position = _choice_position(
        responses.get("L0-4"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("?뺥룊??", "蹂댁긽 ?먯튃", "?먯튃?濡??대낫?몃떎"),
        b_keywords=("鍮꾩쫰?덉뒪 怨듬갚", "?덉쇅瑜??몄젙", "?뚭꺽?곸쑝濡??〓뒗??"),
    )
    if position < -0.15:
        return "회사는 핵심 인재 예외 보상보다 전체 보상 원칙과 형평성을 우선합니다."
    if position > 0.15:
        return "회사는 중요한 역할 공백을 막기 위해 핵심 인재 예외 조치도 감수합니다."
    return "회사는 형평성과 핵심 인재 보존 사이의 균형을 중시합니다."


def _leadership_philosophy_note(responses: dict[str, Any]) -> str:
    position = _choice_position(
        responses.get("L0-2"),
        option_a=-0.75,
        option_b=0.75,
        a_keywords=("?깃낵 異붿쟻", "?붿쭅???쇰뱶諛?", "??깃낵"),
        b_keywords=("1:1", "怨좎땐", "?щ━???덉쟾"),
    )
    if position < -0.15:
        return "회사는 성과 부진을 빠르게 직면하고 기준에 따라 피드백하는 리더십을 중시합니다."
    if position > 0.15:
        return "회사는 관계와 심리적 안전을 지키며 구성원을 설득하는 리더십을 중시합니다."
    return "회사는 성과 직면과 관계 관리의 균형을 중시합니다."


def _compensation_actual_label(structure: str, actual_position: float) -> str:
    if "단기 성과형" in structure or "인센티브" in structure:
        return "성과급 중심 보상"
    if "현금 안정형" in structure or "기본급" in structure:
        return "기본급 안정형"
    return _side_label(actual_position, "차등 보상 운영", "균등 보상 운영")


def _evaluation_actual_label(cycle: str, eval_data: str, actual_position: float) -> str:
    if cycle in ("운영하지 않음", "없음", "비정기", "미입력"):
        return "평가 미운영"
    if eval_data in ("모름 / 측정 안 함", "미입력"):
        return "근거 데이터 약한 평가"
    return _side_label(actual_position, "정교한 성과 평가", "관대한 유연 평가")


def _recruitment_actual_label(hiring_plan: str, duration: str, actual_position: float) -> str:
    if hiring_plan.startswith("공격적") and duration in ("1개월 미만", "1~2개월"):
        return "속도 중심 채용"
    if duration in ("4~6개월", "6개월 초과", "4개월 초과"):
        return "신중한 장기 채용"
    return _side_label(actual_position, "외부 수혈형 채용", "내부 적합성 채용")


def _retention_actual_label(turnover: str, core_loss: str, actual_position: float) -> str:
    if core_loss in ("2~3명", "4명 이상"):
        return "핵심 인재 이탈 압력"
    if turnover in ("20% 초과", "20% 이상"):
        return "높은 교체 흐름"
    return _side_label(actual_position, "자연 교체 허용", "핵심 인재 보존")


def _leadership_actual_label(feedback: str, one_on_one: str, core_values: str, actual_position: float) -> str:
    if "대표인 내가 직접" in feedback:
        return "대표 병목형 리더십"
    if one_on_one == "운영함":
        return "관계 관리형 리더십"
    if core_values == "명확한 기준으로 작동함":
        return "기준 중심 리더십"
    return _side_label(actual_position, "성과 추적형 리더십", "관계 관리형 리더십")


def _business_risk_for_axis(axis: AlignmentAxis) -> str | None:
    if axis.tension < 0.75:
        return None
    risks = {
        "compensation": "차등 보상 철학과 실제 균등 운영이 벌어지면, 고성과자는 보상 신호를 믿지 못하고 외부 제안에 더 빨리 반응합니다.",
        "evaluation": "엄격한 성과 철학과 관대한 평가 운영이 벌어지면, 고성과자는 불공정을 느끼고 저성과자는 개선 압력을 받지 않습니다.",
        "recruitment": "외부 수혈 철학과 내부 적합성 중심 운영이 벌어지면, 성장 속도에 필요한 역량 확보가 늦어집니다.",
        "retention": "안정성 철학과 교체 허용 운영이 벌어지면, 핵심 역할의 공백 비용이 반복적으로 커집니다.",
        "leadership": "단호한 성과 추적 철학과 관계 중심 운영이 벌어지면, 의사결정 지연과 책임 회피가 리더십 신호로 굳어집니다.",
    }
    return risks.get(axis.domain_id)


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
        domain_name="인력운영",
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
    if isinstance(value, list):
        return ", ".join(str(item) for item in value if item not in (None, ""))
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
