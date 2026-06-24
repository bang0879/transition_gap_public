import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const detailPage = readFileSync(new URL("../app/(analysis)/result/detail/page.tsx", import.meta.url), "utf8");
const panelUrl = new URL("../components/detail/StageGuidancePanel.tsx", import.meta.url);

test("detail page renders stage guidance between score and as-is panels", () => {
  assert.match(detailPage, /StageGuidancePanel/);
  assert.match(detailPage, /<StageGuidancePanel guidance={active\.stage_guidance} \/>/);
  assert.ok(
    detailPage.indexOf("<ScoreHero") < detailPage.indexOf("<StageGuidancePanel"),
    "stage guidance should follow the score hero",
  );
  assert.ok(
    detailPage.indexOf("<StageGuidancePanel") < detailPage.indexOf("<AsIsToBePanel"),
    "stage guidance should precede the operational detail panel",
  );
});

test("stage guidance panel names choices, deferrals, and self-serve actions", () => {
  assert.ok(existsSync(panelUrl), "StageGuidancePanel component should exist");
  const panel = readFileSync(panelUrl, "utf8");

  assert.match(panel, /현재 선택/);
  assert.match(panel, /이 단계에서 미뤄도 되는 것/);
  assert.match(panel, /혼자 가능한 시작/);
  assert.match(panel, /외부 도움은 나중에/);
});
