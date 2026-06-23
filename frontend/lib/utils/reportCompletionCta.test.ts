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
assert.equal(finishPage.includes("결과 요약으로"), false, "finish page should not look like a jump back to result summary");
assert.equal(finishPage.includes("preloadPdfAssets"), true, "finish page should preload PDF assets before the click");
assert.equal(finishPage.includes("prepareReportBlob"), true, "finish page should prepare the PDF blob before the click when data is ready");
assert.equal(finishPage.includes("진단 데이터 백업"), false, "finish page should not mention data backup");
assert.equal(finishPage.includes("JSON 데이터"), false, "finish page should not mention JSON data");

const pdfPageCount = pdfDocumentSource.match(/<Page size="A4"/g)?.length ?? 0;
assert.equal(pdfPageCount, 6, "diagnostic PDF should render six A4 pages");
assert.equal(pdfDocumentSource.includes('Footer page="6 / 6"'), true, "diagnostic PDF should include a sixth page footer");

console.log("reportCompletionCta tests passed");