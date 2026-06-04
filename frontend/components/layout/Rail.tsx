"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";
import { RailFooter } from "./RailFooter";
import { StepIndicator } from "./StepIndicator";
import { DIAGNOSE_STEPS, RESULT_STEPS } from "@/lib/constants/steps";

interface RailProps {
  phase?: "diagnose" | "result";
  subtitle: string;
}

export function Rail({ phase = "diagnose", subtitle }: RailProps) {
  const pathname = usePathname();
  const steps =
    phase === "diagnose"
      ? [...DIAGNOSE_STEPS, RESULT_STEPS[0]]
      : RESULT_STEPS;
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.path === pathname),
  );

  return (
    <aside className="rail hidden min-h-screen flex-col border-r border-slate-200 bg-[#fbfcfd] px-[18px] py-[22px] print:hidden lg:flex">
      <div className="mb-[18px] border-b border-slate-200 px-2 pb-[18px] pt-0">
        <BrandMark subtitle={subtitle} />
      </div>
      <nav className="grid gap-1">
        {steps.map((step, index) => (
          <StepIndicator
            key={step.id}
            label={step.label}
            path={step.path}
            status={index < currentIndex ? "done" : index === currentIndex ? "current" : "future"}
          />
        ))}
      </nav>
      <RailFooter />
    </aside>
  );
}
