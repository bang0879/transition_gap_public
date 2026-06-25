import { buildDiagnosisAccessHeaders } from "@/lib/utils/accessGate";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8010";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  const { auth = true, headers, ...fetchOptions } = options ?? {};
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    Object.entries(buildDiagnosisAccessHeaders()).forEach(([key, value]) => {
      if (!requestHeaders.has(key)) {
        requestHeaders.set(key, value);
      }
    });
  }

  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch (networkError) {
    console.error(`[API] Network error: ${url}`, networkError);
    throw new ApiError("Could not connect to the backend API server.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[API] ${res.status} ${res.statusText}: ${url}`, body);
    throw new ApiError(`API error (${res.status}): ${body || res.statusText}`, res.status);
  }

  return res.json() as Promise<T>;
}
