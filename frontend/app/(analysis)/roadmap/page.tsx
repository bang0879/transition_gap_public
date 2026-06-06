"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchScenarios } from "@/lib/api/content";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { usePageTracking } from "@/lib/hooks/usePageTracking";

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  philosophy?: string;
  package?: Array<{ area: string; action: string; timeline: string }>;
  impact?: Array<{ metric: string; after: string }>;
  financial_impact?: Array<{ item: string; amount: string; note?: string; rationale?: string }>;
  warnings?: string[];
}

function RoadmapContent() {
  const router = useRouter();
  const params = useSearchParams();
  const scenarioId = params.get("scenario") || "community";
  const { data: scenarios } = useQuery({ queryKey: ["scenarios"], queryFn: () => fetchScenarios<Record<string, Scenario>>() });
  usePageTracking("/roadmap");

  const scenario = scenarios?.[scenarioId];
  if (!scenario) {
    return <div className="p-9 text-slate-400">시나리오 데이터를 불러오는 중...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow={`실행 로드맵 · ${scenario.name}`}
        title="12개월 동안 무엇을 먼저 바꾸고, 무엇을 확인할지 정합니다."
        lead="이 화면은 정답안이 아니라 실행 판단표입니다. 선택한 시나리오를 선행과제, 파일럿 도입, 세부 제도 도입, 제도 안정화, 성과 검증의 순서로 나눠 준비할 일과 확인할 지표를 정리합니다."
        actions={
          <>
            <Button onClick={() => router.push("/scenarios")}>시나리오 비교</Button>
            <Button variant="primary" onClick={() => window.print()}>인쇄/PDF 저장</Button>
          </>
        }
      />
      <RoadmapCautionCards />
      <RoadmapTimeline scenario={scenario} />
      <section className="mt-6 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="m-0 text-[13px] font-[690] text-slate-900">로드맵 검토가 끝나면 현재 화면을 내부 공유용으로 저장합니다.</p>
          <p className="m-0 mt-1 text-[12px] text-slate-500">정식 PDF 디자인은 별도 작업으로 두고, 지금은 브라우저 인쇄/PDF 저장을 사용합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push(`/scenarios?scenario=${scenarioId}`)}>시나리오 비교</Button>
          <Button variant="primary" onClick={() => window.print()}>인쇄/PDF 저장</Button>
        </div>
      </section>
    </>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="p-9 text-slate-400">로딩 중...</div>}>
      <RoadmapContent />
    </Suspense>
  );
}

function RoadmapCautionCards() {
  const items = [
    {
      title: "선행과제는 도입 조건입니다.",
      body: "HR 데이터, 보상 기준, 평가 운영 기준이 정리되지 않은 상태에서 제도부터 바꾸면 실행 리스크가 커집니다.",
    },
    {
      title: "작게 검증한 뒤 넓힙니다.",
      body: "먼저 작은 파일럿으로 리더 실행력과 구성원 수용성을 확인하고, 전사 확대 여부를 다시 판단합니다.",
    },
    {
      title: "유지할 것과 되돌릴 것을 정합니다.",
      body: "12개월 동안 비용, 수용성, 성과 신호를 함께 보고 다음 사이클에 남길 제도만 확정합니다.",
    },
  ];

  return (
    <section className="mb-[22px] grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-[10px] border border-[#e8dcc7] bg-[#fffaf0] p-4">
          <p className="m-0 text-[13px] font-[700] leading-[1.45] text-slate-900">{item.title}</p>
          <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">{item.body}</p>
        </article>
      ))}
    </section>
  );
}
