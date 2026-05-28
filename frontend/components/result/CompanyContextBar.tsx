import { Badge } from "@/components/shared/Badge";
import type { ResponseValue } from "@/lib/store/responses";

interface CompanyContextBarProps {
  companyName: string;
  responses: Record<string, ResponseValue>;
}

function textValue(value: ResponseValue | undefined, fallback: string): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return fallback;
  return value === undefined || value === "" ? fallback : String(value);
}

export function CompanyContextBar({ companyName, responses }: CompanyContextBarProps) {
  const name = companyName || "우리 회사";
  const headcount = textValue(responses["L1-2"], "규모 미입력");
  const industry = textValue(responses["L1-5"], "산업 미입력");
  const hiring = textValue(responses["L1-4"], "채용 기조 미입력");

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white px-4 py-3 print:break-inside-avoid">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">회사 맥락</p>
          <p className="m-0 mt-1 text-[13px] leading-[1.6] text-slate-700">
            <strong className="font-[720] text-slate-900">{name}</strong>의 정합성은 같은 제도라도 규모,
            산업, 성장 속도에 따라 다르게 해석합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="slate">{headcount}</Badge>
          <Badge variant="teal">{industry}</Badge>
          <Badge variant="amber">{hiring}</Badge>
        </div>
      </div>
    </section>
  );
}
