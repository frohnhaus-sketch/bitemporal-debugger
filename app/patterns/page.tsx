"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

const PATTERN_GROUPS = [
  {
    title: "Foundations",
    description: "Basic building blocks of historical data models.",
    patterns: [
      {
        name: "State Modeling",
        text: "Represents the state of a business entity over a valid time interval.",
        examples: ["Customer", "Contract", "Policy", "Product"],
      },
      {
        name: "Event Modeling",
        text: "Represents discrete business events that happened at a point in time.",
        examples: ["Order created", "Claim filed", "Payment received"],
      },
      {
        name: "Bitemporal Modeling",
        text: "Separates business-valid time from system-visible time.",
        examples: ["Corrected history", "Audit reporting", "As-known reporting"],
      },
    ],
  },
  {
    title: "Alignment Patterns",
    description: "Patterns for connecting histories across sources.",
    patterns: [
      {
        name: "State ↔ State Alignment",
        text: "Joins two historized state sources across overlapping time intervals.",
        examples: ["Contract ↔ Customer", "Product ↔ Price"],
      },
      {
        name: "State ↔ Event Alignment",
        text: "Maps events to the state that was valid when the event happened.",
        examples: ["Claim ↔ Policy", "Mutation ↔ Contract"],
      },
      {
        name: "Temporal Conformance",
        text: "Aligns competing timelines from multiple source systems.",
        examples: ["CRM + ERP", "Policy system + billing system"],
      },
    ],
  },
  {
    title: "Dimension Patterns",
    description: "Patterns for historized dimensions and relationships.",
    patterns: [
      {
        name: "Dimension Completion",
        text: "Ensures dimension history covers all required fact periods.",
        examples: ["Late arriving dimensions", "Missing foreign keys"],
      },
      {
        name: "Relationship History",
        text: "Models relationships that change over time.",
        examples: ["Customer ↔ Advisor", "Policy ↔ Broker"],
      },
      {
        name: "Identity Resolution",
        text: "Resolves multiple identifiers for the same business entity.",
        examples: ["Customer merge", "Contract migration"],
      },
    ],
  },
  {
    title: "Reporting Patterns",
    description: "Patterns for reproducible historical reporting.",
    patterns: [
      {
        name: "Snapshot Reproducibility",
        text: "Ensures reports can be reproduced for the same reporting date.",
        examples: ["Month-end snapshots", "Audit reports"],
      },
      {
        name: "Historical Backfill",
        text: "Reconstructs history after data already exists.",
        examples: ["CDC replay", "Historical reload"],
      },
      {
        name: "Historical Correction",
        text: "Preserves corrected history without losing what was known before.",
        examples: ["Backdated changes", "Restatements"],
      },
    ],
  },
  {
    title: "Data Quality Patterns",
    description: "Patterns for detecting historical modeling risks.",
    patterns: [
      {
        name: "Historical Match Ambiguity",
        text: "Occurs when multiple historical records satisfy the same join.",
        examples: ["Duplicate fact rows", "Join explosion"],
      },
      {
        name: "Historical Coverage Gap",
        text: "Occurs when required history is missing for a reporting period.",
        examples: ["Missing dimension row", "Uncovered fact interval"],
      },
      {
        name: "Historical Overlap",
        text: "Occurs when multiple records are active at the same time.",
        examples: ["Overlapping SCD2 rows", "Ambiguous current state"],
      },
    ],
  },
];

export default function PatternsPage() {
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    track("patterns_page_opened", {
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);

      [25, 50, 75, 100].forEach((threshold) => {
        if (
          percent >= threshold &&
          !trackedDepths.current.has(threshold)
        ) {
          trackedDepths.current.add(threshold);

          track("scroll_depth", {
            page: "patterns",
            percent: threshold,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: "#bfdbfe",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          ← Back to Workbench
        </a>

        <section style={{ marginTop: 32, marginBottom: 34 }}>
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
            PATTERN CATALOG
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: 900,
              fontSize: "clamp(34px, 10vw, 54px)",
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              color: "#ffffff",
            }}
          >
            Historical Modeling Pattern Catalog
          </h1>

          <p
            style={{
              marginTop: 18,
              maxWidth: 760,
              color: "#dbeafe",
              fontSize: 19,
              lineHeight: 1.55,
            }}
          >
            A practical vocabulary for common problems in SCD2 dimensions,
            snapshots, temporal joins, late-arriving data and historical
            reporting.
          </p>
        </section>

        <div style={{ display: "grid", gap: 22 }}>
          {PATTERN_GROUPS.map((group) => (
            <section
              key={group.title}
              style={{
                background: "rgba(15, 23, 42, 0.58)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: 24,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {group.title}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#cbd5e1",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {group.description}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {group.patterns.map((pattern) => (
                  <article
                    key={pattern.name}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      borderRadius: 14,
                      padding: 16,
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 17,
                        color: "#0f172a",
                      }}
                    >
                      {pattern.name}
                    </h3>

                    <p
                      style={{
                        margin: "8px 0 12px",
                        color: "#475569",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {pattern.text}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {pattern.examples.map((example) => (
                        <span
                          key={example}
                          style={{
                            padding: "5px 8px",
                            borderRadius: 999,
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#1d4ed8",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}