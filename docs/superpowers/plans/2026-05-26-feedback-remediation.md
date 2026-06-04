# 260526 Feedback Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-05-26 피드백을 누락 없이 반영해 Transition Gap을 "문항 입력 → 정합성 진단 → 트레이드오프 → 시나리오 → 로드맵" 흐름이 실제 컨설팅 판단 도구처럼 읽히고 작동하게 만든다.

**Architecture:** 먼저 피드백 추적표를 만들고, 컨펌이 필요한 핵심 분석 방향을 확정한 뒤, 백엔드 분석/스키마 변경과 프론트 UX/문구 변경을 작은 단위로 진행한다. 가장 큰 변경은 "정합성"을 단순 평균 점수가 아니라 제도 간 충돌을 드러내는 별도 분석 결과로 만드는 것이다.

**Tech Stack:** Next.js App Router, TypeScript, Zustand, TanStack Query, Tailwind CSS, FastAPI, Pydantic, Python 3.12, JSON content files.

---

## Current Diagnosis

현재 구현은 일부 이전 피드백이 반영되어 있으나, 260526 피드백 기준으로는 다음이 남아 있다.

- `정합성`은 현재 5개 영역 평균 또는 갭 중심으로 표시되며, "보상은 성과주의인데 평가/리더십이 받쳐주지 못함" 같은 제도 간 충돌을 별도 지수/근거로 충분히 보여주지 않는다.
- `To-Be` 좌표는 백엔드에서 L0 선택값을 `"A" / "B"`로 기대하지만 프론트는 실제 문장 값을 보내므로 대부분 0.5로 떨어질 가능성이 높다. Matrix B의 To-Be y값은 코드상 0.5로 고정되어 있다.
- 고정 기준점(`70/75/75/72/75`)은 조직 규모, 성장 기조, 철학에 따라 달라져야 한다는 피드백과 충돌한다.
- 문항/슬라이더 일부가 여전히 피드백 전 상태다: 인력·채용 설명, 총보상 `2-3-6`, 평가 공정성 슬라이더, 리더 의사결정 선택지.
- 결과 요약, 상세 분석, 트레이드오프, 시나리오 비교, 로드맵 전반에 "대표" 과사용, 모호한 워딩, 하단 이동 버튼 누락, 카드/뱃지 색상 불일치, 설명 중복이 남아 있다.
- PDF 저장은 아직 `window.print()` 수준이다. 사용자가 "급한 건 아님"이라고 했으므로 이번 pass에서는 진단/시나리오/로드맵 내용 픽스를 우선한다.

## Confirm Gates

아래 항목은 제품 방향 자체가 바뀌므로 구현 전에 강훈님 컨펌을 받아야 한다.

1. **정합성 분석 재정의**
   - 제안: `정합성 지수`를 단순 평균이 아니라 `영역 점수 평균 - 제도 간 충돌 페널티`로 재정의한다.
   - 예: 성과급/고성과 보상 지향 + 평가 데이터 없음 + 리더 피드백 약함 = "성과주의 메시지를 냈지만 실행 인프라가 없는 충돌".
   - 컨펌 질문: 이 정도로 코어 분석을 새로 얹어도 되는가?

2. **기준점 동적화**
   - 제안: 20인 이하/20~50/50~100/100인 이상, 채용 기조, L0 철학에 따라 영역별 기준점을 조정한다.
   - 예: 20인 이하에서는 인력 안정성/리더십 기준점을 낮추고, 100인 이상에서는 평가/리더십 기준점을 높인다.
   - 컨펌 질문: 지금 MVP에서 동적 기준점을 적용할 것인가, 아니면 "고정 기준점 + 해석 문구"로 먼저 갈 것인가?

3. **시나리오 추천 방식**
   - 제품 원칙상 "이 시나리오로 가십시오"는 금지다.
   - 제안: 추천 대신 `우선 검토 방향`, `충돌이 가장 적은 방향`, `비용이 큰 방향` 태그를 제공한다.
   - 컨펌 질문: "추천"이라는 단어를 쓰지 않는 태그 방식으로 충분한가?

4. **Matrix B 축 의미 정리**
   - 현재 UI 축과 백엔드 L0 매핑이 어긋나 있다.
   - 제안: Matrix B x축은 `자율/속도 ↔ 통제/절차`, y축은 `즉시전력 ↔ 조직적합성`으로 명확히 재정의하고 L0-2/L0-3을 각각 매핑한다.
   - 컨펌 질문: 축 재정의를 이번에 함께 고칠 것인가?

---

## File Map

- Create: `docs/feedback/260526_feedback_checklist.md`
- Create: `backend/app/core/alignment_engine.py`
- Modify: `backend/app/core/analysis_engine.py`
- Modify: `backend/app/core/trade_off.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `backend/app/schemas/analysis.py`
- Modify: `backend/app/schemas/responses.py`
- Modify: `backend/app/content/schema.json`
- Modify: `backend/app/content/scenarios.json`
- Modify: `backend/app/content/hr_options.json`
- Modify: `backend/app/content/implications.json`
- Modify: `frontend/lib/types/api.ts`
- Modify: `frontend/app/diagnose/context/page.tsx`
- Modify: `frontend/app/diagnose/workforce/page.tsx`
- Modify: `frontend/app/diagnose/rewards/page.tsx`
- Modify: `frontend/app/diagnose/evaluation/page.tsx`
- Modify: `frontend/components/forms/NumericSlider.tsx` or replace with segmented options where needed
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/components/landing/LandingHero.tsx`
- Modify: `frontend/components/landing/ProcessStrip.tsx`
- Modify: `frontend/components/landing/PreviewAside.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/components/result/MetricCard.tsx`
- Modify: `frontend/components/visualization/RadarChart.tsx`
- Modify: `frontend/components/visualization/GapBarList.tsx`
- Modify: `frontend/components/result/InsightCard.tsx`
- Modify: `frontend/app/(analysis)/result/detail/page.tsx`
- Modify: `frontend/components/detail/AreaSidebar.tsx`
- Modify: `frontend/components/detail/ScoreHero.tsx`
- Modify: `frontend/components/detail/BreakdownTable.tsx`
- Modify: `frontend/components/detail/AsIsToBePanel.tsx`
- Modify: `frontend/components/detail/BenchmarkRow.tsx`
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
- Modify: `frontend/components/visualization/MatrixSVG.tsx`
- Modify: `frontend/components/matrix/SelectedScenarioCard.tsx`
- Modify: `frontend/components/matrix/ScenarioFitTable.tsx`
- Modify: `frontend/app/(analysis)/scenarios/page.tsx`
- Modify: `frontend/components/scenario/ScenarioCard.tsx`
- Modify: `frontend/components/scenario/ScenarioComparisonTable.tsx`
- Modify: `frontend/components/scenario/ScenarioDetailPanel.tsx`
- Modify: `frontend/app/(analysis)/roadmap/page.tsx`
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
- Modify: `docs/decisions.md` only if a confirm gate changes product logic.

---

### Task 0: Feedback Tracking Checklist

**Files:**
- Create: `docs/feedback/260526_feedback_checklist.md`

- [ ] **Step 1: Create feedback checklist**

Create a checklist with every item from `C:\Users\bang0\OneDrive\바탕 화면\펜시브\펜시브\260526 수정.md`, grouped by:

```markdown
# 260526 Feedback Checklist

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done
- [?] Needs 강훈님 confirm

## 전반적
- [?] 정합성을 제도 간 충돌로 실제 계산하는지 확인하고, 필요 시 분석 로직을 재정의한다.

## 랜딩페이지
- [ ] 진단 흐름 보기가 실제 흐름도/상세 단계로 이동하거나 표시되게 한다.
- [ ] 미리보기 오른쪽 텍스트를 수직 가운데 정렬한다.
...
```

- [ ] **Step 2: Add a "Verification note" column**

Each row must include:

```markdown
| 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|
| 인력·채용 설명 문구가 어렵다 | `frontend/app/diagnose/workforce/page.tsx` | 문구 교체 | 화면에서 새 문구 확인 |
```

- [ ] **Step 3: Use this checklist after every task**

After each implementation task, update only the rows completed by that task.

---

### Task 1: Confirm Core Product Direction

**Files:**
- No code changes.
- Update only after approval: `docs/decisions.md`

- [ ] **Step 1: Ask 강훈님 four confirm-gate questions**

Ask exactly:

```text
1. 정합성 지수를 "영역 평균 점수"가 아니라 "영역 평균 - 제도 간 충돌 페널티"로 재정의해도 될까요?
2. 기준점을 조직 규모/성장 기조/철학에 따라 동적으로 조정해도 될까요?
3. 시나리오는 "추천" 대신 "우선 검토 방향 / 충돌이 적은 방향 / 비용이 큰 방향" 태그로 보여주는 게 맞을까요?
4. Matrix B 축과 To-Be 매핑을 이번에 함께 바로잡아도 될까요?
```

- [ ] **Step 2: Record approved decisions**

If any gate is approved, append to `docs/decisions.md`:

```markdown
## 2026-05-26: 260526 피드백 반영 범위 결정
- 컨텍스트:
- 옵션:
- 결정:
- 근거:
```

Stop implementation if Gate 1 or Gate 4 is not decided.

---

### Task 2: Fix Critical To-Be Coordinate Bug

**Files:**
- Modify: `backend/app/schemas/responses.py`
- Modify: `backend/app/core/trade_off.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `frontend/lib/types/api.ts`

- [ ] **Step 1: Normalize L0 choices**

Add L0 choice normalization in `backend/app/schemas/responses.py` so frontend text maps to `"A"` or `"B"`:

```python
_L0_CHOICE_MAP = {
    "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다": "A",
    "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.": "B",
    "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백": "A",
    "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보": "B",
    "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다": "A",
    "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다": "B",
}
```

In `normalize_response_types`, map `L0-1`, `L0-2`, `L0-3` when values match.

- [ ] **Step 2: Correct Matrix B To-Be semantics if Gate 4 is approved**

In `backend/app/core/trade_off.py`, change `calc_to_be_coordinates`:

```python
x_b = _map_choice(q2, a_value=0.80, b_value=0.20)
y_b = _map_choice(q3, a_value=0.20, b_value=0.80)
```

Keep Matrix A away from center by mapping L0 choices to 0.15 or 0.85.

- [ ] **Step 3: Return Matrix B To-Be quadrant**

Add `b_quadrant_to_be` to `MatrixOut` in `backend/app/schemas/analysis.py`, `frontend/lib/types/api.ts`, and `backend/app/api/diagnose.py`.

- [ ] **Step 4: Test backend coordinates**

Run:

```powershell
cd backend
python -m pytest tests/test_diagnose_endpoint.py -v
```

Expected: endpoint still returns 200 and To-Be coordinates are not all `0.5`.

---

### Task 3: Add Explicit Alignment Engine

**Files:**
- Create: `backend/app/core/alignment_engine.py`
- Modify: `backend/app/schemas/analysis.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `frontend/lib/types/api.ts`
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/components/result/InsightCard.tsx`

- [ ] **Step 1: Add backend alignment dataclasses and rules**

Create `backend/app/core/alignment_engine.py` with these concepts:

```python
@dataclass(frozen=True)
class AlignmentConflict:
    id: str
    title: str
    detail: str
    severity: str
    penalty: int
    domains: tuple[str, ...]

@dataclass(frozen=True)
class AlignmentAnalysis:
    score: int
    base_score: int
    total_penalty: int
    conflicts: list[AlignmentConflict]
```

Rules to implement:

```text
performance_reward_without_eval:
  Trigger: 2-3-2 is performance/incentive and evaluation score < 65 or 2-4-5 unknown
  Meaning: 보상 메시지는 성과주의인데 평가 근거가 약함
  Penalty: 10 or 15

collaboration_reward_with_ceo_bottleneck:
  Trigger: L0-1 == B and leadership has CEO bottleneck or 2-5-1 CEO intervention
  Meaning: 협업/공동체 지향인데 의사결정은 중앙집중
  Penalty: 10

aggressive_hiring_low_pay:
  Trigger: L1-4 aggressive and 2-3-5 is 하위/중위
  Meaning: 채용 확장 메시지와 보상 경쟁력이 충돌
  Penalty: 10

high_performance_low_feedback:
  Trigger: L0-2 == A and 2-5-1 is weak
  Meaning: 성과 피드백 철학은 강하지만 리더가 실행하지 못함
  Penalty: 10

culture_fit_without_core_value:
  Trigger: L0-3 == B and 2-5-6 maps to 문서로만 존재함/일부 참고함
  Meaning: 내부 육성·컬처핏 지향인데 핵심가치 기준이 작동하지 않음
  Penalty: 8
```

- [ ] **Step 2: Define score formula**

Use:

```python
alignment_score = max(0, min(100, round(base_area_average - total_penalty)))
```

where `base_area_average` is the average of the five area scores.

- [ ] **Step 3: Add API output**

Expose:

```json
"alignment": {
  "score": 61,
  "base_score": 73,
  "total_penalty": 12,
  "conflicts": [...]
}
```

- [ ] **Step 4: Update result summary**

In `frontend/app/(analysis)/result/page.tsx`, use `data.alignment.score` for "인사제도 정합성 지수" and show top 2 conflicts under the score card.

- [ ] **Step 5: Test**

Add or update backend tests:

```powershell
cd backend
python -m pytest tests/test_diagnose_endpoint.py tests/test_implication_parity.py -v
```

Expected: API includes `alignment.conflicts`, and known contradictory inputs produce at least one conflict.

---

### Task 4: Dynamic Benchmarks

**Files:**
- Create or Modify: `backend/app/core/analysis_engine.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `frontend/components/visualization/RadarChart.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/components/detail/BenchmarkRow.tsx`

- [ ] **Step 1: Add benchmark helper after Gate 2 approval**

Add function:

```python
def benchmark_for(area_id: str, responses: dict[str, Any]) -> int:
    base = {
        "compensation": 70,
        "evaluation": 75,
        "recruitment": 75,
        "retention": 72,
        "leadership": 75,
    }[area_id]
    ...
```

Use adjustments:

```text
20인 이하: retention -8, evaluation -5, leadership -7, recruitment -3
20~50인: retention -5, leadership -3
100~500인 or 500인 초과: evaluation +5, leadership +5
공격적 확장: recruitment +5, retention -3
L0-1 A: compensation +3, evaluation +3
L0-1 B: retention +3, leadership +3
```

- [ ] **Step 2: Replace fixed benchmarks**

Replace fixed `benchmark = 70/75/72` in `_analyze_*` functions with `benchmark_for(area_id, responses)`.

- [ ] **Step 3: Update UI copy**

Replace copy that implies one universal 75점 target with:

```text
기준점은 회사 규모, 성장 기조, 입력한 인재 철학을 반영해 영역별로 다르게 설정됩니다.
```

- [ ] **Step 4: Test**

Create test cases in `backend/tests/test_diagnose_endpoint.py`:

```text
20인 이하 retention benchmark < 100인 이상 retention benchmark
100인 이상 leadership benchmark >= 20인 이하 leadership benchmark
```

---

### Task 5: Input Form Wording and Choice Fixes

**Files:**
- Modify: `frontend/app/diagnose/workforce/page.tsx`
- Modify: `frontend/app/diagnose/rewards/page.tsx`
- Modify: `frontend/app/diagnose/evaluation/page.tsx`
- Modify: `backend/app/content/schema.json`
- Modify: `backend/app/core/variables.py`
- Modify: `backend/app/schemas/responses.py`

- [ ] **Step 1: 인력·채용 설명 문구 교체**

Replace:

```text
인력 안정성과 채용 파이프라인은 성장 속도와 총보상 구조의 압력을 함께 해석하는 기준입니다.
```

with:

```text
사람이 얼마나 자주 나가고, 필요한 사람을 얼마나 빨리 데려오는지 보면 지금 성장 속도를 조직이 감당하고 있는지 확인할 수 있습니다.
```

- [ ] **Step 2: 총보상 `2-3-6` 문항 재정의**

Replace label:

```text
복리후생(휴가·간식·교육비 등) 및 직급/호칭 체계의 수준은 동종업계 대비 어떻습니까?
```

with:

```text
복리후생(휴가·간식·교육비 등)의 수준은 동종업계 대비 어떻습니까?
```

Replace options:

```text
상 / 중 / 하
```

with:

```text
동종업계보다 높은 편 / 비슷한 편 / 낮은 편 / 모르겠음
```

Update score logic so `"모르겠음"` is neutral or visibility-related, not a high/low value.

- [ ] **Step 3: 평가 공정성 슬라이더를 언어형 선택지로 변경**

For `2-4-3-ceo` and `2-4-3-employee`, replace `NumericSlider` labels `낮음/높음` with a segmented 5-point scale:

```text
전혀 아니다=1 / 아니다=3 / 보통이다=5 / 그렇다=7 / 매우 그렇다=10
```

Keep backend numeric values because analysis uses 10-point scores.

- [ ] **Step 4: 리더 장기방향 선택지 변경**

Replace `낮음 / 중간 / 높음` labels with:

```text
아니다 / 보통이다 / 그렇다
```

Keep values `1 / 3 / 5`.

- [ ] **Step 5: Sync schema and frontend**

Ensure `backend/app/content/schema.json`, `backend/app/core/variables.py`, and frontend hardcoded options match.

---

### Task 6: Landing Page Flow and Preview Fixes

**Files:**
- Modify: `frontend/components/landing/LandingHero.tsx`
- Modify: `frontend/components/landing/ProcessStrip.tsx`
- Modify: `frontend/components/landing/PreviewAside.tsx`

- [ ] **Step 1: Make "진단 흐름 보기" show a real flow**

Expand `ProcessStrip` to seven steps:

```text
철학 및 조직 컨텍스트 확인
각 인사제도 현황 진단
진단결과 확인
벤치마크와 중요 시사점 확인
가능한 시나리오 및 트레이드오프 확인
시나리오 결정
시나리오에 따른 실행 로드맵 확인
```

- [ ] **Step 2: Keep compact layout**

Use a horizontal scroll strip on desktop and stacked timeline on mobile so the landing page does not become heavy.

- [ ] **Step 3: Preview alignment**

In `PreviewAside`, change item row to:

```tsx
<div className="flex min-h-[52px] items-center justify-between gap-3">
```

so `평가·리더십` and `대표 재량 중심` align vertically center.

- [ ] **Step 4: Leave icon redesign to design pass**

Do not redesign icons unless a concrete design is provided.

---

### Task 7: Result Summary Page Fixes

**Files:**
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/components/result/MetricCard.tsx`
- Modify: `frontend/components/visualization/RadarChart.tsx`
- Modify: `frontend/components/visualization/GapBarList.tsx`
- Modify: `frontend/components/result/InsightCard.tsx`

- [ ] **Step 1: Replace `대표` with `회사` where appropriate**

Replace lead:

```text
이 화면은 잘한 점수를 보여주는 대시보드가 아니라, 회사가 어디부터 제도를 정렬할지 결정하기 위한 첫 장입니다.
```

Replace `대표가 결정할 질문` with:

```text
회사가 결정할 질문
```

- [ ] **Step 2: Warning badge color**

For "가장 먼저 볼 영역" `기준점 대비 ##점 미달`, use coral/red tone, not teal.

- [ ] **Step 3: HR visibility badge color consistency**

If `visibility.score` is 50~69 and text is `추가 수집 권장`, both top data reliability card and HR visibility MetricCard badge must use amber.

- [ ] **Step 4: Show blind spot labels**

Add below HR visibility copy:

```text
진단이 약한 영역: 채용 소요 기간, 평가 운영 데이터
```

using `visibility.blind_spot_labels`.

- [ ] **Step 5: Radar chart wording and visual tone**

Replace `teal 영역` with `초록색 영역`.

Lighten benchmark line and points:

```tsx
stroke="#d8e0ea"
fill="rgba(47,143,134,.12)"
strokeWidth="2"
```

- [ ] **Step 6: Operating risk density**

If fewer than three insights exist, render compact width or placeholder-free layout. Do not show empty-looking three-card grid.

- [ ] **Step 7: Add bottom navigation**

At page bottom add buttons:

```text
상세 분석 보기
리포트 저장
```

---

### Task 8: Area Detail Interpretation Fixes

**Files:**
- Modify: `frontend/app/(analysis)/result/detail/page.tsx`
- Modify: `frontend/components/detail/AreaSidebar.tsx`
- Modify: `frontend/components/detail/ScoreHero.tsx`
- Modify: `frontend/components/detail/BreakdownTable.tsx`
- Modify: `frontend/components/detail/AsIsToBePanel.tsx`
- Modify: `backend/app/content/implications.json`
- Modify: `backend/app/core/analysis_engine.py`

- [ ] **Step 1: Sidebar bar color by score**

Use:

```text
score < 50: coral
50 <= score < 70: amber
score >= 70: teal
```

- [ ] **Step 2: Add `점` suffix**

Change `현재 {area.score}` to `현재 {area.score}점`.

- [ ] **Step 3: Fix 기준점 차이 line break**

Render:

```text
기준점 대비
48점 미달
```

using two block spans.

- [ ] **Step 4: Split As-Is and To-Be badges**

Replace one `As-Is → To-Be` badge with two labels:

```text
현재 방식
개선 기준
```

- [ ] **Step 5: Replace producer-facing explanation**

Replace:

```text
점수의 근거를 내부 계산값이 아니라, 대표가 실제 회의에서 다룰 전환 과제로 번역했습니다.
```

with:

```text
아래는 현재 답변이 어떤 운영 리스크로 이어지는지와, 다음 회의에서 먼저 바꿔야 할 기준을 함께 보여줍니다.
```

- [ ] **Step 6: Interpret raw answers**

Add a helper in `AsIsToBePanel.tsx`:

```text
20% 초과 자발적 이직률 -> "동종 규모 스타트업 기준보다 높은 이탈 신호입니다. 핵심 인력이 빠질 때 남은 조직의 업무 연속성이 흔들릴 수 있습니다."
30% 초과 조기 퇴사율 -> "온보딩과 역할 기대치가 맞지 않아 채용비가 반복적으로 새고 있을 가능성이 큽니다."
1명 핵심 인재 이탈 -> "소규모 조직에서는 1명도 특정 기능이나 고객 관계가 비는 사건일 수 있습니다."
```

- [ ] **Step 7: Rename labels**

Replace:

```text
전환 방향 -> 개선 방향
첫 실행 질문 -> 먼저 던질 질문
정합성 훼손도 -> 운영 충돌 위험
```

Make "먼저 던질 질문" actual questions ending with `?`.

- [ ] **Step 8: Replace `대표님` with `회사` where it refers to report reader**

Search frontend and backend content for `대표님` and replace when sentence can be organization-facing.

---

### Task 9: Matrix and Trade-Off Page Fixes

**Files:**
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
- Modify: `frontend/components/visualization/MatrixSVG.tsx`
- Modify: `frontend/components/matrix/ScenarioFitTable.tsx`
- Modify: `frontend/components/matrix/SelectedScenarioCard.tsx`
- Modify: `backend/app/content/scenarios.json`

- [ ] **Step 1: Replace lead with line break-friendly copy**

Use:

```text
As-Is는 현재 운영 데이터로 자동 배치하고, To-Be는 회사가 선택한 인재 철학과 목표 방향으로 표시합니다.
두 점 사이의 거리가 클수록 새 제도 자체보다 리더십 운영 비용이 커집니다.
```

- [ ] **Step 2: Fix "얻는 것/감수할 것" grammar**

Replace explanation cells:

```text
얻는 것: 선택한 방향이 강화하는 인재 메시지, 보상 원칙, 운영 속도입니다.
감수할 것: 인건비 증가, 평가 갈등, 리더 운영 부담처럼 반대급부로 커지는 비용입니다.
```

- [ ] **Step 3: Emphasize selected scenario gain/cost**

In `SelectedScenarioCard`, make gain/cost two visual cards with stronger typography.

- [ ] **Step 4: Rename package label**

Replace:

```text
먼저 움직이는 제도 -> 적용 필요 제도
먼저 설계할 제도 -> 적용 필요 제도
```

- [ ] **Step 5: Add bottom navigation**

At bottom add:

```text
상세 분석으로
시나리오 비교
```

- [ ] **Step 6: Validate To-Be not centered**

After Task 2, open `/matrix` with L0 values and verify To-Be is not fixed at center.

---

### Task 10: Scenario Matching and Comparison Fixes

**Files:**
- Modify: `backend/app/core/trade_off.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
- Modify: `frontend/app/(analysis)/scenarios/page.tsx`
- Modify: `frontend/components/scenario/ScenarioCard.tsx`
- Modify: `frontend/components/scenario/ScenarioDetailPanel.tsx`
- Modify: `frontend/components/scenario/ScenarioComparisonTable.tsx`
- Modify: `backend/app/content/scenarios.json`

- [ ] **Step 1: Calculate scenario fit**

Add backend or frontend helper:

```text
performance -> Matrix A high performance/high incentive
community -> Matrix A lower performance pressure + Matrix B high fit/safety
elite -> Matrix B immediate talent density + delegated speed
```

Return or compute:

```text
fit_score
fit_label: 우선 검토 / 보완 후 검토 / 비용 큼
fit_reason
```

- [ ] **Step 2: Do not call it final recommendation**

Use title:

```text
우선 검토할 방향
```

not:

```text
추천 시나리오
```

- [ ] **Step 3: Scenario detail gain/cost dedupe**

Top summary can stay short. Detail section must use longer, non-duplicative copy:

```text
얻는 것: 이 방향을 선택하면 회사가 구성원에게 보내는 메시지가 무엇으로 바뀌는지
감수할 것: 그 메시지를 유지하기 위해 실제로 생기는 비용과 조직 반발
```

- [ ] **Step 4: Remove or reposition selected comparison banner**

Replace "비교표에서 현재 강조 중인 선택지" table banner with integrated selected card near the scenario cards, or remove if redundant.

- [ ] **Step 5: Redesign policy options as choice cards**

For package items, show `도입 / 보류 / 대체 검토` as clear segmented controls and default to no selection unless user clicks.

- [ ] **Step 6: Add bottom navigation**

At bottom add:

```text
트레이드오프 분석
실행 로드맵
```

---

### Task 11: Roadmap Page Fixes

**Files:**
- Modify: `frontend/app/(analysis)/roadmap/page.tsx`
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
- Modify: `backend/app/content/scenarios.json`

- [ ] **Step 1: Replace title with plain wording**

Replace:

```text
공동체 안정형을 실행 가능한 12개월 계획으로 번역합니다.
```

with:

```text
선택한 방향을 12개월 동안 어떤 순서로 실행할지 정리합니다.
```

- [ ] **Step 2: Expand operating references**

Replace generic "Google식/Netflix식 참고" with 2-3 concrete operating details per scenario:

```text
어떤 회의체를 둔다
어떤 데이터를 본다
어떤 리더 행동을 반복한다
어떤 부작용을 추적한다
```

- [ ] **Step 3: Add accordions**

In `RoadmapTimeline`, show each phase header by default and collapse details behind a button:

```text
자세히 보기 / 접기
```

Keep first phase open by default.

- [ ] **Step 4: Add bottom buttons**

At bottom add:

```text
시나리오 비교
리포트 초안 생성
```

- [ ] **Step 5: Keep PDF export out of this pass**

Keep `window.print()` for now, but rename button only if needed:

```text
현재 화면 인쇄
```

or keep as is until separate PDF task.

---

### Task 12: Verification Pass

**Files:**
- Modify: `docs/feedback/260526_feedback_checklist.md`

- [ ] **Step 1: Static checks**

Run:

```powershell
cd frontend
npm run lint
npx tsc --noEmit
```

Run:

```powershell
cd backend
python -m pytest -v
```

- [ ] **Step 2: Text search checks**

Run:

```powershell
rg -n "teal 영역|전환 방향|첫 실행 질문|먼저 움직이는 제도|대표가 어디부터|대표님이 어떤|낮음|높음|복리후생\\(휴가·간식·교육비 등\\) 및 직급" frontend backend
```

Expected: no user-facing leftover unless deliberately kept.

- [ ] **Step 3: Manual browser flow**

Open local app and verify:

```text
Landing -> Context -> Workforce -> Rewards -> Evaluation -> Result -> Detail -> Matrix -> Scenarios -> Roadmap
```

Use one small-company sample and one 100인+ sample to verify dynamic benchmark/To-Be behavior.

- [ ] **Step 4: Update checklist**

Mark every feedback item done, still open, or blocked with reason.

---

## Execution Order

1. Task 0: 피드백 체크리스트 작성
2. Task 1: 컨펌 게이트 질문
3. Task 2: To-Be 좌표 버그 수정
4. Task 3: 정합성 분석 엔진
5. Task 4: 동적 기준점
6. Task 5: 진단 입력 문항 수정
7. Task 6: 랜딩 페이지
8. Task 7: 결과 요약
9. Task 8: 영역별 상세
10. Task 9: 트레이드오프
11. Task 10: 시나리오 비교
12. Task 11: 실행 로드맵
13. Task 12: 검증 및 피드백 체크리스트 업데이트

## Out of Scope for This Pass

- 예쁜 PDF 저장 기능: 결과/진단 내용이 먼저 고정된 뒤 별도 작업으로 처리한다.
- 아이콘 디자인 전면 교체: 사용자가 디자인에서 따로 수정 예정이라고 했으므로 이번 pass에서는 의미 불명 아이콘을 건드리지 않는다.
