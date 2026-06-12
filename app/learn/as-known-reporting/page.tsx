"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function AsKnownReportingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "as_known_reporting",
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
          As-Known Reporting
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          As-Known Reporting answers historical questions using only the
          information that was known at the reporting time.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              A report can be historically correct in two different ways.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It can show the corrected truth as we know it today, or it can
              show what was known when the report was originally produced.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              As-Known Reporting makes this distinction explicit.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>January report</p>

              <ul>
                <li>Customer segment was known as Retail</li>
                <li>Report was published on January 31</li>
              </ul>

              <p style={{ fontWeight: 900 }}>March correction</p>

              <ul>
                <li>January segment is corrected to Premium</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                An as-known January report should still show Retail, because
                Premium was not known when the January report was published.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Using future knowledge in past reports</li>
              <li>Non-reproducible published reports</li>
              <li>Confusing current truth with historical knowledge</li>
              <li>Audit disagreements</li>
              <li>Incorrect visible-time logic</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Regulatory reporting</li>
              <li>Audit reporting</li>
              <li>Month-end snapshot reporting</li>
              <li>Corrected source history</li>
              <li>Bitemporal dimensions</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Track visible_from and visible_to</li>
              <li>Query using both reporting date and knowledge date</li>
              <li>Preserve previous knowledge states</li>
              <li>Separate corrected truth from as-known truth</li>
              <li>Document which reports require reproducibility</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate visible-time intervals</li>
              <li>Check whether future records leak into past reports</li>
              <li>Compare as-known output with published snapshots</li>
              <li>Detect retroactive corrections</li>
              <li>Validate bitemporal as-of queries</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              As-Known Reporting is essential when historical reports must be
              reproduced exactly as they were seen at the time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It prevents corrected history from silently rewriting the past.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It is one of the main business reasons to use bitemporal modeling.
            </p>
          </div>
        </section>

        <RelatedPatterns current="as_known_reporting" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "as_known_reporting",
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
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
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
      title: "Snapshot Fact Modeling",
      href: "/learn/snapshot-fact-modeling",
      key: "snapshot_fact_modeling",
    },
    {
      title: "Temporal Conformance",
      href: "/learn/temporal-conformance",
      key: "temporal_conformance",
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