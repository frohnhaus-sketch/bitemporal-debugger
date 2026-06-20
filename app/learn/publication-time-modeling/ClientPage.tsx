"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type ReportMode = "valid" | "visible" | "published";

const TIME_AXES = [
  {
    title: "Valid time",
    question: "When was it true in the business?",
    example: "Contract valid from 01 Jan",
  },
  {
    title: "Visibility time",
    question: "When did the platform know it?",
    example: "Correction arrived on 15 Feb",
  },
  {
    title: "Publication time",
    question: "When was it officially published or used?",
    example: "Report published on 31 Jan",
  },
];

const VALIDATION_CHECKS = [
  "Valid time is separated from visibility time",
  "Publication time is modeled explicitly",
  "Published reports can be reproduced",
  "Corrections do not silently rewrite published outputs",
  "As-known and as-published queries are different by design",
  "Late-arriving records have defined publication behavior",
];

const REPORT_MODES = [
  {
    key: "valid" as ReportMode,
    label: "Valid truth",
    title: "Business-valid perspective",
    value: "Premium",
    explanation:
      "The corrected business truth says the customer segment was Premium from 01 Jan.",
  },
  {
    key: "visible" as ReportMode,
    label: "Visible knowledge",
    title: "Platform-visible perspective",
    value: "Premium",
    explanation:
      "The correction became visible to the data platform on 15 Feb. From that knowledge date onward, the platform can explain the corrected history.",
  },
  {
    key: "published" as ReportMode,
    label: "Published report",
    title: "Published reporting perspective",
    value: "Standard",
    explanation:
      "The official January report had already been published with Standard and must remain reproducible.",
  },
];

export default function TritemporalModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "publication_time_modeling",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "publication-time-modeling",
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

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={badgeStyle}>Elementary Pattern</div>

            <div
              style={{
                ...badgeStyle,
                background: "#fef3c7",
                border: "1px solid #fde68a",
                color: "#92400e",
              }}
            >
              Advanced
            </div>
          </div>

          <h1 style={h1Style}>Publication-Time Modeling</h1>

          <WhiteCard
            eyebrow="Quick answer"
            title="Publication-Time modeling separates valid time, visibility time and publication time."
          >
            <p style={paragraphStyle}>
              Use Publication-Time modeling when it is not enough to know what was
              true and what was known. You also need to know what was officially
              published, disclosed or used in a reporting output.
            </p>

            <p style={paragraphStyle}>
              This matters when published reports, regulatory submissions,
              customer statements or executive KPIs must remain reproducible
              even after corrected history arrives later.
            </p>
          </WhiteCard>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Core idea"
            title="Bitemporal modeling tracks truth and knowledge. Publication-Time modeling also tracks publication."
          >
            <p style={paragraphStyle}>
              Bitemporal models usually separate business-valid time from
              system-visible time. That allows you to answer what was true in
              the business and what the platform knew at a previous point in
              time.
            </p>

            <p style={paragraphStyle}>
              Publication-Time modeling adds a third axis: publication time. This
              captures when a result was officially published, frozen, disclosed
              or used by a downstream reporting process.
            </p>
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Three time axes"
            title="Each time axis answers a different historical question."
          >
            <div style={axisGridStyle}>
              {TIME_AXES.map((axis) => (
                <div key={axis.title} style={axisCardStyle}>
                  <strong>{axis.title}</strong>
                  <p>{axis.question}</p>
                  <span>{axis.example}</span>
                </div>
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="When it matters"
            title="Use Publication-Time modeling when published outputs have their own lifecycle."
          >
            <ChipRow
              chips={[
                "Regulatory reports",
                "Published KPIs",
                "Investor reporting",
                "Customer statements",
                "Audit evidence",
                "Restatements",
                "Frozen month-end reports",
              ]}
            />

            <p style={{ ...paragraphStyle, marginTop: 18 }}>
              If a corrected record arrives after a report has already been
              published, the corrected business truth and the published output
              may intentionally differ. Publication-Time modeling makes that
              difference explicit instead of hiding it inside ad-hoc reporting
              logic.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical risk"
            title="Without publication time, corrected history can silently rewrite published history."
          >
            <p style={paragraphStyle}>
              A January customer segment may be corrected from Standard to
              Premium in February. A bitemporal model can tell you when that
              correction became visible. But if the January report was already
              published before the correction was accepted, you also need to
              preserve what was actually published.
            </p>

            <p style={paragraphStyle}>
              Otherwise, a rebuilt report may look correct from today&apos;s
              data perspective but fail auditability because it no longer
              matches the official report that users saw at the time.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate truth, knowledge and publication separately."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Related concepts"
            title="Publication-Time modeling connects to several historical modeling patterns."
          >
            <div style={solutionGridStyle}>
              <RelatedConcept
                title="Bitemporal Modeling"
                href="/learn/bitemporal-modeling"
                text="Publication-Time modeling extends bitemporal modeling by adding publication time."
              />

              <RelatedConcept
                title="As-Known Reporting"
                href="/learn/as-known-reporting"
                text="As-known reporting asks what was visible at a previous knowledge date."
              />

              <RelatedConcept
                title="Snapshot Reproducibility"
                href="/learn/snapshot-reproducibility"
                text="Publication time helps reproduce reports exactly as they were released."
              />

              <RelatedConcept
                title="Historical Correction"
                href="/learn/historical-correction"
                text="Corrections need explicit rules for whether published outputs are restated or preserved."
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
  const [mode, setMode] = useState<ReportMode>("published");

  const selected =
    REPORT_MODES.find((item) => item.key === mode) ?? REPORT_MODES[0];

  const isPremium = selected.value === "Premium";

  function selectMode(nextMode: ReportMode) {
    setMode(nextMode);

    track("interactive_example_changed", {
      example: "publication_time_modeling",
      mode: nextMode,
    });
  }

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Interactive Example</div>

      <h2 style={darkTitleStyle}>
        The customer was corrected to Premium, but the official January report
        was already published as Standard.
      </h2>

      <p style={darkIntroTextStyle}>
        The same historical case can produce different answers depending on
        whether you ask for business-valid truth, platform-visible knowledge or
        the officially published output.
      </p>

      <div style={interactiveLayoutStyle}>
        <div style={timelinePanelStyle}>
          <div style={timelineTitleStyle}>Timeline</div>

          <div style={timeAxisStyle}>
            <div>01 Jan</div>
            <div>31 Jan</div>
            <div>15 Feb</div>
          </div>

          <div style={timelineLineWrapperStyle}>
            <div style={timelineLineStyle} />

            <div style={{ ...timelineDotStyle, left: "6%" }}>
              <span style={timelineDotLabelStyle}>Valid</span>
            </div>

            <div style={{ ...timelineDotStyle, left: "50%" }}>
              <span style={timelineDotLabelStyle}>Published</span>
            </div>

            <div style={{ ...timelineDotStyle, left: "94%" }}>
              <span style={timelineDotLabelStyle}>Visible</span>
            </div>
          </div>

          <div style={stateComparisonStyle}>
            <div style={stateBoxStyle}>
              <div style={scenarioEyebrowStyle}>Business-valid time</div>
              <div style={valueRowStyle}>
                <span style={valueLabelStyle}>Corrected truth</span>
                <span style={premiumValueStyle}>Premium</span>
              </div>
            </div>

            <div style={stateBoxStyle}>
              <div style={scenarioEyebrowStyle}>Visibility time</div>
              <div style={valueRowStyle}>
                <span style={valueLabelStyle}>Known by platform</span>
                <span style={premiumValueStyle}>Premium</span>
              </div>
            </div>

            <div style={stateBoxStyle}>
              <div style={scenarioEyebrowStyle}>Publication time</div>
              <div style={valueRowStyle}>
                <span style={valueLabelStyle}>Official report</span>
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
          Publication-Time modeling prevents one timeline from pretending to answer
          every historical question. Truth, knowledge and publication are
          related, but they are not the same thing.
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
    <a
      href={href}
      onClick={() => {
        track("related_pattern_clicked", {
          page: "publication_time_modeling",
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

      <h2 style={tryItTitleStyle}>Explore the Advisor for your own model.</h2>

      <p style={tryItTextStyle}>
        Use the advisor when you are unsure whether your model needs valid time,
        visible time, publication time or a simpler historical design.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "publication_time_modeling",
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

const timeAxisStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
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
  width: 120,
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
