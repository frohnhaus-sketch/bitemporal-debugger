"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function HistoricalCoverageGapPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_coverage_gap",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "historical-coverage-gap",
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

          <h1 style={h1Style}>Historical Coverage Gap</h1>

          <p style={heroTextStyle}>
            A Historical Coverage Gap occurs when a required historical period
            has no valid record.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="A required reporting period has no valid historical row."
          >
            <p style={paragraphStyle}>
              Historical models often assume that every required period is
              covered by at least one valid record. But in real source systems,
              histories are often incomplete.
            </p>

            <p style={paragraphStyle}>
              Records may start too late, end too early or contain missing
              intervals. When reporting depends on a missing period, joins fail,
              facts lose attributes or snapshots become incomplete.
            </p>

            <ChipRow
              chips={[
                "Missing attributes",
                "Dropped fact rows",
                "Incomplete snapshots",
                "Silent reporting gaps",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Each individual row can look valid while the timeline is incomplete."
          >
            <p style={paragraphStyle}>
              Coverage gaps usually appear between otherwise valid records. The
              problem often only becomes visible when another source, fact table
              or snapshot date needs that missing period.
            </p>

            <ChipRow
              chips={[
                "Partial source history",
                "Late-starting records",
                "Early-ending records",
                "Missing intervals",
                "Cross-system joins",
                "Snapshot requirements",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Make historical coverage explicit before joining."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Gap detection"
                text="Detect missing periods between valid_to and the next valid_from per entity."
              />
              <MiniCard
                title="Dimension completion"
                text="Backfill or extend dimension coverage where business rules allow it."
              />
              <MiniCard
                title="Unknown member"
                text="Use a controlled fallback member when coverage is missing but fact rows must remain."
              />
              <MiniCard
                title="Coverage contracts"
                text="Define which entities and periods must be covered before the model is publishable."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate coverage against the periods your reports actually need."
          >
            <CheckChipRow
              checks={[
                "Detect gaps between valid_to and next valid_from",
                "Check fact periods against dimension coverage",
                "Validate snapshot completeness",
                "Check required reporting periods per entity",
                "Validate cross-system temporal joins",
              ]}
            />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="Coverage gaps are easy to miss and expensive to debug later."
          >
            <p style={paragraphStyle}>
              Historical gaps are easy to miss because each individual record
              can look valid.
            </p>

            <p style={paragraphStyle}>
              The problem only appears when the model is queried for a missing
              period or joined against another historical source. Coverage
              validation makes these gaps visible before they create incorrect
              reports.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="historical_coverage_gap" />

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
        Customer C1 has history for January to March and May to December, but
        April is missing.
      </h2>

      <div style={timelineBoxStyle}>
        <TimelineRow label="Jan–Mar" status="Covered" active />
        <TimelineRow label="April" status="Gap: no valid customer row" />
        <TimelineRow label="May–Dec" status="Covered" active />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting impact</div>

        <p style={exampleNoteTextStyle}>
          Any April snapshot or April fact requiring this customer dimension
          will fail coverage validation or lose dimension attributes.
        </p>
      </div>
    </section>
  );
}

function TimelineRow({
  label,
  status,
  active,
}: {
  label: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        ...timelineRowStyle,
        background: active
          ? "rgba(219, 234, 254, 0.12)"
          : "rgba(251, 146, 60, 0.14)",
        border: active
          ? "1px solid rgba(147, 197, 253, 0.45)"
          : "1px solid rgba(251, 146, 60, 0.55)",
      }}
    >
      <div style={timelineLabelStyle}>{label}</div>
      <div
        style={{
          ...timelineStatusStyle,
          color: active ? "#bfdbfe" : "#fed7aa",
        }}
      >
        {status}
      </div>
    </div>
  );
}

function PatternTestCaseCard() {
  return (
    <section style={testCaseCardStyle}>
      <div style={testCaseEyebrowStyle}>Test case</div>

      <h2 style={testCaseTitleStyle}>
        Try this Historical Coverage Gap case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>Check whether the April coverage gap is marked or incorrectly hidden as covered.</li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Coverage-aware target table"
          description="Copy this table to validate an output where the April gap is explicitly marked."
          tableName="coverage_aware_target"
          value={COVERAGE_AWARE_TARGET_TABLE}
          tone="good"
        />

        <CopyTableCard
          title="Wrong target table"
          description="Copy this table to validate a risky output where the April coverage gap is hidden as covered."
          tableName="wrong_target"
          value={WRONG_TARGET_TABLE}
          tone="bad"
        />
      </div>

      <a
        href="/#target-table-validation"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "historical_coverage_gap",
            cta: "open_target_validation",
            source: "test_case_card",
            page_type: "interactive_example",
          });
        }}
        style={testCaseButtonStyle}
      >
        Open Target Table Validation →
      </a>
    </section>
  );
}

function CopyTableCard({
  title,
  description,
  tableName,
  value,
  tone,
}: {
  title: string;
  description: string;
  tableName: "coverage_aware_target" | "wrong_target";
  value: string;
  tone: "good" | "bad";
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isGood = tone === "good";

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        copyWithFallback(value);
      }
    } catch {
      copyWithFallback(value);
    }

    setCopied(true);

    track("example_table_copied", {
      example: "historical_coverage_gap",
      table: tableName,
    });

    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      style={{
        ...copyTableCardStyle,
        border: isGood ? "1px solid #86efac" : "1px solid #fecaca",
        background: isGood ? "#f0fdf4" : "#fef2f2",
      }}
    >
      <div style={copyTableTitleStyle}>{title}</div>
      <p style={copyTableDescriptionStyle}>{description}</p>

      <pre style={copyTablePreviewStyle}>{value}</pre>

      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          handleCopy();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...copyTableButtonStyle,
          background: copied ? "#16a34a" : isGood ? "#15803d" : "#b91c1c",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          boxShadow: hovered ? "0 10px 22px rgba(15, 23, 42, 0.22)" : "none",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {copied ? "✓ Copied" : "Copy table"}
      </button>
    </div>
  );
}

function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function DetectionCard() {
  return (
    <section style={detectionCardStyle}>
      <div style={detectionEyebrowStyle}>
        Detectable by Historical Modeling Workbench
      </div>

      <h2 style={detectionTitleStyle}>
        The Workbench can surface coverage gaps as validation findings.
      </h2>

      <ChipRow
        chips={[
          "VALID_GAP",
          "Historical Coverage Gap",
          "Timeline Evidence",
          "Snapshot Coverage Risk",
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
        Detect historical coverage gaps in your own model.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to validate temporal coverage,
        detect gaps and understand where historical joins or snapshots can fail.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "historical_coverage_gap",
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

const timelineBoxStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 20,
};

const timelineRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  padding: 14,
  borderRadius: 16,
};

const timelineLabelStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
};

const timelineStatusStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
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

const COVERAGE_AWARE_TARGET_TABLE = `customer_id,snapshot_date,customer_status,valid_from,valid_to,coverage_status
C1,2024-01-31,Active,2024-01-01,2024-01-31,covered
C1,2024-02-29,Active,2024-02-01,2024-02-29,covered
C1,2024-03-31,Active,2024-03-01,2024-03-31,covered
C1,2024-04-30,Unknown,2024-04-01,2024-04-30,coverage_gap_marked
C1,2024-05-31,Active,2024-05-01,2024-05-31,covered`;

const WRONG_TARGET_TABLE = `customer_id,snapshot_date,customer_status,valid_from,valid_to,coverage_status
C1,2024-01-31,Active,2024-01-01,2024-01-31,covered
C1,2024-02-29,Active,2024-02-01,2024-02-29,covered
C1,2024-03-31,Active,2024-03-01,2024-03-31,covered
C1,2024-04-30,,2024-04-01,2024-04-30,coverage_gap_unmarked
C1,2024-05-31,Active,2024-05-01,2024-05-31,covered`;

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

const testCaseCardStyle: CSSProperties = whiteCardStyle;

const testCaseEyebrowStyle: CSSProperties = eyebrowStyle;

const testCaseTitleStyle: CSSProperties = cardTitleStyle;

const testCaseTextStyle: CSSProperties = paragraphStyle;

const testCaseStepsStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  paddingLeft: 26,
  color: "#334155",
  fontSize: 16,
  lineHeight: 1.7,
  listStyleType: "decimal",
};

const testCaseGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const copyTableCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  overflow: "hidden",
};

const copyTableTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: 16,
  color: "#0f172a",
  marginBottom: 6,
};

const copyTableDescriptionStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.5,
};

const copyTablePreviewStyle: CSSProperties = {
  maxHeight: 180,
  overflow: "auto",
  padding: 12,
  borderRadius: 12,
  background: "#020617",
  color: "#e2e8f0",
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: "pre",
};

const copyTableButtonStyle: CSSProperties = {
  marginTop: 12,
  border: 0,
  borderRadius: 12,
  padding: "10px 14px",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  transition: "all 160ms ease",
};

const testCaseButtonStyle: CSSProperties = {
  display: "inline-flex",
  marginTop: 18,
  padding: "12px 18px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};