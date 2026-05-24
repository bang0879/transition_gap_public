"use client";

type BadgeVariant = "teal" | "amber" | "coral" | "slate";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClass: Record<BadgeVariant, string> = {
  teal: "border-teal-line bg-teal-soft text-teal-deep",
  amber: "border-amber-soft bg-amber-soft text-amber",
  coral: "border-coral-soft bg-coral-soft text-coral",
  slate: "border-slate-200 bg-slate-50 text-slate-500",
};

export function Badge({ variant = "slate", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-[9px] py-[3px] text-[11px] font-[680] leading-none ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
