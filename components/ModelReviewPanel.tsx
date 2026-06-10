"use client";

import { track } from "@/lib/analytics";
import { useEffect, useMemo, useState } from "react";
import { reviewModelText } from "@/lib/modelReview";

export function ModelReviewPanel() {
  const [input, setInput] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const review = useMemo(() => {
    if (!input.trim()) return null;
    return reviewModelText(input);
  }, [input]);

  useEffect(() => {
    if (!review) return;

    track("model_review_completed", {
      patternCount: review.detectedPatterns.length,
      decisionCount: review.detectedDecisions.length,
      findingCount: review.findings.length,
      recommendation: review.architectureSummary.outputType,
      complexity: review.architectureSummary.complexity,
      inputLength: input.length,
    });
  }, [review, input.length]);

  async function copyReport() {
    if (!review) return;
  
    track("model_review_report_copied", {
      findingCount: review.findings.length,
      patternCount: review.detectedPatterns.length,
    });
  
    await navigator.clipboard.writeText(review.markdownReport);
    setCopyState("copied");
  
    window.setTimeout(() => {
      setCopyState("idle");
    }, 2000);
  }

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#2563eb",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 8,
        }}
      >
        Historical Model Review
      </div>

      <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
        Review an existing model
      </h2>

      <p style={{ color: "#475569", marginTop: 0, marginBottom: 18 }}>
        Paste SQL, PySpark, dbt model code or notebook text to understand the
        historical architecture, detected modeling decisions and potential
        review questions.
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste SQL, PySpark, dbt model or notebook text here..."
        style={{
          width: "100%",
          minHeight: 220,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 1.5,
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />

      {!review && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          The review will appear after you paste model logic.
        </div>
      )}

      {review && (
        <>
          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 14,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.7,
                color: "#1d4ed8",
                marginBottom: 6,
              }}
            >
              Historical Architecture Summary
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              {review.architectureSummary.outputType}
            </div>

            <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.5 }}>
              {review.architectureSummary.explanation}
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "#334155" }}>
              <strong>Source behavior:</strong>{" "}
              {review.architectureSummary.sourceBehavior}
            </div>

            <div style={{ marginTop: 6, fontSize: 13, color: "#334155" }}>
              <strong>Complexity:</strong>{" "}
              {review.architectureSummary.complexity}
            </div>

            {review.architectureSummary.mainOperations.length > 0 && (
              <>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  <strong>Detected operations:</strong>
                </div>

                <ChipRow
                  items={review.architectureSummary.mainOperations}
                  background="#ffffff"
                  border="#bfdbfe"
                  color="#1d4ed8"
                />
              </>
            )}
          </div>

          {review.detectedDecisions.length > 0 && (
            <ReviewSectionTitle title="Detected Modeling Decisions" />
          )}

          {review.detectedDecisions.length > 0 && (
            <ChipRow
              items={review.detectedDecisions}
              background="#ecfdf5"
              border="#86efac"
              color="#166534"
            />
          )}

          {review.findings.length > 0 && (
            <>
              <ReviewSectionTitle title="Review Observations" />

              <div style={{ display: "grid", gap: 12 }}>
                {review.findings.slice(0, 3).map((finding) => (
                  <div
                    key={finding.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color:
                          finding.severity === "high"
                            ? "#b91c1c"
                            : finding.severity === "medium"
                            ? "#92400e"
                            : "#475569",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {finding.severity} observation
                    </div>

                    <div style={{ fontWeight: 900, marginBottom: 6 }}>
                      {finding.title}
                    </div>

                    <div
                      style={{
                        color: "#475569",
                        fontSize: 14,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {finding.risk}
                    </div>

                    <div
                      style={{
                        color: "#0f172a",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>Review question:</strong>{" "}
                      {finding.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {review.detectedPatterns.length > 0 && (
            <>
              <ReviewSectionTitle title="Detected Patterns" />

              <ChipRow
                items={review.detectedPatterns}
                background="#eff6ff"
                border="#bfdbfe"
                color="#1d4ed8"
              />
            </>
          )}

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: 0.7,
                marginBottom: 6,
              }}
            >
              Review Report
            </div>

            <p
              style={{
                margin: "0 0 14px",
                color: "#475569",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Copy a Markdown review report for documentation, implementation
              review or follow-up work.
            </p>

            <button
              type="button"
              onClick={copyReport}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "#2563eb",
                color: "#ffffff",
                border: "1px solid #1d4ed8",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              {copyState === "copied" ? "Copied Review Report" : "Copy Review Report"}
            </button>

            <details style={{ marginTop: 14 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Preview Report
              </summary>

              <pre
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 10,
                  background: "#0f172a",
                  color: "#e2e8f0",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {review.markdownReport}
              </pre>
            </details>
          </div>
        </>
      )}
    </section>
  );
}

function ReviewSectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        marginTop: 18,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 800,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {title}
    </div>
  );
}

function ChipRow({
  items,
  background,
  border,
  color,
}: {
  items: string[];
  background: string;
  border: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background,
            border: `1px solid ${border}`,
            color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}