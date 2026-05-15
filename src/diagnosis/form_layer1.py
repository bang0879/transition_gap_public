"""
Layer 1 입력 폼 — 조직 컨텍스트 (5개 변수).

세션 상태에 응답을 저장하고, 입력 완료 시 다음 단계로 진행.
"""
from __future__ import annotations

import streamlit as st

from src.diagnosis.variables import (
    LAYER_1_VARIABLES,
    InputType,
    get_missing_required_fields,
    get_question_number,
)
from src.database import save_response_immediately


def render_layer1_form() -> bool:
    """
    Layer 1 폼 렌더링.

    Returns:
        모든 필수 입력이 완료되었으면 True.
    """
    st.markdown("## Layer 1. 조직 컨텍스트")
    st.info(
        "이 단계에서는 귀사의 현재 비즈니스 스테이지와 가장 시급한 페인포인트를 파악합니다. "
        "수집된 정보는 대기업식 제도가 아닌, 귀사의 규모와 상황에 맞는 현실적인 "
        "제도를 추천하는 기준점이 됩니다."
    )
    st.caption("조직의 기본 정보 — 약 3분 소요")

    responses = st.session_state.responses

    # 각 변수 렌더링
    for var in LAYER_1_VARIABLES:
        _render_question_heading(var.id, var.label)
        if var.helper_text:
            st.caption(var.helper_text)

        input_key = f"input_{var.id}"

        if var.input_type == InputType.SINGLE_SELECT:
            current = responses.get(var.id)
            if input_key in st.session_state and st.session_state[input_key] not in var.options:
                del st.session_state[input_key]
            if current is not None and current not in var.options:
                responses.pop(var.id, None)
                current = None
            index = var.options.index(current) if current in var.options else None
            value = st.radio(
                label=var.label,
                options=var.options,
                index=index,
                key=input_key,
                label_visibility="collapsed",
            )
            if value is not None:
                responses[var.id] = value
                _save_immediately(var.id, value)

        elif var.input_type == InputType.MULTI_SELECT:
            current = responses.get(var.id, [])
            if not isinstance(current, list):
                current = []
            max_select = var.max_select or len(var.options)
            current = [item for item in current if item in var.options][:max_select]
            trimmed_extra_selection = False
            was_initialized = input_key in st.session_state
            stored_value = st.session_state.get(input_key)
            if isinstance(stored_value, list) and len(stored_value) > max_select:
                st.session_state[input_key] = stored_value[:max_select]
                trimmed_extra_selection = True
            multiselect_kwargs = {}
            if input_key not in st.session_state:
                multiselect_kwargs["default"] = current
            value = st.multiselect(
                label=var.label,
                options=var.options,
                key=input_key,
                label_visibility="collapsed",
                help="가장 시급한 항목을 최대 2개까지 선택하세요.",
                **multiselect_kwargs,
            )
            if len(value) > max_select:
                value = value[:max_select]
                trimmed_extra_selection = True
            if trimmed_extra_selection:
                st.warning(
                    f"최대 {max_select}개까지만 선택됩니다. 처음 선택한 {max_select}개가 유지됩니다."
                )
            responses[var.id] = value
            if value or was_initialized:
                _save_immediately(var.id, value)
            if len(value) == 0:
                st.caption("1~2개를 선택해 주세요.")
            elif len(value) == max_select:
                st.caption(f"✓ {max_select}개 선택 완료")
            else:
                st.caption(f"✓ {len(value)}개 선택됨 (최대 {max_select}개)")

        st.markdown("")  # 여백

    # 완료 여부 검증
    is_complete = _validate_layer1(responses)

    if not is_complete:
        st.info("모든 항목을 입력하면 다음 단계로 진행할 수 있습니다.")

    return is_complete


def get_layer1_missing() -> list:
    """Layer 1 미입력 항목 리스트."""
    responses = st.session_state.get("responses", {})
    return get_missing_required_fields(responses, "L1")


def _render_question_heading(variable_id: str, label: str) -> None:
    """질문 번호와 질문 텍스트를 함께 표시한다."""
    question_number = get_question_number(variable_id)
    if question_number:
        st.markdown(f"#### Q{question_number}. {label}")
    else:
        st.markdown(f"#### {label}")


def _save_immediately(var_id: str, value) -> None:
    """위젯 값 변경 시 SQLite에 즉시 저장한다."""
    session_id = st.session_state.get("session_id")
    current_step = st.session_state.get("current_step", "layer1")

    new_session_id = save_response_immediately(
        variable_id=var_id,
        value=value,
        session_id=session_id,
        current_step=current_step,
    )

    if session_id is None:
        st.session_state.session_id = new_session_id


def _validate_layer1(responses: dict) -> bool:
    """Layer 1 모든 변수가 입력됐는지 검증."""
    for var in LAYER_1_VARIABLES:
        value = responses.get(var.id)

        if value is None:
            return False

        if var.input_type == InputType.MULTI_SELECT:
            if not isinstance(value, list) or len(value) == 0:
                return False
        elif var.input_type == InputType.SINGLE_SELECT:
            if value == "" or value is None:
                return False

    return True
