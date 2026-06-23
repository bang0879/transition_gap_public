import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const panel = readFileSync(new URL("../components/detail/AsIsToBePanel.tsx", import.meta.url), "utf8");

test("as-is panel uses choice and criteria language instead of improvement pressure", () => {
  assert.match(panel, /현재 선택과 다음 확인 기준/);
  assert.match(panel, /다음 회의에서 확인할 기준과 질문/);
  assert.match(panel, /다음 기준/);
  assert.match(panel, /먼저 확인할 질문/);
  assert.doesNotMatch(panel, /현재 방식과 바꿀 운영 기준/);
  assert.doesNotMatch(panel, /개선 방향/);
  assert.doesNotMatch(panel, /우선 전환/);
});
