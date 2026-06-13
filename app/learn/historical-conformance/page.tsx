"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function TemporalConformancePage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_conformance",
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
          Historical Conformance
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Historical Conformance aligns multiple historical source timelines
          into one consistent reporting history.
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
              Historical reporting often combines data from several source systems.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Each source can have its own history, change frequency and temporal
              behavior.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A customer change may appear in one system before it appears in another.
              A contract update may be effective on one date while related attributes
              change on different dates.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical Conformance is the process of deciding how these independent
              histories should behave together inside a reporting model.
            </p>

            <div
              style={{
                background: "rgba(15,23,42,0.7)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.3)",
              }}
            >
              <p style={{ marginTop: 0, fontWeight: 900 }}>
                Customer Timeline
              </p>
          
              <ul>
                <li>Customer Segment changes on April 1</li>
              </ul>
          
              <p style={{ fontWeight: 900 }}>
                Contract Timeline
              </p>
          
              <ul>
                <li>Contract Status changes on April 15</li>
              </ul>
          
              <p style={{ fontWeight: 900 }}>
                Risk Timeline
              </p>
          
              <ul>
                <li>Risk Classification changes on May 1</li>
              </ul>
          
              <p style={{ marginBottom: 0 }}>
                The reporting model must define how these independent timelines are
                combined into one historical reporting view.
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
              <li>Define which source owns each historical attribute</li>
              <li>Resolve conflicting historical changes across systems</li>
              <li>Separate business-valid time from system-visible time</li>
              <li>Define how source corrections affect published history</li>
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
              Many historical modeling projects fail not because individual sources
              are wrong, but because multiple sources are combined inconsistently.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical Conformance provides the rules that turn independent source
              histories into one coherent reporting history.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It is often the difference between a collection of historized tables
              and a trustworthy historical reporting model.
            </p>
          </div>
        </section>

        <RelatedPatterns current="historical_conformance" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "historical_conformance",
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
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
    },
    {
      title: "Rectangle Decomposition",
      href: "/learn/rectangle-decomposition",
      key: "rectangle_decomposition",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
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