"use client";

import { useSketch } from "../useSketch";
import { goalLabel } from "../sketchQuestions";
import { PipelineNode } from "./PipelineNode";
import { PipelineEdge } from "./PipelineEdge";

export function PipelineCanvas() {
  const { goal, sources } = useSketch();

  const hasHistoricalSource = sources.some((s) => s.historical);
  const hasMultipleSources = sources.length >= 2;
  const showHistoricalJoin = hasHistoricalSource && hasMultipleSources;

  return (
    <div
      style={{
        height: "100%",
        minHeight: 560,
        borderRadius: 28,
        padding: 34,
        background:
          "radial-gradient(circle at 50% 10%, rgba(124,58,237,0.22), transparent 38%), rgba(15,23,42,0.72)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {!goal && (
        <div style={{ textAlign: "center", opacity: 0.45 }}>
          <div style={{ fontSize: 54 }}>○</div>
          <div style={{ marginTop: 12 }}>Your pipeline will appear here</div>
        </div>
      )}

      {goal && (
        <div
          style={{
            display: "grid",
            gap: 18,
            justifyItems: "center",
            width: "100%",
            maxWidth: 760,
          }}
        >
          {sources.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 18,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {sources.map((source) => (
                <PipelineNode
                  key={source.id}
                  label={source.label}
                  historical={source.historical}
                  active={source.historical}
                />
              ))}
            </div>
          )}

          {sources.length > 0 && (
            <PipelineEdge label={showHistoricalJoin ? "Historical join" : undefined} />
          )}

          <PipelineNode
            label={goalLabel(goal)}
            icon={goal === "historical-report" ? "🕒" : "📊"}
            active
          />

          {showHistoricalJoin && (
            <div
              style={{
                marginTop: 18,
                padding: 18,
                borderRadius: 18,
                background: "rgba(251,191,36,0.10)",
                border: "1px solid rgba(251,191,36,0.25)",
                color: "#fde68a",
                maxWidth: 520,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              This architecture combines historical data sources. The first thing
              I would investigate is whether updates can change old reports.
            </div>
          )}
        </div>
      )}
    </div>
  );
}