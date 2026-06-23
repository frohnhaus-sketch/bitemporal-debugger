"use client";

import { useDemoStore } from "@/state/demoStore";
import { customerChangeScenario } from "../scenarios/customerChangeScenario";

export function SceneRenderer() {
  const { currentIndex, focus } = useDemoStore();
  const state = customerChangeScenario[currentIndex];

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: focus === "scene" ? 1 : 0.25,
        transform: focus === "scene" ? "scale(1)" : "scale(0.98)",
        transition: "all 400ms ease",
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: 0.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Historical change event
      </div>

      <h2 style={{ fontSize: 28, margin: "12px 0" }}>
        Customer lifecycle
      </h2>

      <div
        style={{
          fontSize: 18,
          opacity: 0.9,
          transition: "all 300ms ease",
        }}
      >
        {state.event}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "rgba(255,255,255,0.6)",
          fontSize: 16,
        }}
      >
        {state.address}
      </div>
    </div>
  );
}