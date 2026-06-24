# A4 Diagnostic Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a six-page A4 portrait diagnostic report with consultant-grade Korean interpretation, browser preview, and PDF download.

**Architecture:** Add a report-specific deterministic ViewModel that translates diagnosis data into interpretation sections, then render the same ViewModel through browser A4 preview components and `@react-pdf/renderer` PDF components. Keep PDF code dynamically imported from a client download button so the report does not bloat normal result-page loading.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind for browser preview, `@react-pdf/renderer` for PDF, Pretendard WOFF fonts.

---

## File Structure

- Create `frontend/lib/report/buildDiagnosticReportViewModel.ts`
  - Owns deterministic interpretation logic and all page content.
- Create `frontend/lib/report/buildDiagnosticReportViewModel.test.ts`
  - Unit tests for mode, headcount, blind spot, strategic option, and decision memo generation.
- Create `frontend/components/report/ReportPreview.tsx`
  - Browser A4 preview shell for six portrait pages.
- Create `frontend/components/report/ReportCharts.tsx`
  - Browser preview versions of the report-native visuals.
- Create `frontend/app/(analysis)/report/page.tsx`
  - Client route that builds the ViewModel from diagnosis/store state and displays the A4 preview plus PDF download action.
- Create `frontend/components/report/ReportDownloadButton.tsx`
  - Client button that dynamically imports `@react-pdf/renderer` and the PDF document.
- Create `frontend/components/report/pdf/registerReportFonts.ts`
  - Registers Pretendard fonts for PDF.
- Create `frontend/components/report/pdf/ReportPdfDocument.tsx`
  - Six-page A4 portrait PDF document.
- Create `frontend/components/report/pdf/ReportPdfCharts.tsx`
  - PDF-compatible chart primitives.
- Modify `frontend/app/(analysis)/result/page.tsx`
  - Change the report CTA from `window.print()` to `/report`.

## Task 1: Report ViewModel

**Files:**
- Create: `frontend/lib/report/buildDiagnosticReportViewModel.ts`
- Create: `frontend/lib/report/buildDiagnosticReportViewModel.test.ts`

- [ ] **Step 1: Write ViewModel tests**

Test exact expected behaviors:

```ts
import { buildDiagnosticReportViewModel } from "./buildDiagnosticReportViewModel";
import type { DiagnoseResponse } from "@/lib/types/api";

const baseDiagnosis: DiagnoseResponse = {
  diagnosis_mode: "hybrid",
  areas: [
    { area_id: "compensation", area_name: "보상", score: 55, benchmark: 70, gap: 15, priority: 1, difficulty: "medium", status_text: "주의", issues: [], recommendation: "", tags: [], score_breakdown: [] },
    { area_id: "evaluation", area_name: "평가", score: 58, benchmark: 70, gap: 12, priority: 2, difficulty: "medium", status_text: "주의", issues: [], recommendation: "", tags: [], score_breakdown: [] },
    { area_id: "leadership", area_name: "리더십", score: 60, benchmark: 70, gap: 10, priority: 3, difficulty: "high", status_text: "주의", issues: [], recommendation: "", tags: [], score_breakdown: [] },
  ],
  visibility: { score: 76, tier: "ok", tier_message: "", blind_spots: [], blind_spot_labels: [], blind_spot_tips: [] },
  matrix: {
    a_x_as_is: 0, a_y_as_is: 0, a_x_to_be: 0.7, a_y_to_be: 0.7,
    b_x_as_is: 0, b_y_as_is: 0, b_x_to_be: 0.4, b_y_to_be: 0.5,
    a_quadrant_as_is: "균형형", a_quadrant_to_be: "성과 책임형",
    b_quadrant_as_is: "자율형", b_quadrant_to_be: "책임 운영형",
    pain_point_dispersion: 0.3,
  },
  alignment: { score: 68, base_score: 80, total_penalty: 12, conflicts: [] },
  alignment_map: {
    alignment_score: 64,
    alignment_level: "주의",
    dispersion: 0.2,
    centroid_x: 0,
    centroid_y: 0,
    headline: "",
    summary: "",
    vectors: [],
    axes: [
      {
        domain_id: "compensation",
        domain_name: "보상",
        left_label: "형평",
        right_label: "성과",
        philosophy_label: "성과 차등",
        philosophy_note: null,
        actual_label: "관계 조정",
        policy_direction: "성과 책임",
        alignment_percent: 42,
        status_label: "심각",
        philosophy_position: 0.8,
        actual_position: -0.4,
        tension: 1.2,
        tension_level: "misaligned",
        headline: "",
        evidence: [],
        business_risk: "보상 형평성 논쟁",
      },
    ],
    conflicts: [{ id: "comp-eval", title: "보상과 평가 충돌", detail: "", domains: ["compensation", "evaluation"], severity: "high" }],
  },
  insights: [],
  foundation_signals: [],
  alignment_signals: [],
};

describe("buildDiagnosticReportViewModel", () => {
  it("builds a six-page consultant report in formal Korean", () => {
    const report = buildDiagnosticReportViewModel({
      companyName: "테스트컴퍼니",
      completedAt: new Date("2026-06-22T00:00:00.000Z"),
      diagnosis: baseDiagnosis,
      responses: { "L1-2": "51~100명", "L1-3": "빠른 성장", "L1-4": "채용 확대" },
    });

    expect(report.pages).toHaveLength(6);
    expect(report.cover.title).toBe("테스트컴퍼니 인사제도 진단 보고서");
    expect(report.executive.corePattern).toContain("기준 회피");
    expect(report.blindSpots[0].headline).toContain("대표님");
    expect(report.priorityTension.chain.length).toBeGreaterThanOrEqual(4);
    expect(report.decisionMemo.decisions[0]).toContain("성과 차이");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run typecheck`

Expected: FAIL because `frontend/lib/report/buildDiagnosticReportViewModel.ts` does not exist.

- [ ] **Step 3: Implement the ViewModel**

Add typed interfaces:

```ts
export interface DiagnosticReportViewModel {
  pages: Array<{ pageNumber: number; title: string }>;
  cover: ReportCover;
  executive: ExecutiveInterpretation;
  blindSpots: BlindSpot[];
  priorityTension: PriorityTension;
  strategicOptions: StrategicOption[];
  decisionMemo: DecisionMemo;
}
```

Use deterministic rules:

- Sort priority areas by `gap DESC`.
- Pick the lowest alignment-percent axis as the primary axis.
- Use headcount response `L1-2` to select stage commentary.
- Use alignment conflicts to pick connected tension copy.
- Always use 존대 in end-user report copy.

- [ ] **Step 4: Run typecheck**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add frontend/lib/report/buildDiagnosticReportViewModel.ts frontend/lib/report/buildDiagnosticReportViewModel.test.ts
git commit -m "feat: add diagnostic report view model"
```

## Task 2: Browser A4 Preview

**Files:**
- Create: `frontend/components/report/ReportPreview.tsx`
- Create: `frontend/components/report/ReportCharts.tsx`
- Create: `frontend/app/(analysis)/report/page.tsx`

- [ ] **Step 1: Build report preview components**

Implement six A4 page sections:

```tsx
export function ReportPreview({ report }: { report: DiagnosticReportViewModel }) {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6 py-8 print:bg-white">
      <ReportPage pageNumber={1}>{/* Cover */}</ReportPage>
      <ReportPage pageNumber={2}>{/* Executive Interpretation */}</ReportPage>
      <ReportPage pageNumber={3}>{/* CEO Blind Spots */}</ReportPage>
      <ReportPage pageNumber={4}>{/* Priority Tension */}</ReportPage>
      <ReportPage pageNumber={5}>{/* Strategic Options */}</ReportPage>
      <ReportPage pageNumber={6}>{/* CEO Decision Memo */}</ReportPage>
    </div>
  );
}
```

Use CSS dimensions:

```tsx
className="min-h-[1122px] w-[794px] bg-white px-[56px] py-[48px] shadow-sm"
```

- [ ] **Step 2: Build browser charts**

Add:

- `TensionGauge`
- `BlindSpotGrid`
- `TensionChain`
- `StrategicOptionsGrid`
- `DecisionMemoChecklist`

- [ ] **Step 3: Add `/report` route**

The route should:

- call `useDiagnosis()`
- read `companyName` and `responses`
- call `buildFallbackAlignmentMap()` if diagnosis has no alignment axes
- build the ViewModel
- render `ReportPreview`
- show `ReportDownloadButton`

- [ ] **Step 4: Run typecheck**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add frontend/components/report/ReportPreview.tsx frontend/components/report/ReportCharts.tsx "frontend/app/(analysis)/report/page.tsx"
git commit -m "feat: add A4 report preview"
```

## Task 3: PDF Document And Dynamic Download

**Files:**
- Create: `frontend/components/report/ReportDownloadButton.tsx`
- Create: `frontend/components/report/pdf/registerReportFonts.ts`
- Create: `frontend/components/report/pdf/ReportPdfDocument.tsx`
- Create: `frontend/components/report/pdf/ReportPdfCharts.tsx`

- [ ] **Step 1: Register fonts**

Register:

- `/fonts/pretendard-400.woff`
- `/fonts/pretendard-700.woff`

- [ ] **Step 2: Build PDF document**

Use `@react-pdf/renderer` with:

```tsx
<Document title={`${report.cover.companyName} 인사제도 진단 보고서`}>
  <Page size="A4" style={styles.page}>{/* page 1 */}</Page>
  <Page size="A4" style={styles.page}>{/* page 2 */}</Page>
  <Page size="A4" style={styles.page}>{/* page 3 */}</Page>
  <Page size="A4" style={styles.page}>{/* page 4 */}</Page>
  <Page size="A4" style={styles.page}>{/* page 5 */}</Page>
  <Page size="A4" style={styles.page}>{/* page 6 */}</Page>
</Document>
```

- [ ] **Step 3: Build dynamic download button**

On click:

```ts
const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
  import("@react-pdf/renderer"),
  import("./pdf/ReportPdfDocument"),
]);
const blob = await pdf(<ReportPdfDocument report={report} />).toBlob();
```

Then download with an object URL.

- [ ] **Step 4: Run typecheck**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add frontend/components/report/ReportDownloadButton.tsx frontend/components/report/pdf
git commit -m "feat: generate diagnostic report pdf"
```

## Task 4: Result CTA Integration

**Files:**
- Modify: `frontend/app/(analysis)/result/page.tsx`

- [ ] **Step 1: Replace print CTA behavior**

Remove direct `window.print()` CTA and navigate to `/report`.

Expected action label:

```tsx
<Button onClick={() => handleNavigate("open_report", "/report")}>진단 보고서 보기</Button>
```

- [ ] **Step 2: Run typecheck**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 3: Commit**

```powershell
git add "frontend/app/(analysis)/result/page.tsx"
git commit -m "feat: link result page to diagnostic report"
```

## Task 5: Verification And Push

**Files:**
- Modify only if needed based on verification failures.

- [ ] **Step 1: Build**

Run: `npm.cmd run build`

Expected: PASS.

- [ ] **Step 2: Typecheck**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 3: Optional PDF smoke render**

If a script is added, generate a sample PDF and verify:

- Korean text is extractable with `pdftotext`
- Poppler can render pages to PNG
- Page count is six

- [ ] **Step 4: Push branch**

Run:

```powershell
git push -u origin codex/a4-diagnostic-report
```

Expected: Branch pushed successfully.
