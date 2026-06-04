# Next.js Feedback Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 마지막 Next.js 시안 기준으로 코드 검증 피드백을 반영해, 랜딩의 결과 기대감, 결과 요약의 Aha Moment, 입력 UX, 매트릭스/시나리오/상세 분석의 설득력을 보강한다.

**Architecture:** `frontend/` Next.js UI와 `backend/` FastAPI 분석 엔진만 수정한다. Streamlit `src/`는 이번 작업 범위에서 완전히 제외한다. 이미 구현된 `AlignmentMap`, `ScenarioDetailPanel`, `AsIsToBePanel`, `MatrixSVG`를 재사용·보강하고, 새 기능은 작고 테스트 가능한 유틸/컴포넌트로 분리한다.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, FastAPI/Pydantic, pytest.

---

## Scope Lock

- 수정 대상: `frontend/`, `backend/`, 필요한 문서만.
- 수정 금지: `src/`, `app.py`, Streamlit 전용 파일.
- 보상 구조 시뮬레이터는 이번 범위에서 제외한다. 정합성 맵 → 매트릭스/시나리오 → 로드맵 흐름이 먼저다.
- 현재 Next.js에는 이미 다음이 반영되어 있다.
  - 결과 요약 상단 `AlignmentMap`
  - stale backend 대응 `buildFallbackAlignmentMap`
  - 시나리오 상세의 `얻는 것 / 감수할 것`
  - 시나리오 재무 rationale 일부 노출
  - 상세 분석의 `현재 방식과 바꿀 운영 기준`
  - MatrixSVG의 As-Is / To-Be 라벨 거리 보정 일부
- 이번 계획은 "처음부터 재구현"이 아니라 위 구현을 마지막 시안 품질에 맞춰 다듬는 작업이다.

## File Map

- Modify: `frontend/components/landing/PreviewAside.tsx`
  - 텍스트 리스트형 preview를 결과물 미리보기 카드 + mini 정합성 맵으로 전환.
- Create: `frontend/components/landing/MiniAlignmentPreview.tsx`
  - 랜딩용 정적 SVG preview. 이벤트 로깅 없는 순수 시각 컴포넌트.
- Create: `frontend/lib/constants/landingPreview.ts`
  - 랜딩 샘플 회사 맥락, mini vectors, 샘플 conflict copy.
- Modify: `frontend/components/visualization/AlignmentMap.tsx`
  - 모바일 가독성, 첫 화면 시각 우선순위, conflict affordance 보강.
- Modify: `frontend/app/(analysis)/result/page.tsx`
  - 정합성 맵과 후속 decision cards 사이의 정보 반복 축소.
- Modify: `backend/app/core/analysis_engine.py`
  - 원시 응답값 문자열 노출 제거. list/unknown/empty formatter 적용.
- Create or Modify: `backend/core_tests/test_analysis_copy.py`
  - 채용 status 문구 regression test.
- Modify: `frontend/components/visualization/MatrixSVG.tsx`
  - 사분면 라벨명 개선, 축 설명 위치/충돌 회피 보강.
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
  - Matrix B 라벨을 쉬운 운영 이미지로 변경.
- Modify: `frontend/components/forms/ContextPanel.tsx`
  - iPad/desktop에서 sticky right panel로 동작하도록 옵션 추가.
- Modify: `frontend/app/diagnose/workforce/page.tsx`
  - 승인 후 인력/채용 문항 추가.
- Modify: `frontend/app/diagnose/evaluation/page.tsx`
  - 평가/리더십 입력 밀도와 결과 영향 copy 보강.
- Modify: `frontend/lib/constants/variables.ts`
  - 새 문항 추가 시 step completion 변수 목록 갱신.
- Modify: `backend/app/content/schema.json`
  - 새 문항 SSOT 추가.
- Modify: `backend/app/core/alignment_map.py`
  - 새 문항이 정합성 맵 벡터에 반영되도록 보강.
- Modify: `backend/app/core/visibility_index.py`
  - 새 정량/가시성 항목 포함 여부 결정 후 반영.
- Modify: `frontend/components/scenario/ScenarioComparisonCards.tsx`
  - 시나리오 비교 카드에도 얻는 것/감수할 것 요약이 보이도록 보강.
- Modify: `frontend/components/scenario/ScenarioDetailPanel.tsx`
  - rationale 캡션 일관성, 재무 수치 방어 문구 강화.
- Modify: `frontend/components/detail/AsIsToBePanel.tsx`
  - `우선 전환 / 보완 필요 / 유지` 뱃지 색상 분기 명확화.

---

## Task 1: 랜딩페이지 결과물 Preview 강화

**Intent:** "샘플 이미지 없음" 피드백을 Next.js 랜딩 기준으로 해결한다. 지금 `PreviewAside`는 텍스트 리스트라 기대감이 약하므로, mini 정합성 맵과 샘플 리포트 요약을 첫 화면 우측에 넣는다.

**Files:**
- Create: `frontend/components/landing/MiniAlignmentPreview.tsx`
- Create: `frontend/lib/constants/landingPreview.ts`
- Modify: `frontend/components/landing/PreviewAside.tsx`
- Verify: `frontend` typecheck/build, browser screenshot

**Implementation Notes:**
- `MiniAlignmentPreview`는 `AlignmentMap`을 직접 쓰지 않는다. `AlignmentMap`은 session event logging이 있어 랜딩에는 과하다.
- 랜딩 preview는 실제 결과 화면을 "암시"해야 하므로, 카드 제목은 `정합성 맵 미리보기`, 샘플 headline은 `보상은 성과주의인데, 평가는 관계 중심입니다.`로 둔다.
- `PreviewAside`는 리스트 4개를 유지하되, 상단 60%를 mini map과 headline이 차지하게 한다.

**Steps:**
- [x] Create `landingPreview.ts` with deterministic sample vectors and conflicts.
- [x] Create `MiniAlignmentPreview.tsx` as static SVG with 5 arrows and quadrant labels.
- [x] Replace top of `PreviewAside` with mini map + sample conflict card.
- [x] Run `cd frontend; npm.cmd run typecheck`.
- [x] Run `cd frontend; npm.cmd run build`.
- [x] Start Next dev server and verify landing preview renders in HTML.

**User Checkpoint A:** 랜딩 첫 화면 우측이 "텍스트 설명"이 아니라 "이런 결과물이 나온다"로 보이는지 확인.

---

## Task 2: 결과 요약 정합성 맵 First-Viewport 다듬기

**Intent:** 정합성 맵은 이미 있지만, CEO가 첫 3초 안에 "제도가 서로 다른 방향을 본다"를 더 강하게 느끼도록 위계를 조정한다.

**Files:**
- Modify: `frontend/components/visualization/AlignmentMap.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`

**Implementation Notes:**
- `AlignmentMap` headline 영역을 더 짧게 만들고, `읽는 법` banner는 한 줄로 유지한다.
- 오른쪽 `영역별 방향` 리스트는 유지하되, 모바일에서는 map 아래로 자연스럽게 떨어지게 한다.
- `result/page.tsx`의 decision cards와 metric cards가 정합성 맵 바로 아래에서 같은 메시지를 반복하지 않도록 copy를 줄인다.

**Steps:**
- [ ] Reduce repeated explanatory copy below `AlignmentMap`.
- [ ] Add `aria-label` and button focus states for vector list.
- [ ] Ensure empty vector fallback does not crash and shows a compact "분석 데이터 준비 중" state.
- [ ] Run `cd frontend; npm.cmd run typecheck`.
- [ ] Browser-check `/result` with sample responses.

---

## Task 3: 원시 응답값 노출 제거

**Intent:** `backend/app/core/analysis_engine.py`가 list나 unknown 값을 그대로 문장에 넣는 문제를 해결한다. Next.js detail page는 `area.status_text`를 그대로 보여주므로 backend copy 품질이 중요하다.

**Files:**
- Modify: `backend/app/core/analysis_engine.py`
- Create/Modify: `backend/core_tests/test_analysis_copy.py`

**Test Cases:**
- `2-2-2`가 `["4개 이상"]`이어도 status에는 `['4개 이상']`가 나오지 않는다.
- `2-2-1`이 `모름 / 채용 자체 없음`이면 `채용 소요 기간을 아직 측정하지 않고 있으며`로 나온다.
- 채널 값이 비어 있으면 `주요 채용 채널 정보는 아직 입력되지 않았습니다`가 나온다.

**Steps:**
- [ ] Add tests for recruitment status copy.
- [ ] Add `_format_response_value(value: Any) -> str`.
- [ ] Add `_build_recruitment_status(duration, channels, rejection) -> str`.
- [ ] Replace recruitment status string construction.
- [ ] Run `cd backend; $env:PYTHONPATH='.'; python -m pytest core_tests/test_analysis_copy.py tests/test_diagnose_endpoint.py -q`.

---

## Task 4: Matrix A/B 텍스트 겹침과 라벨명 개선

**Intent:** Plotly 피드백을 현재 SVG 기반 `MatrixSVG`에 맞게 번역한다. 축/사분면/마커가 겹치지 않고, 라벨이 CEO 언어로 읽히게 한다.

**Files:**
- Modify: `frontend/components/visualization/MatrixSVG.tsx`
- Modify: `frontend/app/(analysis)/matrix/page.tsx`

**Changes:**
- Matrix B `Q4 대기업 공채 시스템형` → `삼성식 공채 시스템 조직`
- Matrix B `Q1 개인플레이어 중심형` → `실력자 개인기 조직`
- Matrix B `Q3 에이전시형 분업 조직` 유지 또는 `에이전시식 분업 조직`
- `axisLabel`은 SVG 내부 하단/좌측에 있되 marker와 닿지 않도록 safe zones 지정.
- 사분면 label 위치는 As-Is/To-Be와 가까우면 `labelOffsets`로 밀어낸다.

**Steps:**
- [ ] Add helper `avoidLabelCollision(labelPoint, markers)` in `MatrixSVG`.
- [ ] Apply label offsets to quadrant labels.
- [ ] Update matrix page labels and examples.
- [ ] Run `cd frontend; npm.cmd run typecheck`.
- [ ] Browser-check `/matrix` desktop and iPad-ish width.

---

## Task 5: 입력 화면 Result-Impact Context Panel

**Intent:** Streamlit의 sticky 박스 피드백을 Next.js right rail로 해결한다. 현재 `ContextPanel`은 존재하지만 "이 화면이 결과에 미치는 영향" 프레이밍이 약하다.

**Files:**
- Modify: `frontend/components/forms/ContextPanel.tsx`
- Modify: `frontend/app/diagnose/workforce/page.tsx`
- Modify: `frontend/app/diagnose/rewards/page.tsx`
- Modify: `frontend/app/diagnose/evaluation/page.tsx`

**Changes:**
- `ContextPanel`에 optional `title`, `impactItems`, `sticky` props 추가.
- desktop/iPad에서는 `xl:sticky xl:top-6`.
- 각 입력 화면의 패널 제목을 `이 화면이 결과에 미치는 영향`으로 통일.
- Workforce: `정합성 맵의 인력/채용 벡터`, `HR 가시성`, `채용-보상 미스매치`
- Rewards: `보상 벡터`, `시장 경쟁력`, `인건비 압력`
- Evaluation: `평가/리더십 벡터`, `보상 수용성`, `실행 가능성`

**Steps:**
- [ ] Update `ContextPanel` props and styling.
- [ ] Wire impact copy into three diagnose pages.
- [ ] Run `cd frontend; npm.cmd run typecheck`.
- [ ] Browser-check diagnose pages at desktop and 1024px width.

---

## Task 6: 인력/채용 문항 균형 보강

**Intent:** 인력/채용 각 3문항의 불균형을 해결한다. 단, 문항 추가는 응답 부담과 scoring semantics를 바꾸므로 구현 전 문구 승인 후 진행한다.

**Proposed Questions For Approval:**
- `2-1-4` 핵심 인재를 식별하는 기준과 명단이 있습니까?
  - `명확한 기준과 명단이 있음`
  - `리더별로 암묵적으로 알고 있음`
  - `별도 기준 없음`
- `2-1-5` 핵심 포스트가 갑자기 비었을 때 대체 계획이 있습니까?
  - `후임/백업 후보가 정해져 있음`
  - `일부 포지션만 있음`
  - `거의 없음`
- `2-2-4` 후보자에게 회사를 설명하는 채용 브랜딩 자산이 있습니까?
  - `채용 페이지/컬처덱/인터뷰 자료가 있음`
  - `공고문 외 일부 자료만 있음`
  - `거의 없음`
- `2-2-5` 수습/온보딩 전환율 또는 입사 후 3개월 적응 상태를 추적합니까?
  - `정기적으로 추적함`
  - `문제 발생 시에만 확인함`
  - `추적하지 않음`

**Files After Approval:**
- Modify: `backend/app/content/schema.json`
- Modify: `backend/app/core/analysis_engine.py`
- Modify: `backend/app/core/alignment_map.py`
- Modify: `frontend/app/diagnose/workforce/page.tsx`
- Modify: `frontend/lib/constants/variables.ts`
- Modify: `frontend/lib/utils/alignmentMapFallback.ts`
- Add tests under `backend/core_tests/`

**Scoring Draft:**
- `2-1-4`: clear +8, implicit +3, none -8
- `2-1-5`: clear +8, partial +3, none -8
- `2-2-4`: clear +8, partial +3, none -8
- `2-2-5`: regular +8, ad hoc +2, none -8

**User Checkpoint B:** 위 문항 문구와 scoring 방향 승인 필요.

---

## Task 7: 시나리오 수치 디펜스와 비교 카드 강화

**Intent:** 상세 패널에는 rationale이 이미 노출된다. 비교 카드에서도 CEO가 숫자를 방어할 수 있도록, scenario 선택 전 단계에 수치 근거를 더 얇게 보여준다.

**Files:**
- Modify: `frontend/components/scenario/ScenarioComparisonCards.tsx`
- Modify: `frontend/components/scenario/ScenarioDetailPanel.tsx`
- Verify: `backend/app/content/scenarios` or scenario source endpoint

**Changes:**
- 모든 `financial_impact`에 `rationale`이 있는지 backend/content test 추가.
- `ScenarioComparisonCards`에 대표 gain/cost/rationale one-liner 추가.
- `ScenarioDetailPanel`의 재무 영향 caption을 `근거:` prefix로 통일.

**Steps:**
- [ ] Add backend/content test that every financial impact item has rationale.
- [ ] Add compact rationale line to comparison card.
- [ ] Keep detailed panel current layout, only copy and consistency polish.
- [ ] Run frontend typecheck/build and backend scenario content test.

---

## Task 8: 상세 분석 Status Badge 색상 분기

**Intent:** "현재 방식과 바꿀 운영 기준" 카드에서 `우선 전환 / 보완 필요 / 유지`가 색으로 즉시 읽히게 한다. 현재 label은 있으나 badge color가 slate 중심이라 우선순위가 약하다.

**Files:**
- Modify: `frontend/components/detail/AsIsToBePanel.tsx`

**Changes:**
- `우선 전환`: coral border/bg/text
- `보완 필요`: amber border/bg/text
- `유지`: teal or slate
- `확인 필요`: slate

**Steps:**
- [ ] Add `priorityBadgeStyle(label)` helper.
- [ ] Apply helper to status badge.
- [ ] Browser-check `/result/detail`.

---

## Verification Plan

**Backend:**
```powershell
cd backend
$env:PYTHONPATH='.'
python -m pytest tests/test_diagnose_endpoint.py core_tests -q
```

**Frontend:**
```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run build
```

**Browser QA:**
- `/` landing desktop/mobile: mini 정합성 맵 preview visible in first viewport.
- `/diagnose/workforce`, `/diagnose/rewards`, `/diagnose/evaluation`: right context panel readable, no overlap at iPad width.
- `/result`: 정합성 맵 visible before metrics.
- `/matrix`: labels do not collide with As-Is/To-Be in sample states.
- `/scenarios`: gain/cost/rationale scan path visible.
- `/result/detail`: badge colors communicate priority.

## Execution Order

1. Landing preview 강화.
2. Result alignment map first-viewport polish.
3. Backend raw response copy fix.
4. Matrix label/collision polish.
5. Diagnose context panel sticky/impact copy.
6. Scenario rationale/comparison polish.
7. Detail badge color polish.
8. User approval after reviewing proposed workforce/recruitment questions.
9. Workforce/recruitment question expansion.
