"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GapBarList } from "@/components/visualization/GapBarList";
import { InsightCard } from "@/components/result/InsightCard";
import { MemoBlock } from "@/components/result/MemoBlock";
import { MetricCard } from "@/components/result/MetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { RadarChart } from "@/components/visualization/RadarChart";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { logEvent } from "@/lib/api/events";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useSessionStore } from "@/lib/store/session";

export default function ResultPage() {
  const router = useRouter();
  const sessionId = useSessionStore((state) => state.sessionId);
  const companyName = useSessionStore((state) => state.companyName);
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  usePageTracking("/result");

  useEffect(() => {
    if (!sessionId || !data) return;
    const avgScore = Math.round(data.areas.reduce((sum, area) => sum + area.score, 0) / data.areas.length);
    logEvent({
      session_id: sessionId,
      event_type: "result_view",
      page: "/result",
      metadata: {
        avg_score: avgScore,
        visibility_score: data.visibility.score,
      },
      timestamp: new Date().toISOString(),
    });
  }, [data, sessionId]);

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
        <Button onClick={() => router.push("/diagnose/context")}>진단 시작하기</Button>
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
        <Button onClick={() => router.push("/diagnose/context")}>진단 입력으로</Button>
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  const { areas, visibility, insights, alignment } = data;
  const avgScore = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const alignmentScore = alignment?.score ?? avgScore;
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
      body: "원인을 확인한 뒤, 얻는 것과 감수할 것을 비교합니다.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="진단결과 요약"
        title={
          <>
            {companyName ? <span className="text-teal-deep">{companyName}</span> : "우리 회사"} 인사제도 정합성 진단결과 요약
          </>
        }
        lead="이 화면은 잘한 점수를 보여주는 대시보드가 아니라, 회사가 어디부터 제도를 정렬할지 결정하기 위한 첫 장입니다."
        actions={
          <>
            <Button onClick={handlePrint}>리포트 저장</Button>
            <Button variant="primary" onClick={() => router.push("/result/detail")}>상세 분석 보기</Button>
          </>
        }
      />

      <MemoBlock
        title={`${topicNames} 영역을 먼저 논의해야 합니다.`}
        body="현재 점수와 이 회사 조건에서 필요한 운영 기준의 차이가 큰 영역부터 보면, 제도 개선 논의가 일반론으로 흐르지 않고 실제 의사결정 순서로 정리됩니다."
      />

      <MemoBlock
        title="필요 기준은 외부 모범답안이 아니라, 이 회사 조건에서 필요한 최소 운영 기준입니다."
        body="회사 규모, 성장 기조, 입력한 인재 기준을 반영해 영역별 필요 기준을 다르게 잡습니다. 따라서 차이는 점수 부족이 아니라 먼저 논의해야 할 운영 차이입니다."
      />

      <section className="mb-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-[1fr_1fr_1fr_260px] lg:divide-x lg:divide-y-0">
          {decisionCards.map((card) => (
            <div key={card.label} className="p-4">
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">{card.label}</p>
              <strong className="mt-2 block text-[15px] font-[680] leading-[1.45] text-slate-900">{card.title}</strong>
              <div className={`mt-3 inline-flex max-w-full rounded-[7px] border px-2.5 py-1 text-[11px] font-[720] ${
                card.label === "가장 먼저 볼 영역"
                  ? "border-coral/20 bg-coral-soft text-coral"
                  : "border-teal/20 bg-teal-soft text-teal-deep"
              }`}>
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
              ? `영역 평균 ${alignment.base_score}점에서 제도 간 충돌 ${alignment.total_penalty}점을 반영했습니다.`
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

      {topConflicts.length > 0 ? (
        <section className="mb-4 grid gap-3 rounded-[10px] border border-amber/25 bg-[#fffdf8] p-4 print:break-inside-avoid lg:grid-cols-2">
          {topConflicts.map((conflict) => (
            <article key={conflict.id}>
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">
                운영 충돌, -{conflict.penalty}점
              </p>
              <h3 className="m-0 mt-2 text-[14px] font-[690] leading-[1.45] text-slate-900">
                {conflict.title}
              </h3>
              <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">
                {conflict.detail}
              </p>
            </article>
          ))}
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
            <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-amber/25 bg-amber-soft px-2 py-1 text-amber">
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
          <span className="font-[680] text-coral">필요 기준 - 현재 점수</span>를 기준으로 정렬한 논의 순서입니다.
          필요 기준은 회사 규모, 성장 기조, 입력한 인재 기준을 반영해 영역별로 다르게 설정됩니다.
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${insights.length >= 3 ? "xl:grid-cols-3" : insights.length === 2 ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
        {insights.slice(0, 3).map((insight, index) => (
          <InsightCard key={`${insight.headline}-${index}`} source={insight.source} headline={insight.headline} detail={insight.detail} />
        ))}
      </div>

      <section className="mt-4 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">다음 단계</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">
            요약을 확인했다면 영역별 근거와 운영 충돌을 자세히 봅니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePrint}>리포트 저장</Button>
          <Button variant="primary" onClick={() => router.push("/result/detail")}>상세 분석 보기</Button>
        </div>
      </section>
    </>
  );
}
