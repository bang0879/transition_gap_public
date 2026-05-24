"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchScenarios } from "@/lib/api/content";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Button } from "@/components/shared/Button";
import { MemoBlock } from "@/components/result/MemoBlock";
import { MatrixSVG } from "@/components/visualization/MatrixSVG";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScenarioFitTable } from "@/components/matrix/ScenarioFitTable";
import { SelectedScenarioCard } from "@/components/matrix/SelectedScenarioCard";
import { useDiagnosis } from "@/lib/hooks/useDiagnosis";
import { usePageTracking } from "@/lib/hooks/usePageTracking";

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  philosophy: string;
  package: Array<{ area: string; action: string; timeline: string }>;
  impact?: Array<{ metric: string; after: string; direction?: string }>;
  financial_impact?: Array<{ item: string; amount: string; note?: string; color_intent?: string }>;
  warnings?: string[];
}

export default function MatrixPage() {
  const router = useRouter();
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  const { data: scenariosData } = useQuery({ queryKey: ["scenarios"], queryFn: () => fetchScenarios<Record<string, Scenario>>() });
  const scenarios = scenariosData ? Object.values(scenariosData) : [];
  const [selectedId, setSelectedId] = useState("community");
  usePageTracking("/matrix");

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="인사제도 시뮬레이션은 진단 결과를 기준으로 생성됩니다."
        body="현재 운영 위치와 대표 철학 기준점을 비교하려면 먼저 진단 입력을 완료해야 합니다."
      >
        <Button onClick={() => router.push("/diagnose/context")}>진단 입력으로</Button>
      </AnalysisNotice>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center text-slate-400">매트릭스를 준비하고 있습니다...</div>;
  }

  if (error || !data) {
    return (
      <AnalysisNotice
        eyebrow="시뮬레이션 오류"
        title="시뮬레이션 데이터를 불러오지 못했습니다."
        body="진단 결과가 생성되었는지 확인한 뒤 다시 시도해 주세요."
      >
        <Button onClick={() => router.push("/result/detail")}>상세 분석으로</Button>
      </AnalysisNotice>
    );
  }

  const selected = scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];
  const selectedGain = selected?.impact?.[0]
    ? `${selected.impact[0].metric} ${selected.impact[0].after}`
    : selected?.description;
  const selectedCost = selected?.financial_impact?.[0]
    ? `${selected.financial_impact[0].item} ${selected.financial_impact[0].amount}`
    : selected?.warnings?.[0];

  return (
    <>
      <PageHeader
        eyebrow="인사제도 시뮬레이션"
        title="우리 회사의 현재 운영 위치와 바꿀 수 있는 방향"
        lead="매트릭스는 정답을 고르는 표가 아니라, 어떤 제도를 얻기 위해 무엇을 감수할지 결정하는 앵커링 도구입니다."
        actions={
          <>
            <Button onClick={() => router.push("/result/detail")}>상세로</Button>
            <Button variant="primary" onClick={() => router.push(`/scenarios?scenario=${selectedId}`)}>시나리오 비교</Button>
          </>
        }
      />
      <MemoBlock
        title="인사제도는 정답이 아니라, 감수할 비용의 묶음입니다."
        body="아래 매트릭스는 대표님의 철학이 향하는 방향(To-Be)과 현재 제도가 실제로 작동하는 위치(As-Is)의 거리를 보여줍니다. 이 거리가 곧 전환 비용이며, 어떤 방향이든 반드시 포기해야 할 것이 있습니다."
      />
      <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="py-2 lg:px-4 lg:first:pl-0">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">얻는 것</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              선택한 방향이 강화하는 인재 메시지, 보상 원칙, 운영 속도를 확인합니다.
            </p>
          </div>
          <div className="py-3 lg:px-4 lg:py-2">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">감수할 것</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              인건비, 평가 갈등, 리더 운영 부담처럼 반대급부로 커지는 비용을 봅니다.
            </p>
          </div>
          <div className="py-3 lg:px-4 lg:py-2 lg:last:pr-0">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">결정 질문</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              지금 이 조직이 가장 먼저 감당할 수 있는 비용은 무엇입니까?
            </p>
          </div>
        </div>
      </section>
      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <MatrixSVG
          title="매트릭스 A"
          markerId="matrix-a-arrow"
          subtitle="보상 구조와 성과 운영의 방향"
          quadrantLabels={["비전형 · 공동체", "성과형 · 차등", "안정형 · 평균", "현금형 · 개인성과"]}
          quadrantExamples={["미션 결속형", "고성과 보상형", "평균 안정형", "개인 인센티브형"]}
          xAxisLabel="지분/비전 ← → 현금/인센티브"
          yAxisLabel="팀 시너지 ← → 개인 성과"
          asIs={{ x: data.matrix.a_x_as_is, y: data.matrix.a_y_as_is }}
          toBe={{ x: data.matrix.a_x_to_be, y: data.matrix.a_y_to_be }}
          badgeText={data.matrix.a_quadrant_as_is}
        />
        <MatrixSVG
          title="매트릭스 B"
          markerId="matrix-b-arrow"
          subtitle="의사결정 통제와 컬처핏 운영의 방향"
          quadrantLabels={["자율 · 스킬", "통제 · 스킬", "자율 · 컬처", "통제 · 컬처"]}
          quadrantExamples={["전문가 자율형", "절차 기반 전문가형", "가족형 자율 조직", "대기업 시스템형"]}
          xAxisLabel="자율 ← → 통제"
          yAxisLabel="스킬 ← → 컬처핏"
          asIs={{ x: data.matrix.b_x_as_is, y: data.matrix.b_y_as_is }}
          toBe={{ x: data.matrix.b_x_to_be ?? data.matrix.b_x_as_is, y: data.matrix.b_y_to_be ?? data.matrix.b_y_as_is }}
          badgeText={data.matrix.b_quadrant_as_is}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <ScenarioFitTable scenarios={scenarios} selectedId={selectedId} onSelect={setSelectedId} />
        {selected ? (
          <SelectedScenarioCard
            name={selected.name}
            philosophy={selected.philosophy}
            packageItems={selected.package}
            gain={selectedGain}
            cost={selectedCost}
            warning={selected.warnings?.[0]}
          />
        ) : null}
      </div>
    </>
  );
}
