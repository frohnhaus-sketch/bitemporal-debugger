"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const ALIGNED_TARGET_TABLE = `contract_id,event_id,event_date,contract_status,valid_from,valid_to,alignment_status
C-1001,CL-9001,2024-08-15,Premium = 120,2024-07-01,2024-12-31,aligned`;

const WRONG_TARGET_TABLE = `contract_id,event_id,event_date,contract_status,valid_from,valid_to,alignment_status
C-1001,CL-9001,2024-08-15,Premium = 100,2024-01-01,2024-06-30,wrong_state`;

const VALIDATION_CHECKS = [
  "Detect events without matching state",
  "Detect events with multiple matching states",
  "Validate event timestamp inside valid interval",
  "Check for current-state leakage",
  "Compare aligned events against known examples",
];

const SOLUTIONS = [
  {
    title: "Point-in-Interval Join",
    text: "Match each event timestamp against the valid_from and valid_to interval of the state table.",
  },
  {
    title: "As-Known Alignment",
    text: "Add visible-time logic when the event should only use state knowledge available at reporting time.",
  },
  {
    title: "Coverage Handling",
    text: "Define what should happen when an event has no matching state record.",
  },
  {
    title: "Ambiguity Handling",
    text: "Validate that each event resolves to one intended state, or document the tie-breaking rule.",
  },
];

const EXPECTED_ROWS = [
  ["CL-9001", "2024-08-15", "Premium = 120"],
  ["State interval", "Jul → Dec", "correct_state"],
];

const WRONG_ROWS = [
  ["CL-9001", "2024-08-15", "Premium = 100"],
  ["State interval", "Jan → Jun", "wrong_state"],
];

const STATE_TABLE_ROWS = [
  ["C-1001", "Premium = 100", "2024-01-01", "2024-06-30"],
  ["C-1001", "Premium = 120", "2024-07-01", "2024-12-31"],
];

const EVENT_TABLE_ROWS = [
  ["CL-9001", "C-1001", "Claim submitted", "2024-08-15"],
];

const GOOD_ALIGNMENT_ROWS = [
  ["CL-9001", "2024-08-15", "Premium = 120", "correct"],
];

const BAD_ALIGNMENT_ROWS = [
  ["CL-9001", "2024-08-15", "Premium = 100", "wrong"],
];

export default function StateEventAlignmentPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "state_event_alignment",
      page_type: "interactive_example",
      example: "state_event_alignment",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "state-event-alignment",
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
            <div style={badgeStyle}>Interactive Pattern</div>

            <div
              style={{
                ...badgeStyle,
                background: "#fef3c7",
                border: "1px solid #fde68a",
                color: "#92400e",
              }}
            >
              Interactive Example
            </div>
          </div>

          <h1 style={h1Style}>State ↔ Event Alignment</h1>

          <p style={heroTextStyle}>
            State ↔ Event Alignment connects business events to the state that
            was valid when the event occurred.
          </p>

          <div style={{ marginTop: 16 }}>
            <p style={paragraphStyle}>
              State-event alignment connects point-in-time events with derived
              historized state representations.
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
              <li>Event-to-state transformation</li>
              <li>Temporal aggregation logic</li>
              <li>Alignment of asynchronous data sources</li>
              <li>Consistent historical reconstruction</li>
            </ul>
          </div>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="An event needs the correct historical state, not the current one."
          >
            <p style={paragraphStyle}>
              Historical platforms often contain both state data and event data.
              A contract might be represented as historized state records, while
              mutations, claims, payments or status changes are stored as
              events.
            </p>

            <p style={paragraphStyle}>
              The challenge is determining which state was valid when the event
              happened.
            </p>

            <ChipRow
              chips={[
                "Wrong historical version",
                "Current-state leakage",
                "Duplicate matches",
                "Missing valid-time coverage",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <section style={{ marginTop: 20 }}>
            <h2>Core concepts in practice</h2>

            <p>
              Without alignment, event streams and historical tables diverge in
              meaning.
            </p>
          </section>

          <ExampleDatasetCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Events are points in time, while states are valid over intervals."
          >
            <p style={paragraphStyle}>
              A state row describes what was true during a period. An event
              describes something that happened at a specific time. Alignment
              requires joining the event timestamp into the correct state
              interval.
            </p>

            <p style={paragraphStyle}>
              This becomes harder when source history has gaps, overlaps, late
              arriving corrections or multiple candidate state records.
            </p>

            <ChipRow
              chips={[
                "Point-in-time events",
                "Interval-based states",
                "Late corrections",
                "Temporal join predicates",
                "State coverage gaps",
                "Ambiguous matches",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Join the event timestamp into the valid state interval."
          >
            <div style={solutionGridStyle}>
              {SOLUTIONS.map((solution) => (
                <MiniCard
                  key={solution.title}
                  title={solution.title}
                  text={solution.text}
                />
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that every event resolves to the intended state."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="Most historical reporting depends on correctly connecting events to state."
          >
            <p style={paragraphStyle}>
              Claims, payments, mutations and transactions often need the
              customer, contract, price, relationship or product state that was
              valid when the event occurred.
            </p>

            <p style={paragraphStyle}>
              Incorrect alignment can lead to reporting drift, duplicate facts
              and inconsistent KPI calculations.
            </p>
          </WhiteCard>
        </section>

        <section style={{ marginTop: 30 }}>
          <h2>How this pattern relates to other temporal models</h2>

          <p>
            This pattern is a bridge between event-driven architectures and
            state-based historical models.
          </p>

          <ul>
            <li>Event Modeling</li>
            <li>Event-to-State Projection</li>
            <li>State Modeling</li>
            <li>Snapshot Reproducibility</li>
          </ul>

          <p>
            It ensures events and derived states remain consistent over time.
          </p>
        </section>
        <RelatedPatterns current="state_event_alignment" />

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
        A claim event occurs in August. It must align to the state valid in
        August.
      </h2>

      <div style={alignmentGridStyle}>
        <StateCard label="State 1" value="Premium = 100" range="Jan – Jun" />
        <EventCard label="Event" value="Claim submitted" date="Aug 15" />
        <StateCard label="State 2" value="Premium = 120" range="Jul – Dec" />
      </div>

      <div style={questionCardStyle}>
        <div style={questionIconStyle}>?</div>

        <div>
          <div style={questionBadgeStyle}>Reporting question</div>
          <div style={questionTextStyle}>
            Which premium state should the event use? The event date must fall
            inside the selected state interval.
          </div>
        </div>
      </div>

      <div style={comparisonGridStyle}>
        <ResultCard
          title="Expected Result (Aligned)"
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
        <div style={exampleNoteLabelStyle}>Key idea</div>

        <p style={exampleNoteTextStyle}>
          Events are points in time. States are intervals. A correct model
          aligns the event timestamp to exactly one valid state interval.
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
      <div style={cardRangeStyle}>{range}</div>
    </div>
  );
}

function EventCard({
  label,
  value,
  date,
}: {
  label: string;
  value: string;
  date: string;
}) {
  return (
    <div style={eventCardStyle}>
      <div style={cardLabelStyle}>{label}</div>
      <div style={cardValueStyle}>{value}</div>
      <div style={cardRangeStyle}>{date}</div>
    </div>
  );
}

function ExampleDatasetCard() {
  return (
    <WhiteCard
      eyebrow="Example datasets"
      title="The same event can be interpreted correctly or incorrectly depending on the state interval."
    >
      <div style={datasetGridStyle}>
        <DatasetTable
          title="State table"
          columns={["contract_id", "premium", "valid_from", "valid_to"]}
          rows={STATE_TABLE_ROWS}
        />

        <DatasetTable
          title="Event table"
          columns={["event_id", "contract_id", "event_type", "event_date"]}
          rows={EVENT_TABLE_ROWS}
        />
      </div>

      <div style={comparisonGridStyle}>
        <DatasetTable
          title="Good alignment"
          columns={["event_id", "event_date", "premium", "status"]}
          rows={GOOD_ALIGNMENT_ROWS}
          tone="good"
        />

        <DatasetTable
          title="Wrong alignment"
          columns={["event_id", "event_date", "premium", "status"]}
          rows={BAD_ALIGNMENT_ROWS}
          tone="bad"
        />
      </div>

      <div style={explanationBoxStyle}>
        <strong>Why the wrong interpretation is wrong:</strong> The claim
        happened on August 15. The only state interval valid on August 15 is
        July–December. Joining the event to the January–June state is
        current-state leakage or an incorrect point-in-interval join.
      </div>
    </WhiteCard>
  );
}

function DatasetTable({
  title,
  columns,
  rows,
  tone = "neutral",
}: {
  title: string;
  columns: string[];
  rows: string[][];
  tone?: "neutral" | "good" | "bad";
}) {
  const border =
    tone === "good" ? "#86efac" : tone === "bad" ? "#fecaca" : "#e2e8f0";

  const background =
    tone === "good" ? "#f0fdf4" : tone === "bad" ? "#fef2f2" : "#f8fafc";

  return (
    <div
      style={{
        ...datasetTableCardStyle,
        border: `1px solid ${border}`,
        background,
      }}
    >
      <div style={datasetTableTitleStyle}>{title}</div>

      <div style={datasetTableScrollStyle}>
        <table style={datasetTableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={datasetThStyle}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${title}-${rowIndex}-${cellIndex}`}
                    style={datasetTdStyle}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        {rows.map(([label, value, result]) => (
          <div key={`${label}-${value}-${result}`} style={resultRowStyle}>
            <div>
              <div style={resultPeriodStyle}>{label}</div>
              <div style={resultMetaStyle}>{value}</div>
            </div>
            <div style={resultValueStyle}>{result}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetectionCard() {
  return (
    <section style={detectionCardStyle}>
      <div style={detectionEyebrowStyle}>
        Detectable by Historical Modeling Workbench
      </div>

      <h2 style={detectionTitleStyle}>
        The Workbench can surface symptoms that often indicate state-event
        alignment problems.
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
        Validate whether events align to the correct historical state.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to detect missing matches,
        ambiguous matches and temporal join risks between state and event data.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "state_event_alignment",
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
      title: "Event Modeling",
      href: "/learn/event-modeling",
      key: "event_modeling",
    },
    {
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
    },
    {
      title: "Event-to-State Projection",
      href: "/learn/event-to-state-projection",
      key: "event_to_state_projection",
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
  color: "#0f172a",
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

const eventCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(251, 146, 60, 0.13)",
  border: "1px solid rgba(251, 146, 60, 0.42)",
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

const resultMetaStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 12,
  color: "#0f172a",
  fontWeight: 800,
};

const resultValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
  textAlign: "right",
};

const datasetGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 18,
  marginBottom: 20,
};

const datasetTableCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  overflow: "hidden",
};

const datasetTableTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: 16,
  color: "#0f172a",
  marginBottom: 12,
};

const datasetTableScrollStyle: CSSProperties = {
  overflowX: "auto",
};

const datasetTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const datasetThStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #cbd5e1",
  color: "#475569",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const datasetTdStyle: CSSProperties = {
  padding: "9px 10px",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const explanationBoxStyle: CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 14,
  background: "#fffbeb",
  border: "1px solid #fde68a",
  color: "#92400e",
  fontSize: 14,
  lineHeight: 1.6,
};
