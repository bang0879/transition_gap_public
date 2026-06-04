"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";

interface BottomNavProps {
  prevPath?: string;
  prevLabel?: string;
  nextPath: string;
  nextLabel: string;
  nextDisabled?: boolean;
}

export function BottomNav({ prevPath, prevLabel, nextPath, nextLabel, nextDisabled = false }: BottomNavProps) {
  const router = useRouter();

  return (
    <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between border-t border-slate-200 bg-white/90 p-4 backdrop-blur-sm print:hidden">
      {prevPath ? (
        <Button onClick={() => router.push(prevPath)}>{prevLabel || "이전"}</Button>
      ) : (
        <div />
      )}
      <Button variant="primary" disabled={nextDisabled} onClick={() => router.push(nextPath)}>
        {nextLabel}
      </Button>
    </div>
  );
}
