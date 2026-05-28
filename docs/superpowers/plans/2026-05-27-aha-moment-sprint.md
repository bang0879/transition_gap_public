# Aha Moment Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 결과 첫 화면에서 CEO가 “우리 회사 인사제도가 서로 다른 방향을 보고 있다”를 3초 안에 이해하도록 정합성 맵과 실행 로드맵을 강화한다.

**Architecture:** 기존 Next.js/FastAPI 구조를 유지하고, 백엔드에 시각화 전용 `alignment_map` 계약을 추가한다. 프론트엔드는 `/result` 최상단에 정합성 맵을 배치하고, 기존 레이더/갭 차트는 보조 근거로 내린다. 보상 구조 시뮬레이터는 이번 스프린트 범위에서 제외하고, 정합성 맵 이후 후속 스프린트로 연결한다.

**Tech Stack:** FastAPI, Pydantic, pytest, SQLite event log, Next.js 15, React 19, TypeScript, Tailwind CSS, SVG visualization.

---

## Scope Guard

이번 스프린트의 이름은 **Aha Moment Sprint**다.

**이번 스프린트에 포함한다**
- 정합성 맵: 5개 영역의 방향 벡터, 분산도, 대표 엇박자 설명
- 결과 요약 IA 변경: 정합성 맵을 레이더 차트보다 위에 배치
- 회사 맥락화: 회사명, 규모, 산업, 성장 기조를 결과/로드맵 카피에 반영
- 로드맵 확충: 각 단계에 `선행 조건 / 핵심 액션 / 성공 지표 / 리스크` 추가
- 1단계 주간 액션: “이번 주 무엇을 할지” 수준으로 쪼개기
- 이벤트 로깅 확장: 정합성 맵, conflict 클릭, 로드맵 phase open
- iPad 시연 대응: 820px, 1024px 폭에서 가로 스크롤 제거
- 배포 준비: Vercel/Render 환경변수와 health check 기준 정리

**이번 스프린트에서 제외한다**
- 보상 구조 시뮬레이터: 정합성 맵이 보상 엇박자를 설득한 다음 스프린트에서 붙인다.
- 동적 벤치마크 데이터 해자: 실제 진단 누적 전까지는 정적/맥락형 벤치마크만 유지한다.
- 브랜드 PDF 생성기: 로드맵 콘텐츠 확충 후 별도 스프린트에서 ReportLab 또는 서버 PDF로 설계한다.
- 반복 진단/변화 추적 구현: 이번 스프린트에서는 설계 메모와 데이터 모델 초안까지만 남긴다.

## Feedback Gates

강훈님 테스트와 피드백이 필요한 시점은 세 번이다.

1. **Gate A: 정합성 맵 첫 화면 확인**
   - 시점: Task 5 완료 후
   - 확인 경로: `/result`
   - 확인 질문:
     - 화살표가 “제도들이 각자 다른 곳을 본다”는 느낌을 주는가?
     - 축 이름이 CEO에게 직관적인가?
     - 보상/평가/채용/인력/리더십 중 어느 영역이 엇박자인지 바로 보이는가?

2. **Gate B: 로드맵 구체성 확인**
   - 시점: Task 8 완료 후
   - 확인 경로: `/roadmap?scenario=performance`, `/roadmap?scenario=community`, `/roadmap?scenario=elite`
   - 확인 질문:
     - 1단계가 “이번 주 무엇을 해야 하는지”까지 충분히 구체적인가?
     - 단계별 `선행 조건 / 핵심 액션 / 성공 지표 / 리스크`가 경영회의 자료로 쓸 만한가?
     - 제도 이름 나열이 아니라 실행 판단표처럼 읽히는가?

3. **Gate C: 대면 시연 QA**
   - 시점: Task 11 완료 후
   - 확인 경로: iPad 가로/세로 또는 브라우저 1024x768, 820x1180
   - 확인 질문:
     - Rail이 화면을 과하게 먹지 않는가?
     - 정합성 맵과 로드맵 카드가 잘리지 않는가?
     - 7~8월 대면 미팅에서 바로 열어 보여줄 수 있는가?

## File Map

- Create: `backend/app/core/alignment_map.py`
  - 5개 HR 영역의 방향 벡터, centroid, dispersion, 엇박자 conflict를 계산한다.
- Modify: `backend/app/core/alignment_engine.py`
  - 기존 conflict penalty 로직은 유지한다. 필요 시 정합성 맵 conflict 문구와 중복되지 않게 severity label만 맞춘다.
- Modify: `backend/app/schemas/analysis.py`
  - `AlignmentMapOut`, `AlignmentMapVectorOut`, `AlignmentMapConflictOut` schema를 추가한다.
- Modify: `backend/app/api/diagnose.py`
  - `alignment_map=analyze_alignment_map(responses, areas)`를 응답에 추가한다.
- Create: `backend/core_tests/test_alignment_map.py`
  - 벡터 계산, 분산도, conflict 탐지, API 포함 여부를 검증한다.
- Modify: `frontend/lib/types/api.ts`
  - `AlignmentMapOut` 타입을 추가한다.
- Create: `frontend/components/visualization/AlignmentMap.tsx`
  - 정합성 맵 SVG와 conflict summary를 렌더링한다.
- Create: `frontend/components/result/CompanyContextBar.tsx`
  - 회사명/규모/산업/성장 기조를 결과 화면 맥락으로 보여준다.
- Modify: `frontend/app/(analysis)/result/page.tsx`
  - 정합성 맵을 결과 요약 최상단에 배치하고 레이더 차트를 보조 근거로 내린다.
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
  - 단계별 4요소와 1단계 주간 액션을 표시한다.
- Create: `frontend/components/roadmap/WeeklyActionList.tsx`
  - 1단계의 이번 주 실행 액션을 체크리스트 형태로 보여준다.
- Modify: `backend/app/content/scenarios.json`
  - `next_steps`를 더 구체적인 구조로 확장한다.
- Modify: `frontend/lib/api/events.ts`
  - event helper는 유지하고, 호출부에서 새 event type을 사용한다.
- Modify: `frontend/lib/hooks/usePageTracking.ts`
  - 체류 시간 metadata는 유지한다. 추가 페이지별 세부 event는 각 컴포넌트에서 호출한다.
- Modify: `frontend/app/globals.css`
  - 1180px 이하 layout 대응과 print/iPad overflow 보정을 추가한다.
- Modify: `docs/feedback/260527_feedback_checklist.md`
  - 이번 스프린트 항목을 별도 섹션으로 추가한다.
- Modify: `docs/decisions.md`
  - 보상 구조 시뮬레이터를 Aha Moment 이후로 미루는 sequencing 결정을 기록한다.

---

## Task 0: Sprint Guardrails And Checklist

**Files:**
- Modify: `docs/feedback/260527_feedback_checklist.md`
- Modify: `docs/decisions.md`

- [ ] **Step 1: Add Aha Moment section to feedback checklist**

Append this section to `docs/feedback/260527_feedback_checklist.md`:

```markdown
## Aha Moment Sprint

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[ ]` | 정합성 맵 신설 | `alignment_map.py`, `AlignmentMap.tsx`, `result/page.tsx` | 5개 영역 방향 벡터와 엇박자 conflict를 첫 화면에 표시 | `/result` 3초 이해 테스트 |
| `[ ]` | 회사 맥락화 강화 | `CompanyContextBar.tsx`, `result/page.tsx` | 회사명, 규모, 산업, 성장 기조를 결과 카피에 반영 | 회사 입력값이 결과 화면에 노출 |
| `[ ]` | 로드맵 데이터 대확충 | `scenarios.json`, `RoadmapTimeline.tsx`, `WeeklyActionList.tsx` | 단계별 4요소와 1단계 주간 액션 추가 | Gate B 피드백 |
| `[ ]` | 정합성 맵 이후 보상 시뮬레이터 연결 순서 확정 | `docs/decisions.md` | 시뮬레이터는 후속 스프린트로 분리 | 의사결정 로그 기록 |
| `[ ]` | iPad 시연 대응 | `globals.css`, analysis/diagnose layouts | 1180px 이하 compact layout 적용 | 1024x768, 820x1180 확인 |
| `[ ]` | 배포 준비 | `frontend/next.config.ts`, backend CORS/env docs | Vercel/Render 환경변수와 health check 확인 | 배포 URL smoke test |
```

- [ ] **Step 2: Add product sequencing decision**

Append this decision to `docs/decisions.md`:

```markdown
---

## 2026-05-27: Aha Moment Sprint와 보상 시뮬레이터 순서 확정

**컨텍스트**: 260527 종합 리뷰에서 정합성 맵이 Transition Gap의 킬러 피처로 제안되었고, 보상 구조 시뮬레이터는 보상 엇박자가 먼저 설득된 뒤 자연스럽게 연결되어야 한다는 피드백이 추가됨.

**결정 사항**:
- 다음 스프린트는 정합성 맵, 회사 맥락화, 실행 로드맵 구체화에 집중한다.
- 보상 구조 시뮬레이터는 이번 스프린트에서 구현하지 않고, 정합성 맵에서 보상 엇박자가 명확히 드러난 이후 후속 스프린트로 진행한다.
- 결과 요약의 첫 화면은 점수표나 레이더 차트보다 “제도들이 같은 방향을 보는가”를 보여주는 정합성 맵을 우선한다.

**근거**: 시뮬레이터가 먼저 나오면 기능은 화려하지만 왜 보상을 바꿔야 하는지 맥락이 약해진다. 정합성 맵이 먼저 엇박자를 설득해야 “그래서 보상을 어떻게 바꾸면 되는가”라는 다음 질문이 자연스럽게 발생한다.
```

- [ ] **Step 3: Commit documentation guardrails**

Run:

```powershell
git add docs/feedback/260527_feedback_checklist.md docs/decisions.md
git commit -m "docs: define aha moment sprint scope"
```

Expected: commit succeeds with only documentation changes.

---

## Task 1: Backend Alignment Map Tests

**Files:**
- Create: `backend/core_tests/test_alignment_map.py`

- [ ] **Step 1: Write failing tests for vector shape**

Create `backend/core_tests/test_alignment_map.py`:

```python
"""Alignment map tests."""
from __future__ import annotations

from app.api.diagnose import diagnose
from app.core.alignment_map import analyze_alignment_map
from app.core.analysis_engine import analyze_all_areas
from app.schemas.responses import DiagnoseRequest
import asyncio


def contradictory_responses() -> dict[str, object]:
    return {
        "L0-1": "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
        "L0-2": "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
        "L0-3": "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        "L1-2": "50~100인",
        "L1-4": "공격적 확장 (30%+ 인원 증가)",
        "L1-5": "B2B SaaS",
        "2-2-1": "4~6개월",
        "2-2-2": "1~2개",
        "2-3-1": 5,
        "2-3-2": "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
        "2-3-5": "하위",
        "2-4-1a": "반기 1회",
        "2-4-2": 1,
        "2-4-3-ceo": 8,
        "2-4-3-employee": 4,
        "2-4-5": "모름 / 측정 안 함",
        "2-5-1": "대표인 내가 직접 나서야 해결됨",
        "2-5-2": "운영 안 함",
        "2-5-4": "CEO가 모든 인원 최종 면접 및 승인",
        "2-5-5": "CEO 최종 승인 필요",
        "2-5-6": "문서로만 존재함",
    }


def aligned_responses() -> dict[str, object]:
    return {
        "L0-1": "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.",
        "L0-2": "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
        "L0-3": "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        "L1-2": "20~50인",
        "L1-4": "결원 보충 및 유지 (10% 미만)",
        "L1-5": "B2B SaaS",
        "2-2-1": "1~2개월",
        "2-2-2": "3~4개",
        "2-3-1": 2,
        "2-3-2": "현금 안정형 (기본급 중심, 성과급 낮음)",
        "2-3-5": "중위",
        "2-4-1a": "분기 1회",
        "2-4-2": 2,
        "2-4-3-ceo": 7,
        "2-4-3-employee": 6,
        "2-4-5": "관리함",
        "2-5-1": "대부분 객관적으로 잘 수행함",
        "2-5-2": "운영함",
        "2-5-3": "관리함",
        "2-5-4": "팀장 1차, CEO 일부 최종",
        "2-5-5": "리더 권한 내 결정",
        "2-5-6": "명확한 기준으로 작동함",
    }


def test_alignment_map_returns_five_domain_vectors():
    responses = contradictory_responses()
    areas = analyze_all_areas(responses)

    result = analyze_alignment_map(responses, areas)

    assert len(result.vectors) == 5
    assert {vector.domain_id for vector in result.vectors} == {
        "compensation",
        "evaluation",
        "recruitment",
        "retention",
        "leadership",
    }
    for vector in result.vectors:
        assert -1 <= vector.x <= 1
        assert -1 <= vector.y <= 1
        assert 0 <= vector.magnitude <= 1
        assert vector.domain_name
        assert vector.direction_label
        assert vector.evidence


def test_alignment_map_detects_higher_dispersion_for_contradictory_case():
    contradictory = analyze_alignment_map(
        contradictory_responses(),
        analyze_all_areas(contradictory_responses()),
    )
    aligned = analyze_alignment_map(
        aligned_responses(),
        analyze_all_areas(aligned_responses()),
    )

    assert contradictory.dispersion > aligned.dispersion
    assert contradictory.alignment_score < aligned.alignment_score
    assert contradictory.alignment_level in {"엇박자 큼", "정렬 필요"}
    assert aligned.alignment_level in {"대체로 정합", "정렬 필요"}


def test_alignment_map_surfaces_reward_evaluation_conflict():
    responses = contradictory_responses()
    result = analyze_alignment_map(responses, analyze_all_areas(responses))

    conflict_ids = {conflict.id for conflict in result.conflicts}

    assert "reward_points_to_performance_eval_points_to_low_basis" in conflict_ids
    assert result.conflicts[0].title
    assert result.conflicts[0].domains


def test_diagnose_response_includes_alignment_map():
    request = DiagnoseRequest(responses=contradictory_responses())

    result = asyncio.run(diagnose(request))

    assert result.alignment_map.alignment_score <= 100
    assert len(result.alignment_map.vectors) == 5
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_alignment_map.py -q
```

Expected: FAIL because `app.core.alignment_map` does not exist.

---

## Task 2: Backend Alignment Map Engine

**Files:**
- Create: `backend/app/core/alignment_map.py`

- [ ] **Step 1: Create data contracts and helpers**

Create `backend/app/core/alignment_map.py` with these contracts:

```python
"""Vector-based HR system alignment map."""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AlignmentMapVector:
    """A domain direction on the alignment map."""

    domain_id: str
    domain_name: str
    x: float
    y: float
    magnitude: float
    direction_label: str
    evidence: list[str]


@dataclass(frozen=True)
class AlignmentMapConflict:
    """A visible mismatch between domain vectors."""

    id: str
    title: str
    detail: str
    domains: tuple[str, ...]
    severity: str


@dataclass(frozen=True)
class AlignmentMapAnalysis:
    """Alignment map payload for visualization."""

    alignment_score: int
    alignment_level: str
    dispersion: float
    centroid_x: float
    centroid_y: float
    headline: str
    summary: str
    vectors: list[AlignmentMapVector]
    conflicts: list[AlignmentMapConflict]


def _clamp(value: float, low: float = -1.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _as_int(value: Any, default: int) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default


def _score_to_axis(value: int, midpoint: int = 3) -> float:
    return _clamp((value - midpoint) / 2)


def _text(value: Any) -> str:
    return str(value) if value not in (None, "") else "미입력"


def _direction_label(x: float, y: float) -> str:
    if abs(x) < 0.18 and abs(y) < 0.18:
        return "방향 약함"
    horizontal = "성과·시장" if x >= 0.18 else "공동체·장기 신뢰" if x <= -0.18 else "중립"
    vertical = "제도·데이터" if y >= 0.18 else "관계·자율" if y <= -0.18 else "중립"
    if horizontal == "중립":
        return vertical
    if vertical == "중립":
        return horizontal
    return f"{horizontal} / {vertical}"
```

- [ ] **Step 2: Add domain vector functions**

Add the five domain functions:

```python
def _compensation_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    philosophy = _as_int(responses.get("2-3-1"), 3)
    structure = _text(responses.get("2-3-2"))
    market = _text(responses.get("2-3-5"))
    x = _score_to_axis(philosophy)
    if "단기 성과형" in structure or "인센티브" in structure:
        x += 0.25
    if market == "하위":
        x -= 0.15
    elif market == "상위":
        x += 0.15
    y = 0.2
    if "밴드" in structure or "성과형" in structure:
        y += 0.35
    if "현금 안정형" in structure:
        y -= 0.1
    evidence = [
        f"보상 철학 {_text(philosophy)}점",
        f"보상 구조: {structure}",
        f"시장 대비 보상 위치: {market}",
    ]
    return AlignmentMapVector(
        domain_id="compensation",
        domain_name="보상",
        x=_clamp(x),
        y=_clamp(y),
        magnitude=min(1.0, 0.55 + abs(x) * 0.25 + abs(y) * 0.2),
        direction_label=_direction_label(_clamp(x), _clamp(y)),
        evidence=evidence,
    )


def _evaluation_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    cycle = _text(responses.get("2-4-1a"))
    eval_link = _as_int(responses.get("2-4-2"), 3)
    ceo_fair = _as_int(responses.get("2-4-3-ceo"), 5)
    employee_fair = _as_int(responses.get("2-4-3-employee"), 5)
    eval_data = _text(responses.get("2-4-5"))
    active = cycle not in ("운영하지 않음", "없음", "비정기", "미입력")
    x = _score_to_axis(eval_link)
    if active and eval_link <= 2:
        x -= 0.2
    y = 0.45 if active else -0.35
    if eval_data in ("모름 / 측정 안 함", "미입력"):
        y -= 0.35
    fairness_gap = max(0, ceo_fair - employee_fair)
    if fairness_gap >= 3:
        y -= 0.15
    evidence = [
        f"평가 주기: {cycle}",
        f"평가-보상 연동: {eval_link}점",
        f"평가 운영 데이터: {eval_data}",
    ]
    return AlignmentMapVector(
        domain_id="evaluation",
        domain_name="평가",
        x=_clamp(x),
        y=_clamp(y),
        magnitude=0.35 if not active else min(1.0, 0.6 + abs(x) * 0.2 + abs(y) * 0.2),
        direction_label=_direction_label(_clamp(x), _clamp(y)),
        evidence=evidence,
    )


def _recruitment_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    hiring_plan = _text(responses.get("L1-4"))
    duration = _text(responses.get("2-2-1"))
    channel_count = _text(responses.get("2-2-2"))
    market = _text(responses.get("2-3-5"))
    x = 0.35 if hiring_plan.startswith("공격적") else -0.1
    if market == "하위":
        x -= 0.25
    elif market == "상위":
        x += 0.15
    y = 0.15
    if duration in ("4~6개월", "6개월 초과", "4개월 초과"):
        y -= 0.25
    if channel_count in ("1개", "1~2개"):
        y -= 0.2
    else:
        y += 0.15
    evidence = [
        f"채용 기조: {hiring_plan}",
        f"채용 소요 기간: {duration}",
        f"채용 채널 수: {channel_count}",
    ]
    return AlignmentMapVector(
        domain_id="recruitment",
        domain_name="채용",
        x=_clamp(x),
        y=_clamp(y),
        magnitude=min(1.0, 0.55 + abs(x) * 0.25 + abs(y) * 0.2),
        direction_label=_direction_label(_clamp(x), _clamp(y)),
        evidence=evidence,
    )


def _retention_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    turnover = _text(responses.get("2-1-1"))
    core_loss = _text(responses.get("2-1-2"))
    early_quit = _text(responses.get("2-1-3"))
    x = -0.25
    if core_loss in ("2~3명", "4명 이상"):
        x += 0.25
    if turnover in ("20% 초과", "20% 이상"):
        x += 0.15
    y = 0.25
    if turnover == "모름 / 측정 안 함" or early_quit == "모름 / 측정 안 함":
        y -= 0.45
    evidence = [
        f"자발적 이직률: {turnover}",
        f"핵심 인재 이탈: {core_loss}",
        f"조기 퇴사율: {early_quit}",
    ]
    return AlignmentMapVector(
        domain_id="retention",
        domain_name="인력",
        x=_clamp(x),
        y=_clamp(y),
        magnitude=min(1.0, 0.5 + abs(x) * 0.25 + abs(y) * 0.25),
        direction_label=_direction_label(_clamp(x), _clamp(y)),
        evidence=evidence,
    )


def _leadership_vector(responses: dict[str, Any]) -> AlignmentMapVector:
    feedback = _text(responses.get("2-5-1"))
    one_on_one = _text(responses.get("2-5-2"))
    hiring_approval = _text(responses.get("2-5-4"))
    release_decision = _text(responses.get("2-5-5"))
    core_values = _text(responses.get("2-5-6"))
    ceo_bottleneck = "CEO가 모든 인원" in hiring_approval or release_decision == "CEO 최종 승인 필요"
    x = -0.2
    if ceo_bottleneck:
        x += 0.35
    if one_on_one == "운영함":
        x -= 0.15
    y = 0.2
    if ceo_bottleneck:
        y -= 0.25
    if core_values == "명확한 기준으로 작동함":
        y += 0.35
    elif core_values == "문서로만 존재함":
        y -= 0.2
    if feedback == "대부분 객관적으로 잘 수행함":
        y += 0.15
    evidence = [
        f"리더 피드백: {feedback}",
        f"1on1: {one_on_one}",
        f"의사결정 구조: {release_decision}",
    ]
    return AlignmentMapVector(
        domain_id="leadership",
        domain_name="리더십",
        x=_clamp(x),
        y=_clamp(y),
        magnitude=min(1.0, 0.5 + abs(x) * 0.2 + abs(y) * 0.3),
        direction_label=_direction_label(_clamp(x), _clamp(y)),
        evidence=evidence,
    )
```

- [ ] **Step 3: Add dispersion and conflict calculation**

Add:

```python
def _distance(a: AlignmentMapVector, b: AlignmentMapVector) -> float:
    return math.hypot(a.x - b.x, a.y - b.y)


def _build_conflicts(vectors: list[AlignmentMapVector], responses: dict[str, Any]) -> list[AlignmentMapConflict]:
    by_id = {vector.domain_id: vector for vector in vectors}
    conflicts: list[AlignmentMapConflict] = []
    compensation = by_id["compensation"]
    evaluation = by_id["evaluation"]
    recruitment = by_id["recruitment"]
    leadership = by_id["leadership"]

    if compensation.x >= 0.35 and evaluation.y <= 0.15:
        conflicts.append(
            AlignmentMapConflict(
                id="reward_points_to_performance_eval_points_to_low_basis",
                title="보상은 성과주의를 말하지만, 평가 근거가 따라오지 않습니다.",
                detail="보상 화살표는 성과·시장 방향인데 평가 화살표가 제도·데이터 방향으로 충분히 올라오지 못하면 차등 보상이 재량처럼 보일 수 있습니다.",
                domains=("compensation", "evaluation"),
                severity="high",
            )
        )

    if recruitment.x >= 0.25 and compensation.x <= 0.1:
        conflicts.append(
            AlignmentMapConflict(
                id="hiring_points_to_growth_reward_points_to_low_market",
                title="채용은 확장을 보지만, 보상 메시지가 후보자를 설득하기 어렵습니다.",
                detail="공격적 채용을 하려면 오퍼와 보상 철학이 같은 방향을 봐야 합니다. 보상 경쟁력이 낮으면 채용 속도는 계획보다 느려집니다.",
                domains=("recruitment", "compensation"),
                severity="high",
            )
        )

    if evaluation.x >= 0.25 and leadership.y <= 0.05:
        conflicts.append(
            AlignmentMapConflict(
                id="evaluation_points_to_performance_leadership_points_to_bottleneck",
                title="평가는 성과 기준을 요구하지만, 리더 운영은 병목에 가깝습니다.",
                detail="성과 기준을 세워도 리더가 피드백과 의사결정을 감당하지 못하면 제도는 문서로만 남습니다.",
                domains=("evaluation", "leadership"),
                severity="medium",
            )
        )

    if not conflicts:
        conflicts.append(
            AlignmentMapConflict(
                id="no_major_vector_conflict",
                title="큰 방향 충돌은 제한적입니다.",
                detail="현재 입력 기준으로는 제도 방향이 크게 흩어지지 않았습니다. 세부 실행 부담은 영역별 상세 분석에서 확인합니다.",
                domains=tuple(vector.domain_id for vector in vectors[:2]),
                severity="low",
            )
        )

    return conflicts[:3]


def analyze_alignment_map(responses: dict[str, Any], areas: list[Any]) -> AlignmentMapAnalysis:
    """Return vector map analysis for the result summary."""
    _ = areas
    vectors = [
        _compensation_vector(responses),
        _evaluation_vector(responses),
        _recruitment_vector(responses),
        _retention_vector(responses),
        _leadership_vector(responses),
    ]
    centroid_x = sum(vector.x for vector in vectors) / len(vectors)
    centroid_y = sum(vector.y for vector in vectors) / len(vectors)
    dispersion = sum(math.hypot(vector.x - centroid_x, vector.y - centroid_y) for vector in vectors) / len(vectors)
    alignment_score = max(0, min(100, round(100 - dispersion * 70)))
    if alignment_score >= 75:
        level = "대체로 정합"
        headline = "제도들이 대체로 같은 방향을 보고 있습니다."
    elif alignment_score >= 55:
        level = "정렬 필요"
        headline = "일부 제도가 서로 다른 방향을 보고 있습니다."
    else:
        level = "엇박자 큼"
        headline = "핵심 제도들이 각자 다른 방향을 보고 있습니다."
    conflicts = _build_conflicts(vectors, responses)
    summary = (
        "화살표가 한곳으로 모이면 정합성이 높고, 서로 다른 사분면으로 흩어지면 실행 과정에서 메시지 충돌이 커집니다. "
        "이 맵은 좋은 제도를 고르는 화면이 아니라 현재 제도들이 같은 조직 철학을 향하는지 확인하는 화면입니다."
    )
    return AlignmentMapAnalysis(
        alignment_score=alignment_score,
        alignment_level=level,
        dispersion=round(dispersion, 3),
        centroid_x=round(centroid_x, 3),
        centroid_y=round(centroid_y, 3),
        headline=headline,
        summary=summary,
        vectors=vectors,
        conflicts=conflicts,
    )
```

- [ ] **Step 4: Run engine tests**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_alignment_map.py -q
```

Expected: first three tests pass, API inclusion test still fails because schema/API are not wired.

---

## Task 3: API Schema And Diagnose Wiring

**Files:**
- Modify: `backend/app/schemas/analysis.py`
- Modify: `backend/app/api/diagnose.py`
- Test: `backend/core_tests/test_alignment_map.py`
- Test: `backend/core_tests/test_alignment_engine.py`

- [ ] **Step 1: Add Pydantic models**

Add to `backend/app/schemas/analysis.py` after `AlignmentOut`:

```python
class AlignmentMapVectorOut(BaseModel):
    domain_id: str
    domain_name: str
    x: float
    y: float
    magnitude: float
    direction_label: str
    evidence: list[str]


class AlignmentMapConflictOut(BaseModel):
    id: str
    title: str
    detail: str
    domains: list[str]
    severity: str


class AlignmentMapOut(BaseModel):
    alignment_score: int
    alignment_level: str
    dispersion: float
    centroid_x: float
    centroid_y: float
    headline: str
    summary: str
    vectors: list[AlignmentMapVectorOut]
    conflicts: list[AlignmentMapConflictOut]
```

Add the field to `DiagnoseResponse`:

```python
class DiagnoseResponse(BaseModel):
    areas: list[AreaAnalysisOut]
    visibility: VisibilityOut
    matrix: MatrixOut
    alignment: AlignmentOut
    alignment_map: AlignmentMapOut
    insights: list[InsightOut]
```

- [ ] **Step 2: Wire diagnose endpoint**

In `backend/app/api/diagnose.py`, add imports:

```python
from app.core.alignment_map import analyze_alignment_map
```

Add schema imports:

```python
AlignmentMapConflictOut,
AlignmentMapOut,
AlignmentMapVectorOut,
```

After `alignment_out`, add:

```python
    alignment_map = analyze_alignment_map(responses, areas)
    alignment_map_out = AlignmentMapOut(
        alignment_score=alignment_map.alignment_score,
        alignment_level=alignment_map.alignment_level,
        dispersion=alignment_map.dispersion,
        centroid_x=alignment_map.centroid_x,
        centroid_y=alignment_map.centroid_y,
        headline=alignment_map.headline,
        summary=alignment_map.summary,
        vectors=[
            AlignmentMapVectorOut(
                domain_id=vector.domain_id,
                domain_name=vector.domain_name,
                x=vector.x,
                y=vector.y,
                magnitude=vector.magnitude,
                direction_label=vector.direction_label,
                evidence=vector.evidence,
            )
            for vector in alignment_map.vectors
        ],
        conflicts=[
            AlignmentMapConflictOut(
                id=conflict.id,
                title=conflict.title,
                detail=conflict.detail,
                domains=list(conflict.domains),
                severity=conflict.severity,
            )
            for conflict in alignment_map.conflicts
        ],
    )
```

Return:

```python
    return DiagnoseResponse(
        areas=areas_out,
        visibility=visibility_out,
        matrix=matrix_out,
        alignment=alignment_out,
        alignment_map=alignment_map_out,
        insights=insights_out,
    )
```

- [ ] **Step 3: Run backend tests**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_alignment_map.py core_tests/test_alignment_engine.py -q
```

Expected: all selected tests pass.

- [ ] **Step 4: Commit backend contract**

Run:

```powershell
git add backend/app/core/alignment_map.py backend/app/schemas/analysis.py backend/app/api/diagnose.py backend/core_tests/test_alignment_map.py
git commit -m "feat: add alignment map analysis contract"
```

Expected: commit succeeds.

---

## Task 4: Frontend Types And Company Context Bar

**Files:**
- Modify: `frontend/lib/types/api.ts`
- Create: `frontend/components/result/CompanyContextBar.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`

- [ ] **Step 1: Add API types**

Add to `frontend/lib/types/api.ts`:

```ts
export interface AlignmentMapVectorOut {
  domain_id: string;
  domain_name: string;
  x: number;
  y: number;
  magnitude: number;
  direction_label: string;
  evidence: string[];
}

export interface AlignmentMapConflictOut {
  id: string;
  title: string;
  detail: string;
  domains: string[];
  severity: string;
}

export interface AlignmentMapOut {
  alignment_score: number;
  alignment_level: string;
  dispersion: number;
  centroid_x: number;
  centroid_y: number;
  headline: string;
  summary: string;
  vectors: AlignmentMapVectorOut[];
  conflicts: AlignmentMapConflictOut[];
}
```

Add to `DiagnoseResponse`:

```ts
  alignment_map: AlignmentMapOut;
```

- [ ] **Step 2: Create CompanyContextBar**

Create `frontend/components/result/CompanyContextBar.tsx`:

```tsx
import { Badge } from "@/components/shared/Badge";
import type { ResponseValue } from "@/lib/store/responses";

interface CompanyContextBarProps {
  companyName: string;
  responses: Record<string, ResponseValue>;
}

function textValue(value: ResponseValue | undefined, fallback: string): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return fallback;
  return value === undefined || value === "" ? fallback : String(value);
}

export function CompanyContextBar({ companyName, responses }: CompanyContextBarProps) {
  const name = companyName || "우리 회사";
  const headcount = textValue(responses["L1-2"], "규모 미입력");
  const industry = textValue(responses["L1-5"], "산업 미입력");
  const hiring = textValue(responses["L1-4"], "채용 기조 미입력");

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white px-4 py-3 print:break-inside-avoid">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">회사 맥락</p>
          <p className="m-0 mt-1 text-[13px] leading-[1.6] text-slate-700">
            <strong className="font-[720] text-slate-900">{name}</strong>의 정합성은 같은 제도라도 규모, 산업, 성장 속도에 따라 다르게 해석합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="slate">{headcount}</Badge>
          <Badge variant="teal">{industry}</Badge>
          <Badge variant="amber">{hiring}</Badge>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Mount CompanyContextBar on result page**

In `frontend/app/(analysis)/result/page.tsx`, import:

```tsx
import { CompanyContextBar } from "@/components/result/CompanyContextBar";
import { useResponsesStore } from "@/lib/store/responses";
```

Inside `ResultPage`:

```tsx
  const responses = useResponsesStore((state) => state.responses);
```

Render immediately after `PageHeader`:

```tsx
      <CompanyContextBar companyName={companyName} responses={responses} />
```

- [ ] **Step 4: Run frontend typecheck**

Run:

```powershell
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

---

## Task 5: Alignment Map Visualization And Result IA

**Files:**
- Create: `frontend/components/visualization/AlignmentMap.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`

- [ ] **Step 1: Create AlignmentMap component**

Create `frontend/components/visualization/AlignmentMap.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { logEvent } from "@/lib/api/events";
import { useSessionStore } from "@/lib/store/session";
import type { AlignmentMapOut, AlignmentMapVectorOut } from "@/lib/types/api";

interface AlignmentMapProps {
  map: AlignmentMapOut;
}

const DOMAIN_COLORS: Record<string, string> = {
  compensation: "#c96f5a",
  evaluation: "#c9822b",
  recruitment: "#2f8f86",
  retention: "#2f7d5f",
  leadership: "#334155",
};

const X0 = 54;
const X1 = 526;
const Y0 = 42;
const Y1 = 358;
const CX = 290;
const CY = 200;

function sx(value: number): number {
  return CX + Math.max(-1, Math.min(1, value)) * ((X1 - X0) / 2);
}

function sy(value: number): number {
  return CY - Math.max(-1, Math.min(1, value)) * ((Y1 - Y0) / 2);
}

function vectorEnd(vector: AlignmentMapVectorOut) {
  const length = Math.max(0.18, vector.magnitude);
  return {
    x: sx(vector.x * length),
    y: sy(vector.y * length),
  };
}

function scoreVariant(score: number): "teal" | "amber" | "coral" {
  if (score >= 75) return "teal";
  if (score >= 55) return "amber";
  return "coral";
}

export function AlignmentMap({ map }: AlignmentMapProps) {
  const sessionId = useSessionStore((state) => state.sessionId);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const activeVector = useMemo(
    () => map.vectors.find((vector) => vector.domain_id === activeDomain) ?? map.vectors[0],
    [activeDomain, map.vectors],
  );

  const handleConflictClick = (conflictId: string) => {
    if (!sessionId) return;
    logEvent({
      session_id: sessionId,
      event_type: "alignment_conflict_click",
      page: "/result",
      metadata: { conflict_id: conflictId },
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <section className="mb-[18px] rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">정합성 맵</p>
          <h2 className="m-0 mt-2 text-[20px] font-[720] leading-[1.35] text-slate-900">{map.headline}</h2>
          <p className="m-0 mt-2 max-w-[820px] text-[12px] leading-[1.7] text-slate-600">{map.summary}</p>
        </div>
        <div className="min-w-[132px] rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-right">
          <p className="m-0 text-[11px] font-[760] text-slate-400">방향 일치도</p>
          <p className="m-0 mt-1 text-[34px] font-[720] leading-none text-slate-900">{map.alignment_score}</p>
          <Badge variant={scoreVariant(map.alignment_score)}>{map.alignment_level}</Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <svg viewBox="0 0 580 410" className="h-auto w-full rounded-[10px] border border-slate-200 bg-[#fffdf8]" role="img" aria-label="정합성 맵">
          <defs>
            <marker id="alignment-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
            <style>{`.alignment-label{paint-order:stroke;stroke:#fffdf8;stroke-width:4px;stroke-linejoin:round;}`}</style>
          </defs>
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="10" fill="#ffffff" stroke="#e2e8f0" />
          <line x1={X0} y1={CY} x2={X1} y2={CY} stroke="#cbd5e1" />
          <line x1={CX} y1={Y0} x2={CX} y2={Y1} stroke="#cbd5e1" />
          <text x={X0} y={CY - 10} fontSize="11" fontWeight="700" fill="#64748b">공동체·장기 신뢰</text>
          <text x={X1} y={CY - 10} textAnchor="end" fontSize="11" fontWeight="700" fill="#64748b">성과·시장 경쟁</text>
          <text x={CX + 10} y={Y0 + 18} fontSize="11" fontWeight="700" fill="#64748b">제도·데이터 기반</text>
          <text x={CX + 10} y={Y1 - 12} fontSize="11" fontWeight="700" fill="#64748b">관계·자율 운영</text>
          <circle cx={sx(map.centroid_x)} cy={sy(map.centroid_y)} r="8" fill="#111827" opacity=".16" />
          <text x={sx(map.centroid_x) + 12} y={sy(map.centroid_y) + 4} fontSize="10" fontWeight="700" fill="#64748b">평균 방향</text>
          {map.vectors.map((vector) => {
            const end = vectorEnd(vector);
            const color = DOMAIN_COLORS[vector.domain_id] ?? "#334155";
            return (
              <g key={vector.domain_id} onMouseEnter={() => setActiveDomain(vector.domain_id)} onFocus={() => setActiveDomain(vector.domain_id)}>
                <line x1={CX} y1={CY} x2={end.x} y2={end.y} stroke={color} strokeWidth="3" strokeLinecap="round" markerEnd="url(#alignment-arrow)" opacity={activeDomain && activeDomain !== vector.domain_id ? 0.36 : 0.95} />
                <circle cx={end.x} cy={end.y} r="6" fill={color} />
                <text x={end.x} y={end.y - 12} textAnchor="middle" className="alignment-label" fontSize="11" fontWeight="760" fill={color}>{vector.domain_name}</text>
              </g>
            );
          })}
        </svg>

        <aside className="grid gap-3">
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">선택 영역</p>
            <h3 className="m-0 mt-2 text-[15px] font-[720] text-slate-900">{activeVector.domain_name} · {activeVector.direction_label}</h3>
            <ul className="m-0 mt-2 grid gap-1.5 p-0 text-[12px] leading-[1.55] text-slate-600">
              {activeVector.evidence.map((item) => (
                <li key={item} className="list-none">- {item}</li>
              ))}
            </ul>
          </div>
          {map.conflicts.slice(0, 2).map((conflict) => (
            <button
              key={conflict.id}
              type="button"
              onClick={() => handleConflictClick(conflict.id)}
              className="rounded-[10px] border border-amber/25 bg-[#fffaf0] p-3 text-left"
            >
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">엇박자 포인트</p>
              <h3 className="m-0 mt-2 text-[14px] font-[700] leading-[1.45] text-slate-900">{conflict.title}</h3>
              <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">{conflict.detail}</p>
            </button>
          ))}
        </aside>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Place map at the top of result page**

In `frontend/app/(analysis)/result/page.tsx`, import:

```tsx
import { AlignmentMap } from "@/components/visualization/AlignmentMap";
```

Change:

```tsx
  const { areas, visibility, insights, alignment } = data;
```

to:

```tsx
  const { areas, visibility, insights, alignment, alignment_map } = data;
```

Render immediately after `CompanyContextBar`:

```tsx
      <AlignmentMap map={alignment_map} />
```

- [ ] **Step 3: Log alignment map view**

In the existing `result_view` `useEffect`, add:

```tsx
        alignment_map_score: data.alignment_map.alignment_score,
        alignment_map_level: data.alignment_map.alignment_level,
        alignment_map_dispersion: data.alignment_map.dispersion,
```

- [ ] **Step 4: Run frontend typecheck**

Run:

```powershell
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 5: Gate A user test**

Start servers:

```powershell
.\start_servers.ps1
```

Open `/result` and ask 강훈님:

```text
Gate A 확인 부탁드립니다.
1. 정합성 맵이 “제도들이 각자 다른 방향을 본다”는 느낌을 주나요?
2. 축 이름이 대표/Head of People에게 직관적인가요?
3. 보상 엇박자 다음에 보상 시뮬레이터가 붙을 이유가 자연스럽게 느껴지나요?
```

Expected: 강훈님이 맵 축/카피/배치 피드백을 준다. 받은 피드백은 Task 6에서 반영한다.

---

## Task 6: Gate A Refinement Pass

**Files:**
- Modify: `backend/app/core/alignment_map.py`
- Modify: `frontend/components/visualization/AlignmentMap.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`

- [ ] **Step 1: Apply axis wording refinements**

Use one of these exact axis label sets based on Gate A feedback:

```text
Option A:
X-left: 공동체·장기 신뢰
X-right: 성과·시장 경쟁
Y-top: 제도·데이터 기반
Y-bottom: 관계·자율 운영

Option B:
X-left: 안정·리텐션
X-right: 성과·채용 경쟁
Y-top: 명문화·운영 기준
Y-bottom: 암묵지·관계 중심
```

Update both SVG labels and `alignment_map.py` direction labels so backend text and frontend axes match.

- [ ] **Step 2: Tune vector thresholds**

If all arrows cluster too much near center, change each vector `magnitude` minimum from `0.5` or `0.55` to `0.62`.

If arrows look too extreme, cap end rendering in `AlignmentMap.tsx`:

```tsx
const length = Math.max(0.18, Math.min(0.86, vector.magnitude));
```

- [ ] **Step 3: Re-run backend/frontend checks**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_alignment_map.py -q
cd ..\frontend
npm.cmd run typecheck
```

Expected: all pass.

- [ ] **Step 4: Commit Aha visual**

Run:

```powershell
git add backend/app/core/alignment_map.py frontend/components/visualization/AlignmentMap.tsx frontend/app/(analysis)/result/page.tsx frontend/lib/types/api.ts frontend/components/result/CompanyContextBar.tsx
git commit -m "feat: surface alignment map aha moment"
```

Expected: commit succeeds.

---

## Task 7: Roadmap Data Model Expansion

**Files:**
- Modify: `backend/app/content/scenarios.json`
- Modify: `backend/tests/test_content_endpoints.py`

- [ ] **Step 1: Expand scenario next_steps structure**

For each scenario in `backend/app/content/scenarios.json`, replace each `next_steps` item:

```json
{
  "step": "1단계 (1~2개월)",
  "action": "평가 프레임워크 설계 (OKR 목표 설정 워크숍)"
}
```

with:

```json
{
  "step": "1단계",
  "period": "0~1개월",
  "title": "도입 조건 정리",
  "precondition": "현재 데이터와 의사결정 기준을 한 장으로 정리한다.",
  "core_action": "경영진 60분 세션에서 이번 전환의 목적, 바꾸지 않을 것, 보류할 제도를 합의한다.",
  "success_metric": "경영진과 리더가 같은 기준표를 보고 보상, 평가, 채용 우선순위를 설명할 수 있다.",
  "risk": "기준 정리 없이 제도 이름부터 정하면 구성원에게 또 다른 인사 이벤트로 보인다.",
  "weekly_actions": [
    "월요일: 최근 12개월 이직률, 채용 소요 기간, 보상 시장 위치 데이터를 한 파일에 모은다.",
    "수요일: CEO와 리더 2명 이상이 보상, 평가, 채용 중 먼저 정렬할 영역을 1개 고른다.",
    "금요일: 파일럿에 올릴 제도와 보류할 제도를 구분해 1페이지 메모로 남긴다."
  ]
}
```

Use these scenario-specific `core_action` replacements:

```text
performance 2단계: 1개 조직에서 OKR 목표 설정과 평가 피드백 기록을 먼저 시험 운영한다.
performance 3단계: 평가 결과 설명 기준이 안정된 뒤 성과급과 보상 밴드 연동 범위를 정한다.
performance 4단계: 리더별 평가 편차와 보상 이의제기 패턴을 월간으로 확인한다.

community 2단계: 격주 1on1과 온보딩 30/60/90 체크포인트를 한 팀에서 시험 운영한다.
community 3단계: 컬처핏 면접 기준과 팀 인센티브 지급 원칙을 연결한다.
community 4단계: 이탈률, 조기퇴사율, 팀 몰입 신호를 월간으로 확인한다.

elite 2단계: 핵심 인재 정의와 9-Box Grid 기준을 소수 리더 그룹에서 먼저 맞춘다.
elite 3단계: 핵심 인재 보상 밴드와 전결권 위임 기준을 함께 문서화한다.
elite 4단계: 핵심 인재 이탈률과 내부 형평성 이슈를 월간으로 확인한다.
```

For 5단계, use:

```text
12개월 결과를 보고 유지할 제도, 수정할 제도, 되돌릴 제도를 구분한다.
```

- [ ] **Step 2: Add content endpoint assertions**

In `backend/tests/test_content_endpoints.py`, inside `test_get_scenarios`, add:

```python
        for next_step in scenario["next_steps"]:
            assert "step" in next_step
            assert "period" in next_step
            assert "title" in next_step
            assert "precondition" in next_step
            assert "core_action" in next_step
            assert "success_metric" in next_step
            assert "risk" in next_step
            assert "weekly_actions" in next_step
            assert isinstance(next_step["weekly_actions"], list)
```

- [ ] **Step 3: Run content tests**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest tests/test_content_endpoints.py -q
```

Expected: PASS.

---

## Task 8: Roadmap Renderer Upgrade

**Files:**
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
- Create: `frontend/components/roadmap/WeeklyActionList.tsx`
- Modify: `frontend/app/(analysis)/roadmap/page.tsx`

- [ ] **Step 1: Update frontend ScenarioNextStep type**

In `RoadmapTimeline.tsx`, replace:

```tsx
interface ScenarioNextStep {
  step: string;
  action: string;
}
```

with:

```tsx
interface ScenarioNextStep {
  step: string;
  period: string;
  title: string;
  precondition: string;
  core_action: string;
  success_metric: string;
  risk: string;
  weekly_actions: string[];
}
```

- [ ] **Step 2: Create weekly action component**

Create `frontend/components/roadmap/WeeklyActionList.tsx`:

```tsx
import { GlossaryText } from "@/components/shared/GlossaryText";

interface WeeklyActionListProps {
  actions: string[];
}

export function WeeklyActionList({ actions }: WeeklyActionListProps) {
  if (actions.length === 0) return null;

  return (
    <div className="mt-4 rounded-[10px] border border-teal-line bg-teal-soft p-3">
      <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal-deep">이번 주 실행 액션</p>
      <div className="mt-2 grid gap-2">
        {actions.map((action) => (
          <div key={action} className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 text-[12px] leading-[1.6] text-slate-700">
            <span className="mt-[3px] h-[13px] w-[13px] rounded-[4px] border border-teal bg-white" />
            <span><GlossaryText text={action} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Use expanded next_steps in phase builder**

In `RoadmapTimeline.tsx`, import:

```tsx
import { WeeklyActionList } from "@/components/roadmap/WeeklyActionList";
```

In `buildPhases`, for each phase, use `nextSteps[index]` directly:

```tsx
const step = nextSteps[index];
```

Map fields:

```tsx
intent: step?.title ?? PHASE_LABELS[index].label,
goal: step?.precondition ?? "실행 조건과 판단 기준을 정리합니다.",
policy: step?.core_action ?? joinActions(firstPolicies, "핵심 제도 실행안을 정리합니다."),
metric: step?.success_metric ?? primaryMetric,
hedge: step?.risk ?? warnings[index] ?? "수용성과 운영 부담을 함께 확인합니다.",
deliverable: step ? `${step.title} 실행 메모` : "실행 의사결정 메모",
weeklyActions: step?.weekly_actions ?? [],
```

Add `weeklyActions: string[]` to `RoadmapPhase`.

- [ ] **Step 4: Render four roadmap elements explicitly**

Inside open phase details, replace current labels with:

```tsx
<RoadmapField label="선행 조건" value={phase.goal} />
<RoadmapField label="핵심 액션" value={phase.policy} />
<RoadmapField label="성공 지표" value={phase.metric} />
<RoadmapField label="리스크" value={phase.hedge} />
```

Render weekly actions only for first phase:

```tsx
{index === 0 ? <WeeklyActionList actions={phase.weeklyActions} /> : null}
```

- [ ] **Step 5: Update roadmap page copy**

In `frontend/app/(analysis)/roadmap/page.tsx`, replace `lead` with:

```tsx
lead="이 화면은 제도 이름을 나열하는 자료가 아니라, 경영진이 이번 주부터 무엇을 확인하고 어떤 조건에서 다음 단계로 넘어갈지 판단하기 위한 실행표입니다."
```

- [ ] **Step 6: Run frontend typecheck**

Run:

```powershell
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 7: Gate B user test**

Start servers and ask 강훈님:

```text
Gate B 확인 부탁드립니다.
1. 로드맵 1단계가 이번 주 실행 수준까지 충분히 구체적인가요?
2. 각 단계의 선행 조건/핵심 액션/성공 지표/리스크가 경영회의 자료로 쓸 만한가요?
3. 보상 구조 시뮬레이터 없이도 “다음에 무엇을 해야 하는지”가 보이나요?
```

Expected: 로드맵 카피와 액션 구체성 피드백을 받는다.

---

## Task 9: Event Logging Expansion

**Files:**
- Modify: `frontend/components/visualization/AlignmentMap.tsx`
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
- Modify: `frontend/app/(analysis)/scenarios/page.tsx`
- Test: `backend/tests/test_events_endpoint.py`

- [ ] **Step 1: Log alignment map view**

In `AlignmentMap.tsx`, add:

```tsx
import { useEffect } from "react";
```

Inside component:

```tsx
  useEffect(() => {
    if (!sessionId) return;
    logEvent({
      session_id: sessionId,
      event_type: "alignment_map_view",
      page: "/result",
      metadata: {
        alignment_score: map.alignment_score,
        alignment_level: map.alignment_level,
        dispersion: map.dispersion,
      },
      timestamp: new Date().toISOString(),
    });
  }, [map.alignment_level, map.alignment_score, map.dispersion, sessionId]);
```

- [ ] **Step 2: Log roadmap phase open**

In `RoadmapTimeline.tsx`, import:

```tsx
import { logEvent } from "@/lib/api/events";
import { useSessionStore } from "@/lib/store/session";
```

Inside component:

```tsx
  const sessionId = useSessionStore((state) => state.sessionId);
```

Inside `togglePhase`, after state update:

```tsx
    if (sessionId) {
      logEvent({
        session_id: sessionId,
        event_type: "roadmap_phase_toggle",
        page: "/roadmap",
        metadata: { phase: label },
        timestamp: new Date().toISOString(),
      });
    }
```

- [ ] **Step 3: Ensure scenario switch is logged**

If `/scenarios` already logs scenario selection, keep the existing event. If not, add a `scenario_switch` event in the scenario card `onSelect` handler with:

```tsx
metadata: { scenario_id: id }
```

- [ ] **Step 4: Run event endpoint test**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest tests/test_events_endpoint.py -q
```

Expected: PASS.

---

## Task 10: iPad Responsive Pass

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/(analysis)/layout.tsx`
- Modify: `frontend/app/diagnose/layout.tsx`
- Modify: `frontend/components/visualization/AlignmentMap.tsx`
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`

- [ ] **Step 1: Hide rail earlier for tablet demo**

In `frontend/app/globals.css`, change:

```css
@media (max-width: 980px) {
```

to:

```css
@media (max-width: 1180px) {
```

- [ ] **Step 2: Reduce analysis padding on tablet**

In both layouts, change:

```tsx
<section className="min-w-0 overflow-x-hidden p-6 sm:p-9">{children}</section>
```

to:

```tsx
<section className="min-w-0 overflow-x-hidden p-4 sm:p-6 xl:p-9">{children}</section>
```

- [ ] **Step 3: Protect SVG containers**

For `AlignmentMap.tsx` and `RoadmapTimeline.tsx`, ensure outer sections include:

```tsx
className="w-full max-w-[calc(100vw-32px)] overflow-hidden ... sm:max-w-full"
```

Use this only on sections that can exceed viewport width.

- [ ] **Step 4: Run frontend typecheck**

Run:

```powershell
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 5: Gate C visual QA**

Start servers:

```powershell
.\start_servers.ps1
```

Check these viewports:

```text
1024x768
820x1180
1366x768
```

Routes:

```text
/result
/matrix
/scenarios
/roadmap
```

Expected:
- No horizontal scrollbar.
- 정합성 맵 labels do not overlap core arrows.
- Roadmap phase cards fit without clipped text.
- Rail is hidden on iPad widths.

---

## Task 11: Deployment Preparation

**Files:**
- Modify: `README.md`
- Modify: `backend/app/main.py`
- Modify: `frontend/next.config.ts`
- Create: `docs/deployment.md`

- [ ] **Step 1: Restrict CORS through environment variable**

In `backend/app/main.py`, import:

```python
import os
```

Replace:

```python
allow_origins=["*"],
```

with:

```python
allow_origins=os.getenv("CORS_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000").split(","),
```

- [ ] **Step 2: Add deployment doc**

Create `docs/deployment.md`:

```markdown
# Deployment Notes

## Frontend: Vercel

Root Directory: `frontend`

Environment Variables:

```text
NEXT_PUBLIC_API_URL=https://<render-service-url>
```

Build Command:

```text
npm run build
```

## Backend: Render

Root Directory: `backend`

Build Command:

```text
pip install -r requirements.txt
```

Start Command:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment Variables:

```text
CORS_ORIGINS=https://<vercel-project-url>,http://127.0.0.1:3000,http://localhost:3000
```

Health Check:

```text
/health
```

## Smoke Test

1. Open frontend URL.
2. Start a new diagnosis.
3. Complete context and diagnosis inputs.
4. Open `/result`.
5. Confirm 정합성 맵 appears above radar chart.
6. Open `/roadmap`.
7. Confirm first phase includes weekly actions.
```

- [ ] **Step 3: Update README with local/deploy split**

Add a short section:

```markdown
## Local And Deployment

Local demo uses `start_servers.ps1`.

Hosted demo uses:
- Vercel for `frontend/`
- Render for `backend/`

See `docs/deployment.md` for environment variables and smoke test steps.
```

- [ ] **Step 4: Run backend and frontend verification**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest tests core_tests -q
cd ..\frontend
npm.cmd run typecheck
npm.cmd run build
```

Expected: backend tests pass, frontend typecheck and build pass.

---

## Task 12: Final Verification And Handoff

**Files:**
- Modify only if verification reveals issues.

- [ ] **Step 1: Full backend tests**

Run:

```powershell
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest tests core_tests -q
```

Expected: all pass.

- [ ] **Step 2: Frontend typecheck and build**

Run:

```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run build
```

Expected: PASS.

- [ ] **Step 3: Local smoke test**

Run:

```powershell
.\start_servers.ps1
```

Check:

```text
/
/diagnose/context
/result
/result/detail
/matrix
/scenarios
/roadmap
```

Expected:
- `/result` first screen starts with company context and 정합성 맵.
- Radar chart is visible after the Aha visual, not before it.
- 정합성 맵 conflict cards are clickable and log events.
- `/roadmap` first phase includes weekly actions.
- iPad widths do not show horizontal overflow.

- [ ] **Step 4: Summarize follow-up sprint**

Write final handoff note:

```text
후속 스프린트 1순위: 보상 구조 시뮬레이터.
진입 조건: 정합성 맵에서 보상 관련 conflict가 노출되고, 사용자가 “그래서 보상을 어떻게 바꿔야 하느냐”로 자연스럽게 이동할 수 있어야 함.
연결 위치: 정합성 맵 conflict card 또는 보상 상세 분석 페이지 하단.
```

- [ ] **Step 5: Commit final sprint**

Run:

```powershell
git status --short
git add backend frontend docs README.md
git commit -m "feat: build aha moment alignment map"
```

Expected: commit succeeds after all verification passes.

---

## Self-Review

**Spec coverage:** 피드백의 1순위인 정합성 맵, 회사 맥락화, 로드맵 구체화, iPad 대응, 배포 준비가 각각 Task 1~12에 매핑되어 있다. 보상 구조 시뮬레이터는 Scope Guard와 Task 12 후속 스프린트 메모로 순서를 고정했다.

**Placeholder scan:** 이 계획에는 `TBD`, `TODO`, 빈 구현 지시, “알아서 처리” 지시가 없다. 코드 변경 단계는 파일, 삽입 위치, 코드 조각, 검증 명령을 포함한다.

**Type consistency:** Backend schema 이름은 `AlignmentMapOut`, frontend 타입 이름도 `AlignmentMapOut`으로 맞췄다. API 응답 필드는 `alignment_map`으로 통일했다. Domain id는 기존 area id(`compensation`, `evaluation`, `recruitment`, `retention`, `leadership`)를 그대로 사용한다.

**Execution note:** Task 5, Task 8, Task 10 뒤에는 강훈님 테스트와 피드백을 받아야 한다. 그 피드백 없이 보상 구조 시뮬레이터로 넘어가지 않는다.
