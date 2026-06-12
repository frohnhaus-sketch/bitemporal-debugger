"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

const VALIDATION_CHECKS = [
  "Snapshot reproducibility validation",
  "As-known reporting validation",
  "Late arriving data validation",
  "Historical correction validation",
];

const SOLUTIONS = [
  {
    title: "Snapshot Facts",
    text: "Persist one fact row per entity and reporting period so month-end reports do not depend on current source state.",
  },
  {
    title: "Visible Time",
    text: "Track when historical records became known so reports can be reproduced as they were seen at the time.",
  },
  {
    title: "Frozen Report State",
    text: "Store the exact reporting state used for published reports when regulatory or audit reproducibility is required.",
  },
  {
    title: "As-Known Joins",
    text: "Join dimensions using both business-valid time and system-visible time to avoid using future knowledge.",
  },
];

export default function SnapshotReproducibilityPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "snapshot_reproducibility",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  function trackWorkbenchClick(source: string) {
    track("learn_cta_clicked", {
      page: "snapshot_reproducibility",
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
            Snapshot Reproducibility
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
            Snapshot Reproducibility ensures that a historical report can be
            rebuilt later and still produce the same result for the same
            reporting period.
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
            The same month-end report produces different numbers when rebuilt
            later.
          </h2>

          <p
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 840,
            }}
          >
            This usually happens when reports are rebuilt from mutable source
            data. Late-arriving records, corrected history, overwritten
            dimensions or changed relationships can alter the result even though
            the reporting date did not change.
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
              "Changing historical totals",
              "Non-reproducible reports",
              "Audit disagreements",
              "Incorrect as-known results",
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
            A March report is published. In June, corrected history changes the
            March result.
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
              label="March report"
              left="Report date: Mar 31"
              center="Published result"
              right="Premium total = 1.2M"
              active
            />

            <TimelineRow
              label="June rebuild"
              left="Same report date"
              center="Corrected history applied"
              right="Premium total = 1.3M"
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
              Reporting date: March 31
            </div>

            <p
              style={{
                margin: "8px 0 0",
                color: "#cbd5e1",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              Both reports ask for the same reporting period, but they use
              different knowledge states. Without visible time or persisted
              snapshot state, the rebuilt report silently uses information that
              was not available when the original report was published.
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
            The model does not separate reporting date from knowledge date.
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
              "Late arriving facts",
              "Corrected source history",
              "SCD1 overwrites",
              "Missing visible time",
              "Changed relationship history",
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
            Decide whether the report should show current truth or what was
            known at the time.
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
            Before publishing the model, validate whether reports can be rebuilt
            consistently.
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
            Use the advisor to design reproducible historical reporting models.
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
  left,
  center,
  right,
  active,
}: {
  label: string;
  left: string;
  center: string;
  right: string;
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
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
          gap: 8,
          padding: "12px 14px",
          borderRadius: 14,
          background: active ? "#eff6ff" : "#fff7ed",
          border: active ? "1px solid #bfdbfe" : "1px solid #fed7aa",
          color: active ? "#1d4ed8" : "#9a3412",
          fontSize: 13,
          overflowX: "auto",
        }}
      >
        <span style={{ fontWeight: 900 }}>{left}</span>
        <span>{center}</span>
        <span style={{ fontWeight: 900 }}>{right}</span>
      </div>
    </div>
  );
}