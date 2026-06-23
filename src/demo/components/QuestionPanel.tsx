"use client";

import { useDemoStore } from "@/state/demoStore";

export function QuestionPanel() {
  const { currentIndex } = useDemoStore();

  if (currentIndex < 2) return null;

  return (
    <div
      style={{
        marginTop: 40,
        padding: 28,
        borderRadius: 16,
        background: "rgba(255,0,0,0.05)",
        border: "1px solid rgba(255,0,0,0.2)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6 }}>Historical query</div>

      <h3 style={{ fontSize: 22, marginTop: 8 }}>
        What was the address in March?
      </h3>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.6 }}>System answer</div>

        <div style={{ fontSize: 28, color: "#ff4d4d" }}>Zurich ❌</div>
      </div>

      <div style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>
        Because only the latest state is stored.
      </div>
    </div>
  );
}
