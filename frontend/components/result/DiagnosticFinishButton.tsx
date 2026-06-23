"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { logEvent } from "@/lib/api/events";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";
import { buildFallbackAlignmentMap } from "@/lib/utils/alignmentMapFallback";
import { buildReportExport, downloadReportExportJson } from "@/lib/utils/reportExport";

interface DiagnosticFinishButtonProps {
  page: string;
}

export function DiagnosticFinishButton({ page }: DiagnosticFinishButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const { data, isLoading } = useDiagnosis();

  const handleFinish = () => {
    if (!data) return;
    setIsSaving(true);
    try {
      if (sessionId) {
        logEvent({
          session_id: sessionId,
          event_type: "cta_click",
          page,
          metadata: { action: "finish_diagnosis_export_json" },
          timestamp: new Date().toISOString(),
        });
      }
      const alignmentMap = data.alignment_map?.axes?.length
        ? data.alignment_map
        : buildFallbackAlignmentMap(responses, data.areas);
      const exportData = buildReportExport({
        companyName: companyName || "우리 회사",
        diagnosis: { ...data, alignment_map: alignmentMap },
        responses,
        exportedAt: new Date(),
        sourcePage: page,
      });
      downloadReportExportJson(exportData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button variant="primary" onClick={handleFinish} disabled={isLoading || !data || isSaving}>
      {isSaving ? "진단 데이터 저장 중" : "진단 마무리"}
    </Button>
  );
}
