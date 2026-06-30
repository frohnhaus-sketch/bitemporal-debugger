"use client";

import { useSketch } from "../useSketch";

export function ThinkingPanel() {
  const { sources, goal } = useSketch();

  const hasHistoricalSource = sources.some((s) => s.historical);
  const hasMultipleSources = sources.length >= 2;

  if (!goal || !hasHistoricalSource || !hasMultipleSources) return null;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 18,
        borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div style={{ color: "#c4b5fd", fontWeight: 800 }}>
        If I were debugging this architecture...
      </div>

      <div
        style={{ marginTop: 14, display: "grid", gap: 12, lineHeight: 1.45 }}
      >
        <div>Could customer updates change old reports?</div>
        <div>Can you reproduce last month&apos;s report?</div>
        <div>Could late corrections rewrite published KPIs?</div>
      </div>
    </div>
  );
}
