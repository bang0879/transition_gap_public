"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ResponseValue = string | number | string[] | Record<string, number>;

interface ResponsesState {
  responses: Record<string, ResponseValue>;
  setResponse: (variableId: string, value: ResponseValue) => void;
  setResponses: (updates: Record<string, ResponseValue>) => void;
  getResponse: (variableId: string) => ResponseValue | undefined;
  clear: () => void;
}

export const useResponsesStore = create<ResponsesState>()(
  persist(
    (set, get) => ({
      responses: {},
      setResponse: (id, value) =>
        set((state) => ({ responses: { ...state.responses, [id]: value } })),
      setResponses: (updates) =>
        set((state) => ({ responses: { ...state.responses, ...updates } })),
      getResponse: (id) => get().responses[id],
      clear: () => set({ responses: {} }),
    }),
    { name: "tg-responses" },
  ),
);
