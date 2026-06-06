"use client";

import { useState } from "react";
import { GlossaryText } from "@/components/shared/GlossaryText";

interface ScenarioPackageItem {
  area: string;
  action: string;
  timeline: string;
}

interface ScenarioImpact {
  metric: string;
  after: string;
}

interface FinancialImpact {
  item: string;
  amount: string;
  note?: string;
  rationale?: string;
}

interface ScenarioNextStep {
  step: string;
  action: string;
}

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  philosophy?: string;
  package?: ScenarioPackageItem[];
  impact?: ScenarioImpact[];
  financial_impact?: FinancialImpact[];
  warnings?: string[];
  next_steps?: ScenarioNextStep[];
}

interface RoadmapPhase {
  label: string;
  period: string;
  intent: string;
  goal: string;
  policy: string;
  communication: string;
  riskControl: string;
  metric: string;
  evidence: string;
  decision: string;
  deliverable: string;
}

interface RoadmapTimelineProps {
  scenario: Scenario;
}

const PHASE_LABELS = [
  { label: "선행과제", period: "0~1개월" },
  { label: "파일럿 도입", period: "2~3개월" },
  { label: "세부 제도 도입", period: "4~6개월" },
  { label: "제도 안정화", period: "7~9개월" },
  { label: "성과 검증 또는 확산", period: "10~12개월" },
];

const OPERATING_REFERENCES: Record<string, string> = {
  performance:
    "고성과 운영 이미지를 참고하되 그대로 따라 하는 것이 아니라, 평가 기준 공개, 리더 간 기준 맞춤, 피드백 기록, 보상 차등의 설명 책임을 함께 설계합니다. 성과 차이를 말할 수 있는 운영 장치가 준비된 범위에서만 보상 차등을 넓힙니다.",
  community:
    "심리적 안전과 협업 운영 이미지를 참고하되, 정기 1:1, 온보딩 체크인, 팀 단위 인센티브처럼 반복 가능한 운영 루틴으로 바꿉니다. 안정감을 높이는 동시에 고성과자 동기 저하 신호를 별도로 추적합니다.",
  elite:
    "소수정예 운영 이미지를 참고하되, 핵심 인재 정의, 권한 위임 기준, 별도 보상 밴드, 형평성 리스크 기록을 함께 둡니다. 집중 투자와 조직 신뢰가 동시에 관리될 때만 확장합니다.",
};

const EXECUTION_FOCUS: Record<string, string> = {
  performance: "성과 기준과 보상 메시지를 선명하게 만들되, 평가 신뢰가 따라오지 않으면 속도를 늦춥니다.",
  community: "이탈과 불안을 먼저 낮추고, 팀 단위 정기 운영이 자리 잡은 뒤 차등 보상을 검토합니다.",
  elite: "핵심 인재군을 좁게 정의하고, 집중 투자에 따르는 조직 내부 형평성 비용을 공개적으로 관리합니다.",
};

const FINAL_DECISION_QUESTIONS: Record<string, string> = {
  performance: "성과 차등으로 얻은 동기부여가 평가 갈등과 인건비 증가보다 컸습니까?",
  community: "조직 안정성 개선 효과가 고성과자 동기 저하보다 컸습니까?",
  elite: "핵심 인재 집중 효과가 내부 형평성 논란과 운영 부담보다 컸습니까?",
};

function joinActions(items: ScenarioPackageItem[], fallback: string): string {
  if (items.length === 0) return fallback;
  return items.map((item) => `${item.area}: ${item.action}`).join(" / ");
}

function impactText(scenario: Scenario, index: number, fallback: string): string {
  const impact = scenario.impact?.[index];
  if (!impact) return fallback;
  return `${impact.metric} ${impact.after}`;
}

function financialText(scenario: Scenario): string {
  const financial = scenario.financial_impact?.[0];
  if (!financial) return "인건비와 운영 비용 변화를 함께 확인";
  return `${financial.item} ${financial.amount}${financial.note ? `, ${financial.note}` : ""}`;
}

function operatingReference(scenario: Scenario): string {
  return OPERATING_REFERENCES[scenario.id] ?? "성장 단계 스타트업의 혼합 운영 이미지를 기준으로 단계적 실행 여부를 판단합니다.";
}

function executionFocus(scenario: Scenario): string {
  return EXECUTION_FOCUS[scenario.id] ?? "선택한 방향의 효과와 비용을 월별로 확인하며 실행 속도를 조정합니다.";
}

function finalDecisionQuestion(scenario: Scenario): string {
  return FINAL_DECISION_QUESTIONS[scenario.id] ?? "12개월 실행 결과가 다음 사이클에서도 유지할 만큼 충분했습니까?";
}

function buildPhases(scenario: Scenario): RoadmapPhase[] {
  const packages = scenario.package ?? [];
  const warnings = scenario.warnings ?? [];
  const nextSteps = scenario.next_steps ?? [];
  const firstPolicies = packages.slice(0, 2);
  const laterPolicies = packages.slice(2, 5);
  const primaryMetric = impactText(scenario, 0, "핵심 인사 지표의 시작 시점 대비 변화");
  const secondaryMetric = impactText(scenario, 1, primaryMetric);
  const tertiaryMetric = impactText(scenario, 2, primaryMetric);
  const costSignal = financialText(scenario);

  return [
    {
      ...PHASE_LABELS[0],
      intent: "현재 기준 확정",
      goal: `${scenario.name} 실행 전에 데이터, 의사결정 권한, 리더 운영 기준을 한 장으로 맞춥니다.`,
      policy: "평가 기준, 보상 기준, 핵심 인재/리텐션 지표, 채용 기준을 현재값 중심으로 정리합니다.",
      communication: "경영진과 리더가 이번 전환의 이유, 바꾸지 않을 것, 12개월 실행 순서를 먼저 합의합니다.",
      riskControl: warnings[0] ?? "제도 변경 전에 구성원 수용성과 리더 실행 역량을 점검합니다.",
      metric: "현재값: 이직률, 평가 수용성, 보상 시장 위치, 채용 소요 기간",
      evidence: "진단 응답과 보유 데이터를 대조해 현재 조건에서 필요한 기준과의 차이를 재확인합니다.",
      decision: "파일럿에 올릴 제도와 아직 보류할 제도를 구분합니다.",
      deliverable: nextSteps[0]?.action ?? "12개월 실행 원칙 메모와 현재값 대시보드 초안",
    },
    {
      ...PHASE_LABELS[1],
      intent: "작은 범위 검증",
      goal: "전사 도입 전에 한두 개 조직에서 운영 난이도와 메시지 반응을 검증합니다.",
      policy: joinActions(firstPolicies, "평가/보상 파일럿 기준과 리더 피드백 운영안을 설계합니다."),
      communication: "파일럿 대상 리더에게 운영 원칙과 예외 처리 기준을 설명하고, 구성원에게 실험 범위를 명확히 알립니다.",
      riskControl: warnings[1] ?? "파일럿 결과를 보상에 즉시 강하게 연결하지 않고 수용성 데이터를 먼저 봅니다.",
      metric: primaryMetric,
      evidence: "파일럿 회고, 리더 피드백 로그, 구성원 문의 유형을 함께 기록합니다.",
      decision: "전사 확대 전, 메시지 오해와 리더별 편차가 감당 가능한 수준인지 판단합니다.",
      deliverable: nextSteps[1]?.action ?? "파일럿 운영안, 리더 브리핑 자료, 구성원 FAQ",
    },
    {
      ...PHASE_LABELS[2],
      intent: "세부 제도 도입",
      goal: "파일럿에서 확인된 기준을 바탕으로 평가, 보상, 채용, 리텐션 제도를 연결합니다.",
      policy: joinActions(laterPolicies, "평가-보상 연동 기준과 채용/리텐션 운영 기준을 세부 문서로 전환합니다."),
      communication: "리더에게 판단 기준을, 구성원에게 기대 행동과 보상 원리를 분리해서 설명합니다.",
      riskControl: warnings[2] ?? "과도한 속도전으로 보이지 않도록 기존 보상과 신규 기준의 전환 기간을 둡니다.",
      metric: secondaryMetric,
      evidence: "제도별 적용률, 평가 피드백 완료율, 오퍼 수락률 또는 이탈 위험군 변화를 월별로 봅니다.",
      decision: "제도별 전사 확대 여부와 예외 승인 기준을 확정합니다.",
      deliverable: nextSteps[2]?.action ?? "평가·보상·채용·리텐션 운영안 v1",
    },
    {
      ...PHASE_LABELS[3],
      intent: "정기 운영화",
      goal: "제도가 문서가 아니라 리더의 반복 운영으로 작동하는지 확인합니다.",
      policy: `${scenario.name} 실행 방식을 월간 리더 회의, 분기 리뷰, 보상 의사결정 회의에 넣어 정기적으로 운영합니다.`,
      communication: "리더별 편차를 줄이기 위해 사례 기반 캘리브레이션과 구성원 FAQ를 갱신합니다.",
      riskControl: warnings[3] ?? warnings[0] ?? "조직별 예외가 누적되지 않도록 승인 권한과 예외 기준을 분리합니다.",
      metric: costSignal,
      evidence: "인건비 영향, 평가 분포, 리더별 피드백 품질, 구성원 이의제기 패턴을 같이 봅니다.",
      decision: "비용 신호가 허용 범위인지, 운영 부담이 특정 리더에게 몰리는지 판단합니다.",
      deliverable: "월간 운영표, 예외 승인 기준, 캘리브레이션 기록",
    },
    {
      ...PHASE_LABELS[4],
      intent: "유지 또는 조정 판단",
      goal: "12개월 실행 결과를 보고 유지할 제도와 조정할 제도를 나눕니다.",
      policy: "성과가 확인된 제도는 표준 운영안으로 확산하고, 부작용이 큰 제도는 다음 사이클에서 조정합니다.",
      communication: "경영진 메시지로 전환 결과, 배운 점, 다음 6개월 조정 방향을 공유합니다.",
      riskControl: "수치 개선만 보고 확산하지 않고 수용성, 리더 부담, 비용 증가를 함께 봅니다.",
      metric: tertiaryMetric,
      evidence: "시작 전 현재값 대비 12개월 결과와 리더/구성원 인터뷰를 묶어 최종 의사결정 메모로 남깁니다.",
      decision: finalDecisionQuestion(scenario),
      deliverable: nextSteps[3]?.action ?? "12개월 실행 회고와 다음 6개월 실행 메모",
    },
  ];
}

export function RoadmapTimeline({ scenario }: RoadmapTimelineProps) {
  const phases = buildPhases(scenario);
  const primaryImpact = impactText(scenario, 0, "핵심 인사 지표의 시작 시점 대비 변화");
  const primaryFinancial = financialText(scenario);
  const [openPhases, setOpenPhases] = useState<Set<string>>(() => new Set([PHASE_LABELS[0].label]));

  const togglePhase = (label: string) => {
    setOpenPhases((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <section className="w-full max-w-[calc(100vw-48px)] overflow-visible rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid sm:max-w-full">
      <div className="grid grid-cols-1 gap-4 border-b border-slate-100 pb-5 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr]">
        <RoadmapSummary label="선택 시나리오" title={scenario.name} body={scenario.subtitle} />
        <RoadmapSummary label="12개월 실행 초점" title="전환 원칙" body={executionFocus(scenario)} />
        <RoadmapSummary label="확인할 변화" title={primaryImpact} body={`비용 신호: ${primaryFinancial}`} accent="teal" />
        <RoadmapSummary label="최종 판단 질문" title="12개월 후 결정 질문" body={finalDecisionQuestion(scenario)} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 lg:grid-cols-2">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">참고 운영 이미지</p>
          <p className="m-0 mt-2 text-[13px] leading-[1.65] text-slate-700">
            <GlossaryText text={operatingReference(scenario)} />
          </p>
        </div>
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">실행 원칙</p>
          <p className="m-0 mt-2 text-[13px] leading-[1.65] text-slate-700">
            제도는 한 번에 확정하지 않고, 각 단계 끝에서 확대·보류·수정 여부를 판단합니다. 로드맵의 목적은 하나의 안을 그대로 실행하는 것이 아니라, 회사가 부담할 비용과 기대효과를 같은 표에서 보게 하는 것입니다.
          </p>
        </div>
      </div>

      <div className="grid gap-0">
        {phases.map((phase, index) => {
          const isOpen = openPhases.has(phase.label);

          return (
            <div key={phase.label} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() => togglePhase(phase.label)}
                className="grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 py-4 text-left"
              >
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-teal text-[12px] font-[800] text-white">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-[700] text-slate-900">{phase.label} · {phase.period}</span>
                  <span className="mt-1 block text-[12px] leading-[1.5] text-slate-500">{phase.goal}</span>
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-[760] text-slate-500">
                  {isOpen ? "접기" : "펼치기"}
                </span>
              </button>
              <div className={`${isOpen ? "" : "hidden print:block"} pb-5 pl-0 lg:pl-[46px]`}>
                  <div className="mb-3 inline-flex rounded-full border border-teal-line bg-teal-soft px-2.5 py-1 text-[10px] font-[760] text-teal-deep">
                    {phase.intent}
                  </div>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
                    <RoadmapField label="중점 목표" value={phase.intent} />
                    <RoadmapField label="준비할 제도" value={phase.policy} />
                    <RoadmapField label="리더/직원 커뮤니케이션" value={phase.communication} />
                    <RoadmapField label="리스크 줄이기" value={phase.riskControl} />
                    <RoadmapField label="검증 지표" value={phase.metric} />
                    <RoadmapField label="기대효과 확인 방식" value={phase.evidence} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 bg-slate-50 px-3 py-3 md:grid-cols-[1fr_1fr]">
                    <RoadmapDecision label="단계 말 의사결정" value={phase.decision} />
                    <RoadmapDecision label="남길 산출물" value={phase.deliverable} />
                  </div>
                </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RoadmapSummary({
  label,
  title,
  body,
  accent = "slate",
}: {
  label: string;
  title: string;
  body: string;
  accent?: "slate" | "teal" | "amber";
}) {
  const labelClass = accent === "amber" ? "text-amber" : accent === "teal" ? "text-teal" : "text-slate-400";

  return (
    <div className="min-w-0 border-l border-slate-100 pl-3 first:border-l-0 first:pl-0">
      <p className={`m-0 text-[11px] font-[760] tracking-[0.08em] ${labelClass}`}>{label}</p>
      <p className="m-0 mt-2 text-[13px] font-[700] leading-[1.45] text-slate-900">{title}</p>
      <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
        <GlossaryText text={body} />
      </p>
    </div>
  );
}

function RoadmapField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-slate-100 pt-2">
      <p className="m-0 text-[11px] font-[700] text-slate-900">{label}</p>
      <p className="m-0 mt-1 text-[11px] leading-[1.65] text-slate-600">
        <GlossaryText text={value} />
      </p>
    </div>
  );
}

function RoadmapDecision({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-[11px] font-[760] tracking-[0.04em] text-teal">{label}</p>
      <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-700">
        <GlossaryText text={value} />
      </p>
    </div>
  );
}
