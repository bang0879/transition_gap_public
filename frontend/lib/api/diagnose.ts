import { apiFetch } from "./client";
import type { DiagnoseResponse } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";

interface DiagnosePayload {
  responses: Record<string, ResponseValue>;
}

export function postDiagnose(payload: DiagnosePayload): Promise<DiagnoseResponse> {
  return apiFetch<DiagnoseResponse>("/api/diagnose", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchDiagnosis(
  responses: Record<string, ResponseValue>,
): Promise<DiagnoseResponse> {
  return apiFetch<DiagnoseResponse>("/api/diagnose", {
    method: "POST",
    body: JSON.stringify({ responses }),
  });
}
