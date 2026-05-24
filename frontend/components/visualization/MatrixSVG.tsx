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
}

const X0 = 20;
const X1 = 480;
const Y0 = 20;
const Y1 = 320;

function sx(x: number): number {
  return X0 + Math.max(0, Math.min(1, x)) * (X1 - X0);
}

function sy(y: number): number {
  return Y1 - Math.max(0, Math.min(1, y)) * (Y1 - Y0);
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
}: MatrixSVGProps) {
  const ax = sx(asIs.x);
  const ay = sy(asIs.y);
  const tx = sx(toBe.x);
  const ty = sy(toBe.y);

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
      <svg viewBox="0 0 500 372" className="h-auto w-full" role="img" aria-label={title}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f8f86" />
          </marker>
          <style>{`.marker-label{paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round;}`}</style>
        </defs>
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="8" fill="#fffdf8" stroke="#e2e8f0" />
        <rect x={X0} y={Y0} width="230" height="150" rx="8" fill="#fff8e8" opacity=".75" />
        <rect x="250" y={Y0} width="230" height="150" rx="8" fill="#fffaf0" opacity=".62" />
        <rect x={X0} y="170" width="230" height="150" rx="8" fill="#ffffff" opacity=".64" />
        <rect x="250" y="170" width="230" height="150" rx="8" fill="#fff8e8" opacity=".48" />
        <line x1="250" y1={Y0} x2="250" y2={Y1} stroke="#e2e8f0" />
        <line x1={X0} y1="170" x2={X1} y2="170" stroke="#e2e8f0" />
        <text x="32" y="42" fontSize="11" fontWeight="650" fill="#64748b">{quadrantLabels[0]}</text>
        {quadrantExamples ? <text x="32" y="58" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[0]}</text> : null}
        <text x="468" y="42" textAnchor="end" fontSize="11" fontWeight="650" fill="#64748b">{quadrantLabels[1]}</text>
        {quadrantExamples ? <text x="468" y="58" textAnchor="end" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[1]}</text> : null}
        <text x="32" y="307" fontSize="11" fontWeight="650" fill="#64748b">{quadrantLabels[2]}</text>
        {quadrantExamples ? <text x="32" y="291" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[2]}</text> : null}
        <text x="468" y="307" textAnchor="end" fontSize="11" fontWeight="650" fill="#64748b">{quadrantLabels[3]}</text>
        {quadrantExamples ? <text x="468" y="291" textAnchor="end" fontSize="9.5" fontWeight="560" fill="#94a3b8">{quadrantExamples[3]}</text> : null}
        <text x="250" y="352" textAnchor="middle" fontSize="12" fontWeight="680" fill="#475569">{xAxisLabel}</text>
        <text x="-170" y="13" textAnchor="middle" transform="rotate(-90)" fontSize="12" fontWeight="680" fill="#475569">{yAxisLabel}</text>
        <line x1={ax} y1={ay} x2={tx} y2={ty} stroke="#2f8f86" strokeWidth="2" strokeDasharray="4 4" markerEnd={`url(#${markerId})`} />
        <circle cx={ax} cy={ay} r="10.5" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        <circle cx={ax} cy={ay} r="3" fill="#0f172a" />
        <rect x={tx - 8} y={ty - 8} width="16" height="16" transform={`rotate(45 ${tx} ${ty})`} fill="#fff" stroke="#2f8f86" strokeWidth="2.5" />
        <text x={ax + 14} y={ay - 12} className="marker-label" fontSize="11" fontWeight="700" fill="#0f172a">As-Is</text>
        <text x={tx + 14} y={ty - 12} className="marker-label" fontSize="11" fontWeight="700" fill="#176c66">To-Be</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" /> 현재 운영 상태</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rotate-45 border border-teal bg-white" /> 대표 철학 기준점</span>
        <span>선의 길이는 전환 비용을 의미합니다.</span>
      </div>
    </div>
  );
}
