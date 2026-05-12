"""
Layer 2 입력 폼 — 전환 갭 진단.

SSOT 변수 정의를 기준으로 5개 sub-category별 입력 폼을 렌더링한다.
"""
from __future__ import annotations

from typing import Any

import streamlit as st

from src.diagnosis.variables import (
    LAYER_2_VARIABLES,
    SUB_CATEGORY_LABELS,
    InputType,
    Variable,
    get_variables_by_sub_category,
)

PERCENT_SPLIT_FIELDS = {
    "base_salary": "기본급",
    "performance_bonus": "성과급",
    "equity": "지분보상",
}


def render_layer2_form() -> bool:
    """
    Layer 2 폼 렌더링.

    Returns:
        현재 표시된 필수 입력이 완료되었으면 True.
    """
    st.markdown("## Layer 2. 전환 갭 진단")
    st.caption("5개 영역의 전환 갭을 확인합니다 — 약 30~40분 소요")

    if "responses" not in st.session_state:
        st.session_state.responses = {}

    responses = st.session_state.responses

    for sub_category, label in SUB_CATEGORY_LABELS.items():
        variables = get_variables_by_sub_category(sub_category)
        with st.expander(label, expanded=sub_category == "2-1"):
            for var in variables:
                if not _should_render_variable(var, responses):
                    continue
                _render_variable(var, responses)
                st.markdown("")

    is_complete = _validate_layer2(responses)
    if not is_complete:
        st.info("현재 표시된 모든 필수 항목을 입력하면 다음 단계로 진행할 수 있습니다.")

    return is_complete


def _render_variable(var: Variable, responses: dict[str, Any]) -> None:
    """변수 정의에 맞는 Streamlit 입력 위젯을 렌더링한다."""
    st.markdown(f"#### {var.label}")
    if var.helper_text:
        st.caption(var.helper_text)

    input_key = f"input_{var.id}"

    if var.input_type == InputType.SINGLE_SELECT:
        _render_single_select(var, responses, input_key)
    elif var.input_type == InputType.MULTI_SELECT:
        _render_multi_select(var, responses, input_key)
    elif var.input_type == InputType.SLIDER_5:
        _render_slider_5(var, responses, input_key)
    elif var.input_type == InputType.SLIDER_RATIO:
        _render_slider_ratio(var, responses, input_key)
    elif var.input_type == InputType.NUMBER:
        _render_number(var, responses, input_key)
    elif var.input_type == InputType.PERCENT_SPLIT:
        _render_percent_split(var, responses, input_key)
    else:
        st.warning(f"지원하지 않는 입력 타입입니다: {var.input_type}")


def _render_single_select(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id)
    if input_key not in st.session_state:
        st.session_state[input_key] = current if current in var.options else var.options[0]
    responses[var.id] = st.radio(
        label=var.label,
        options=var.options,
        key=input_key,
        label_visibility="collapsed",
    )


def _render_multi_select(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, [])
    if input_key not in st.session_state:
        st.session_state[input_key] = current
    responses[var.id] = st.multiselect(
        label=var.label,
        options=var.options,
        max_selections=var.max_select,
        key=input_key,
        label_visibility="collapsed",
    )


def _render_slider_5(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, 3)
    if input_key not in st.session_state:
        st.session_state[input_key] = int(current) if isinstance(current, int) else 3
    responses[var.id] = st.slider(
        label=var.label,
        min_value=1,
        max_value=5,
        step=1,
        key=input_key,
        label_visibility="collapsed",
    )


def _render_slider_ratio(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, 0.5)
    if input_key not in st.session_state:
        st.session_state[input_key] = float(current) if isinstance(current, int | float) else 0.5
    responses[var.id] = st.slider(
        label=var.label,
        min_value=0.0,
        max_value=1.0,
        step=0.05,
        key=input_key,
        label_visibility="collapsed",
    )


def _render_number(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, 0)
    if input_key not in st.session_state:
        st.session_state[input_key] = float(current) if isinstance(current, int | float) else 0.0
    responses[var.id] = st.number_input(
        label=var.label,
        min_value=0.0,
        step=1.0,
        key=input_key,
        label_visibility="collapsed",
    )


def _render_percent_split(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, {})
    if not isinstance(current, dict):
        current = {}

    cols = st.columns(3)
    values: dict[str, float] = {}
    for col, (field_id, field_label) in zip(cols, PERCENT_SPLIT_FIELDS.items()):
        field_key = f"{input_key}_{field_id}"
        with col:
            if field_key not in st.session_state:
                st.session_state[field_key] = float(current.get(field_id, 0.0))
            values[field_id] = st.number_input(
                label=field_label,
                min_value=0.0,
                max_value=100.0,
                step=5.0,
                key=field_key,
            )

    total = sum(values.values())
    values["total"] = total
    responses[var.id] = values

    if total == 0:
        st.caption("선택 입력입니다. 정확한 비율을 모르면 비워두어도 됩니다.")
    elif total == 100:
        st.success("합계 100%")
    else:
        st.warning(f"현재 합계: {total:.0f}%")


def _should_render_variable(var: Variable, responses: dict[str, Any]) -> bool:
    """조건부 문항 표시 여부를 판정한다."""
    if var.id == "2-4-5":
        return responses.get("2-4-1") != "없음"
    if var.id == "2-5-3":
        return responses.get("2-5-2") != "운영 안 함"
    return True


def _validate_layer2(responses: dict[str, Any]) -> bool:
    """현재 표시되는 Layer 2 필수 변수가 입력됐는지 검증한다."""
    for var in LAYER_2_VARIABLES:
        if not _should_render_variable(var, responses):
            continue
        if var.input_type == InputType.PERCENT_SPLIT:
            continue

        value = responses.get(var.id)
        if value is None:
            return False
        if isinstance(value, str) and value == "":
            return False
        if isinstance(value, list) and len(value) == 0:
            return False

    return True
