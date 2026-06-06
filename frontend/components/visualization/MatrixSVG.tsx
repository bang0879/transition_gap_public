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
  confidenceText?: string;
}

const X0 = 20;
const X1 = 480;
const Y0 = 20;
const Y1 = 320;
const CX = 250;
const CY = 170;

function sx(x: number): number {
  return X0 + Math.max(0, Math.min(1, x)) * (X1 - X0);
}

function sy(y: number): number {
  return Y1 - Math.max(0, Math.min(1, y)) * (Y1 - Y0);
}

function markerLabelPosition(
  x: number,
  y: number,
  otherX: number,
  otherY: number,
  preference: "as-is" | "to-be",
): { x: number; y: number } {
  const close = Math.hypot(x - otherX, y - otherY) < 72;
  const nearTop = y < 126;
  const nearBottom = y > 214;
  const yOffset = nearTop
    ? 42
    : nearBottom
      ? -34
      : close
        ? (preference === "as-is" ? 34 : -30)
        : (preference === "as-is" ? 26 : -20);
  const xNudge = close ? (preference === "as-is" ? -12 : 12) : 0;
  const labelX = Math.max(X0 + 32, Math.min(X1 - 32, x + xNudge));
  const labelY = Math.max(Y0 + 96, Math.min(Y1 - 76, y + yOffset));

  return { x: labelX, y: labelY };
}

function QuadrantLabel({
  x,
  y,
  align = "left",
  label,
  example,
}: {
  x: number;
  y: number;
  align?: "left" | "right";
  label: string;
  example?: string;
}) {
  return (
    <foreignObject x={x} y={y} width="188" height="72">
      <div
        className={`flex h-full flex-col justify-start rounded-[7px] border border-white/80 bg-white/95 px-2 py-1.5 text-[10.5px] font-[700] leading-[1.25] text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.08)] ${
          align === "right" ? "items-end text-right" : "items-start text-left"
        }`}
      >
        <span className="max-w-full">{label}</span>
        {example ? <span className="mt-1 text-[9px] font-[560] leading-[1.2] text-slate-400">{example}</span> : null}
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
  const asIsLabel = markerLabelPosition(ax, ay, tx, ty, "as-is");
  const toBeLabel = markerLabelPosition(tx, ty, ax, ay, "to-be");

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-[14px] font-[680] text-slate-900">{title}</h3>
          <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-[9px] py-[3px] text-[11px] font-[680] text-slate-500">
          {badgeText}
        </span>
      </div>
      <svg viewBox="0 0 500 372" className="h-auto w-full rounded-[8px] border border-slate-200 bg-white" role="img" aria-label={title}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f8f86" />
          </marker>
          <style>{`.marker-label{paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round;}`}</style>
        </defs>
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="8" fill="#fff" stroke="#d8e0ea" />
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="8" fill="#fff8e8" opacity=".18" />
        <line x1="135" y1={Y0} x2="135" y2={Y1} stroke="#f1f5f9" />
        <line x1="365" y1={Y0} x2="365" y2={Y1} stroke="#f1f5f9" />
        <line x1={X0} y1="95" x2={X1} y2="95" stroke="#f1f5f9" />
        <line x1={X0} y1="245" x2={X1} y2="245" stroke="#f1f5f9" />
        <line x1={CX} y1={Y0} x2={CX} y2={Y1} stroke="#d8e0ea" />
        <line x1={X0} y1={CY} x2={X1} y2={CY} stroke="#d8e0ea" />
        <line x1={X0 + 10} y1={CY} x2={X1 - 10} y2={CY} stroke="#94a3b8" strokeWidth=".9" opacity=".65" markerEnd={`url(#${markerId})`} />
        <QuadrantLabel x={30} y={28} label={quadrantLabels[0]} example={quadrantExamples?.[0]} />
        <QuadrantLabel x={282} y={28} align="right" label={quadrantLabels[1]} example={quadrantExamples?.[1]} />
        <QuadrantLabel x={30} y={238} label={quadrantLabels[2]} example={quadrantExamples?.[2]} />
        <QuadrantLabel x={282} y={238} align="right" label={quadrantLabels[3]} example={quadrantExamples?.[3]} />
        <line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="#2f8f86" strokeWidth="2" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
        <circle cx={ax} cy={ay} r="15.5" fill="none" stroke="#334155" strokeWidth=".8" opacity=".14" />
        <circle cx={ax} cy={ay} r="10.5" fill="#fff" stroke="#334155" strokeWidth="1.6" />
        <circle cx={ax} cy={ay} r="3" fill="#334155" />
        <rect x={tx - 9} y={ty - 9} width="18" height="18" rx="4" transform={`rotate(45 ${tx} ${ty})`} fill="#fff" stroke="#2f8f86" strokeWidth="1.8" />
        <circle cx={tx} cy={ty} r="2.7" fill="#2f8f86" />
        <rect x={asIsLabel.x - 22} y={asIsLabel.y - 14} width="44" height="18" rx="9" fill="#fff" stroke="#e2e8f0" />
        <rect x={toBeLabel.x - 23} y={toBeLabel.y - 14} width="46" height="18" rx="9" fill="#fff" stroke="#b8ded9" />
        <text x={asIsLabel.x} y={asIsLabel.y - 1} textAnchor="middle" fontSize="10.5" fontWeight="720" fill="#334155">As-Is</text>
        <text x={toBeLabel.x} y={toBeLabel.y - 1} textAnchor="middle" fontSize="10.5" fontWeight="720" fill="#176c66">To-Be</text>
      </svg>
      <div className="mt-2 grid gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-[1.55] text-slate-500 sm:grid-cols-2">
        <div>
          <span className="font-[760] text-slate-700">가로축</span> · {xAxisLabel}
        </div>
        <div>
          <span className="font-[760] text-slate-700">세로축</span> · {yAxisLabel.replace("  ", " / ")}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" /> 현재 운영 상태</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rotate-45 border border-teal bg-white" /> 회사가 지향하는 기준</span>
        <span>{confidenceText ?? "선의 길이는 전환 비용을 의미합니다."}</span>
      </div>
    </div>
  );
}
