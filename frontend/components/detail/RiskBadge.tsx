interface RiskBadgeProps {
  text: string;
}

type RiskType = "risk" | "good" | "info";

function parseImplication(text: string): { type: RiskType; prefix: string; body: string } {
  const match = text.match(/^\[(리스크|강점|참고|결론)]\s*(.+)$/);
  if (!match) return { type: "info", prefix: "", body: text };
  const typeMap: Record<string, RiskType> = {
    리스크: "risk",
    강점: "good",
    참고: "info",
    결론: "info",
  };
  return { type: typeMap[match[1]] ?? "info", prefix: `[${match[1]}]`, body: match[2] };
}

const styles: Record<RiskType, string> = {
  risk: "border-[#efd7d2] bg-[#fffafa]",
  good: "border-[#d7eadf] bg-[#fbfffd]",
  info: "border-slate-200 bg-white",
};

const prefixColors: Record<RiskType, string> = {
  risk: "text-[#9b4c3b]",
  good: "text-[#2f7d5f]",
  info: "text-slate-900",
};

export function RiskBadge({ text }: RiskBadgeProps) {
  const { type, prefix, body } = parseImplication(text);
  return (
    <span className={`inline-flex items-start gap-2 rounded-lg border px-[10px] py-[9px] text-[11px] leading-[1.55] text-slate-700 ${styles[type]}`}>
      {prefix ? <strong className={`shrink-0 whitespace-nowrap ${prefixColors[type]}`}>{prefix}</strong> : null}
      {body}
    </span>
  );
}
