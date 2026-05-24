"use client";

import Link from "next/link";

interface StepIndicatorProps {
  label: string;
  path: string;
  status: "done" | "current" | "future";
}

export function StepIndicator({ label, path, status }: StepIndicatorProps) {
  const statusClass =
    status === "current"
      ? "bg-white text-slate-900 shadow-soft after:absolute after:left-0 after:top-[11px] after:h-[18px] after:w-[3px] after:rounded-full after:bg-teal"
      : status === "done"
        ? "text-teal-deep"
        : "text-slate-500";

  const dotClass =
    status === "done"
      ? "border-teal bg-teal text-white"
      : status === "current"
        ? "border-teal bg-white"
        : "border-slate-300 bg-white";

  return (
    <Link
      href={path}
      className={`relative flex min-h-[38px] items-center gap-[10px] rounded-[10px] px-[10px] text-[12px] font-[640] no-underline transition-colors ${statusClass}`}
    >
      <span
        className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border text-[9px] leading-none ${dotClass}`}
      >
        {status === "done" ? "✓" : ""}
      </span>
      <span>{label}</span>
    </Link>
  );
}
