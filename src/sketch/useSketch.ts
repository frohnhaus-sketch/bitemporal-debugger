"use client";

import { create } from "zustand";

export type Goal =
  | "dashboard"
  | "historical-report"
  | "target-table"
  | "data-product";

export type SourceId =
  | "orders"
  | "customers"
  | "products"
  | "contracts"
  | "accounts";

export type Source = {
  id: SourceId;
  label: string;
  historical: boolean;
};

type SketchStore = {
  goal: Goal | null;
  sources: Source[];
  currentStep: number;

  setGoal: (goal: Goal) => void;
  toggleSource: (source: Source) => void;
  markSourceHistorical: (id: SourceId, historical: boolean) => void;
  nextStep: () => void;
  reset: () => void;
};

export const useSketch = create<SketchStore>((set) => ({
  goal: null,
  sources: [],
  currentStep: 0,

  setGoal: (goal) =>
    set({
      goal,
      currentStep: 1,
    }),

  toggleSource: (source) =>
    set((state) => {
      const exists = state.sources.some((s) => s.id === source.id);

      return {
        sources: exists
          ? state.sources.filter((s) => s.id !== source.id)
          : [...state.sources, source],
      };
    }),

  markSourceHistorical: (id, historical) =>
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, historical } : s,
      ),
    })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 3),
    })),

  reset: () =>
    set({
      goal: null,
      sources: [],
      currentStep: 0,
    }),
}));