"""실행 로드맵 타임라인 렌더링."""
from __future__ import annotations

from typing import Any

import streamlit as st

from src.data.scenarios import SCENARIOS


def render_roadmap(selected_scenario_id: str, responses: dict[str, Any]) -> None:
    """
    선택한 시나리오의 실행 로드맵을 타임라인 UI로 렌더링한다.

    Args:
        selected_scenario_id: 실행 방향으로 선택한 시나리오 ID.
        responses: 전체 진단 응답. 이후 조건부 로드맵 보정에 사용한다.
    """
    del responses  # MVP #05.6에서는 정적 next_steps를 렌더링하고, v0.2에서 조건부 보정한다.

    scenario = SCENARIOS.get(selected_scenario_id)
    if not scenario:
        st.warning("시나리오를 먼저 선택해 주세요.")
        return

    st.markdown("---")
    st.markdown("### 실행 로드맵")
    st.caption(f"{scenario['icon']} {scenario['name']} 기반 추천 실행 계획")

    for index, step_item in enumerate(scenario["next_steps"]):
        _render_timeline_step(
            step_label=step_item["step"],
            action=step_item["action"],
            step_number=index + 1,
            is_last=index == len(scenario["next_steps"]) - 1,
        )

    if scenario.get("warnings"):
        st.markdown("")
        st.markdown("**실행 전 핵심 주의사항**")
        st.warning(scenario["warnings"][0])

    with st.expander("도입 제도 패키지 상세"):
        for item in scenario["package"]:
            st.markdown(
                f'<div style="display:flex;justify-content:space-between;align-items:center;'
                f'gap:12px;padding:8px 12px;border-radius:8px;background:#F8FAFC;'
                f'border:1px solid #E2E8F0;margin-bottom:6px;">'
                f'<div>'
                f'<span style="font-size:12px;color:#94A3B8;margin-right:8px;">'
                f'{item["area"]}</span>'
                f'<span style="font-size:13px;color:#1E293B;">{item["action"]}</span>'
                f'</div>'
                f'<span style="font-size:12px;color:#14B8A6;white-space:nowrap;">'
                f'{item["timeline"]}</span>'
                f'</div>',
                unsafe_allow_html=True,
            )


def _render_timeline_step(
    step_label: str,
    action: str,
    step_number: int,
    is_last: bool,
) -> None:
    """단일 타임라인 스텝을 렌더링한다."""
    is_anchor_step = step_number == 1 or is_last
    dot_color = "#14B8A6" if is_anchor_step else "#94A3B8"
    bg_color = "#F0FDFA" if is_anchor_step else "#F8FAFC"
    border_color = "#14B8A6" if is_anchor_step else "#E2E8F0"
    line_html = (
        ""
        if is_last
        else '<div style="position:absolute;left:15px;top:32px;bottom:-8px;'
        'width:2px;background:#E2E8F0;"></div>'
    )

    st.markdown(
        f'<div style="position:relative;padding-left:44px;margin-bottom:16px;min-height:60px;">'
        f'<div style="position:absolute;left:4px;top:4px;width:24px;height:24px;'
        f'border-radius:50%;background:{dot_color};display:flex;align-items:center;'
        f'justify-content:center;font-size:11px;font-weight:700;color:white;">'
        f'{step_number}</div>'
        f'{line_html}'
        f'<div style="padding:12px 16px;border-radius:10px;background:{bg_color};'
        f'border:1px solid {border_color};">'
        f'<p style="font-size:12px;font-weight:600;color:{dot_color};margin:0 0 4px 0;">'
        f'{step_label}</p>'
        f'<p style="font-size:13px;color:#1E293B;margin:0;line-height:1.5;">'
        f'{action}</p>'
        f'</div>'
        f'</div>',
        unsafe_allow_html=True,
    )
