"""Diagnosis mode classifier tests."""
from __future__ import annotations

from types import SimpleNamespace

from app.core.diagnosis_mode import analyze_diagnosis_mode


def conflict(conflict_id: str, severity: str = "high") -> SimpleNamespace:
    return SimpleNamespace(
        id=conflict_id,
        title=f"{conflict_id} title",
        detail=f"{conflict_id} detail",
        severity=severity,
        domains=("compensation", "evaluation"),
    )


def test_foundation_mode_for_absent_compensation_and_evaluation():
    result = analyze_diagnosis_mode(
        {
            "2-3-2": "입사·협상 때마다 개별 결정",
            "2-4-1a": "운영하지 않음",
            "2-5-2": "운영 안 함",
            "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
            "2-5-5": "CEO 최종 승인 필요",
        }
    )

    assert result.diagnosis_mode == "foundation"
    signal_ids = {signal.id for signal in result.foundation_signals}
    assert "compensation_ad_hoc" in signal_ids
    assert "evaluation_not_operated" in signal_ids
    assert "leadership_one_on_one_absent" in signal_ids


def test_hybrid_mode_for_missing_basis_and_alignment_conflicts():
    result = analyze_diagnosis_mode(
        {
            "2-3-2": "인센티브 위주의 성과연동형",
            "2-4-1a": "반기 1회",
            "2-4-2": "차등이 있긴 하지만, 공식적인 룰보다는 주관적 판단이 강하게 개입된다.",
            "2-4-5": "모름 / 측정 안 함",
            "2-5-1": "대표인 내가 직접 나서야 해결됨",
            "2-5-2": "운영 안 함",
            "2-5-6": "면접관이나 리더의 성향에 따라 들쭉날쭉하게 적용된다.",
        },
        [
            conflict("performance_reward_without_eval"),
            conflict("collaboration_reward_with_ceo_bottleneck", severity="medium"),
        ],
    )

    assert result.diagnosis_mode == "hybrid"
    assert len(result.foundation_signals) >= 3
    assert len(result.alignment_signals) == 2


def test_alignment_mode_when_systems_exist_and_conflicts_dominate():
    result = analyze_diagnosis_mode(
        {
            "2-3-2": "인센티브 위주의 성과연동형",
            "2-4-1a": "반기 1회",
            "2-4-2": "정해진 공식에 따라 철저히 자동 결정되며, 최고-최하 등급 간 차등이 파격적이다.",
            "2-4-5": "알고 있음",
            "2-5-1": "대부분 객관적으로 잘 수행함",
            "2-5-2": "운영함",
            "2-5-6": "실력이 아무리 뛰어나도 핵심가치에 어긋나면 무조건 탈락시킨다.",
        },
        [
            conflict("reward_points_to_performance_eval_points_to_low_basis"),
            conflict("culture_fit_without_core_value", severity="medium"),
        ],
    )

    assert result.diagnosis_mode == "alignment"
    assert result.foundation_signals == []
    assert len(result.alignment_signals) == 2
