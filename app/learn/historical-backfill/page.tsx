"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalBackfillPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_backfill",
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
          Historical Backfill
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Historical Backfill reconstructs past states, events or snapshots
          after historical data already exists.
        </p>

        <section
          style={{
            marginTop: 40,
            display: "grid",
            gap: 28,
          }}
        >
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Data platforms often need to recreate history after the original
              reporting periods have already passed.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              This can happen during migrations, CDC replay, source onboarding,
              logic changes or missing historical loads.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The challenge is not only loading old data, but making the
              reconstructed history consistent with the reporting model.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>
                New source onboarding
              </p>

              <ul>
                <li>A contract system is loaded into the lakehouse in June</li>
                <li>Reports require snapshots from January to May</li>
                <li>The source only provides current state plus change events</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Backfill challenge</p>

              <ul>
                <li>Reconstruct historical contract states</li>
                <li>Align dimensions for each month-end snapshot</li>
                <li>Validate that reconstructed periods are complete</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The backfill must create a usable history, not just a large
                historical load.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Incomplete historical coverage</li>
              <li>Reconstructed states that do not match business reality</li>
              <li>Changed snapshot results after backfill</li>
              <li>Incorrect event ordering</li>
              <li>Hidden gaps in historized dimensions</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Databricks or Fabric lakehouse migrations</li>
              <li>CDC replay projects</li>
              <li>Historical source onboarding</li>
              <li>Gold layer rebuilds</li>
              <li>Snapshot fact table creation</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Replay change events into historical state</li>
              <li>Derive month-end snapshots from reconstructed history</li>
              <li>Backfill missing dimension coverage</li>
              <li>Persist reconstructed snapshot facts</li>
              <li>Separate original load date from historical effective date</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate coverage for all required reporting periods</li>
              <li>Detect gaps and overlaps after reconstruction</li>
              <li>Compare rebuilt snapshots against known report totals</li>
              <li>Validate event ordering before deriving state</li>
              <li>Check that late corrections are represented correctly</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical Backfill is where technical migration work becomes a
              historical modeling problem.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A backfill can load data successfully and still produce incorrect
              reporting if temporal coverage, joins and snapshot logic are not
              validated.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The goal is not just to fill the past, but to make the past
              reportable.
            </p>
          </div>
        </section>

        <RelatedPatterns current="historical_backfill" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_backfill",
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
      title: "Historical Correction",
      href: "/learn/historical-correction",
      key: "historical_correction",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
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