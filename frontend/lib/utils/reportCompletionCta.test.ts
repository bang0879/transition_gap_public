import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const frontendRoot = process.cwd();
const checkedFiles = [
  "app/(analysis)/result/page.tsx",
  "app/(analysis)/roadmap/page.tsx",
];

for (const relativePath of checkedFiles) {
  const source = readFileSync(join(frontendRoot, relativePath), "utf8");
  assert.equal(source.includes("window.print()"), false, `${relativePath} should not call window.print()`);
  assert.equal(source.includes("인쇄/PDF 저장"), false, `${relativePath} should not show the old print/PDF label`);
  assert.equal(source.includes("브라우저 인쇄"), false, `${relativePath} should not show the old browser print label`);
  assert.equal(source.includes("JSON"), false, `${relativePath} should not mention JSON backup in visible copy`);
}

const resultPage = readFileSync(join(frontendRoot, "app/(analysis)/result/page.tsx"), "utf8");
const roadmapPage = readFileSync(join(frontendRoot, "app/(analysis)/roadmap/page.tsx"), "utf8");
const finishPagePath = join(frontendRoot, "app/(analysis)/finish/page.tsx");
const stepsSource = readFileSync(join(frontendRoot, "lib/constants/steps.ts"), "utf8");
const pdfDocumentSource = readFileSync(join(frontendRoot, "components/finish/DiagnosticPdfDocument.tsx"), "utf8");

function countOccurrences(source: string, term: string): number {
  return source.split(term).length - 1;
}

function countLinesContaining(source: string, term: string): number {
  return source.split(/\r?\n/).filter((line) => line.includes(term)).length;
}

assert.equal(resultPage.includes("DiagnosticFinishButton"), true, "result page should use the diagnostic finish button");
assert.equal(roadmapPage.includes("DiagnosticFinishButton"), true, "roadmap page should use the diagnostic finish button");
assert.equal(existsSync(finishPagePath), true, "finish page should exist");
assert.equal(stepsSource.includes('id: "finish"'), true, "result steps should include a finish tab");
assert.equal(stepsSource.includes('label: "진단 마무리"'), true, "finish tab should be labeled diagnostic finish");
assert.equal(stepsSource.includes('path: "/finish"'), true, "finish tab should point to /finish");

const finishPage = readFileSync(finishPagePath, "utf8");
assert.equal(finishPage.includes("진단보고서 다운로드"), true, "finish page should expose the diagnostic report download as the main CTA");
assert.equal(finishPage.includes("6페이지"), true, "finish page should describe the report as six pages");
assert.equal(finishPage.includes("5페이지"), false, "finish page should not describe the report as five pages");
assert.equal(finishPage.includes("대표용 진단 보고서"), true, "finish page should frame the download as a diagnostic report");
assert.equal(finishPage.includes("먼저 혼자 읽으시고, 다음 리더십 회의에서 함께 보시는 문서입니다."), true, "finish page should preview the report usage guide");
assert.equal(finishPage.includes("진단 해석 메모"), false, "finish page should not narrow the report identity to an interpretation memo");
assert.equal(finishPage.includes("진단 구간"), false, "finish page should avoid internal diagnostic labels");
assert.equal(finishPage.includes("normalizeCompanyNameForReport"), true, "finish page should normalize missing or placeholder company names before export");
assert.equal(finishPage.includes('companyName || "우리 회사"'), false, "finish page should not use a generic company name fallback in report exports");
assert.equal(finishPage.includes('disabled={isSaving || reportStatus === "preparing"}'), false, "download button should not be disabled while the report is pre-generating");
assert.equal(finishPage.includes('disabled={isSaving || !exportData}'), false, "download button should not be disabled while export data is settling");
assert.equal(finishPage.includes('disabled={isSaving}'), true, "download button should only be disabled while an explicit download is running");
assert.equal(finishPage.includes('{buttonLabel}'), false, "download button label should not change to a preparing state");
assert.equal(finishPage.includes('상세 분석 다시 보기'), false, "finish page should not show secondary detail navigation buttons");
assert.equal(finishPage.includes('로드맵 다시 보기'), false, "finish page should not show secondary roadmap navigation buttons");
assert.equal(finishPage.includes('보고서 준비 중'), false, "finish page should not leave users staring at a report preparing state");
assert.equal(finishPage.includes('setReportStatus("preparing")'), false, "finish page should not start heavy PDF blob rendering as a blocking background state");
assert.equal(finishPage.includes("결과 요약으로"), false, "finish page should not look like a jump back to result summary");
assert.equal(finishPage.includes("preloadPdfAssets"), true, "finish page should preload PDF assets before the click");
assert.equal(finishPage.includes("prepareReportBlob"), true, "finish page should prepare the PDF blob only inside the download flow");
assert.equal(finishPage.includes("진단 데이터 백업"), false, "finish page should not mention data backup");
assert.equal(finishPage.includes("JSON 데이터"), false, "finish page should not mention JSON data");

const pdfPageCount = pdfDocumentSource.match(/<Page size="A4"/g)?.length ?? 0;
assert.equal(pdfPageCount, 6, "diagnostic PDF should render six A4 pages");
assert.equal(pdfDocumentSource.includes('Footer page="6 / 6"'), true, "diagnostic PDF should include a sixth page footer");
assert.equal(pdfDocumentSource.includes('Footer page="5 / 5"'), false, "diagnostic PDF should not retain the old five-page footer");
assert.equal(pdfDocumentSource.includes("진단 보고서"), true, "diagnostic PDF should identify itself as a diagnostic report");
assert.equal(pdfDocumentSource.includes("DIAGNOSTIC REPORT"), true, "diagnostic PDF cover should use a diagnostic report eyebrow");
assert.equal(pdfDocumentSource.includes("DIAGNOSIS SNAPSHOT"), true, "diagnostic PDF should include a diagnosis snapshot page");
assert.equal(pdfDocumentSource.includes("SnapshotRadar"), true, "snapshot page should use a report-native radar visual");
assert.equal(pdfDocumentSource.includes("IntentGapRows"), true, "snapshot page should include intent-interpretation gap rows");
assert.equal(pdfDocumentSource.includes("snapshotDataPoints"), true, "snapshot page should cite selected diagnosis inputs");
assert.equal(pdfDocumentSource.includes("classifySnapshotSignal"), true, "snapshot signals should use a shared threshold translator");
assert.equal(pdfDocumentSource.includes("SNAPSHOT_THRESHOLDS_BY_MODE"), true, "snapshot thresholds should be tokenized by diagnosis mode");
assert.equal(pdfDocumentSource.includes("philosophyColor"), true, "PDF should define a stable philosophy color token");
assert.equal(pdfDocumentSource.includes("actualColor"), true, "PDF should define a stable actual-operation color token");
assert.equal(pdfDocumentSource.includes("기준 명문화 정도"), true, "Page 4 matrix should define the explicitness axis");
assert.equal(pdfDocumentSource.includes("리더 수용성"), true, "Page 4 matrix should define the leadership adoption axis");
assert.equal(pdfDocumentSource.includes("TensionMatrix"), true, "Page 4 should use a two-axis tension matrix");
assert.equal(pdfDocumentSource.includes("DIAGNOSTIC INTERPRETATION MEMO"), false, "diagnostic PDF cover should not narrow the identity to an interpretation memo");
assert.equal(pdfDocumentSource.includes("대표가 리더십 미팅에 들고 가는 진단 해석 메모"), false, "diagnostic PDF should not use the old memo subtitle");
assert.equal(pdfDocumentSource.includes("먼저 혼자 읽으시고, 다음 리더십 회의에서 함께 보시는 문서입니다."), true, "diagnostic PDF should include the usage guide on the cover");
for (const term of ["회사명", "진단 모드", "조직 규모", "진단일", "진단자", "Kanghoon Kim"]) {
  assert.equal(pdfDocumentSource.includes(term), true, `diagnostic PDF cover should include metadata: ${term}`);
}
assert.equal(pdfDocumentSource.includes("대표님이 의도하신 운영과 조직이 받아들이는 운영이 지금 다르게 작동하고 있습니다."), true, "cover should use the broader mirror sentence");
assert.equal(pdfDocumentSource.includes("normalizeCompanyName"), true, "PDF should guard missing or placeholder company names");
assert.equal(pdfDocumentSource.includes('return PLACEHOLDER_COMPANY_NAMES.has(trimmed) ? "진단 보고서" : trimmed;'), false, "PDF should not duplicate the report title as the company fallback");
assert.equal(countLinesContaining(pdfDocumentSource, "business_risk"), 1, "diagnostic PDF should not repeat the same business risk in multiple sections");
assert.equal(countOccurrences(pdfDocumentSource, "대표가 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐"), 1, "diagnostic PDF should not repeat the same blind spot sentence on one page");
assert.equal(pdfDocumentSource.includes("axis.philosophy_label"), false, "diagnostic PDF should translate philosophy labels instead of exposing raw option labels");
assert.equal(pdfDocumentSource.includes("axis.actual_label"), false, "diagnostic PDF should translate actual-state labels instead of exposing raw option labels");
assert.equal(pdfDocumentSource.includes("priorityAreas.slice(1, 3).map"), true, "tension detail cards should exclude the hero area to avoid repeating the same sentence");
assert.equal(pdfDocumentSource.includes("styles.decisionStack"), true, "Page 4 decision cards should stack vertically to avoid squeezed text");
assert.equal(pdfDocumentSource.includes("<View style={styles.row}>\n          <View style={styles.statementCard}>\n            <Text style={styles.cardLabel}>대표에게 요구되는 변화"), false, "Page 4 decision cards should not share a narrow horizontal row");

const forbiddenPdfTerms = [
  "정합성 상태",
  "정합성 신호",
  "운영 비용",
  "Executive Summary",
  "진단 구간",
  "자연 교체 허용",
  "핵심 인재 보존",
  "status_text",
  "recommendation",
  "AreaSignal",
  "barTrack",
  "barFill",
  "coralFill",
  "alignmentScore",
];
for (const term of forbiddenPdfTerms) {
  assert.equal(pdfDocumentSource.includes(term), false, `diagnostic PDF should not expose raw result or internal term: ${term}`);
}

console.log("reportCompletionCta tests passed");
