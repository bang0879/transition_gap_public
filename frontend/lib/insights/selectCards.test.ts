import assert from "node:assert/strict";
// @ts-expect-error Node 24 strip-types executes the TypeScript helper directly in this smoke test.
import { interpolateCard } from "./interpolate.ts";
// @ts-expect-error Node 24 strip-types executes the TypeScript helper directly in this smoke test.
import { placeInsightCards, selectInsightCards } from "./selectCards.ts";
import type { AlignmentAxisOut, DiagnosisSignalOut } from "../types/api";
import type { ResponseValue } from "../store/responses";

function axis(domainId: string, tension = 62): AlignmentAxisOut {
  return {
    domain_id: domainId,
    domain_name: domainId,
    left_label: "",
    right_label: "",
    philosophy_label: "",
    philosophy_note: null,
    actual_label: "",
    policy_direction: "",
    alignment_percent: Math.max(0, 100 - tension),
    status_label: tension >= 50 ? "심각" : "주의",
    philosophy_position: -0.5,
    actual_position: 0.5,
    tension,
    tension_level: tension >= 50 ? "misaligned" : "watch",
    headline: "",
    evidence: [],
    business_risk: null,
  };
}

function signal(domainId: string): DiagnosisSignalOut {
  return {
    id: `${domainId}_signal`,
    domain_id: domainId,
    domain_name: domainId,
    title: "",
    detail: "",
    severity: "high",
  };
}

const foundation30: Record<string, ResponseValue> = {
  "L1-2": "20~50인",
  "L1-4": "공격적 확장 (30%+ 인원 증가)",
  "2-2-2": "2~3개",
};

const foundationCards = selectInsightCards({
  responses: foundation30,
  mode: "foundation",
  axes: [axis("recruitment", 40)],
});

assert.equal(
  foundationCards.some((card) => card.id === "rec_referral_halflife"),
  false,
  "recommendation-channel half-life card should not trigger below 50-100 headcount bracket",
);
assert.equal(placeInsightCards(foundationCards).page3Hero, null, "0-1 insight cards should keep insight layer inactive");

const hybrid70: Record<string, ResponseValue> = {
  "L1-1": [
    "기존 멤버와 신규 합류 멤버(고연봉자) 간의 보상 역전 및 갈등",
    "창업자/C-레벨의 마이크로매니징 및 일관성 없는 인사 개입",
  ],
  "L1-2": "50~100인",
  "L1-3": "3단계 (CEO - 리더 - 실무자)",
  "L1-4": "공격적 확장 (30%+ 인원 증가)",
  "2-2-2": "2~3개",
  "2-3-2": "입사·협상 때마다 개별 결정",
  "2-4-3-employee": 2,
  "2-5-1": "대표인 내가 직접 나서야 해결됨",
  "2-5-2": "운영 안 함",
  "2-5-5": "CEO 최종 승인 필요",
};

const hybridCards = selectInsightCards({
  responses: hybrid70,
  mode: "hybrid",
  axes: [axis("compensation"), axis("evaluation"), axis("leadership")],
  alignmentSignals: [signal("compensation"), signal("evaluation"), signal("leadership")],
});
const hybridIds = hybridCards.map((card) => card.id);

for (const expectedId of ["comp_counteroffer", "eval_ceo_escalation", "rec_referral_halflife", "cross_manager"]) {
  assert.equal(hybridIds.includes(expectedId), true, `hybrid 70-person scenario should select ${expectedId}`);
}
assert.equal(hybridCards.length <= 6, true, "insight card selection should stay capped at six");
assert.equal(
  new Set(hybridCards.map((card) => card.domain)).size,
  hybridCards.length,
  "selected cards should avoid duplicate domains",
);

const hybridPlacement = placeInsightCards(hybridCards);
assert.equal(hybridPlacement.page3Hero?.id, "cross_manager", "Page 3 should use the cross-domain manager insight");
assert.equal(hybridPlacement.page4Embedded.length, 3, "Page 4 should embed three domain insight cards when available");
assert.equal(
  new Set(hybridPlacement.page4Embedded.map((card) => card.domain)).size,
  hybridPlacement.page4Embedded.length,
  "Page 4 should not repeat the same domain",
);

const alignment120 = selectInsightCards({
  responses: {
    ...hybrid70,
    "L1-2": "100~500인",
    "2-1-4": "리더별로 암묵적으로 알고 있음",
    "2-2-5": "추적하지 않음",
    "2-3-5": "모름 / 측정 안 함",
    "2-4-5": "모름 / 측정 안 함",
    "2-5-6": "면접관이나 리더의 성향에 따라 들쭉날쭉하게 적용된다.",
  },
  mode: "alignment",
  axes: [
    axis("compensation", 65),
    axis("evaluation", 70),
    axis("recruitment", 58),
    axis("retention", 61),
    axis("leadership", 68),
  ],
  foundationSignals: [signal("recruitment"), signal("retention")],
  alignmentSignals: [signal("compensation"), signal("evaluation"), signal("leadership")],
});
const alignmentPlacement = placeInsightCards(alignment120);

assert.equal(
  alignment120.some((card) => card.id === "cross_manager"),
  true,
  "all-domain alignment scenario should trigger manager cross-domain insight",
);
assert.equal(
  alignment120.some((card) => card.id === "cross_intent_path"),
  true,
  "all-domain alignment scenario should trigger intent-path cross-domain insight",
);
assert.notEqual(
  alignmentPlacement.page3Hero?.id,
  alignmentPlacement.page6Closing?.id,
  "Page 3 and Page 6 should not reuse the same cross-domain card",
);

const referralCard = hybridCards.find((card) => card.id === "rec_referral_halflife");
assert.ok(referralCard, "hybrid 70-person scenario should keep the referral card available for interpolation");
const interpolated = interpolateCard(referralCard, {
  companyName: "코어플로우",
  currentHeadcount: 70,
  targetHeadcount: 150,
  recentExitCount: 2,
  exitRole: "시니어 PM",
});

assert.match(interpolated.insight, /코어플로우/, "interpolated insight should include the company name");
assert.equal(/\{[a-zA-Z]/.test(JSON.stringify(interpolated)), false, "interpolation should remove variable placeholders");

console.log("selectCards tests passed");
