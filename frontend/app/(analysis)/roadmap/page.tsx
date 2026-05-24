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
        title={`${scenario.name}을 실행 가능한 12개월 계획으로 번역합니다.`}
        lead="이 화면은 추천안의 발표 자료가 아니라 대표가 실행 여부를 판단하기 위한 최종 산출물입니다. 선택한 시나리오를 선행과제, 파일럿 도입, 세부 제도 도입, 제도 안정화, 성과 검증의 순서로 나눠 무엇을 준비하고 무엇을 확인할지 정리합니다."
        actions={
          <>
            <Button onClick={() => router.push("/scenarios")}>시나리오 비교</Button>
            <Button variant="primary" onClick={() => window.print()}>리포트 초안 생성</Button>
          </>
        }
      />
      <MemoBlock
        icon="1"
        title="0~1개월 선행과제는 일정이 아니라 도입 조건입니다."
        body="HR 데이터, 보상 기준, 평가 운영 기준이 정리되지 않은 상태에서 제도부터 바꾸면 실행 리스크가 커집니다. 이 로드맵은 먼저 기준선을 고정하고, 작은 파일럿으로 수용성을 확인한 뒤, 12개월 안에 유지할 제도와 되돌릴 제도를 판단하도록 설계했습니다."
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
