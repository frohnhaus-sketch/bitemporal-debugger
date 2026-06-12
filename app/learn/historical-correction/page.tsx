"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalCorrectionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_correction",
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
          Historical Correction
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Historical Correction preserves corrected business history without
          losing what was previously known.
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
              Source systems frequently correct past data.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A contract may receive a backdated change. A customer attribute
              may be corrected months later. A policy status may be updated
              retroactively.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical reporting must decide whether reports should show the
              corrected truth or the information that was known at the time.
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
              <p style={{ fontWeight: 900, marginTop: 0 }}>
                January Reporting
              </p>

              <ul>
                <li>Customer Segment = Retail</li>
              </ul>

              <p style={{ fontWeight: 900 }}>
                March Correction
              </p>

              <ul>
                <li>January Segment corrected to Premium</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                Should a rebuilt January report show Retail or Premium?
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Changing historical reports</li>
              <li>Audit disagreements</li>
              <li>Loss of reporting reproducibility</li>
              <li>Conflicting business interpretations</li>
              <li>Invisible retroactive changes</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Corrected customer master data</li>
              <li>Policy administration systems</li>
              <li>Contract history corrections</li>
              <li>Financial restatements</li>
              <li>Regulatory reporting</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Bitemporal modeling</li>
              <li>Visible-time tracking</li>
              <li>As-known reporting</li>
              <li>Persisted snapshots</li>
              <li>Historical version retention</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Detect retroactive source changes</li>
              <li>Validate report reproducibility</li>
              <li>Track visible-time history</li>
              <li>Compare current truth vs historical knowledge</li>
              <li>Measure correction impact on published reports</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Historical corrections are one of the main reasons organizations
              move beyond simple SCD2 modeling.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without correction tracking, it becomes impossible to explain why
              reports generated in the past differ from reports generated today.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical Correction introduces the distinction between business
              truth and reporting knowledge.
            </p>
          </div>
        </section>

        <RelatedPatterns current="historical_correction" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_correction",
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
      title: "Temporal Conformance",
      href: "/learn/temporal-conformance",
      key: "temporal_conformance",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "Historical Overlap",
      href: "/learn/historical-overlap",
      key: "historical_overlap",
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