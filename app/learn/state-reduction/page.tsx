"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function StateReductionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "state_reduction",
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
          State Reduction
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          State Reduction removes irrelevant or redundant historical state
          changes before building reporting models.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Operational systems often store more historical state changes than
              reporting actually needs.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Some changes are technical, temporary, repeated or irrelevant for
              analytical use cases.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              If every source state is carried forward into the reporting
              model, the result becomes noisy, oversized and difficult to
              validate.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>Contract states</p>

              <ul>
                <li>Draft</li>
                <li>Validation pending</li>
                <li>Validation failed</li>
                <li>Validation passed</li>
                <li>Active</li>
                <li>Active with technical refresh</li>
                <li>Cancelled</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Reporting states</p>

              <ul>
                <li>Draft</li>
                <li>Active</li>
                <li>Cancelled</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The reporting model keeps the business-relevant states and
                removes intermediate operational noise.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Overly fragmented history</li>
              <li>Unstable snapshot outputs</li>
              <li>Reporting models that mirror operational noise</li>
              <li>Incorrect removal of business-relevant changes</li>
              <li>Hard-to-explain KPI movements</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Status-heavy operational systems</li>
              <li>Contract and policy histories</li>
              <li>Offer and workflow systems</li>
              <li>CDC-derived state tables</li>
              <li>Gold layer dimensional models</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Define reporting-relevant state attributes</li>
              <li>Collapse adjacent intervals with identical reporting state</li>
              <li>Remove technical refresh versions</li>
              <li>Separate source state from reporting state</li>
              <li>Preserve raw history for audit and reduced history for analytics</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Compare raw state count vs reduced state count</li>
              <li>Validate that key business transitions are preserved</li>
              <li>Check for accidental coverage gaps after reduction</li>
              <li>Verify snapshot outputs before and after reduction</li>
              <li>Review excluded state changes with business users</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              State Reduction turns operational history into analytical history.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              It reduces noise while preserving the changes that matter for
              reporting.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without reduction, historical models can become technically
              accurate but analytically unusable.
            </p>
          </div>
        </section>

        <RelatedPatterns current="state_reduction" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "state_reduction",
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
      title: "Event Prioritization",
      href: "/learn/event-prioritization",
      key: "event_prioritization",
    },
    {
      title: "Event Modeling",
      href: "/learn/event-modeling",
      key: "event_modeling",
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
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
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