"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type CorrectionMode =
  | "overwrite"
  | "append_version"
  | "bitemporal"
  | "persisted_snapshot";

const CORRECTION_MODES = [
  {
    key: "overwrite" as CorrectionMode,
    label: "Overwrite",
    title: "Overwrite corrected history",
    result: "January report now shows Premium",
    risk: "Previously published knowledge is lost.",
    explanation:
      "The old value is replaced. This may be acceptable for simple corrections, but it cannot explain what users originally saw.",
  },
  {
    key: "append_version" as CorrectionMode,
    label: "Append version",
    title: "Append a corrected valid-time version",
    result: "Current January truth shows Premium",
    risk: "As-known reporting is still unclear unless visibility is tracked.",
    explanation:
      "The model keeps valid-time history, but it may still not preserve when the correction became visible.",
  },
  {
    key: "bitemporal" as CorrectionMode,
    label: "Bitemporal",
    title: "Preserve valid time and visible time",
    result: "January as-known shows Retail. Corrected truth shows Premium.",
    risk: "More complex, but reproducible.",
    explanation:
      "The correction is valid for January but visible from March. Both reporting perspectives remain explainable.",
  },
  {
    key: "persisted_snapshot" as CorrectionMode,
    label: "Persist snapshot",
    title: "Persist the published report output",
    result: "Original January report remains Retail",
    risk: "Corrected truth must be handled separately.",
    explanation:
      "The published snapshot is stored as an output. This is useful when exact report reproduction is more important than recalculation.",
  },
];

export default function HistoricalCorrectionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_correction",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "historical-correction",
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
            <div style={badgeStyle}>Interactive Pattern</div>
          </div>

          <h1 style={h1Style}>Historical Correction</h1>

          <p style={heroTextStyle}>
            Historical Correction preserves corrected business history without
            losing what was previously known.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Corrected history can conflict with previously published reports."
          >
            <p style={paragraphStyle}>
              Source systems frequently correct past data. A contract may
              receive a backdated change. A customer attribute may be corrected
              months later. A policy status may be updated retroactively.
            </p>

            <p style={paragraphStyle}>
              Historical reporting must decide whether reports should show the
              corrected truth or the information that was known at the time.
            </p>

            <ChipRow
              chips={[
                "Changing past reports",
                "Audit disagreement",
                "Lost reproducibility",
                "Invisible retroactive changes",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Business truth and reporting knowledge do not always change at the same time."
          >
            <p style={paragraphStyle}>
              A correction may be valid for a past business period, but only
              become visible to the reporting system later. Without explicit
              correction handling, rebuilt reports can look different from the
              reports originally published.
            </p>

            <ChipRow
              chips={[
                "Backdated changes",
                "Corrected master data",
                "Policy restatements",
                "Late source fixes",
                "Visible-time gaps",
                "Audit requirements",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Preserve both corrected truth and historical knowledge."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Bitemporal modeling"
                text="Track both valid time and visible time so corrections can be placed on the correct timelines."
              />
              <MiniCard
                title="As-known reporting"
                text="Rebuild reports using only information that was visible at the reporting time."
              />
              <MiniCard
                title="Persisted snapshots"
                text="Store published report outputs when exact reproducibility is required."
              />
              <MiniCard
                title="Version retention"
                text="Keep previous knowledge states instead of overwriting corrected history in place."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Measure how corrections affect historical reporting."
          >
            <CheckChipRow
              checks={[
                "Detect retroactive source changes",
                "Validate report reproducibility",
                "Track visible-time history",
                "Compare current truth vs historical knowledge",
                "Measure correction impact on published reports",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Historical corrections are a main reason to move beyond simple SCD2."
          >
            <p style={paragraphStyle}>
              Without correction tracking, it becomes impossible to explain why
              reports generated in the past differ from reports generated today.
            </p>

            <p style={paragraphStyle}>
              Historical Correction introduces the distinction between business
              truth and reporting knowledge.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="historical_correction" />

        <TryItCard />
      </div>
    </main>
  );
}

function DarkExampleCard() {
  const [mode, setMode] = useState<CorrectionMode>("bitemporal");

  const selected =
    CORRECTION_MODES.find((item) => item.key === mode) ?? CORRECTION_MODES[0];

  function selectMode(nextMode: CorrectionMode) {
    setMode(nextMode);

    track("interactive_example_changed", {
      example: "historical_correction",
      mode: nextMode,
    });
  }

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Interactive Pattern</div>

      <h2 style={darkTitleStyle}>
        A January report shows Retail. In March, a correction says January should have been Premium.
      </h2>

      <p style={darkIntroTextStyle}>
        Choose how the model handles the correction. Each strategy answers a different reporting question.
      </p>

      <div style={interactiveGridStyle}>
        <div style={timelinePanelStyle}>
          <div style={panelTitleStyle}>Correction timeline</div>

          <div style={monthAxisStyle}>
            <div>Jan</div>
            <div>Feb</div>
            <div>Mar</div>
            <div>Apr</div>
          </div>

          <div style={timelineLineWrapperStyle}>
            <div style={timelineLineStyle} />

            <div style={{ ...timelineDotStyle, left: "4%" }}>
              <span style={timelineDotLabelStyle}>Report published</span>
            </div>

            <div style={{ ...timelineDotStyle, left: "66%" }}>
              <span style={timelineDotLabelStyle}>Correction arrives</span>
            </div>
          </div>

          <div style={stateGridStyle}>
            <div style={stateBoxStyle}>
              <div style={correctionLabelStyle}>Known in January</div>
              <div style={valueRowStyle}>
                <span>Customer Segment</span>
                <strong style={retailValueStyle}>Retail</strong>
              </div>
            </div>

            <div style={stateBoxStyle}>
              <div style={correctionLabelStyle}>Corrected in March</div>
              <div style={valueRowStyle}>
                <span>January Segment</span>
                <strong style={premiumValueStyle}>Premium</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={strategyPanelStyle}>
          <div style={panelTitleStyle}>Correction strategy</div>

          <div style={modeButtonGridStyle}>
            {CORRECTION_MODES.map((item) => {
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

          <div style={resultCardStyle}>
            <div style={correctionLabelStyle}>{selected.title}</div>

            <div style={resultHeadlineStyle}>{selected.result}</div>

            <p style={resultTextStyle}>{selected.explanation}</p>

            <div style={riskBoxStyle}>
              <strong>Trade-off:</strong> {selected.risk}
            </div>
          </div>
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting question</div>

        <p style={exampleNoteTextStyle}>
          Should a rebuilt January report show Retail because that was known in January,
          or Premium because that is the corrected business truth?
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

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Explore correction and reporting-time behavior in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about corrected history,
        visible-time logic, historical joins and reproducible reporting.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "historical_correction",
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
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
    },
    {
      title: "Historical Coverage Gap",
      href: "/learn/historical-coverage-gap",
      key: "historical_coverage_gap",
    },
    {
      title: "Historical Overlap",
      href: "/learn/historical-overlap",
      key: "historical_overlap",
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

const correctionLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 10,
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

const darkIntroTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  maxWidth: 820,
  color: "#cbd5e1",
  fontSize: 16,
  lineHeight: 1.7,
};

const interactiveGridStyle: CSSProperties = {
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

const strategyPanelStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
};

const panelTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 16,
};

const monthAxisStyle: CSSProperties = {
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

const stateGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const stateBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
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
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 800,
};

const retailValueStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
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

const modeButtonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
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

const resultCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(239, 246, 255, 0.1)",
  border: "1px solid #bfdbfe",
};

const resultHeadlineStyle: CSSProperties = {
  marginTop: 12,
  color: "#ffffff",
  fontSize: 19,
  lineHeight: 1.3,
  fontWeight: 900,
};

const resultTextStyle: CSSProperties = {
  marginTop: 12,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 15,
  lineHeight: 1.6,
};

const riskBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 14,
  background: "#020617",
  border: "1px solid #334155",
  color: "#e2e8f0",
  fontSize: 14,
  lineHeight: 1.5,
};