"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const VALIDATION_CHECKS = [
  "Snapshot reproducibility validation",
  "As-known reporting validation",
  "Late arriving data validation",
  "Historical correction validation",
  "Published report comparison",
];

const SOLUTIONS = [
  {
    title: "Snapshot Facts",
    text: "Persist one fact row per entity and reporting period so month-end reports do not depend on current source state.",
  },
  {
    title: "Visible Time",
    text: "Track when historical records became known so reports can be reproduced as they were seen at the time.",
  },
  {
    title: "Frozen Report State",
    text: "Store the exact reporting state used for published reports when audit reproducibility is required.",
  },
  {
    title: "As-Known Joins",
    text: "Join dimensions using both business-valid time and system-visible time to avoid using future knowledge.",
  },
];

const EXPECTED_ROWS = [
  ["2024-03-31", "As known on Mar 31", "Premium total = 1.2M"],
  ["2024-03-31", "Rebuilt in Jun as known on Mar 31", "Premium total = 1.2M"],
];

const WRONG_ROWS = [
  ["2024-03-31", "Published in Mar", "Premium total = 1.2M"],
  ["2024-03-31", "Rebuilt in Jun using current truth", "Premium total = 1.3M"],
];

const REPRODUCIBLE_TARGET_TABLE = `contract_id,customer_key,premium_amount,snapshot_date,valid_from,valid_to,visible_from,visible_to,reproducibility_method
C-1001,Customer A,1200000,2024-03-31,2024-03-01,2024-03-31,2024-03-31,2024-06-14,as_known_snapshot
C-1001,Customer A,1300000,2024-03-31,2024-03-01,2024-03-31,2024-06-15,9999-12-31,corrected_after_publication`;

const WRONG_TARGET_TABLE = `contract_id,customer_key,premium_amount,snapshot_date,valid_from,valid_to,reproducibility_method
C-1001,Customer A,1300000,2024-03-31,2024-03-01,2024-03-31,current_rebuild_only`;

function useReloadOnBackForwardCache() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);
}

export default function SnapshotReproducibilityPage() {
  useReloadOnBackForwardCache();

  useEffect(() => {
    track("learn_page_opened", {
      page: "snapshot_reproducibility",
      page_type: "interactive_example",
      example: "snapshot_reproducibility",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "snapshot-reproducibility",
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
            <div style={badgeStyle}>Composite Pattern</div>

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

          <h1 style={h1Style}>Snapshot Reproducibility</h1>

          <p style={heroTextStyle}>
            Snapshot Reproducibility answers a simple question: if you rebuild
            last month’s report today, should it produce the same result or the
            corrected result?
          </p>
        </header>

        <section style={{ display: "grid", gap: 24, minWidth: 0 }}>
          <WhiteCard
            eyebrow="Problem"
            title="The same month-end report produces different numbers when rebuilt later."
          >
            <p style={paragraphStyle}>
              This usually happens when reports are rebuilt from mutable source
              data. Late-arriving records, corrected history, overwritten
              dimensions or changed relationships can alter the result even
              though the reporting date did not change.
            </p>

            <ChipRow
              chips={[
                "Changing historical totals",
                "Non-reproducible reports",
                "Audit disagreements",
                "Incorrect as-known results",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="The model does not separate reporting date from knowledge date."
          >
            <p style={paragraphStyle}>
              A report can be correct for a business date and still use
              information that was not known when the report was originally
              published. Snapshot Reproducibility makes that distinction
              explicit.
            </p>

            <ChipRow
              chips={[
                "Late arriving facts",
                "Corrected source history",
                "SCD1 overwrites",
                "Missing visible time",
                "Changed relationship history",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Decide whether the report should show current truth or what was known at the time."
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
            title="Validate whether reports can be rebuilt consistently."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Reproducible snapshots create trust in historical reporting."
          >
            <p style={paragraphStyle}>
              Snapshot facts are often the bridge between complex historical
              source behavior and simple business reporting.
            </p>

            <p style={paragraphStyle}>
              Without clear reproducibility rules, the same historical question
              may produce different results depending on when and how the query
              is rebuilt.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="snapshot_reproducibility" />

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
        A March report was published. In June, corrected history changes the
        result.
      </h2>

      <div style={timelineGridStyle}>
        <TimelineCard
          title="Published March report"
          date="Snapshot date: 2024-03-31"
          state="Knowledge date: 2024-03-31"
          result="Premium total = 1.2M"
          active
        />

        <TimelineCard
          title="June rebuild"
          date="Same snapshot date: 2024-03-31"
          state="Knowledge date: 2024-06-15"
          result="Premium total = 1.3M"
        />
      </div>

      <div style={questionCardStyle}>
        <div style={questionIconStyle}>?</div>

        <div>
          <div style={questionBadgeStyle}>Reporting question</div>
          <div style={questionTextStyle}>
            Should the rebuilt report reproduce what was known in March, or show
            the corrected truth known in June?
          </div>
        </div>
      </div>

      <div style={comparisonGridStyle}>
        <ResultCard
          title="Expected Result (Reproducible)"
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
          A reproducible snapshot needs either persisted report state or visible
          time. Otherwise, old reports can silently change when source history
          is corrected later.
        </p>
      </div>
    </section>
  );
}

function TimelineCard({
  title,
  date,
  state,
  result,
  active,
}: {
  title: string;
  date: string;
  state: string;
  result: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        ...timelineCardStyle,
        background: active
          ? "rgba(219, 234, 254, 0.13)"
          : "rgba(251, 146, 60, 0.12)",
        border: active
          ? "1px solid rgba(147, 197, 253, 0.45)"
          : "1px solid rgba(251, 146, 60, 0.42)",
      }}
    >
      <div style={timelineTitleStyle}>{title}</div>
      <div style={timelineMetaStyle}>{date}</div>
      <div style={timelineStateStyle}>{state}</div>
      <div style={timelineResultStyle}>{result}</div>
    </div>
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
        {rows.map(([snapshot, state, result]) => (
          <div key={`${snapshot}-${state}-${result}`} style={resultRowStyle}>
            <div>
              <div style={resultPeriodStyle}>{snapshot}</div>
              <div style={resultMetaStyle}>{state}</div>
            </div>
            <div style={resultValueStyle}>{result}</div>
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
        Try this Snapshot Reproducibility case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Use these sample target tables to test the validator:
      </p>

      <ol style={testCaseStepsStyle}>
        <li>Copy one of the target tables below.</li>
        <li>Open Target Table Validation.</li>
        <li>Paste the copied table as your target output.</li>
        <li>
          Check whether the snapshot remains reproducible or only reflects the
          current rebuild.
        </li>
      </ol>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Reproducible target table"
          description="Copy this table to validate the expected reproducible snapshot output."
          tableName="reproducible_target"
          value={REPRODUCIBLE_TARGET_TABLE}
          tone="good"
          onExampleReady={setSelectedExample}
        />

        <CopyTableCard
          title="Wrong target table"
          description="Copy this table to validate a risky output that only stores the current rebuild result."
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
            example: "snapshot_reproducibility",
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

  useEffect(() => {
    function resetCopyState() {
      setCopied(false);
      setHovered(false);
    }

    window.addEventListener("pageshow", resetCopyState);
    window.addEventListener("focus", resetCopyState);

    return () => {
      window.removeEventListener("pageshow", resetCopyState);
      window.removeEventListener("focus", resetCopyState);
    };
  }, []);

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
      example: "snapshot_reproducibility",
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

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Design reproducible historical reporting models.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about reporting dates,
        knowledge dates, source corrections and snapshot validation risks.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "snapshot_reproducibility",
            cta: "explore_snapshot_reproducibility",
            source: "bottom_cta",
          });
        }}
        style={tryItButtonStyle}
      >
        Explore Snapshot Reproducibility →
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
      title: "As-Known Reporting",
      href: "/learn/as-known-reporting",
      key: "as_known_reporting",
    },
    {
      title: "Snapshot Fact Modeling",
      href: "/learn/snapshot-fact-modeling",
      key: "snapshot_fact_modeling",
    },
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
    {
      title: "Historical Correction",
      href: "/learn/historical-correction",
      key: "historical_correction",
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
