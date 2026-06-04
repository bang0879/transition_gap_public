# Alignment Tension Axis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 2D 화살표 정합성 맵을, 5개 영역별 고유 축 위에서 대표 철학(◆)과 실제 제도(●)의 거리를 보여주는 "정합성 텐션 축"으로 재설계한다.

**Architecture:** `backend/app/core/alignment_map.py`의 기존 alignment map payload를 확장해 `axes` 데이터를 추가하고, `frontend/components/visualization/AlignmentMap.tsx`는 새 `AlignmentTensionMap` 컴포넌트로 대체한다. 철학 입력은 `/diagnose/philosophy` 별도 step으로 분리하고, 기존 `/diagnose/context`는 조직 규모/산업/페인포인트만 담당하게 한다. Streamlit `src/`는 수정하지 않는다.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, FastAPI/Pydantic, pytest.

---

## Product Decision

### 왜 2D 화살표 맵을 바꾸는가

현재 2D 화살표 맵은 "제도들이 흩어져 있다"는 느낌은 주지만, CEO가 각 축의 의미를 해석해야 한다. `성과·시장 / 공동체·장기 신뢰 / 제도·데이터 / 관계·자율`이라는 2차원 축은 HR 도메인 전문가에게는 의미가 있지만, 대표가 3초 안에 읽기에는 복잡하다.

새 방향은 5개 독립 축이다.

```text
보상     차등/파격 ─────●────◆──────── 균등/안정
평가     정교/엄격 ─◆────────────●─── 관대/유연
채용     외부 수혈 ─────◆──●───────── 내부 육성
인력     교체 허용 ──────────●─◆───── 안정 최우선
리더십   성과/단호 ─◆──────────●───── 관계/안전
```

- `◆` = Step 1에서 대표가 직접 설정한 경영 철학
- `●` = 이후 진단 응답으로 추정한 현재 실제 제도
- 두 점 사이 거리 = 정합성 텐션, 즉 전환 비용
- 가까우면 green, 멀면 coral

이 방식은 각 영역의 고유한 tension axis를 인정하므로, 리더십이나 채용을 억지로 `성과주의/공동체` 단일 축으로 환원하지 않는다.

---

## Scope Lock

- 수정 대상: `frontend/`, `backend/`, 문서.
- 수정 금지: `src/`, `app.py`, Streamlit 파일.
- 보상 구조 시뮬레이터는 이번 범위에서 제외.
- 기존 결과 요약/랜딩 시안 톤은 유지하되, 정합성 시각화만 축 기반으로 교체한다.

---

## File Map

### Backend

- Modify: `backend/app/content/schema.json`
  - `L0-4` 철학 문항 추가.
- Modify: `backend/app/core/variables.py`
  - schema sync 여부 확인 후, 필요 시 `L0-4`, short label 추가.
- Modify: `backend/app/schemas/responses.py`
  - frontend philosophy text normalization에 `L0-4` 추가.
- Modify: `backend/app/core/alignment_map.py`
  - 기존 vector 기반 계산을 유지하거나 호환하되, 새 axis 기반 payload 생성.
- Modify: `backend/app/schemas/analysis.py`
  - `AlignmentAxisOut` 추가, `AlignmentMapOut.axes` 추가.
- Modify: `backend/app/api/diagnose.py`
  - `axes`를 response에 포함.
- Modify: `backend/app/core/trade_off.py`
  - L0 철학 기반 To-Be 계산에 `L0-4`가 필요한지 검토. MVP에서는 matrix 좌표와 독립 유지 가능.
- Add/Modify: `backend/core_tests/test_alignment_map.py`
  - 5개 axis, philosophy/actual/tension/severity 검증.
- Add/Modify: `backend/core_tests/test_schema_wording.py`
  - `L0-4` 문항과 short label 검증.

### Frontend

- Create: `frontend/app/diagnose/philosophy/page.tsx`
  - 대표 경영 철학 전용 step.
- Modify: `frontend/app/diagnose/context/page.tsx`
  - L0 문항 제거, L1 조직 컨텍스트만 남김.
- Modify: `frontend/lib/constants/steps.ts`
  - `philosophy` step 추가, context step 번호/문구 조정.
- Modify: `frontend/lib/constants/variables.ts`
  - `philosophy: ["L0-1", "L0-2", "L0-3", "L0-4"]`
  - `context: ["L1-1", "L1-2", "L1-3", "L1-4", "L1-5"]`
- Modify: `frontend/components/landing/LandingHero.tsx`
  - 진단 시작 경로 `/diagnose/philosophy`로 변경.
- Modify: `frontend/components/landing/DiagnosisFlowModal.tsx`
  - Step 01을 "인사 철학 확인"으로 변경.
- Modify: `frontend/components/landing/ProcessStrip.tsx`
  - 철학/컨텍스트 분리 반영.
- Create: `frontend/components/visualization/AlignmentTensionMap.tsx`
  - 5개 독립 축 시각화.
- Modify or Replace: `frontend/components/visualization/AlignmentMap.tsx`
  - 기존 export를 `AlignmentTensionMap` wrapper로 교체하거나 result page import를 변경.
- Modify: `frontend/app/(analysis)/result/page.tsx`
  - 정합성 맵 copy를 `Step 1에서 대표님이 설정한 철학(◆)과 실제 제도(●)의 거리` narrative로 변경.
- Modify: `frontend/lib/types/api.ts`
  - `AlignmentAxisOut` 타입 추가.
- Modify: `frontend/lib/utils/alignmentMapFallback.ts`
  - stale backend fallback도 axis 기반으로 생성.
- Modify: `frontend/components/landing/MiniAlignmentPreview.tsx`
  - 랜딩 mini preview도 화살표가 아니라 축 기반 tension preview로 교체.
- Modify: `frontend/lib/constants/landingPreview.ts`
  - mini preview constants를 axis format으로 변경.

---

## Axis Model

### API Shape

```python
class AlignmentAxisOut(BaseModel):
    domain_id: str
    domain_name: str
    left_label: str
    right_label: str
    philosophy_position: float  # -1.0 to 1.0
    actual_position: float      # -1.0 to 1.0
    tension: float              # abs(actual - philosophy), 0.0 to 2.0
    tension_level: str          # aligned | watch | misaligned
    headline: str
    evidence: list[str]
    business_risk: str | None   # tension >= 0.75일 때만 한 줄 So What
```

`AlignmentMapOut`에 다음 필드를 추가한다.

```python
axes: list[AlignmentAxisOut]
```

기존 `vectors`는 한 release 동안 남긴다. 프론트는 `axes`가 있으면 axis view, 없으면 fallback axes를 쓴다.

### Domain Axes

| 영역 | 좌측 | 우측 | 대표 철학 근거 | 실제 제도 근거 |
|---|---|---|---|---|
| 보상 | 차등/파격 | 균등/안정 | L0-1 | 2-3-1, 2-3-2, 2-4-2 |
| 평가 | 정교/엄격 | 관대/유연 | L0-1 + L0-2 | 2-4-1a, 2-4-2, 2-4-3 gap, 2-4-5 |
| 채용 | 외부 수혈/속도 | 내부 육성/적합성 | L0-3 | L1-4, 2-2-1, 2-2-3, 2-3-5 |
| 인력 | 자연 교체 허용 | 안정성 최우선 | L0-4 | 2-1-1, 2-1-2, 2-1-3 |
| 리더십 | 성과 추적/단호함 | 관계 관리/심리적 안전 | L0-2 | 2-5-1, 2-5-2, 2-5-6 |

### L0-4 Question

Question:

> 대체 불가능한 핵심 인재가 이탈하려 할 때, 내부 형평성을 크게 벗어나는 파격적인 보상을 요구한다면 어떻게 의사결정 하시겠습니까?

Options:

1. `조직 전체의 형평성과 보상 원칙이 무너지는 것이 더 위험하므로, 타격이 있더라도 예외 없이 원칙대로 내보낸다.`
2. `내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.`

Mapping:

- option 1 → 인력 philosophy position `-0.75` 조직 안정/룰 중시
- option 2 → 인력 philosophy position `0.75` 인재 확보/실용 중시

---

## Task 1: Backend Axis Payload 설계 및 테스트

**Goal:** 기존 `alignment_map` response에 5개 독립 축 데이터를 추가한다.

**Files:**
- Modify: `backend/app/core/alignment_map.py`
- Modify: `backend/app/schemas/analysis.py`
- Modify: `backend/app/api/diagnose.py`
- Test: `backend/core_tests/test_alignment_map.py`

**Steps:**

- [x] Add failing tests:
  - response has `alignment_map.axes`
  - axes length is 5
  - each axis has `philosophy_position`, `actual_position`, `tension`, `tension_level`
  - contradictory case marks evaluation or leadership as `misaligned`
  - L0-4 drives retention philosophy position
  - `tension >= 0.75` axis has a non-empty `business_risk`
  - `tension < 0.75` axis has `business_risk is None`

- [x] Add dataclass:

```python
@dataclass(frozen=True)
class AlignmentAxis:
    domain_id: str
    domain_name: str
    left_label: str
    right_label: str
    philosophy_position: float
    actual_position: float
    tension: float
    tension_level: str
    headline: str
    evidence: list[str]
    business_risk: str | None
```

- [x] Implement `_build_axes(responses)` with five domain-specific mapping functions.
- [x] Implement `_business_risk_for_axis(axis)` using deterministic domain templates, not LLM output:
  - 보상: `차등 보상 철학과 실제 균등 운영이 벌어지면, 고성과자는 보상 신호를 믿지 못하고 외부 제안에 더 빨리 반응합니다.`
  - 평가: `엄격한 성과 철학과 관대한 평가 운영이 벌어지면, 고성과자는 불공정을 느끼고 저성과자는 개선 압력을 받지 않습니다.`
  - 채용: `외부 수혈 철학과 내부 적합성 중심 운영이 벌어지면, 성장 속도에 필요한 역량 확보가 늦어집니다.`
  - 인력: `안정성 철학과 교체 허용 운영이 벌어지면, 핵심 역할의 공백 비용이 반복적으로 커집니다.`
  - 리더십: `단호한 성과 추적 철학과 관계 중심 운영이 벌어지면, 의사결정 지연과 책임 회피가 리더십 신호로 굳어집니다.`
- [x] Add `axes` to `AlignmentMapAnalysis`.
- [x] Add Pydantic `AlignmentAxisOut` and expose via diagnose endpoint.
- [x] Keep old `vectors` for compatibility.
- [x] Run:

```powershell
cd backend
$env:PYTHONPATH='.'
python -m pytest core_tests/test_alignment_map.py tests/test_diagnose_endpoint.py -q
```

---

## Task 2: 대표 철학 Step 분리

**Goal:** 대표가 "내 철학을 여기서 설정한다"는 오너십을 갖도록 L0 문항을 별도 route로 분리한다.

**Files:**
- Create: `frontend/app/diagnose/philosophy/page.tsx`
- Modify: `frontend/app/diagnose/context/page.tsx`
- Modify: `frontend/lib/constants/steps.ts`
- Modify: `frontend/lib/constants/variables.ts`
- Modify: `frontend/components/landing/LandingHero.tsx`
- Modify: `frontend/components/landing/DiagnosisFlowModal.tsx`
- Modify: `frontend/components/landing/ProcessStrip.tsx`
- Modify: `backend/app/content/schema.json`
- Modify: `backend/app/core/variables.py`
- Modify: `backend/app/schemas/responses.py`
- Test: `backend/core_tests/test_schema_wording.py`

**UX Copy:**

Page eyebrow:

```text
01. 인사 철학 확인
```

Title:

```text
회사의 인사 철학 확인
```

Lead:

```text
현행 운영 중인 제도의 모습이 아니라, 회사를 어떤 방향으로 운영하고 싶은지 '지향하는 인사 철학'을 확인하는 단계입니다.
```

**Steps:**

- [x] Add `L0-4` to backend schema and variables.
- [x] Add normalization map for `L0-4`.
- [x] Create `/diagnose/philosophy` with L0-1~L0-4.
- [x] Remove L0 questions from `/diagnose/context`.
- [x] Update step order:
  - 01 대표 철학
  - 02 조직 컨텍스트
  - 03 인력 · 채용
  - 04 총보상
  - 05 평가 · 리더십
- [x] Update landing CTA target to `/diagnose/philosophy`.
- [x] Update bottom nav:
  - philosophy → context
  - context prev → philosophy, next → workforce
  - workforce prev → context
- [x] Run frontend typecheck/build and backend schema tests.

**User Checkpoint A:** 철학 step이 "설문"이 아니라 "기준 설정"처럼 느껴지는지 확인.

---

## Task 3: Frontend AlignmentTensionMap 컴포넌트

**Goal:** 결과 요약 최상단의 2D 화살표 맵을 5개 독립 축 tension view로 교체한다.

**Files:**
- Create: `frontend/components/visualization/AlignmentTensionMap.tsx`
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/lib/types/api.ts`
- Modify: `frontend/lib/utils/alignmentMapFallback.ts`

**Visual Rules:**

- Each row:
  - left label
  - horizontal axis
  - `◆ 대표 철학`
  - `● 실제 제도`
  - connecting tension segment
  - status badge
- Color:
  - `tension < 0.35` → teal, `정렬`
  - `0.35 <= tension < 0.75` → amber, `주의`
  - `>= 0.75` → coral, `엇박자`
- Do not use 2D arrows.
- No nested cards.
- Mobile: axis rows stack, labels remain visible.

**Result Page Narrative:**

```text
Step 1에서 대표님이 설정한 철학(◆)과 실제 제도(●)의 거리가 곧 정합성 텐션입니다.
```

**Steps:**

- [x] Add TypeScript `AlignmentAxisOut`.
- [x] Add fallback axes builder.
- [x] Build `AlignmentTensionMap`.
- [x] Replace `AlignmentMap` render in result page.
- [x] Preserve event logging with new metadata:
  - max tension domain
  - misaligned count
  - alignment score
- [x] Run:

```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run build
```

**User Checkpoint B:** 결과 요약 첫 화면에서 "평가랑 리더십이 대표 철학과 반대쪽"이 3초 안에 보이는지 확인.

---

## Task 4: Landing Preview를 Tension Axis로 교체

**Goal:** 랜딩 미리보기도 2D mini map이 아니라 tension axis preview로 바꾼다. 이 작업은 단순 장식이 아니라 랜딩의 killer feature 전진 배치이므로, 점수 카드보다 축의 어긋남이 먼저 보이게 만든다.

**Priority:** High. Task 3의 시각 언어가 확정되면 바로 이어서 구현한다. 랜딩에서는 `65점` 같은 점수보다 `◆ 대표 철학`과 `● 실제 제도`가 서로 어긋난 장면이 첫 시선에 들어와야 한다.

**Files:**
- Modify: `frontend/components/landing/MiniAlignmentPreview.tsx`
- Modify: `frontend/lib/constants/landingPreview.ts`
- Modify: `frontend/components/landing/PreviewAside.tsx`

**Steps:**

- [ ] Convert `LANDING_PREVIEW_VECTORS` to `LANDING_PREVIEW_AXES`.
- [ ] Render 3 condensed rows only:
  - 보상: close
  - 평가: far
  - 리더십: far
- [ ] Make misalignment visually dominant:
  - aligned row uses muted teal and a short connector.
  - misaligned rows use coral connector, stronger label weight, and a subtle pulse on the `● 실제 제도` marker.
  - avoid decorative animation that distracts from the axis meaning.
- [ ] De-emphasize numeric score:
  - remove any large `65점`-style score from the preview hero card.
  - if a score remains, render it as secondary metadata below the tension rows.
- [ ] Copy:

```text
◆ 대표 철학과 ● 실제 제도 사이가 멀수록 전환 비용이 큽니다.
```

- [ ] Run frontend typecheck/build.
- [ ] Browser-check landing.

---

## Task 5: Alignment Conflict Copy 재정렬

**Goal:** 기존 conflict copy가 2D vector 언어를 쓰지 않도록 바꾸고, 텐션이 큰 영역에는 "그래서 이게 왜 치명적인가"를 한 줄 비즈니스 리스크로 렌더링한다.

**Files:**
- Modify: `backend/app/core/alignment_map.py`
- Modify: `frontend/components/visualization/AlignmentTensionMap.tsx`

**Before Example:**

```text
보상 화살표는 성과·시장 방향인데 평가 화살표가...
```

**After Example:**

```text
대표 철학은 보상 차등을 감수하는 쪽인데, 실제 평가는 관대하고 근거 데이터가 약합니다.
이 텐션이 지속되면, 고성과자는 불공정을 느끼고 저성과자는 개선 압력을 받지 않습니다.
```

**Steps:**

- [ ] Replace "화살표" copy with "철학◆ / 실제● 거리" copy.
- [ ] Add top 2 tension domains as conflict cards.
- [ ] For each axis where `tension >= 0.75`, render `business_risk` below the headline as a one-line "So What" sentence.
- [ ] For axes where `tension < 0.75`, do not render risk copy. Keep the UI calm so every row does not shout.
- [ ] Risk copy must describe business consequence, not moral judgment:
  - good: `고성과자는 불공정을 느끼고 저성과자는 개선 압력을 받지 않습니다.`
  - bad: `평가 제도가 잘못되었습니다.`
- [ ] Run backend and frontend tests.

---

## Task 6: Matrix/Scenario 문맥 연결

**Goal:** Tension Axis에서 확인한 전환 비용이 다음 Matrix/Scenario 화면으로 자연스럽게 이어지게 한다.

**Files:**
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
- Modify: `frontend/app/(analysis)/scenarios/page.tsx`

**Steps:**

- [ ] Matrix page lead copy에 "정합성 텐션이 큰 영역부터 전환 비용을 봅니다" 추가.
- [ ] Scenario page lead copy에 "시나리오는 텐션을 줄이는 선택지이자 새 비용을 만드는 선택지" 추가.
- [ ] Do not add reward simulator.

---

## Task 7: Verification and Browser QA

**Backend:**

```powershell
cd backend
$env:PYTHONPATH='.'
python -m pytest tests/test_diagnose_endpoint.py core_tests/test_alignment_map.py core_tests/test_schema_wording.py -q
```

**Frontend:**

```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run build
```

**Browser QA:**

- `/` landing: mini preview uses tension rows, not arrows.
- `/diagnose/philosophy`: 인사 철학 확인 page is first step.
- `/diagnose/context`: no L0 philosophy questions remain.
- `/result`: first viewport shows tension axis before metric cards.
- `/result` mobile: axis labels and markers do not overlap.
- `/matrix`: copy connects from tension to transition cost.

---

## Execution Order

1. Backend axis payload.
2. Philosophy step split and L0-4.
3. Result page `AlignmentTensionMap`.
4. Landing mini preview replacement. Treat this as a conversion-critical task, not visual polish.
5. Conflict copy cleanup with `business_risk` rendering for `tension >= 0.75`.
6. Matrix/Scenario narrative bridge.
7. Full verification and browser QA.
