"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function RelationshipHistoryPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "relationship_history",
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
            DIMENSION PATTERN
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
          Relationship History
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Relationship History models associations between business entities
          that change over time.
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
              Most historical models focus on entities such as customers,
              contracts or products.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              However, the relationships between these entities often change
              over time as well.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A customer may switch advisors. A policy may move to a different
              broker. An employee may change departments.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical reporting requires not only the correct entity state
              but also the correct relationship state.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>Policy P123</p>

              <ul>
                <li>Broker A (Jan–Jun)</li>
                <li>Broker B (Jul–Dec)</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Snapshot Date: August 31</p>

              <p style={{ marginBottom: 0 }}>
                Historical reporting must attribute the policy to Broker B, not
                Broker A.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Reporting against current relationships</li>
              <li>Missing relationship history</li>
              <li>Overlapping assignments</li>
              <li>Relationship gaps</li>
              <li>Incorrect historical attribution</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Customer ↔ Advisor</li>
              <li>Policy ↔ Broker</li>
              <li>Employee ↔ Department</li>
              <li>Contract ↔ Sales Organization</li>
              <li>Account ↔ Relationship Manager</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Historized relationship tables</li>
              <li>SCD2 relationship dimensions</li>
              <li>Bridge tables with validity periods</li>
              <li>Bitemporal relationship tracking</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical attribution is often more important than the entity
              itself.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Commission reporting, portfolio reporting and organizational KPIs
              all depend on knowing which relationship was active at a specific
              point in time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Ignoring relationship history can produce historically incorrect
              reports even when all dimensions are perfectly historized.
            </p>
          </div>
        </section>

        <RelatedPatterns current="relationship_history" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "relationship_history",
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
        {patterns.map((pattern) => (
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