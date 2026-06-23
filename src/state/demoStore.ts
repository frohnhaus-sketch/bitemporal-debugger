"use client";

import { create } from "zustand";

export type FlowState =
  | "landing"
  | "loading_demo"
  | "demo_static"
  | "auto_highlight"
  | "interactive"
  | "reveal";

type DemoStore = {
  flowState: FlowState;
  currentIndex: number;
  focus: "scene" | "timeline" | "insight" | "reveal";

  setFocus: (focus: "scene" | "timeline" | "insight" | "reveal") => void;
  setFlowState: (s: FlowState) => void;
  setCurrentIndex: (i: number) => void;
};

export const useDemoStore = create<DemoStore>((set) => ({
  flowState: "landing",
  currentIndex: 0,
  focus: "scene",

  setFocus: (focus) => set(() => ({ focus })),
  setFlowState: (flowState) => set({ flowState }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
}));
