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
