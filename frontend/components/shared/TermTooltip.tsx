import { HR_GLOSSARY, HrGlossaryTerm } from "@/lib/constants/hrGlossary";

interface TermTooltipProps {
  term: HrGlossaryTerm;
}

export function TermTooltip({ term }: TermTooltipProps) {
  return (
    <span className="group relative inline-flex align-baseline">
      <span
        tabIndex={0}
        className="cursor-help border-b border-dotted border-slate-400 font-[650] text-slate-800 outline-none focus:border-teal"
      >
        {term}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-[min(260px,80vw)] -translate-x-1/2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-left text-[11px] font-[500] leading-[1.55] text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.12)] group-hover:block group-focus-within:block">
        {HR_GLOSSARY[term]}
      </span>
    </span>
  );
}
