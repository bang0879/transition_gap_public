"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Button } from "@/components/shared/Button";
import { logEvent } from "@/lib/api/events";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";
import { buildFallbackAlignmentMap } from "@/lib/utils/alignmentMapFallback";
import {
  buildReportExport,
  buildReportPdfFileName,
  downloadBlob,
  downloadReportExportJson,
} from "@/lib/utils/reportExport";
import type { ReportExportData } from "@/lib/utils/reportExport";

type PdfAssets = {
  pdf: typeof import("@react-pdf/renderer").pdf;
  DiagnosticPdfDocument: typeof import("@/components/finish/DiagnosticPdfDocument").DiagnosticPdfDocument;
};

type ReportStatus = "idle" | "preparing" | "ready" | "error";

let pdfAssetsPromise: Promise<PdfAssets> | null = null;
const reportBlobPromises = new Map<string, Promise<Blob>>();

function preloadPdfAssets(): Promise<PdfAssets> {
  if (!pdfAssetsPromise) {
    pdfAssetsPromise = Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/finish/DiagnosticPdfDocument"),
    ]).then(([renderer, documentModule]) => ({
      pdf: renderer.pdf,
      DiagnosticPdfDocument: documentModule.DiagnosticPdfDocument,
    }));
  }
  return pdfAssetsPromise;
}

function buildReportCacheKey(exportData: ReportExportData): string {
  const areaSignature = exportData.diagnosis.areas
    .map((area) => `${area.area_id}:${area.score}:${area.gap}:${area.priority}`)
    .join("|");
  const axisSignature = exportData.diagnosis.alignment_map?.axes
    ?.map((axis) => `${axis.domain_id}:${axis.alignment_percent}:${axis.tension}`)
    .join("|") ?? "no-axis";
  return [exportData.companyName, exportData.completedDateLabel, exportData.diagnosis.diagnosis_mode, areaSignature, axisSignature].join("::");
}

function prepareReportBlob(exportData: ReportExportData): Promise<Blob> {
  const cacheKey = buildReportCacheKey(exportData);
  const cached = reportBlobPromises.get(cacheKey);
  if (cached) return cached;

  const promise = preloadPdfAssets()
    .then(({ pdf, DiagnosticPdfDocument }) =>
      pdf(<DiagnosticPdfDocument exportData={exportData} />).toBlob(),
    )
    .catch((cause) => {
      reportBlobPromises.delete(cacheKey);
      throw cause;
    });
  reportBlobPromises.set(cacheKey, promise);
  return promise;
}

export default function FinishPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  const preparedReportRef = useRef<{ key: string; blob: Blob } | null>(null);
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();

  useEffect(() => {
    preloadPdfAssets().catch(() => undefined);
  }, []);

  const exportData = useMemo<ReportExportData | null>(() => {
    if (!data) return null;
    const alignmentMap = data.alignment_map?.axes?.length
      ? data.alignment_map
      : buildFallbackAlignmentMap(responses, data.areas);

    return buildReportExport({
      companyName: companyName || "우리 회사",
      diagnosis: { ...data, alignment_map: alignmentMap },
      responses,
      exportedAt: new Date(),
      sourcePage: "/finish",
    });
  }, [companyName, data, responses]);

  useEffect(() => {
    if (!exportData) {
      setReportStatus("idle");
      preparedReportRef.current = null;
      return;
    }

    let cancelled = false;
    const cacheKey = buildReportCacheKey(exportData);
    const prepared = preparedReportRef.current;
    if (prepared?.key === cacheKey) {
      setReportStatus("ready");
      return;
    }

    setReportStatus("preparing");
    prepareReportBlob(exportData)
      .then((blob) => {
        if (cancelled) return;
        preparedReportRef.current = { key: cacheKey, blob };
        setReportStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        preparedReportRef.current = null;
        setReportStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [exportData]);

  const handleSaveReport = async () => {
    if (!exportData) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const cacheKey = buildReportCacheKey(exportData);
      const pdfBlob = preparedReportRef.current?.key === cacheKey
        ? preparedReportRef.current.blob
        : await prepareReportBlob(exportData);

      downloadBlob(pdfBlob, buildReportPdfFileName(exportData));
      downloadReportExportJson(exportData);
      setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      preparedReportRef.current = { key: cacheKey, blob: pdfBlob };
      setReportStatus("ready");

      if (sessionId) {
        logEvent({
          session_id: sessionId,
          event_type: "cta_click",
          page: "/finish",
          metadata: { action: "download_diagnostic_report" },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (cause) {
      setReportStatus("error");
      setErrorMessage(cause instanceof Error ? cause.message : "보고서 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="보고서를 만들 진단 결과가 아직 없습니다."
        body="먼저 진단 입력을 완료한 뒤 대표용 보고서를 저장할 수 있습니다."
      >
        <Button variant="primary" onClick={() => router.push("/diagnose/philosophy")}>진단 시작하기</Button>
      </AnalysisNotice>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center text-[14px] text-slate-400">보고서에 담을 진단 결과를 정리하고 있습니다...</div>;
  }

  if (error || !data) {
    return (
      <AnalysisNotice
        eyebrow="보고서 생성 준비 실패"
        title="진단 결과를 불러오지 못했습니다."
        body={error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."}
      >
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  const primaryArea = [...data.areas].sort((a, b) => b.gap - a.gap || a.priority - b.priority)[0];
  const modeLabel = data.diagnosis_mode === "foundation" ? "Foundation" : data.diagnosis_mode === "hybrid" ? "Hybrid" : "Alignment";
  const buttonLabel = isSaving
    ? "다운로드 준비 중"
    : reportStatus === "preparing"
      ? "보고서 준비 중"
      : "진단보고서 다운로드";

  return (
    <>
      <PageHeader
        eyebrow="진단 마무리"
        title="최종 진단 보고서를 다운로드합니다."
        lead="대표님이 리더십과 바로 논의할 수 있도록 6페이지 A4 보고서로 핵심 해석, 운영 리스크, 검토 방향, 의사결정 메모를 정리합니다."
        actions={
          <Button variant="primary" onClick={handleSaveReport} disabled={isSaving || reportStatus === "preparing"}>
            {buttonLabel}
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[10px] border border-slate-200 bg-white p-5 sm:p-6">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">REPORT PACKAGE</p>
          <h2 className="m-0 mt-2 text-[22px] font-[720] leading-[1.35] text-slate-950">대표용 진단 보고서</h2>
          <p className="m-0 mt-3 text-[13px] leading-[1.75] text-slate-600">
            표지, Executive Summary, 대표님의 맹점, 영역별 운영 신호, 검토 방향, Decision Memo까지 6페이지로 구성합니다.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-[11px] font-[700] text-slate-500">회사명</p>
              <p className="m-0 mt-1 text-[13px] font-[720] text-slate-900">{companyName || "우리 회사"}</p>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-[11px] font-[700] text-slate-500">진단 구간</p>
              <p className="m-0 mt-1 text-[13px] font-[720] text-slate-900">{modeLabel}</p>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-[11px] font-[700] text-slate-500">우선 확인 영역</p>
              <p className="m-0 mt-1 text-[13px] font-[720] text-slate-900">{primaryArea?.area_name ?? "추가 확인"}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="m-0 text-[12px] font-[720] text-slate-900">
              {reportStatus === "ready" ? "보고서 준비 완료" : reportStatus === "error" ? "보고서 준비 재시도 필요" : "보고서 준비 중"}
            </p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-500">
              {reportStatus === "ready"
                ? "버튼을 누르면 PDF 보고서 다운로드가 바로 시작됩니다."
                : reportStatus === "error"
                  ? "버튼을 다시 누르면 보고서를 다시 생성합니다."
                  : "보고서 파일을 미리 생성해 다운로드 대기 시간을 줄이고 있습니다."}
            </p>
          </div>
          {errorMessage ? (
            <p className="m-0 mt-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] leading-[1.6] text-red-700">{errorMessage}</p>
          ) : null}
          {savedAt ? (
            <p className="m-0 mt-4 rounded-[8px] border border-teal/25 bg-teal/10 px-3 py-2 text-[12px] leading-[1.6] text-teal-deep">
              {savedAt}에 보고서 다운로드를 시작했습니다. 브라우저 다운로드 목록을 확인해 주세요.
            </p>
          ) : null}
        </article>

        <aside className="rounded-[10px] border border-[#e8dcc7] bg-[#fffaf0] p-5">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-[#8a6118]">DECISION MEMO</p>
          <h3 className="m-0 mt-2 text-[17px] font-[720] leading-[1.35] text-slate-950">보고서에서 바로 볼 질문</h3>
          <p className="m-0 mt-3 text-[12px] leading-[1.7] text-slate-600">
            지금 바로 새 제도를 설계할지보다, 먼저 어떤 판단 기준을 공개적으로 말할 수 있는지 정해야 합니다. 기준을 말할 수 없는 영역은 이번 분기에는 정교화보다 관찰과 언어 정렬을 우선합니다.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={() => router.push("/result/detail")}>상세 분석 다시 보기</Button>
            <Button onClick={() => router.push("/roadmap")}>로드맵 다시 보기</Button>
          </div>
        </aside>
      </section>
    </>
  );
}