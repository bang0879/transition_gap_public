"""Alignment map tests."""
from __future__ import annotations

import asyncio

from app.api.diagnose import diagnose
from app.core.alignment_map import analyze_alignment_map
from app.core.analysis_engine import analyze_all_areas
from app.schemas.responses import DiagnoseRequest


def contradictory_responses() -> dict[str, object]:
    return {
        "L0-1": "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
        "L0-2": "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
        "L0-3": "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
        "L1-2": "50~100인",
        "L1-4": "공격적 확장 (30%+ 인원 증가)",
        "L1-5": "B2B SaaS",
        "2-2-1": "4~6개월",
        "2-2-2": "1~2개",
        "2-3-1": 5,
        "2-3-2": "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
        "2-3-5": "하위",
        "2-4-1a": "반기 1회",
        "2-4-2": 1,
        "2-4-3-ceo": 8,
        "2-4-3-employee": 4,
        "2-4-5": "모름 / 측정 안 함",
        "2-5-1": "대표인 내가 직접 나서야 해결됨",
        "2-5-2": "운영 안 함",
        "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
        "2-5-5": "CEO 최종 승인 필요",
        "2-5-6": "문서로만 존재함",
    }


def aligned_responses() -> dict[str, object]:
    return {
        "L0-1": "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.",
        "L0-2": "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
        "L0-3": "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
        "L1-2": "20~50인",
        "L1-4": "결원 보충 및 유지 (10% 미만)",
        "L1-5": "B2B SaaS",
        "2-2-1": "1~2개월",
        "2-2-2": "3~4개",
        "2-3-1": 2,
        "2-3-2": "현금 안정형 (기본급 중심, 성과급 낮음)",
        "2-3-5": "중위",
        "2-4-1a": "분기 1회",
        "2-4-2": 2,
        "2-4-3-ceo": 7,
        "2-4-3-employee": 6,
        "2-4-5": "관리함",
        "2-5-1": "대부분 객관적으로 잘 수행함",
        "2-5-2": "운영함",
        "2-5-3": "관리함",
        "2-5-4": "팀장 1차, CEO 일부 최종",
        "2-5-5": "리더 권한 내 결정",
        "2-5-6": "명확한 기준으로 작동함",
    }


def test_alignment_map_returns_five_domain_vectors():
    responses = contradictory_responses()
    areas = analyze_all_areas(responses)

    result = analyze_alignment_map(responses, areas)

    assert len(result.vectors) == 5
    assert {vector.domain_id for vector in result.vectors} == {
        "compensation",
        "evaluation",
        "recruitment",
        "retention",
        "leadership",
    }
    for vector in result.vectors:
        assert -1 <= vector.x <= 1
        assert -1 <= vector.y <= 1
        assert 0 <= vector.magnitude <= 1
        assert vector.domain_name
        assert vector.direction_label
        assert vector.evidence


def test_alignment_map_returns_five_domain_axes():
    responses = contradictory_responses()
    areas = analyze_all_areas(responses)

    result = analyze_alignment_map(responses, areas)

    assert len(result.axes) == 5
    assert {axis.domain_id for axis in result.axes} == {
        "compensation",
        "evaluation",
        "recruitment",
        "retention",
        "leadership",
    }
    for axis in result.axes:
        assert -1 <= axis.philosophy_position <= 1
        assert -1 <= axis.actual_position <= 1
        assert 0 <= axis.tension <= 2
        assert axis.tension_level in {"aligned", "watch", "misaligned"}
        assert axis.left_label
        assert axis.right_label
        assert axis.headline
        assert axis.evidence


def test_alignment_axes_include_card_contract_fields():
    responses = contradictory_responses()
    result = analyze_alignment_map(responses, analyze_all_areas(responses))

    for axis in result.axes:
        assert axis.philosophy_label
        assert axis.actual_label
        assert axis.policy_direction in {"성과주의", "공동체"}
        assert axis.status_label in {"일치", "주의", "심각"}
        assert 0 <= axis.alignment_percent <= 100

    evaluation = next(axis for axis in result.axes if axis.domain_id == "evaluation")

    assert "평가" in evaluation.actual_label
    assert evaluation.philosophy_note
    assert evaluation.alignment_percent == round((1 - evaluation.tension / 2) * 100)


def test_alignment_map_marks_large_tensions_with_business_risk_only():
    result = analyze_alignment_map(
        contradictory_responses(),
        analyze_all_areas(contradictory_responses()),
    )

    misaligned_axes = [axis for axis in result.axes if axis.tension >= 0.75]
    calmer_axes = [axis for axis in result.axes if axis.tension < 0.75]

    assert misaligned_axes
    assert all(axis.business_risk for axis in misaligned_axes)
    assert all(axis.business_risk is None for axis in calmer_axes)


def test_alignment_map_uses_l0_4_for_retention_philosophy_axis():
    release_responses = {
        **contradictory_responses(),
        "L0-4": "조직 전체의 형평성과 보상 원칙이 무너지는 것이 더 위험하므로, 타격이 있더라도 예외 없이 원칙대로 내보낸다.",
    }
    protect_responses = {
        **contradictory_responses(),
        "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
    }

    release_result = analyze_alignment_map(release_responses, analyze_all_areas(release_responses))
    protect_result = analyze_alignment_map(protect_responses, analyze_all_areas(protect_responses))

    release_retention = next(axis for axis in release_result.axes if axis.domain_id == "retention")
    protect_retention = next(axis for axis in protect_result.axes if axis.domain_id == "retention")

    assert release_retention.philosophy_position < 0
    assert protect_retention.philosophy_position > 0


def test_alignment_map_philosophy_notes_use_readable_keywords():
    responses = {
        **contradictory_responses(),
        "L0-1": "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
        "L0-2": "성과 추적과 솔직한 피드백을 통해 저성과 이슈를 빠르게 직면한다",
        "L0-3": "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다",
        "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
    }

    result = analyze_alignment_map(responses, analyze_all_areas(responses))
    notes = {axis.domain_id: axis.philosophy_note for axis in result.axes}

    assert notes["compensation"] == "회사는 핵심 고성과자에게 더 큰 보상을 주는 차등 배분을 중시합니다."
    assert notes["recruitment"] == "회사는 검증된 외부 인재를 빠르게 영입해 성장 속도를 높이는 방향을 중시합니다."
    assert notes["retention"] == "회사는 중요한 역할 공백을 막기 위해 핵심 인재 예외 조치도 감수합니다."
    assert notes["leadership"] == "회사는 성과 부진을 빠르게 직면하고 기준에 따라 피드백하는 리더십을 중시합니다."


def test_alignment_map_detects_higher_dispersion_for_contradictory_case():
    contradictory = analyze_alignment_map(
        contradictory_responses(),
        analyze_all_areas(contradictory_responses()),
    )
    aligned = analyze_alignment_map(
        aligned_responses(),
        analyze_all_areas(aligned_responses()),
    )

    assert contradictory.dispersion > aligned.dispersion
    assert contradictory.alignment_score < aligned.alignment_score
    assert contradictory.alignment_level in {"엇박자 큼", "정렬 필요"}
    assert aligned.alignment_level in {"대체로 정합", "정렬 필요"}


def test_alignment_map_surfaces_reward_evaluation_conflict():
    responses = contradictory_responses()
    result = analyze_alignment_map(responses, analyze_all_areas(responses))

    conflict_ids = {conflict.id for conflict in result.conflicts}

    assert "reward_points_to_performance_eval_points_to_low_basis" in conflict_ids
    assert result.conflicts[0].title
    assert result.conflicts[0].domains


def test_diagnose_response_includes_alignment_map():
    request = DiagnoseRequest(responses=contradictory_responses())

    result = asyncio.run(diagnose(request))

    assert result.alignment_map.alignment_score <= 100
    assert len(result.alignment_map.vectors) == 5
    assert len(result.alignment_map.axes) == 5
    assert result.alignment_map.axes[0].philosophy_label
    assert result.alignment_map.axes[0].actual_label
    assert result.alignment_map.axes[0].alignment_percent >= 0
