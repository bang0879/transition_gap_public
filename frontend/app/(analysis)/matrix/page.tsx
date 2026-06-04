"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const OPERATING_REFERENCES: Record<string, string> = {
  performance: "Netflix식 고성과, 고책임 운영 이미지",
  community: "Google식 심리적 안전감, 협업 운영 이미지",
  elite: "초기 토스식 소수정예, 빠른 실행 이미지",
};

function referenceForScenario(id: string): string {
  return OPERATING_REFERENCES[id] ?? "성장 단계 스타트업의 혼합 운영 이미지";
}

function confidenceText(score: number): string {
  if (score >= 70) return `가시성 ${Math.round(score)}% · 정량 비교 신뢰도 높음`;
  if (score >= 40) return `가시성 ${Math.round(score)}% · 신뢰도 중간`;
  return `가시성 ${Math.round(score)}% · 정성 판단 우선`;
}

function scenarioFromToBe(matrix: {
  a_quadrant_to_be?: string | null;
  b_quadrant_to_be?: string | null;
}): string {
  const signal = `${matrix.a_quadrant_to_be ?? ""} ${matrix.b_quadrant_to_be ?? ""}`;
  if (signal.includes("소수정예") || signal.includes("개인플레이어") || signal.includes("에이전시")) return "elite";
  if (signal.includes("단기 성과") || signal.includes("성과형") || signal.includes("시스템")) return "performance";
  if (signal.includes("장기 비전") || signal.includes("공동체") || signal.includes("가족형")) return "community";
  return "community";
}

export default function MatrixPage() {
  const router = useRouter();
  const { data, isLoading, error, isWaitingForResponses } = useDiagnosis();
  const { data: scenariosData } = useQuery({ queryKey: ["scenarios"], queryFn: () => fetchScenarios<Record<string, Scenario>>() });
  const scenarios = scenariosData ? Object.values(scenariosData) : [];
  const [selectedId, setSelectedId] = useState("community");
  const [manualSelection, setManualSelection] = useState(false);
  usePageTracking("/matrix");

  useEffect(() => {
    if (!manualSelection && data?.matrix) {
      setSelectedId(scenarioFromToBe(data.matrix));
    }
  }, [data?.matrix, manualSelection]);

  if (isWaitingForResponses) {
    return (
      <AnalysisNotice
        eyebrow="진단 입력 필요"
        title="트레이드오프 분석은 진단 결과를 기준으로 생성됩니다."
        body="현재 운영 위치와 회사가 선택한 방향을 비교하려면 먼저 진단 입력을 완료해야 합니다."
      >
        <Button onClick={() => router.push("/diagnose/philosophy")}>진단 입력으로</Button>
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
    ? `${selected.impact[0].metric} 개선 목표: ${selected.impact[0].after}`
    : selected?.description;
  const selectedCost = selected?.financial_impact?.[0]
    ? `${selected.financial_impact[0].item} 예상 부담: ${selected.financial_impact[0].amount}`
    : selected?.warnings?.[0];
  const matrixConfidence = confidenceText(data.visibility.score);
  const selectedReference = selected ? referenceForScenario(selected.id) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="트레이드오프 분석 · 매트릭스 A/B"
        title="어느 제도를 도입할지가 아니라, 어느 모순을 감수할지 선택합니다."
        lead="As-Is는 현재 운영 데이터로 자동 배치하고, To-Be는 회사가 선택한 인재 운영 방향으로 도출합니다. 두 점 사이의 거리가 클수록 제도 변경에 따른 조직의 운영 부담이 커집니다."
        actions={
          <>
            <Button onClick={() => router.push("/result/detail")}>상세로</Button>
            <Button variant="primary" onClick={() => router.push(`/scenarios?scenario=${selectedId}`)}>시나리오 비교</Button>
          </>
        }
      />
      <MemoBlock
        title="인사제도 선택은 결국 감수할 비용을 정하는 일입니다."
        body="아래 매트릭스는 회사가 선택한 방향(To-Be)과 현재 제도가 실제로 작동하는 위치(As-Is)의 거리를 보여줍니다. 이 거리가 곧 실행 부담이며, 어떤 방향이든 반드시 포기해야 할 것이 있습니다."
      />
      <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="py-2 lg:px-4 lg:first:pl-0">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">읽는 순서</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              현재 위치를 먼저 보고, To-Be까지의 선 길이로 전환 비용을 봅니다.
            </p>
          </div>
          <div className="py-2 lg:px-4 lg:first:pl-0">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">얻는 것</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              선택한 방향이 강화하는 인재 메시지, 보상 원칙, 운영 속도.
            </p>
          </div>
          <div className="py-3 lg:px-4 lg:py-2">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">감수할 것</p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              인건비, 평가 갈등, 리더 운영 부담처럼 반대급부로 커지는 비용.
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
          quadrantLabels={["Q2 장기 비전형 공동체", "Q1 단기 성과형 용병조직", "Q3 평균의 함정형", "Q4 소수정예 중심형"]}
          quadrantExamples={["Google식 협업", "Netflix식 고성과", "평균 안정형", "토스식 소수정예"]}
          xAxisLabel="지분/비전 ← → 현금/인센티브"
          yAxisLabel="팀 시너지 ↑  개인 압도적 성과 ↓"
          asIs={{ x: data.matrix.a_x_as_is, y: data.matrix.a_y_as_is }}
          toBe={{ x: data.matrix.a_x_to_be, y: data.matrix.a_y_to_be }}
          badgeText={data.matrix.a_quadrant_as_is}
          confidenceText={matrixConfidence}
        />
        <MatrixSVG
          title="매트릭스 B"
          markerId="matrix-b-arrow"
          subtitle="의사결정 통제와 컬처핏 운영의 방향"
          quadrantLabels={["Q2 가족형 자율 조직", "Q4 대기업 공채 시스템형", "Q1 개인플레이어 중심형", "Q3 에이전시형 분업 조직"]}
          quadrantExamples={["Google식 자율", "대기업 공채식", "개인 성과형", "에이전시식 분업"]}
          xAxisLabel="자율과 속도 ← → 통제와 절차"
          yAxisLabel="조직 적합성 ↑  즉시 전력 ↓"
          asIs={{ x: data.matrix.b_x_as_is, y: data.matrix.b_y_as_is }}
          toBe={{ x: data.matrix.b_x_to_be ?? data.matrix.b_x_as_is, y: data.matrix.b_y_to_be ?? data.matrix.b_y_as_is }}
          badgeText={data.matrix.b_quadrant_as_is}
          confidenceText="Matrix B는 의사결정 병목과 컬처핏 기준의 비용을 보여줍니다."
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <ScenarioFitTable
          scenarios={scenarios}
          selectedId={selectedId}
          onSelect={(id) => {
            setManualSelection(true);
            setSelectedId(id);
          }}
        />
        {selected ? (
          <SelectedScenarioCard
            name={selected.name}
            philosophy={selected.philosophy}
            packageItems={selected.package}
            gain={selectedGain}
            cost={selectedCost}
            warning={selected.warnings?.[0]}
            reference={selectedReference}
          />
        ) : null}
      </div>
      <p className="m-0 mt-3 rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-[12px] leading-[1.65] text-slate-500">
        매트릭스의 기업 예시는 이해를 돕기 위한 운영 이미지이며, 그대로 따라 하라는 뜻은 아닙니다.
      </p>
      <section className="mt-6 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="m-0 text-[13px] font-[690] text-slate-900">트레이드오프를 확인했다면 시나리오별 실행안을 비교합니다.</p>
          <p className="m-0 mt-1 text-[12px] text-slate-500">선택은 확정이 아니라, 다음 화면에서 더 구체적으로 검토합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/result/detail")}>상세 분석으로</Button>
          <Button variant="primary" onClick={() => router.push(`/scenarios?scenario=${selectedId}`)}>시나리오 비교</Button>
        </div>
      </section>
    </>
  );
}
