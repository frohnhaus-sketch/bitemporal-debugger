"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function RectangleDecompositionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "rectangle_decomposition",
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
            ADVANCED PATTERN
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
          Rectangle Decomposition
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Rectangle Decomposition splits overlapping historical attribute
          timelines into non-overlapping reporting intervals.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Complex historical models often combine several attributes that
              change independently over time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A contract, product coverage, price, risk attribute and customer
              relationship may each have their own validity timeline.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Reporting usually needs one consistent set of intervals where all
              relevant attributes are stable at the same time.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>Contract C1</p>

              <ul>
                <li>Status changes on April 1</li>
                <li>Premium changes on June 1</li>
                <li>Coverage changes on September 1</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Decomposed intervals</p>

              <ul>
                <li>Jan–Mar: old status, old premium, old coverage</li>
                <li>Apr–May: new status, old premium, old coverage</li>
                <li>Jun–Aug: new status, new premium, old coverage</li>
                <li>Sep–Dec: new status, new premium, new coverage</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The final reporting model contains intervals where the combined
                historical state is stable.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Missing split points between independently changing attributes</li>
              <li>Incorrect historical combinations</li>
              <li>Duplicate or overlapping reporting intervals</li>
              <li>Exploding interval counts</li>
              <li>Incorrect snapshot attribution</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Insurance policy and coverage models</li>
              <li>Contract and pricing histories</li>
              <li>Product attribute histories</li>
              <li>Risk attribute timelines</li>
              <li>Gold layer fact and dimension construction</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Collect all relevant change points across sources</li>
              <li>Create atomic non-overlapping intervals</li>
              <li>Project each source attribute onto each interval</li>
              <li>Validate one value per attribute per interval</li>
              <li>Reduce unnecessary splits when attributes are unchanged</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate complete interval coverage</li>
              <li>Detect overlapping decomposed intervals</li>
              <li>Check one resolved value per attribute per interval</li>
              <li>Compare decomposed intervals against source change points</li>
              <li>Measure interval explosion after decomposition</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Rectangle Decomposition makes complex historical models
              reportable by turning competing timelines into stable intervals.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without decomposition, reports may combine attributes that were
              never simultaneously valid in the real business history.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It is especially useful when building historical gold-layer models
              from multiple independently historized source tables.
            </p>
          </div>
        </section>

        <RelatedPatterns current="rectangle_decomposition" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "rectangle_decomposition",
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
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
    {
      title: "Temporal Conformance",
      href: "/learn/temporal-conformance",
      key: "temporal_conformance",
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
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
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