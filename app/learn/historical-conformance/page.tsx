"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const VALIDATION_CHECKS = [
  "Cross-system attribute consistency",
  "Conformance status validation",
  "Source ownership validation",
  "Historical conflict detection",
  "Snapshot conformance validation",
];

const SOLUTIONS = [
  {
    title: "Source Ownership Rules",
    text: "Define which system owns each historical attribute when sources disagree.",
  },
  {
    title: "Conformed Dimensions",
    text: "Standardize historical attributes into one reporting vocabulary.",
  },
  {
    title: "Conflict Status",
    text: "Explicitly mark unresolved differences instead of silently choosing one source.",
  },
  {
    title: "As-Known Conformance",
    text: "Preserve when conflicting source history became visible to reporting.",
  },
];

const EXPECTED_ROWS = [
  ["System A", "Retail", "conformed"],
  ["System B", "Retail", "conformed"],
];

const WRONG_ROWS = [
  ["System A", "Retail", "unconformed"],
  ["System B", "Private", "unconformed"],
];

const CONFORMED_TARGET_TABLE = `contract_id,customer_key,source_system,customer_segment,conformance_status,snapshot_date,valid_from,valid_to
C-1001,Customer A,System A,Retail,conformed,2024-03-31,2024-03-01,2024-03-31
C-1001,Customer A,System B,Retail,conformed,2024-03-31,2024-03-01,2024-03-31`;

const WRONG_TARGET_TABLE = `contract_id,customer_key,source_system,customer_segment,conformance_status,snapshot_date,valid_from,valid_to
C-1001,Customer A,System A,Retail,unconformed,2024-03-31,2024-03-01,2024-03-31
C-1001,Customer A,System B,Private,unconformed,2024-03-31,2024-03-01,2024-03-31`;

export default function HistoricalConformancePage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "historical_conformance",
      page_type: "interactive_example",
      example: "historical_conformance",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "historical-conformance",
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

          <h1 style={h1Style}>Historical Conformance</h1>

          <p style={heroTextStyle}>
            Historical Conformance aligns multiple source histories into one
            consistent reporting view when systems disagree over time.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24, minWidth: 0 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Two source systems describe the same customer differently."
          >
            <p style={paragraphStyle}>
              Historical reporting often combines CRM, policy, billing or
              product systems. Each system may have its own version of customer
              segment, product category, broker assignment or risk classification.
            </p>

            <p style={paragraphStyle}>
              If the model does not define conformance rules, the same business
              entity can appear with different historical attributes in the same
              reporting period.
            </p>

            <ChipRow
              chips={[
                "Cross-system conflicts",
                "Different historical truths",
                "Unclear source ownership",
                "Inconsistent reporting attributes",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Key idea"
            title="Conformance turns source-specific history into reporting history."
          >
            <p style={paragraphStyle}>
              A conformed historical model does not simply copy every source
              value. It defines which source owns each attribute, how conflicts
              are resolved and which values are safe to use in reporting.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it happens"
            title="Each source system optimizes for its own operational process."
          >
            <ChipRow
              chips={[
                "CRM vs ERP mismatch",
                "Master data corrections",
                "Late arriving source updates",
                "Different effective dates",
                "Source-specific code systems",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Make source ownership and conflict handling explicit."
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
            title="Validate whether the conformed history is safe for reporting."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Without conformance, different systems can produce different historical truths."
          >
            <p style={paragraphStyle}>
              Historical Conformance is often the difference between a collection
              of historized source tables and a trustworthy reporting model.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="historical_conformance" />

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
        CRM and policy system disagree about the customer segment for the same reporting period.
      </h2>

      <div style={sourceGridStyle}>
        <SourceSystemCard
          system="System A"
          label="CRM"
          value="Retail"
          status="Source says customer is Retail"
          tone="good"
        />

        <SourceSystemCard
          system="System B"
          label="Policy System"
          value="Private"
          status="Source says customer is Private"
          tone="bad"
        />
      </div>

      <div style={questionCardStyle}>
        <div style={questionIconStyle}>?</div>

        <div>
          <div style={questionBadgeStyle}>Reporting question</div>
          <div style={questionTextStyle}>
            Which customer segment should the March snapshot use when systems
            disagree about the same customer and period?
          </div>
        </div>
      </div>

      <div style={comparisonGridStyle}>
        <ResultCard title="Expected Result (Conformed)" rows={EXPECTED_ROWS} tone="good" />
        <ResultCard title="Common Wrong Result (Risk)" rows={WRONG_ROWS} tone="bad" />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Key idea</div>

        <p style={exampleNoteTextStyle}>
          A conformed model makes the rule explicit. Either the conflict is
          resolved to one reporting value or it is clearly marked as unresolved.
        </p>
      </div>
    </section>
  );
}

function SourceSystemCard({
  system,
  label,
  value,
  status,
  tone,
}: {
  system: string;
  label: string;
  value: string;
  status: string;
  tone: "good" | "bad";
}) {
  const isGood = tone === "good";

  return (
    <div
      style={{
        ...sourceCardStyle,
        border: isGood
          ? "1px solid rgba(147, 197, 253, 0.45)"
          : "1px solid rgba(251, 146, 60, 0.42)",
        background: isGood
          ? "rgba(219, 234, 254, 0.13)"
          : "rgba(251, 146, 60, 0.12)",
      }}
    >
      <div style={sourceSystemStyle}>{system}</div>
      <div style={sourceLabelStyle}>{label}</div>
      <div style={sourceValueStyle}>{value}</div>
      <div style={sourceStatusStyle}>{status}</div>
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
        {rows.map(([system, segment, status]) => (
          <div key={`${system}-${segment}-${status}`} style={resultRowStyle}>
            <div>
              <div style={resultPeriodStyle}>{system}</div>
              <div style={resultMetaStyle}>{status}</div>
            </div>
            <div style={resultValueStyle}>{segment}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PatternTestCaseCard() {
  return (
    <section style={testCaseCardStyle}>
      <div style={testCaseEyebrowStyle}>Test case</div>

      <h2 style={testCaseTitleStyle}>
        Try this Historical Conformance case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>Check whether the result is conformed or still conflicting.</li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Conformed target table"
          description="Copy this table to validate the expected conformed reporting output."
          tableName="conformed_target"
          value={CONFORMED_TARGET_TABLE}
          tone="good"
        />

        <CopyTableCard
          title="Wrong target table"
          description="Copy this table to validate a risky output where cross-system conflicts remain unresolved."
          tableName="wrong_target"
          value={WRONG_TARGET_TABLE}
          tone="bad"
        />
      </div>

      <a
        href="/#target-table-validation"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "historical_conformance",
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
  tableName: "conformed_target" | "wrong_target";
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
      example: "historical_conformance",
      table: tableName,
    });

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
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
          boxShadow: hovered
            ? "0 10px 22px rgba(15, 23, 42, 0.22)"
            : "none",
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
        Review your own historical conformance rules.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about source ownership,
        conformed dimensions and cross-system historical conflicts.
      </p>

      <a
        href="/"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "historical_conformance",
            cta: "review_my_model",
            source: "bottom_cta",
            page_type: "interactive_example",
          });
        }}
        style={tryItButtonStyle}
      >
        Review My Model →
      </a>
    </section>
  );
}

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
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
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
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
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
  boxSizing: "border-box",
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

const timelineGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const timelineCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
};

const timelineTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 10,
};

const timelineMetaStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 6,
};

const timelineStateStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  marginBottom: 8,
};

const timelineResultStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 15,
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
  color: "#64748b",
  fontWeight: 800,
};

const resultValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
  textAlign: "right",
};

const testCaseCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
};

const testCaseEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const testCaseTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#0f172a",
  letterSpacing: "-0.03em",
};

const testCaseTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#334155",
};

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
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
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

const sourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const sourceCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
};

const sourceSystemStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 8,
};

const sourceLabelStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
};

const sourceValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 900,
  marginBottom: 8,
};

const sourceStatusStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.5,
};