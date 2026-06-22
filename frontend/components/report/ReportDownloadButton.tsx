"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { DiagnosticReportViewModel } from "@/lib/report/buildDiagnosticReportViewModel";

function sanitizeFileSegment(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^_+|_+$/g, "") || "진단보고서";
}

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

export function ReportDownloadButton({ report }: { report: DiagnosticReportViewModel }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./pdf/ReportPdfDocument"),
      ]);
      const blob = await pdf(<ReportPdfDocument report={report} />).toBlob();
      downloadBlob(blob, `${sanitizeFileSegment(report.cover.companyName)}_진단보고서_${report.cover.completedDateLabel}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="primary" onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? "보고서 생성 중" : "PDF 다운로드"}
    </Button>
  );
}
