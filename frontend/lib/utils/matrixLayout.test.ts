import assert from "node:assert/strict";
// @ts-expect-error Node 24 strip-types executes the TypeScript helper directly in this smoke test.
import { MATRIX_LAYOUT, MATRIX_QUADRANT_LABEL_BOXES, matrixPointToSvg, matrixToBeDisplayPosition } from "./matrixLayout.ts";

assert.ok(MATRIX_LAYOUT.plotHeight >= 350, "matrix plot should have enough vertical room");

const actualExtremeTarget = matrixPointToSvg({ x: 0.85, y: 0.85 });
const displayedExtremeTarget = matrixToBeDisplayPosition({ x: 0.85, y: 0.85 });

assert.ok(
  Math.abs(displayedExtremeTarget.x - actualExtremeTarget.x) <= 24,
  "To-Be x display position should stay close to the scored x coordinate",
);
assert.ok(
  Math.abs(displayedExtremeTarget.y - actualExtremeTarget.y) <= 56,
  "To-Be y display position should only move enough to clear quadrant text",
);

const markerRadius = 13;
const topRightLabel = MATRIX_QUADRANT_LABEL_BOXES.topRight;
assert.equal(topRightLabel.y, 42, "top-right quadrant label should keep the original text position");
assert.equal(topRightLabel.height, 58, "top-right quadrant label should keep the original text box height");
const topRightMarker = {
  left: displayedExtremeTarget.x - markerRadius,
  right: displayedExtremeTarget.x + markerRadius,
  top: displayedExtremeTarget.y - markerRadius,
  bottom: displayedExtremeTarget.y + markerRadius,
};

assert.ok(
  topRightLabel.y + topRightLabel.height + 8 <= topRightMarker.top,
  "top-right quadrant label should sit above the 0.85/0.85 To-Be marker with breathing room",
);

console.log("matrixLayout tests passed");
