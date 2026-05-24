"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDiagnosis } from "@/lib/api/diagnose";
import { useResponsesStore } from "@/lib/store/responses";
import type { DiagnoseResponse } from "@/lib/types/api";

export function useDiagnosis() {
  const responses = useResponsesStore((state) => state.responses);
  const hasResponses = Object.keys(responses).length > 0;

  const query = useQuery<DiagnoseResponse>({
    queryKey: ["diagnosis", responses],
    queryFn: () => fetchDiagnosis(responses),
    enabled: hasResponses,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return {
    ...query,
    isWaitingForResponses: !hasResponses,
  };
}
