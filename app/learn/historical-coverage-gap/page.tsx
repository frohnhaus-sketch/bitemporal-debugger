"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalCoverageGapPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_coverage_gap",
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
        <div style={{ marginBottom: 28 }}>
          <a
            href="/patterns"
            style={{
              display: "inline-flex",
              color: "#bfdbfe",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 22,
            }}
          >
            ← Back to Pattern Catalog
          </a>
        
          <br />
        
          <div
            style={{
              display: "inline-flex",
              padding: "8px 12px",
              borderRadius: 999,
              background: "#dbeafe",
              color: "#075985",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 0.6,
            }}
          >
            DATA QUALITY PATTERN
          </div>
        </div>

        <h1
          style={{
            margin: "0 0 16px 0",
            fontSize: "clamp(34px, 8vw, 56px)",
            lineHeight: 1,
            color: "#ffffff",
            letterSpacing: "-0.05em",
          }}
        >
          Historical Coverage Gap
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          A Historical Coverage Gap occurs when a required historical period has
          no valid record.
        </p>

        <section style={{ marginTop: 30, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#fff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical models often assume that every required period is
              covered by at least one valid record.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              But in real source systems, histories are often incomplete.
              Records may start too late, end too early or contain missing
              intervals.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              When reporting depends on a missing period, joins fail, facts lose
              attributes or snapshots become incomplete.
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
              <p>Customer dimension history:</p>

              <ul>
                <li>Customer C1 valid Jan–Mar</li>
                <li>Customer C1 valid May–Dec</li>
              </ul>

              <p>Missing period:</p>

              <ul>
                <li>April has no valid customer row</li>
              </ul>

              <p>
                Any April snapshot or April fact requiring this customer
                dimension will fail coverage validation.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Missing dimension attributes</li>
              <li>Dropped fact rows</li>
              <li>Incomplete snapshots</li>
              <li>Incorrect point-in-time joins</li>
              <li>Silent reporting gaps</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>SCD2 dimensions</li>
              <li>Historized customer or product tables</li>
              <li>Relationship histories</li>
              <li>Snapshot reporting models</li>
              <li>Cross-system joins</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Detect gaps between valid_to and next valid_from</li>
              <li>Check fact periods against dimension coverage</li>
              <li>Validate snapshot completeness</li>
              <li>Check required reporting periods per entity</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#fff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical gaps are easy to miss because each individual record
              can look valid.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The problem only appears when the model is queried for a missing
              period or joined against another historical source.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Coverage validation makes these gaps visible before they create
              incorrect reports.
            </p>
          </div>
        </section>

    <RelatedPatterns current="historical_coverage_gap" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_coverage_gap",
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
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
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