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

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  philosophy?: string;
  package?: ScenarioPackageItem[];
  impact?: ScenarioImpact[];
  financial_impact?: FinancialImpact[];
  warnings?: string[];
}

interface RoadmapPhase {
  label: string;
  period: string;
  goal: string;
  policy: string;
  communication: string;
  hedge: string;
  metric: string;
  evidence: string;
}

interface RoadmapTimelineProps {
  scenario: Scenario;
}

const PHASE_LABELS = [
  { label: "선행과제", period: "Month 0-1" },
  { label: "파일럿 도입", period: "Month 2-3" },
  { label: "세부 제도 도입", period: "Month 4-6" },
  { label: "제도 안정화", period: "Month 7-9" },
  { label: "성과 검증 또는 확산", period: "Month 10-12" },
];

function joinActions(items: ScenarioPackageItem[], fallback: string): string {
  if (items.length === 0) return fallback;
  return items.map((item) => `${item.area}: ${item.action}`).join(" / ");
}

function buildPhases(scenario: Scenario): RoadmapPhase[] {
  const packages = scenario.package ?? [];
  const impacts = scenario.impact ?? [];
  const financial = scenario.financial_impact ?? [];
  const warnings = scenario.warnings ?? [];
  const primaryMetric = impacts[0] ? `${impacts[0].metric} ${impacts[0].after}` : "핵심 인사 지표 변화";
  const secondaryMetric = impacts[1] ? `${impacts[1].metric} ${impacts[1].after}` : primaryMetric;
  const costSignal = financial[0] ? `${financial[0].item} ${financial[0].amount}` : "인건비 영향";
  const firstPolicies = packages.slice(0, 2);
  const laterPolicies = packages.slice(2, 5);

  return [
    {
      ...PHASE_LABELS[0],
      goal: `${scenario.name}로 전환하기 전에 데이터, 의사결정 권한, 리더 운영 기준을 먼저 맞춥니다.`,
      policy: "평가 기준, 보상 기준, 핵심 인재/리텐션 지표의 현재값을 한 장으로 정리합니다.",
      communication: "대표와 리더가 이번 전환의 이유, 바꾸지 않을 것, 12개월 순서를 먼저 합의합니다.",
      hedge: warnings[0] ?? "제도 변경 전에 구성원 수용성과 리더 실행 역량을 점검합니다.",
      metric: "현재 기준선: 이직률, 평가 수용성, 보상 시장 위치, 채용 소요 기간",
      evidence: "진단 응답과 보유 데이터를 대조해 벤치마크 대비 갭을 재확인합니다.",
    },
    {
      ...PHASE_LABELS[1],
      goal: "전사 도입 전에 한두 개 조직에서 운영 난이도와 메시지 반응을 검증합니다.",
      policy: joinActions(firstPolicies, "평가/보상 파일럿 기준과 리더 피드백 운영안을 설계합니다."),
      communication: "파일럿 대상 리더에게 운영 원칙과 예외 처리 기준을 설명하고, 구성원에게 실험 범위를 명확히 알립니다.",
      hedge: warnings[1] ?? "파일럿 결과를 보상에 즉시 강하게 연결하지 않고 수용성 데이터를 먼저 봅니다.",
      metric: primaryMetric,
      evidence: "파일럿 회고, 리더 피드백 로그, 구성원 문의 유형을 함께 기록합니다.",
    },
    {
      ...PHASE_LABELS[2],
      goal: "파일럿에서 확인된 기준을 바탕으로 평가, 보상, 채용, 리텐션 제도를 연결합니다.",
      policy: joinActions(laterPolicies, "평가-보상 연동 기준과 채용/리텐션 운영 기준을 세부 문서로 전환합니다."),
      communication: "리더에게 판단 기준을, 구성원에게 기대 행동과 보상 원리를 분리해서 설명합니다.",
      hedge: warnings[2] ?? "과도한 속도전으로 보이지 않도록 기존 보상과 신규 기준의 전환 기간을 둡니다.",
      metric: secondaryMetric,
      evidence: "제도별 적용률, 평가 피드백 완료율, 오퍼 수락률 또는 이탈 위험군 변화를 월별로 봅니다.",
    },
    {
      ...PHASE_LABELS[3],
      goal: "제도가 문서가 아니라 리더의 반복 운영으로 작동하는지 확인합니다.",
      policy: `${scenario.name} 운영 리듬을 월간 리더 회의, 분기 리뷰, 보상 의사결정 회의에 고정합니다.`,
      communication: "리더별 편차를 줄이기 위해 사례 기반 캘리브레이션과 구성원 FAQ를 갱신합니다.",
      hedge: warnings[3] ?? warnings[0] ?? "조직별 예외가 누적되지 않도록 승인 권한과 예외 기준을 분리합니다.",
      metric: costSignal,
      evidence: "인건비 영향, 평가 분포, 리더별 피드백 품질, 구성원 이의제기 패턴을 같이 봅니다.",
    },
    {
      ...PHASE_LABELS[4],
      goal: "12개월 실행 결과가 유지할 제도와 되돌릴 제도를 판단할 만큼 충분한지 검증합니다.",
      policy: "성과가 확인된 제도는 표준 운영안으로 확산하고, 부작용이 큰 제도는 다음 사이클에서 조정합니다.",
      communication: "대표 메시지로 전환 결과, 배운 점, 다음 6개월 조정 방향을 공유합니다.",
      hedge: "수치 개선만 보고 확산하지 않고 수용성, 리더 부담, 비용 증가를 함께 봅니다.",
      metric: impacts[2] ? `${impacts[2].metric} ${impacts[2].after}` : primaryMetric,
      evidence: "시작 전 기준선 대비 12개월 결과와 리더/구성원 인터뷰를 묶어 최종 의사결정 메모로 남깁니다.",
    },
  ];
}

export function RoadmapTimeline({ scenario }: RoadmapTimelineProps) {
  const phases = buildPhases(scenario);
  const primaryImpact = scenario.impact?.[0];
  const primaryFinancial = scenario.financial_impact?.[0];

  return (
    <section className="w-full max-w-[calc(100vw-48px)] overflow-hidden rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid sm:max-w-full">
      <div className="mb-2 grid grid-cols-1 gap-3 border-b border-slate-100 pb-4 lg:grid-cols-3">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">선택 시나리오</p>
          <p className="m-0 mt-1 text-[14px] font-[690] text-slate-900">{scenario.name}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">{scenario.subtitle}</p>
        </div>
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">확인할 변화</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-600">
            {primaryImpact ? `${primaryImpact.metric}: 현재 수준 대비 ${primaryImpact.after}` : "핵심 인사 지표의 기준선 대비 변화"}
          </p>
        </div>
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">비용 신호</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-600">
            {primaryFinancial ? `${primaryFinancial.item}: ${primaryFinancial.amount}` : "인건비와 운영 비용 변화를 함께 확인"}
          </p>
        </div>
      </div>

      <div className="grid gap-0">
        {phases.map((phase, index) => (
          <div
            key={phase.label}
            className="grid grid-cols-1 gap-4 border-b border-slate-100 py-5 last:border-b-0 lg:grid-cols-[132px_38px_minmax(0,1fr)]"
          >
            <div className="min-w-0">
              <strong className="text-[13px] font-[680] text-slate-900">{phase.label}</strong>
              <span className="mt-1 block text-[11px] text-slate-400">{phase.period}</span>
            </div>
            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-teal text-[13px] font-[800] text-white">
              {index + 1}
            </div>
            <div className="min-w-0">
              <h3
                className="m-0 text-[14px] font-[690] text-slate-900"
                style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
              >
                {phase.goal}
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
                <RoadmapField label="준비할 제도" value={phase.policy} />
                <RoadmapField label="리더/직원 커뮤니케이션" value={phase.communication} />
                <RoadmapField label="리스크 헷징" value={phase.hedge} />
                <RoadmapField label="검증 지표" value={phase.metric} />
                <RoadmapField label="기대효과 확인 방식" value={phase.evidence} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadmapField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-slate-100 pt-2">
      <p className="m-0 text-[11px] font-[680] text-slate-900">{label}</p>
      <p
        className="m-0 mt-1 text-[11px] leading-[1.6] text-slate-600"
        style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
      >
        {value}
      </p>
    </div>
  );
}
