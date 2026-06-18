"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type WinnerMode = "source_precedence" | "latest_visible" | "manual_override";

const WINNER_RULES = [
  {
    title: "Source precedence",
    question: "Which source is trusted most?",
    example: "Policy system wins over CRM",
  },
  {
    title: "Latest visible record",
    question: "Which candidate was known most recently?",
    example: "Latest visible_from wins",
  },
  {
    title: "Manual override",
    question: "Was a business override applied?",
    example: "Approved override wins over system candidates",
  },
];

const VALIDATION_CHECKS = [
  "Exactly one winner per business key and reporting date",
  "Winner rule is explicit and documented",
  "Tie-breakers are deterministic",
  "Source precedence is stable over time",
  "Late-arriving records do not randomly change winners",
  "Losing candidates remain explainable",
];

const WINNER_MODES = [
  {
    key: "source_precedence" as WinnerMode,
    label: "Source precedence",
    title: "Policy system wins",
    value: "Broker B",
    explanation:
      "The policy system has higher trust than CRM, so Broker B wins for the reporting date.",
  },
  {
    key: "latest_visible" as WinnerMode,
    label: "Latest visible",
    title: "Latest visible candidate wins",
    value: "Broker A",
    explanation:
      "The CRM candidate became visible later, so Broker A wins under a latest-visible rule.",
  },
  {
    key: "manual_override" as WinnerMode,
    label: "Manual override",
    title: "Manual override wins",
    value: "Broker C",
    explanation:
      "A manually approved override has highest priority, so Broker C wins over both source-system candidates.",
  },
];

export default function HistoricalWinnerSelectionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_winner_selection",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "historical-winner-selection",
      pageType: "learn_page",
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
            <div style={badgeStyle}>Engineering Pattern</div>
          </div>

          <h1 style={h1Style}>Historical Winner Selection</h1>

          <WhiteCard
            eyebrow="Quick answer"
            title="Historical winner selection chooses one correct record when multiple historical candidates match."
          >
            <p style={paragraphStyle}>
              Use historical winner selection when several records are valid for
              the same business key and reporting date, but the model needs one
              deterministic result.
            </p>

            <p style={paragraphStyle}>
              The problem is not always that overlaps exist. Sometimes overlaps
              are expected. The important question is which candidate wins and
              why.
            </p>
          </WhiteCard>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Core idea"
            title="A historical model often needs a winner rule, not just an overlap check."
          >
            <p style={paragraphStyle}>
              Historical joins can return multiple candidates for the same
              reporting moment. This happens with competing source systems,
              late-arriving records, manual overrides, relationship changes or
              overlapping valid-time intervals.
            </p>

            <p style={paragraphStyle}>
              Historical winner selection makes the rule explicit: source
              precedence, priority, visible time, effective time, specificity or
              a deterministic tie-breaker.
            </p>
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Common winner rules"
            title="Winner selection should be deterministic and explainable."
          >
            <div style={axisGridStyle}>
              {WINNER_RULES.map((rule) => (
                <div key={rule.title} style={axisCardStyle}>
                  <strong>{rule.title}</strong>
                  <p>{rule.question}</p>
                  <span>{rule.example}</span>
                </div>
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="When it matters"
            title="Use winner selection when multiple historical candidates are legitimate."
          >
            <ChipRow
              chips={[
                "Competing source systems",
                "Broker assignment",
                "Customer ownership",
                "Manual overrides",
                "Late-arriving corrections",
                "Relationship history",
                "Source precedence",
              ]}
            />

            <p style={{ ...paragraphStyle, marginTop: 18 }}>
              If two or more records can match the same fact, simply removing
              overlaps may destroy important business evidence. A better model
              keeps the candidates and applies a clear winner rule.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical risk"
            title="Without a winner rule, historical joins become unstable."
          >
            <p style={paragraphStyle}>
              A policy may be linked to Broker A in CRM, Broker B in the policy
              system and Broker C through a manual override. All three records
              may be valid for the same reporting date.
            </p>

            <p style={paragraphStyle}>
              Without an explicit rule, query results can depend on load order,
              accidental sorting, database execution plans or undocumented
              assumptions inside SQL.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate both the selected winner and the losing candidates."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Related concepts"
            title="Historical winner selection connects to several modeling patterns."
          >
            <div style={solutionGridStyle}>
              <RelatedConcept
                title="Historical Match Ambiguity"
                href="/learn/historical-match-ambiguity"
                text="Winner selection resolves cases where multiple historical candidates match the same join."
              />

              <RelatedConcept
                title="Relationship History"
                href="/learn/relationship-history"
                text="Changing relationships often require explicit winner rules for reporting."
              />

              <RelatedConcept
                title="Event Prioritization"
                href="/learn/event-prioritization"
                text="Prioritization is a common way to decide which event or state candidate wins."
              />

              <RelatedConcept
                title="Historical Conformance"
                href="/learn/historical-conformance"
                text="Competing timelines from multiple systems often require source precedence."
              />
            </div>
          </WhiteCard>
        </section>

        <TryItCard />
      </div>

      <Analytics />
    </main>
  );
}

function DarkExampleCard() {
  const [mode, setMode] = useState<WinnerMode>("manual_override");

  const selected =
    WINNER_MODES.find((item) => item.key === mode) ?? WINNER_MODES[0];

  function selectMode(nextMode: WinnerMode) {
    setMode(nextMode);

    track("interactive_example_changed", {
      example: "historical_winner_selection",
      mode: nextMode,
    });
  }

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Interactive Example</div>

      <h2 style={darkTitleStyle}>
        Three broker candidates match the same policy and reporting date. Which
        one should win?
      </h2>

      <p style={darkIntroTextStyle}>
        The correct answer depends on the business rule. The data issue is not
        only that multiple records exist. The real modeling decision is how the
        winner is selected.
      </p>

      <div style={interactiveLayoutStyle}>
        <div style={timelinePanelStyle}>
          <div style={timelineTitleStyle}>Candidate records</div>

          <div style={candidateGridStyle}>
            <CandidateCard
              source="CRM"
              broker="Broker A"
              detail="Visible latest"
            />
            <CandidateCard
              source="Policy System"
              broker="Broker B"
              detail="Trusted source"
            />
            <CandidateCard
              source="Manual Override"
              broker="Broker C"
              detail="Approved correction"
            />
          </div>
        </div>

        <div style={modePanelStyle}>
          <div style={timelineTitleStyle}>Winner rule</div>

          <div style={modeButtonGridStyle}>
            {WINNER_MODES.map((item) => {
              const active = item.key === mode;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectMode(item.key)}
                  style={{
                    ...modeButtonStyle,
                    background: active ? "#2563eb" : "#0f172a",
                    borderColor: active ? "#60a5fa" : "#334155",
                    color: active ? "#ffffff" : "#cbd5e1",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={resultPerspectiveCardStyle}>
            <div style={scenarioEyebrowStyle}>{selected.title}</div>

            <div style={bigResultStyle}>
              <span>Selected winner</span>
              <span style={winnerValueStyle}>{selected.value}</span>
            </div>

            <p style={resultExplanationStyle}>{selected.explanation}</p>
          </div>
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Key idea</div>

        <p style={exampleNoteTextStyle}>
          Historical winner selection should not be hidden in accidental SQL
          behavior. The rule should be explicit, testable and explainable to
          business users.
        </p>
      </div>
    </section>
  );
}

function CandidateCard({
  source,
  broker,
  detail,
}: {
  source: string;
  broker: string;
  detail: string;
}) {
  return (
    <div style={stateBoxStyle}>
      <div style={scenarioEyebrowStyle}>{source}</div>
      <div style={valueRowStyle}>
        <span style={valueLabelStyle}>{detail}</span>
        <span style={standardValueStyle}>{broker}</span>
      </div>
    </div>
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

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div style={chipRowStyle}>
      {chips.map((chip) => (
        <span key={chip} style={chipStyle}>
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

function RelatedConcept({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <a
      href={href}
      onClick={() => {
        track("related_pattern_clicked", {
          page: "historical_winner_selection",
          title,
          href,
        });
      }}
      style={relatedConceptStyle}
    >
      <strong>{title}</strong>
      <div>{text}</div>
    </a>
  );
}

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>Review your own historical model.</h2>

      <p style={tryItTextStyle}>
        Use the workbench when you need to validate whether your historical
        joins produce one explainable winner or ambiguous competing candidates.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "historical_winner_selection",
            cta: "review_model",
            source: "bottom_cta",
          });
        }}
        style={tryItButtonStyle}
      >
        Open the Workbench →
      </a>
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
  minWidth: 0,
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

const whiteCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
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
  overflowWrap: "break-word",
};

const axisGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const axisCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  lineHeight: 1.6,
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const chipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #bfdbfe",
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

const darkIntroTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  maxWidth: 820,
  color: "#cbd5e1",
  fontSize: 16,
  lineHeight: 1.7,
};

const interactiveLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginTop: 24,
};

const timelinePanelStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
};

const modePanelStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
};

const timelineTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 16,
};

const candidateGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const stateBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
};

const scenarioEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 8,
};

const valueRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 14,
  background: "#020617",
  border: "1px solid #334155",
  marginTop: 10,
};

const valueLabelStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 800,
};

const standardValueStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
};

const winnerValueStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#047857",
  fontSize: 13,
  fontWeight: 900,
};

const modeButtonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const modeButtonStyle: CSSProperties = {
  border: "1px solid #334155",
  borderRadius: 14,
  padding: "11px 12px",
  fontWeight: 900,
  cursor: "pointer",
  transition: "all 160ms ease",
};

const resultPerspectiveCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid #a7f3d0",
  background: "rgba(236, 253, 245, 0.12)",
};

const bigResultStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginTop: 12,
  padding: "14px 0",
  color: "#f8fafc",
  fontSize: 18,
  fontWeight: 900,
};

const resultExplanationStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 15,
  lineHeight: 1.6,
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

const relatedConceptStyle: CSSProperties = {
  display: "block",
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#334155",
  lineHeight: 1.6,
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