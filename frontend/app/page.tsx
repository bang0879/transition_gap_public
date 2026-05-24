"use client";

import { BrandMark } from "@/components/layout/BrandMark";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProcessStrip } from "@/components/landing/ProcessStrip";
import { usePageTracking } from "@/lib/hooks/usePageTracking";

function LandingContent() {
  usePageTracking("/");

  return (
    <main
      className="min-h-screen px-5 py-7 sm:p-9"
      style={{
        background: "linear-gradient(90deg, rgba(248,250,252,.96), rgba(255,255,255,.8)), #fff",
      }}
    >
      <div className="mb-12 flex flex-col items-start gap-4 sm:mb-[72px] sm:flex-row sm:items-center sm:justify-between">
        <BrandMark />
        <div className="text-[11px] font-[700] uppercase tracking-[0.08em] text-slate-400">
          대표 의사결정용 진단 워크스페이스
        </div>
      </div>
      <LandingHero />
      <ProcessStrip />
    </main>
  );
}

export default function LandingPage() {
  return <LandingContent />;
}
