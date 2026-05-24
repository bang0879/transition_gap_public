const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;

  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    console.error(`[API] Network error: ${url}`, networkError);
    throw new Error("백엔드 서버에 연결할 수 없습니다. FastAPI 서버가 실행 중인지 확인하세요.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[API] ${res.status} ${res.statusText}: ${url}`, body);
    throw new Error(`API 오류 (${res.status}): ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
