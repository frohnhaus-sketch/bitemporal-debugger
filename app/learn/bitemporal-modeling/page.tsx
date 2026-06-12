"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function BitemporalModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "bitemporal_modeling",
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
            FOUNDATION PATTERN
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
          Bitemporal Modeling
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Bitemporal Modeling separates when something was valid in the business
          from when it was known by the system.
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
              Traditional historized models usually track when a record was
              valid in the business.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              But historical reporting often also needs to know when that
              record became visible to the reporting system.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without this second timeline, corrected or late-arriving history
              can silently change past reports.
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
                Business-valid time
              </p>

              <ul>
                <li>Customer segment is valid from January 1</li>
              </ul>

              <p style={{ fontWeight: 900 }}>System-visible time</p>

              <ul>
                <li>The correction arrives on March 10</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                A January report rebuilt today may know more than the original
                January report knew at the time.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Two Timelines</h2>

            <div
              style={{
                background: "#020617",
                borderRadius: 16,
                padding: 18,
                border: "1px solid #334155",
                overflowX: "auto",
              }}
            >
              <code
                style={{
                  whiteSpace: "pre",
                  color: "#bfdbfe",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
{`valid_from   / valid_to     → when the record is true in the business
visible_from / visible_to   → when the record is known by the system`}
              </code>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Past reports changing after corrections arrive</li>
              <li>Using future knowledge in historical reporting</li>
              <li>Losing auditability of previous knowledge states</li>
              <li>Confusing corrected truth with as-known reporting</li>
              <li>Non-reproducible snapshot reports</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Corrected source history</li>
              <li>Late-arriving dimensions</li>
              <li>Audit and regulatory reporting</li>
              <li>Snapshot reproducibility</li>
              <li>As-known reporting models</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Store valid-time and visible-time intervals</li>
              <li>Use as-of queries with both timelines</li>
              <li>Preserve previous knowledge states instead of overwriting</li>
              <li>Separate current truth from historical knowledge</li>
              <li>Track correction visibility explicitly</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate visible-time continuity</li>
              <li>Detect retroactive corrections</li>
              <li>Compare current truth vs as-known results</li>
              <li>Validate snapshot reproducibility</li>
              <li>Check whether future knowledge leaks into past reports</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Bitemporal Modeling is the foundation for explaining what was true
              and what was known at a specific point in time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It is especially important when source systems can correct past
              records, deliver history late or restate historical facts.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without bitemporal modeling, historical reports can become
              technically correct today but historically impossible at the time
              they were originally produced.
            </p>
          </div>
        </section>

        <RelatedPatterns current="bitemporal_modeling" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "bitemporal_modeling",
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