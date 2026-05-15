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
    get_question_number,
    get_variables_by_sub_category,
)
from src.database import save_response_immediately

PERCENT_SPLIT_FIELDS = {
    "base": "기본급",
    "performance": "성과급",
    "equity": "지분보상",
}

SLIDER_OPTIONS = {
    "2-3-1": [
        "비금전 최우선",
        "비금전 위주",
        "균형",
        "금전 위주",
        "금전 최우선",
    ],
    "2-4-2": [
        "완전 분리",
        "약한 연동",
        "중간",
        "강한 연동",
        "완전 동일",
    ],
    "2-4-3-ceo": ["1점", "2점", "3점", "4점", "5점"],
    "2-4-3-employee": ["1점", "2점", "3점", "4점", "5점"],
    "2-4-4": [
        "거의 못함",
        "일부 공감",
        "보통",
        "대체로 공감",
        "강하게 공감",
    ],
}

SLIDER_DESCRIPTIONS = {
    "2-3-1": "우수 인재를 무엇으로 설득하는지 — 비전·자율성·성장(좌) vs 파격 연봉·성과급(우)",
    "2-4-2": "평가 결과가 실제 보상(연봉·성과급)에 얼마나 직접 반영되는지",
    "2-4-3-ceo": "대표님이 생각하는 현재 평가 제도의 공정성 (5점 만점)",
    "2-4-3-employee": "직원들이 매길 것으로 예상되는 공정성 점수 (5점 만점)",
    "2-4-4": "회사 장기 비전에 대한 리더급 이상의 공감 수준",
}


def render_layer2_a_form() -> bool:
    """Layer 2-A: 인력 안정성 + 채용 파이프라인."""
    st.markdown("## 인사제도 현황 진단 (1/3)")
    st.caption("인력 안정성 및 채용 파이프라인 — 약 4분 소요")
    st.info(
        "지금부터 본격적인 진단입니다. 대표님이 생각하는 '이상적인 방향'과 "
        "조직의 '실제 운영 상태' 사이의 간극(Gap)을 찾습니다."
    )

    responses = st.session_state.responses
    sub_categories = ["2-1", "2-2"]

    completed_count = 0
    for sub_category in sub_categories:
        if _render_sub_category(sub_category, responses):
            completed_count += 1

    return completed_count == len(sub_categories)


def render_layer2_b_form() -> bool:
    """Layer 2-B: 총보상."""
    st.markdown("## 인사제도 현황 진단 (2/3)")
    st.caption("총보상 (Total Rewards) 구조 — 약 4분 소요")

    responses = st.session_state.responses
    return _render_sub_category("2-3", responses)


def render_layer2_c_form() -> bool:
    """Layer 2-C: 평가 + 리더십."""
    st.markdown("## 인사제도 현황 진단 (3/3)")
    st.caption("평가 및 리더십 · 거버넌스 — 약 5분 소요")

    responses = st.session_state.responses
    sub_categories = ["2-4", "2-5"]

    completed_count = 0
    for sub_category in sub_categories:
        if _render_sub_category(sub_category, responses):
            completed_count += 1

    return completed_count == len(sub_categories)


def get_layer2_a_missing() -> list[Variable]:
    """Layer 2-A 미입력 항목."""
    responses = st.session_state.get("responses", {})
    return _get_missing_in_sub_categories(responses, ["2-1", "2-2"])


def get_layer2_b_missing() -> list[Variable]:
    """Layer 2-B 미입력 항목."""
    responses = st.session_state.get("responses", {})
    return _get_missing_in_sub_categories(responses, ["2-3"])


def get_layer2_c_missing() -> list[Variable]:
    """Layer 2-C 미입력 항목."""
    responses = st.session_state.get("responses", {})
    return _get_missing_in_sub_categories(responses, ["2-4", "2-5"])


def _get_missing_in_sub_categories(responses: dict[str, Any], sub_categories: list[str]) -> list[Variable]:
    """특정 sub-category들에서 미입력 변수를 반환한다."""
    target_vars = [var for var in LAYER_2_VARIABLES if var.sub_category in sub_categories]
    missing: list[Variable] = []

    for var in target_vars:
        if var.input_type == InputType.PERCENT_SPLIT:
            continue
        if not _should_render_variable(var, responses):
            continue

        value = responses.get(var.id)
        if _is_empty_value(value, var.input_type):
            missing.append(var)

    return missing


def _render_sub_category(sub_category: str, responses: dict[str, Any]) -> bool:
    """단일 sub-category를 렌더링하고 완료 여부를 반환한다."""
    label = SUB_CATEGORY_LABELS[sub_category]
    variables = get_variables_by_sub_category(sub_category)

    with st.expander(f"{sub_category}. {label}", expanded=True):
        for var in variables:
            if not _should_render_variable(var, responses):
                responses.pop(var.id, None)
                continue
            _render_variable(var, responses)
            st.markdown("")

    return _is_sub_category_complete(sub_category, responses)


def _render_variable(var: Variable, responses: dict[str, Any]) -> None:
    """변수 정의에 맞는 Streamlit 입력 위젯을 렌더링한다."""
    _render_question_heading(var)
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


def _render_question_heading(var: Variable) -> None:
    """질문 번호와 질문 텍스트를 함께 표시한다."""
    question_number = get_question_number(var.id)
    if question_number:
        st.markdown(f"#### Q{question_number}. {var.label}")
    else:
        st.markdown(f"#### {var.label}")


def _render_single_select(var: Variable, responses: dict[str, Any], input_key: str) -> None:
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
        horizontal=False,
    )
    if value is not None:
        responses[var.id] = value
        _save_immediately(var.id, value)


def _render_multi_select(var: Variable, responses: dict[str, Any], input_key: str) -> None:
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
    multiselect_kwargs: dict[str, Any] = {}
    if input_key not in st.session_state:
        multiselect_kwargs["default"] = current
    value = st.multiselect(
        label=var.label,
        options=var.options,
        key=input_key,
        label_visibility="collapsed",
        **multiselect_kwargs,
    )
    if len(value) > max_select:
        value = value[:max_select]
        trimmed_extra_selection = True
    if trimmed_extra_selection:
        st.warning(f"최대 {max_select}개까지만 선택됩니다.")
    responses[var.id] = value
    if value or was_initialized:
        _save_immediately(var.id, value)


def _render_slider_5(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    options = SLIDER_OPTIONS.get(var.id, ["1", "2", "3", "4", "5"])
    current_int = responses.get(var.id)
    if input_key in st.session_state and st.session_state[input_key] not in options:
        del st.session_state[input_key]
    index = current_int - 1 if isinstance(current_int, int) and 1 <= current_int <= 5 else None

    selected = st.radio(
        label=var.label,
        options=options,
        index=index,
        key=input_key,
        label_visibility="collapsed",
        horizontal=True,
    )
    description = SLIDER_DESCRIPTIONS.get(var.id)
    if description:
        st.caption(description)
    if selected is not None:
        value_int = options.index(selected) + 1
        responses[var.id] = value_int
        _save_immediately(var.id, value_int)


def _render_slider_ratio(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, 0.5)
    current_value = float(current) if isinstance(current, int | float) else 0.5
    options = [round(i / 20, 2) for i in range(21)]
    selected = st.select_slider(
        label=var.label,
        options=options,
        value=min(options, key=lambda option: abs(option - current_value)),
        key=input_key,
        label_visibility="collapsed",
    )
    responses[var.id] = selected
    _save_immediately(var.id, selected)


def _render_number(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    current = responses.get(var.id, 0)
    if input_key not in st.session_state:
        st.session_state[input_key] = float(current) if isinstance(current, int | float) else 0.0
    value = st.number_input(
        label=var.label,
        min_value=0.0,
        step=1.0,
        key=input_key,
        label_visibility="collapsed",
    )
    responses[var.id] = value
    _save_immediately(var.id, value)


def _render_percent_split(var: Variable, responses: dict[str, Any], input_key: str) -> None:
    try:
        current = responses.get(var.id)
        if not isinstance(current, dict):
            current = {"base": 0, "performance": 0, "equity": 0}

        col1, col2, col3 = st.columns(3)
        with col1:
            base = st.number_input(
                "기본급 (%)",
                min_value=0,
                max_value=100,
                value=_as_percent_int(current.get("base", 0)),
                step=5,
                key=f"{input_key}_base",
            )
        with col2:
            performance = st.number_input(
                "성과급 (%)",
                min_value=0,
                max_value=100,
                value=_as_percent_int(current.get("performance", 0)),
                step=5,
                key=f"{input_key}_performance",
            )
        with col3:
            equity = st.number_input(
                "지분보상 (%)",
                min_value=0,
                max_value=100,
                value=_as_percent_int(current.get("equity", 0)),
                step=5,
                key=f"{input_key}_equity",
            )

        values = {"base": base, "performance": performance, "equity": equity}
        total = sum(values.values())
        responses[var.id] = values
        _save_immediately(var.id, values)

        if total == 0:
            st.caption("선택 입력입니다. 정확한 비율을 모르면 비워두어도 됩니다.")
        elif total == 100:
            st.success("합계 100%")
        else:
            st.warning(f"현재 합계: {total:.0f}%")
    except (TypeError, ValueError) as exc:
        responses[var.id] = {"base": 0, "performance": 0, "equity": 0}
        st.warning(f"비율 입력을 불러오지 못해 기본값으로 초기화했습니다: {exc}")


def _as_percent_int(value: Any) -> int:
    """숫자 입력의 초기값을 0~100 정수로 정규화한다."""
    if not isinstance(value, int | float):
        return 0
    return max(0, min(100, int(value)))


def _is_empty_value(value: Any, input_type: InputType) -> bool:
    """값이 미입력 상태인지 판정한다."""
    if value is None:
        return True
    if input_type == InputType.MULTI_SELECT:
        return not isinstance(value, list) or len(value) == 0
    if input_type == InputType.SINGLE_SELECT:
        return value == ""
    if input_type in (InputType.SLIDER_5, InputType.SLIDER_RATIO, InputType.NUMBER):
        return value is None
    return False


def _save_immediately(var_id: str, value) -> None:
    """위젯 값 변경 시 SQLite에 즉시 저장한다."""
    session_id = st.session_state.get("session_id")
    current_step = st.session_state.get("current_step", "layer2_a")

    new_session_id = save_response_immediately(
        variable_id=var_id,
        value=value,
        session_id=session_id,
        current_step=current_step,
    )

    if session_id is None:
        st.session_state.session_id = new_session_id


def _should_render_variable(var: Variable, responses: dict[str, Any]) -> bool:
    """조건부 문항 표시 여부를 판정한다."""
    if var.id == "2-4-5":
        return responses.get("2-4-1a") != "운영하지 않음"
    if var.id == "2-5-3":
        return responses.get("2-5-2") != "운영 안 함"
    return True


def _validate_layer2(responses: dict[str, Any]) -> bool:
    """현재 표시되는 Layer 2 필수 변수가 입력됐는지 검증한다."""
    return all(_is_sub_category_complete(sub_category, responses) for sub_category in SUB_CATEGORY_LABELS)


def _is_sub_category_complete(sub_category: str, responses: dict[str, Any]) -> bool:
    """sub-category 완료 여부를 검증한다."""
    variables = get_variables_by_sub_category(sub_category)

    for var in LAYER_2_VARIABLES:
        if var not in variables:
            continue
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
