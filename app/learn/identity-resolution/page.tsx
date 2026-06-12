"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function IdentityResolutionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "identity_resolution",
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
            DIMENSION PATTERN
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
          Identity Resolution
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#dbeafe",
          }}
        >
          Identity Resolution connects different identifiers that represent the
          same business entity across systems and over time.
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
              Different systems often use different identifiers for the same
              real-world entity.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              A customer may have one ID in CRM, another ID in billing and a
              different ID in a policy or contract system.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Historical reporting becomes difficult when these identities
              change, merge, split or become visible at different times.
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
              <p style={{ marginTop: 0, fontWeight: 900 }}>Same customer</p>

              <ul>
                <li>CRM Customer ID = C-1029</li>
                <li>Billing Customer ID = B-8841</li>
                <li>Policy Holder ID = P-5510</li>
              </ul>

              <p style={{ fontWeight: 900 }}>Historical challenge</p>

              <ul>
                <li>The mapping becomes available after reports were produced</li>
                <li>One ID is merged into another in a later source correction</li>
              </ul>

              <p style={{ marginBottom: 0 }}>
                The model must decide how identity mappings affect historical
                reports and cross-system joins.
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Typical Risks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Duplicate customers or contracts</li>
              <li>Broken cross-system joins</li>
              <li>Incorrect historical attribution</li>
              <li>Unstable customer-level reporting</li>
              <li>Late corrections changing past identity mappings</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Where It Appears</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>CRM + billing integrations</li>
              <li>Customer master data management</li>
              <li>Policy holder and contract systems</li>
              <li>System migrations</li>
              <li>Conformed dimensions in lakehouse gold layers</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Modeling Approaches</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Identity mapping tables</li>
              <li>Historized cross-reference tables</li>
              <li>Surrogate business entity IDs</li>
              <li>Bitemporal identity mappings</li>
              <li>Merge and split history tracking</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Common Validation Checks</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>Detect multiple source IDs for the same business entity</li>
              <li>Validate one current canonical ID where required</li>
              <li>Check historical identity mapping coverage</li>
              <li>Detect identity mapping overlaps and gaps</li>
              <li>Measure impact of late identity corrections</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "#ffffff" }}>Why It Matters</h2>

            <p style={{ lineHeight: 1.8 }}>
              Identity Resolution is often the foundation for cross-system
              historical reporting.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              Without stable identity mapping, even perfectly historized source
              tables cannot be reliably joined.
            </p>

            <p style={{ lineHeight: 1.8 }}>
              In historical models, identity is not only a matching problem — it
              is also a time-dependent modeling problem.
            </p>
          </div>
        </section>

        <RelatedPatterns current="identity_resolution" />

        <a
          href="/"
          onClick={() => {
            track("learn_cta_clicked", {
              page: "identity_resolution",
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
      title: "Temporal Conformance",
      href: "/learn/temporal-conformance",
      key: "temporal_conformance",
    },
    {
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Historical Correction",
      href: "/learn/historical-correction",
      key: "historical_correction",
    },
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
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