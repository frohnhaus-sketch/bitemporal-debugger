"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function EventToStateProjectionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_to_state_projection",
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
          Event-to-State Projection
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Event-to-State Projection derives valid state intervals from ordered
          business events.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Many systems store changes as events, but reporting often needs
              state.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A contract is activated, suspended, reactivated and cancelled as a
              sequence of events. For reporting, users usually need to know the
              state of the contract at each reporting date.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Event-to-State Projection converts event sequences into valid-time
              intervals.
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
                <li>Created on January 5</li>
                <li>Activated on February 1</li>
                <li>Suspended on June 10</li>
                <li>Reactivated on July 3</li>
                <li>Cancelled on November 20</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Projected state intervals</p>

              <ul>
                <li>Draft: Jan 5–Jan 31</li>
                <li>Active: Feb 1–Jun 9</li>
                <li>Suspended: Jun 10–Jul 2</li>
                <li>Active: Jul 3–Nov 19</li>
                <li>Cancelled: Nov 20 onward</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The event stream becomes a state table that can be joined to
                snapshots and dimensions.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Incorrect event ordering</li>
              <li>Missing transition events</li>
              <li>Duplicate state transitions</li>
              <li>Invalid or impossible state sequences</li>
              <li>Incorrect interval boundaries</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Contract and policy status histories</li>
              <li>Offer and workflow systems</li>
              <li>CDC and journal tables</li>
              <li>Claims and case management</li>
              <li>Snapshot fact construction</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Order events by entity and event time</li>
              <li>Map event types to resulting states</li>
              <li>Use the next event time as valid_to</li>
              <li>Validate allowed state transitions</li>
              <li>Separate raw events from projected reporting state</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Validate event ordering per entity</li>
              <li>Detect duplicate transition events</li>
              <li>Check for missing terminal or initial events</li>
              <li>Validate state coverage after projection</li>
              <li>Compare projected state against known snapshots</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Event-to-State Projection is essential when source systems provide
              history as events but analytics require interval-based state.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without projection, reporting logic often repeatedly reinterprets
              raw events in inconsistent ways.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A validated projection creates a stable bridge between event
              history and snapshot reporting.
            </p>
          </div>
        </section>

        <RelatedPatterns current="event_to_state_projection" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "event_to_state_projection",
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
      title: "Event Modeling",
      href: "/learn/event-modeling",
      key: "event_modeling",
    },
    {
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
    },
    {
      title: "State Reduction",
      href: "/learn/state-reduction",
      key: "state_reduction",
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