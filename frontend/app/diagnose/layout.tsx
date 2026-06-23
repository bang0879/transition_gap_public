"use client";

import { Rail } from "@/components/layout/Rail";
import { SessionGuard } from "@/components/shared/SessionGuard";
import { useScrollReset } from "@/lib/hooks/useScrollReset";

function DiagnoseShell({ children }: { children: React.ReactNode }) {
  useScrollReset();

  return (
    <div className="app-shell grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-[246px_minmax(0,1fr)]">
      <Rail phase="diagnose" subtitle="인사 운영을 프리즘으로 진단" />
      <section className="min-w-0 overflow-x-clip p-4 sm:p-6 lg:p-9">{children}</section>
    </div>
  );
}

export default function DiagnoseLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <DiagnoseShell>{children}</DiagnoseShell>
    </SessionGuard>
  );
}
