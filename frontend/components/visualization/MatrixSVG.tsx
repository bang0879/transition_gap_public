"use client";

interface MatrixSVGProps {
  title: string;
  markerId: string;
  subtitle: string;
  quadrantLabels: [string, string, string, string];
  quadrantExamples?: [string, string, string, string];
  xAxisLabel: string;
  yAxisLabel: string;
  asIs: { x: number; y: number };
  toBe: { x: number; y: number };
  badgeText: string;
  toBeBadgeText?: string | null;
  confidenceText?: string;
}

const X0 = 20;
const X1 = 480;
const Y0 = 20;
const Y1 = 320;
const CX = 250;
const CY = 170;

const QUADRANT_REFERENCES: Record<string, string> = {
  "단기 성과 집중형": "Netflix식 고성과·고책임 보상 조직",
  "장기 비전형 공동체": "Google식 공동체 기반 협업 조직",
  "평균 기준형": "차등도 안정감도 약한 평균형 운영",
  "소수정예 중심형": "초기 토스식 소수정예 실행 조직",
  "가족형 자율 조직": "Google식 자율과 신뢰 기반 운영",
  "대기업 공채 시스템형": "삼성식 공채·직무순환 시스템형 운영",
  "개인플레이어 중심형": "개인 성과 중심의 독립 실행 조직",
  "에이전시형 분업 조직": "역할별 납품 책임이 강한 에이전시형 조직",
};

const QUADRANT_INTERPRETATIONS: Record<
  string,
  { reference: string; aspiration: string; currentSignal: string; transitionWork: string }
> = {
  "단기 성과 집중형": {
    reference: "Netflix식 고성과·고책임 보상 조직",
    aspiration: "성과 기준을 명확히 세우고 책임을 진 사람에게 보상과 권한을 더 크게 주는 방향",
    currentSignal: "성과와 책임을 강하게 요구하지만, 기준이 흐리면 평가 불신도 함께 커지는",
    transitionWork: "평가 기준 공개, 리더 간 기준 맞춤, 차등 보상 설명력을 갖추는 일",
  },
  "장기 비전형 공동체": {
    reference: "Google식 공동체 기반 협업 조직",
    aspiration: "장기 몰입과 팀 시너지를 중심으로 구성원을 붙잡는 방향",
    currentSignal: "협업과 안정감을 중시하지만, 개인별 보상 신호는 약하게 읽히는",
    transitionWork: "리텐션 루틴, 팀 단위 인정, 성장 경로를 반복 운영으로 만드는 일",
  },
  "평균 기준형": {
    reference: "차등도 안정감도 약한 평균형 운영",
    aspiration: "큰 차등 없이 무난한 기준으로 조직을 유지하는 방향",
    currentSignal: "무엇을 잘해야 더 인정받는지, 어디까지 안정적인지 모두 흐릿한",
    transitionWork: "평균적 운영에서 벗어나 보상, 평가, 리텐션 중 무엇을 우선할지 정하는 일",
  },
  "소수정예 중심형": {
    reference: "초기 토스식 소수정예 실행 조직",
    aspiration: "핵심 인재 밀도와 빠른 실행을 위해 권한과 보상을 좁게 집중하는 방향",
    currentSignal: "선택된 핵심 인재에게 기대와 자원이 집중되는",
    transitionWork: "핵심 인재 기준, 예외 보상, 비핵심 인력 커뮤니케이션을 함께 정리하는 일",
  },
  "가족형 자율 조직": {
    reference: "Google식 자율과 신뢰 기반 운영",
    aspiration: "강한 통제보다 신뢰와 자율을 바탕으로 오래 일할 수 있는 문화를 만드는 방향",
    currentSignal: "규칙보다 관계와 신뢰를 우선하는",
    transitionWork: "자율의 범위, 리더 책임, 컬처핏 기준을 반복 가능한 운영 언어로 바꾸는 일",
  },
  "대기업 공채 시스템형": {
    reference: "삼성식 공채·직무순환 시스템형 운영",
    aspiration: "절차와 기준을 표준화해 예측 가능한 인력 운영을 만드는 방향",
    currentSignal: "속도보다 절차와 공정성 메시지가 강하게 읽히는",
    transitionWork: "직무 기준, 전결 규칙, 평가 절차를 과도한 관료화 없이 세팅하는 일",
  },
  "개인플레이어 중심형": {
    reference: "개인 성과 중심의 독립 실행 조직",
    aspiration: "각자의 전문성과 개인 성과를 중심으로 독립 실행을 강화하는 방향",
    currentSignal: "팀 시너지보다 개인 산출과 독립 책임이 먼저 보이는",
    transitionWork: "개인 목표, 협업 경계, 성과 인정 기준을 충돌 없이 맞추는 일",
  },
  "에이전시형 분업 조직": {
    reference: "역할별 납품 책임이 강한 에이전시형 조직",
    aspiration: "역할과 납기 책임을 분명히 나눠 실행 예측 가능성을 높이는 방향",
    currentSignal: "자율적 탐색보다 역할별 납품 책임이 강하게 읽히는",
    transitionWork: "역할 정의, 의사결정 위임, 납품 기준을 병목 없이 정교화하는 일",
  },
};

function sx(x: number): number {
  return X0 + Math.max(0, Math.min(1, x)) * (X1 - X0);
}

function sy(y: number): number {
  return Y1 - Math.max(0, Math.min(1, y)) * (Y1 - Y0);
}

function stripQuadrantCode(label: string): string {
  return label.replace(/^Q\d:\s*/i, "").trim();
}

function canonicalQuadrantLabel(label: string): string {
  const stripped = stripQuadrantCode(label).replace(/\s+/g, " ").trim();
  if (stripped.includes("단기 성과")) return "단기 성과 집중형";
  if (stripped.includes("장기 비전")) return "장기 비전형 공동체";
  if (stripped.includes("평균") || stripped.includes("평준")) return "평균 기준형";
  if (stripped.includes("소수정예")) return "소수정예 중심형";
  if (stripped.includes("가족형")) return "가족형 자율 조직";
  if (stripped.includes("대기업")) return "대기업 공채 시스템형";
  if (stripped.includes("개인") && stripped.includes("플레이어")) return "개인플레이어 중심형";
  if (stripped.includes("에이전시")) return "에이전시형 분업 조직";
  return stripped;
}

function xAxisEnds(label: string): { left: string; right: string } {
  const normalized = label.replace(/\s+/g, " ").trim();
  if (normalized.includes("← →")) {
    const [left, right] = normalized.split("← →").map((part) => part.trim());
    return { left, right };
  }
  return { left: "낮음", right: normalized };
}

function yAxisEnds(label: string): { top: string; bottom: string } {
  const normalized = label.replace(/\s+/g, " ").trim();
  if (normalized.includes("↑") && normalized.includes("↓")) {
    const [top, rest] = normalized.split("↑");
    return { top: top.trim(), bottom: rest.replace("↓", "").trim() };
  }
  return { top: normalized, bottom: "낮음" };
}

function movementNarrative(asIsText: string, targetText: string, gap: number): string {
  const asIs = QUADRANT_INTERPRETATIONS[asIsText] ?? {
    reference: QUADRANT_REFERENCES[asIsText] ?? asIsText,
    aspiration: `${asIsText} 방향`,
    currentSignal: `${asIsText}에 가까운`,
    transitionWork: "운영 기준을 실제 제도로 바꾸는 일",
  };
  const target = QUADRANT_INTERPRETATIONS[targetText] ?? {
    reference: QUADRANT_REFERENCES[targetText] ?? targetText,
    aspiration: `${targetText} 방향`,
    currentSignal: `${targetText}에 가까운`,
    transitionWork: "운영 기준을 실제 제도로 바꾸는 일",
  };

  if (asIsText === targetText) {
    if (gap >= 0.18) {
      return `현재 입력값과 지향점은 모두 ${target.reference} 범위에 있지만, 실제 좌표 간 거리는 작지 않습니다. 이름은 같아도 대표는 ${target.aspiration}을 더 강하게 원하고, 현재 운영은 아직 그 신호를 충분히 밀어주지 못합니다. 잘하고 있다는 판정이 아니라 같은 방향 안에서 기준을 더 날카롭게 벼려야 하는 상태입니다.`;
    }
    return `현재 입력값과 지향점은 모두 ${target.reference} 범위에 있습니다. 큰 방향 전환보다 ${target.transitionWork}을 더 촘촘하게 맞추는 것이 핵심입니다.`;
  }

  return `지향점은 ${target.reference}에 가까운 방향입니다. 대표는 ${target.aspiration}을 추구한다고 응답했습니다. 하지만 현재 제도는 ${asIs.reference}에 더 가까워, 구성원에게는 ${asIs.currentSignal} 신호가 먼저 전달됩니다. 이 간극 때문에 구성원은 대표가 말하는 인재상과 실제로 인정받는 행동을 다르게 해석할 수 있고, 선의 길이는 ${target.transitionWork}에서 생기는 제도 전환 부담입니다.`;
}

type LabelLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  align?: "left" | "right";
  vertical?: "top" | "bottom";
};

const DEFAULT_LABEL_LAYOUTS: [LabelLayout, LabelLayout, LabelLayout, LabelLayout] = [
  { x: 30, y: 34, width: 190, height: 74 },
  { x: 282, y: 34, width: 190, height: 74, align: "right" },
  { x: 30, y: 216, width: 190, height: 74, vertical: "bottom" },
  { x: 282, y: 216, width: 190, height: 74, align: "right", vertical: "bottom" },
];

function pointTouchesLayout(layout: LabelLayout, point: { x: number; y: number }): boolean {
  const pad = 18;
  return (
    point.x >= layout.x - pad &&
    point.x <= layout.x + layout.width + pad &&
    point.y >= layout.y - pad &&
    point.y <= layout.y + layout.height + pad
  );
}

function quadrantLabelLayout(index: number, points: Array<{ x: number; y: number }>): LabelLayout {
  const layout = DEFAULT_LABEL_LAYOUTS[index];
  if (!points.some((point) => pointTouchesLayout(layout, point))) return layout;
  if (index < 2) return { ...layout, y: 112, height: 62 };
  return { ...layout, y: 144, height: 70 };
}

function QuadrantLabel({
  x,
  y,
  width = 190,
  height = 74,
  align = "left",
  vertical = "top",
  label,
  example,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  align?: "left" | "right";
  vertical?: "top" | "bottom";
  label: string;
  example?: string;
}) {
  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        className={`pointer-events-none flex h-full flex-col bg-transparent px-0 py-0 leading-[1.25] ${
          align === "right" ? "items-end text-right" : "items-start text-left"
        } ${vertical === "bottom" ? "justify-end" : "justify-start"}`}
      >
        <span className="max-w-[176px] text-[10.5px] font-[760] text-slate-600">{canonicalQuadrantLabel(label)}</span>
        {example ? <span className="mt-1 max-w-[176px] text-[9.5px] font-[560] leading-[1.35] text-slate-400">{example}</span> : null}
      </div>
    </foreignObject>
  );
}

export function MatrixSVG({
  title,
  markerId,
  subtitle,
  quadrantLabels,
  quadrantExamples,
  xAxisLabel,
  yAxisLabel,
  asIs,
  toBe,
  badgeText,
  toBeBadgeText,
  confidenceText,
}: MatrixSVGProps) {
  const ax = sx(asIs.x);
  const ay = sy(asIs.y);
  const tx = sx(toBe.x);
  const ty = sy(toBe.y);
  const dx = tx - ax;
  const dy = ty - ay;
  const length = Math.max(1, Math.hypot(dx, dy));
  const offset = 18;
  const arrowStart = { x: ax + (dx / length) * offset, y: ay + (dy / length) * offset };
  const arrowEnd = { x: tx - (dx / length) * offset, y: ty - (dy / length) * offset };
  const asIsText = canonicalQuadrantLabel(badgeText);
  const targetText = canonicalQuadrantLabel(toBeBadgeText ?? "선택 방향");
  const rawGap = Math.hypot(toBe.x - asIs.x, toBe.y - asIs.y);
  const movementText = movementNarrative(asIsText, targetText, rawGap);
  const xEnds = xAxisEnds(xAxisLabel);
  const yEnds = yAxisEnds(yAxisLabel);
  const labelPoints = [
    { x: ax, y: ay },
    { x: tx, y: ty },
  ];
  const labelLayouts: [LabelLayout, LabelLayout, LabelLayout, LabelLayout] = [
    quadrantLabelLayout(0, labelPoints),
    quadrantLabelLayout(1, labelPoints),
    quadrantLabelLayout(2, labelPoints),
    quadrantLabelLayout(3, labelPoints),
  ];

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-[14px] font-[720] text-slate-950">{title}</h3>
          <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="max-w-[180px] truncate rounded-full border border-slate-200 bg-slate-50 px-[9px] py-[3px] text-[11px] font-[680] text-slate-500">
            As-Is · {asIsText}
          </span>
          <span className="max-w-[180px] truncate rounded-full border border-[#cfe7e2] bg-white px-[9px] py-[3px] text-[11px] font-[680] text-[#4c7974]">
            To-Be · {targetText}
          </span>
        </div>
      </div>
      <div className="mb-2 rounded-[8px] border border-[#d9ebe7] bg-[#fbfefd] px-3 py-2 text-[11px] font-[620] leading-[1.6] text-slate-700">
        {movementText}
      </div>
      <svg viewBox="0 0 500 384" className="h-auto w-full rounded-[8px] border border-slate-200 bg-white" role="img" aria-label={title}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f8f86" />
          </marker>
        </defs>
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="8" fill="#fff" stroke="#d8e0ea" />
        <line x1="135" y1={Y0} x2="135" y2={Y1} stroke="#f1f5f9" />
        <line x1="365" y1={Y0} x2="365" y2={Y1} stroke="#f1f5f9" />
        <line x1={X0} y1="95" x2={X1} y2="95" stroke="#f1f5f9" />
        <line x1={X0} y1="245" x2={X1} y2="245" stroke="#f1f5f9" />
        <line x1={CX} y1={Y0} x2={CX} y2={Y1} stroke="#d8e0ea" />
        <line x1={X0} y1={CY} x2={X1} y2={CY} stroke="#d8e0ea" />
        <line x1={X0 + 10} y1={CY} x2={X1 - 10} y2={CY} stroke="#94a3b8" strokeWidth=".9" opacity=".55" />
        <text x={CX} y={Y0 + 14} textAnchor="middle" className="fill-slate-500 text-[10px] font-[700]">
          ↑ {yEnds.top}
        </text>
        <text x={CX} y={Y1 - 8} textAnchor="middle" className="fill-slate-500 text-[10px] font-[700]">
          ↓ {yEnds.bottom}
        </text>
        <text x={X0 + 12} y={CY - 8} className="fill-slate-500 text-[10px] font-[700]">
          ← {xEnds.left}
        </text>
        <text x={X1 - 12} y={CY - 8} textAnchor="end" className="fill-slate-500 text-[10px] font-[700]">
          {xEnds.right} →
        </text>
        <QuadrantLabel {...labelLayouts[0]} label={quadrantLabels[0]} example={quadrantExamples?.[0]} />
        <QuadrantLabel {...labelLayouts[1]} label={quadrantLabels[1]} example={quadrantExamples?.[1]} />
        <QuadrantLabel {...labelLayouts[2]} label={quadrantLabels[2]} example={quadrantExamples?.[2]} />
        <QuadrantLabel {...labelLayouts[3]} label={quadrantLabels[3]} example={quadrantExamples?.[3]} />
        <line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="#2f8f86" strokeWidth="2" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
        <circle cx={ax} cy={ay} r="15.5" fill="none" stroke="#334155" strokeWidth=".8" opacity=".14" />
        <circle cx={ax} cy={ay} r="10.5" fill="#fff" stroke="#334155" strokeWidth="1.6" />
        <circle cx={ax} cy={ay} r="3" fill="#334155" />
        <rect x={tx - 9} y={ty - 9} width="18" height="18" rx="4" transform={`rotate(45 ${tx} ${ty})`} fill="#fff" stroke="#2f8f86" strokeWidth="1.8" />
        <circle cx={tx} cy={ty} r="2.7" fill="#2f8f86" />
        <foreignObject x={28} y={328} width="444" height="46">
          <div className="flex h-full flex-col justify-center gap-1 rounded-[7px] border border-slate-200 bg-slate-50 px-2.5 text-[9.5px] leading-[1.35] text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1 font-[720] text-slate-700">
                <span className="h-2 w-2 rounded-full border border-slate-700 bg-white" />
                As-Is 현재 위치
              </span>
              <span className="inline-flex items-center gap-1 font-[720] text-[#4c7974]">
                <span className="h-2 w-2 rotate-45 rounded-[2px] border border-teal bg-white" />
                To-Be 지향점
              </span>
              <span className="text-slate-500">선의 길이 = 전환 부담</span>
            </div>
            <div className="truncate text-slate-500">To-Be는 철학 응답 기준 좌표 그대로 표시합니다.</div>
          </div>
        </foreignObject>
      </svg>
      <p className="m-0 mt-2 text-[10.5px] leading-[1.5] text-slate-500">{confidenceText ?? "선의 길이는 전환 부담을 의미합니다."}</p>
      <span className="sr-only">To-Be 좌표는 x {tx.toFixed(3)}, y {ty.toFixed(3)}입니다.</span>
    </div>
  );
}