import assert from "node:assert/strict";
// @ts-expect-error Node strip-types executes the TypeScript helper directly in this smoke test.
import { buildPhilosophyProfile } from "./philosophyProfile.ts";

const performanceCeo = {
  "L0-1": "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
  "L0-2": "성과 추적과 솔직한 피드백을 통해 저성과 이슈를 피하지 않는다",
  "L0-3": "외부에서 검증된 S급 인재를 즉시 전력으로 빠르게 데려온다",
  "L0-4":
    "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
};

const stableRewardException = {
  ...performanceCeo,
  "L0-1":
    "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.",
};

const profile = buildPhilosophyProfile(performanceCeo);
assert.equal(profile.isComplete, true);
assert.deepEqual(profile.conflicts.map((conflict) => conflict.id), []);
assert.match(profile.consistent_interpretation.title, /일관/);
assert.match(profile.consistent_interpretation.body, /외부/);
assert.match(profile.consistent_interpretation.body, /예외|유연/);

const stableProfile = buildPhilosophyProfile(stableRewardException);
assert.ok(
  stableProfile.conflicts.some((conflict) => conflict.id === "stable_reward_with_exception_retention"),
  "stable reward + exception retention should be flagged",
);
assert.ok(
  !stableProfile.conflicts.some((conflict) => conflict.id === "external_hiring_core_retention"),
  "L0-3/L0-4 must not be treated as a conflict pair",
);

console.log("philosophyProfile tests passed");
