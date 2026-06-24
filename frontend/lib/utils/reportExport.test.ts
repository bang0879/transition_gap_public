import assert from "node:assert/strict";
import type { DiagnoseResponse } from "../types/api";
import type { ResponseValue } from "../store/responses";
// @ts-expect-error Node 24 strip-types executes the TypeScript helper directly in this smoke test.
import { buildReportExport, buildReportExportFileName, buildReportExportJson, buildReportPdfFileName } from "./reportExport.ts";

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
const exportData = buildReportExport({
  companyName: 'A/B:"컴퍼니',
  diagnosis,
  responses,
  exportedAt,
  sourcePage: "/result",
});
const fileName = buildReportExportFileName(exportData);
const pdfFileName = buildReportPdfFileName(exportData);
const parsedJson = JSON.parse(buildReportExportJson(exportData)) as typeof exportData;

assert.equal(fileName, "A_B_컴퍼니_HR_Prism_진단데이터_2026.06.23.json", "json filename");
assert.equal(pdfFileName, "A_B_컴퍼니_HR_Prism_진단보고서_2026.06.23.pdf", "pdf filename");
assert.equal(exportData.artifactType, "hr-prism-diagnostic-data", "export type");
assert.equal(exportData.brand, "HR Prism", "brand");
assert.equal(exportData.companyName, 'A/B:"컴퍼니', "company name preserved");
assert.equal(exportData.diagnosis, diagnosis, "diagnosis included");
assert.equal(exportData.responses, responses, "responses included");
assert.equal(exportData.exportedAt, "2026-06-23T09:00:00.000Z", "export date");
assert.equal(exportData.sourcePage, "/result", "source page");
assert.equal(parsedJson.companyName, 'A/B:"컴퍼니', "json roundtrip");

console.log("reportExport tests passed");
