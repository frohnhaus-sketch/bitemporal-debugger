"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const REDUCED_TARGET_TABLE = `contract_id,status,valid_from,valid_to,reduction_status
C1,Draft,2024-01-01,2024-01-12,reduced
C1,Submitted,2024-01-12,2024-01-20,reduced
C1,Approved,2024-01-20,9999-12-31,reduced`;

const WRONG_TARGET_TABLE = `contract_id,status,valid_from,valid_to,reduction_status
C1,Draft,2024-01-01,2024-01-03,redundant_state
C1,Draft,2024-01-03,2024-01-07,redundant_state
C1,Draft,2024-01-07,2024-01-12,redundant_state
C1,Submitted,2024-01-12,2024-01-13,redundant_state
C1,Submitted,2024-01-13,2024-01-20,redundant_state
C1,Approved,2024-01-20,9999-12-31,reduced`;

export default function StateReductionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "state_reduction",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "state-reduction",
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

          <h1 style={h1Style}>State Reduction</h1>

          <p style={heroTextStyle}>
            State Reduction removes irrelevant or redundant historical state
            changes before building reporting models.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Operational history often contains more state changes than reporting needs."
          >
            <p style={paragraphStyle}>
              Source systems may store technical refreshes, temporary workflow
              states, repeated values or intermediate transitions. If every
              source state is carried into the reporting model, the result
              becomes noisy and difficult to validate.
            </p>

            <ChipRow
              chips={[
                "Over-fragmented history",
                "Operational noise",
                "Unstable snapshots",
                "Hard-to-explain KPIs",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Source state and reporting state are not always the same thing."
          >
            <p style={paragraphStyle}>
              Operational systems capture workflow detail. Reporting models
              usually need stable business states. State Reduction defines which
              changes matter analytically and which changes should remain only
              in raw history.
            </p>

            <ChipRow
              chips={[
                "Technical refresh versions",
                "Temporary workflow states",
                "Repeated values",
                "CDC-derived history",
                "Reporting grain mismatch",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Preserve raw history, but publish reduced reporting state."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Define reporting state"
                text="Choose the attributes and statuses that should affect analytical results."
              />
              <MiniCard
                title="Collapse identical intervals"
                text="Merge adjacent intervals when the reporting-relevant state did not change."
              />
              <MiniCard
                title="Remove technical versions"
                text="Exclude refreshes or system-only transitions from the published reporting layer."
              />
              <MiniCard
                title="Keep raw audit history"
                text="Preserve the original source history separately so reduction remains explainable."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that reduction removes noise without losing business meaning."
          >
            <CheckChipRow
              checks={[
                "Compare raw state count vs reduced state count",
                "Validate that key business transitions are preserved",
                "Check for accidental coverage gaps after reduction",
                "Verify snapshot outputs before and after reduction",
                "Review excluded state changes with business users",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="State Reduction turns operational history into analytical history."
          >
            <p style={paragraphStyle}>
              It reduces noise while preserving the changes that matter for
              reporting.
            </p>

            <p style={paragraphStyle}>
              Without reduction, historical models can be technically accurate
              but analytically unusable.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="state_reduction" />

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
        A detailed workflow history is reduced to reporting-relevant states.
      </h2>

      <div style={exampleGridStyle}>
        <div style={exampleColumnStyle}>
          <div style={exampleColumnTitleStyle}>Source states</div>
          {[
            "Draft",
            "Validation pending",
            "Validation failed",
            "Validation passed",
            "Active",
            "Active with technical refresh",
            "Cancelled",
          ].map((state) => (
            <div key={state} style={sourceStatePillStyle}>
              {state}
            </div>
          ))}
        </div>

        <div style={exampleColumnStyle}>
          <div style={exampleColumnTitleStyle}>Reporting states</div>
          {["Draft", "Submitted", "Approved"].map((state) => (
            <div key={state} style={reportingStatePillStyle}>
              {state}
            </div>
          ))}
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reduction result</div>

        <p style={exampleNoteTextStyle}>
          The reporting model keeps the business-relevant states and removes
          intermediate operational noise, while raw history can still be
          retained for audit and debugging.
        </p>
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
        Try this State Reduction case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>Check whether redundant state versions were reduced or kept.</li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Reduced target table"
          description="Copy this table to validate the expected reduced reporting state."
          tableName="reduced_target"
          value={REDUCED_TARGET_TABLE}
          tone="good"
          onExampleReady={setSelectedExample}
        />

        <CopyTableCard
          title="Wrong target table"
          description="Copy this table to validate a noisy output with redundant state versions."
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
            example: "state_reduction",
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
      example: "state_reduction",
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
        Use the Workbench to reason about reduced historical state.
      </h2>

      <p style={tryItTextStyle}>
        Validate gaps, overlaps, joins and snapshot behavior before publishing a
        reduced reporting model.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "state_reduction",
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
      title: "Event Prioritization",
      href: "/learn/event-prioritization",
      key: "event_prioritization",
    },
    {
      title: "Event Modeling",
      href: "/learn/event-modeling",
      key: "event_modeling",
    },
    {
      title: "Rectangle Decomposition",
      href: "/learn/rectangle-decomposition",
      key: "rectangle_decomposition",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
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

const exampleGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const exampleColumnStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(219, 234, 254, 0.1)",
  border: "1px solid rgba(147, 197, 253, 0.34)",
};

const exampleColumnTitleStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 12,
};

const sourceStatePillStyle: CSSProperties = {
  padding: "9px 11px",
  borderRadius: 999,
  background: "rgba(148, 163, 184, 0.16)",
  border: "1px solid rgba(203, 213, 225, 0.24)",
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
};

const reportingStatePillStyle: CSSProperties = {
  padding: "9px 11px",
  borderRadius: 999,
  background: "rgba(34, 197, 94, 0.16)",
  border: "1px solid rgba(134, 239, 172, 0.36)",
  color: "#dcfce7",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
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
