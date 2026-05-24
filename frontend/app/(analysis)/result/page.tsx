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

  const { areas, visibility, insights } = data;
  const avgScore = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const topicAreas = areas.filter((area) => area.gap >= 10).sort((a, b) => b.gap - a.gap);
  const topicCount = topicAreas.length;
  const topicNames = topicAreas.map((area) => area.area_name).join(" · ") || "핵심";
  const topGapArea = topicAreas[0] ?? [...areas].sort((a, b) => b.gap - a.gap)[0];
  const visTierText = visibility.score >= 70 ? "본 진단 가능" : visibility.score >= 50 ? "추가 수집 권장" : "데이터 부족";

  return (
    <>
      <PageHeader
        eyebrow="진단 리포트 요약"
        title={`${companyName ? `${companyName} ` : ""}인사제도 정합성 진단 결과`}
        lead="현재 가장 큰 문제는 제도 하나의 부재가 아니라, 보상 · 평가 · 리더십 운영 기준이 서로 다른 방향으로 작동하는 것입니다."
        actions={
          <>
            <Button onClick={handlePrint}>리포트 저장</Button>
            <Button variant="primary" onClick={() => router.push("/result/detail")}>상세 분석 보기</Button>
          </>
        }
      />

      <MemoBlock title={`${topicNames} 영역의 정합성을 먼저 정렬해야 합니다.`} body={visibility.tier_message} />

      <section className="mb-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="p-4">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">먼저 볼 영역</p>
            <strong className="mt-2 block text-[15px] font-[680] text-slate-900">{topGapArea?.area_name ?? "핵심 영역"}</strong>
            <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-500">
              벤치마크와 가장 크게 벌어진 영역부터 논의하면 실행 우선순위가 흐려지지 않습니다.
            </p>
          </div>
          <div className="p-4">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">판단 기준</p>
            <strong className="mt-2 block text-[15px] font-[680] text-slate-900">현재 상태와 목표 기준의 차이</strong>
            <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-500">
              높은 점수를 자랑하는 화면이 아니라, 어디부터 제도 정렬을 시작할지 정하는 화면입니다.
            </p>
          </div>
          <div className="p-4">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">다음 의사결정</p>
            <strong className="mt-2 block text-[15px] font-[680] text-slate-900">상세 근거 확인 후 시뮬레이션</strong>
            <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-500">
              상세 분석에서 원인을 확인하고, 인사제도 시뮬레이션에서 감수할 비용을 비교합니다.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-[18px] grid grid-cols-1 gap-[14px] xl:grid-cols-3">
        <MetricCard
          variant="teal"
          label="HR 가시성"
          badgeText={visTierText}
          value={Math.round(visibility.score)}
          unit="%"
          copy={visibility.blind_spot_labels.length === 0 ? "진단이 안 된 영역 없음" : `진단이 안 된 영역 ${visibility.blind_spots.length}개`}
        />
        <MetricCard
          variant="amber"
          label="인사제도 정합성 지수"
          badgeText={avgScore >= 70 ? "양호" : avgScore >= 50 ? "중간" : "위험"}
          value={avgScore}
          unit="/100"
          copy="보상·채용·평가·리더십 운영 기준이 하나의 철학 아래 유기적으로 맞물려 돌아가는지 평가한 전사 정렬 점수입니다."
        />
        <MetricCard
          variant="coral"
          label="주요 논의사항"
          badgeText={`${topicCount}개 영역`}
          value={topicCount}
          unit="개 영역"
          copy={topicNames}
        />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
          <div className="flex items-start justify-between gap-[18px] p-4 pb-0">
            <div>
              <p className="m-0 text-[14px] font-[680] text-slate-900">5개 영역 정합성 프로파일</p>
              <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
                현재 상태와 동일 업종·규모 스타트업의 목표 운영 기준점을 비교합니다.
              </p>
            </div>
            <Badge variant="slate">벤치마크 기준</Badge>
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
                벤치마크와 현재 점수의 차이가 클수록 먼저 논의할 영역입니다.
              </p>
            </div>
            <Badge variant="amber">{topicCount}개 영역</Badge>
          </div>
          <GapBarList areas={areas} />
        </div>
        <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-[12px] leading-[1.65] text-slate-500 xl:col-span-2">
          <strong className="font-[680] text-slate-800">읽는 방법:</strong>{" "}
          좌측의 점선 영역은 벤치마크, teal 영역은 현재 상태입니다. 우측 우선순위는{" "}
          <span className="font-[680] text-coral">벤치마크 점수 - 현재 점수</span>를 기준으로 정렬한 논의 순서입니다.
          벤치마크는 동일 업종·규모 스타트업이 제도를 무리 없이 운영하기 위해 필요한 목표 운영 수준으로 사용합니다.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {insights.slice(0, 3).map((insight, index) => (
          <InsightCard key={`${insight.headline}-${index}`} source={insight.source} headline={insight.headline} detail={insight.detail} />
        ))}
      </div>
    </>
  );
}
