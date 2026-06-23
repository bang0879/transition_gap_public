import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const resultPage = readFileSync(new URL("../app/(analysis)/result/page.tsx", import.meta.url), "utf8");
const executiveSummary = readFileSync(
  new URL("../components/result/ExecutiveSummaryPanel.tsx", import.meta.url),
  "utf8",
);

test("result summary leads with decision framing instead of risk framing", () => {
  assert.match(resultPage, /현재 위치와 다음 의사결정 포인트/);
  assert.doesNotMatch(resultPage, /그대로 둘 때의 운영 리스크/);
  assert.doesNotMatch(resultPage, /요약에서 충분히 찔렸다면/);
});

test("executive summary names the current operating choice before the downside", () => {
  assert.match(executiveSummary, /이 선택을 유지한다면/);
  assert.doesNotMatch(executiveSummary, /그대로 두면/);
});
