"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/state/demoStore";

export function useFlowController() {
  const flowState = useDemoStore((s) => s.flowState);
  const setFlowState = useDemoStore((s) => s.setFlowState);
  const setCurrentIndex = useDemoStore((s) => s.setCurrentIndex);
  const setFocus = useDemoStore((s) => s.setFocus);

  // 1. loading → auto_highlight
  useEffect(() => {
    if (flowState !== "loading_demo") return;

    setCurrentIndex(0);
    setFocus("scene");

    const t = setTimeout(() => {
      setFlowState("auto_highlight");
    }, 800);

    return () => clearTimeout(t);
  }, [flowState, setFlowState, setCurrentIndex, setFocus]);

  // 2. auto_highlight sequence
  useEffect(() => {
    if (flowState !== "auto_highlight") return;

    setCurrentIndex(0);
    setFocus("scene");

    const t1 = setTimeout(() => {
      setCurrentIndex(1);
      setFocus("timeline");
    }, 900);

    const t2 = setTimeout(() => {
      setCurrentIndex(2);
      setFocus("insight");
    }, 1800);

    const t3 = setTimeout(() => {
      setFlowState("reveal");
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [flowState, setFlowState, setCurrentIndex, setFocus]);
}