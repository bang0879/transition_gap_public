"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchScenarios } from "@/lib/api/content";
import { Button } from "@/components/shared/Button";
import { MemoBlock } from "@/components/result/MemoBlock";
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
        title={`${scenario.name} 12개월 실행 로드맵`}
        lead="이 로드맵은 제도를 한 번에 바꾸지 않습니다. 선택한 시나리오를 선행과제, 파일럿, 세부 제도 도입, 안정화, 성과 검증의 5단계로 나눠 의사결정할 수 있게 정리합니다."
        actions={
          <>
            <Button onClick={() => router.push("/scenarios")}>시나리오 비교</Button>
            <Button variant="primary" onClick={() => window.print()}>리포트 초안 생성</Button>
          </>
        }
      />
      <MemoBlock
        icon="1"
        title="0~1개월 선행 과제는 선택사항이 아니라 도입 조건입니다."
        body="HR 가시성이 충분하지 않으면 시뮬레이션 결과를 바로 제도로 옮기기 어렵습니다. 보상 시장 위치, 평가 운영 데이터, 리더 실행 기준을 먼저 보강해야 합니다."
      />
      <RoadmapTimeline scenario={scenario} />
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
