import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("empty shell uses HR Prism branding", () => {
  const emptyShell = readFileSync(new URL("../components/shared/EmptyShell.tsx", import.meta.url), "utf8");

  assert.match(emptyShell, /HR Prism/);
  assert.doesNotMatch(emptyShell, /Transition Gap/);
});
