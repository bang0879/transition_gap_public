"""Schema wording regression tests."""
from __future__ import annotations

from app.core.variables import ALL_VARIABLES, SHORT_LABELS_BY_ID


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
