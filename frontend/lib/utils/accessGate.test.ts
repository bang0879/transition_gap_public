import assert from "node:assert/strict";
// @ts-ignore Node strip-types executes the TypeScript helper directly in this smoke test.
import { buildDiagnosisAccessHeaders, clearDiagnosisAccess, getDiagnosisAccessToken, grantDiagnosisAccess, hasDiagnosisAccess } from "./accessGate.ts";

const storage = new Map<string, string>();
const storageLike = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

assert.equal(hasDiagnosisAccess(storageLike), false);
assert.equal(getDiagnosisAccessToken(storageLike), null);
assert.deepEqual(buildDiagnosisAccessHeaders(storageLike), {});

grantDiagnosisAccess("signed-token", storageLike);
assert.equal(hasDiagnosisAccess(storageLike), true);
assert.equal(getDiagnosisAccessToken(storageLike), "signed-token");
assert.deepEqual(buildDiagnosisAccessHeaders(storageLike), { Authorization: "Bearer signed-token" });

clearDiagnosisAccess(storageLike);
assert.equal(hasDiagnosisAccess(storageLike), false);
assert.equal(getDiagnosisAccessToken(storageLike), null);

console.log("accessGate tests passed");
