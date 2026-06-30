"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

type SnapshotMode = "original" | "rebuilt";

const MODES = [
  {
    key: "original" as SnapshotMode,
    label: "Original snapshot",
    title: "January snapshot as published",
    value: "120,000",
    explanation:
      "The January snapshot was published with the data and corrections known at the reporting cut-off.",
  },
  {
    key: "rebuilt" as SnapshotMode,
    label: "Rebuilt later",
    title: "January snapshot rebuilt in March",
    value: "128,500",
    explanation:
      "The same reporting period now includes late corrections and newer knowledge. The January result has drifted.",
  },
];

export default function SnapshotDriftPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "snapshot_drift",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "snapshot-drift",
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
            <div style={badgeStyle}>Engineering Challenge</div>
            <div style={interactiveBadgeStyle}>Interactive Example</div>
          </div>

          <h1 style={h1Style}>Snapshot Drift</h1>

          <WhiteCard
            eyebrow="Quick answer"
            title="Snapshot drift happens when the same historical reporting period produces different results later."
          >
            <p style={paragraphStyle}>
              Snapshot drift occurs when a report for January, March or any
              other historical period changes after it is rebuilt with newer
              data, late corrections or different transformation logic.
            </p>

            <p style={paragraphStyle}>
              The problem is not always that the new result is wrong. The
              problem is that the model does not clearly distinguish the
              originally published snapshot from the later corrected rebuild.
            </p>
          </WhiteCard>

          <div style={{ marginTop: 16 }}>
            <p style={paragraphStyle}>
              Snapshot drift occurs when historical reports change because
              underlying data or logic has been updated.
            </p>

            <ul
  style={{
    marginTop: 14,
    paddingLeft: 18,
    display: "grid",
    gap: 6,
    color: "#0f172a",
    fontWeight: 600,
  }}
>
              <li>Non-reproducible historical outputs</li>
              <li>Backfilled corrections affecting old reports</li>
              <li>Metric definition changes</li>
              <li>Rebuilt historical snapshots</li>
            </ul>
          </div>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <DarkExampleCard />

          <section style={{ marginTop: 20 }}>
            <h2>Core concepts in practice</h2>

            <p>
              Without temporal separation, even correct systems can produce
              shifting historical truth.
            </p>
          </section>

          <WhiteCard
            eyebrow="Why it happens"
            title="Old reporting periods are rebuilt with newer knowledge."
          >
            <p style={paragraphStyle}>
              A snapshot is often treated as a simple query result for a
              reporting date. But if the underlying source history changes, the
              same query may produce a different answer later.
            </p>

            <ChipRow
              chips={[
                "Late arriving records",
                "Backdated corrections",
                "Changed dimension history",
                "Rebuilt pipelines",
                "Changed business rules",
                "Missing publication time",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical symptoms"
            title="Users see different numbers for the same reporting period."
          >
            <CheckChipRow
              checks={[
                "Month-end totals change after reload",
                "Old dashboards no longer match exported reports",
                "Audit teams cannot reproduce previous submissions",
                "Backfills change historical KPIs",
                "Corrections leak into already published snapshots",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Root cause"
            title="Snapshot date, knowledge date and publication date are different concepts."
          >
            <p style={paragraphStyle}>
              A snapshot date answers which business period is being reported. A
              knowledge date answers what the platform knew when the query was
              evaluated. A publication date answers what was officially released
              to users.
            </p>

            <p style={paragraphStyle}>
              Snapshot drift appears when these concepts are collapsed into one
              column or hidden inside rebuild logic.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="How to prevent it"
            title="Make snapshot reproducibility explicit."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Persist published snapshots"
                text="Store the exact output that was released to reporting users."
              />
              <MiniCard
                title="Track visible time"
                text="Query historical reports using what was known at the reporting cut-off."
              />
              <MiniCard
                title="Track publication time"
                text="Store published_at, snapshot_version or reporting_run_id for frozen outputs."
              />
              <MiniCard
                title="Separate report modes"
                text="Distinguish original, as-known and corrected rebuilds."
              />
            </div>
          </WhiteCard>

          <section style={{ marginTop: 30 }}>
            <h2>How this pattern relates to other temporal models</h2>

            <p>
              Snapshot drift is a symptom of missing bitemporal or versioned
              modeling.
            </p>

            <ul>
              <li>Snapshot Reproducibility</li>
              <li>Bitemporal Modeling</li>
              <li>Historical Backfill</li>
              <li>Historical Correction</li>
            </ul>

            <p>
              It highlights the need for stable historical reconstruction
              layers.
            </p>
          </section>
          <WhiteCard
            eyebrow="Related patterns"
            title="Snapshot drift is solved by reproducibility and publication-time modeling."
          >
            <div style={solutionGridStyle}>
              <RelatedConcept
                title="Snapshot Reproducibility"
                href="/learn/snapshot-reproducibility"
                text="Defines how historical reports can be reproduced for the same reporting date."
              />
              <RelatedConcept
                title="Publication-Time Modeling"
                href="/learn/tritemporal-modeling"
                text="Separates what was true, what was known and what was officially published."
              />
              <RelatedConcept
                title="Bitemporal Modeling"
                href="/learn/bitemporal-modeling"
                text="Preserves when corrected history became visible to the platform."
              />
              <RelatedConcept
                title="Historical Correction"
                href="/learn/historical-correction"
                text="Handles late or retroactive corrections without silently rewriting history."
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
  const [mode, setMode] = useState<SnapshotMode>("original");

  const selected = MODES.find((item) => item.key === mode) ?? MODES[0];
  const hasDrifted = mode === "rebuilt";

  function selectMode(nextMode: SnapshotMode) {
    setMode(nextMode);

    track("interactive_example_changed", {
      example: "snapshot_drift",
      mode: nextMode,
    });
  }

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Interactive Example</div>

      <h2 style={darkTitleStyle}>
        The January snapshot was published as 120,000. A March rebuild now shows
        128,500.
      </h2>

      <p style={darkIntroTextStyle}>
        Toggle between the originally published snapshot and a later rebuild.
        The reporting period is the same, but the result changes.
      </p>

      <div style={interactiveLayoutStyle}>
        <div style={timelinePanelStyle}>
          <div style={timelineTitleStyle}>Timeline</div>

          <TimelineItem
            label="31 Jan"
            title="Snapshot published"
            text="January report is frozen at 120,000."
          />
          <TimelineItem
            label="12 Mar"
            title="Late correction arrives"
            text="A backdated record changes January history."
          />
          <TimelineItem
            label="15 Mar"
            title="Snapshot rebuilt"
            text="The January result now calculates as 128,500."
          />
        </div>

        <div style={modePanelStyle}>
          <div style={timelineTitleStyle}>Report mode</div>

          <div style={modeButtonGridStyle}>
            {MODES.map((item) => {
              const active = item.key === mode;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectMode(item.key)}
                  style={{
                    ...modeButtonStyle,
                    background: active ? "#2563eb" : "#0f172a",
                    borderColor: active ? "#60a5fa" : "#0f172a",
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
              borderColor: hasDrifted ? "#fed7aa" : "#bfdbfe",
              background: hasDrifted
                ? "rgba(255, 247, 237, 0.12)"
                : "rgba(239, 246, 255, 0.12)",
            }}
          >
            <div style={scenarioEyebrowStyle}>{selected.title}</div>

            <div style={bigResultStyle}>
              <span>January total</span>
              <span style={hasDrifted ? warningValueStyle : standardValueStyle}>
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
          Snapshot drift is not just a number changing. It is a missing modeling
          decision: should this report show the originally published output, the
          as-known view or the corrected rebuild?
        </p>
      </div>
    </section>
  );
}

function TimelineItem({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(148, 163, 184, 0.24)",
      }}
    >
      <div
        style={{
          color: "#bfdbfe",
          fontSize: 13,
          fontWeight: 900,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#ffffff",
          fontWeight: 900,
          marginBottom: 4,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#cbd5e1",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {text}
      </div>
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
          page: "snapshot_drift",
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

      <h2 style={tryItTitleStyle}>
        Validate whether your snapshots can drift.
      </h2>

      <p style={tryItTextStyle}>
        Use Target Table Validation to check snapshot grain, historical
        semantics and reproducibility risks in generated reporting tables.
      </p>

      <a
        href="/#target-table-validation"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "snapshot_drift",
            cta: "target_table_validation",
            source: "bottom_cta",
          });
        }}
        style={tryItButtonStyle}
      >
        Validate a target table →
      </a>
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
  color: "#0f172a",
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

const exampleNoteStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #0f172a",
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
  color: "#0f172a",
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

const interactiveLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginTop: 24,
};

const timelineTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 16,
};

const modePanelStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
};

const modeButtonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const timelinePanelStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
};

const modeButtonStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
};

const resultPerspectiveCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid",
};

const resultExplanationStyle: CSSProperties = {
  marginTop: 12,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.6,
};

const standardValueStyle: CSSProperties = {
  color: "#60a5fa",
  fontWeight: 900,
  fontSize: 22,
};

const warningValueStyle: CSSProperties = {
  color: "#fb923c",
  fontWeight: 900,
  fontSize: 22,
};

const scenarioEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 8,
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

const relatedConceptStyle: CSSProperties = {
  display: "block",
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#0f172a",
  lineHeight: 1.6,
};

const interactiveBadgeStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};
