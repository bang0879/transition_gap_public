"""Layer 0 입력 폼 - CEO 철학 앵커링."""
from __future__ import annotations

import html

import streamlit as st

from src.database import save_response_immediately
from src.diagnosis.variables import InputType, Variable, get_missing_required_fields, get_variables_by_layer


def render_layer0() -> bool:
    """
    CEO 철학 질문 3개를 렌더링한다.

    Returns:
        모든 필수 입력이 완료되었으면 True.
    """
    st.markdown("## 대표님의 인사 철학")
    st.info(
        "아래 3가지 질문에는 정답이 없습니다. 자원이 제한된 현실에서 "
        "대표님의 본능이 어느 쪽으로 기우는지 확인하기 위한 것입니다. "
        "단 1%라도 더 중요하게 생각하는 쪽을 골라주세요."
    )
    st.caption("철학 앵커링 - 약 2분 소요")

    responses = st.session_state.responses
    variables = get_variables_by_layer("L0")

    for index, variable in enumerate(variables, start=1):
        st.markdown(f"#### Q{index}. {variable.label}")
        _render_ab_cards(variable, responses)
        st.markdown("")

    missing = get_layer0_missing()
    is_complete = len(missing) == 0
    st.session_state["layer0_complete"] = is_complete

    if not is_complete:
        unanswered = ", ".join(variable.short_label for variable in missing)
        st.warning(f"다음 단계로 넘어가려면 모든 질문에 응답해주세요. (미응답: {unanswered})")

    return is_complete


def get_layer0_missing() -> list[Variable]:
    """Layer 0 미입력 항목 리스트."""
    responses = st.session_state.get("responses", {})
    return get_missing_required_fields(responses, "L0")


def _render_ab_cards(variable: Variable, responses: dict) -> None:
    """A/B 선택지를 카드 형태로 렌더링한다."""
    if variable.input_type != InputType.SINGLE_SELECT or len(variable.options) < 2:
        st.warning(f"지원하지 않는 Layer 0 변수입니다: {variable.id}")
        return

    current = responses.get(variable.id)
    col_a, col_b = st.columns(2)

    with col_a:
        _render_choice_card(variable, responses, option_index=0, option_key="A", selected=current == "A")

    with col_b:
        _render_choice_card(variable, responses, option_index=1, option_key="B", selected=current == "B")

    if current in ("A", "B"):
        st.caption(f"✓ {current} 선택됨")


def _render_choice_card(
    variable: Variable,
    responses: dict,
    option_index: int,
    option_key: str,
    selected: bool,
) -> None:
    """단일 선택 카드를 렌더링하고 클릭 시 응답을 저장한다."""
    option_text = html.escape(variable.options[option_index])
    border_color = "#14B8A6" if selected else "#E2E8F0"
    background = "#F0FDFA" if selected else "#FFFFFF"

    st.markdown(
        f'<div style="padding:16px;border-radius:10px;border:2px solid {border_color};'
        f'background:{background};min-height:128px;">'
        f'<p style="font-size:13px;font-weight:700;color:#0F172A;margin:0 0 8px;">'
        f'{option_key}</p>'
        f'<p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">'
        f'{option_text}</p>'
        f'</div>',
        unsafe_allow_html=True,
    )

    if st.button(
        f"{option_key} 선택",
        key=f"l0_{variable.id}_{option_key.lower()}",
        use_container_width=True,
        type="primary" if selected else "secondary",
    ):
        responses[variable.id] = option_key
        _save_immediately(variable.id, option_key)
        st.rerun()


def _save_immediately(var_id: str, value: str) -> None:
    """위젯 값 변경 시 SQLite에 즉시 저장한다."""
    session_id = st.session_state.get("session_id")
    current_step = st.session_state.get("current_step", "layer0")

    new_session_id = save_response_immediately(
        variable_id=var_id,
        value=value,
        session_id=session_id,
        current_step=current_step,
    )

    if session_id is None:
        st.session_state.session_id = new_session_id
