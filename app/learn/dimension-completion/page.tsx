"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

const VALIDATION_CHECKS = [
  "Every fact period has a dimension match",
  "No silent fact loss during historical joins",
  "Completed history is marked or explainable",
  "Backfilled values are business-approved",
  "Snapshot completeness validation",
  "Late arriving dimension validation",
];

const SOLUTIONS = [
  {
    title: "Earliest Known Value Backfill",
    text: "Extend the earliest known dimension version backwards when the business assumption is that the value already applied before it was first observed.",
  },
  {
    title: "Carry Forward",
    text: "Extend the closest known dimension version into uncovered periods when this matches the business meaning.",
  },
  {
    title: "Unknown Member",
    text: "Join missing periods to a synthetic fallback member instead of silently dropping fact rows.",
  },
  {
    title: "Synthetic History",
    text: "Reconstruct historical dimension coverage from events, snapshots or other source evidence.",
  },
];

export default function DimensionCompletionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "dimension_completion",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Historical Modeling Pattern</div>
          </div>

          <h1 style={h1Style}>Dimension Completion</h1>

          <p style={heroTextStyle}>
            SCD2 dimensions preserve recorded history. Dimension Completion solves the
            missing coverage problem when facts exist for periods where no valid
            dimension row exists yet.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="A fact exists, but no valid dimension record exists."
          >
            <p style={paragraphStyle}>
              This often happens in snapshot reporting, late-arriving dimensions
              or cross-system integrations. The fact row is available for a
              reporting period, but the dimension history does not cover that
              same period.
            </p>

            <p style={paragraphStyle}>
              A dimension can be technically valid and still be incomplete for reporting.
              SCD2 stores the changes that were captured, but it does not automatically
              create the missing historical coverage needed by snapshot facts.
            </p>

            <ChipRow
              chips={[
                "Missing attributes",
                "Missing joins",
                "Incorrect historical reporting",
                "Unstable snapshots",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Key idea"
            title="SCD2 preserves history. Dimension Completion creates missing reporting coverage."
          >
            <p style={paragraphStyle}>
              Many teams assume that historized dimensions are enough for historical
              reporting. But a perfectly modeled SCD2 dimension can still fail if its
              valid-time intervals do not cover the periods required by the fact table.
            </p>

            <p style={paragraphStyle}>
              Dimension Completion extends, reconstructs or explicitly marks missing
              dimension history so every relevant fact period has a deterministic
              dimensional context.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it happens"
            title="The fact model and dimension model do not have the same historical coverage."
          >
            <ChipRow
              chips={[
                "Late arriving dimensions",
                "Partial source history",
                "Cross-system integration",
                "Historical backfills",
                "Snapshot reporting requirements",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Where it appears"
            title="Dimension Completion often appears when fact history is older than dimension history."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Insurance"
                text="A policy exists since 2018, but customer ownership history only starts in 2021."
              />
              <MiniCard
                title="Sales reporting"
                text="Revenue history exists before territory, account or sales hierarchy history was tracked."
              />
              <MiniCard
                title="Product reporting"
                text="Sales facts exist before product categories or risk attributes were historized."
              />
              <MiniCard
                title="Lakehouse migrations"
                text="A new gold model requires historical dimensions that were never fully available in the source."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Complete the dimension before joining it to the fact model."
          >
            <div style={solutionGridStyle}>
              {SOLUTIONS.map((solution) => (
                <MiniCard
                  key={solution.title}
                  title={solution.title}
                  text={solution.text}
                />
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Before publishing the model, validate historical coverage."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Without Dimension Completion, snapshot facts can be correct but historically unusable."
          >
            <p style={paragraphStyle}>
              The fact table may contain one row per entity and snapshot date, but
              downstream reporting still fails when the dimension join cannot resolve a
              valid historical context.
            </p>
                      
            <p style={paragraphStyle}>
              Dimension Completion makes the assumption explicit: either history is
              backfilled, reconstructed, carried forward or assigned to an unknown member.
              The important part is that missing coverage is handled deliberately rather
              than silently losing facts or attributes.
            </p>
          </WhiteCard>

        </section>

        <RelatedPatterns current="dimension_completion" />

        <TryItCard />
      </div>

      <Analytics />
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        Contract snapshot exists in February. Customer dimension starts in
        April.
      </h2>

      <div style={timelineListStyle}>
        <TimelineRow
          label="Contract fact"
          before="Jan"
          bar="────────────────────────"
          after="Dec"
          active
        />

        <TimelineRow
          label="Customer dimension"
          before="Jan"
          bar="          ──────────────"
          after="Dec"
          active={false}
        />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting date: February</div>

        <p style={exampleNoteTextStyle}>
          The contract exists, but the customer dimension has no valid row yet.
          Without completion, the snapshot either loses the dimension attributes
          or fails the historical join.
        </p>
      </div>
    </section>
  );
}

function WhiteCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={whiteCardStyle}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <h2 style={cardTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={miniCardStyle}>
      <div style={miniCardTitleStyle}>{title}</div>
      <div style={miniCardTextStyle}>{text}</div>
    </div>
  );
}

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div style={chipRowStyle}>
      {chips.map((chip) => (
        <span key={chip} style={riskChipStyle}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function CheckChipRow({ checks }: { checks: string[] }) {
  return (
    <div style={checkRowStyle}>
      {checks.map((check) => (
        <span key={check} style={checkChipStyle}>
          ✓ {check}
        </span>
      ))}
    </div>
  );
}

function TimelineRow({
  label,
  before,
  bar,
  after,
  active,
}: {
  label: string;
  before: string;
  bar: string;
  after: string;
  active: boolean;
}) {
  return (
    <div style={timelineRowStyle}>
      <div style={timelineLabelStyle}>{label}</div>

      <div
        style={{
          ...timelineBarStyle,
          background: active ? "#eff6ff" : "#fff7ed",
          border: active ? "1px solid #bfdbfe" : "1px solid #fed7aa",
          color: active ? "#1d4ed8" : "#9a3412",
        }}
      >
        {before} {bar} {after}
      </div>
    </div>
  );
}

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Use the advisor to map this pattern to your own historical model.
      </h2>

      <p style={tryItTextStyle}>
        The Historical Modeling Advisor can recommend modeling strategies, risks
        and validation checks based on your reporting goal, source types and
        historized dimensions.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "dimension_completion",
            cta: "open_workbench",
            source: "bottom_cta",
          });
        }}
        style={tryItButtonStyle}
      >
        Open Historical Modeling Workbench →
      </a>
    </section>
  );
}

function RelatedPatterns({ current }: { current: string }) {
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
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
  ];

  return (
    <section style={relatedSectionStyle}>
      <div style={relatedTitleStyle}>Related Patterns</div>

      <div style={relatedGridStyle}>
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
              style={relatedLinkStyle}
            >
              {pattern.title}
            </a>
          ))}
      </div>
    </section>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "48px 24px",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#e2e8f0",
};

const pageStyle: CSSProperties = {
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  marginBottom: 22,
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#075985",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

const h1Style: CSSProperties = {
  marginTop: 22,
  marginBottom: 16,
  fontSize: "clamp(34px, 8vw, 56px)",
  lineHeight: 1,
  color: "#ffffff",
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  maxWidth: 760,
  fontSize: 20,
  lineHeight: 1.6,
  color: "#dbeafe",
};

const whiteCardStyle: CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 28,
  lineHeight: 1.15,
  color: "#0f172a",
  letterSpacing: "-0.03em",
};

const paragraphStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const riskChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #bfdbfe",
};

const darkCardStyle: CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
};

const darkEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const darkTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 28,
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const timelineListStyle: CSSProperties = {
  marginTop: 22,
  display: "grid",
  gap: 14,
  maxWidth: 820,
};

const timelineRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "150px 1fr",
  gap: 14,
  alignItems: "center",
};

const timelineLabelStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const timelineBarStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  fontFamily: "monospace",
  fontSize: 13,
  overflowX: "auto",
  whiteSpace: "nowrap",
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 22,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
};

const exampleNoteLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  fontSize: 13,
};

const exampleNoteTextStyle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 15,
  lineHeight: 1.55,
};

const solutionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const miniCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const miniCardTitleStyle: CSSProperties = {
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 8,
};

const miniCardTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
};

const checkRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 8,
};

const checkChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ecfdf5",
  color: "#047857",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #a7f3d0",
};

const relatedSectionStyle: CSSProperties = {
  marginTop: 30,
  padding: 24,
  borderRadius: 22,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.32)",
};

const relatedTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const relatedGridStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const relatedLinkStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ffffff",
  color: "#1d4ed8",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const tryItCardStyle: CSSProperties = {
  marginTop: 30,
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
  border: "1px solid rgba(147, 197, 253, 0.8)",
  color: "#0f172a",
};

const tryItEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const tryItTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: 26,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#0f172a",
};

const tryItTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#334155",
  maxWidth: 720,
};

const tryItButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "12px 18px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};