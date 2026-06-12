"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalOverlapPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_overlap",
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
        padding: "48px 24px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <a
          href="/patterns"
          style={{
            color: "#bfdbfe",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          ← Back to Pattern Catalog
        </a>

        <div
          style={{
            marginTop: 28,
            display: "inline-flex",
            padding: "8px 12px",
            borderRadius: 999,
            background: "#dbeafe",
            color: "#075985",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          DATA QUALITY PATTERN
        </div>

        <h1
          style={{
            marginTop: 20,
            marginBottom: 16,
            fontSize: "clamp(34px, 8vw, 56px)",
            lineHeight: 1,
            color: "#ffffff",
            letterSpacing: "-0.05em",
          }}
        >
          Historical Overlap
        </h1>

        <p
          style={{
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          A Historical Overlap occurs when multiple records are valid for the
          same business entity at the same point in time.
        </p>

        <section
          style={{
            marginTop: 40,
            display: "grid",
            gap: 28,
          }}
        >
          <div>
            <h2 style={{ color: "#fff" }}>
              The Problem
            </h2>

            <p style={{ lineHeight: 1.8 }}>
              Historized data models typically assume that a business entity has
              exactly one valid state at any reporting date.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              When validity intervals overlap, multiple states become active at
              the same time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical joins, snapshots and aggregations can no longer
              determine a single historical truth.
            </p>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>
              Example
            </h2>

            <div
              style={{
                background: "rgba(15,23,42,0.7)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.3)",
              }}
            >
              <p>
                Customer C1
              </p>

              <ul>
                <li>Segment = Retail (Jan–Jun)</li>
                <li>Segment = Premium (Apr–Dec)</li>
              </ul>

              <p>
                Overlap:
              </p>

              <ul>
                <li>April–June has two active states</li>
              </ul>

              <p>
                A report for May cannot uniquely determine which segment should
                be used.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>
              Typical Risks
            </h2>

            <ul
              style={{
                lineHeight: 2,
              }}
            >
              <li>Duplicate fact rows</li>
              <li>Join ambiguity</li>
              <li>Incorrect aggregations</li>
              <li>Multiple active states</li>
              <li>Unstable reporting results</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>
              Where It Appears
            </h2>

            <ul
              style={{
                lineHeight: 2,
              }}
            >
              <li>SCD2 dimensions</li>
              <li>Customer history</li>
              <li>Contract history</li>
              <li>Relationship history</li>
              <li>Conformed dimensions</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>
              Common Validation Checks
            </h2>

            <ul
              style={{
                lineHeight: 2,
              }}
            >
              <li>Detect overlapping validity intervals</li>
              <li>Validate one active state per reporting date</li>
              <li>Check temporal join cardinality</li>
              <li>Detect duplicate historical matches</li>
              <li>Validate dimension consistency</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>
              Why It Matters
            </h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical overlaps often remain hidden until a temporal join or
              snapshot is executed.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The overlap may look harmless in the source table but can cause
              large reporting errors downstream.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Detecting overlaps early is one of the most important quality
              checks for historized dimensions.
            </p>
          </div>
        </section>

        <RelatedPatterns current="historical_overlap" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_overlap",
              cta: "open_workbench",
            });
          }}
          style={{
            display: "inline-flex",
            marginTop: 40,
            padding: "12px 18px",
            borderRadius: 12,
            background: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Open Historical Modeling Workbench →
        </a>
      </div>
    </main>
  );
}

function RelatedPatterns({
  current,
}: {
  current: string;
}) {
  const patterns = [
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
    {
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
  ];

  return (
    <section
      style={{
        marginTop: 30,
        padding: 24,
        borderRadius: 22,
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.32)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#93c5fd",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 10,
        }}
      >
        Related Patterns
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {patterns
          .filter((pattern) => pattern.key !== current)
          .map((pattern) => (
            <a
              key={pattern.key}
              href={pattern.href}
              onClick={() => {
                track("related_pattern_clicked", {
                  from: current,
                  to: pattern.key,
                });
              }}
              style={{
                display: "inline-flex",
                padding: "9px 12px",
                borderRadius: 999,
                background: "#ffffff",
                color: "#1d4ed8",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              {pattern.title}
            </a>
          ))}
      </div>
    </section>
  );
}