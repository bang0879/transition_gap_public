"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchScenarios } from "@/lib/api/content";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { ScenarioComparisonTable } from "@/components/scenario/ScenarioComparisonTable";
import { ScenarioDetailPanel } from "@/components/scenario/ScenarioDetailPanel";
import { logEvent } from "@/lib/api/events";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useSessionStore } from "@/lib/store/session";

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  philosophy?: string;
  impact?: Array<{ metric: string; after: string; direction?: string }>;
  financial_impact?: Array<{ item: string; amount: string; unit?: string; note?: string; rationale?: string; color_intent?: string }>;
  package?: Array<{ area: string; action: string; timeline: string }>;
  warnings?: string[];
}

function ScenariosContent() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("scenario") || "community";
  const { data } = useQuery({ queryKey: ["scenarios"], queryFn: () => fetchScenarios<Record<string, Scenario>>() });
  const scenarios = data ? Object.values(data) : [];
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];
  const sessionId = useSessionStore((state) => state.sessionId);
  usePageTracking("/scenarios");

  const selectScenario = (id: string) => {
    if (sessionId) {
      logEvent({
        session_id: sessionId,
        event_type: "tab_click",
        page: "/scenarios",
        metadata: { scenario_clicked: id },
        timestamp: new Date().toISOString(),
      });
    }
    router.replace(`/scenarios?scenario=${id}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        eyebrow="시나리오 비교"
        title="실행 방향을 선택하기 전에 얻는 것과 감수할 것을 비교합니다."
        lead="각 시나리오는 추천이 아니라 선택지입니다. 대표가 감수할 리스크와 조직이 견딜 수 있는 속도를 함께 봅니다."
        actions={
          <>
            <Button onClick={() => router.push("/matrix")}>매트릭스로</Button>
            <Button variant="primary" onClick={() => router.push(`/roadmap?scenario=${selectedId}`)}>실행 로드맵</Button>
          </>
        }
      />
      <div className="mb-4 grid gap-4 xl:grid-cols-3">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            id={scenario.id}
            name={scenario.name}
            subtitle={scenario.subtitle}
            description={scenario.description}
            selected={selectedId === scenario.id}
            onSelect={selectScenario}
          />
        ))}
      </div>
      {selectedScenario ? <ScenarioDetailPanel scenario={selectedScenario} /> : null}
      <ScenarioComparisonTable scenarios={scenarios} selectedId={selectedId} />
    </>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={<div className="p-9 text-slate-400">로딩 중...</div>}>
      <ScenariosContent />
    </Suspense>
  );
}
