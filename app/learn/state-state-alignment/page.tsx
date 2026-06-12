"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function StateStateAlignmentPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "state_state_alignment",
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
          State ↔ State Alignment
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          State ↔ State Alignment joins two historized state sources across
          overlapping valid-time intervals.
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
              Historical reporting often requires joining two sources that both
              describe changing state over time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A contract can change its status over time. A customer can change
              segment over time. A product can change category or price over
              time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The challenge is not just joining by business key. The model must
              decide which versions were valid at the same reporting date.
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
                Contract history
              </p>

              <ul>
                <li>Contract C1 active Jan–Jun</li>
                <li>Contract C1 cancelled Jul–Dec</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Customer history</p>

              <ul>
                <li>Customer C1 retail Jan–Mar</li>
                <li>Customer C1 premium Apr–Dec</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                A report for May must join the active contract version to the
                premium customer version because both states overlap in May.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Join Logic</h2>

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
{`left.business_key = right.business_key
AND left.valid_from < right.valid_to
AND right.valid_from < left.valid_to`}
              </code>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Multiple overlapping matches</li>
              <li>Missing valid-time coverage</li>
              <li>Join explosions</li>
              <li>Using current dimensions for historical facts</li>
              <li>Incorrect point-in-time results</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Contract ↔ Customer</li>
              <li>Policy ↔ Broker</li>
              <li>Product ↔ Price</li>
              <li>Account ↔ Customer Segment</li>
              <li>Order ↔ Product Category</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Detect overlapping versions per business key</li>
              <li>Detect gaps in required reporting periods</li>
              <li>Count matches per entity and reporting date</li>
              <li>Validate one expected match where the model requires one</li>
              <li>Check whether joined intervals produce unintended splits</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              State ↔ State joins are one of the most common sources of
              historical reporting bugs.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The data can look correct in each source independently, but the
              combined history can still produce gaps, duplicates or incorrect
              attribution.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Validating the join result is often more important than validating
              each source table in isolation.
            </p>
          </div>
        </section>

        <RelatedPatterns current="state_state_alignment" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "state_state_alignment",
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