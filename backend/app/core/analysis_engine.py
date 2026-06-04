"""
영역별 상세 분석 엔진.

설문 응답을 기반으로 5개 영역의 현황, 이슈, 갭, 추천 방향을 생성한다.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from app.core.visibility_index import calculate_visibility_index
from app.core.trade_off import calculate_core_talent_loss_severity

_IMPLICATIONS_PATH = Path(__file__).resolve().parent.parent / "content" / "implications.json"
_implications_cache: dict[str, Any] | None = None


def _load_implications() -> dict[str, Any]:
    """Load and cache score implication text mappings."""
    global _implications_cache
    if _implications_cache is None:
        with open(_IMPLICATIONS_PATH, encoding="utf-8") as f:
            _implications_cache = json.load(f)
    return _implications_cache


@dataclass(frozen=True)
class Issue:
    """영역별 주요 이슈."""

    title: str
    description: str
    severity: str


@dataclass
class AreaAnalysis:
    """한 영역의 분석 결과."""

    area_id: str
    area_name: str
    score: int
    benchmark: int
    gap: int
    priority: int
    difficulty: str
    status_text: str
    issues: list[Issue]
    recommendation: str
    tags: list[str] = field(default_factory=list)
    score_breakdown: list[dict[str, Any]] = field(default_factory=list)


def analyze_all_areas(responses: dict[str, Any]) -> list[AreaAnalysis]:
    """전체 응답으로 5개 영역 분석 결과를 생성한다."""
    areas = [
        _analyze_compensation(responses),
        _analyze_evaluation(responses),
        _analyze_recruitment(responses),
        _analyze_retention(responses),
        _analyze_leadership(responses),
    ]
    areas.sort(key=lambda area: area.gap, reverse=True)
    for index, area in enumerate(areas):
        area.priority = index + 1 if area.gap >= 10 else 0
    return areas


def get_cross_domain_insights(
    areas: list[AreaAnalysis],
    responses: dict[str, Any],
) -> list[dict[str, str]]:
    """영역 간 조합에서 발생하는 핵심 인사이트를 생성한다."""
    insights: list[dict[str, str]] = []
    area_map = {area.area_id: area for area in areas}
    visibility = calculate_visibility_index(responses)
    compensation = area_map.get("compensation")
    evaluation = area_map.get("evaluation")
    recruitment = area_map.get("recruitment")
    leadership = area_map.get("leadership")

    if visibility.score < 50:
        insights.append(
            {
                "headline": "측정하지 않는 것은 관리할 수 없습니다.",
                "detail": (
                    "현재 HR 데이터 가시성이 50% 미만입니다. 새 제도를 도입하기 전에, "
                    "이직률·채용 소요 기간·오퍼 수락률 등 핵심 지표를 엑셀로라도 "
                    "추적하는 것부터 시작하십시오. 데이터 없이 만든 제도는 감에 의존한 "
                    "도박이며, 가장 비싼 비용인 채용 실패와 핵심인재 이탈을 치르게 됩니다."
                ),
                "source": "HR 가시성",
            }
        )

    if compensation and evaluation and compensation.issues and evaluation.issues:
        insights.append(
            {
                "headline": "평가와 보상을 동시에 바꾸면 조직이 흔들립니다.",
                "detail": (
                    "평가 체계가 안착되지 않은 상태에서 보상까지 건드리면, 구성원들은 "
                    "'왜 내 등급이 이것인데 보상이 이것이냐'는 불만이 폭발합니다. "
                    "평가를 먼저 1~2사이클 돌리고, 최소 3개월 후에 보상을 연동하십시오."
                ),
                "source": "보상 + 평가",
            }
        )

    if recruitment and compensation:
        recruitment_issue_titles = {issue.title for issue in recruitment.issues}
        if recruitment_issue_titles & {"오퍼 경쟁력 부족", "채용-보상 미스매치"}:
            insights.append(
                {
                    "headline": "보상이 낮은데 채용에만 돈을 쏟으면 밑 빠진 독입니다.",
                    "detail": (
                        "시장 대비 보상이 낮은 상태에서 채용 채널이나 헤드헌터에 투자해도, "
                        "오퍼 단계에서 계속 거절당합니다. 보상 경쟁력을 먼저 올려야 "
                        "채용 효율이 자연스럽게 따라옵니다."
                    ),
                    "source": "채용 + 보상",
                }
            )

    if leadership and evaluation:
        leadership_issue_titles = {issue.title for issue in leadership.issues}
        evaluation_issue_titles = {issue.title for issue in evaluation.issues}
        if "리더 피드백 역량 부족" in leadership_issue_titles and (
            "평가 체계 부재" in evaluation_issue_titles or evaluation.gap >= 10
        ):
            insights.append(
                {
                    "headline": "리더가 준비 안 된 상태에서 평가 제도를 만들지 마세요.",
                    "detail": (
                        "평가 양식이 아무리 정교해도, 결과를 전달하는 리더가 피드백을 "
                        "회피하거나 어려워하면 평가 자체가 조직 갈등의 불씨가 됩니다. "
                        "수습하는 데 수개월의 시간과 리소스가 낭비됩니다. 제도보다 "
                        "리더 교육이 먼저입니다."
                    ),
                    "source": "리더십 + 평가",
                }
            )

    if leadership:
        leadership_issue_titles = {issue.title for issue in leadership.issues}
        headcount = responses.get("L1-2", "")
        if "의사결정 병목" in leadership_issue_titles and (
            headcount in ("100~500인", "500인 초과")
        ):
            insights.append(
                {
                    "headline": "CEO가 모든 결정을 쥐고 있으면, 100명이 10명처럼 움직입니다.",
                    "detail": (
                        "현재 채용과 배포를 CEO가 직접 승인하는 구조입니다. 조직이 100인을 "
                        "넘기면 이 구조가 성장의 가장 큰 병목이 됩니다. 전결권 위임 "
                        "체계를 설계하십시오."
                    ),
                    "source": "리더십 + 조직규모",
                }
            )

    return insights[:3]


def benchmark_for(area_id: str, responses: dict[str, Any]) -> int:
    """Return a context-aware benchmark for each HR domain."""
    base = {
        "compensation": 70,
        "evaluation": 75,
        "recruitment": 75,
        "retention": 72,
        "leadership": 75,
    }[area_id]

    headcount = responses.get("L1-2")
    if headcount == "20인 이하":
        base += {
            "retention": -8,
            "evaluation": -5,
            "leadership": -7,
            "recruitment": -3,
        }.get(area_id, 0)
    elif headcount == "20~50인":
        base += {
            "retention": -5,
            "leadership": -3,
        }.get(area_id, 0)
    elif headcount in ("100~500인", "500인 초과", "100인 초과"):
        base += {
            "evaluation": 5,
            "leadership": 5,
        }.get(area_id, 0)

    if _is_aggressive_hiring(responses.get("L1-4")):
        base += {
            "recruitment": 5,
            "retention": -3,
        }.get(area_id, 0)

    if responses.get("L0-1") == "A":
        base += {
            "compensation": 3,
            "evaluation": 3,
        }.get(area_id, 0)
    elif responses.get("L0-1") == "B":
        base += {
            "retention": 3,
            "leadership": 3,
        }.get(area_id, 0)

    return max(50, min(90, base))


def _analyze_compensation(responses: dict[str, Any]) -> AreaAnalysis:
    score, score_breakdown = _calc_compensation_score(responses)
    benchmark = benchmark_for("compensation", responses)
    gap = benchmark - score

    comp_philosophy = _as_int(responses.get("2-3-1"), 3)
    comp_structure = _text(responses.get("2-3-2"))
    market_position = _text(responses.get("2-3-5"))
    cost_ratio = _text(responses.get("2-3-3"))
    philosophy_text = {
        1: "비금전적 가치 최우선",
        2: "비금전 위주",
        3: "균형",
        4: "금전 위주",
        5: "금전적 보상 최우선",
    }.get(comp_philosophy, "균형")

    status = (
        f"귀사는 현재 {philosophy_text} 보상 철학을 갖고 있습니다. "
        f"금전 보상 구조는 '{comp_structure}' 유형이며, 시장 대비 보상 수준은 "
        f"'{market_position}', 매출 대비 인건비 비중은 '{cost_ratio}'입니다."
    )

    tags: list[str] = []
    if comp_philosophy <= 2:
        tags.append("비금전적 보상 중심")
    if market_position in ("하위", "중위"):
        tags.append(f"시장 {market_position}")
    if _is_high_cost_ratio(cost_ratio):
        tags.append(f"인건비 비중 {cost_ratio}")

    issues: list[Issue] = []
    eval_link = _as_int(responses.get("2-4-2"), 3)
    eval_active = _is_evaluation_active(responses.get("2-4-1a"))

    if eval_link <= 2 and eval_active:
        issues.append(
            Issue(
                "보상-성과 연동 부재",
                "평가를 운영하고 있으나 보상과의 연동이 약해 고성과자의 동기 부여가 저하될 수 있습니다.",
                "high",
            )
        )

    if market_position == "하위" or (market_position == "중위" and comp_philosophy <= 2):
        issues.append(
            Issue(
                "시장 경쟁력 열위",
                "시장 대비 보상이 낮거나 비금전적 보상에 크게 의존해 채용 오퍼 경쟁력이 약해질 수 있습니다.",
                "high",
            )
        )

    if _is_high_cost_ratio(cost_ratio) and eval_link <= 2:
        issues.append(
            Issue(
                "인건비 효율성 저하",
                "인건비 비중이 높은데 성과 연동이 약하면 인건비가 투자보다 고정 비용처럼 작동합니다.",
                "medium",
            )
        )

    if "현금 안정형" in comp_structure and comp_philosophy <= 2:
        issues.append(
            Issue(
                "성과급 구조 부재",
                "안정형 보상과 비금전 중심 철학이 겹치면 고성과자에게 줄 명확한 upside가 부족해집니다.",
                "medium",
            )
        )

    if responses.get("2-3-6") == "동종업계보다 높은 편" and market_position == "하위":
        issues.append(
            Issue(
                "복리후생 과잉 투자",
                "시장 보상은 낮은데 복리후생 수준이 높다면 핵심 보상 재원의 우선순위가 흐려질 수 있습니다.",
                "low",
            )
        )

    if issues:
        reason = _get_trigger_reason(issues[0], responses)
        recommendation = (
            f"귀사의 보상 구조에서 가장 시급한 과제는 '{issues[0].title}'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
        )
        if market_position in ("하위", "중위"):
            recommendation += "1단계로 밴드형 급여와 제한적 성과급을 설계해 오퍼 경쟁력부터 회복하십시오."
        else:
            recommendation += "성과급 운영 원칙을 명확히 해 보상-성과 연동을 점진적으로 강화하십시오."
    else:
        recommendation = "보상 구조는 현재 개선 필요량이 작습니다. 시장 데이터 업데이트와 밴드 미세 조정을 우선하십시오."

    return AreaAnalysis(
        area_id="compensation",
        area_name="보상 경쟁력",
        score=score,
        benchmark=benchmark,
        gap=gap,
        priority=0,
        difficulty=_difficulty(gap),
        status_text=status,
        issues=issues[:3],
        recommendation=recommendation,
        tags=tags,
        score_breakdown=score_breakdown,
    )


def _calc_compensation_score(responses: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    score = 50
    breakdown = [_score_item("기본 점수", "-", 50, "모든 영역 공통 시작점")]
    market = responses.get("2-3-5", "")
    if market == "상위":
        score += 20
        breakdown.append(_score_item("시장 보상 수준", market, 20, "상위권 보상 경쟁력"))
    elif market == "중위":
        score += 5
        breakdown.append(_score_item("시장 보상 수준", market, 5, "중위권 보상 경쟁력"))
    elif market == "하위":
        score -= 15
        breakdown.append(_score_item("시장 보상 수준", market, -15, "시장 하위권"))

    eval_link = _as_int(responses.get("2-4-2"), 3)
    link_impact = (eval_link - 3) * 5
    score += link_impact
    link_text = {
        1: "완전 분리",
        2: "약한 연동",
        3: "중간 연동",
        4: "강한 연동",
        5: "완전 연동",
    }.get(eval_link, f"{eval_link}점")
    breakdown.append(_score_item("평가-보상 연동", link_text, link_impact, "5점 척도 기반"))

    cost = responses.get("2-3-3", "")
    if cost in ("20% 미만", "20~35%"):
        score += 5
        breakdown.append(_score_item("인건비 비중", cost, 5, "관리 가능한 범위"))
    elif _is_high_cost_ratio(cost):
        score -= 5
        breakdown.append(_score_item("인건비 비중", cost, -5, "높은 고정비 부담"))

    if "단기 성과형" in str(responses.get("2-3-2", "")):
        score += 5
        breakdown.append(_score_item("보상 구조", responses.get("2-3-2", ""), 5, "성과급 구조 존재"))

    return _finalize_score(score, breakdown)


def _analyze_evaluation(responses: dict[str, Any]) -> AreaAnalysis:
    score, score_breakdown = _calc_evaluation_score(responses)
    benchmark = benchmark_for("evaluation", responses)
    gap = benchmark - score

    eval_cycle = _text(responses.get("2-4-1a"))
    eval_method = _text(responses.get("2-4-1b"))
    eval_link = _as_int(responses.get("2-4-2"), 3)
    ceo_fair = _as_int(responses.get("2-4-3-ceo"), 5)
    emp_fair = _as_int(responses.get("2-4-3-employee"), 5)
    fairness_gap = ceo_fair - emp_fair

    fairness_not_operated = ceo_fair == 0 or emp_fair == 0

    if _is_evaluation_active(eval_cycle) and not fairness_not_operated:
        status = (
            f"귀사는 현재 '{eval_cycle}' 주기로 '{eval_method}' 방식의 평가를 운영하고 있습니다. "
            f"평가와 보상의 연동 수준은 {eval_link}점/5점이며, CEO가 인식하는 "
            f"평가 공정성은 {ceo_fair}점/10점, 직원이 느낄 것으로 예상되는 공정성은 "
            f"{emp_fair}점/10점입니다."
        )
        if fairness_gap >= 3:
            status += " 대표와 직원 간 공정성 인식 차이가 3점 이상으로 평가 신뢰 회복을 위한 즉시 대응이 필요합니다."
        elif fairness_gap >= 2:
            status += " 대표와 직원 간 공정성 인식 차이가 2점 이상으로 위험 신호가 감지됩니다."
        elif fairness_gap >= 1:
            status += " 대표와 직원 간 공정성 인식에 차이가 있어 수용성 관리가 필요합니다."
    elif _is_evaluation_active(eval_cycle) and fairness_not_operated:
        status = (
            f"귀사는 현재 '{eval_cycle}' 주기로 평가를 운영한다고 응답했지만, 평가 공정성을 "
            "판단할 운영 기준은 아직 없다고 답했습니다. 이 경우 평가 제도를 더 늘리기보다 "
            "먼저 평가 기준과 결과 설명 방식을 정리해야 합니다."
        )
    else:
        status = (
            "귀사는 현재 정기적인 공식 평가 체계가 부재합니다. 이 상태에서 보상 차등이나 "
            "성과 관리를 시도하면 기준 없는 주관적 판단으로 인해 조직 내 불신이 커질 수 있습니다."
        )

    tags: list[str] = []
    if not _is_evaluation_active(eval_cycle):
        tags.append("평가 체계 부재")
    if fairness_not_operated:
        tags.append("평가 공정성 판단 기준 부재")
    if fairness_gap >= 3:
        tags.append("공정성 차이 심각")
    elif fairness_gap >= 2:
        tags.append("공정성 차이 위험")
    elif fairness_gap == 1:
        tags.append("공정성 차이 주의")

    issues: list[Issue] = []
    if fairness_gap >= 3:
        issues.append(
            Issue(
                "대표-직원 공정성 인식 차이 심각",
                f"대표 인식({ceo_fair}점)과 직원 예상({emp_fair}점)의 차이가 {fairness_gap}점입니다.",
                "high",
            )
        )
    elif fairness_gap >= 2:
        issues.append(
            Issue(
                "대표-직원 공정성 인식 차이 위험",
                f"대표 인식({ceo_fair}점)과 직원 예상({emp_fair}점)의 차이가 {fairness_gap}점입니다.",
                "high",
            )
        )
    elif fairness_gap == 1:
        issues.append(
            Issue(
                "대표-직원 공정성 인식 차이 주의",
                f"대표 인식({ceo_fair}점)과 직원 예상({emp_fair}점)의 차이가 1점입니다.",
                "medium",
            )
        )

    if eval_link <= 2 and _is_evaluation_active(eval_cycle):
        issues.append(
            Issue(
                "평가-보상 디커플링",
                "평가를 운영하면서도 보상과 연동하지 않으면 평가의 조직 내 권위가 약해집니다.",
                "medium",
            )
        )

    if not _is_evaluation_active(eval_cycle):
        issues.append(
            Issue(
                "평가 체계 부재",
                "공식 평가 없이 보상 차등이나 승진을 결정하면 주관성 논란이 불가피합니다.",
                "high",
            )
        )

    if _as_int(responses.get("2-4-4"), 3) <= 2:
        issues.append(
            Issue(
                "리더 비전 공감 부족",
                "리더급이 회사 비전에 공감하지 못하면 목표 정렬과 평가 수용성이 함께 흔들립니다.",
                "medium",
            )
        )

    if responses.get("2-4-5") in (None, "모름 / 측정 안 함"):
        issues.append(
            Issue(
                "평가 데이터 사각지대",
                "평가 결과 분포나 보상 차등 폭을 수치로 보지 못하면 제도 개선 효과를 검증하기 어렵습니다.",
                "medium",
            )
        )

    if not _is_evaluation_active(eval_cycle):
        top_issue = issues[0] if issues else Issue("평가 체계 부재", "", "high")
        reason = _get_trigger_reason(top_issue, responses)
        recommendation = (
            "가장 시급한 과제는 '평가 체계 구축'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
            "MBO 기본 도입부터 시작해 목표 정렬을 만드십시오."
        )
    elif issues:
        reason = _get_trigger_reason(issues[0], responses)
        recommendation = (
            f"가장 시급한 과제는 '{issues[0].title}'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
        )
        if _is_small_org(responses.get("L1-2")):
            recommendation += "관대한 절대평가와 격주 1on1로 시작하고, 보상 연동은 1–2사이클 안착 후 진행하십시오."
        else:
            recommendation += "OKR과 반기 공식 리뷰를 병행하되, 평가-보상 연동은 최소 3개월 이후 단계적으로 붙이십시오."
    else:
        recommendation = "평가 체계는 현재 양호한 수준입니다. 운영 데이터 축적과 캘리브레이션 품질을 높이십시오."

    return AreaAnalysis(
        area_id="evaluation",
        area_name="평가 제도",
        score=score,
        benchmark=benchmark,
        gap=gap,
        priority=0,
        difficulty=_difficulty(gap, high=15, medium=5),
        status_text=status,
        issues=issues[:3],
        recommendation=recommendation,
        tags=tags,
        score_breakdown=score_breakdown,
    )


def _calc_evaluation_score(responses: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    score = 50
    breakdown = [_score_item("기본 점수", "-", 50, "모든 영역 공통 시작점")]
    if _is_evaluation_active(responses.get("2-4-1a")):
        score += 15
        breakdown.append(_score_item("평가 운영 여부", responses.get("2-4-1a", ""), 15, "정기 평가 운영"))
    else:
        score -= 20
        breakdown.append(_score_item("평가 운영 여부", responses.get("2-4-1a", ""), -20, "공식 평가 체계 부재"))

    eval_link = _as_int(responses.get("2-4-2"), 3)
    link_impact = (eval_link - 3) * 5
    score += link_impact
    breakdown.append(_score_item("평가-보상 연동", f"{eval_link}점/5점", link_impact, "5점 척도 기반"))

    ceo_fair = _as_int(responses.get("2-4-3-ceo"), 5)
    emp_fair = _as_int(responses.get("2-4-3-employee"), 5)
    avg_fair = (ceo_fair + emp_fair) / 2
    fairness_not_operated = ceo_fair == 0 or emp_fair == 0
    fairness_impact = -18 if fairness_not_operated else int((avg_fair - 5) * 3)
    gap_impact = 0 if fairness_not_operated else -(max(0, ceo_fair - emp_fair) * 4)
    score += fairness_impact
    score += gap_impact
    fairness_value = "운영하지 않음" if fairness_not_operated else f"{avg_fair:.1f}점/10점"
    gap_value = "판단 기준 없음" if fairness_not_operated else f"{ceo_fair - emp_fair}점"
    fairness_note = "평가 공정성을 판단할 공식 운영 기준 없음" if fairness_not_operated else "CEO/직원 예상 평균"
    gap_note = "공정성 판단 기준 부재 시 인식 차이 계산 보류" if fairness_not_operated else "CEO 인식이 직원 예상보다 높을 때 감점"
    breakdown.append(_score_item("평가 공정성 평균", fairness_value, fairness_impact, fairness_note))
    breakdown.append(_score_item("공정성 인식 차이", gap_value, gap_impact, gap_note))

    return _finalize_score(score, breakdown)


def _analyze_recruitment(responses: dict[str, Any]) -> AreaAnalysis:
    score, score_breakdown = _calc_recruitment_score(responses)
    benchmark = benchmark_for("recruitment", responses)
    gap = benchmark - score

    duration = _text(responses.get("2-2-1"))
    channels = _text(responses.get("2-2-2"))
    rejection = _text(responses.get("2-2-3"))
    branding = _text(responses.get("2-2-4"))
    onboarding = _text(responses.get("2-2-5"))

    status = (
        f"귀사의 핵심 포지션 평균 채용 소요 기간은 '{duration}'이며, "
        f"활용 중인 주요 채용 채널은 '{channels}'입니다. "
    )
    if _has_offer_rejection(rejection):
        status += "최종 면접 후 입사 거절 경험이 있어 오퍼 경쟁력 또는 후보자 경험에 개선 여지가 있습니다."
    else:
        status += "오퍼 수락 흐름은 비교적 안정적인 편입니다."
    if branding and branding != "미입력":
        status += f" 채용 브랜딩 자산은 '{branding}' 상태입니다."
    if onboarding and onboarding != "미입력":
        status += f" 온보딩 적응 추적은 '{onboarding}'입니다."

    tags: list[str] = []
    if _is_long_hiring_duration(duration):
        tags.append("채용 소요 과다")
    if _is_low_channel_count(channels):
        tags.append("채널 집중 리스크")
    if _has_offer_rejection(rejection):
        tags.append("오퍼 거절 경험")
    if branding == "거의 없음":
        tags.append("채용 브랜딩 취약")
    if onboarding == "추적하지 않음":
        tags.append("온보딩 추적 부재")

    issues: list[Issue] = []
    if _is_long_hiring_duration(duration):
        issues.append(
            Issue(
                "채용 소요 기간 과다",
                "핵심 포지션 채용이 4개월 이상 소요되면 사업 속도에 직접적 타격을 줍니다.",
                "high",
            )
        )

    if _is_low_channel_count(channels):
        issues.append(
            Issue(
                "채널 집중 리스크",
                "소수 채널에 의존하면 후보 풀이 편향되고 채널 하나가 막힐 때 대안이 부족합니다.",
                "medium",
            )
        )

    market = responses.get("2-3-5", "")
    if _has_offer_rejection(rejection) and market in ("하위", "중위"):
        issues.append(
            Issue(
                "오퍼 경쟁력 부족",
                "시장 대비 보상이 낮은 상태에서 오퍼 거절이 발생하고 있습니다.",
                "high",
            )
        )

    if market == "하위" and _is_aggressive_hiring(responses.get("L1-4", "")):
        issues.append(
            Issue(
                "채용-보상 미스매치",
                "공격적 채용 기조이나 보상 경쟁력이 낮아 채용 효율이 구조적으로 제한됩니다.",
                "high",
            )
        )

    if _is_low_channel_count(channels) and _is_long_hiring_duration(duration):
        issues.append(
            Issue(
                "채용 브랜딩 부재",
                "채용 채널이 좁고 소요 기간이 길어 중장기 후보자 파이프라인이 약한 상태입니다.",
                "medium",
            )
        )

    if branding == "거의 없음":
        issues.append(
            Issue(
                "채용 브랜딩 부재",
                "후보자가 회사를 선택해야 할 이유가 채용 과정에서 충분히 전달되지 않습니다.",
                "medium",
            )
        )

    if onboarding == "추적하지 않음":
        issues.append(
            Issue(
                "온보딩 추적 부재",
                "입사 후 3개월 적응 상태를 보지 않으면 채용 실패 원인이 반복될 수 있습니다.",
                "medium",
            )
        )

    if issues:
        reason = _get_trigger_reason(issues[0], responses)
        recommendation = (
            f"가장 시급한 과제는 '{issues[0].title}'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
        )
        if issues[0].title in ("오퍼 경쟁력 부족", "채용-보상 미스매치"):
            recommendation += "보상 구조 개선이 선행되어야 채용 효율이 자연 상승합니다."
        elif issues[0].title == "채용 소요 기간 과다":
            recommendation += "단기적으로 핵심 포지션 헤드헌터 병행을, 중기적으로 채용 브랜딩 투자를 권고합니다."
        else:
            recommendation += "리퍼럴을 유지하되 채용 플랫폼을 1–2개 추가해 후보 풀을 넓히십시오."
    else:
        recommendation = "채용 파이프라인은 현재 개선 필요량이 작습니다. 오퍼 경험과 채널별 전환율 기록을 시작하십시오."

    return AreaAnalysis(
        area_id="recruitment",
        area_name="채용 효율",
        score=score,
        benchmark=benchmark,
        gap=gap,
        priority=0,
        difficulty=_difficulty(gap, high=20, medium=10),
        status_text=status,
        issues=issues[:3],
        recommendation=recommendation,
        tags=tags,
        score_breakdown=score_breakdown,
    )


def _calc_recruitment_score(responses: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    score = 60
    breakdown = [_score_item("기본 점수", "-", 60, "채용 영역 시작점")]
    duration = responses.get("2-2-1", "")
    if duration == "2개월 이내":
        score += 15
        breakdown.append(_score_item("채용 소요 기간", duration, 15, "빠른 채용 속도"))
    elif duration == "2~4개월":
        score += 5
        breakdown.append(_score_item("채용 소요 기간", duration, 5, "관리 가능한 범위"))
    elif duration in ("4~6개월", "6개월 초과"):
        score -= 15
        breakdown.append(_score_item("채용 소요 기간", duration, -15, "핵심 포지션 채용 지연"))
    elif duration == "모름 / 채용 자체 없음":
        score -= 5
        breakdown.append(_score_item("채용 소요 기간", duration, -5, "측정/운영 정보 부족"))

    channels = responses.get("2-2-2", "")
    if channels == "4개 이상":
        score += 10
        breakdown.append(_score_item("채용 채널 수", channels, 10, "다채널 후보자 풀"))
    elif channels == "2~3개":
        score += 5
        breakdown.append(_score_item("채용 채널 수", channels, 5, "기본 채널 확보"))
    elif channels == "1개":
        score -= 10
        breakdown.append(_score_item("채용 채널 수", channels, -10, "채널 집중 리스크"))

    rejection = responses.get("2-2-3", "")
    if rejection == "거의 없음":
        score += 5
        breakdown.append(_score_item("오퍼 거절 빈도", rejection, 5, "오퍼 수락 안정"))
    elif rejection == "가끔":
        score -= 5
        breakdown.append(_score_item("오퍼 거절 빈도", rejection, -5, "오퍼 경쟁력 점검 필요"))
    elif rejection == "자주":
        score -= 15
        breakdown.append(_score_item("오퍼 거절 빈도", rejection, -15, "오퍼 경쟁력 취약"))

    branding = responses.get("2-2-4", "")
    if branding == "채용 페이지/컬처덱/인터뷰 자료가 있음":
        score += 8
        breakdown.append(_score_item("채용 브랜딩 자산", branding, 8, "후보자 설득 자료 확보"))
    elif branding == "공고문 외 일부 자료만 있음":
        score += 3
        breakdown.append(_score_item("채용 브랜딩 자산", branding, 3, "기본 자료는 있으나 일관성 보완 필요"))
    elif branding == "거의 없음":
        score -= 8
        breakdown.append(_score_item("채용 브랜딩 자산", branding, -8, "후보자 설득 메시지 부족"))

    onboarding = responses.get("2-2-5", "")
    if onboarding == "정기적으로 추적함":
        score += 8
        breakdown.append(_score_item("온보딩 적응 추적", onboarding, 8, "입사 후 적응 상태 관리"))
    elif onboarding == "문제 발생 시에만 확인함":
        score += 2
        breakdown.append(_score_item("온보딩 적응 추적", onboarding, 2, "사후 대응 중심"))
    elif onboarding == "추적하지 않음":
        score -= 8
        breakdown.append(_score_item("온보딩 적응 추적", onboarding, -8, "초기 적응 실패 반복 가능"))

    return _finalize_score(score, breakdown)


def _analyze_retention(responses: dict[str, Any]) -> AreaAnalysis:
    score, score_breakdown = _calc_retention_score(responses)
    benchmark = benchmark_for("retention", responses)
    gap = benchmark - score

    turnover = _text(responses.get("2-1-1"))
    core_loss = _text(responses.get("2-1-2"))
    early_quit = _text(responses.get("2-1-3"))
    talent_criteria = _text(responses.get("2-1-4"))
    succession = _text(responses.get("2-1-5"))

    status = (
        f"귀사의 직전 12개월 자발적 이직률은 '{turnover}'이며, "
        f"핵심 인재 이탈은 '{core_loss}'입니다. "
    )
    if early_quit == "모름 / 측정 안 함":
        status += "신규 입사자 조기 퇴사율을 측정하지 않아 온보딩 효과를 파악하기 어렵습니다."
    else:
        status += f"신규 입사자 1년 내 조기 퇴사율은 '{early_quit}'입니다."
    if talent_criteria and talent_criteria != "미입력":
        status += f" 핵심 인재 식별은 '{talent_criteria}' 상태입니다."
    if succession and succession != "미입력":
        status += f" 핵심 포스트 대체 계획은 '{succession}'입니다."

    tags: list[str] = []
    if _core_loss_count(core_loss) >= 2:
        tags.append("핵심 인재 유출")
    if _is_high_turnover(turnover):
        tags.append("자발적 이직률 위험")
    if early_quit == "30% 초과":
        tags.append("온보딩 실패")
    if talent_criteria == "별도 기준 없음":
        tags.append("핵심 인재 기준 부재")
    if succession == "거의 없음":
        tags.append("대체 계획 부족")

    issues: list[Issue] = []
    if _core_loss_count(core_loss) >= 2 or calculate_core_talent_loss_severity(responses) >= 0.8:
        issues.append(
            Issue(
                "핵심 인재 유출 위기",
                "핵심 인재 이탈은 단순 인원 감소가 아니라 프로젝트 지연과 조직 역량 훼손으로 이어집니다.",
                "high",
            )
        )

    if _is_high_turnover(turnover):
        issues.append(
            Issue(
                "높은 자발적 이직률",
                "자발적 이직률이 높은 구간에 있어 조직 안정성과 지식 축적이 흔들릴 수 있습니다.",
                "high",
            )
        )

    if early_quit == "30% 초과":
        issues.append(
            Issue(
                "온보딩 실패",
                "신규 입사자 조기 퇴사가 높으면 채용 성공이 실제 전력화로 이어지지 못합니다.",
                "high",
            )
        )

    if turnover == "모름 / 측정 안 함" or early_quit == "모름 / 측정 안 함":
        issues.append(
            Issue(
                "이직률 사각지대",
                "이직률과 조기퇴사율을 측정하지 않으면 리텐션 시책의 효과를 검증할 수 없습니다.",
                "medium",
            )
        )

    if _is_high_turnover(turnover) and responses.get("2-3-5") == "하위":
        issues.append(
            Issue(
                "보상-리텐션 디커플링",
                "이직률이 높은데 보상 경쟁력도 낮아 핵심 인재 유지가 구조적으로 어렵습니다.",
                "high",
            )
        )

    if talent_criteria == "별도 기준 없음":
        issues.append(
            Issue(
                "핵심 인재 기준 부재",
                "누가 핵심 인재인지 기준이 없으면 리텐션 투자와 예외 보상 판단이 흔들립니다.",
                "medium",
            )
        )

    if succession == "거의 없음":
        issues.append(
            Issue(
                "핵심 포스트 대체 계획 부족",
                "핵심 역할 공백이 생겼을 때 후임이나 백업이 없어 사업 지연 위험이 커집니다.",
                "medium",
            )
        )

    if issues:
        reason = _get_trigger_reason(issues[0], responses)
        recommendation = (
            f"귀사의 인력 안정성에서 가장 시급한 과제는 '{issues[0].title}'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
        )
        if issues[0].title == "핵심 인재 유출 위기":
            recommendation += "즉시 리텐션 패키지와 Stay Interview를 도입하되, 보상 경쟁력과 평가 공정성도 함께 점검하십시오."
        elif issues[0].title == "이직률 사각지대":
            recommendation += "이직률·조기퇴사율 측정 체계를 먼저 구축해야 이후 시책의 효과를 검증할 수 있습니다."
        elif issues[0].title == "온보딩 실패":
            recommendation += "30/60/90일 온보딩 체크포인트와 조기 위험 신호 기록부터 시작하십시오."
        else:
            recommendation += "퇴직 인터뷰와 재직자 면담을 병행해 이탈 원인을 구조화하십시오."
    else:
        recommendation = "인력 안정성은 현재 양호한 편입니다. 핵심 인재 리스크와 온보딩 데이터를 계속 추적하십시오."

    return AreaAnalysis(
        area_id="retention",
        area_name="인력 안정성",
        score=score,
        benchmark=benchmark,
        gap=gap,
        priority=0,
        difficulty=_difficulty(gap, high=18, medium=8),
        status_text=status,
        issues=issues[:3],
        recommendation=recommendation,
        tags=tags,
        score_breakdown=score_breakdown,
    )


def _calc_retention_score(responses: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    score = 60
    breakdown = [_score_item("기본 점수", "-", 60, "인력 안정성 영역 시작점")]
    turnover = responses.get("2-1-1", "")
    if turnover == "10% 미만":
        score += 15
        breakdown.append(_score_item("자발적 이직률", turnover, 15, "안정적 이직률"))
    elif turnover == "10~20%":
        score += 3
        breakdown.append(_score_item("자발적 이직률", turnover, 3, "주의 관찰 구간"))
    elif turnover == "20% 초과":
        score -= 18
        breakdown.append(_score_item("자발적 이직률", turnover, -18, "높은 이탈 위험"))
    elif turnover == "모름 / 측정 안 함":
        score -= 8
        breakdown.append(_score_item("자발적 이직률", turnover, -8, "가시성 부족"))

    core_loss_severity = calculate_core_talent_loss_severity(responses)
    core_loss_impact = -(int(core_loss_severity * 18))
    score += core_loss_impact
    breakdown.append(
        _score_item(
            "핵심 인재 이탈 심각도",
            f"{core_loss_severity:.2f}",
            core_loss_impact,
            "인원 규모와 이탈 인원 교차 계산",
        )
    )

    early_quit = responses.get("2-1-3", "")
    if early_quit == "10% 미만":
        score += 10
        breakdown.append(_score_item("신규 입사자 조기 퇴사율", early_quit, 10, "온보딩 안정"))
    elif early_quit == "10~30%":
        score += 0
        breakdown.append(_score_item("신규 입사자 조기 퇴사율", early_quit, 0, "중립 구간"))
    elif early_quit == "30% 초과":
        score -= 15
        breakdown.append(_score_item("신규 입사자 조기 퇴사율", early_quit, -15, "온보딩 실패 위험"))
    elif early_quit == "모름 / 측정 안 함":
        score -= 5
        breakdown.append(_score_item("신규 입사자 조기 퇴사율", early_quit, -5, "가시성 부족"))

    talent_criteria = responses.get("2-1-4", "")
    if talent_criteria == "명확한 기준과 명단이 있음":
        score += 8
        breakdown.append(_score_item("핵심 인재 식별 기준", talent_criteria, 8, "관리 기준 확보"))
    elif talent_criteria == "리더별로 암묵적으로 알고 있음":
        score += 3
        breakdown.append(_score_item("핵심 인재 식별 기준", talent_criteria, 3, "암묵지 의존"))
    elif talent_criteria == "별도 기준 없음":
        score -= 8
        breakdown.append(_score_item("핵심 인재 식별 기준", talent_criteria, -8, "리텐션 판단 기준 부족"))

    succession = responses.get("2-1-5", "")
    if succession == "후임/백업 후보가 정해져 있음":
        score += 8
        breakdown.append(_score_item("핵심 포스트 대체 계획", succession, 8, "역할 공백 대응 가능"))
    elif succession == "일부 포지션만 있음":
        score += 3
        breakdown.append(_score_item("핵심 포스트 대체 계획", succession, 3, "부분적 대체 계획"))
    elif succession == "거의 없음":
        score -= 8
        breakdown.append(_score_item("핵심 포스트 대체 계획", succession, -8, "핵심 역할 공백 위험"))

    return _finalize_score(score, breakdown)


def _analyze_leadership(responses: dict[str, Any]) -> AreaAnalysis:
    score, score_breakdown = _calc_leadership_score(responses)
    benchmark = benchmark_for("leadership", responses)
    gap = benchmark - score

    feedback = _text(responses.get("2-5-1"))
    one_on_one = _text(responses.get("2-5-2"))
    one_on_one_data = responses.get("2-5-3")
    hiring_approval = _text(responses.get("2-5-4"))
    release_decision = _text(responses.get("2-5-5"))
    core_values = _text(responses.get("2-5-6"))

    status = (
        f"귀사의 리더(팀장급)는 부정적 피드백 전달 역량이 '{feedback}' 수준이며, "
        f"정기 1on1은 '{one_on_one}' 상태입니다. "
    )
    if one_on_one_data:
        status += f"1on1 운영 데이터는 '{one_on_one_data}'입니다. "
    status += (
        f"실무진 채용 최종 승인은 '{hiring_approval}', 신규 기능 배포 의사결정은 "
        f"'{release_decision}' 구조입니다. 핵심가치의 채용·평가 기준 작동 여부는 "
        f"'{core_values}'입니다."
    )

    tags: list[str] = []
    if _has_feedback_gap(feedback):
        tags.append("피드백 역량 부족")
    if one_on_one == "운영 안 함":
        tags.append("1on1 부재")
    if _has_ceo_bottleneck(hiring_approval, release_decision):
        tags.append("의사결정 병목")

    issues: list[Issue] = []
    if _has_feedback_gap(feedback):
        issues.append(
            Issue(
                "리더 피드백 역량 부족",
                "리더가 부정적 피드백을 회피하면 평가 제도는 실행 단계에서 갈등을 증폭시킵니다.",
                "high",
            )
        )

    if one_on_one == "운영 안 함":
        issues.append(
            Issue(
                "1on1 부재/형식화",
                "정기 1on1이 없으면 성과·몰입·이탈 위험을 조기에 감지하기 어렵습니다.",
                "medium",
            )
        )

    if _has_ceo_bottleneck(hiring_approval, release_decision):
        issues.append(
            Issue(
                "의사결정 병목",
                "채용과 배포 의사결정이 CEO에게 집중되어 조직 규모가 커질수록 속도가 떨어집니다.",
                "high",
            )
        )

    if core_values == "문서로만 존재함":
        issues.append(
            Issue(
                "핵심가치 미작동",
                "핵심가치가 채용·평가 기준으로 작동하지 않으면 문화는 선언에 머뭅니다.",
                "medium",
            )
        )

    if responses.get("L1-2") in ("50~100인", "100~500인", "500인 초과") and (
        "CEO가 모든 인원" in hiring_approval
    ):
        issues.append(
            Issue(
                "거버넌스 미성숙",
                "50인 이상 조직에서 CEO가 모든 실무진 채용을 승인하면 위임 체계 설계가 늦어진 상태입니다.",
                "medium",
            )
        )

    if issues:
        reason = _get_trigger_reason(issues[0], responses)
        recommendation = (
            f"귀사의 리더십·거버넌스에서 가장 시급한 과제는 '{issues[0].title}'입니다. "
            f"현재 {reason} 상황을 고려할 때, "
        )
        if issues[0].title == "의사결정 병목":
            recommendation += "전결권 위임 체계를 설계하고 팀장급 역할을 재정의하십시오."
        elif issues[0].title == "리더 피드백 역량 부족":
            recommendation += "평가 제도 도입보다 리더 교육이 선행되어야 합니다."
        elif issues[0].title == "1on1 부재/형식화":
            recommendation += "1on1 제도화부터 시작하십시오. 가장 낮은 비용으로 소통 채널을 확보할 수 있습니다."
        else:
            recommendation += "핵심가치를 관찰 가능한 행동 기준으로 바꿔 채용과 평가에 연결하십시오."
    else:
        recommendation = "리더십·거버넌스는 현재 개선 필요량이 작습니다. 위임 범위와 리더 운영 데이터를 정기 점검하십시오."

    return AreaAnalysis(
        area_id="leadership",
        area_name="리더십·거버넌스",
        score=score,
        benchmark=benchmark,
        gap=gap,
        priority=0,
        difficulty=_difficulty(gap, high=18, medium=8),
        status_text=status,
        issues=issues[:3],
        recommendation=recommendation,
        tags=tags,
        score_breakdown=score_breakdown,
    )


def _calc_leadership_score(responses: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    score = 60
    breakdown = [_score_item("기본 점수", "-", 60, "리더십·거버넌스 영역 시작점")]
    feedback = responses.get("2-5-1", "")
    if feedback == "대부분 객관적으로 잘 수행함":
        score += 15
        breakdown.append(_score_item("리더 피드백 역량", feedback, 15, "피드백 전달 역량 양호"))
    elif feedback == "갈등을 피하거나 온정주의가 있음":
        score -= 8
        breakdown.append(_score_item("리더 피드백 역량", feedback, -8, "온정주의/회피 경향"))
    elif feedback == "대표인 내가 직접 나서야 해결됨":
        score -= 15
        breakdown.append(_score_item("리더 피드백 역량", feedback, -15, "대표 의존도 높음"))

    one_on_one = responses.get("2-5-2", "")
    if one_on_one == "운영함":
        score += 10
        breakdown.append(_score_item("1on1 운영", one_on_one, 10, "정기 소통 채널 확보"))
    elif one_on_one == "일부 운영":
        score += 2
        breakdown.append(_score_item("1on1 운영", one_on_one, 2, "부분 운영"))
    elif one_on_one == "운영 안 함":
        score -= 10
        breakdown.append(_score_item("1on1 운영", one_on_one, -10, "정기 소통 채널 부재"))

    if _has_ceo_bottleneck(responses.get("2-5-4", ""), responses.get("2-5-5", "")):
        score -= 12
        breakdown.append(_score_item("의사결정 구조", "CEO 집중", -12, "채용/배포 승인 병목"))

    core_values = responses.get("2-5-6", "")
    if core_values == "명확한 기준으로 작동함":
        score += 10
        breakdown.append(_score_item("핵심가치 작동성", core_values, 10, "채용·평가 기준으로 작동"))
    elif core_values == "문서로만 존재함":
        score -= 8
        breakdown.append(_score_item("핵심가치 작동성", core_values, -8, "선언에 머무름"))

    return _finalize_score(score, breakdown)


def _text(value: Any) -> str:
    if isinstance(value, list):
        return ", ".join(str(item) for item in value if item not in (None, ""))
    return str(value) if value not in (None, "") else "미입력"


def _score_item(
    factor: str,
    value: Any,
    impact: int,
    note: str = "",
    implication: str | None = None,
) -> dict[str, Any]:
    """점수 산출 근거 항목을 생성한다."""
    display_value = _text(value)
    return {
        "factor": factor,
        "value": display_value,
        "impact": impact,
        "note": note,
        "implication": implication or _score_implication(factor, display_value, impact, note),
    }


def _score_implication(factor: str, value: str, impact: int, note: str) -> str:
    """Return the CEO-facing implication for a score change.

    Text mappings are loaded from content/implications.json. Unknown factors use
    the same fallback templates as the previous hardcoded implementation.
    """
    data = _load_implications()
    factors = data.get("factors", {})
    factor_data = factors.get(factor)

    if factor_data is not None:
        if "default" in factor_data:
            return str(factor_data["default"]).replace("{note}", note)

        if value in factor_data:
            return str(factor_data[value])

        impact_key = _impact_to_key(impact)
        if impact_key in factor_data:
            return str(factor_data[impact_key])

    fallback = factors.get("_fallback", {})
    impact_key = _impact_to_key(impact)
    template = str(fallback.get(impact_key, fallback.get("neutral", "")))
    note_or_factor = note or factor
    return template.replace("{note_or_factor}", note_or_factor)


def _impact_to_key(impact: int) -> str:
    """Map a numeric impact to the implication JSON key."""
    if impact < 0:
        return "negative"
    if impact > 0:
        return "positive"
    return "neutral"

def _finalize_score(score: int, breakdown: list[dict[str, Any]]) -> tuple[int, list[dict[str, Any]]]:
    """최종 점수를 0–100으로 제한하고 산출 근거에 합계를 추가한다."""
    final_score = _clamp_score(score)
    breakdown.append(_score_item("최종 점수", "-", final_score, f"= {final_score}점"))
    return final_score, breakdown


def _get_trigger_reason(issue: Issue, responses: dict[str, Any]) -> str:
    """이슈의 트리거 근거를 CEO가 납득할 수 있는 자연어로 반환한다."""
    reasons = {
        "보상-성과 연동 부재": "평가는 하고 있지만 그 결과가 보상에 반영되지 않는",
        "시장 경쟁력 열위": "같은 포지션 경쟁사 대비 보상이 밀리는",
        "인건비 효율성 저하": "인건비는 올라가는데 성과와 연결되지 않아 투자가 아닌 비용으로만 쌓이는",
        "성과급 구조 부재": "고성과자에게 줄 명확한 upside가 없는",
        "복리후생 과잉 투자": "기본 보상 경쟁력보다 주변 복지에 재원이 먼저 쓰이는",
        "대표-직원 공정성 인식 차이 심각": "경영진은 공정하다고 느끼지만 직원들은 그렇지 않다고 느끼는",
        "대표-직원 공정성 인식 갭 심각": "경영진은 공정하다고 느끼지만 직원들은 그렇지 않다고 느끼는",
        "CEO-직원 공정성 갭 심각": "경영진은 공정하다고 느끼지만 직원들은 그렇지 않다고 느끼는",
        "대표-직원 공정성 인식 차이 위험": "경영진과 직원 사이에 평가 공정성 인식 차이가 벌어지기 시작한",
        "대표-직원 공정성 인식 갭 위험": "경영진과 직원 사이에 평가 공정성 인식 차이가 벌어지기 시작한",
        "대표-직원 공정성 인식 차이 주의": "경영진과 직원 사이에 평가 공정성 인식 차이가 벌어지기 시작한",
        "대표-직원 공정성 인식 갭 주의": "경영진과 직원 사이에 평가 공정성 인식 차이가 벌어지기 시작한",
        "CEO-직원 공정성 갭 주의": "경영진과 직원 사이에 평가 공정성 인식 차이가 벌어지기 시작한",
        "평가-보상 디커플링": "평가는 하지만 그 결과가 실제 보상 결정에 힘을 쓰지 못하는",
        "평가 체계 부재": "공식적인 평가 기준 없이 보상과 승진이 결정되는",
        "리더 비전 공감 부족": "리더들이 회사의 방향을 자기 말로 설명하지 못하는",
        "평가 데이터 사각지대": "평가 결과가 어떻게 분포되는지조차 보이지 않는",
        "채용 소요 기간 과다": "핵심 인재를 뽑는 데 너무 오래 걸려 사업 기회를 놓치는",
        "채널 집중 리스크": "채용 창구가 1~2개뿐이라 후보 풀이 편향된",
        "오퍼 경쟁력 부족": "좋은 후보를 찾아놓고도 오퍼 단계에서 놓치는",
        "채용-보상 미스매치": "적극적으로 뽑으려 하지만 보상이 뒷받침되지 않는",
        "채용 브랜딩 부재": "후보자가 회사를 선택해야 할 이유가 충분히 전달되지 않는",
        "핵심 인재 유출 위기": "대체 불가능한 핵심 인재가 이미 이탈하기 시작한",
        "높은 자발적 이직률": "사람이 계속 나가서 남은 사람의 부담이 커지는 악순환에 빠진",
        "온보딩 실패": "뽑아놓은 사람이 1년도 안 되어 나가는",
        "이직률 사각지대": "사람이 왜 나가는지, 얼마나 나가는지조차 파악이 안 되는",
        "보상-리텐션 디커플링": "사람이 나가는데 보상으로 붙잡을 카드가 없는",
        "리더 피드백 역량 부족": "팀장들이 솔직한 피드백을 주지 못해 문제가 수면 아래 쌓이는",
        "1on1 부재/형식화": "리더와 구성원 사이에 정기적 소통 채널이 없는",
        "1on1 부재": "리더와 구성원 사이에 정기적 소통 채널이 없는",
        "의사결정 병목": "모든 결정이 경영진에게 집중되어 조직 속도가 특정 의사결정자 일정에 종속된",
        "의사결정 병목 (CEO 집중)": "모든 결정이 경영진에게 집중되어 조직 속도가 특정 의사결정자 일정에 종속된",
        "핵심가치 미작동": "핵심가치를 외치지만 실제 채용과 평가에서 기준으로 쓰이지 않는",
        "거버넌스 미성숙": "조직 규모는 커졌는데 권한 위임은 아직 경영진에게 묶여 있는",
    }
    return reasons.get(issue.title, "현재 조직 상황의")


def _as_int(value: Any, default: int) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default


def _clamp_score(score: int) -> int:
    return max(0, min(100, int(score)))


def _difficulty(gap: int, high: int = 20, medium: int = 10) -> str:
    if gap >= high:
        return "높음"
    if gap >= medium:
        return "중간"
    return "낮음"


def _is_evaluation_active(value: Any) -> bool:
    return value not in (None, "", "운영하지 않음", "없음", "비정기")


def _is_small_org(value: Any) -> bool:
    return value in ("20인 이하", "20~50인")


def _is_aggressive_hiring(value: Any) -> bool:
    return str(value).startswith("공격적")


def _is_high_cost_ratio(value: Any) -> bool:
    return value in ("35~50%", "50% 초과", "50% 이상")


def _has_offer_rejection(value: Any) -> bool:
    return value in ("가끔", "자주", "있음")


def _is_long_hiring_duration(value: Any) -> bool:
    return value in ("4~6개월", "6개월 초과", "4개월 초과")


def _is_low_channel_count(value: Any) -> bool:
    return value in ("1개", "1~2개")


def _is_high_turnover(value: Any) -> bool:
    return value in ("10~20%", "20% 초과", "15~20%", "20% 이상")


def _core_loss_count(value: Any) -> int:
    return {
        "없음": 0,
        "1명": 1,
        "2~3명": 2,
        "4명 이상": 4,
    }.get(value, 0)


def _has_feedback_gap(value: Any) -> bool:
    return value in ("갈등을 피하거나 온정주의가 있음", "대표인 내가 직접 나서야 해결됨", "어려워함", "회피함")


def _has_ceo_bottleneck(hiring_approval: Any, release_decision: Any) -> bool:
    return (
        "CEO가 모든 인원" in str(hiring_approval)
        and str(release_decision) == "CEO 최종 승인 필요"
    )
