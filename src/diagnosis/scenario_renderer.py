"""시나리오 상세 카드 렌더링."""
from __future__ import annotations

from typing import Any

import streamlit as st

from src.data.scenarios import SCENARIOS, SCENARIO_IDS


def render_scenario_detail(responses: dict[str, Any]) -> None:
    """시나리오 3개를 탭으로 렌더링한다."""
    st.markdown("---")
    st.markdown("### 시나리오별 상세 분석")
    st.caption("각 시나리오의 도입 패키지, 예상 임팩트, 재무 효과, 실현 가능성을 비교합니다.")

    recommended = _get_recommended_scenario(responses)
    tab_labels = []
    for scenario_id in SCENARIO_IDS:
        scenario = SCENARIOS[scenario_id]
        suffix = " · 추천" if scenario_id == recommended else ""
        tab_labels.append(f"{scenario['icon']} {scenario['name']}{suffix}")

    tabs = st.tabs(tab_labels)
    for tab, scenario_id in zip(tabs, SCENARIO_IDS):
        with tab:
            _render_single_scenario(SCENARIOS[scenario_id], scenario_id == recommended)


def _render_single_scenario(scenario: dict[str, Any], is_recommended: bool) -> None:
    """단일 시나리오 상세를 렌더링한다."""
    header = f"#### {scenario['icon']} {scenario['name']}"
    if is_recommended:
        header += " · 추천"
    st.markdown(header)
    st.caption(scenario["subtitle"])
    st.markdown(f"*\"{scenario['philosophy']}\"*")
    st.markdown(scenario["description"])

    st.markdown("")
    st.markdown("**도입 제도 패키지**")
    for item in scenario["package"]:
        st.markdown(
            f'<div style="display:flex;justify-content:space-between;align-items:center;'
            f'gap:12px;padding:8px 12px;border-radius:8px;background:#F8F9FB;'
            f'border:1px solid #E5E8EC;margin-bottom:6px;">'
            f'<div>'
            f'<span style="font-size:12px;color:#6C7A89;margin-right:8px;">{item["area"]}</span>'
            f'<span style="font-size:13px;color:#2C3E50;">{item["action"]}</span>'
            f'</div>'
            f'<span style="font-size:12px;color:#4F9A86;white-space:nowrap;">{item["timeline"]}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )

    st.markdown("")
    st.markdown("**예상 임팩트**")
    impact_cols = st.columns(2)
    for index, item in enumerate(scenario["impact"]):
        with impact_cols[index % 2]:
            arrow, color = _impact_style(item["direction"])
            st.markdown(
                f'<div style="padding:10px;border-radius:8px;border:1px solid #E5E8EC;'
                f'background:#FFFFFF;margin-bottom:8px;">'
                f'<p style="font-size:12px;color:#6C7A89;margin:0;">{item["metric"]}</p>'
                f'<p style="font-size:16px;font-weight:600;color:{color};margin:4px 0;">'
                f'{arrow} {item["after"]}</p>'
                f'<p style="font-size:11px;color:#A0AAB5;margin:0;">기준: {item["before"]}</p>'
                f'</div>',
                unsafe_allow_html=True,
            )

    st.markdown("")
    st.markdown("**재무 임팩트**")
    for item in scenario["financial_impact"]:
        amount_color = _amount_color(item["amount"])
        st.markdown(
            f'<div style="display:flex;justify-content:space-between;align-items:center;'
            f'gap:12px;padding:8px 0;border-bottom:1px solid #E5E8EC;">'
            f'<div>'
            f'<span style="font-size:13px;color:#2C3E50;">{item["item"]}</span>'
            f'<span style="font-size:11px;color:#A0AAB5;margin-left:8px;">({item["note"]})</span>'
            f'</div>'
            f'<span style="font-size:14px;font-weight:600;color:{amount_color};white-space:nowrap;">'
            f'{item["amount"]}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )

    st.markdown("")
    st.markdown("**실현 가능성 경고**")
    for warning in scenario["warnings"]:
        st.warning(warning)

    st.markdown("")
    st.markdown("**필수 후속 조치**")
    for step_item in scenario["next_steps"]:
        st.markdown(
            f'<div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #E5E8EC;">'
            f'<span style="font-size:12px;font-weight:600;color:#4F9A86;'
            f'min-width:120px;white-space:nowrap;">{step_item["step"]}</span>'
            f'<span style="font-size:13px;color:#2C3E50;">{step_item["action"]}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )


def _get_recommended_scenario(responses: dict[str, Any]) -> str:
    """
    매트릭스 결과 기반 추천 시나리오 ID를 반환한다.

    TODO: MVP 이후에는 As-Is 응답이 아니라 CEO가 매트릭스에서 선택한 To-Be 사분면에 따라
    시나리오를 연동해야 한다. 현재는 Transition 맥락이 약한 단순 As-Is 기반 힌트다.
    """
    comp_philosophy = _as_int(responses.get("2-3-1"), 3)
    eval_link = _as_int(responses.get("2-4-2"), 3)

    if comp_philosophy >= 4 and eval_link >= 4:
        return "performance"
    if comp_philosophy <= 2 and eval_link <= 2:
        return "community"
    return "elite"


def _impact_style(direction: str) -> tuple[str, str]:
    if direction == "up":
        return "↑", "#4F9A86"
    if direction == "down":
        return "↓", "#C8465A"
    return "→", "#C9844A"


def _amount_color(amount: str) -> str:
    if amount.startswith("+"):
        return "#C8465A"
    if amount.startswith("-"):
        return "#4F9A86"
    return "#2C3E50"


def _as_int(value: Any, default: int) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default
