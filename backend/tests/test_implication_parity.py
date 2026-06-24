"""Score implication JSON refactor tests."""
from __future__ import annotations


def test_implication_basic_score():
    from app.core.analysis_engine import _score_implication

    result = _score_implication("기본 점수", "-", 60, "보상 영역 시작점")
    assert result.startswith("[참고]")
    assert "기본 상태" in result


def test_implication_final_score():
    from app.core.analysis_engine import _score_implication

    result = _score_implication("최종 점수", "-", 75, "= 75점")
    assert result.startswith("[결론]")
    assert "75점" in result


def test_implication_market_compensation_by_value():
    from app.core.analysis_engine import _score_implication

    low = _score_implication("시장 보상 수준", "하위", -15, "시장 경쟁력 하위")
    assert low.startswith("[리스크]")
    assert "오퍼 거절" in low or "이탈" in low

    high = _score_implication("시장 보상 수준", "상위", 10, "시장 경쟁력")
    assert high.startswith("[강점]")

    mid = _score_implication("시장 보상 수준", "중위", 0, "")
    assert mid.startswith("[참고]")


def test_implication_eval_reward_linkage_by_impact():
    from app.core.analysis_engine import _score_implication

    negative = _score_implication("평가-보상 연동", "약함", -10, "연동 부족")
    assert negative.startswith("[리스크]")

    positive = _score_implication("평가-보상 연동", "강함", 10, "연동 양호")
    assert positive.startswith("[강점]")

    neutral = _score_implication("평가-보상 연동", "보통", 0, "")
    assert neutral.startswith("[참고]")


def test_implication_leader_feedback():
    from app.core.analysis_engine import _score_implication

    negative = _score_implication("리더 피드백 역량", "회피", -8, "피드백 회피")
    assert negative.startswith("[리스크]")
    assert "피드백" in negative or "문제" in negative

    positive = _score_implication("리더 피드백 역량", "양호", 15, "피드백 양호")
    assert positive.startswith("[강점]")


def test_implication_decision_structure():
    from app.core.analysis_engine import _score_implication

    result = _score_implication("의사결정 구조", "CEO 집중", -12, "병목")
    assert result.startswith("[리스크]")
    assert "대표님" in result or "결정" in result


def test_implication_copy_avoids_judgmental_phrasing():
    from app.core.analysis_engine import _score_implication

    feedback = _score_implication("리더 피드백 역량", "회피", -3, "피드백 회피")
    decision = _score_implication("의사결정 구조", "CEO 집중", -12, "병목")

    assert "수면 아래" not in feedback
    assert "한꺼번에 터집니다" not in feedback
    assert "일정에 종속됩니다" not in decision
    assert "피드백 운영 리듬" in feedback
    assert "반복 의사결정" in decision

def test_implication_fallback():
    from app.core.analysis_engine import _score_implication

    negative = _score_implication("미정의 factor", "값", -5, "테스트 노트")
    assert negative.startswith("[리스크]")
    assert "테스트 노트" in negative

    positive = _score_implication("미정의 factor", "값", 5, "긍정 테스트")
    assert positive.startswith("[강점]")
    assert "긍정 테스트" in positive


def test_full_diagnose_still_passes(client, full_responses):
    response = client.post("/api/diagnose", json={"responses": full_responses})

    assert response.status_code == 200
    data = response.json()

    for area in data["areas"]:
        for item in area["score_breakdown"]:
            assert item["implication"].startswith(("[리스크]", "[강점]", "[참고]", "[결론]"))
