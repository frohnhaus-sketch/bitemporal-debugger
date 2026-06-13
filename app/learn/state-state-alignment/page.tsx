"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
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

  const codeNoteStyle: CSSProperties = {
    marginTop: 10,
    marginBottom: 0,
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.55,
  };

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Alignment Pattern</div>
          </div>

          <h1 style={h1Style}>State ↔ State Alignment</h1>

          <p style={heroTextStyle}>
            State ↔ State Alignment joins two historized state sources across
            overlapping valid-time intervals.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Two historized sources can both be correct but still fail when joined."
          >
            <p style={paragraphStyle}>
              Historical reporting often requires joining two sources that both
              describe changing state over time. The challenge is not just
              joining by business key. The model must decide which versions were
              valid at the same reporting date.
            </p>

            <ChipRow
              chips={[
                "Multiple overlapping matches",
                "Missing valid-time coverage",
                "Join explosions",
                "Incorrect point-in-time results",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Each source has its own timeline and change frequency."
          >
            <p style={paragraphStyle}>
              A contract can change status over time. A customer can change
              segment over time. A product can change category or price over
              time. When both sides are historized, the join must align two
              timelines instead of simply matching keys.
            </p>

            <ChipRow
              chips={[
                "Independent source timelines",
                "Different change dates",
                "Temporal join predicates",
                "Coverage gaps",
                "Overlapping versions",
                "Boundary semantics",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Join on business key and overlapping valid-time intervals."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Overlap join"
                text="Join records where the business keys match and the valid-time intervals overlap."
              />
              <MiniCard
                title="Interval splitting"
                text="Split joined results into stable intervals when either source changes within the overlap."
              />
              <MiniCard
                title="Coverage handling"
                text="Define what should happen when one source has no valid row for a required reporting period."
              />
              <MiniCard
                title="Cardinality validation"
                text="Validate that the join produces the expected number of matches per entity and reporting date."
              />
            </div>

            <div style={codeBoxStyle}>
              <code style={codeStyle}>
                {`left.business_key = right.business_key
AND intervals_overlap(
  left.valid_from,
  left.valid_to,
  right.valid_from,
  right.valid_to,
  boundary_convention
)`}
              </code>
              <p style={codeNoteStyle}>
                The exact overlap predicate depends on your interval convention, for example
                closed daily intervals or half-open timestamp intervals. The important rule is
                that every temporal join uses the same boundary semantics consistently.
              </p>
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate the joined history, not only each source table."
          >
            <CheckChipRow
              checks={[
                "Detect overlapping versions per business key",
                "Detect gaps in required reporting periods",
                "Count matches per entity and reporting date",
                "Validate one expected match where the model requires one",
                "Check whether joined intervals produce unintended splits",
              ]}
            />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="State-state joins are one of the most common sources of historical reporting bugs."
          >
            <p style={paragraphStyle}>
              The data can look correct in each source independently, but the
              combined history can still produce gaps, duplicates or incorrect
              attribution.
            </p>

            <p style={paragraphStyle}>
              Validating the join result is often more important than validating
              each source table in isolation.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="state_state_alignment" />

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
        A May report must align the active contract state with the premium
        customer state.
      </h2>

      <div style={alignmentGridStyle}>
        <StateCard label="Contract history" value="Active" range="Jan – Jun" />
        <StateCard label="Customer history" value="Retail" range="Jan – Mar" />
        <StateCard label="Customer history" value="Premium" range="Apr – Dec" />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting date: May</div>

        <p style={exampleNoteTextStyle}>
          The active contract version and the premium customer version overlap
          in May. A correct temporal join must resolve to that combination.
        </p>
      </div>
    </section>
  );
}

function StateCard({
  label,
  value,
  range,
}: {
  label: string;
  value: string;
  range: string;
}) {
  return (
    <div style={stateCardStyle}>
      <div style={cardLabelStyle}>{label}</div>
      <div style={cardValueStyle}>{value}</div>
      <div style={cardRangeStyle}>Valid: {range}</div>
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
        The Workbench can surface state-state alignment risks.
      </h2>

      <CheckChipRow
        checks={[
          "JOIN_GAP",
          "JOIN_AMBIGUITY",
          "NO_VALID_MATCH",
          "MULTIPLE_MATCHES",
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
        Validate temporal joins before they reach reporting.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to detect gaps, ambiguous matches,
        overlapping versions and unintended temporal join splits.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "state_state_alignment",
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
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Historical Match Ambiguity",
      href: "/learn/historical-match-ambiguity",
      key: "historical_match_ambiguity",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
    },
    {
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
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
  marginBottom: 18,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const alignmentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const stateCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(219, 234, 254, 0.12)",
  border: "1px solid rgba(147, 197, 253, 0.38)",
};

const cardLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 8,
};

const cardValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 6,
};

const cardRangeStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 800,
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

const codeBoxStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
  overflowX: "auto",
};

const codeStyle: CSSProperties = {
  whiteSpace: "pre",
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.7,
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
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
  border: "1px solid rgba(147, 197, 253, 0.8)",
  color: "#0f172a",
};

const detectionEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const detectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 26,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#0f172a",
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