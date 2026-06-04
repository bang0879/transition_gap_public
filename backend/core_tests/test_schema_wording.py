"""Schema wording regression tests."""
from __future__ import annotations

from app.core.variables import ALL_VARIABLES, SHORT_LABELS_BY_ID
from app.schemas.responses import DiagnoseRequest


def _variable(var_id: str):
    return next(variable for variable in ALL_VARIABLES if variable.id == var_id)


def test_rewards_benefits_question_excludes_title_system_and_allows_unknown():
    variable = _variable("2-3-6")

    assert variable.label == "복리후생(휴가·간식·교육비 등)의 수준은 동종업계 대비 어떻습니까?"
    assert variable.options == [
        "동종업계보다 높은 편",
        "비슷한 편",
        "낮은 편",
        "모르겠음",
    ]
    assert SHORT_LABELS_BY_ID["2-3-6"] == "복리후생 수준"


def test_fairness_questions_document_not_operated_state():
    ceo = _variable("2-4-3-ceo")
    employee = _variable("2-4-3-employee")

    assert "0은 공식 평가 제도를 운영하지 않아" in ceo.helper_text
    assert "0은 공식 평가 제도를 운영하지 않아" in employee.helper_text


def test_l0_4_retention_philosophy_question_exists():
    variable = _variable("L0-4")

    assert variable.layer == "L0"
    assert variable.sub_category == "philosophy"
    assert variable.label == "대체 불가능한 핵심 인재가 이탈하려 할 때, 내부 형평성을 크게 벗어나는 파격적인 보상을 요구한다면 어떻게 의사결정 하시겠습니까?"
    assert variable.options == [
        "조직 전체의 형평성과 보상 원칙이 무너지는 것이 더 위험하므로, 타격이 있더라도 예외 없이 원칙대로 내보낸다.",
        "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
    ]
    assert SHORT_LABELS_BY_ID["L0-4"] == "핵심 인력 철학"


def test_diagnose_request_normalizes_l0_4_frontend_text():
    request = DiagnoseRequest(
        responses={
            "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
        }
    )

    assert request.responses["L0-4"] == "B"
