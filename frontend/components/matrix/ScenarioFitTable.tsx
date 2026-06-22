"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

interface TradeoffSummary {
  gain: string;
  burden: string;
  talent_risk: string;
  decision_question: string;
}

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tradeoff_summary?: TradeoffSummary;
  warnings?: string[];
  package?: Array<{ area: string; action: string; timeline: string }>;
}

export interface MatrixSnapshot {
  a_quadrant_as_is?: string | null;
  a_quadrant_to_be?: string | null;
  b_quadrant_as_is?: string | null;
  b_quadrant_to_be?: string | null;
}

interface ScenarioFitTableProps {
  scenarios: Scenario[];
  selectedId: string;
  matrix?: MatrixSnapshot;
  onSelect: (id: string) => void;
}

export interface ScenarioMatrixConnection {
  role: string;
  axis: string;
  why: string;
  change: string;
  fitLabel: string;
}

const OPERATING_IMAGES: Record<string, { reference: string; fit: string }> = {
  performance: {
    reference: "Netflix식 고성과, 고책임 운영 이미지",
    fit: "성과 신호 강화",
  },
  community: {
    reference: "Google식 심리적 안전감, 협업 운영 이미지",
    fit: "안정감 회복",
  },
  elite: {
    reference: "초기 토스식 소수정예, 빠른 실행 이미지",
    fit: "핵심 밀도 강화",
  },
};

function operatingImageFor(id: string): { reference: string; fit: string } {
  return OPERATING_IMAGES[id] ?? {
    reference: "성장 단계 스타트업의 혼합 운영 이미지",
    fit: "추가 검토",
  };
}

function cleanQuadrant(label?: string | null): string {
  if (!label) return "미확인";
  return label.replace(/^Q\d:\s*/i, "").replace("평균의 함정형", "평균 기준형").replace(/\s+/g, " ").trim();
}

function scenarioIdFromSignal(signal: string, fallback = "community"): string {
  if (signal.includes("소수정예") || signal.includes("개인플레이어") || signal.includes("에이전시")) return "elite";
  if (signal.includes("단기 성과") || signal.includes("성과형") || signal.includes("시스템")) return "performance";
  if (signal.includes("장기 비전") || signal.includes("공동체") || signal.includes("가족형")) return "community";
  return fallback;
}

function matrixAxisText(matrix?: MatrixSnapshot): string {
  if (!matrix) return "Matrix A/B · 현재 위치와 지향점 간극";
  return `Matrix A: ${cleanQuadrant(matrix.a_quadrant_as_is)} → ${cleanQuadrant(matrix.a_quadrant_to_be)} · Matrix B: ${cleanQuadrant(matrix.b_quadrant_as_is)} → ${cleanQuadrant(matrix.b_quadrant_to_be)}`;
}

function targetScenarioId(matrix?: MatrixSnapshot): string {
  if (!matrix) return "community";
  return scenarioIdFromSignal(`${matrix.a_quadrant_to_be ?? ""} ${matrix.b_quadrant_to_be ?? ""}`);
}

function currentScenarioId(matrix?: MatrixSnapshot): string {
  if (!matrix) return "community";
  return scenarioIdFromSignal(`${matrix.a_quadrant_as_is ?? ""} ${matrix.b_quadrant_as_is ?? ""}`);
}

function scenarioWhy(id: string, matrix?: MatrixSnapshot): string {
  const targetId = targetScenarioId(matrix);
  const currentId = currentScenarioId(matrix);
  const aAsIs = cleanQuadrant(matrix?.a_quadrant_as_is);
  const aToBe = cleanQuadrant(matrix?.a_quadrant_to_be);
  const bToBe = cleanQuadrant(matrix?.b_quadrant_to_be);

  if (id === "performance") {
    if (targetId === id) {
      return `To-Be가 ${aToBe} 쪽에 찍혀 있어, 성과 기준과 보상 메시지를 조직 전체 규칙으로 선명하게 만드는 후보입니다. 현재가 ${aAsIs}라면 소수 핵심 인재 중심 신호를 누구에게나 납득 가능한 성과 기준으로 바꾸는 과제가 큽니다.`;
    }
    return "이번 지향점의 1순위가 아니더라도, 성과 차등을 강화할 때 얻는 속도와 평가 수용성 부담을 비교하기 위한 기준점입니다.";
  }

  if (id === "community") {
    if (targetId === id) {
      return `To-Be가 ${aToBe} 또는 ${bToBe} 방향으로 읽혀, 이탈 불안과 관계 기반 운영을 먼저 안정시키는 후보입니다. 다만 고성과자에게 필요한 차등 보상 신호가 약해지지 않도록 별도 장치가 필요합니다.`;
    }
    return "성과주의나 소수정예 방향을 고를 때 무엇을 포기하는지 보여주는 안정성 기준점입니다. 비용만 낮은 선택지가 아니라 핵심 인재 보상 신호가 약해질 수 있는 선택지로 비교해야 합니다.";
  }

  if (id === "elite") {
    if (targetId === id) {
      return `To-Be가 ${aToBe} 또는 ${bToBe} 방향으로 읽혀, 핵심 인재에게 권한과 보상을 집중해 실행 속도를 높이는 후보입니다. 내부 형평성과 비핵심 인력 메시지를 같이 설계해야 합니다.`;
    }
    if (currentId === id) {
      return `현재 제도가 ${aAsIs} 신호를 이미 보내고 있어, 이 후보는 새 방향이라기보다 현재 운영을 더 정교하게 강화하거나 의도적으로 줄일지 판단하는 비교 축입니다.`;
    }
    return "핵심 인재 집중 전략을 택할 때 얻는 속도와 조직 수용성 비용을 비교하기 위한 기준점입니다.";
  }

  return "현재 운영 위치와 지향점의 차이를 줄이기 위한 후보입니다. 얻는 효과와 추가 부담을 함께 비교해야 합니다.";
}

function scenarioChange(id: string): string {
  if (id === "performance") {
    return "고성과자에게는 보상 신호가 강해지지만, 평가 기준 공개와 리더 설명 부담이 같이 커집니다.";
  }
  if (id === "community") {
    return "이직 불안은 줄일 수 있지만, 고성과자에게 필요한 차등 보상 신호는 약해질 수 있습니다.";
  }
  if (id === "elite") {
    return "핵심 인재 밀도는 높아지지만, 내부 형평성과 비핵심 인력의 이탈 리스크를 관리해야 합니다.";
  }
  return "얻는 효과와 추가 부담을 함께 비교해야 합니다.";
}

export function scenarioMatrixConnection(id: string, matrix?: MatrixSnapshot): ScenarioMatrixConnection {
  const targetId = targetScenarioId(matrix);
  const currentId = currentScenarioId(matrix);
  const fitLabel = id === targetId ? "지향점 직접 연결" : id === currentId ? "현재 신호 보정" : "비교 기준";
  const role = id === targetId ? "1순위 검토" : id === currentId ? "현재 운영 점검" : "대안 비교";
  return {
    role,
    fitLabel,
    axis: matrixAxisText(matrix),
    why: scenarioWhy(id, matrix),
    change: scenarioChange(id),
  };
}

export function ScenarioFitTable({ scenarios, selectedId, matrix, onSelect }: ScenarioFitTableProps) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white print:break-inside-avoid">
      <div className="border-b border-slate-100 p-4">
        <p className="m-0 text-[14px] font-[680] text-slate-900">시나리오별 트레이드오프 확인</p>
        <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
          세 후보는 고정된 실행 축입니다. Matrix의 To-Be에 따라 1순위 검토 대상과 이유가 달라지고, 나머지는 무엇을 포기하거나 감당하는지 비교하는 기준점입니다.
        </p>
      </div>
      <div className="grid gap-3 p-4">
        {scenarios.map((scenario) => {
          const selected = selectedId === scenario.id;
          const image = operatingImageFor(scenario.id);
          const connection = scenarioMatrixConnection(scenario.id, matrix);
          const gain = scenario.tradeoff_summary?.gain ?? scenario.description;
          const burden = scenario.tradeoff_summary?.burden ?? scenario.warnings?.[0] ?? "추가 검토 필요";
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario.id)}
              className={`rounded-[8px] border p-4 text-left transition-all duration-300 ${
                selected
                  ? "border-[#b8ded9] bg-white shadow-[0_0_0_3px_rgba(47,143,134,0.08),0_10px_24px_rgba(15,23,42,0.05)]"
                  : "border-slate-200 bg-white hover:border-[#cfe7e2] hover:bg-slate-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-[13px] font-[680] text-slate-900">{scenario.name}</p>
                  <p className="m-0 mt-1 text-[11px] text-slate-500">{scenario.subtitle}</p>
                </div>
                <span className={`mt-1 rounded-full border px-[8px] py-[3px] text-[11px] font-[680] ${
                  selected ? "border-[#cfe7e2] bg-[#fbfefd] text-[#4c7974]" : "border-slate-200 bg-white text-slate-500"
                }`}>
                  {selected ? "검토 중" : connection.role}
                </span>
              </div>

              <div className="mt-3 rounded-[8px] border border-[#d9ebe7] bg-[#fbfefd] px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-[#4c7974]">Matrix 연결</p>
                  <span className="rounded-full border border-[#cfe7e2] bg-white px-2 py-[2px] text-[10px] font-[720] text-[#4c7974]">
                    {connection.fitLabel}
                  </span>
                </div>
                <p className="m-0 mt-1 text-[12px] font-[680] leading-[1.55] text-slate-800">{connection.axis}</p>
                <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-600"><GlossaryText text={connection.why} /></p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-[#4c7974]">개선되는 것</p>
                  <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-600"><GlossaryText text={gain} /></p>
                </div>
                <div>
                  <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-[#8a6259]">감당할 것</p>
                  <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-500">
                    <GlossaryText text={burden} />
                  </p>
                </div>
              </div>
              <p className="m-0 mt-3 border-t border-slate-100 pt-3 text-[11px] leading-[1.55] text-slate-500">
                바뀌는 방향: <span className="font-[680] text-slate-700"><GlossaryText text={connection.change} /></span>
              </p>
              <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-[11px] sm:grid-cols-[1fr_112px]">
                <span className="leading-[1.55] text-slate-500">
                  참고 이미지: <span className="font-[680] text-slate-700"><GlossaryText text={image.reference} /></span>
                </span>
                <span className="w-fit rounded-full border border-slate-200 bg-white px-[8px] py-[3px] font-[680] text-slate-600">
                  {image.fit}
                </span>
              </div>
              {scenario.package?.[0] ? (
                <p className="m-0 mt-3 border-t border-slate-100 pt-3 text-[11px] leading-[1.55] text-slate-500">
                  먼저 볼 제도: <span className="font-[680] text-slate-700"><GlossaryText text={scenario.package[0].action} /></span>
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}