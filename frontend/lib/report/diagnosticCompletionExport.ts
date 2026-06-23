import type { DiagnoseResponse } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";
import type { DiagnosticReportViewModel } from "./buildDiagnosticReportViewModel";

export interface DiagnosticCompletionExportInput {
  report: DiagnosticReportViewModel;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
  exportedAt: Date;
}

export interface DiagnosticCompletionExport {
  schemaVersion: 1;
  artifactType: "hr-prism-diagnostic-completion";
  brand: "HR Prism";
  exportedAt: string;
  companyName: string;
  completedDateLabel: string;
  reportTitle: string;
  report: DiagnosticReportViewModel;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
}

export interface DiagnosticCompletionFileNames {
  pdf: string;
  json: string;
}

export function sanitizeFileSegment(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/_+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^_+|_+$/g, "") || "진단보고서";
}

export function buildDiagnosticCompletionFileNames(report: DiagnosticReportViewModel): DiagnosticCompletionFileNames {
  const companyName = sanitizeFileSegment(report.cover.companyName);
  const dateLabel = report.cover.completedDateLabel;
  return {
    pdf: `${companyName}_HR_Prism_진단보고서_${dateLabel}.pdf`,
    json: `${companyName}_HR_Prism_진단데이터_${dateLabel}.json`,
  };
}

export function buildDiagnosticCompletionExport(input: DiagnosticCompletionExportInput): DiagnosticCompletionExport {
  return {
    schemaVersion: 1,
    artifactType: "hr-prism-diagnostic-completion",
    brand: "HR Prism",
    exportedAt: input.exportedAt.toISOString(),
    companyName: input.report.cover.companyName,
    completedDateLabel: input.report.cover.completedDateLabel,
    reportTitle: input.report.cover.title,
    report: input.report,
    diagnosis: input.diagnosis,
    responses: input.responses,
  };
}

export function buildDiagnosticCompletionJson(exportData: DiagnosticCompletionExport): string {
  return JSON.stringify(exportData, null, 2);
}
