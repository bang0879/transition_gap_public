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

assert.equal(resultPage.includes("DiagnosticFinishButton"), true, "result page should use the diagnostic finish button");
assert.equal(roadmapPage.includes("DiagnosticFinishButton"), true, "roadmap page should use the diagnostic finish button");
assert.equal(existsSync(finishPagePath), true, "finish page should exist");
assert.equal(stepsSource.includes('id: "finish"'), true, "result steps should include a finish tab");
assert.equal(stepsSource.includes('label: "진단 마무리"'), true, "finish tab should be labeled diagnostic finish");
assert.equal(stepsSource.includes('path: "/finish"'), true, "finish tab should point to /finish");

const finishPage = readFileSync(finishPagePath, "utf8");
assert.equal(finishPage.includes("진단보고서 다운로드"), true, "finish page should expose the diagnostic report download as the main CTA");
assert.equal(finishPage.includes("5페이지"), true, "finish page should describe the report as five pages");
assert.equal(finishPage.includes("6페이지"), false, "finish page should not describe the report as six pages");
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
assert.equal(pdfPageCount, 5, "diagnostic PDF should render five A4 pages");
assert.equal(pdfDocumentSource.includes('Footer page="5 / 5"'), true, "diagnostic PDF should include a fifth page footer");
assert.equal(pdfDocumentSource.includes('Footer page="6 / 6"'), false, "diagnostic PDF should not include a sixth page footer");
assert.equal(pdfDocumentSource.includes("진단 해석 메모"), true, "diagnostic PDF should identify itself as an interpretation memo");
assert.equal(pdfDocumentSource.includes("대표님이 의도하신 운영과 조직이 받아들이는 운영이 지금 다르게 작동하고 있습니다."), true, "cover should use the broader mirror sentence");
assert.equal(pdfDocumentSource.includes("normalizeCompanyName"), true, "PDF should guard missing or placeholder company names");

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
