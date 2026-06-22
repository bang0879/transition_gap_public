"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Button } from "@/components/shared/Button";
import { ReportPreview } from "@/components/report/ReportPreview";
import { buildDiagnosticReportViewModel } from "@/lib/report/buildDiagnosticReportViewModel";
import { buildFallbackAlignmentMap } from "@/lib/utils/alignmentMapFallback";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";

export default function ReportPage() {
  const router = useRouter();
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  usePageTracking("/report");

  const completedAt = useMemo(() => new Date(), []);
  const report = useMemo(() => {
    if (!data) return null;
    const alignmentMap = data.alignment_map?.axes?.length
      ? data.alignment_map
      : buildFallbackAlignmentMap(responses, data.areas);
    return buildDiagnosticReportViewModel({
      companyName: companyName || "우리 회사",
      completedAt,
      diagnosis: { ...data, alignment_map: alignmentMap },
      responses,
    });
  }, [companyName, completedAt, data, responses]);

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="진단 보고서는 입력 완료 후 생성됩니다."
        body="조직 컨텍스트와 제도 운영 상태를 먼저 입력하면, 대표님께 공유할 수 있는 A4 진단 보고서를 만들 수 있습니다."
      >
        <Button onClick={() => router.push("/diagnose/philosophy")}>진단 시작하기</Button>
      </AnalysisNotice>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center text-[14px] text-slate-400">진단 보고서를 구성하고 있습니다...</div>;
  }

  if (error || !data || !report) {
    return (
      <AnalysisNotice
        eyebrow="보고서 생성 실패"
        title="진단 보고서를 만들지 못했습니다."
        body={error instanceof Error ? error.message : "진단 결과를 다시 불러온 뒤 시도해 주세요."}
      >
        <Button onClick={() => router.push("/result")}>결과 요약으로</Button>
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[960px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[11px] font-[800] tracking-[0.1em] text-slate-400">A4 REPORT PREVIEW</p>
            <h1 className="m-0 mt-1 text-[18px] font-[760] text-slate-950">{report.cover.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/result")}>결과 요약으로</Button>
            <Button variant="primary" onClick={() => window.print()}>브라우저 인쇄</Button>
          </div>
        </div>
      </div>
      <ReportPreview report={report} />
    </>
  );
}
