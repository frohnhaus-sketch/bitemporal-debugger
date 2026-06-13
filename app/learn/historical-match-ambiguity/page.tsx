"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalMatchAmbiguityPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_match_ambiguity",
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
            <div style={badgeStyle}>Data Quality Pattern</div>
          </div>

          <h1 style={h1Style}>Historical Match Ambiguity</h1>

          <p style={heroTextStyle}>
            Historical Match Ambiguity occurs when a temporal join produces
            multiple valid matches for the same business event or reporting row.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="A temporal join finds more than one valid historical match."
          >
            <p style={paragraphStyle}>
              Temporal joins usually assume that one record on the left side
              matches exactly one record on the right side.
            </p>

            <p style={paragraphStyle}>
              In practice, overlapping histories, duplicated source records or
              competing timelines can create multiple valid matches. The join
              becomes ambiguous because more than one historical record satisfies
              the join conditions.
            </p>

            <ChipRow
              chips={[
                "Duplicate fact rows",
                "Join explosions",
                "Incorrect aggregations",
                "Non-deterministic reporting",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Root causes"
            title="Ambiguity usually appears when histories are aligned."
          >
            <p style={paragraphStyle}>
              Each source table can look reasonable on its own. The ambiguity
              only becomes visible when a temporal join produces more than one
              candidate record for the same point in time.
            </p>

            <ChipRow
              chips={[
                "Historical overlaps",
                "Duplicate business keys",
                "Incomplete temporal predicates",
                "Competing source histories",
                "Wrong cardinality assumptions",
                "Missing tie-breaker rules",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Make the intended temporal cardinality explicit."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Fix overlaps"
                text="Resolve overlapping histories when the business rule expects one valid record per entity and time."
              />
              <MiniCard
                title="Add tie-breakers"
                text="Define deterministic selection rules when multiple records can legitimately match."
              />
              <MiniCard
                title="Strengthen predicates"
                text="Include the full temporal and business-key logic needed to select the correct historical row."
              />
              <MiniCard
                title="Separate candidates"
                text="Materialize candidate matches for review before collapsing them into reporting facts."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Count matches before trusting the joined output."
          >
            <CheckChipRow
              checks={[
                "Count matches per joined row",
                "Detect temporal cardinality violations",
                "Validate one-to-one assumptions",
                "Identify overlapping candidate records",
                "Analyze temporal join paths",
              ]}
            />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="Match ambiguity is a common source of duplicate facts and unstable KPIs."
          >
            <p style={paragraphStyle}>
              Historical Match Ambiguity is often hidden because every
              individual source table appears valid on its own.
            </p>

            <p style={paragraphStyle}>
              The problem only becomes visible when histories are aligned and
              multiple candidate matches appear. This can create unexpected
              reporting growth, duplicated measures and unstable KPI
              calculations.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="historical_match_ambiguity" />

        <TryItCard />
      </div>
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        A mutation on May 15 matches two customer history records.
      </h2>

      <div style={matchGridStyle}>
        <MatchCard
          label="Contract event"
          title="Mutation"
          text="May 15"
          selected={false}
        />
        <MatchCard
          label="Customer Version A"
          title="Valid Jan–Jun"
          text="Matches May 15"
          selected
        />
        <MatchCard
          label="Customer Version B"
          title="Valid Apr–Dec"
          text="Also matches May 15"
          selected
        />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Join result</div>

        <p style={exampleNoteTextStyle}>
          The event matches both customer records. Without an overlap fix or a
          deterministic tie-breaker, the join cannot determine which version
          should be selected.
        </p>
      </div>
    </section>
  );
}

function MatchCard({
  label,
  title,
  text,
  selected,
}: {
  label: string;
  title: string;
  text: string;
  selected: boolean;
}) {
  return (
    <div
      style={{
        ...matchCardStyle,
        background: selected
          ? "rgba(219, 234, 254, 0.14)"
          : "rgba(255, 255, 255, 0.06)",
        border: selected
          ? "1px solid rgba(147, 197, 253, 0.7)"
          : "1px solid rgba(148, 163, 184, 0.24)",
      }}
    >
      <div style={matchLabelStyle}>{label}</div>
      <div style={matchTitleStyle}>{title}</div>
      <div style={matchTextStyle}>{text}</div>
    </div>
  );
}

function DetectionCard() {
  return (
    <section style={detectionCardStyle}>
      <div style={detectionEyebrowStyle}>
        Detectable by Historical Modeling Workbench
      </div>

      <h2 style={detectionTitleStyle}>
        The Workbench can surface ambiguous temporal joins as validation
        findings.
      </h2>

      <ChipRow
        chips={[
          "JOIN_AMBIGUITY",
          "Multiple Matches",
          "Ambiguous Match",
          "Temporal Cardinality Violation",
        ]}
      />
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

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Detect ambiguous historical matches in your own joins.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to validate temporal joins, spot
        multiple matches and understand why a reporting row becomes ambiguous.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "historical_match_ambiguity",
            cta: "open_workbench",
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
      title: "Historical Overlap",
      href: "/learn/historical-overlap",
      key: "historical_overlap",
    },
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
    {
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
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
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "clamp(24px, 5vw, 48px) clamp(14px, 4vw, 24px)",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#e2e8f0",
  boxSizing: "border-box",
};

const pageStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
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
  padding: "clamp(20px, 5vw, 28px)",
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
  fontSize: "clamp(24px, 6vw, 28px)",
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
  padding: "clamp(20px, 5vw, 28px)",
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
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const matchGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 12,
  marginTop: 20,
};

const matchCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 16,
};

const matchLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 8,
};

const matchTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 900,
  marginBottom: 6,
};

const matchTextStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.6,
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 18,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
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

const detectionCardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: "rgba(219, 234, 254, 0.96)",
  border: "1px solid rgba(147, 197, 253, 0.9)",
  color: "#0f172a",
};

const detectionEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#1d4ed8",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const detectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  fontSize: 24,
  lineHeight: 1.2,
  color: "#0f172a",
  letterSpacing: "-0.03em",
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