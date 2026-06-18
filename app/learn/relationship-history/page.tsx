"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const EXPECTED_ROWS = [
  ["Snapshot Date", "2024-08-31"],
  ["Policy", "P123"],
  ["Broker", "Broker B"],
];

const WRONG_ROWS = [
  ["Snapshot Date", "2024-08-31"],
  ["Policy", "P123"],
  ["Broker", "Broker A / Current Broker"],
];

const HISTORIZED_RELATIONSHIP_TARGET_TABLE = `policy_id,broker_id,snapshot_date,valid_from,valid_to,relationship_status
P123,Broker B,2024-08-31,2024-07-01,2024-12-31,historized_relationship`;

const WRONG_TARGET_TABLE = `policy_id,broker_id,snapshot_date,valid_from,valid_to,relationship_status
P123,Broker A,2024-08-31,2024-01-01,2024-12-31,current_relationship_used`;

export default function RelationshipHistoryPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "relationship_history",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "relationship-history",
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

          <h1 style={h1Style}>Relationship History</h1>

          <p style={heroTextStyle}>
            Relationship History models associations between business entities
            that change over time.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="The relationship between two entities can change just like the entities themselves."
          >
            <p style={paragraphStyle}>
              Most historical models focus on entities such as customers,
              contracts or products. However, the relationships between these
              entities often change over time as well.
            </p>

            <p style={paragraphStyle}>
              A customer may switch advisors. A policy may move to a different
              broker. An employee may change departments. Historical reporting
              requires not only the correct entity state, but also the correct
              relationship state.
            </p>

            <ChipRow
              chips={[
                "Current-state attribution",
                "Missing relationship history",
                "Overlapping assignments",
                "Relationship gaps",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Relationships are often treated as simple foreign keys even when they are time-dependent."
          >
            <p style={paragraphStyle}>
              In many models, relationships are stored as current references:
              current broker, current advisor, current department or current
              sales organization. This works for current-state reporting, but it
              breaks historical attribution.
            </p>

            <p style={paragraphStyle}>
              Once reporting asks “who owned this at the reporting date?”, the
              relationship itself must become historized.
            </p>

            <ChipRow
              chips={[
                "Current foreign keys",
                "Missing valid-time periods",
                "One-to-many changes",
                "Late relationship updates",
                "Cross-system ownership",
                "Historical attribution",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Model the relationship as its own historized object."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Historized bridge"
                text="Store the association between two entities in a bridge table with valid_from and valid_to."
              />
              <MiniCard
                title="SCD2 relationship"
                text="Version the relationship when the linked entity changes, just like a historized dimension."
              />
              <MiniCard
                title="Bitemporal tracking"
                text="Track visible time as well when relationship corrections or late updates can change past attribution."
              />
              <MiniCard
                title="Attribution rule"
                text="Document whether reports use relationship-at-event-time, snapshot-date or as-known attribution."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that each reporting date resolves to the intended relationship."
          >
            <CheckChipRow
              checks={[
                "Detect overlapping relationship assignments",
                "Detect relationship coverage gaps",
                "Validate one active relationship where required",
                "Check facts against relationship validity",
                "Compare historical attribution with expected ownership",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Historical attribution often depends more on relationship history than on entity history."
          >
            <p style={paragraphStyle}>
              Commission reporting, portfolio reporting and organizational KPIs
              all depend on knowing which relationship was active at a specific
              point in time.
            </p>

            <p style={paragraphStyle}>
              Ignoring relationship history can produce historically incorrect
              reports even when all dimensions are perfectly historized.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="relationship_history" />

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
        A policy moves from Broker A to Broker B during the year.
      </h2>

      <div style={relationshipTimelineStyle}>
        <TimelineItem label="Policy P123" value="Broker A" range="Jan – Jun" />
        <TimelineItem label="Policy P123" value="Broker B" range="Jul – Dec" />
      </div>

      <div style={questionCardStyle}>
        <div style={questionIconStyle}>?</div>

        <div>
          <div style={questionBadgeStyle}>Reporting question</div>
          <div style={questionTextStyle}>
            Who should receive attribution for an August snapshot: Broker A,
            Broker B, or the current broker?
          </div>
        </div>
      </div>

      <div style={comparisonGridStyle}>
        <ResultCard
          title="Expected Result (Historical)"
          rows={EXPECTED_ROWS}
          tone="good"
        />
        <ResultCard
          title="Common Wrong Result (Risk)"
          rows={WRONG_ROWS}
          tone="bad"
        />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Snapshot date: August 31</div>

        <p style={exampleNoteTextStyle}>
          Historical reporting must attribute the policy to Broker B, not Broker
          A. A current broker field alone cannot answer this reliably.
        </p>
      </div>
    </section>
  );
}

function TimelineItem({
  label,
  value,
  range,
}: {
  label: string;
  value: string;
  range: string;
}) {
  return (
    <div style={timelineItemStyle}>
      <div style={timelineLabelStyle}>{label}</div>
      <div style={timelineValueStyle}>{value}</div>
      <div style={timelineRangeStyle}>{range}</div>
    </div>
  );
}

function ResultCard({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: string[][];
  tone: "good" | "bad";
}) {
  const isGood = tone === "good";

  return (
    <section
      style={{
        ...resultCardStyle,
        border: isGood ? "1px solid #86efac" : "1px solid #fecaca",
        background: isGood ? "#f0fdf4" : "#fef2f2",
      }}
    >
      <div style={resultHeaderStyle}>
        <div
          style={{
            ...resultIconStyle,
            background: isGood ? "#15803d" : "#b91c1c",
          }}
        >
          {isGood ? "✓" : "×"}
        </div>

        <h3
          style={{
            ...resultTitleStyle,
            color: isGood ? "#166534" : "#991b1b",
          }}
        >
          {title}
        </h3>
      </div>

      <div style={resultTableStyle}>
        {rows.map(([label, value]) => (
          <div key={`${label}-${value}`} style={resultRowStyle}>
            <div style={resultPeriodStyle}>{label}</div>
            <div style={resultValueStyle}>{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PatternTestCaseCard() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  return (
    <section style={testCaseCardStyle}>
      <div style={testCaseEyebrowStyle}>Test case</div>

      <h2 style={testCaseTitleStyle}>
        Try this Relationship History case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test whether historical attribution
        uses the correct relationship at the snapshot date.
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>
          Check whether August is attributed to Broker B or incorrectly to
          Broker A.
        </li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Historized relationship target"
          description="Expected output: August is attributed to Broker B."
          tableName="historized_relationship_target"
          value={HISTORIZED_RELATIONSHIP_TARGET_TABLE}
          tone="good"
          onExampleReady={setSelectedExample}
        />

        <CopyTableCard
          title="Wrong target table"
          description="Risky output: attribution uses the current or wrong broker."
          tableName="wrong_target"
          value={WRONG_TARGET_TABLE}
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
            example: "relationship_history",
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
      example: "relationship_history",
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
        Explore relationship history risks in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about historized
        relationships, temporal joins, gaps, overlaps and historical
        attribution.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "relationship_history",
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

const relationshipTimelineStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const timelineItemStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(219, 234, 254, 0.12)",
  border: "1px solid rgba(147, 197, 253, 0.38)",
};

const timelineLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 8,
};

const timelineValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 900,
  marginBottom: 6,
};

const timelineRangeStyle: CSSProperties = {
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

const questionCardStyle: CSSProperties = {
  marginTop: 22,
  display: "flex",
  gap: 18,
  alignItems: "center",
  padding: "20px 22px",
  borderRadius: 16,
  background: "rgba(250, 204, 21, 0.1)",
  border: "1px solid rgba(250, 204, 21, 0.55)",
};

const questionIconStyle: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  border: "2px solid #fde047",
  color: "#fde047",
  fontSize: 28,
  fontWeight: 900,
};

const questionBadgeStyle: CSSProperties = {
  color: "#fde047",
  fontWeight: 900,
  fontSize: 14,
  marginBottom: 6,
};

const questionTextStyle: CSSProperties = {
  color: "#f8fafc",
  fontSize: 15,
  lineHeight: 1.55,
};

const comparisonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginTop: 22,
};

const resultCardStyle: CSSProperties = {
  padding: "clamp(18px, 4vw, 24px)",
  borderRadius: 16,
  color: "#0f172a",
  boxShadow: "0 18px 40px rgba(2, 6, 23, 0.22)",
};

const resultHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const resultIconStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 900,
  flexShrink: 0,
};

const resultTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.2,
  fontWeight: 900,
};

const resultTableStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const resultRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 0",
  borderBottom: "1px solid rgba(15, 23, 42, 0.14)",
};

const resultPeriodStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
};

const resultValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
  textAlign: "right",
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
