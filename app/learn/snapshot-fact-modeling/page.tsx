"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function SnapshotFactModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "snapshot_fact_modeling",
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
            REPORTING PATTERN
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
          Snapshot Fact Modeling
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Snapshot Fact Modeling creates reproducible fact rows for fixed
          reporting dates such as month-end, quarter-end or daily snapshots.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Operational systems usually store events, current state or
              historized records, but reporting often asks for a stable view at
              a fixed reporting date.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Business users ask questions like: how many active contracts did
              we have at month-end, what was the portfolio value on December
              31, or which customers belonged to each segment at quarter-end?
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Snapshot Fact Modeling turns historical source behavior into one
              fact row per entity and reporting snapshot.
            </p>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Example</h2>

            <div
              style={{
                background: "rgba(15,23,42,0.7)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.3)",
              }}
            >
              <p style={{ marginTop: 0, fontWeight: 900 }}>Contract snapshots</p>

              <ul>
                <li>Contract C1 active on January 31</li>
                <li>Contract C1 active on February 28</li>
                <li>Contract C1 cancelled before March 31</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Snapshot fact rows</p>

              <ul>
                <li>C1 · 2026-01-31 · Active · Premium = 100</li>
                <li>C1 · 2026-02-28 · Active · Premium = 100</li>
                <li>C1 · 2026-03-31 · Cancelled · Premium = 0</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The fact table stores the reporting state for each snapshot
                date, making month-end reporting stable and repeatable.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Missing snapshot dates</li>
              <li>Duplicate fact rows per entity and snapshot</li>
              <li>Late-arriving data changing old snapshots</li>
              <li>Using current dimensions for historical snapshots</li>
              <li>Different teams using different snapshot definitions</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Month-end portfolio reporting</li>
              <li>Active contract or policy counts</li>
              <li>Customer balances and account positions</li>
              <li>Insurance exposure and premium reporting</li>
              <li>Gold layer fact table construction</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Define required snapshot dates explicitly</li>
              <li>Resolve entity state as of each snapshot date</li>
              <li>Join dimensions using historical as-of logic</li>
              <li>Persist one fact row per entity and snapshot date</li>
              <li>Decide whether snapshots are rebuilt or frozen after publication</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate one row per entity per snapshot date</li>
              <li>Detect missing snapshot coverage</li>
              <li>Compare snapshot totals against source or published reports</li>
              <li>Check dimension coverage for every snapshot fact row</li>
              <li>Validate reproducibility after source corrections</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Snapshot facts are often the bridge between complex historical
              source behavior and simple business reporting.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              They make recurring reporting dates explicit, reduce repeated
              as-of logic and create a stable basis for KPIs.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without clear snapshot fact modeling, the same historical question
              may produce different results depending on when and how the query
              is rebuilt.
            </p>
          </div>
        </section>

        <RelatedPatterns current="snapshot_fact_modeling" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "snapshot_fact_modeling",
              cta: "open_workbench",
            });
          }}
          style={{
            display: "inline-flex",
            marginTop: 30,
            padding: "12px 18px",
            borderRadius: 12,
            background: "#2563eb",
            color: "#ffffff",
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
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Event-to-State Projection",
      href: "/learn/event-to-state-projection",
      key: "event_to_state_projection",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
    },
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
    {
      title: "Historical Backfill",
      href: "/learn/historical-backfill",
      key: "historical_backfill",
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