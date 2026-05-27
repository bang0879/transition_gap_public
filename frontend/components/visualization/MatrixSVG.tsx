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
  const yOffset = close ? (preference === "as-is" ? 34 : -30) : (preference === "as-is" ? 26 : -20);
  const xNudge = close ? (preference === "as-is" ? -12 : 12) : 0;
  const labelX = Math.max(X0 + 32, Math.min(X1 - 32, x + xNudge));
  const labelY = Math.max(Y0 + 22, Math.min(Y1 - 12, y + yOffset));

  return { x: labelX, y: labelY };
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
        <text x="34" y="47" fontSize="11.5" fontWeight="680" fill="#334155">{quadrantLabels[0]}</text>
        {quadrantExamples ? <text x="34" y="64" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[0]}</text> : null}
        <text x="466" y="47" textAnchor="end" fontSize="11.5" fontWeight="680" fill="#334155">{quadrantLabels[1]}</text>
        {quadrantExamples ? <text x="466" y="64" textAnchor="end" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[1]}</text> : null}
        <text x="34" y="296" fontSize="11.5" fontWeight="680" fill="#334155">{quadrantLabels[2]}</text>
        {quadrantExamples ? <text x="34" y="312" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[2]}</text> : null}
        <text x="466" y="296" textAnchor="end" fontSize="11.5" fontWeight="680" fill="#334155">{quadrantLabels[3]}</text>
        {quadrantExamples ? <text x="466" y="312" textAnchor="end" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[3]}</text> : null}
        <text x={CX} y="349" textAnchor="middle" fontSize="11" fontWeight="650" fill="#64748b">{xAxisLabel}</text>
        <text x="36" y="152" fontSize="10.5" fontWeight="650" fill="#64748b">세로축</text>
        <text x="36" y="166" fontSize="10.5" fontWeight="650" fill="#64748b">{yAxisLabel.split("  ")[0]}</text>
        <text x="36" y="180" fontSize="10.5" fontWeight="650" fill="#64748b">{yAxisLabel.split("  ")[1] ?? ""}</text>
        <line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="#2f8f86" strokeWidth="2" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
        <circle cx={ax} cy={ay} r="15.5" fill="none" stroke="#334155" strokeWidth=".8" opacity=".14" />
        <circle cx={ax} cy={ay} r="10.5" fill="#fff" stroke="#334155" strokeWidth="1.6" />
        <circle cx={ax} cy={ay} r="3" fill="#334155" />
        <rect x={tx - 9} y={ty - 9} width="18" height="18" rx="4" transform={`rotate(45 ${tx} ${ty})`} fill="#fff" stroke="#2f8f86" strokeWidth="1.8" />
        <circle cx={tx} cy={ty} r="2.7" fill="#2f8f86" />
        <text x={asIsLabel.x} y={asIsLabel.y} textAnchor="middle" className="marker-label" fontSize="11" fontWeight="680" fill="#334155">As-Is</text>
        <text x={toBeLabel.x} y={toBeLabel.y} textAnchor="middle" className="marker-label" fontSize="11" fontWeight="680" fill="#176c66">To-Be</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" /> 현재 운영 상태</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rotate-45 border border-teal bg-white" /> 회사가 지향하는 기준</span>
        <span>{confidenceText ?? "선의 길이는 전환 비용을 의미합니다."}</span>
      </div>
    </div>
  );
}
