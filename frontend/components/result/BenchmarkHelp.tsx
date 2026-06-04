import { Badge } from "@/components/shared/Badge";

interface BenchmarkHelpProps {
  compact?: boolean;
}

export function BenchmarkHelp({ compact = false }: BenchmarkHelpProps) {
  return (
    <div className={`rounded-[10px] border border-slate-200 bg-slate-50 ${compact ? "px-3 py-2" : "p-4"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="slate">기준점 도움말</Badge>
        <p className="m-0 text-[12px] font-[680] text-slate-800">
          필요 기준은 외부 모범답안이 아니라 이 회사 조건에서 필요한 최소 운영 기준입니다.
        </p>
      </div>
      <p className="m-0 mt-2 text-[12px] leading-[1.6] text-slate-500">
        회사 규모, 성장 속도, 입력한 인사 철학을 함께 반영합니다. 따라서 현재 점수와의 차이는 부족함의 낙인이 아니라, 다음 회의에서 먼저 맞춰야 할 운영 기준입니다.
      </p>
    </div>
  );
}
