const ACCESS_TOKEN_KEY = "tg-diagnosis-access-token";
const LEGACY_ACCESS_KEY = "tg-diagnosis-access";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function grantDiagnosisAccess(token: string, storage?: StorageLike) {
  const target = resolveStorage(storage);
  if (!target) return;
  target.setItem(ACCESS_TOKEN_KEY, token);
  target.removeItem(LEGACY_ACCESS_KEY);
}

export function getDiagnosisAccessToken(storage?: StorageLike): string | null {
  const target = resolveStorage(storage);
  if (!target) return null;
  return target.getItem(ACCESS_TOKEN_KEY);
}

export function hasDiagnosisAccess(storage?: StorageLike): boolean {
  return Boolean(getDiagnosisAccessToken(storage));
}

export function buildDiagnosisAccessHeaders(storage?: StorageLike): Record<string, string> {
  const token = getDiagnosisAccessToken(storage);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function clearDiagnosisAccess(storage?: StorageLike) {
  const target = resolveStorage(storage);
  if (!target) return;
  target.removeItem(ACCESS_TOKEN_KEY);
  target.removeItem(LEGACY_ACCESS_KEY);
}
