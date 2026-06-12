"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function EventModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_modeling",
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
          Event Modeling
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Event Modeling represents discrete business events that happened at a
          specific point in time.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Not every historical fact is a state. Many business processes are
              better represented as events.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A claim is filed. A payment is received. A contract is changed. A
              customer status is updated.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Event Modeling captures what happened, when it happened and which
              entity it affected.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>Contract events</p>

              <ul>
                <li>Contract created on January 5</li>
                <li>Premium changed on April 10</li>
                <li>Contract cancelled on September 20</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                Each event describes a change that occurred at a specific point
                in time. The event stream can later be used to derive state,
                snapshots or audit history.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Duplicate events</li>
              <li>Incorrect event ordering</li>
              <li>Missing event timestamps</li>
              <li>Confusing events with states</li>
              <li>Incorrectly deriving state from incomplete event streams</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Change logs and CDC streams</li>
              <li>Claims, payments and transactions</li>
              <li>Contract mutations</li>
              <li>Status changes</li>
              <li>Audit and journal tables</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Store one row per business event</li>
              <li>Use event_time or effective_at as the business timestamp</li>
              <li>Keep ingestion time separate from event time</li>
              <li>Preserve event ordering within each entity</li>
              <li>Derive state or snapshots only after validating the event stream</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Detect duplicate events</li>
              <li>Validate event ordering per entity</li>
              <li>Check required event types</li>
              <li>Detect missing or impossible timestamps</li>
              <li>Validate event-to-state alignment</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Event Modeling is the foundation for understanding how business
              changes happened.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Many reporting models eventually need both state and events:
              state to answer what was true, and events to explain what changed.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Treating events like states often creates incorrect joins,
              duplicate reporting rows and unstable historical results.
            </p>
          </div>
        </section>

        <RelatedPatterns current="event_modeling" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "event_modeling",
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
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
    },
    {
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
    {
      title: "Historical Backfill",
      href: "/learn/historical-backfill",
      key: "historical_backfill",
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