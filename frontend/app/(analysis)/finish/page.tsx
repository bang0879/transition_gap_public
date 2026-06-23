"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function FinishPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();

  const buildCurrentExport = (): ReportExportData | null => {
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
  };

  const handleSaveReport = async () => {
    const exportData = buildCurrentExport();
    if (!exportData) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const [{ pdf }, { DiagnosticPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/finish/DiagnosticPdfDocument"),
      ]);
      const pdfBlob = await pdf(<DiagnosticPdfDocument exportData={exportData} />).toBlob();
      downloadBlob(pdfBlob, buildReportPdfFileName(exportData));
      downloadReportExportJson(exportData);
      setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));

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
        <Button onClick={() => router.push("/result")}>결과 요약으로</Button>
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  const primaryArea = [...data.areas].sort((a, b) => b.gap - a.gap || a.priority - b.priority)[0];
  const modeLabel = data.diagnosis_mode === "foundation" ? "Foundation" : data.diagnosis_mode === "hybrid" ? "Hybrid" : "Alignment";

  return (
    <>
      <PageHeader
        eyebrow="진단 마무리"
        title="대표님께 전달할 진단 보고서를 저장합니다."
        lead="보고서는 결과 요약을 그대로 복사한 문서가 아니라, 대표님이 리더십과 논의할 수 있도록 핵심 해석과 의사결정 메모를 정리한 최종 산출물입니다."
        actions={
          <>
            <Button onClick={() => router.push("/result")}>결과 요약으로</Button>
            <Button variant="primary" onClick={handleSaveReport} disabled={isSaving}>
              {isSaving ? "보고서 저장 중" : "PDF 보고서 저장"}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[10px] border border-slate-200 bg-white p-5 sm:p-6">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">REPORT READY</p>
          <h2 className="m-0 mt-2 text-[22px] font-[720] leading-[1.35] text-slate-950">대표용 진단 보고서</h2>
          <p className="m-0 mt-3 text-[13px] leading-[1.75] text-slate-600">
            표지, 대표의 맹점, 조직 구간별 해석, 지금 위험한 실행, 다음 회의에서 결정할 질문을 A4 문서로 정리합니다.
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
          {errorMessage ? (
            <p className="m-0 mt-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] leading-[1.6] text-red-700">{errorMessage}</p>
          ) : null}
          {savedAt ? (
            <p className="m-0 mt-4 rounded-[8px] border border-teal/25 bg-teal/10 px-3 py-2 text-[12px] leading-[1.6] text-teal-deep">
              {savedAt}에 보고서 저장을 시작했습니다. 브라우저 다운로드 목록을 확인해 주세요.
            </p>
          ) : null}
        </article>

        <aside className="rounded-[10px] border border-[#e8dcc7] bg-[#fffaf0] p-5">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-[#8a6118]">DECISION MEMO</p>
          <h3 className="m-0 mt-2 text-[17px] font-[720] leading-[1.35] text-slate-950">저장 후 바로 논의할 질문</h3>
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
