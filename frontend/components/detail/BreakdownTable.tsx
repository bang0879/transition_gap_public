import { RiskBadge } from "./RiskBadge";
import type { ScoreBreakdownItem } from "@/lib/types/api";

interface BreakdownTableProps {
  breakdown: ScoreBreakdownItem[];
}

const INTERNAL_FACTORS = new Set(["기본 점수", "최종 점수"]);

function displayValue(value: string): string {
  return value
    .replace(/^\[|\]$/g, "")
    .replace(/['"]/g, "")
    .replace(/,\s*/g, " · ");
}

function stripDecimalNoise(value: string): string {
  return value
    .replace(/(\d+)\.0+(?=점|%|\/|$)/g, "$1")
    .replace(/(\d+\.\d)0+(?=점|%|\/|$)/g, "$1");
}

function severityLabel(numeric: number): string {
  if (numeric >= 0.75) return "높은 위험";
  if (numeric >= 0.35) return "주의 필요";
  return "낮은 위험";
}

function formatDisplayValue(item: ScoreBreakdownItem): string {
  const displayed = stripDecimalNoise(displayValue(item.value));
  const numeric = Number(displayed);

  if (item.factor.includes("심각도") && Number.isFinite(numeric)) {
    return severityLabel(numeric);
  }
  if (/^\d+(\.\d+)?$/.test(displayed) && Number.isFinite(numeric) && numeric >= 0 && numeric <= 1) {
    return severityLabel(numeric);
  }
  if (/^\d+(\.\d+)?$/.test(displayed) && Number.isFinite(numeric) && numeric > 1 && numeric <= 10) {
    return `${Math.round(numeric)}점`;
  }
  return displayed;
}

function ImpactBadge({ impact }: { impact: number }) {
  const badge = impact <= -10
    ? { label: "위험", cls: "bg-red-soft text-red border-red/20" }
    : impact < 0
      ? { label: "주의", cls: "bg-amber-soft text-amber border-amber/20" }
      : { label: "안정", cls: "bg-green-soft text-green border-green/20" };

  return (
    <span
      className={`inline-flex cursor-default items-center rounded border px-2 py-0.5 text-[11px] font-[650] ${badge.cls}`}
    >
      {badge.label}
    </span>
  );
}

export function BreakdownTable({ breakdown }: BreakdownTableProps) {
  const rows = breakdown.filter((item) => !INTERNAL_FACTORS.has(item.factor));

  return (
    <div className="mb-4 overflow-x-auto rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead className="bg-slate-50">
          <tr className="text-[11px] font-[760] uppercase tracking-[0.04em] text-slate-500">
            <th className="w-[22%] px-4 py-3">감점 요인</th>
            <th className="w-[24%] px-4 py-3">현재 응답</th>
            <th className="w-[12%] px-4 py-3">운영 충돌 위험</th>
            <th className="px-4 py-3">해석</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={`${item.factor}-${item.value}`} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3 text-[12px] font-[650] text-slate-800">{item.factor}</td>
              <td className="px-4 py-3 text-[12px] leading-[1.55] text-slate-600">{formatDisplayValue(item)}</td>
              <td className="px-4 py-3">
                <ImpactBadge impact={item.impact} />
              </td>
              <td className="px-4 py-3">
                <RiskBadge text={item.implication || item.note || "추가 해석이 필요합니다."} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
