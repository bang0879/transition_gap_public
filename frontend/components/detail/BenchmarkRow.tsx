"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOptions } from "@/lib/api/content";
import { useResponsesStore } from "@/lib/store/responses";

interface BenchmarkItem {
  label: string;
  value: string;
  note: string;
  archetype: string;
}

interface BenchmarkData {
  benchmarks?: Record<string, { items: BenchmarkItem[]; title: string; intro: string; disclaimer: string }>;
}

interface BenchmarkRowProps {
  areaId: string;
}

const SMALL_ORG_OPTIONS = new Set(["20인 이하", "5~9인", "10~19인"]);

export function BenchmarkRow({ areaId }: BenchmarkRowProps) {
  const orgSize = useResponsesStore((state) => state.responses["L1-2"]);
  const isSmallOrg = typeof orgSize === "string" && SMALL_ORG_OPTIONS.has(orgSize);
  const { data } = useQuery({
    queryKey: ["options"],
    queryFn: () => fetchOptions<BenchmarkData>(),
  });
  const benchmark = data?.benchmarks?.[areaId];

  if (!benchmark) {
    return null;
  }

  const title = benchmark.title.replace(/벤치마크/g, "참고 기준");

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <h3 className="m-0 text-[14px] font-[680] text-slate-900">{title}</h3>
      <p className="mt-2 text-[12px] leading-[1.65] text-slate-500">{benchmark.intro}</p>
      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 lg:grid-cols-3">
        {benchmark.items.slice(0, 3).map((item) => (
          <div key={item.label} className="lg:border-l lg:border-slate-100 lg:pl-4 lg:first:border-l-0 lg:first:pl-0">
            <p className="m-0 text-[10px] font-[760] uppercase tracking-[0.08em] text-slate-400">
              {item.label}
            </p>
            <strong className="mt-2 block text-[16px] font-[690] text-slate-900">{item.value}</strong>
            <p className="m-0 mt-2 text-[11px] leading-[1.55] text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>
      {benchmark.disclaimer && isSmallOrg ? (
        <div className="mt-4 rounded-[10px] border border-[#e8dcc7] bg-[#fffdf8] p-4">
          <p className="m-0 text-[12px] font-[680] leading-[1.6] text-slate-800">20인 이하 초기 조직 가이드</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">{benchmark.disclaimer}</p>
        </div>
      ) : null}
    </section>
  );
}
