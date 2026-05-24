"use client";

import { SessionGuard } from "./SessionGuard";
import { usePageTracking } from "@/lib/hooks/usePageTracking";

interface EmptyShellProps {
  page: string;
  title: string;
  description?: string;
}

function EmptyShellContent({ page, title, description }: EmptyShellProps) {
  usePageTracking(page);

  return (
    <main className="min-h-screen p-9">
      <div className="rounded-card border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-3 text-[11px] font-[760] uppercase tracking-[0.08em] text-teal">
          Transition Gap
        </div>
        <h2 className="m-0 text-[28px] font-[680] leading-[1.25] text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-slate-500">
          {description ?? "#11-B에서 구현됩니다."}
        </p>
      </div>
    </main>
  );
}

export function EmptyShell(props: EmptyShellProps) {
  return (
    <SessionGuard>
      <EmptyShellContent {...props} />
    </SessionGuard>
  );
}
