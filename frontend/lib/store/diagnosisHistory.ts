"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DiagnosisSnapshot {
  sessionId: string;
  companyName: string;
  capturedAt: string;
  visibilityScore: number;
  alignmentScore: number;
  topGapArea: string;
  topGap: number;
}

interface DiagnosisHistoryState {
  snapshots: DiagnosisSnapshot[];
  upsertSnapshot: (snapshot: DiagnosisSnapshot) => void;
  clearHistory: () => void;
}

export const useDiagnosisHistoryStore = create<DiagnosisHistoryState>()(
  persist(
    (set) => ({
      snapshots: [],
      upsertSnapshot: (snapshot) =>
        set((state) => {
          const withoutCurrent = state.snapshots.filter((item) => item.sessionId !== snapshot.sessionId);
          return {
            snapshots: [snapshot, ...withoutCurrent]
              .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
              .slice(0, 8),
          };
        }),
      clearHistory: () => set({ snapshots: [] }),
    }),
    { name: "tg-diagnosis-history" },
  ),
);
