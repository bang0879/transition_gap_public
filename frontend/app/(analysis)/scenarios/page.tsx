"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchScenarios } from "@/lib/api/content";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScenarioComparisonCards } from "@/components/scenario/ScenarioComparisonCards";
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
        title={<>좋은 시나리오는 비용이 없는 선택지가 아니라,<br className="hidden sm:block" /> 부담과 효과가 분명한 선택지입니다.</>}
        lead="각 시나리오는 추천 순위가 아니라 제도 패키지입니다. 회사가 얻을 효과, 추가로 관리할 부담, 당장 검토할 제도를 함께 비교합니다."
        actions={
          <>
            <Button onClick={() => router.push("/matrix")}>트레이드오프 분석으로</Button>
            <Button variant="primary" onClick={() => router.push(`/roadmap?scenario=${selectedId}`)}>실행 로드맵</Button>
          </>
        }
      />
      <ScenarioComparisonCards scenarios={scenarios} selectedId={selectedId} onSelect={selectScenario} />
      {selectedScenario ? <ScenarioDetailPanel scenario={selectedScenario} /> : null}
      <section className="mt-6 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="m-0 text-[13px] font-[690] text-slate-900">검토할 방향을 골랐다면 12개월 실행 순서로 바꿉니다.</p>
          <p className="m-0 mt-1 text-[12px] text-slate-500">로드맵에서도 선택은 조정 가능하며, 제도별 도입 순서를 다시 봅니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/matrix")}>트레이드오프 분석으로</Button>
          <Button variant="primary" onClick={() => router.push(`/roadmap?scenario=${selectedId}`)}>실행 로드맵</Button>
        </div>
      </section>
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
