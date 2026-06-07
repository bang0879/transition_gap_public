"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  warnings?: string[];
  package?: Array<{ area: string; action: string; timeline: string }>;
}

interface ScenarioFitTableProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const OPERATING_IMAGES: Record<string, { reference: string; fit: string }> = {
  performance: {
    reference: "Netflix식 고성과, 고책임 운영 이미지",
    fit: "강한 성과 메시지",
  },
  community: {
    reference: "Google식 심리적 안전감, 협업 운영 이미지",
    fit: "수용성 회복",
  },
  elite: {
    reference: "초기 토스식 소수정예, 빠른 실행 이미지",
    fit: "핵심 밀도 강화",
  },
};

const FIT_TONE: Record<string, string> = {
  performance: "border-coral/30 bg-white text-coral",
  community: "border-teal-line bg-white text-teal-deep",
  elite: "border-amber/30 bg-white text-amber",
};

function operatingImageFor(id: string): { reference: string; fit: string } {
  return OPERATING_IMAGES[id] ?? {
    reference: "성장 단계 스타트업의 혼합 운영 이미지",
    fit: "추가 검토",
  };
}

export function ScenarioFitTable({ scenarios, selectedId, onSelect }: ScenarioFitTableProps) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
      <div className="border-b border-slate-100 p-4">
        <p className="m-0 text-[14px] font-[680] text-slate-900">시나리오 연결 힌트</p>
        <p className="m-0 mt-[5px] text-[11px] leading-[1.55] text-slate-500">
          여기서는 선택을 확정하지 않고, 각 방향이 무엇을 강화하고 어떤 부담을 만드는지 미리 봅니다.
        </p>
      </div>
      <div className="grid gap-3 p-4">
      {scenarios.map((scenario) => {
        const selected = selectedId === scenario.id;
        const image = operatingImageFor(scenario.id);
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className={`rounded-[10px] border p-4 text-left transition-all duration-300 ${
              selected
                ? "border-teal-line bg-teal-soft shadow-[inset_0_0_0_1px_rgba(47,143,134,0.22)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[13px] font-[680] text-slate-900">{scenario.name}</p>
                <p className="m-0 mt-1 text-[11px] text-slate-500">{scenario.subtitle}</p>
              </div>
              <span className={`mt-1 rounded-full border px-[8px] py-[3px] text-[11px] font-[680] ${
                selected ? "border-teal-line bg-white text-teal-deep" : "border-slate-200 bg-slate-50 text-slate-400"
              }`}>
                {selected ? "검토 중" : "비교"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-teal">얻는 것</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-600">{scenario.description}</p>
              </div>
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-coral">부담/주의점</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-500">
                  <GlossaryText text={scenario.warnings?.[0] ?? "추가 검토 필요"} />
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-[11px] sm:grid-cols-[1fr_112px]">
              <span className="leading-[1.55] text-slate-500">
                참고 예시: <span className="font-[680] text-slate-700"><GlossaryText text={image.reference} /></span>
              </span>
              <span className={`w-fit rounded-full border px-[8px] py-[3px] font-[680] ${
                selected ? FIT_TONE[scenario.id] ?? "border-slate-200 bg-white text-slate-700" : "border-slate-200 bg-slate-50 text-slate-500"
              }`}>
                {image.fit}
              </span>
            </div>
            {scenario.package?.[0] ? (
              <p className="m-0 mt-3 border-t border-slate-100 pt-3 text-[11px] leading-[1.55] text-slate-500">
                적용 필요 제도: <span className="font-[680] text-slate-700"><GlossaryText text={scenario.package[0].action} /></span>
              </p>
            ) : null}
          </button>
        );
      })}
      </div>
    </div>
  );
}
