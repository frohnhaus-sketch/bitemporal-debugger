"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

import { AdvisorPanel } from "@/components/AdvisorPanel";
import { ModelReviewPanel } from "@/components/ModelReviewPanel";
import { TargetTableValidationPanel } from "@/components/TargetTableValidationPanel";
import { TwoSourceValidationWorkflow } from "@/components/TwoSourceValidationWorkflow";
import { Footer } from "@/components/Footer";

import { track } from "@/lib/analytics";

const COMMON_PROBLEMS = [
  {
    title: "Snapshot Reproducibility",
    text: "Can you reproduce last year's report after history changed?",
  },
  {
    title: "Dimension Completion",
    text: "Does dimension history fully cover fact history?",
  },
  {
    title: "Historical Match Ambiguity",
    text: "Can one record match multiple historical versions?",
  },
  {
    title: "Temporal Conformance",
    text: "Do multiple systems disagree on historical truth?",
  },
  {
    title: "State ↔ Event Alignment",
    text: "Can events be mapped to the correct historical state?",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "1",
    title: "Design the model",
    text: "Generate a historical modeling blueprint before implementation.",
  },
  {
    step: "2",
    title: "Review the implementation",
    text: "Paste SQL, PySpark, dbt or notebook code and detect modeling patterns.",
  },
  {
    step: "3",
    title: "Validate the result",
    text: "Check the generated target table for historical modeling risks.",
  },
];

const TOPIC_TAGS = [
  "SCD2",
  "Snapshots",
  "Temporal Joins",
  "Late Arriving Dimensions",
  "Historical Validation",
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    track("page_view", {
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: isMobile ? "18px 10px" : "44px 40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1320,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <section style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
              gap: 36,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#075985",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  marginBottom: 16,
                }}
              >
                HISTORICAL DATA MODELING WORKBENCH
              </div>

              <h1
                style={{
                  margin: 0,
                  maxWidth: 880,
                  fontSize: isMobile ? 38 : 60,
                  lineHeight: 1.02,
                  letterSpacing: "-0.06em",
                  color: "#ffffff",
                }}
              >
                Design, review and validate historical data models.
              </h1>

              <p
                style={{
                  margin: "18px 0 0",
                  maxWidth: 780,
                  fontSize: isMobile ? 17 : 21,
                  lineHeight: 1.5,
                  color: "#dbeafe",
                }}
              >
                A practical workbench for Data Engineers working with SCD2
                dimensions, bitemporal history, snapshot reporting,
                late-arriving data and temporal joins.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 22,
                }}
              >
                {TOPIC_TAGS.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(219, 234, 254, 0.14)",
                      border: "1px solid rgba(191, 219, 254, 0.28)",
                      color: "#dbeafe",
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(15, 23, 42, 0.58)",
                border: "1px solid rgba(148, 163, 184, 0.32)",
                borderRadius: 20,
                padding: 22,
                boxShadow: "0 26px 80px rgba(0,0,0,0.32)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#93c5fd",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Workflow
              </div>

              {WORKFLOW_STEPS.map((item, index) => (
                <div
                  key={item.step}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingBottom: index === WORKFLOW_STEPS.length - 1 ? 0 : 16,
                    marginBottom: index === WORKFLOW_STEPS.length - 1 ? 0 : 16,
                    borderBottom:
                      index === WORKFLOW_STEPS.length - 1
                        ? "none"
                        : "1px solid rgba(148, 163, 184, 0.22)",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background:
                        "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      flexShrink: 0,
                      boxShadow: "0 8px 18px rgba(37,99,235,0.35)",
                    }}
                  >
                    {item.step}
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        color: "#dbeafe",
                        fontSize: 13,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: 18,
            padding: isMobile ? 16 : 20,
            borderRadius: 18,
            background: "rgba(15, 23, 42, 0.56)",
            border: "1px solid rgba(148, 163, 184, 0.28)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: isMobile ? "flex-start" : "flex-end",
              flexDirection: isMobile ? "column" : "row",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#93c5fd",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Common historical modeling problems
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: isMobile ? 24 : 30,
                  letterSpacing: "-0.03em",
                }}
              >
                The same issues appear across SCD2, snapshots and temporal
                joins.
              </h2>
            </div>

            <div
              style={{
                maxWidth: 420,
                color: "#cbd5e1",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              The Advisor uses recurring historical modeling patterns to
              recommend an architecture and validation strategy before
              implementation.
            </div>
            <a
              href="/patterns"
              style={{
                color: "#1d4ed8",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              View Pattern Catalog →
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(5, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {COMMON_PROBLEMS.map((problem) => (
              <div
                key={problem.title}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(2, 6, 23, 0.58)",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                  minHeight: 118,
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: 14,
                    lineHeight: 1.25,
                    marginBottom: 8,
                  }}
                >
                  {problem.title}
                </div>

                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: 12,
                    lineHeight: 1.45,
                  }}
                >
                  {problem.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            marginBottom: 18,
            padding: isMobile ? 14 : "16px 20px",
            borderRadius: 16,
            background:
              "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #93c5fd",
            color: "#075985",
            fontSize: 14,
            lineHeight: 1.5,
            fontWeight: 800,
            boxShadow: "0 14px 38px rgba(15, 23, 42, 0.16)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "#2563eb",
              color: "#ffffff",
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            i
          </div>

          <div>
            Start with the Advisor, review existing model logic, then validate
            the generated historical table.
            <br />
            <span style={{ fontWeight: 600 }}>
              Use the source comparison workflow only when you need row-level
              timeline evidence.
            </span>
          </div>
        </div>

        <AdvisorPanel />

        <ModelReviewPanel />

        <TargetTableValidationPanel />

        <TwoSourceValidationWorkflow />

        <Footer />
      </div>

      <Analytics />
    </main>
  );
}