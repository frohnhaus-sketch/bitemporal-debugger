"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

const COMPARISON_ROWS = [
  {
    topic: "Main question",
    scd2: "What was true in the business timeline?",
    bitemporal: "What was true, and what was visible at the time?",
  },
  {
    topic: "Time axes",
    scd2: "Usually valid_from and valid_to",
    bitemporal: "Valid time plus visible/system/transaction time",
  },
  {
    topic: "Corrections",
    scd2: "Often overwrite or create a corrected valid-time version",
    bitemporal: "Preserve when the correction became visible",
  },
  {
    topic: "Best for",
    scd2: "Historical attributes and point-in-time reporting",
    bitemporal: "Auditability, reproducibility and corrected history",
  },
];

const VALIDATION_CHECKS = [
  "One valid version per key and reporting date",
  "No unintended valid-time overlaps",
  "No missing historical coverage",
  "Visible-time correction behavior is explicit",
  "Historical reports can be reproduced as originally known",
  "Late-arriving records are handled deliberately",
];

type ReportMode =
  | "original"
  | "rebuilt_scd2"
  | "rebuilt_bitemporal_as_known"
  | "rebuilt_bitemporal_corrected";

const REPORT_MODES = [
  {
    key: "original" as ReportMode,
    label: "Original report",
    title: "March report as originally known",
    value: "Standard",
    explanation:
      "In March, the platform only knew the customer segment as Standard. The correction to Premium had not arrived yet.",
  },
  {
    key: "rebuilt_scd2" as ReportMode,
    label: "SCD2 rebuild",
    title: "March report rebuilt later with SCD2",
    value: "Premium",
    explanation:
      "SCD2 resolves the corrected valid-time version. The March report now shows Premium.",
  },
  {
    key: "rebuilt_bitemporal_as_known" as ReportMode,
    label: "As-known",
    title: "March report reproduced as originally known",
    value: "Standard",
    explanation:
      "The report is queried with the March knowledge date. The Premium correction was not visible yet.",
  },
  {
    key: "rebuilt_bitemporal_corrected" as ReportMode,
    label: "Corrected",
    title: "March report using corrected history",
    value: "Premium",
    explanation:
      "The report is queried with current knowledge. The Premium correction is now visible.",
  },
];

export default function Scd2VsBitemporalPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "scd2_vs_bitemporal",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "scd2-vs-bitemporal",
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
            <div style={badgeStyle}>Interactive Example</div>
          </div>

          <h1 style={h1Style}>SCD2 vs Bitemporal Modeling</h1>

          <WhiteCard
            eyebrow="Quick answer"
            title="When should you use SCD2 and when should you use bitemporal modeling?"
          >
            <p style={paragraphStyle}>
              Use SCD2 when you only need business-valid history.
            </p>
          
            <p style={paragraphStyle}>
              Use bitemporal modeling when you must preserve both business-valid history
              and the history of when information became visible to the platform.
            </p>
          </WhiteCard>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Core idea"
            title="SCD2 answers what was valid. Bitemporal modeling also answers what was visible."
          >
            <p style={paragraphStyle}>
              Slowly Changing Dimension Type 2 is one of the most common ways
              to model changing attributes over time. It creates a new row when
              a relevant attribute changes and uses validity intervals to
              resolve the correct version for a reporting date.
            </p>

            <p style={paragraphStyle}>
              Bitemporal modeling goes one step further. It separates the time
              when something was valid in the business from the time when the
              data platform could see it. This becomes important when history
              can be corrected, backdated or arrive late.
            </p>
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Comparison"
            title="The practical difference between SCD2 and bitemporal modeling."
          >
            <div style={comparisonGridStyle}>
              {COMPARISON_ROWS.map((row) => (
                <div key={row.topic} style={comparisonRowStyle}>
                  <div style={comparisonTopicStyle}>{row.topic}</div>

                  <div style={comparisonCellStyle}>
                    <strong>SCD2</strong>
                    <p>{row.scd2}</p>
                  </div>

                  <div style={comparisonCellStyle}>
                    <strong>Bitemporal</strong>
                    <p>{row.bitemporal}</p>
                  </div>
                </div>
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="When SCD2 is enough"
            title="Use SCD2 when you only need business-valid history."
          >
            <ChipRow
              chips={[
                "Customer segment history",
                "Product category history",
                "Contract status history",
                "Point-in-time reporting",
                "Stable historical sources",
              ]}
            />

            <p style={{ ...paragraphStyle, marginTop: 18 }}>
              SCD2 is often sufficient when past reports are allowed to use the
              latest corrected version of history, or when the source system
              does not provide meaningful information about when a correction
              became visible.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="When bitemporal is needed"
            title="Use bitemporal modeling when corrected or late-arriving history matters."
          >
            <ChipRow
              chips={[
                "Backdated changes",
                "Late arriving dimensions",
                "Audit reporting",
                "Snapshot reproducibility",
                "Regulatory reporting",
                "Corrected source history",
              ]}
            />

            <p style={{ ...paragraphStyle, marginTop: 18 }}>
              Bitemporal modeling is useful when users need to reproduce a
              historical report as it was known at the time, not just as it
              would be calculated using today's corrected history.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical risk"
            title="A model can be valid as SCD2 and still fail reproducibility."
          >
            <p style={paragraphStyle}>
              A corrected customer segment may be valid for March, but the
              correction might only have arrived in May. A March report rebuilt
              in June may therefore show a different result than the report
              originally published in March.
            </p>

            <p style={paragraphStyle}>
              This is not necessarily an SCD2 bug. It is a missing visible time
              decision. Bitemporal modeling makes that decision explicit.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate both valid-time behavior and correction behavior."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Related concepts"
            title="SCD2 and bitemporal modeling connect to several historical modeling patterns."
          >
            <div style={solutionGridStyle}>
              <RelatedConcept
                title="State Modeling"
                href="/learn/state-modeling"
                text="SCD2 is a common implementation of state modeling with valid-time intervals."
              />

              <RelatedConcept
                title="Snapshot Reproducibility"
                href="/learn/snapshot-reproducibility"
                text="Bitemporal models help reproduce reports as they were known at a previous point in time."
              />

              <RelatedConcept
                title="Dimension Completion"
                href="/learn/dimension-completion"
                text="Even a correct SCD2 dimension may need completion when it does not cover all fact periods."
              />

              <RelatedConcept
                title="Historical Conformance"
                href="/learn/historical-conformance"
                text="Multiple source systems often require explicit decisions about which timeline drives reporting."
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
  const [mode, setMode] = useState<ReportMode>("original");

  const selected =
    REPORT_MODES.find((item) => item.key === mode) ?? REPORT_MODES[0];

  const isPremium = selected.value === "Premium";

  function selectMode(nextMode: ReportMode) {
    setMode(nextMode);

    track("interactive_example_changed", {
      example: "scd2_vs_bitemporal",
      mode: nextMode,
    });
  }

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Interactive example</div>

      <h2 style={darkTitleStyle}>
        In March, the platform shows Standard. In May, a correction says March
        should have been Premium.
      </h2>

      <p style={darkIntroTextStyle}>
        The business-valid date stays March. What changes is the knowledge date:
        do you query what is corrected today, or what was known back then?
      </p>

      <div style={interactiveLayoutStyle}>
        <div style={timelinePanelStyle}>
          <div style={timelineTitleStyle}>Timeline</div>

          <div style={timeAxisStyle}>
            <div>Mar</div>
            <div>Apr</div>
            <div>May</div>
            <div>Jun</div>
          </div>

          <div style={timelineLineWrapperStyle}>
            <div style={timelineLineStyle} />

            <div style={{ ...timelineDotStyle, left: "4%" }}>
              <span style={timelineDotLabelStyle}>March report</span>
            </div>

            <div style={{ ...timelineDotStyle, left: "66%" }}>
              <span style={timelineDotLabelStyle}>Correction arrives</span>
            </div>
          </div>

          <div style={stateComparisonStyle}>
            <div style={stateBoxStyle}>
              <div style={scenarioEyebrowStyle}>Business-valid reality</div>
              <div style={valueRowStyle}>
                <span style={valueLabelStyle}>Valid for March</span>
                <span style={premiumValueStyle}>Premium</span>
              </div>
            </div>

            <div style={stateBoxStyle}>
              <div style={scenarioEyebrowStyle}>Visible in March</div>
              <div style={valueRowStyle}>
                <span style={valueLabelStyle}>Known by platform</span>
                <span style={standardValueStyle}>Standard</span>
              </div>
            </div>
          </div>
        </div>

        <div style={modePanelStyle}>
          <div style={timelineTitleStyle}>Query perspective</div>

          <div style={modeButtonGridStyle}>
            {REPORT_MODES.map((item) => {
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

          <div
            style={{
              ...resultPerspectiveCardStyle,
              borderColor: isPremium ? "#a7f3d0" : "#bfdbfe",
              background: isPremium
                ? "rgba(236, 253, 245, 0.12)"
                : "rgba(239, 246, 255, 0.12)",
            }}
          >
            <div style={scenarioEyebrowStyle}>{selected.title}</div>

            <div style={bigResultStyle}>
              <span>Customer segment</span>
              <span style={isPremium ? premiumValueStyle : standardValueStyle}>
                {selected.value}
              </span>
            </div>

            <p style={resultExplanationStyle}>{selected.explanation}</p>
          </div>
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Key idea</div>

        <p style={exampleNoteTextStyle}>
          SCD2 can tell you the corrected valid-time truth. Bitemporal modeling
          can additionally reproduce what the platform knew at the time the
          report was created.
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
    <a href={href} style={relatedConceptStyle}>
      <strong>{title}</strong>
      <div>{text}</div>
    </a>
  );
}

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Explore the Advisor for your own model.
      </h2>

      <p style={tryItTextStyle}>
        Use the advisor when you are unsure whether your historical model only needs
        valid-time history or must also preserve what was known at reporting time.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "scd2_vs_bitemporal",
            cta: "explore_advisor",
            source: "bottom_cta",
          });
        }}
        style={tryItButtonStyle}
      >
        Explore the Advisor →
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

const premiumValueStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#047857",
  fontSize: 13,
  fontWeight: 900,
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

const comparisonGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 18,
};

const comparisonRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const comparisonTopicStyle: CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 900,
};

const comparisonCellStyle: CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
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

const timeAxisStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 12,
};

const timelineLineWrapperStyle: CSSProperties = {
  position: "relative",
  height: 76,
  marginBottom: 18,
};

const timelineLineStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 32,
  height: 4,
  borderRadius: 999,
  background: "#334155",
};

const timelineDotStyle: CSSProperties = {
  position: "absolute",
  top: 20,
  width: 26,
  height: 26,
  borderRadius: 999,
  background: "#fde047",
  border: "3px solid #fef9c3",
  transform: "translateX(-50%)",
};

const timelineDotLabelStyle: CSSProperties = {
  position: "absolute",
  top: 34,
  left: "50%",
  transform: "translateX(-50%)",
  width: 130,
  textAlign: "center",
  color: "#fde68a",
  fontSize: 12,
  fontWeight: 900,
};

const stateComparisonStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const stateBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
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
  border: "1px solid",
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