"use client";

import { MATRIX_LAYOUT, MATRIX_QUADRANT_LABEL_BOXES, matrixMarkerDisplayPosition } from "@/lib/utils/matrixLayout";

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
}

type QuadrantInterpretation = {
  ambition: string;
  currentSignal: string;
  possibleMisread: string;
  sameAreaWork: string;
};

const QUADRANT_INTERPRETATIONS: Record<string, QuadrantInterpretation> = {
  "단기 성과 집중형": {
    ambition: "성과 기준과 책임 보상을 더 분명히 연결하는 방향",
    currentSignal: "성과와 책임을 요구하지만, 기준 설명이 약하면 평가 불신도 함께 커지는 신호",
    possibleMisread: "구성원은 '성과를 내면 인정받는다'보다 '평가 기준이 회사 안에서만 움직인다'고 받아들일 수 있습니다.",
    sameAreaWork: "성과 기준 공개, 리더 간 기준 맞춤, 보상 차등 설명력을 더 촘촘하게 맞추는 일",
  },
  "장기 비전형 공동체": {
    ambition: "장기 몰입과 팀 시너지를 중심으로 구성원을 붙잡는 방향",
    currentSignal: "협업과 안정감을 중시하지만, 개인별 차등 보상 신호는 약하게 읽히는 신호",
    possibleMisread: "구성원은 안정감은 느끼지만, 뛰어난 성과가 얼마나 다르게 인정되는지 모호하다고 느낄 수 있습니다.",
    sameAreaWork: "리텐션 루틴, 팀 단위 인정, 성장 경로를 반복 운영으로 만드는 일",
  },
  "평균 기준형": {
    ambition: "큰 차등 없이 무난한 기준으로 조직을 유지하는 방향",
    currentSignal: "무엇을 잘해야 더 인정받는지, 어디까지 안정적인지 모두 흐릿한 신호",
    possibleMisread: "구성원은 회사가 성과를 원하는지 안정감을 원하는지 판단하기 어렵고, 좋은 사람일수록 메시지를 더 빨리 의심할 수 있습니다.",
    sameAreaWork: "평균적 운영에서 벗어나 보상, 평가, 리텐션 중 무엇을 우선할지 정하는 일",
  },
  "소수정예 중심형": {
    ambition: "핵심 인재 밀도와 빠른 실행을 위해 권한과 보상을 좁게 집중하는 방향",
    currentSignal: "선택된 핵심 인재에게 기대와 자원이 집중되는 신호",
    possibleMisread: "구성원은 회사가 말하는 성과 기준보다 '선택된 일부에게 기회가 몰린다'는 메시지를 먼저 받을 수 있습니다.",
    sameAreaWork: "핵심 인재 기준, 예외 보상, 비핵심 인력 커뮤니케이션을 함께 정리하는 일",
  },
  "가족형 자율 조직": {
    ambition: "강한 통제보다 신뢰와 자율을 바탕으로 오래 일할 수 있는 문화를 만드는 방향",
    currentSignal: "규칙보다 관계와 신뢰를 우선하는 신호",
    possibleMisread: "구성원은 자율을 긍정적으로 느끼지만, 책임 경계가 약하면 의사결정 기준이 사람마다 다르다고 느낄 수 있습니다.",
    sameAreaWork: "자율의 범위, 리더 책임, 컬처핏 기준을 반복 가능한 운영 언어로 바꾸는 일",
  },
  "대기업 공채 시스템형": {
    ambition: "절차와 기준을 표준화해 예측 가능한 인력 운영을 만드는 방향",
    currentSignal: "속도보다 절차와 공정성 메시지가 강하게 읽히는 신호",
    possibleMisread: "구성원은 공정성은 기대하지만, 스타트업에 필요한 속도와 예외 판단이 막힌다고 느낄 수 있습니다.",
    sameAreaWork: "직무 기준, 전결 규칙, 평가 절차를 과도한 관료화 없이 세팅하는 일",
  },
  "개인플레이어 중심형": {
    ambition: "각자의 전문성과 개인 성과를 중심으로 독립 실행을 강화하는 방향",
    currentSignal: "팀 시너지보다 개인 산출과 독립 책임이 먼저 보이는 신호",
    possibleMisread: "구성원은 개인 책임은 분명히 느끼지만, 협업이 왜 필요한지와 어디까지 함께 책임지는지 헷갈릴 수 있습니다.",
    sameAreaWork: "개인 목표, 협업 경계, 성과 인정 기준을 충돌 없이 맞추는 일",
  },
  "에이전시형 분업 조직": {
    ambition: "역할과 납기 책임을 분명히 나눠 실행 예측 가능성을 높이는 방향",
    currentSignal: "자율적 탐색보다 역할별 납품 책임이 강하게 읽히는 신호",
    possibleMisread: "구성원은 맡은 일은 분명히 알지만, 회사가 원하는 주도성이나 성장 방향은 좁게 해석할 수 있습니다.",
    sameAreaWork: "역할 정의, 의사결정 위임, 납품 기준을 병목 없이 정교화하는 일",
  },
};

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

type MovementNarrative = {
  direction: string;
  gap: string;
  risk: string;
};

function fallbackInterpretation(label: string): QuadrantInterpretation {
  return {
    ambition: `${label} 방향`,
    currentSignal: `${label}에 가까운 신호`,
    possibleMisread: "구성원은 회사가 말하는 방향과 실제 제도가 주는 신호를 다르게 해석할 수 있습니다.",
    sameAreaWork: "운영 기준을 실제 제도로 바꾸는 일",
  };
}

function movementNarrative(asIsText: string, targetText: string, gap: number): MovementNarrative {
  const asIs = QUADRANT_INTERPRETATIONS[asIsText] ?? fallbackInterpretation(asIsText);
  const target = QUADRANT_INTERPRETATIONS[targetText] ?? fallbackInterpretation(targetText);

  if (asIsText === targetText) {
    if (gap >= 0.18) {
      return {
        direction: `회사는 ${target.ambition}을 더 강하게 선택하고 있습니다.`,
        gap: `현재 제도도 같은 범위에 있지만, 실제 좌표 간 거리는 작지 않습니다. 같은 이름 안에서도 운영 기준의 강도가 다릅니다.`,
        risk: `잘하고 있다는 판정이 아니라 ${target.sameAreaWork}을 더 날카롭게 맞춰야 하는 상태입니다.`,
      };
    }
    return {
      direction: `회사는 ${target.ambition}을 선택하고 있습니다.`,
      gap: "현재 제도와 철학 방향이 같은 범위에 있어 큰 방향 전환보다 세부 기준 정렬이 중요합니다.",
      risk: `${target.sameAreaWork}이 다음 실행 과제입니다.`,
    };
  }

  return {
    direction: `회사는 ${target.ambition}을 추구합니다.`,
    gap: `현재 제도는 ${asIs.currentSignal}로 읽힙니다.`,
    risk: asIs.possibleMisread,
  };
}

function QuadrantLabel({
  x,
  y,
  align = "left",
  vertical = "top",
  label,
  example,
  width = 180,
  height = 58,
}: {
  x: number;
  y: number;
  align?: "left" | "right";
  vertical?: "top" | "bottom";
  label: string;
  example?: string;
  width?: number;
  height?: number;
}) {
  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        className={`pointer-events-none flex h-full flex-col bg-transparent px-0 py-0 leading-[1.25] ${
          align === "right" ? "items-end text-right" : "items-start text-left"
        } ${vertical === "bottom" ? "justify-end" : "justify-start"}`}
      >
        <span className="block max-w-[170px] truncate text-[10.5px] font-[760] text-slate-600">{canonicalQuadrantLabel(label)}</span>
        {example ? <span className="mt-1 block max-w-[170px] truncate text-[9.5px] font-[560] leading-[1.35] text-slate-400">{example}</span> : null}
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
}: MatrixSVGProps) {
  const displayAsIs = matrixMarkerDisplayPosition(asIs);
  const displayTarget = matrixMarkerDisplayPosition(toBe);
  const ax = displayAsIs.x;
  const ay = displayAsIs.y;
  const dx = displayTarget.x - ax;
  const dy = displayTarget.y - ay;
  const length = Math.max(1, Math.hypot(dx, dy));
  const offset = 18;
  const arrowStart = { x: ax + (dx / length) * offset, y: ay + (dy / length) * offset };
  const arrowEnd = { x: displayTarget.x - (dx / length) * offset, y: displayTarget.y - (dy / length) * offset };
  const asIsText = canonicalQuadrantLabel(badgeText);
  const targetText = canonicalQuadrantLabel(toBeBadgeText ?? "선택 방향");
  const rawGap = Math.hypot(toBe.x - asIs.x, toBe.y - asIs.y);
  const movementText = movementNarrative(asIsText, targetText, rawGap);
  const xEnds = xAxisEnds(xAxisLabel);
  const yEnds = yAxisEnds(yAxisLabel);
  const verticalGuideLeft = MATRIX_LAYOUT.plotLeft + MATRIX_LAYOUT.plotWidth * 0.25;
  const verticalGuideRight = MATRIX_LAYOUT.plotLeft + MATRIX_LAYOUT.plotWidth * 0.75;
  const horizontalGuideTop = MATRIX_LAYOUT.plotTop + MATRIX_LAYOUT.plotHeight * 0.25;
  const horizontalGuideBottom = MATRIX_LAYOUT.plotTop + MATRIX_LAYOUT.plotHeight * 0.75;

  const narrativeItems: Array<{ label: string; body: string }> = [
    { label: "철학 방향", body: movementText.direction },
    { label: "제도 신호", body: movementText.gap },
    { label: "발생할 수 있는 일", body: movementText.risk },
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
      <svg
        viewBox={`0 0 ${MATRIX_LAYOUT.viewBoxWidth} ${MATRIX_LAYOUT.viewBoxHeight}`}
        className="h-auto w-full rounded-[8px] border border-slate-200 bg-white"
        role="img"
        aria-label={title}
      >
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f8f86" />
          </marker>
        </defs>
        <rect x={MATRIX_LAYOUT.plotLeft} y={MATRIX_LAYOUT.plotTop} width={MATRIX_LAYOUT.plotWidth} height={MATRIX_LAYOUT.plotHeight} rx="8" fill="#fff" stroke="#d8e0ea" />
        <line x1={verticalGuideLeft} y1={MATRIX_LAYOUT.plotTop} x2={verticalGuideLeft} y2={MATRIX_LAYOUT.plotBottom} stroke="#f1f5f9" />
        <line x1={verticalGuideRight} y1={MATRIX_LAYOUT.plotTop} x2={verticalGuideRight} y2={MATRIX_LAYOUT.plotBottom} stroke="#f1f5f9" />
        <line x1={MATRIX_LAYOUT.plotLeft} y1={horizontalGuideTop} x2={MATRIX_LAYOUT.plotRight} y2={horizontalGuideTop} stroke="#f1f5f9" />
        <line x1={MATRIX_LAYOUT.plotLeft} y1={horizontalGuideBottom} x2={MATRIX_LAYOUT.plotRight} y2={horizontalGuideBottom} stroke="#f1f5f9" />
        <line x1={MATRIX_LAYOUT.centerX} y1={MATRIX_LAYOUT.plotTop} x2={MATRIX_LAYOUT.centerX} y2={MATRIX_LAYOUT.plotBottom} stroke="#d8e0ea" />
        <line x1={MATRIX_LAYOUT.plotLeft} y1={MATRIX_LAYOUT.centerY} x2={MATRIX_LAYOUT.plotRight} y2={MATRIX_LAYOUT.centerY} stroke="#d8e0ea" />
        <line x1={MATRIX_LAYOUT.plotLeft + 10} y1={MATRIX_LAYOUT.centerY} x2={MATRIX_LAYOUT.plotRight - 10} y2={MATRIX_LAYOUT.centerY} stroke="#94a3b8" strokeWidth=".9" opacity=".55" />
        <text x={MATRIX_LAYOUT.centerX} y={MATRIX_LAYOUT.plotTop + 14} textAnchor="middle" className="fill-slate-500 text-[10px] font-[700]">
          ↑ {yEnds.top}
        </text>
        <text x={MATRIX_LAYOUT.centerX} y={MATRIX_LAYOUT.plotBottom - 8} textAnchor="middle" className="fill-slate-500 text-[10px] font-[700]">
          ↓ {yEnds.bottom}
        </text>
        <text x={MATRIX_LAYOUT.plotLeft + 12} y={MATRIX_LAYOUT.centerY - 8} className="fill-slate-500 text-[10px] font-[700]">
          ← {xEnds.left}
        </text>
        <text x={MATRIX_LAYOUT.plotRight - 12} y={MATRIX_LAYOUT.centerY - 8} textAnchor="end" className="fill-slate-500 text-[10px] font-[700]">
          {xEnds.right} →
        </text>
        <QuadrantLabel {...MATRIX_QUADRANT_LABEL_BOXES.topLeft} label={quadrantLabels[0]} example={quadrantExamples?.[0]} />
        <QuadrantLabel {...MATRIX_QUADRANT_LABEL_BOXES.topRight} align="right" label={quadrantLabels[1]} example={quadrantExamples?.[1]} />
        <QuadrantLabel {...MATRIX_QUADRANT_LABEL_BOXES.bottomLeft} vertical="bottom" label={quadrantLabels[2]} example={quadrantExamples?.[2]} />
        <QuadrantLabel {...MATRIX_QUADRANT_LABEL_BOXES.bottomRight} align="right" vertical="bottom" label={quadrantLabels[3]} example={quadrantExamples?.[3]} />
        <line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="#2f8f86" strokeWidth="2" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
        <circle cx={ax} cy={ay} r="15.5" fill="none" stroke="#334155" strokeWidth=".8" opacity=".14" />
        <circle cx={ax} cy={ay} r="10.5" fill="#fff" stroke="#334155" strokeWidth="1.6" />
        <circle cx={ax} cy={ay} r="3" fill="#334155" />
        <rect x={displayTarget.x - 9} y={displayTarget.y - 9} width="18" height="18" rx="4" transform={`rotate(45 ${displayTarget.x} ${displayTarget.y})`} fill="#fff" stroke="#2f8f86" strokeWidth="1.8" />
        <circle cx={displayTarget.x} cy={displayTarget.y} r="2.7" fill="#2f8f86" />
        <foreignObject x={MATRIX_LAYOUT.legendX} y={MATRIX_LAYOUT.legendY} width={MATRIX_LAYOUT.legendWidth} height={MATRIX_LAYOUT.legendHeight}>
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
            <div className="truncate text-slate-500">To-Be는 철학 응답을 바탕으로 찍은 지향점입니다.</div>
          </div>
        </foreignObject>
      </svg>
      <div className="mt-3 rounded-[8px] border border-[#d9ebe7] bg-[#fbfefd] p-3">
        <div className="grid gap-2 md:grid-cols-3">
          {narrativeItems.map((item) => (
            <div key={item.label} className="rounded-[7px] border border-[#d9ebe7] bg-white px-3 py-2">
              <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-[#4c7974]">{item.label}</p>
              <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-700">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">원래 To-Be 좌표는 x {toBe.x.toFixed(3)}, y {toBe.y.toFixed(3)}입니다.</span>
    </div>
  );
}

