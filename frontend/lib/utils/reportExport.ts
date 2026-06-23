import type { DiagnoseResponse } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";

export interface ReportExportInput {
  companyName: string;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
  exportedAt: Date;
  sourcePage: string;
}

export interface ReportExportData {
  schemaVersion: 1;
  artifactType: "hr-prism-diagnostic-data";
  brand: "HR Prism";
  exportedAt: string;
  completedDateLabel: string;
  companyName: string;
  sourcePage: string;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
}

export function sanitizeFileSegment(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/_+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^_+|_+$/g, "") || "진단데이터";
}

export function formatReportDateLabel(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function buildReportExport(input: ReportExportInput): ReportExportData {
  return {
    schemaVersion: 1,
    artifactType: "hr-prism-diagnostic-data",
    brand: "HR Prism",
    exportedAt: input.exportedAt.toISOString(),
    completedDateLabel: formatReportDateLabel(input.exportedAt),
    companyName: input.companyName,
    sourcePage: input.sourcePage,
    diagnosis: input.diagnosis,
    responses: input.responses,
  };
}

export function buildReportExportFileName(exportData: ReportExportData): string {
  return `${sanitizeFileSegment(exportData.companyName)}_HR_Prism_진단데이터_${exportData.completedDateLabel}.json`;
}

export function buildReportExportJson(exportData: ReportExportData): string {
  return JSON.stringify(exportData, null, 2);
}

export function downloadReportExportJson(exportData: ReportExportData): void {
  const blob = new Blob([buildReportExportJson(exportData)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildReportExportFileName(exportData);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
