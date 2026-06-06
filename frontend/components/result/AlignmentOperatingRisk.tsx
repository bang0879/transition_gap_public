import { Badge } from "@/components/shared/Badge";
import type { AlignmentAxisOut, AlignmentMapConflictOut, AlignmentMapOut } from "@/lib/types/api";

interface AlignmentOperatingRiskProps {
  map: AlignmentMapOut;
}

type Tone = "slate" | "amber" | "coral";

function domainName(axis: AlignmentAxisOut | undefined, fallback: string): string {
  if (!axis) return fallback;
  if (axis.domain_name === "인재") return "채용";
  if (axis.domain_name === "인력") return "인력운영";
  return axis.domain_name;
}

function toneForSeverity(severity: string): Tone {
  if (severity === "misaligned" || severity === "high") return "coral";
  if (severity === "watch" || severity === "medium") return "amber";
  return "slate";
}

function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes("占") || /[?좎콡梨좎콠梨]/.test(value)) return null;
  return value;
}

function fallbackRisks(axes: AlignmentAxisOut[]): AlignmentMapConflictOut[] {
  return [...axes]
    .filter((axis) => axis.tension_level !== "aligned")
    .sort((a, b) => a.alignment_percent - b.alignment_percent)
    .slice(0, 3)
    .map((axis) => ({
      id: `${axis.domain_id}_operating_risk`,
      title: `${domainName(axis, axis.domain_name)} 운영 기준을 먼저 정렬해야 합니다.`,
      detail:
        axis.business_risk ??
        `${domainName(axis, axis.domain_name)}에서 회사의 인사철학과 현재 제도가 서로 다른 신호를 보내고 있습니다.`,
      domains: [axis.domain_id],
      severity: axis.tension_level,
    }));
}

export function AlignmentOperatingRisk({ map }: AlignmentOperatingRiskProps) {
  const axes = map.axes ?? [];
  const cleanConflicts = map.conflicts
    .map((conflict) => ({
      ...conflict,
      title: cleanText(conflict.title),
      detail: cleanText(conflict.detail),
    }))
    .filter((conflict): conflict is AlignmentMapConflictOut => Boolean(conflict.title && conflict.detail))
    .slice(0, 3);
  const risks = cleanConflicts.length > 0 ? cleanConflicts : fallbackRisks(axes);

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">운영 리스크</p>
          <h3 className="m-0 mt-1 text-[15px] font-[720] text-slate-900">정합성이 어긋나면 실제로 생길 수 있는 문제</h3>
          <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-500">
            위에서는 철학과 제도 방향을 봤고, 여기서는 그 괴리가 현장에서 어떤 비용으로 번질 수 있는지 확인합니다.
          </p>
        </div>
        <Badge variant="slate">운영 판단 근거</Badge>
      </div>

      {risks.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {risks.map((risk) => {
            const tone = toneForSeverity(risk.severity);
            const relatedDomains = risk.domains
              .map((domainId) => axes.find((axis) => axis.domain_id === domainId))
              .map((axis, index) => domainName(axis, risk.domains[index]))
              .filter(Boolean);

            return (
              <article key={risk.id} className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tone === "coral" ? "bg-coral" : tone === "amber" ? "bg-amber" : "bg-slate-300"
                    }`}
                    aria-hidden="true"
                  />
                  {relatedDomains.length > 0 ? <Badge variant={tone}>{relatedDomains.join(" ↔ ")}</Badge> : null}
                </div>
                <h4 className="m-0 text-[13px] font-[720] leading-[1.45] text-slate-900">{risk.title}</h4>
                <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">{risk.detail}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="m-0 rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-[12px] leading-[1.65] text-slate-600">
          현재 입력 기준으로는 크게 튀는 제도 간 충돌이 보이지 않습니다. 다만 정합도가 낮은 영역은 상세 분석에서 운영 기준을 다시 맞춰보는 것이 좋습니다.
        </p>
      )}
    </section>
  );
}
