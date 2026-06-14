"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

const PATTERN_GROUPS = [
  {
    title: "Foundations",
    description: "Basic building blocks of historical data models.",
    patterns: [
      {
        name: "State Modeling",
        text: "Represents the state of a business entity over a valid time interval.",
        examples: ["Customer", "Contract", "Policy", "Product"],
      },
      {
        name: "Event Modeling",
        text: "Represents discrete business events that happened at a point in time.",
        examples: ["Order created", "Claim filed", "Payment received"],
      },
      {
        name: "Bitemporal Modeling",
        text: "Separates business-valid time from system-visible time.",
        examples: ["Corrected history", "Audit reporting", "As-known reporting"],
      },
      {
        name: "SCD2 vs Bitemporal Modeling",
        text: "Compares valid-time-only history with models that also preserve when information became known.",
        examples: ["SCD2 dimensions", "Visible time", "Corrected history"],
      },
    ],
  },
  {
    title: "Alignment Patterns",
    description: "Patterns for connecting histories across sources.",
    patterns: [
      {
        name: "State ↔ State Alignment",
        text: "Aligns two historized state sources across overlapping validity periods.",
        examples: ["Contract ↔ Customer", "Policy ↔ Broker", "Product ↔ Price"],
      },
      {
        name: "State ↔ Event Alignment",
        text: "Maps events to the state that was valid when the event happened.",
        examples: ["Claim ↔ Policy", "Mutation ↔ Contract"],
      },
      {
        name: "Historical Conformance",
        text: "Aligns competing timelines from multiple source systems.",
        examples: ["CRM + ERP", "Policy system + billing system"],
      },
    ],
  },
  {
    title: "Dimension Patterns",
    description: "Patterns for historized dimensions and relationships.",
    patterns: [
      {
        name: "Dimension Completion",
        text: "Ensures dimension history covers all required fact periods.",
        examples: ["Late arriving dimensions", "Missing foreign keys"],
      },
      {
        name: "Relationship History",
        text: "Models relationships that change over time.",
        examples: ["Customer ↔ Advisor", "Policy ↔ Broker"],
      },
      {
        name: "Identity Resolution",
        text: "Resolves multiple identifiers for the same business entity.",
        examples: ["Customer merge", "Contract migration"],
      },
    ],
  },
  {
    title: "Reporting Patterns",
    description: "Patterns for reproducible historical reporting.",
    patterns: [
      {
        name: "Snapshot Fact Modeling",
        text: "Builds reproducible reporting facts for periodic snapshots.",
        examples: [
          "Month-end portfolio",
          "Active contracts",
          "Customer balances",
        ],
      },
      {
        name: "Snapshot Reproducibility",
        text: "Ensures reports can be reproduced for the same reporting date.",
        examples: ["Month-end snapshots", "Audit reports"],
      },
      {
        name: "As-Known Reporting",
        text: "Answers historical questions using only the information known at the reporting time.",
        examples: ["Visible time", "Audit reports", "As-of knowledge"],
      },
      {
        name: "Historical Correction",
        text: "Preserves corrected history without losing what was known before.",
        examples: ["Backdated changes", "Retroactive corrections", "Restatements"],
      },
      {
        name: "Historical Backfill",
        text: "Reconstructs history after data already exists.",
        examples: ["CDC replay", "Historical reload"],
      },
    ],
  },
  {
    title: "Data Quality Patterns",
    description: "Patterns for detecting historical modeling risks.",
    patterns: [
      {
        name: "Historical Match Ambiguity",
        text: "Occurs when multiple historical records satisfy the same temporal join.",
        examples: ["Duplicate fact rows", "Join explosion", "Multiple valid matches"],
      },
      {
        name: "Historical Coverage Gap",
        text: "Occurs when required history is missing for a reporting period.",
        examples: ["Missing dimension row", "Uncovered fact interval"],
      },
      {
        name: "Historical Overlap",
        text: "Occurs when multiple records are active at the same time.",
        examples: ["Overlapping SCD2 rows", "Ambiguous current state"],
      },
    ],
  },
  {
    title: "Advanced Patterns",
    description: "Advanced historical modeling techniques.",
    patterns: [
      {
        name: "Rectangle Decomposition",
        text: "Creates stable reporting intervals from independently historized attributes.",
        examples: [
          "Coverage timelines",
          "Risk attributes",
          "Contract projections",
        ],
      },
      {
        name: "Event Prioritization",
        text: "Selects business-relevant events from noisy operational event streams.",
        examples: ["Status changes", "Workflow events", "Event ranking"],
      },
      {
        name: "State Reduction",
        text: "Removes irrelevant or redundant historical state changes before reporting.",
        examples: ["Status cleanup", "Noise reduction", "Reporting states"],
      },
      {
        name: "Event-to-State Projection",
        text: "Derives valid state intervals from ordered business events.",
        examples: ["Event streams", "Status history", "Snapshot derivation"],
      },
    ],
  },
];

export default function PatternsPage() {
  const trackedDepths = useRef(new Set<number>());
  const trackedVisibleGroups = useRef(new Set<string>());

  useEffect(() => {
    track("patterns_page_opened", {
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    const handleCategoryVisibility = () => {
      const sections = document.querySelectorAll("[data-pattern-group]");

      sections.forEach((section) => {
        const group = section.getAttribute("data-pattern-group");
        if (!group || trackedVisibleGroups.current.has(group)) return;

        const rect = section.getBoundingClientRect();
        const isVisible =
          rect.top < window.innerHeight * 0.75 && rect.bottom > 0;

        if (!isVisible) return;

        trackedVisibleGroups.current.add(group);

        track("pattern_category_viewed", {
          category: group,
        });
      });
    };

    window.addEventListener("scroll", handleCategoryVisibility);
    handleCategoryVisibility();

    return () =>
      window.removeEventListener("scroll", handleCategoryVisibility);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: "44px 40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: "#bfdbfe",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          ← Back to Workbench
        </a>

        <section style={{ marginTop: 32, marginBottom: 34 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "7px 12px",
              borderRadius: 999,
              background: "#dbeafe",
              color: "#075985",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 0.6,
              marginBottom: 16,
            }}
          >
            PATTERN CATALOG
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: 900,
              fontSize: "clamp(34px, 10vw, 54px)",
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              color: "#ffffff",
            }}
          >
            Historical Modeling Pattern Catalog
          </h1>

          <p
            style={{
              marginTop: 18,
              maxWidth: 760,
              color: "#dbeafe",
              fontSize: 19,
              lineHeight: 1.55,
            }}
          >
            A practical vocabulary for common problems in SCD2 dimensions,
            snapshots, temporal joins, late-arriving data and historical
            reporting.
          </p>
        </section>

        <div style={{ display: "grid", gap: 22 }}>
          {PATTERN_GROUPS.map((group) => (
            <section
              key={group.title}
              data-pattern-group={group.title}
              style={{
                background: "rgba(15, 23, 42, 0.58)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: 24,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {group.title}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#cbd5e1",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {group.description}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {group.patterns.map((pattern) => (
                  <article
                    key={pattern.name}
                    onClick={() => {
                      track("pattern_card_clicked", {
                        group: group.title,
                        pattern: pattern.name,
                      });
                    }}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      borderRadius: 14,
                      padding: 16,
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 17,
                        color: "#0f172a",
                      }}
                    >
                      {pattern.name}
                    </h3>

                    <p
                      style={{
                        margin: "8px 0 12px",
                        color: "#475569",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {pattern.text}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {pattern.examples.map((example) => (
                        <span
                          key={example}
                          style={{
                            padding: "5px 8px",
                            borderRadius: 999,
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#1d4ed8",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {example}
                        </span>
                      ))}
                    </div>                    
                    {pattern.name === "Dimension Completion" && (
                      <LearnMoreLink
                        href="/learn/dimension-completion"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Snapshot Reproducibility" && (
                      <LearnMoreLink
                        href="/learn/snapshot-reproducibility"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "State ↔ Event Alignment" && (
                      <LearnMoreLink
                        href="/learn/state-event-alignment"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "State ↔ State Alignment" && (
                      <LearnMoreLink
                        href="/learn/state-state-alignment"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Relationship History" && (
                      <LearnMoreLink
                        href="/learn/relationship-history"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Coverage Gap" && (
                      <LearnMoreLink
                        href="/learn/historical-coverage-gap"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Overlap" && (
                      <LearnMoreLink
                        href="/learn/historical-overlap"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Match Ambiguity" && (
                      <LearnMoreLink
                        href="/learn/historical-match-ambiguity"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Conformance" && (
                      <LearnMoreLink
                        href="/learn/historical-conformance"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Correction" && (
                      <LearnMoreLink
                        href="/learn/historical-correction"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Identity Resolution" && (
                      <LearnMoreLink
                        href="/learn/identity-resolution"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Historical Backfill" && (
                      <LearnMoreLink
                        href="/learn/historical-backfill"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Bitemporal Modeling" && (
                      <LearnMoreLink
                        href="/learn/bitemporal-modeling"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "State Modeling" && (
                      <LearnMoreLink
                        href="/learn/state-modeling"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Event Modeling" && (
                      <LearnMoreLink
                        href="/learn/event-modeling"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Rectangle Decomposition" && (
                      <LearnMoreLink
                        href="/learn/rectangle-decomposition"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Event Prioritization" && (
                      <LearnMoreLink
                        href="/learn/event-prioritization"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "State Reduction" && (
                      <LearnMoreLink
                        href="/learn/state-reduction"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Event-to-State Projection" && (
                      <LearnMoreLink
                        href="/learn/event-to-state-projection"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "Snapshot Fact Modeling" && (
                      <LearnMoreLink
                        href="/learn/snapshot-fact-modeling"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "As-Known Reporting" && (
                      <LearnMoreLink
                        href="/learn/as-known-reporting"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                    {pattern.name === "SCD2 vs Bitemporal Modeling" && (
                      <LearnMoreLink
                        href="/learn/scd2-vs-bitemporal"
                        pattern={pattern.name}
                        group={group.title}
                      />
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function LearnMoreLink({
  href,
  pattern,
  group,
}: {
  href: string;
  pattern: string;
  group: string;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.stopPropagation();
      
        track("pattern_learn_more_clicked", {
          pattern,
          group,
          href,
        });
      }}
      style={{
        display: "inline-flex",
        marginTop: 12,
        padding: "9px 12px",
        borderRadius: 10,
        background: "#2563eb",
        color: "#ffffff",
        textDecoration: "none",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      Learn More →
    </a>
  );
}