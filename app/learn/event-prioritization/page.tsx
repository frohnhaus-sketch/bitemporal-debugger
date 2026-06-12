"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function EventPrioritizationPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_prioritization",
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
          Event Prioritization
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Event Prioritization selects the business-relevant events from noisy
          historical event streams.
        </p>

        <section style={{ marginTop: 40, display: "grid", gap: 28 }}>
          <div>
            <h2 style={{ color: "#ffffff" }}>The Problem</h2>

            <p style={{ lineHeight: 1.8 }}>
              Source systems often produce many events for the same entity in a
              short period of time.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Some events represent real business milestones. Others are
              technical changes, intermediate states, corrections or duplicate
              journal entries.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Reporting usually needs a stable rule for deciding which events
              count and which events should be ignored or collapsed.
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
                <li>Draft created at 10:00</li>
                <li>Validation failed at 10:01</li>
                <li>Validation passed at 10:02</li>
                <li>Offer sent at 10:03</li>
                <li>Contract activated at 10:05</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                A reporting model may only need “Offer sent” and “Contract
                activated”, while the technical validation events should not
                create reporting facts.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Counting technical events as business events</li>
              <li>Duplicate facts from repeated status changes</li>
              <li>Incorrect event ordering</li>
              <li>Unstable KPI definitions</li>
              <li>Mixing operational workflow states with reporting milestones</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Offer and contract workflows</li>
              <li>Claims and case management systems</li>
              <li>Policy mutation journals</li>
              <li>CDC and audit logs</li>
              <li>Status-heavy operational systems</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Define reporting-relevant event types explicitly</li>
              <li>Rank events by business priority within each entity</li>
              <li>Collapse technical event sequences into business milestones</li>
              <li>Keep raw events separate from reporting events</li>
              <li>Document why certain events are excluded</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Count raw events vs reporting events</li>
              <li>Validate event ordering per entity</li>
              <li>Detect duplicate milestone events</li>
              <li>Check event priority rules against known examples</li>
              <li>Compare derived reporting events with business expectations</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Event Prioritization prevents operational noise from becoming
              analytical truth.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without prioritization, event-based reporting can overcount,
              duplicate or misclassify business activity.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              The goal is not to delete events, but to separate raw operational
              history from reporting-relevant business history.
            </p>
          </div>
        </section>

        <RelatedPatterns current="event_prioritization" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "event_prioritization",
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
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
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