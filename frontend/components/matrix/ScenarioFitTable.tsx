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

const SCENARIO_FOCUS: Record<string, { axis: string; why: string; change: string }> = {
  performance: {
    axis: "보상·평가 신호",
    why: "성과 기준, 평가 수용성, 차등 보상을 한 줄로 연결하는 선택입니다. Matrix A에서 보상과 성과 기준이 흐릿할 때, 구성원에게 '무엇을 하면 더 크게 인정받는지'를 선명하게 만드는 데 집중합니다.",
    change: "얻는 것은 고성과자 설득력이고, 감당할 것은 평가 기준 공개와 리더 설명 부담입니다.",
  },
  community: {
    axis: "안정감·관계 기반 운영",
    why: "이탈 불안, 온보딩 실패, 리더-구성원 신뢰를 먼저 낮추는 선택입니다. Matrix A/B에서 안정감이나 조직 적합성 신호가 약할 때, 구성원이 오래 머물 수 있는 반복 루틴을 만드는 데 집중합니다.",
    change: "얻는 것은 조직 예측 가능성이고, 감당할 것은 고성과자에게 줄 차등 보상 신호가 약해질 수 있다는 점입니다.",
  },
  elite: {
    axis: "핵심 인재 밀도·실행 속도",
    why: "소수 핵심 역할에 권한, 보상, 의사결정을 집중하는 선택입니다. Matrix A/B에서 빠른 실행이나 즉시 전력 신호가 중요할 때, 전사 평균보다 핵심 인재 밀도를 높이는 데 집중합니다.",
    change: "얻는 것은 중요한 역할의 속도와 책임감이고, 감당할 것은 내부 형평성 메시지와 비핵심 인력 이탈 리스크입니다.",
  },
};

function operatingImageFor(id: string): { reference: string; fit: string } {
  return OPERATING_IMAGES[id] ?? {
    reference: "성장 단계 스타트업의 혼합 운영 이미지",
    fit: "추가 검토",
  };
}

function scenarioIdFromSignal(signal: string, fallback = "community"): string {
  if (signal.includes("소수정예") || signal.includes("개인플레이어") || signal.includes("에이전시")) return "elite";
  if (signal.includes("단기 성과") || signal.includes("성과형") || signal.includes("시스템")) return "performance";
  if (signal.includes("장기 비전") || signal.includes("공동체") || signal.includes("가족형")) return "community";
  return fallback;
}

function targetScenarioId(matrix?: MatrixSnapshot): string {
  if (!matrix) return "community";
  return scenarioIdFromSignal(`${matrix.a_quadrant_to_be ?? ""} ${matrix.b_quadrant_to_be ?? ""}`);
}

function currentScenarioId(matrix?: MatrixSnapshot): string {
  if (!matrix) return "community";
  return scenarioIdFromSignal(`${matrix.a_quadrant_as_is ?? ""} ${matrix.b_quadrant_as_is ?? ""}`);
}

function roleFor(id: string, matrix?: MatrixSnapshot): { role: string; fitLabel: string } {
  const targetId = targetScenarioId(matrix);
  const currentId = currentScenarioId(matrix);
  if (id === targetId) return { role: "1순위 검토", fitLabel: "지향점과 가까움" };
  if (id === currentId) return { role: "현재 신호 점검", fitLabel: "현재 운영과 가까움" };
  return { role: "비교 기준", fitLabel: "대안 비교" };
}

export function scenarioMatrixConnection(id: string, matrix?: MatrixSnapshot): ScenarioMatrixConnection {
  const focus = SCENARIO_FOCUS[id] ?? {
    axis: "운영 기준 정렬",
    why: "현재 운영 위치와 지향점 사이에서 무엇을 먼저 바꿀지 비교하는 선택입니다.",
    change: "얻는 효과와 감당할 부담을 함께 비교해야 합니다.",
  };
  const role = roleFor(id, matrix);
  return {
    role: role.role,
    fitLabel: role.fitLabel,
    axis: focus.axis,
    why: focus.why,
    change: focus.change,
  };
}

export function ScenarioFitTable({ scenarios, selectedId, matrix, onSelect }: ScenarioFitTableProps) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white print:break-inside-avoid">
      <div className="border-b border-slate-100 p-4">
        <p className="m-0 text-[14px] font-[680] text-slate-900">시나리오별 트레이드오프 확인</p>
        <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
          세 후보는 같은 답이 아니라 서로 다른 운영 레버입니다. 지향점과 가까운 후보를 먼저 보되, 나머지는 무엇을 포기하거나 감당하는지 비교하는 기준으로 봅니다.
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
                  <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-[#4c7974]">집중 축</p>
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
                트레이드오프: <span className="font-[680] text-slate-700"><GlossaryText text={connection.change} /></span>
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