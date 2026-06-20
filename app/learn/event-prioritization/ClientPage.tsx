"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const PRIORITIZED_TARGET_TABLE = `contract_id,event_id,event_time,event_type,reporting_milestone,priority_rank,prioritization_status
C1,E4,2024-01-01T10:03:00,Offer sent,offer_sent,1,selected
C1,E5,2024-01-01T10:05:00,Contract activated,contract_activated,1,selected`;

const WRONG_TARGET_TABLE = `contract_id,event_id,event_time,event_type,reporting_milestone,priority_rank,prioritization_status
C1,E1,2024-01-01T10:00:00,Draft created,draft_created,1,operational_noise_kept
C1,E2,2024-01-01T10:01:00,Validation failed,validation_failed,1,operational_noise_kept
C1,E3,2024-01-01T10:02:00,Validation passed,validation_passed,1,operational_noise_kept
C1,E4,2024-01-01T10:03:00,Offer sent,offer_sent,1,selected
C1,E5,2024-01-01T10:05:00,Contract activated,contract_activated,1,selected`;

export default function EventPrioritizationPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_prioritization",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "event-prioritization",
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
            <div style={badgeStyle}>Engineering Pattern</div>

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

          <h1 style={h1Style}>Event Prioritization</h1>

          <p style={heroTextStyle}>
            Event Prioritization selects the business-relevant events from noisy
            historical event streams.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Operational event streams often contain too much noise for reporting."
          >
            <p style={paragraphStyle}>
              Source systems often produce many events for the same entity in a
              short period of time. Some events represent real business
              milestones. Others are technical changes, intermediate states,
              corrections or duplicate journal entries.
            </p>

            <p style={paragraphStyle}>
              Reporting needs a stable rule for deciding which events count and
              which events should be ignored, collapsed or retained only as raw
              audit history.
            </p>

            <ChipRow
              chips={[
                "Technical events counted",
                "Duplicate reporting facts",
                "Unstable KPIs",
                "Workflow noise",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Operational systems record workflow detail, not reporting meaning."
          >
            <p style={paragraphStyle}>
              Event streams are often designed for process execution, auditing
              or technical traceability. Reporting usually needs fewer, clearer
              business milestones.
            </p>

            <ChipRow
              chips={[
                "Status-heavy workflows",
                "Intermediate states",
                "Retry events",
                "Technical validations",
                "Duplicate journals",
                "Correction events",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Separate raw events from reporting-relevant events."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Define included events"
                text="Explicitly list which event types are relevant for reporting and which are only operational detail."
              />
              <MiniCard
                title="Rank by priority"
                text="Rank events by business priority within each entity, period or workflow stage."
              />
              <MiniCard
                title="Collapse sequences"
                text="Map noisy technical sequences into a smaller set of business milestones."
              />
              <MiniCard
                title="Keep raw history"
                text="Preserve raw events separately so reporting rules remain explainable and auditable."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that prioritization does not distort business activity."
          >
            <CheckChipRow
              checks={[
                "Count raw events vs reporting events",
                "Validate event ordering per entity",
                "Detect duplicate milestone events",
                "Check priority rules against known examples",
                "Compare derived events with business expectations",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Event prioritization prevents operational noise from becoming analytical truth."
          >
            <p style={paragraphStyle}>
              Without prioritization, event-based reporting can overcount,
              duplicate or misclassify business activity.
            </p>

            <p style={paragraphStyle}>
              The goal is not to delete events, but to separate raw operational
              history from reporting-relevant business history.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="event_prioritization" />

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
        Five workflow events may produce only two reporting milestones.
      </h2>

      <div style={eventListStyle}>
        <EventRow time="10:00" title="Draft created" muted />
        <EventRow time="10:01" title="Validation failed" muted />
        <EventRow time="10:02" title="Validation passed" muted />
        <EventRow time="10:03" title="Offer sent" selected />
        <EventRow time="10:05" title="Contract activated" selected />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting rule</div>

        <p style={exampleNoteTextStyle}>
          Keep “Offer sent” and “Contract activated” as business milestones.
          Treat validation events as operational detail, not reporting facts.
        </p>
      </div>
    </section>
  );
}

function EventRow({
  time,
  title,
  selected,
  muted,
}: {
  time: string;
  title: string;
  selected?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        ...eventRowStyle,
        background: selected
          ? "rgba(219, 234, 254, 0.14)"
          : "rgba(255, 255, 255, 0.06)",
        border: selected
          ? "1px solid rgba(147, 197, 253, 0.7)"
          : "1px solid rgba(148, 163, 184, 0.24)",
      }}
    >
      <div style={eventTimeStyle}>{time}</div>

      <div>
        <div
          style={{
            ...eventTitleStyle,
            color: muted ? "#94a3b8" : "#ffffff",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: selected ? "#bfdbfe" : "#94a3b8",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {selected ? "Reporting milestone" : "Operational detail"}
        </div>
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
        Try this Event Prioritization case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>
          Check whether operational noise was removed or kept as reporting
          events.
        </li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Prioritized target table"
          description="Copy this table to validate the expected reporting milestones."
          tableName="prioritized_target"
          value={PRIORITIZED_TARGET_TABLE}
          tone="good"
          onExampleReady={setSelectedExample}
        />

        <CopyTableCard
          title="Wrong target table"
          description="Copy this table to validate a noisy output where operational events remain."
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
            example: "event_prioritization",
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
  tableName: "prioritized_target" | "wrong_target";
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
      example: "event_prioritization",
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
        Explore event-heavy historical models in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about event streams,
        reporting milestones, state alignment and historical validation checks.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "event_prioritization",
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
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
    },
    {
      title: "Historical Backfill",
      href: "/learn/historical-backfill",
      key: "historical_backfill",
    },
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

const eventListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const eventRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  padding: 14,
  borderRadius: 16,
};

const eventTimeStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const eventTitleStyle: CSSProperties = {
  fontWeight: 900,
  marginBottom: 4,
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
