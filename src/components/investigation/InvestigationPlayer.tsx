"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InvestigationPlayerProps,
  InvestigationStepStatus,
} from "./investigationTypes";

export function InvestigationPlayer({
  title,
  subtitle,
  steps,
  conclusion,
  evidence,
  recommendations,
  technicalDetails,
  stepDurationMs = 700,
}: InvestigationPlayerProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [phase, setPhase] = useState<"investigating" | "result">(
    "investigating"
  );

  useEffect(() => {
    if (phase !== "investigating") return;

    if (activeStepIndex >= steps.length) {
      const timeout = window.setTimeout(() => {
        setPhase("result");
      }, 300);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setActiveStepIndex((current) => current + 1);
    }, stepDurationMs);

    return () => window.clearTimeout(timeout);
  }, [activeStepIndex, phase, stepDurationMs, steps.length]);

  const stepStatuses = useMemo<InvestigationStepStatus[]>(() => {
    return steps.map((_, index) => {
      if (index < activeStepIndex) return "done";
      if (index === activeStepIndex) return "active";
      return "pending";
    });
  }, [activeStepIndex, steps]);

  return (
    <section
      style={{
        borderRadius: 24,
        padding: 24,
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))",
        color: "#e5e7eb",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: 8,
          }}
        >
          Historical Investigation
        </div>

        <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              margin: "10px 0 0",
              color: "#cbd5e1",
              maxWidth: 760,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        )}
      </header>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: phase === "result" ? 28 : 0,
        }}
      >
        {steps.map((step, index) => {
          const status = stepStatuses[index];

          return (
            <div
              key={step.id}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr",
                gap: 12,
                alignItems: "start",
                padding: "14px 16px",
                borderRadius: 16,
                border:
                  status === "active"
                    ? "1px solid rgba(96,165,250,0.7)"
                    : "1px solid rgba(148,163,184,0.16)",
                background:
                  status === "active"
                    ? "rgba(37,99,235,0.16)"
                    : status === "done"
                      ? "rgba(15,23,42,0.72)"
                      : "rgba(15,23,42,0.35)",
                opacity: status === "pending" ? 0.45 : 1,
                transition: "all 260ms ease",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  background:
                    status === "done"
                      ? "rgba(34,197,94,0.18)"
                      : status === "active"
                        ? "rgba(59,130,246,0.24)"
                        : "rgba(148,163,184,0.12)",
                  color:
                    status === "done"
                      ? "#86efac"
                      : status === "active"
                        ? "#93c5fd"
                        : "#94a3b8",
                }}
              >
                {status === "done" ? "✓" : status === "active" ? "…" : index + 1}
              </div>

              <div>
                <div style={{ fontWeight: 650 }}>{step.label}</div>

                {step.detail && status !== "pending" && (
                  <div
                    style={{
                      marginTop: 4,
                      color: "#94a3b8",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {phase === "result" && (
        <div
          style={{
            display: "grid",
            gap: 18,
            animation: "investigationResultIn 420ms ease both",
          }}
        >
          <ResultSection title="Conclusion">{conclusion}</ResultSection>

          {evidence && <ResultSection title="Evidence">{evidence}</ResultSection>}

          {recommendations && (
            <ResultSection title="Recommendations">
              {recommendations}
            </ResultSection>
          )}

          {technicalDetails && (
            <details
              style={{
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.2)",
                padding: 16,
                background: "rgba(15,23,42,0.45)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  color: "#cbd5e1",
                  fontWeight: 600,
                }}
              >
                Technical details
              </summary>

              <div style={{ marginTop: 16 }}>{technicalDetails}</div>
            </details>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes investigationResultIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        borderRadius: 18,
        border: "1px solid rgba(148,163,184,0.2)",
        background: "rgba(15,23,42,0.58)",
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#94a3b8",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {children}
    </section>
  );
}