"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalMatchAmbiguityPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_match_ambiguity",
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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
          Historical Match Ambiguity
        </h1>

        <p
          style={{
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Historical Match Ambiguity occurs when a temporal join produces
          multiple valid matches for the same business event or reporting row.
        </p>

        <section
          style={{
            marginTop: 40,
            display: "grid",
            gap: 28,
          }}
        >
          <div>
            <h2 style={{ color: "#fff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Temporal joins usually assume that one record on the left side
              matches exactly one record on the right side.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              In practice, overlapping histories, duplicated source records or
              competing timelines can create multiple valid matches.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The join becomes ambiguous because more than one historical record
              satisfies the join conditions.
            </p>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Example</h2>

            <div
              style={{
                background: "rgba(15,23,42,0.7)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.3)",
              }}
            >
              <p>Contract Event</p>

              <ul>
                <li>Mutation on May 15</li>
              </ul>

              <p>Matching Customer History</p>

              <ul>
                <li>Customer Version A (Jan–Jun)</li>
                <li>Customer Version B (Apr–Dec)</li>
              </ul>

              <p>
                The event matches both records and the join cannot determine
                which version should be selected.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Duplicate fact rows</li>
              <li>Join explosions</li>
              <li>Incorrect aggregations</li>
              <li>Non-deterministic reporting</li>
              <li>Unstable KPI calculations</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>State ↔ State Alignment</li>
              <li>State ↔ Event Alignment</li>
              <li>SCD2 dimensions</li>
              <li>Relationship history tables</li>
              <li>Cross-system temporal joins</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Common Root Causes</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Historical overlaps</li>
              <li>Duplicate business keys</li>
              <li>Incomplete temporal predicates</li>
              <li>Competing source histories</li>
              <li>Incorrect join cardinality assumptions</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Count matches per joined row</li>
              <li>Detect temporal cardinality violations</li>
              <li>Validate one-to-one assumptions</li>
              <li>Identify overlapping candidate records</li>
              <li>Analyze temporal join paths</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical Match Ambiguity is often hidden because every
              individual source table appears valid on its own.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The problem only becomes visible when histories are aligned and
              multiple candidate matches appear.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              This is one of the most common causes of duplicate facts and
              unexpected reporting growth in temporal data platforms.
            </p>
          </div>
        </section>

        <RelatedPatterns current="historical_match_ambiguity" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_match_ambiguity",
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

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "Historical Overlap",
      href: "/learn/historical-overlap",
      key: "historical_overlap",
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
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
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