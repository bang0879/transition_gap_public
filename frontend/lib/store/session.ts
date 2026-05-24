"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  sessionId: string;
  startedAt: string;
  companyName: string;
  initSession: (company: string) => void;
  ensureSession: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: "",
      startedAt: "",
      companyName: "",
      initSession: (company: string) => {
        set({
          sessionId: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          companyName: company,
        });
      },
      ensureSession: () => {
        if (!get().sessionId) {
          set({
            sessionId: crypto.randomUUID(),
            startedAt: new Date().toISOString(),
            companyName: "",
          });
        }
      },
      clearSession: () => {
        set({ sessionId: "", startedAt: "", companyName: "" });
      },
    }),
    { name: "tg-session" },
  ),
);
