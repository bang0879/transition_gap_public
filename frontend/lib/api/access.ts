import { apiFetch } from "@/lib/api/client";
import { grantDiagnosisAccess } from "@/lib/utils/accessGate";

interface AccessVerifyResponse {
  token: string;
  token_type: "bearer";
  expires_at: string;
}

export async function verifyDiagnosisCode(code: string): Promise<AccessVerifyResponse> {
  const response = await apiFetch<AccessVerifyResponse>("/api/access/verify", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ code }),
  });

  grantDiagnosisAccess(response.token);
  return response;
}
