"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/lib/store/session";
import { logEvent } from "@/lib/api/events";

export function usePageTracking(page: string) {
  const sessionId = useSessionStore((state) => state.sessionId);
  const enterTime = useRef(Date.now());

  useEffect(() => {
    enterTime.current = Date.now();
    if (!sessionId) return;

    logEvent({
      session_id: sessionId,
      event_type: "page_view",
      page,
      timestamp: new Date().toISOString(),
    });

    return () => {
      logEvent({
        session_id: sessionId,
        event_type: "page_exit",
        page,
        metadata: { duration_ms: Date.now() - enterTime.current },
        timestamp: new Date().toISOString(),
      });
    };
  }, [page, sessionId]);
}
