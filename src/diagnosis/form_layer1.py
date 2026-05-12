"""
Layer 1 입력 폼 — 조직 컨텍스트 (5개 변수).

세션 상태에 응답을 저장하고, 입력 완료 시 다음 단계로 진행.
"""
from __future__ import annotations

import streamlit as st

from src.diagnosis.variables import LAYER_1_VARIABLES, InputType


def render_layer1_form() -> bool:
    """
    Layer 1 폼 렌더링.

    Returns:
        모든 필수 입력이 완료되었으면 True.
    """
    st.markdown("## Layer 1. 조직 컨텍스트")
    st.caption("조직의 기본 정보 — 약 5분 소요")

    # 세션 상태 초기화
    if "responses" not in st.session_state:
        st.session_state.responses = {}

    responses = st.session_state.responses

    # 각 변수 렌더링
    for var in LAYER_1_VARIABLES:
        st.markdown(f"#### {var.label}")
        if var.helper_text:
            st.caption(var.helper_text)

        input_key = f"input_{var.id}"

        if var.input_type == InputType.SINGLE_SELECT:
            current = responses.get(var.id)
            if input_key not in st.session_state:
                st.session_state[input_key] = current if current in var.options else var.options[0]
            value = st.radio(
                label=var.label,
                options=var.options,
                key=input_key,
                label_visibility="collapsed",
            )
            responses[var.id] = value

        elif var.input_type == InputType.MULTI_SELECT:
            current = responses.get(var.id, [])
            if input_key not in st.session_state:
                st.session_state[input_key] = current
            value = st.multiselect(
                label=var.label,
                options=var.options,
                max_selections=var.max_select,
                key=input_key,
                label_visibility="collapsed",
            )
            responses[var.id] = value

        st.markdown("")  # 여백

    # 완료 여부 검증
    is_complete = _validate_layer1(responses)

    if not is_complete:
        st.info("모든 항목을 입력하면 다음 단계로 진행할 수 있습니다.")

    return is_complete


def _validate_layer1(responses: dict) -> bool:
    """Layer 1 모든 변수가 입력됐는지 검증."""
    for var in LAYER_1_VARIABLES:
        value = responses.get(var.id)
        if value is None:
            return False
        if var.input_type == InputType.MULTI_SELECT:
            if not value or len(value) == 0:
                return False
        else:
            if value == "" or value is None:
                return False

    # L1-1 페인포인트는 정확히 2개 선택 권장 (최소 1개는 허용)
    l1_1 = responses.get("L1-1", [])
    if len(l1_1) < 1:
        return False

    return True
