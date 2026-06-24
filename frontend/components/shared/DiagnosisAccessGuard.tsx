"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasDiagnosisAccess } from "@/lib/utils/accessGate";

interface DiagnosisAccessGuardProps {
  children: React.ReactNode;
}

export function DiagnosisAccessGuard({ children }: DiagnosisAccessGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasDiagnosisAccess()) {
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) return null;

  return <>{children}</>;
}
