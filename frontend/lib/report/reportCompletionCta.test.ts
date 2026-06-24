import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const frontendRoot = process.cwd();
const checkedFiles = [
  "app/(analysis)/report/page.tsx",
  "app/(analysis)/roadmap/page.tsx",
  "components/report/ReportDownloadButton.tsx",
];

for (const relativePath of checkedFiles) {
  const source = readFileSync(join(frontendRoot, relativePath), "utf8");
  assert.equal(source.includes("window.print()"), false, `${relativePath} should not call window.print()`);
  assert.equal(source.includes("인쇄/PDF 저장"), false, `${relativePath} should not show the old print/PDF label`);
  assert.equal(source.includes("브라우저 인쇄"), false, `${relativePath} should not show the old browser print label`);
}

const reportButton = readFileSync(join(frontendRoot, "components/report/ReportDownloadButton.tsx"), "utf8");
assert.equal(reportButton.includes("진단 마무리"), true, "report completion button should use the final CTA label");

console.log("reportCompletionCta tests passed");
