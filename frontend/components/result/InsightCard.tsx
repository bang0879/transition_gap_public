interface InsightCardProps {
  source: string;
  headline: string;
  detail: string;
}

const SOURCE_KICKERS: Record<string, string> = {
  "HR 가시성": "Data visibility",
  가시성: "Data visibility",
  교차: "Operating risk",
  보상: "Operating risk",
  평가: "Operating risk",
  리더십: "Operating risk",
  전략: "Strategic choice",
};

function getKicker(source: string): string {
  for (const [key, kicker] of Object.entries(SOURCE_KICKERS)) {
    if (source.includes(key)) return kicker;
  }
  return "Insight";
}

export function InsightCard({ source, headline, detail }: InsightCardProps) {
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <p className="m-0 mb-2 text-[10px] font-[760] uppercase text-slate-500">
        {getKicker(source)}
      </p>
      <h3 className="m-0 mb-2 text-[13px] font-[690] leading-[1.45] text-slate-900">
        {headline}
      </h3>
      <p className="m-0 text-[11px] leading-[1.65] text-slate-600">{detail}</p>
    </article>
  );
}
