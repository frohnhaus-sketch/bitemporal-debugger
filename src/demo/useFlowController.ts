"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/state/demoStore";

export function useFlowController() {
  const flowState = useDemoStore((s) => s.flowState);
  const setFlowState = useDemoStore((s) => s.setFlowState);
  const setCurrentIndex = useDemoStore((s) => s.setCurrentIndex);
  const setFocus = useDemoStore((s) => s.setFocus);

  useEffect(() => {
    if (flowState !== "loading_demo") return;

    setCurrentIndex(0);
    setFocus("scene");

    const t = setTimeout(() => {
      setFlowState("investigation");
    }, 500);

    return () => clearTimeout(t);
  }, [flowState, setFlowState, setCurrentIndex, setFocus]);
}