"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CompanyContextBar } from "@/components/result/CompanyContextBar";
import { ExecutiveSummaryPanel } from "@/components/result/ExecutiveSummaryPanel";
import { AlignmentOperatingRisk } from "@/components/result/AlignmentOperatingRisk";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { DiagnosticFinishButton } from "@/components/result/DiagnosticFinishButton";
import { AlignmentTensionMap } from "@/components/visualization/AlignmentTensionMap";
import { logEvent } from "@/lib/api/events";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import {
  alignmentPercent as ahaAlignmentPercent,
  displayAhaDomainName,
  getMirrorSentence,
  getPrimaryScenario,
  scoreTone,
  topGapAxis,
} from "@/lib/constants/ahaMoment";
import { buildFallbackAlignmentMap } from "@/lib/utils/alignmentMapFallback";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";
import { useDiagnosisHistoryStore } from "@/lib/store/diagnosisHistory";

export default function ResultPage() {
  const router = useRouter();
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const upsertSnapshot = useDiagnosisHistoryStore((state) => state.upsertSnapshot);
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  usePageTracking("/result");

  useEffect(() => {
    if (!sessionId || !data) return;
    const avgScore = Math.round(data.areas.reduce((sum, area) => sum + area.score, 0) / data.areas.length);
    const axes = data.alignment_map?.axes ?? [];
    const maxTensionAxis = [...axes].sort((a, b) => b.tension - a.tension)[0];
    const topGapArea = [...data.areas].sort((a, b) => b.gap - a.gap)[0];
    upsertSnapshot({
      sessionId,
      companyName: companyName || "이름 없는 진단",
      capturedAt: new Date().toISOString(),
      visibilityScore: Math.round(data.visibility.score),
      alignmentScore: Math.round(data.alignment_map?.alignment_score ?? data.alignment.score ?? avgScore),
      topGapArea: topGapArea?.area_name ?? "핵심 영역",
      topGap: topGapArea?.gap ?? 0,
    });
    logEvent({
      session_id: sessionId,
      event_type: "result_view",
      page: "/result",
      metadata: {
        avg_score: avgScore,
        visibility_score: data.visibility.score,
        alignment_map_score: data.alignment_map?.alignment_score,
        alignment_map_level: data.alignment_map?.alignment_level,
        alignment_map_dispersion: data.alignment_map?.dispersion,
        diagnosis_mode: data.diagnosis_mode,
        max_tension_domain: maxTensionAxis?.domain_id,
        misaligned_count: axes.filter((axis) => axis.tension_level === "misaligned").length,
      },
      timestamp: new Date().toISOString(),
    });
  }, [companyName, data, sessionId, upsertSnapshot]);
  const handleNavigate = (action: string, path: string) => {
    if (sessionId) {
      logEvent({
        session_id: sessionId,
        event_type: "cta_click",
        page: "/result",
        metadata: { action },
        timestamp: new Date().toISOString(),
      });
    }
    router.push(path);
  };

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="결과 리포트는 입력 완료 후 생성됩니다."
        body="조직 컨텍스트와 제도 운영 상태를 먼저 입력하면, 인사제도 정합성 지수와 영역별 논의 우선순위를 확인할 수 있습니다."
      >
        <Button onClick={() => router.push("/diagnose/philosophy")}>진단 시작하기</Button>
      </AnalysisNotice>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center text-[14px] text-slate-400">진단 결과를 분석하고 있습니다...</div>;
  }

  if (error || !data) {
    return (
      <AnalysisNotice
        eyebrow="결과 생성 실패"
        title="진단 결과를 불러오지 못했습니다."
        body={error instanceof Error ? error.message : "백엔드 서버 연결을 확인한 뒤 다시 시도해 주세요."}
      >
        <Button onClick={() => router.push("/diagnose/philosophy")}>진단 입력으로</Button>
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  const { areas, visibility, alignment, alignment_map } = data;
  const diagnosisMode = data.diagnosis_mode ?? "alignment";
  const foundationSignals = data.foundation_signals ?? [];
  const alignmentSignals = data.alignment_signals ?? [];
  const avgScore = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const alignmentScore = alignment?.score ?? avgScore;
  const alignmentMap = alignment_map?.axes?.length ? alignment_map : buildFallbackAlignmentMap(responses, areas);
  const ahaAxis = topGapAxis(alignmentMap.axes ?? []);
  const ahaMirror = ahaAxis ? getMirrorSentence(ahaAxis) : null;
  const ahaScenario = ahaAxis ? getPrimaryScenario(ahaAxis) : null;
  const topicAreas = areas.filter((area) => area.gap >= 10).sort((a, b) => b.gap - a.gap);
  const topicCount = topicAreas.length;
  const topicNames = topicAreas.map((area) => area.area_name).join(", ") || "핵심";
  const topGapArea = topicAreas[0] ?? [...areas].sort((a, b) => b.gap - a.gap)[0];
  const visTierText = visibility.score >= 70 ? "본 진단 가능" : visibility.score >= 50 ? "추가 수집 권장" : "데이터 부족";
  const visibilityVariant = visibility.score >= 70 ? "teal" : visibility.score >= 50 ? "amber" : "coral";
  const topGapText = topGapArea
    ? topGapArea.gap >= 10
      ? `필요 기준 대비 ${topGapArea.gap}점 미달`
      : `필요 기준과 ${topGapArea.gap}점 차이`
    : "필요 기준 차이 확인";
  const blindSpotNames = visibility.blind_spot_labels.join(", ");
  const visibilityCopy = visibility.blind_spot_labels.length === 0
    ? "진단이 안 된 영역 없이 현재 판단에 필요한 데이터가 확보되었습니다."
    : `진단이 안 된 영역 ${visibility.blind_spots.length}개가 남아 있습니다. 진단이 약한 영역: ${blindSpotNames}`;
  const executiveFocusName = ahaAxis ? displayAhaDomainName(ahaAxis) : topGapArea?.area_name ?? "핵심 영역";
  const executiveFocusMeta = ahaAxis ? `${executiveFocusName} 정합 ${ahaAlignmentPercent(ahaAxis)}%` : topGapText;
  const executiveTitle =
    diagnosisMode === "foundation"
      ? "현재 방식이 유효한 조건부터 확인해야 합니다."
      : diagnosisMode === "hybrid"
        ? "유지할 선택과 새로 정할 기준을 나눠야 합니다."
        : `${executiveFocusName}에서 다음 판단 기준을 정해야 합니다.`;
  const executiveInsight =
    diagnosisMode === "foundation"
      ? "지금 운영 방식이 틀렸다는 뜻이 아니라, 다음 성장 구간에서 어떤 기준을 먼저 명문화할지 고르는 단계입니다."
      : diagnosisMode === "hybrid"
        ? "일부 방식은 지금 단계에서 합리적인 선택일 수 있고, 일부 제도는 이미 서로 다른 메시지를 냅니다. 유지할 것과 정할 것을 나누면 실행 부담이 줄어듭니다."
        : ahaMirror ?? "정합성 차이가 큰 영역과 필요 기준 차이를 함께 보면, 다음 회의에서 먼저 확인할 판단 기준이 좁혀집니다.";
  const executiveRisk =
    diagnosisMode === "foundation"
      ? "다음 성장 구간으로 넘어갈 때 보상 설명, 평가 수용성, 리더별 운영 편차가 동시에 커질 수 있습니다."
      : diagnosisMode === "hybrid"
        ? "제도를 한 번에 손대면 기준을 새로 만드는 일과 기존 제도를 정렬하는 일이 섞여 현장 혼선이 커질 수 있습니다."
        : ahaScenario;
  const nextDecisionTitle =
    diagnosisMode === "foundation"
      ? "이번 미팅에서는 현재 방식을 유지할 조건과 먼저 정할 기준을 나눕니다."
      : diagnosisMode === "hybrid"
        ? "이번 미팅에서는 유지할 선택과 새로 정할 기준을 나눕니다."
        : `이번 미팅에서는 ${executiveFocusName}의 다음 판단 기준을 확인합니다.`;
  const nextDecisionBody =
    diagnosisMode === "foundation"
      ? `${topicNames} 영역에서 지금 방식이 언제까지 유효한지 확인하고, 다음 30일 안에 정할 최소 기준만 좁힙니다.`
      : diagnosisMode === "hybrid"
        ? `${topicNames} 영역을 한 번에 고치기보다, 현재 단계에서 유지할 방식과 명문화할 기준을 분리합니다.`
        : `${topicNames} 영역의 엇박자를 일반론으로 다루기보다, 상세 분석에서 근거를 확인한 뒤 트레이드오프를 비교합니다.`;

  return (
    <>
      <PageHeader
        eyebrow="진단결과 요약"
        title={
          <>
            {companyName ? <span className="text-teal-deep">{companyName}</span> : "우리 회사"} 인사제도 정합성 진단결과 요약
          </>
        }
        lead="현재 위치와 다음 의사결정 포인트를 먼저 봅니다."
        actions={
          <>
            <DiagnosticFinishButton page="/result" />
            <Button onClick={() => handleNavigate("open_report", "/report")}>진단 보고서 보기</Button>

            <Button variant="primary" onClick={() => handleNavigate("open_detail", "/result/detail")}>상세 분석 보기</Button>
          </>
        }
      />

      <CompanyContextBar companyName={companyName} responses={responses} />

      <ExecutiveSummaryPanel
        mode={diagnosisMode}
        companyName={companyName}
        headcount={responses["L1-2"] as string | undefined}
        alignmentScore={alignmentMap.alignment_score}
        alignmentLevel={alignmentMap.alignment_level}
        scoreTone={scoreTone(alignmentMap.alignment_score)}
        focusTitle={executiveTitle}
        focusMeta={executiveFocusMeta}
        insight={executiveInsight}
        risk={executiveRisk}
        topGapAreaName={topGapArea?.area_name ?? executiveFocusName}
        topGapText={topGapText}
        topicCount={topicCount}
        visibilityScore={visibility.score}
        visibilityLabel={visTierText}
        visibilityTone={visibilityVariant}
        foundationSignals={foundationSignals}
        alignmentSignals={alignmentSignals}
      />

      <AlignmentOperatingRisk map={alignmentMap} />

      <section className="mb-4 print:break-inside-avoid">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">근거</p>
            <h2 className="m-0 mt-1 text-[18px] font-[720] leading-[1.4] text-slate-950">어느 기준이 어긋났는지 확인합니다.</h2>
            <p className="m-0 mt-1 max-w-[760px] text-[12px] leading-[1.7] text-slate-600">
              아래 5개 카드는 요약에서 짚은 결론의 근거입니다. 상세 점수보다 각 영역이 구성원에게 어떤 메시지로 읽히는지 확인합니다.
            </p>
          </div>
          <Badge variant="slate">상세 근거는 다음 화면</Badge>
        </div>
        <AlignmentTensionMap
          map={alignmentMap}
          showSectionHeader={false}
          showConflicts={false}
          showTopGapSummary={false}
          showOverallScore={false}
          showDirectionSummary={false}
          compactCards
        />
      </section>

      <section className="mt-4 overflow-hidden rounded-[10px] border border-slate-200 bg-white print:hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-5 sm:p-6">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">지금 결정할 질문</p>
            <h2 className="m-0 mt-2 text-[20px] font-[720] leading-[1.35] text-slate-950">{nextDecisionTitle}</h2>
            <p className="m-0 mt-3 max-w-[780px] text-[13px] leading-[1.75] text-slate-600">{nextDecisionBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-[7px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-[720] text-slate-700">
                먼저 볼 영역: {topGapArea?.area_name ?? executiveFocusName}
              </span>
              <span className="inline-flex rounded-[7px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-[720] text-slate-700">
                논의 범위: {topicCount > 0 ? `${topicCount}개 영역` : "추가 확인"}
              </span>
            </div>
          </div>
          <aside className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">데이터 신뢰도</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <strong className="text-[34px] font-[680] leading-none text-slate-900">{Math.round(visibility.score)}</strong>
              <span className="text-[14px] font-[650] text-slate-400">%</span>
            </div>
            <Badge variant={visibilityVariant}>{visTierText}</Badge>
            <p className="m-0 mt-3 text-[12px] leading-[1.65] text-slate-500">{visibilityCopy}</p>
          </aside>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[12px] leading-[1.6] text-slate-500">
            요약에서 현재 위치를 확인했다면, 이제 근거와 선택지를 분리해서 봅니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleNavigate("open_detail", "/result/detail")}>상세 분석 보기</Button>
            <Button variant="primary" onClick={() => handleNavigate("open_matrix", "/matrix")}>트레이드오프 보기</Button>
          </div>
        </div>
      </section>
    </>
  );
}
