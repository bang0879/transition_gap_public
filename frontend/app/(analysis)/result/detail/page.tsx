"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AreaSidebar } from "@/components/detail/AreaSidebar";
import { AsIsToBePanel } from "@/components/detail/AsIsToBePanel";
import { BenchmarkRow } from "@/components/detail/BenchmarkRow";
import { BreakdownTable } from "@/components/detail/BreakdownTable";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScoreHero } from "@/components/detail/ScoreHero";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { usePageTracking } from "@/lib/hooks/usePageTracking";

export default function DetailPage() {
  const router = useRouter();
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  usePageTracking("/result/detail");

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="영역별 상세 분석은 결과 생성 후 확인할 수 있습니다."
        body="먼저 조직 컨텍스트와 제도 운영 상태를 입력하면, 각 영역의 As-Is와 To-Be 전환 근거가 생성됩니다."
      >
        <Button onClick={() => router.push("/diagnose/philosophy")}>진단 입력으로</Button>
      </AnalysisNotice>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center text-slate-400">로딩 중...</div>;
  }

  if (error || !data || data.areas.length === 0) {
    return (
      <AnalysisNotice
        eyebrow="상세 분석 오류"
        title="상세 분석을 불러오지 못했습니다."
        body={error instanceof Error ? error.message : "진단 결과를 다시 생성해 주세요."}
      >
        <Button onClick={() => router.push("/result")}>요약으로</Button>
        <Button variant="primary" onClick={() => window.location.reload()}>다시 시도</Button>
      </AnalysisNotice>
    );
  }

  const sorted = [...data.areas].sort((a, b) => b.gap - a.gap);
  const active = sorted.find((area) => area.area_id === selectedAreaId) ?? sorted[0];
  const activeRank = sorted.findIndex((area) => area.area_id === active.area_id) + 1;

  return (
    <>
      <PageHeader
        eyebrow="상세 분석 · 전환 근거"
        title="영역별 상세 분석"
        lead="현재 제도가 어떤 방식으로 작동하고 있으며, 어떤 운영 기준으로 바뀌어야 하는지 영역별로 확인합니다."
        actions={
          <>
            <Button onClick={() => router.push("/result")}>요약으로</Button>
            <Button variant="teal" onClick={() => router.push("/matrix")}>트레이드오프 분석</Button>
          </>
        }
      />
      <div className="grid gap-[18px] xl:grid-cols-[270px_1fr]">
        <AreaSidebar areas={sorted} activeId={active.area_id} onSelect={setSelectedAreaId} />
        <section>
          <ScoreHero area={active} rank={activeRank} />
          <AsIsToBePanel breakdown={active.score_breakdown} />
          <BreakdownTable breakdown={active.score_breakdown} />
          <BenchmarkRow areaId={active.area_id} />
        </section>
      </div>
      <section className="mt-4 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">다음 단계</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">
            상세 근거를 확인했다면, 이제 어떤 방향을 얻고 무엇을 감수할지 비교합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/result")}>진단결과 요약</Button>
          <Button variant="primary" onClick={() => router.push("/matrix")}>트레이드오프 분석</Button>
        </div>
      </section>
    </>
  );
}
