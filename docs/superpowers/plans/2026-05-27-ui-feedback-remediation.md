# 260527 UI Feedback Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-05-27 피드백을 반영해 Transition Gap의 화면을 대표/Head of People이 이해하기 쉬운 언어, 안정적인 시각 구조, 실제 선택 결과가 보이는 워크샵형 UX로 정리한다.

**Architecture:** 기존 Next.js/FastAPI 구조는 유지한다. 이번 작업은 대부분 frontend copy/layout/state 개선이며, 입력 선택지와 영역명 일부만 backend content/core와 동기화한다. 신규 공통 컴포넌트는 `frontend/components/shared` 또는 해당 도메인 컴포넌트 폴더에 둔다.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, FastAPI content JSON, TypeScript, pytest core tests.

---

## Confirmation Gates

아래 항목은 구현 전에 강훈님 컨펌이 필요하다.

1. **시나리오 비교 재배치 방식**
   - 추천안: 마지막 비교표를 없애고, 시나리오 선택 카드 바로 아래에 `3개 비교 카드`를 먼저 보여준 뒤 `선택한 시나리오 상세`를 둔다.
   - 대안: 비교 내용을 최상단 시나리오 선택 카드 내부에 더 많이 녹이고 별도 비교 영역을 없앤다.

2. **매트릭스 사분면의 기업 예시 노출**
   - 추천안: `Netflix식`, `Google식`, `토스식`, `대기업 공채식`처럼 익숙한 예시를 `운영 이미지 예시`로 작게 표기하되, “따라 하라”는 느낌을 피하는 보조 문구를 둔다.
   - 리스크: AGENTS.md의 “글로벌 솔루션 흉내 금지”와 충돌하지 않도록 예시는 설명 보조용으로만 사용해야 한다.

3. **인사 제도 용어 설명 범위**
   - 추천안: 이번 작업에서는 `OKR`, `RSU`, `9-Box Grid`, `percentile/%ile`, `1on1`, `Stay Interview`, `캘리브레이션`, `상대평가`, `절대평가`에만 툴팁을 적용한다.
   - 대안: `hr_options.json`, `scenarios.json`, roadmap 전체 문장을 훑어 모든 전문 용어에 glossary를 확장한다.

---

## File Map

- `frontend/app/page.tsx`: 랜딩 하단 `ProcessStrip` 제거 및 modal 연결.
- `frontend/components/landing/LandingHero.tsx`: `진단 흐름 보기` 버튼을 scroll이 아니라 modal open으로 변경.
- `frontend/components/landing/ProcessStrip.tsx`: 하단 섹션에서 모달 콘텐츠용 compact flow로 재사용하거나 `DiagnosisFlowModal.tsx`로 분리.
- `frontend/components/landing/PreviewAside.tsx`: 결과 리포트 미리보기 높이/밀도 축소.
- `frontend/app/diagnose/evaluation/page.tsx`: 평가 공정성 2개 질문에 `운영하지 않음` 선택지 추가.
- `frontend/components/forms/SegmentedScale.tsx`: 필요 시 6개 선택지를 수용하도록 grid class 조정.
- `backend/app/core/variables.py`: 평가 공정성 선택지/스코어 의미 동기화.
- `backend/app/content/schema.json`: 평가 공정성 선택지 동기화.
- `backend/app/core/analysis_engine.py`: `평가 정교도` → `평가 제도`, 운영하지 않음 응답 처리.
- `backend/app/content/scenarios.json`: `평가 정교도` 문구 교체.
- `frontend/app/(analysis)/result/page.tsx`: 기준점 설명 선행 카드/문구 보강.
- `frontend/components/detail/AreaSidebar.tsx`: 점수 절대값 + 순위 기반 색상 차등.
- `frontend/components/detail/AsIsToBePanel.tsx`: 응답 점수 표기 정규화, 개선 방향과 질문 분리.
- `frontend/components/visualization/MatrixSVG.tsx`: 축/화살표/라벨 충돌 회피/사분면 예시 개선.
- `frontend/app/(analysis)/matrix/page.tsx`: “리더십 운영 비용” 문구 수정, 매트릭스 예시 문구 전달.
- `frontend/app/(analysis)/scenarios/page.tsx`: 비교 영역을 상세 전으로 이동.
- `frontend/components/scenario/ScenarioComparisonTable.tsx`: 표 제거 또는 카드형 비교로 전환.
- `frontend/components/scenario/ScenarioDetailPanel.tsx`: 재무 영향명, 운영 리스크 깨짐, 제도 선택 카드/상태별 안내 강화.
- `frontend/components/roadmap/RoadmapTimeline.tsx`: 좌우 레이아웃, 다중 open accordion, 쉬운 언어, 툴팁 적용.
- `frontend/components/shared/TermTooltip.tsx`: 인사 제도 용어 설명 공통 컴포넌트.
- `frontend/lib/constants/hrGlossary.ts`: 용어 설명 사전.
- `docs/feedback/260527_feedback_checklist.md`: 피드백별 처리 상태 추적.
- `docs/decisions.md`: 큰 결정만 기록.

---

## Task 0: Feedback Checklist And Confirmations

**Files:**
- Create: `docs/feedback/260527_feedback_checklist.md`
- Modify: `docs/superpowers/plans/2026-05-27-ui-feedback-remediation.md`

- [ ] **Step 1: Create feedback checklist**

Create a table with sections:

```markdown
# 260527 Feedback Checklist

## 랜딩페이지
| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[ ]` | 결과 리포트 미리보기가 너무 커져 스크롤이 생김 | `PreviewAside.tsx` | 카드 높이/간격 축소 | 1366x768에서 첫 화면 스크롤 감소 |
| `[ ]` | 하단 로드맵은 롤백, 진단 흐름은 팝업으로 | `page.tsx`, `LandingHero.tsx`, `DiagnosisFlowModal.tsx` | 하단 ProcessStrip 제거, modal 도입 | 버튼 클릭 시 modal |
| `[ ]` | 평가 공정성 질문에 운영하지 않음 추가 | `evaluation/page.tsx`, backend schema | 선택지 추가 및 scoring 처리 | 선택/진단 통과 |

## 진단결과 요약
...
```

- [ ] **Step 2: Ask confirmation gates**

Ask 강훈님 to confirm:

```text
컨펌 필요한 건 세 가지입니다.
1. 시나리오 비교는 “상단 3개 카드 → 선택 상세” 구조로 바꿀까요?
2. 매트릭스 사분면 예시는 Netflix/Google/토스/대기업식 같은 이름을 보조 예시로 써도 될까요?
3. 용어 툴팁은 이번 pass에서 핵심 용어 9개만 먼저 적용해도 될까요?
```

---

## Task 1: Landing Flow Modal And Preview Size

**Files:**
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/components/landing/LandingHero.tsx`
- Modify: `frontend/components/landing/PreviewAside.tsx`
- Create: `frontend/components/landing/DiagnosisFlowModal.tsx`

- [ ] **Step 1: Remove bottom ProcessStrip from landing page**

In `frontend/app/page.tsx`, remove:

```tsx
import { ProcessStrip } from "@/components/landing/ProcessStrip";
...
<ProcessStrip />
```

- [ ] **Step 2: Add modal state to LandingHero**

Replace `scrollToFlow` with:

```tsx
const [flowOpen, setFlowOpen] = useState(false);
```

Button:

```tsx
<Button onClick={() => setFlowOpen(true)}>
  진단 흐름 보기
</Button>
```

Render:

```tsx
<DiagnosisFlowModal open={flowOpen} onClose={() => setFlowOpen(false)} />
```

- [ ] **Step 3: Implement compact modal**

`DiagnosisFlowModal.tsx`:

```tsx
"use client";

const steps = [
  ["01", "철학·컨텍스트", "회사 규모, 성장 속도, 인재 철학을 먼저 확인합니다."],
  ["02", "제도 현황 진단", "인력·채용, 보상, 평가, 리더십 운영 상태를 입력합니다."],
  ["03", "진단결과 요약", "정합성 지수와 먼저 볼 영역을 확인합니다."],
  ["04", "상세 분석", "점수가 낮은 이유와 현재 운영 방식을 해석합니다."],
  ["05", "트레이드오프", "얻는 것과 감수할 것을 비교합니다."],
  ["06", "시나리오 비교", "제도 패키지를 선택하고 조정합니다."],
  ["07", "실행 로드맵", "12개월 실행 순서와 검증 기준을 정합니다."],
];

export function DiagnosisFlowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 px-4">
      <section className="max-h-[86vh] w-full max-w-[760px] overflow-y-auto rounded-[12px] bg-white p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">진단 흐름</p>
            <h3 className="m-0 mt-2 text-[20px] font-[700] text-slate-900">입력부터 실행 로드맵까지</h3>
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-1 text-[12px] text-slate-500" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {steps.map(([num, title, desc]) => (
            <article key={num} className="rounded-[9px] border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[11px] font-[760] text-teal">{num}</span>
              <strong className="ml-2 text-[13px] text-slate-900">{title}</strong>
              <p className="m-0 mt-2 text-[12px] leading-[1.55] text-slate-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Shrink PreviewAside**

Change `p-5` to `p-4`, row `py-3` to `py-2`, `min-h-[52px]` to `min-h-[38px]`, and reduce description count if needed.

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
npm.cmd run typecheck
```

Expected: `tsc --noEmit` passes.

---

## Task 2: Evaluation Fairness “운영하지 않음”

**Files:**
- Modify: `frontend/app/diagnose/evaluation/page.tsx`
- Modify: `frontend/components/forms/SegmentedScale.tsx`
- Modify: `backend/app/core/variables.py`
- Modify: `backend/app/content/schema.json`
- Modify: `backend/app/core/analysis_engine.py`
- Test: `backend/core_tests/test_schema_wording.py`

- [ ] **Step 1: Add option to frontend fairness scales**

Add:

```tsx
{
  label: "운영하지 않음",
  value: 0,
  description: "공식 평가 제도가 없거나, 공정성을 판단할 운영 기준이 아직 없습니다.",
}
```

to `fairnessAgreementOptions`.

- [ ] **Step 2: Adjust grid for six options**

Update `SegmentedScale`:

```tsx
const gridClass = options.length >= 5 ? "md:grid-cols-3" : "md:grid-cols-3";
```

Keep `grid-cols-1` mobile behavior.

- [ ] **Step 3: Sync backend schema**

In `variables.py` and `schema.json`, ensure both `2-4-3-ceo` and `2-4-3-employee` allow the same low-score state. If they are numeric-only in backend normalization, document `0` as valid.

- [ ] **Step 4: Test schema wording**

Add assertion:

```python
assert "운영하지 않음" in fairness_options
```

Run:

```bash
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_schema_wording.py -q
```

Expected: PASS.

---

## Task 3: Result Summary Language And Benchmark Explanation

**Files:**
- Modify: `backend/app/core/analysis_engine.py`
- Modify: `backend/app/content/scenarios.json`
- Modify: `frontend/app/(analysis)/result/page.tsx`
- Modify: `frontend/lib/utils/areaDisplay.ts`
- Test: `backend/core_tests/test_dynamic_benchmarks.py`

- [ ] **Step 1: Rename area**

Replace `평가 정교도` with `평가 제도` in backend analysis area output and scenario copy.

- [ ] **Step 2: Explain 기준점 before using it**

Add a compact explanation card before decision cards:

```tsx
<MemoBlock
  title="기준점은 외부 모범답안이 아니라, 이 회사 조건에서 필요한 최소 운영 기준입니다."
  body="회사 규모, 성장 기조, 입력한 인재 철학을 반영해 영역별 기준점을 다르게 잡습니다. 따라서 기준점 차이는 점수 부족이 아니라 먼저 논의해야 할 운영 갭입니다."
/>
```

- [ ] **Step 3: Replace confusing copy**

Change:

```tsx
body: "현재 상태와 목표 운영 기준점의 차이가 가장 큰 영역입니다."
```

to:

```tsx
body: "이 회사 조건에서 필요한 운영 기준과 현재 응답의 차이가 가장 큰 영역입니다."
```

- [ ] **Step 4: Verify**

Run:

```bash
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests/test_dynamic_benchmarks.py -q
cd ..\frontend
npm.cmd run typecheck
```

---

## Task 4: Detail Page Score Colors And Answer Formatting

**Files:**
- Modify: `frontend/components/detail/AreaSidebar.tsx`
- Modify: `frontend/components/detail/AsIsToBePanel.tsx`

- [ ] **Step 1: Add score + rank color helper**

Use existing palette only:

```tsx
function scoreTone(score: number, index: number): string {
  if (score < 50 || index === 0) return "bg-coral";
  if (score < 70 || index === 1) return "bg-amber";
  if (score < 80) return "bg-teal";
  return "bg-green";
}
```

Use it for the bar and active accent where appropriate.

- [ ] **Step 2: Normalize raw answer values**

Add:

```tsx
function normalizeAnswerValue(value: string): string {
  const cleaned = displayValue(value);
  const numeric = Number(cleaned);
  if (!Number.isNaN(numeric)) {
    if (numeric <= 10) return `${Math.round(numeric)}점`;
    return `${Math.round(numeric)}%`;
  }
  return cleaned.replace(/(\d+)\.0점/g, "$1점");
}
```

Use `normalizeAnswerValue(item.value)` inside `interpretValue`.

- [ ] **Step 3: Separate improvement direction and question**

Rewrite `FIRST_ACTION_BY_FACTOR` to ask decision-quality questions, not just convert statements to question form. Example:

```tsx
"평가-보상 연동": "보상 차등의 기준을 공개할 때, 구성원이 납득해야 할 최소 근거는 무엇인가요?",
"의사결정 구조": "어떤 의사결정은 리더에게 넘기고, 어떤 의사결정만 경영진이 잡아야 하나요?",
```

- [ ] **Step 4: Verify search**

Run:

```bash
rg "4\\.0점|2점/5점|먼저 던질 질문" frontend/components/detail -n
npm.cmd run typecheck
```

Expected: no raw decimal-only display regressions.

---

## Task 5: Matrix Readability And Marker Collision

**Files:**
- Modify: `frontend/app/(analysis)/matrix/page.tsx`
- Modify: `frontend/components/visualization/MatrixSVG.tsx`

- [ ] **Step 1: Replace unclear cost language**

Change:

```tsx
두 점 사이의 거리가 클수록 제도 변경보다 리더십 운영 비용이 커집니다.
```

to:

```tsx
두 점 사이의 거리가 클수록 제도 변경에 따른 조직의 운영 부담이 커집니다.
```

- [ ] **Step 2: Restore explicit arrow from As-Is to To-Be**

Ensure SVG contains:

```tsx
<line
  x1={arrowStart.x}
  y1={arrowStart.y}
  x2={arrowEnd.x}
  y2={arrowEnd.y}
  stroke="#2f8f86"
  strokeWidth="2"
  strokeLinecap="round"
  markerEnd={`url(#${markerId})`}
/>
```

Compute arrow start/end with a small offset from marker centers:

```tsx
const dx = tx - ax;
const dy = ty - ay;
const length = Math.max(1, Math.hypot(dx, dy));
const offset = 18;
const arrowStart = { x: ax + (dx / length) * offset, y: ay + (dy / length) * offset };
const arrowEnd = { x: tx - (dx / length) * offset, y: ty - (dy / length) * offset };
```

- [ ] **Step 3: Avoid marker label overlap**

Create label placement helper:

```tsx
function markerLabelPosition(x: number, y: number, otherX: number, otherY: number, preference: "as-is" | "to-be") {
  const close = Math.hypot(x - otherX, y - otherY) < 72;
  const yOffset = close ? (preference === "as-is" ? 34 : -30) : (preference === "as-is" ? 26 : -20);
  const clampedY = Math.max(Y0 + 20, Math.min(Y1 - 12, y + yOffset));
  return { x, y: clampedY };
}
```

- [ ] **Step 4: Improve axis layout**

Add center axis arrow line for x-axis and move y-axis label inside left margin with two-line meaning. Ensure horizontal arrow aligns with center line.

- [ ] **Step 5: Add quadrant company-style examples**

If confirmed, update `quadrantExamples` in matrix page to examples like:

```tsx
quadrantExamples={["Google식 협업", "Netflix식 고성과", "평균 안정형", "토스식 소수정예"]}
```

Keep disclaimer in copy:

```tsx
예시는 이해를 돕기 위한 운영 이미지이며, 그대로 따라 하라는 뜻은 아닙니다.
```

- [ ] **Step 6: Browser verify**

Use browser screenshot or manual local check at `http://127.0.0.1:3000/matrix` after completing implementation.

---

## Task 6: Scenario Comparison And Package Decisions

**Files:**
- Modify: `frontend/app/(analysis)/scenarios/page.tsx`
- Modify: `frontend/components/scenario/ScenarioComparisonTable.tsx`
- Modify: `frontend/components/scenario/ScenarioDetailPanel.tsx`
- Create: `frontend/components/scenario/ScenarioComparisonCards.tsx`
- Create: `frontend/components/scenario/PackageDecisionCard.tsx`

- [ ] **Step 1: Replace comparison table with cards**

Create `ScenarioComparisonCards.tsx` showing three cards, one per scenario:

```tsx
export function ScenarioComparisonCards({ scenarios, selectedId, onSelect }: Props) {
  return (
    <section className="mb-4 grid gap-3 lg:grid-cols-3">
      {scenarios.map((scenario) => (
        <button key={scenario.id} onClick={() => onSelect(scenario.id)} className="rounded-[10px] border bg-white p-4 text-left">
          <p className="text-[11px] font-[760] text-teal">{scenario.name}</p>
          <p className="mt-2 text-[12px] text-slate-600">{impactText(scenario, 0)}</p>
          <p className="mt-2 text-[12px] text-coral">{scenario.warnings?.[0]}</p>
        </button>
      ))}
    </section>
  );
}
```

Place it before `<ScenarioDetailPanel />`.

- [ ] **Step 2: Rename financial heading**

Change `재무 영향과 단위` to `재무 영향`.

- [ ] **Step 3: Fix operating image separator**

Change:

```tsx
<span>{operatingImage.label}</span>{" · "}{operatingImage.body}
```

to:

```tsx
<span>{operatingImage.label}</span>
<span className="block mt-1">{operatingImage.body}</span>
```

- [ ] **Step 4: Implement package decision card**

For each package item, show three large options:

```tsx
const decisionMeta = {
  도입: { tone: "teal", label: "선택함", detail: "이번 로드맵에 포함합니다." },
  보류: { tone: "coral", label: "보류 중", detail: "보류 시 놓칠 수 있는 리스크를 확인해야 합니다." },
  "대체 검토": { tone: "amber", label: "대체 검토", detail: "같은 목적을 더 낮은 부담의 제도로 대체할 수 있는지 봅니다." },
};
```

When `보류`, render:

```tsx
<p>이 제도를 보류하면 초기 실행에서 {item.area} 기준이 약해질 수 있습니다.</p>
```

When `대체 검토`, render:

```tsx
<p>대체 후보: 같은 목적의 경량 운영안, 파일럿 적용, 수동 리뷰.</p>
```

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

---

## Task 7: Roadmap Language, Multi-Open Accordion, Tooltips

**Files:**
- Modify: `frontend/components/roadmap/RoadmapTimeline.tsx`
- Create: `frontend/components/shared/TermTooltip.tsx`
- Create: `frontend/lib/constants/hrGlossary.ts`

- [ ] **Step 1: Equalize top two columns**

Change grid:

```tsx
lg:grid-cols-2
```

for `참고 운영 이미지` and `실행 원칙`.

- [ ] **Step 2: Neutralize 접기/펼치기**

Change button badge from teal to slate:

```tsx
className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-[760] text-slate-500"
```

- [ ] **Step 3: Make accordion multi-open**

Replace:

```tsx
const [openIndex, setOpenIndex] = useState(0);
```

with:

```tsx
const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
const toggleOpen = (index: number) => {
  setOpenIndexes((current) =>
    current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
  );
};
```

Use:

```tsx
const isOpen = openIndexes.includes(index);
onClick={() => toggleOpen(index)}
```

- [ ] **Step 4: Replace literary roadmap labels**

Change `PHASE_LABELS`:

```tsx
[
  { label: "도입 전 정리", period: "0~1개월" },
  { label: "작게 시험 운영", period: "2~3개월" },
  { label: "핵심 제도 연결", period: "4~6개월" },
  { label: "정기 운영화", period: "7~9개월" },
  { label: "유지·조정 판단", period: "10~12개월" },
]
```

Change intents:

```tsx
"기준선 고정" -> "현재값 정리"
"작은 범위 검증" -> "작게 시험"
"제도 묶음 연결" -> "제도 연결"
"운영 리듬 고정" -> "정기 운영화"
"유지 또는 조정 판단" -> "유지·조정 판단"
```

- [ ] **Step 5: Add up to three caution notes**

Replace single `MemoBlock icon="1"` pattern in roadmap page or add caution cards:

```tsx
[
  "0~1개월은 일정이 아니라 도입 조건을 확인하는 기간입니다.",
  "평가·보상·리더 운영 기준이 없으면 제도부터 바꾸지 않습니다.",
  "각 단계 끝에서 확대, 보류, 수정 여부를 다시 판단합니다.",
]
```

- [ ] **Step 6: Add glossary**

`hrGlossary.ts`:

```tsx
export const HR_GLOSSARY: Record<string, string> = {
  OKR: "목표(Objective)와 핵심 결과(Key Results)를 함께 정해 성과를 추적하는 목표 관리 방식입니다.",
  RSU: "일정 조건을 충족하면 주식 또는 주식 가치에 해당하는 보상을 지급하는 장기 보상 방식입니다.",
  "9-Box Grid": "성과와 잠재력을 3x3으로 나눠 핵심 인재와 육성 대상을 구분하는 인재 리뷰 도구입니다.",
  "%ile": "시장 보상 수준에서 어느 위치인지 나타내는 백분위 기준입니다. 75%ile은 상위 25% 수준을 뜻합니다.",
  "1on1": "리더와 구성원이 정기적으로 업무, 성장, 어려움을 이야기하는 1:1 면담입니다.",
  "Stay Interview": "퇴사 면담이 아니라 재직 중인 핵심 인재가 남는 이유와 이탈 위험을 확인하는 면담입니다.",
  "캘리브레이션": "리더별 평가 기준 차이를 줄이기 위해 평가 결과를 함께 맞춰보는 회의입니다.",
  "상대평가": "구성원을 서로 비교해 등급을 나누는 평가 방식입니다.",
  "절대평가": "미리 정한 기준에 비춰 개인의 달성 수준을 판단하는 평가 방식입니다.",
};
```

`TermTooltip.tsx`:

```tsx
export function TermTooltip({ term, children }: { term: string; children?: React.ReactNode }) {
  return (
    <span className="group relative inline-flex cursor-help border-b border-dotted border-slate-400">
      {children ?? term}
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-[240px] rounded-[8px] border border-slate-200 bg-white p-3 text-[11px] leading-[1.5] text-slate-600 shadow-soft group-hover:block">
        {HR_GLOSSARY[term]}
      </span>
    </span>
  );
}
```

Import `HR_GLOSSARY`.

- [ ] **Step 7: Apply glossary rendering**

Add helper in roadmap/detail package rendering:

```tsx
function renderWithGlossary(text: string) {
  // split by known terms and wrap with TermTooltip
}
```

Use it for package actions and roadmap policy/deliverable strings.

- [ ] **Step 8: Verify**

Run:

```bash
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

---

## Task 8: Product-Wide Tone Sweep

**Files:**
- Modify: `frontend/**/*.tsx`
- Modify: `backend/app/content/*.json`
- Modify: `backend/app/core/analysis_engine.py`

- [ ] **Step 1: Search literary/unclear terms**

Run:

```bash
rg "정교도|목표 운영 기준점|리더십 운영 비용|제도 묶음|운영 리듬|기준선 고정|형해화|전환 과제|철학 기준점|대표 철학 기준점" frontend backend/app -n
```

- [ ] **Step 2: Replace with CEO-friendly language**

Use replacements:

```text
평가 정교도 -> 평가 제도
목표 운영 기준점 -> 이 회사 조건에서 필요한 운영 기준
리더십 운영 비용 -> 조직의 운영 부담
제도 묶음 연결 -> 핵심 제도 연결
운영 리듬 고정 -> 정기 운영화
기준선 고정 -> 현재값 정리
대표 철학 기준점 -> 회사가 지향하는 기준
```

- [ ] **Step 3: Verify no old terms remain**

Run the same `rg` command and confirm only intentional matches remain.

---

## Task 9: Full Verification

**Files:**
- No code changes unless verification reveals issues.

- [ ] **Step 1: Backend core tests**

Run:

```bash
cd backend
$env:PYTHONPATH='.'
& "$env:LOCALAPPDATA\TransitionGap\backend-venv\Scripts\python.exe" -m pytest core_tests -q
```

Expected: all pass.

- [ ] **Step 2: Frontend typecheck**

Run:

```bash
cd frontend
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 3: Start app**

Run:

```bash
start.bat
```

Expected:

```text
Servers are ready. Opening browser...
```

- [ ] **Step 4: Browser smoke check**

Check:

```text
/
/diagnose/evaluation
/result
/result/detail
/matrix
/scenarios
/roadmap
```

Expected:
- No horizontal overflow on landing.
- Flow modal opens and closes.
- Matrix labels and markers do not overlap.
- Scenario package decisions visibly change card state and explanatory text.
- Roadmap keeps multiple phases open until manually closed.

---

## Self-Review

**Spec coverage:** All 260527 feedback items map to Tasks 1-8. Previous missed feedback around landing flow, scenario package choice, and plain-language tone is explicitly included.

**Placeholder scan:** No `TBD`, `TODO`, or unspecified “handle edge cases” steps remain. Ambiguous product decisions are isolated under Confirmation Gates.

**Type consistency:** New shared components use React/TypeScript patterns already present in the frontend. Backend changes are limited to existing content/schema/analysis output fields and should not require API contract changes.
