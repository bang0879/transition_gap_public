"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { DiagnosticReportViewModel } from "@/lib/report/buildDiagnosticReportViewModel";
import {
  buildDiagnosticCompletionExport,
  buildDiagnosticCompletionFileNames,
  buildDiagnosticCompletionJson,
} from "@/lib/report/diagnosticCompletionExport";
import type { ResponseValue } from "@/lib/store/responses";
import type { DiagnoseResponse } from "@/lib/types/api";

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ReportDownloadButton({
  report,
  diagnosis,
  responses,
}: {
  report: DiagnosticReportViewModel;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./pdf/ReportPdfDocument"),
      ]);
      const fileNames = buildDiagnosticCompletionFileNames(report);
      const pdfBlob = await pdf(<ReportPdfDocument report={report} />).toBlob();
      const exportData = buildDiagnosticCompletionExport({
        report,
        diagnosis,
        responses,
        exportedAt: new Date(),
      });
      const jsonBlob = new Blob([buildDiagnosticCompletionJson(exportData)], {
        type: "application/json;charset=utf-8",
      });
      downloadBlob(pdfBlob, fileNames.pdf);
      downloadBlob(jsonBlob, fileNames.json);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="primary" onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? "보고서와 데이터 저장 중" : "진단 마무리"}
    </Button>
  );
}
