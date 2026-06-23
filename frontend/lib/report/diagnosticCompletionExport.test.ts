import assert from "node:assert/strict";
import type { DiagnoseResponse } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";
import type { DiagnosticReportViewModel } from "./buildDiagnosticReportViewModel";
// @ts-expect-error Node 24 strip-types executes the TypeScript helper directly in this smoke test.
import { buildDiagnosticCompletionExport, buildDiagnosticCompletionFileNames, buildDiagnosticCompletionJson } from "./diagnosticCompletionExport.ts";

const report = {
  cover: {
    companyName: 'A/B:"컴퍼니"',
    completedDateLabel: "2026.06.23",
    title: 'A/B:"컴퍼니" 인사제도 진단 보고서',
  },
} as DiagnosticReportViewModel;

const diagnosis = {
  diagnosis_mode: "hybrid",
  areas: [],
  insights: [],
  foundation_signals: [],
  alignment_signals: [],
} as unknown as DiagnoseResponse;

const responses: Record<string, ResponseValue> = {
  "L1-2": "51~100명",
  "L1-3": ["빠른 성장", "리더 확장"],
};

const exportedAt = new Date("2026-06-23T09:00:00.000Z");
const fileNames = buildDiagnosticCompletionFileNames(report);
const exportData = buildDiagnosticCompletionExport({
  report,
  diagnosis,
  responses,
  exportedAt,
});
const parsedJson = JSON.parse(buildDiagnosticCompletionJson(exportData)) as typeof exportData;

assert.equal(fileNames.pdf, "A_B_컴퍼니_HR_Prism_진단보고서_2026.06.23.pdf", "pdf filename");
assert.equal(fileNames.json, "A_B_컴퍼니_HR_Prism_진단데이터_2026.06.23.json", "json filename");
assert.equal(exportData.artifactType, "hr-prism-diagnostic-completion", "export type");
assert.equal(exportData.brand, "HR Prism", "brand");
assert.equal(exportData.companyName, 'A/B:"컴퍼니"', "company name preserved");
assert.equal(exportData.diagnosis, diagnosis, "diagnosis included");
assert.equal(exportData.responses, responses, "responses included");
assert.equal(exportData.exportedAt, "2026-06-23T09:00:00.000Z", "export date");
assert.equal(parsedJson.report.cover.title, 'A/B:"컴퍼니" 인사제도 진단 보고서', "json roundtrip");

console.log("diagnosticCompletionExport tests passed");