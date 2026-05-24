import { apiFetch } from "./client";

interface EventPayload {
  session_id: string;
  event_type: string;
  page?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export function logEvent(payload: EventPayload): void {
  apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(() => {
    // Logging must never block the diagnostic flow.
  });
}
