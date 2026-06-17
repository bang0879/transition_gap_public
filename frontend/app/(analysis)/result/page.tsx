"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GapBarList } from "@/components/visualization/GapBarList";
import { InsightCard } from "@/components/result/InsightCard";
import { CompanyContextBar } from "@/components/result/CompanyContextBar";
import { DiagnosisModeSummary } from "@/components/result/DiagnosisModeSummary";
import { AlignmentOperatingRisk } from "@/components/result/AlignmentOperatingRisk";
import { BenchmarkHelp } from "@/components/result/BenchmarkHelp";
import { MemoBlock } from "@/components/result/MemoBlock";
import { MetricCard } from "@/components/result/MetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResultReadingFlow } from "@/components/result/ResultReadingFlow";
import { ResultStepHeader } from "@/components/result/ResultStepHeader";
import { RadarChart } from "@/components/visualization/RadarChart";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
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
import { buildPhilosophyProfile } from "@/lib/utils/philosophyProfile";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";
import { useDiagnosisHistoryStore } from "@/lib/store/diagnosisHistory";

export default function ResultPage() {
  const router = useRouter();
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const responses = useResponsesStore((state) => state.responses);
  const snapshots = useDiagnosisHistoryStore((state) => state.snapshots);
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

  const handlePrint = () => {
    if (sessionId) {
      logEvent({
        session_id: sessionId,
        event_type: "cta_click",
        page: "/result",
        metadata: { action: "print_report" },
        timestamp: new Date().toISOString(),
      });
    }
    window.print();
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

  const { areas, visibility, insights, alignment, alignment_map } = data;
  const diagnosisMode = data.diagnosis_mode ?? "alignment";
  const foundationSignals = data.foundation_signals ?? [];
  const alignmentSignals = data.alignment_signals ?? [];
  const avgScore = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const alignmentScore = alignment?.score ?? avgScore;
  const alignmentMap = alignment_map?.axes?.length ? alignment_map : buildFallbackAlignmentMap(responses, areas);
  const ahaAxis = topGapAxis(alignmentMap.axes ?? []);
  const ahaMirror = ahaAxis ? getMirrorSentence(ahaAxis) : null;
  const ahaScenario = ahaAxis ? getPrimaryScenario(ahaAxis) : null;
  const philosophyProfile = buildPhilosophyProfile(responses);
  const philosophyConflicts = philosophyProfile.conflicts.slice(0, 2);
  const topConflicts = alignment?.conflicts?.slice(0, 2) ?? [];
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
  const decisionCards = [
    {
      label: "가장 먼저 볼 영역",
      title: topGapArea?.area_name ?? "핵심 영역",
      value: topGapText,
      body: "이 회사 조건에서 필요한 운영 기준과 현재 응답의 차이가 가장 큰 영역입니다.",
    },
    {
      label: "회사가 결정할 질문",
      title: "무엇을 먼저 정렬할 것인가",
      value: `${topicCount}개 논의 영역`,
      body: "점수 자체보다 제도 간 기준이 어긋난 지점을 먼저 좁히는 화면입니다.",
    },
    {
      label: "다음 화면에서 확인",
      title: "상세 근거와 트레이드오프",
      value: "상세 분석 → 트레이드오프 분석",
      body: "원인을 확인한 뒤, 얻는 것과 부담/주의점을 비교합니다.",
    },
  ];
  const previousSnapshot = snapshots.find((snapshot) => snapshot.sessionId !== sessionId);
  const latestSnapshot = snapshots.find((snapshot) => snapshot.sessionId === sessionId);
  const alignmentDelta = latestSnapshot && previousSnapshot ? latestSnapshot.alignmentScore - previousSnapshot.alignmentScore : null;
  const visibilityDelta = latestSnapshot && previousSnapshot ? latestSnapshot.visibilityScore - previousSnapshot.visibilityScore : null;

  const formatDelta = (delta: number | null) => {
    if (delta === null) return "비교 기준 없음";
    if (delta > 0) return `+${delta}점`;
    if (delta < 0) return `${delta}점`;
    return "변화 없음";
  };

  return (
    <>
      <PageHeader
        eyebrow="진단결과 요약"
        title={
          <>
            {companyName ? <span className="text-teal-deep">{companyName}</span> : "우리 회사"} 인사제도 정합성 진단결과 요약
          </>
        }
        lead={
          diagnosisMode === "foundation"
            ? "이 화면은 잘한 점수를 보여주는 대시보드가 아니라, 지금 규모에서 먼저 만들어야 할 운영 기준을 확인하는 첫 장입니다."
            : diagnosisMode === "hybrid"
              ? "이 화면은 없는 기준과 어긋난 제도를 구분해, 무엇을 먼저 정리할지 결정하기 위한 첫 장입니다."
              : "이 화면은 잘한 점수를 보여주는 대시보드가 아니라, 회사가 어디부터 제도를 정렬할지 결정하기 위한 첫 장입니다."
        }
        actions={
          <>
            <Button onClick={handlePrint}>인쇄/PDF 저장</Button>
            <Button variant="primary" onClick={() => router.push("/result/detail")}>상세 분석 보기</Button>
          </>
        }
      />

      {diagnosisMode !== "alignment" ? (
        <DiagnosisModeSummary
          mode={diagnosisMode}
          companyName={companyName}
          headcount={responses["L1-2"] as string | undefined}
          foundationSignals={foundationSignals}
          alignmentSignals={alignmentSignals}
        />
      ) : ahaAxis ? (
        <section className="mb-4 rounded-[12px] border border-coral/25 bg-[#fff7f4] p-5 shadow-soft print:break-inside-avoid">
          <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-stretch">
            <div className="rounded-[10px] border border-coral/20 bg-white px-4 py-3">
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">진단 핵심 요약</p>
              <p className="m-0 mt-3 text-[13px] font-[700] leading-[1.45] text-slate-700">
                {companyName || "우리 회사"}의 인사제도 정합도
              </p>
              <div className="mt-2 flex items-end gap-2">
                <strong className="text-[42px] font-[760] leading-none text-slate-900">{alignmentMap.alignment_score}</strong>
                <span className="pb-1 text-[15px] font-[700] text-slate-500">%</span>
              </div>
              <Badge variant={scoreTone(alignmentMap.alignment_score)}>{alignmentMap.alignment_level}</Badge>
            </div>
            <div className="grid gap-3">
              <div>
                <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">가장 큰 괴리</p>
                <h2 className="m-0 mt-1 text-[20px] font-[760] leading-[1.35] text-slate-900">
                  {displayAhaDomainName(ahaAxis)} 영역 · 정합 {ahaAlignmentPercent(ahaAxis)}%
                </h2>
              </div>
              {ahaMirror ? (
                <p className="m-0 rounded-[9px] border border-coral/20 bg-white px-3 py-2 text-[13px] font-[650] leading-[1.7] text-slate-800">
                  {ahaMirror}
                </p>
              ) : null}
              {ahaScenario ? (
                <p className="m-0 rounded-[9px] border border-amber/25 bg-white px-3 py-2 text-[12px] leading-[1.65] text-slate-600">
                  <span className="font-[760] text-amber">이 상태가 유지되면: </span>
                  {ahaScenario}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <ResultReadingFlow />

      <ResultStepHeader
        step="STEP 01 · 철학-제도 정합성"
        title="회사의 인사철학과 현재 제도가 같은 방향을 보고 있습니까?"
        body="이 단계는 철학과 제도의 방향을 비교합니다. 아래의 필요 기준/벤치마크와는 다른 비교이며, 먼저 회사가 내는 인사 메시지가 일관적인지 확인합니다."
      />
      {philosophyConflicts.length > 0 ? (
        <section className="mb-4 rounded-[10px] border border-amber/30 bg-[#fffaf0] p-4 print:break-inside-avoid">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">철학 프로필 상기</p>
              <h2 className="m-0 mt-2 text-[16px] font-[720] leading-[1.45] text-slate-900">
                앞 단계에서 {philosophyProfile.conflicts.length}개의 철학 충돌 가능성이 확인되었습니다.
              </h2>
              <p className="m-0 mt-2 text-[12px] leading-[1.7] text-slate-600">
                이 충돌은 답을 고치라는 신호가 아니라, 현행 제도가 어떤 기준을 더 강하게 따라야 하는지 해석하기 위한 기준점입니다.
              </p>
            </div>
            <Badge variant="amber">참고</Badge>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {philosophyConflicts.map((conflict) => (
              <div key={conflict.id} className="rounded-[8px] border border-amber/20 bg-white px-3 py-2">
                <p className="m-0 text-[12px] font-[700] text-slate-900">{conflict.title}</p>
                <p className="m-0 mt-1 text-[11px] leading-[1.6] text-slate-500">{conflict.implication}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <CompanyContextBar companyName={companyName} responses={responses} />

      <AlignmentTensionMap map={alignmentMap} showConflicts={false} />

      <ResultStepHeader
        step="STEP 02 · 운영 리스크와 전체 조감"
        title="정합성이 어긋나면 어디서 실제 문제가 생깁니까?"
        body="여기서는 회사 규모, 성장 기조, 입력한 인재 기준을 반영한 운영 필요 기준과 현재 상태의 차이를 봅니다. 정합성 비교와 달리, 실제로 어디부터 손봐야 하는지 판단하기 위한 영역별 조감입니다."
      />
      <MemoBlock
        title={`${topicNames} 영역을 먼저 논의해야 합니다.`}
        body="현재 점수와 이 회사 조건에서 필요한 운영 기준의 차이가 큰 영역부터 보면, 제도 개선 논의가 일반론으로 흐르지 않고 실제 의사결정 순서로 정리됩니다."
      />

      <div className="mb-[18px]">
        <BenchmarkHelp />
      </div>

      <AlignmentOperatingRisk map={alignmentMap} />

      <div className="mb-[18px] grid grid-cols-1 gap-[14px] xl:grid-cols-3">
        <MetricCard
          variant={visibilityVariant}
          label="HR 가시성"
          badgeText={visTierText}
          value={Math.round(visibility.score)}
          unit="%"
          copy={visibility.blind_spot_labels.length === 0 ? "진단이 안 된 영역 없음" : `진단이 약한 영역: ${blindSpotNames}`}
        />
        <MetricCard
          variant="amber"
          label="제도 운영 일관성"
          badgeText={alignmentScore >= 70 ? "양호" : alignmentScore >= 50 ? "중간" : "위험"}
          value={alignmentScore}
          unit="/100"
          copy={
            topConflicts.length > 0
              ? "일부 제도 기준이 서로 다른 방향으로 작동합니다. 아래 정합성 괴리와 상세 분석에서 엇박자 요인을 확인하세요."
              : "보상, 채용, 평가, 리더십 기준이 같은 방향으로 작동하는지 평가한 전사 운영 점수입니다."
          }
        />
        <MetricCard
          variant="coral"
          label="주요 논의사항"
          badgeText={`${topicCount}개 영역`}
          value={topicCount}
          unit="개 영역"
          copy={`${topicNames} 영역에서 현재 방식과 이 회사 조건에서 필요한 운영 기준의 차이가 큽니다.`}
        />
      </div>

      {previousSnapshot ? (
        <section className="mb-[18px] rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="m-0 text-[14px] font-[690] text-slate-900">최근 진단 대비 변화</p>
              <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">
                같은 브라우저에 저장된 이전 진단과 비교해 정합성, 가시성, 최우선 논의 영역 변화를 확인합니다.
              </p>
            </div>
            <Badge variant="slate">최근 기록 비교</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="m-0 text-[11px] font-[760] text-slate-400">정합성 변화</p>
              <strong className="mt-1 block text-[16px] font-[720] text-slate-900">{formatDelta(alignmentDelta)}</strong>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="m-0 text-[11px] font-[760] text-slate-400">가시성 변화</p>
              <strong className="mt-1 block text-[16px] font-[720] text-slate-900">{formatDelta(visibilityDelta)}</strong>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="m-0 text-[11px] font-[760] text-slate-400">이전 우선 영역</p>
              <strong className="mt-1 block text-[16px] font-[720] text-slate-900">{previousSnapshot.topGapArea}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
          <div className="flex items-start justify-between gap-[18px] p-4 pb-0">
            <div>
              <p className="m-0 text-[14px] font-[680] text-slate-900">5개 영역 필요 기준 차이</p>
              <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
                회사 규모, 성장 기조, 입력한 인재 기준을 반영한 영역별 필요 기준과 현재 상태를 비교합니다.
              </p>
            </div>
            <Badge variant="slate">필요 기준 비교</Badge>
          </div>
          <div className="mx-4 mt-3 flex flex-wrap gap-2 text-[11px] font-[650] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-slate-200 bg-white px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-teal" />현재 응답
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-slate-200 bg-white px-2 py-1">
              <span className="h-0.5 w-4 border-t border-dashed border-slate-400" />필요 기준
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-slate-200 bg-white px-2 py-1">
              차이 = 논의 우선도
            </span>
          </div>
          <div className="px-[18px] pb-[18px] pt-[10px]">
            <RadarChart areas={areas} />
          </div>
        </div>
        <div className="rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
          <div className="flex items-start justify-between gap-[18px] p-4 pb-0">
            <div>
              <p className="m-0 text-[14px] font-[680] text-slate-900">영역별 논의 우선순위</p>
              <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
                필요 기준과 현재 점수의 차이가 클수록 먼저 논의할 영역입니다.
              </p>
            </div>
            <Badge variant="amber">{topicCount}개 영역</Badge>
          </div>
          <GapBarList areas={areas} />
        </div>
        <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-[12px] leading-[1.65] text-slate-500 xl:col-span-2">
          <strong className="font-[680] text-slate-800">읽는 방법:</strong>{" "}
          점선은 필요 기준, 초록색 영역은 현재 상태입니다. 우측 우선순위는{" "}
          <span className="font-[680] text-slate-800">필요 기준 - 현재 점수</span>를 기준으로 정렬한 논의 순서입니다.
          필요 기준은 회사 규모, 성장 기조, 입력한 인재 기준을 반영해 영역별로 다르게 설정됩니다.
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${insights.length >= 3 ? "xl:grid-cols-3" : insights.length === 2 ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
        {insights.slice(0, 3).map((insight, index) => (
          <InsightCard key={`${insight.headline}-${index}`} source={insight.source} headline={insight.headline} detail={insight.detail} />
        ))}
      </div>

      <ResultStepHeader
        step="STEP 03 · 다음 단계 안내"
        title="이제 무엇을 확인해야 합니까?"
        body="요약에서 방향과 우선순위를 확인했다면, 상세 분석에서는 근거를 더 깊게 보고 트레이드오프 분석에서는 선택에 따른 비용을 비교합니다."
      />
      <section className="mb-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-[1fr_1fr_1fr_260px] lg:divide-x lg:divide-y-0">
          {decisionCards.map((card) => (
            <div key={card.label} className="p-4">
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">{card.label}</p>
              <strong className="mt-2 block text-[15px] font-[680] leading-[1.45] text-slate-900">{card.title}</strong>
              <div className="mt-3 inline-flex max-w-full rounded-[7px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-[720] text-slate-700">
                {card.value}
              </div>
              <p className="m-0 mt-3 text-[12px] leading-[1.65] text-slate-500">{card.body}</p>
            </div>
          ))}
          <div className="bg-slate-50/70 p-4">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">데이터 신뢰도</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <strong className="text-[34px] font-[680] leading-none text-slate-900">{Math.round(visibility.score)}</strong>
              <span className="text-[14px] font-[650] text-slate-400">%</span>
            </div>
            <Badge variant={visibilityVariant}>{visTierText}</Badge>
            <p className="m-0 mt-3 text-[12px] leading-[1.65] text-slate-500">{visibilityCopy}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">다음 단계</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">
            요약을 확인했다면 영역별 근거와 운영 충돌을 자세히 봅니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePrint}>인쇄/PDF 저장</Button>
          <Button variant="primary" onClick={() => router.push("/result/detail")}>상세 분석 보기</Button>
        </div>
      </section>
    </>
  );
}
