import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
}

const resultPage = readFileSync(join(frontendRoot, "app/(analysis)/result/page.tsx"), "utf8");
const roadmapPage = readFileSync(join(frontendRoot, "app/(analysis)/roadmap/page.tsx"), "utf8");

assert.equal(resultPage.includes("DiagnosticFinishButton"), true, "result page should use the diagnostic finish button");
assert.equal(roadmapPage.includes("DiagnosticFinishButton"), true, "roadmap page should use the diagnostic finish button");

console.log("reportCompletionCta tests passed");
