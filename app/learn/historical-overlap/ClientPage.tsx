"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const CLEAN_TARGET_TABLE = `customer_id,customer_segment,valid_from,valid_to
C1,Retail,2024-01-01,2024-04-01
C1,Premium,2024-04-01,2025-01-01`;

const OVERLAP_TARGET_TABLE = `customer_id,customer_segment,valid_from,valid_to,overlap_status
C1,Retail,2024-01-01,2024-06-30,overlap
C1,Premium,2024-04-01,2024-12-31,overlap`;

export default function HistoricalOverlapPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_overlap",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "historical-overlap",
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

          <h1 style={h1Style}>Historical Overlap</h1>

          <p style={heroTextStyle}>
            A Historical Overlap occurs when multiple records are valid for the
            same business entity at the same point in time.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="One entity has multiple active states at the same reporting date."
          >
            <p style={paragraphStyle}>
              Historized data models typically assume that a business entity has
              exactly one valid state at any reporting date.
            </p>

            <p style={paragraphStyle}>
              When validity intervals overlap, multiple states become active at
              the same time. Historical joins, snapshots and aggregations can no
              longer determine a single historical truth.
            </p>

            <ChipRow
              chips={[
                "Duplicate fact rows",
                "Join ambiguity",
                "Incorrect aggregations",
                "Multiple active states",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Root causes"
            title="Overlaps usually come from incomplete or inconsistent historization rules."
          >
            <p style={paragraphStyle}>
              Historical overlaps often remain hidden because each individual
              row can look valid. The problem appears when rows are compared
              within the same business key and timeline.
            </p>

            <ChipRow
              chips={[
                "Missing end-dating",
                "Duplicate SCD2 rows",
                "Backdated corrections",
                "Parallel source histories",
                "Incorrect merge logic",
                "Inclusive boundary mistakes",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Enforce one active state per entity and reporting date."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Fix interval boundaries"
                text="Correct valid_from and valid_to so adjacent records do not overlap unexpectedly."
              />
              <MiniCard
                title="Deduplicate versions"
                text="Remove or consolidate duplicate business-key versions that represent the same state."
              />
              <MiniCard
                title="Apply priority rules"
                text="When overlaps are expected, define deterministic rules for which version wins."
              />
              <MiniCard
                title="Validate before joins"
                text="Run overlap checks before using historized tables in temporal joins or snapshots."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Detect overlaps before they create downstream reporting errors."
          >
            <CheckChipRow
              checks={[
                "Detect overlapping validity intervals",
                "Validate one active state per reporting date",
                "Check temporal join cardinality",
                "Detect duplicate historical matches",
                "Validate dimension consistency",
              ]}
            />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="Overlaps are one of the most important quality checks for historized dimensions."
          >
            <p style={paragraphStyle}>
              Historical overlaps often remain hidden until a temporal join or
              snapshot is executed.
            </p>

            <p style={paragraphStyle}>
              The overlap may look harmless in the source table but can cause
              large reporting errors downstream, especially duplicate facts,
              unstable KPIs and ambiguous joins.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="historical_overlap" />

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
        Customer C1 has two active segment records from April to June.
      </h2>

      <div style={overlapGridStyle}>
        <HistoryRow label="Segment = Retail" range="Jan – Jun" active />
        <HistoryRow label="Segment = Premium" range="Apr – Dec" active />
        <HistoryRow
          label="Overlap"
          range="Apr – Jun has two active states"
          warning
        />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting impact</div>

        <p style={exampleNoteTextStyle}>
          A report for May cannot uniquely determine which customer segment
          should be used.
        </p>
      </div>
    </section>
  );
}

function HistoryRow({
  label,
  range,
  active,
  warning,
}: {
  label: string;
  range: string;
  active?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...historyRowStyle,
        background: warning
          ? "rgba(251, 146, 60, 0.14)"
          : "rgba(219, 234, 254, 0.12)",
        border: warning
          ? "1px solid rgba(251, 146, 60, 0.55)"
          : "1px solid rgba(147, 197, 253, 0.45)",
      }}
    >
      <div style={historyLabelStyle}>{label}</div>
      <div
        style={{
          ...historyRangeStyle,
          color: warning ? "#fed7aa" : active ? "#bfdbfe" : "#cbd5e1",
        }}
      >
        {range}
      </div>
    </div>
  );
}

function PatternTestCaseCard() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  return (
    <section style={testCaseCardStyle}>
      <div style={testCaseEyebrowStyle}>Test case</div>

      <h2 style={testCaseTitleStyle}>
        Try this Historical Overlap case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>Check whether overlapping valid-time intervals are detected.</li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Continuous target table"
          description="Copy this table to validate non-overlapping historical intervals."
          tableName="clean_target"
          value={CLEAN_TARGET_TABLE}
          tone="good"
          onExampleReady={setSelectedExample}
        />

        <CopyTableCard
          title="Overlap target table"
          description="Copy this table to validate a risky output with overlapping valid-time intervals."
          tableName="overlap_target"
          value={OVERLAP_TARGET_TABLE}
          tone="bad"
          onExampleReady={setSelectedExample}
        />
      </div>

      <button
        type="button"
        disabled={!selectedExample}
        onClick={() => {
          if (!selectedExample) return;

          track("example_model_cta_clicked", {
            example: "historical-overlap",
            cta: "open_target_validation_with_example",
            source: "test_case_card",
            page_type: "interactive_example",
            selectedExample,
          });

          window.location.href = "/#target-table-validation";
        }}
        style={{
          ...testCaseButtonStyle,
          border: "none",
          opacity: selectedExample ? 1 : 0.45,
          cursor: selectedExample ? "pointer" : "not-allowed",
        }}
      >
        {selectedExample
          ? "Open Validation with Example →"
          : "Use an example first"}
      </button>
    </section>
  );
}

function CopyTableCard({
  title,
  description,
  tableName,
  value,
  tone,
  onExampleReady,
}: {
  title: string;
  description: string;
  tableName: string;
  value: string;
  tone: "good" | "bad";
  onExampleReady: (tableName: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isGood = tone === "good";

  async function handleCopy() {
    localStorage.setItem("target_validation_prefill", value);
    localStorage.setItem("target_validation_prefill_name", tableName);

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Prefill still works even if clipboard access is blocked.
    }

    setCopied(true);
    onExampleReady(tableName);

    localStorage.setItem("target_validation_prefill", value);
    localStorage.setItem("target_validation_prefill_name", tableName);
    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("example_table_loaded_for_validation", {
      example: "historical_overlap",
      table: tableName,
      inputLength: value.length,
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
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...copyTableButtonStyle,
          background: copied ? "#16a34a" : isGood ? "#15803d" : "#b91c1c",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          boxShadow: hovered ? "0 10px 22px rgba(15, 23, 42, 0.22)" : "none",
        }}
      >
        {copied ? "✓ Example ready" : "Use this example"}
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
        The Workbench can surface overlapping historical intervals as validation
        findings.
      </h2>

      <ChipRow
        chips={[
          "OVERLAP",
          "Historical Overlap",
          "Multiple Active States",
          "Join Ambiguity Risk",
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
        Detect historical overlaps in your own historized data.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to find overlapping intervals,
        inspect timeline evidence and understand where temporal joins become
        ambiguous.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "historical_overlap",
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

const overlapGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 20,
};

const historyRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  padding: 14,
  borderRadius: 16,
};

const historyLabelStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
};

const historyRangeStyle: CSSProperties = {
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
