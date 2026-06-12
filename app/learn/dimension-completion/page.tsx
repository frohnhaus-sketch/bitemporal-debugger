"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

const VALIDATION_CHECKS = [
  "Dimension coverage validation",
  "Snapshot completeness validation",
  "Historical gap detection",
  "Late arriving dimension validation",
];

const SOLUTIONS = [
  {
    title: "Backfill",
    text: "Create missing historical dimension records so every required reporting period can find a valid dimension row.",
  },
  {
    title: "Carry Forward",
    text: "Extend the closest known dimension version into uncovered periods when this matches the business meaning.",
  },
  {
    title: "Unknown Member",
    text: "Join missing periods to a synthetic fallback member instead of silently dropping fact rows.",
  },
  {
    title: "Synthetic History",
    text: "Reconstruct historical dimension coverage from events, snapshots or other source evidence.",
  },
];

export default function DimensionCompletionPage() {

  useEffect(() => {
    track("learn_page_opened", {
      page: "dimension_completion",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  function trackWorkbenchClick(source: string) {
    track("learn_cta_clicked", {
      page: "dimension_completion",
      cta: "open_workbench",
      source,
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: "44px 40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <a
          href="/patterns"
          style={{
            color: "#bfdbfe",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          ← Back to Pattern Catalog
        </a>

        <section style={{ marginTop: 34, marginBottom: 30 }}>
          <div
            style={{
              display: "inline-flex",
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
            HISTORICAL MODELING PATTERN
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: 900,
              fontSize: "clamp(36px, 10vw, 62px)",
              lineHeight: 1.02,
              letterSpacing: "-0.06em",
              color: "#ffffff",
            }}
          >
            Dimension Completion
          </h1>

          <p
            style={{
              marginTop: 18,
              maxWidth: 820,
              color: "#dbeafe",
              fontSize: 20,
              lineHeight: 1.55,
            }}
          >
            Dimension Completion ensures that dimension history covers all
            required reporting periods of the fact model.
          </p>
        </section>

        <section
          style={{
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
            boxShadow: "0 22px 60px rgba(15, 23, 42, 0.28)",
          }}
        >
          <SectionEyebrow>Problem</SectionEyebrow>

          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.04em" }}>
            A fact exists, but no valid dimension record exists.
          </h2>

          <p
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 820,
            }}
          >
            This often happens in snapshot reporting, late-arriving dimensions
            or cross-system integrations. The fact row is available for a
            reporting period, but the dimension history does not cover that
            same period.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            {[
              "Missing attributes",
              "Missing joins",
              "Incorrect historical reporting",
              "Unstable snapshots",
            ].map((risk) => (
              <div
                key={risk}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {risk}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.32)",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
          }}
        >
          <SectionEyebrow color="#93c5fd">Example</SectionEyebrow>

          <h2 style={{ margin: 0, color: "#ffffff", fontSize: 28 }}>
            Contract snapshot exists in February. Customer dimension starts in
            April.
          </h2>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gap: 14,
              maxWidth: 820,
            }}
          >
            <TimelineRow
              label="Contract fact"
              before="Jan"
              bar="────────────────────────"
              after="Dec"
              active
            />

            <TimelineRow
              label="Customer dimension"
              before="Jan"
              bar="          ──────────────"
              after="Dec"
              active={false}
            />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 16,
              background: "#020617",
              border: "1px solid #334155",
            }}
          >
            <div style={{ color: "#93c5fd", fontWeight: 900, fontSize: 13 }}>
              Reporting date: February
            </div>

            <p
              style={{
                margin: "8px 0 0",
                color: "#cbd5e1",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              The contract exists, but the customer dimension has no valid row
              yet. Without completion, the snapshot either loses the dimension
              attributes or fails the historical join.
            </p>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
          }}
        >
          <SectionEyebrow>Why it happens</SectionEyebrow>

          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.04em" }}>
            The fact model and dimension model do not have the same historical
            coverage.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 12,
              marginTop: 18,
            }}
          >
            {[
              "Late arriving dimensions",
              "Partial source history",
              "Cross-system integration",
              "Historical backfills",
              "Snapshot reporting requirements",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: 15,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
          }}
        >
          <SectionEyebrow>Typical solutions</SectionEyebrow>

          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.04em" }}>
            Complete the dimension before joining it to the fact model.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
              marginTop: 18,
            }}
          >
            {SOLUTIONS.map((solution) => (
              <div
                key={solution.title}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    color: "#0f172a",
                  }}
                >
                  {solution.title}
                </h3>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#475569",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {solution.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
          }}
        >
          <SectionEyebrow>Validation checks</SectionEyebrow>

          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.04em" }}>
            Before publishing the model, validate historical coverage.
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 18,
            }}
          >
            {VALIDATION_CHECKS.map((check) => (
              <span
                key={check}
                style={{
                  padding: "9px 12px",
                  borderRadius: 999,
                  background: "#ecfeff",
                  border: "1px solid #a5f3fc",
                  color: "#155e75",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                ✓ {check}
              </span>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#dbeafe",
            color: "#0f172a",
            borderRadius: 22,
            padding: 26,
            marginBottom: 22,
            border: "1px solid #93c5fd",
          }}
        >
          <SectionEyebrow color="#1d4ed8">Try it</SectionEyebrow>

          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.04em" }}>
            Use the advisor to map this pattern to your own historical model.
          </h2>

          <p
            style={{
              marginTop: 10,
              color: "#334155",
              fontSize: 15,
              lineHeight: 1.55,
              maxWidth: 760,
            }}
          >
            The Historical Modeling Advisor can recommend modeling strategies,
            risks and validation checks based on your reporting goal, source
            types and historized dimensions.
          </p>

          <a
            href="/"
            onClick={() => trackWorkbenchClick("bottom_cta")}
            style={{
              display: "inline-flex",
              marginTop: 18,
              padding: "13px 16px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 900,
              boxShadow: "0 14px 30px rgba(37, 99, 235, 0.25)",
            }}
          >
            Open Historical Modeling Workbench
          </a>
        </section>
      </div>

      <Analytics />
    </main>
  );
}

function SectionEyebrow({
  children,
  color = "#2563eb",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 900,
        color,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function TimelineRow({
  label,
  before,
  bar,
  after,
  active,
}: {
  label: string;
  before: string;
  bar: string;
  after: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "#cbd5e1",
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          background: active ? "#eff6ff" : "#fff7ed",
          border: active ? "1px solid #bfdbfe" : "1px solid #fed7aa",
          color: active ? "#1d4ed8" : "#9a3412",
          fontFamily: "monospace",
          fontSize: 13,
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {before} {bar} {after}
      </div>
    </div>
  );
}