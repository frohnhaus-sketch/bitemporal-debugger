"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function TemporalConformancePage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "temporal_conformance",
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
            ALIGNMENT PATTERN
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
          Temporal Conformance
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Temporal Conformance aligns competing timelines from multiple source
          systems into one consistent historical reporting model.
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
              Different source systems often describe the same business entity
              with different historical timelines.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A CRM system may know about a customer change on one date, while a
              policy system, billing system or product system represents related
              changes on different dates.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Temporal Conformance is the process of deciding how these
              timelines should be aligned for reporting.
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
                Customer timeline from CRM
              </p>

              <ul>
                <li>Customer segment changes on April 1</li>
              </ul>

              <p style={{ fontWeight: 900 }}>
                Contract timeline from policy system
              </p>

              <ul>
                <li>Contract status changes on April 15</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Billing timeline</p>

              <ul>
                <li>Premium adjustment becomes visible on May 1</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                A reporting model must decide which timeline drives the
                snapshot, which dates are used for joins and which changes are
                allowed to affect a historical report.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Cross-system timeline drift</li>
              <li>Inconsistent reporting dates</li>
              <li>Incorrect temporal joins</li>
              <li>Late or corrected history changing past reports</li>
              <li>Different systems producing different historical truths</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>CRM + ERP integrations</li>
              <li>Policy systems + billing systems</li>
              <li>Customer master + contract systems</li>
              <li>Databricks or Fabric lakehouse gold layers</li>
              <li>Cross-system snapshot reporting</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Decisions</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Choose the driving timeline for the reporting model</li>
              <li>Separate business-valid time from system-visible time</li>
              <li>Define which source owns each historical attribute</li>
              <li>Resolve conflicting state changes across systems</li>
              <li>Document which history corrections affect published reports</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Compare effective dates across source systems</li>
              <li>Detect temporal gaps after cross-system joins</li>
              <li>Detect ambiguous cross-system matches</li>
              <li>Validate snapshot reproducibility</li>
              <li>Check whether source corrections change historical outputs</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Temporal Conformance is often where historical modeling becomes
              architecture rather than simple SCD2 implementation.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The hardest question is not whether a source is historized, but
              how multiple histories should behave together.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without temporal conformance, different reports can answer the
              same historical question using different timelines.
            </p>
          </div>
        </section>

        <RelatedPatterns current="temporal_conformance" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "temporal_conformance",
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
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
    },
    {
      title: "Historical Match Ambiguity",
      href: "/learn/historical-match-ambiguity",
      key: "historical_match_ambiguity",
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