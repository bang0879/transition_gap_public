"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { logEvent } from "@/lib/api/events";
import { useSessionStore } from "@/lib/store/session";

interface DiagnosticFinishButtonProps {
  page: string;
}

export function DiagnosticFinishButton({ page }: DiagnosticFinishButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const sessionId = useSessionStore((state) => state.sessionId);

  const handleFinish = () => {
    setIsNavigating(true);
    if (sessionId) {
      logEvent({
        session_id: sessionId,
        event_type: "cta_click",
        page,
        metadata: { action: "open_diagnostic_finish" },
        timestamp: new Date().toISOString(),
      });
    }
    router.push(`/finish?from=${encodeURIComponent(page)}`);
  };

  return (
    <Button variant="primary" onClick={handleFinish} disabled={isNavigating}>
      {isNavigating ? "마무리 화면으로 이동 중" : "진단 마무리"}
    </Button>
  );
}
