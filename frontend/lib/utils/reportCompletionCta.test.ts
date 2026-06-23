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

assert.equal(resultPage.includes("DiagnosticFinishButton"), true, "result page should use the diagnostic finish button");
assert.equal(roadmapPage.includes("DiagnosticFinishButton"), true, "roadmap page should use the diagnostic finish button");
assert.equal(existsSync(finishPagePath), true, "finish page should exist");

const finishPage = readFileSync(finishPagePath, "utf8");
assert.equal(finishPage.includes("PDF 보고서 저장"), true, "finish page should offer PDF report saving");
assert.equal(finishPage.includes("진단 데이터 백업"), false, "finish page should not mention data backup");
assert.equal(finishPage.includes("JSON 데이터"), false, "finish page should not mention JSON data");

console.log("reportCompletionCta tests passed");
