"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

const EXPECTED_ROWS = [
  ["C-1001", "2024-03-01 → 2024-06-30", "Active", "Customer A"],
  ["C-1001", "2024-07-01 → 2024-09-30", "Changed", "Customer A"],
  ["C-1001", "2024-10-01 → 2024-12-31", "Changed", "Customer B"],
];

const WRONG_ROWS = [
  ["C-1001", "2024-03-01 → 2024-06-30", "Active", "Customer A"],
  ["C-1001", "2024-07-01 → 2024-12-31", "Changed", "Customer B"],
];

const ALIGNED_TARGET_TABLE = `contract_id,customer_key,contract_status,snapshot_date,valid_from,valid_to,alignment_method
C-1001,Customer A,Active,2024-03-31,2024-03-01,2024-03-31,interval_split
C-1001,Customer A,Active,2024-04-30,2024-04-01,2024-04-30,interval_split
C-1001,Customer A,Active,2024-05-31,2024-05-01,2024-05-31,interval_split
C-1001,Customer A,Active,2024-06-30,2024-06-01,2024-06-30,interval_split
C-1001,Customer A,Changed,2024-07-31,2024-07-01,2024-07-31,interval_split
C-1001,Customer A,Changed,2024-08-31,2024-08-01,2024-08-31,interval_split
C-1001,Customer A,Changed,2024-09-30,2024-09-01,2024-09-30,interval_split
C-1001,Customer B,Changed,2024-10-31,2024-10-01,2024-10-31,interval_split
C-1001,Customer B,Changed,2024-11-30,2024-11-01,2024-11-30,interval_split
C-1001,Customer B,Changed,2024-12-31,2024-12-01,2024-12-31,interval_split`;

const WRONG_TARGET_TABLE = `contract_id,customer_key,contract_status,snapshot_date,valid_from,valid_to,alignment_method
C-1001,Customer A,Active,2024-03-31,2024-03-01,2024-03-31,overlap_join_only
C-1001,Customer A,Active,2024-04-30,2024-04-01,2024-04-30,overlap_join_only
C-1001,Customer A,Active,2024-05-31,2024-05-01,2024-05-31,overlap_join_only
C-1001,Customer A,Active,2024-06-30,2024-06-01,2024-06-30,overlap_join_only
C-1001,Customer B,Changed,2024-07-31,2024-07-01,2024-07-31,overlap_join_only
C-1001,Customer B,Changed,2024-08-31,2024-08-01,2024-08-31,overlap_join_only
C-1001,Customer B,Changed,2024-09-30,2024-09-01,2024-09-30,overlap_join_only
C-1001,Customer B,Changed,2024-10-31,2024-10-01,2024-10-31,overlap_join_only
C-1001,Customer B,Changed,2024-11-30,2024-11-01,2024-11-30,overlap_join_only
C-1001,Customer B,Changed,2024-12-31,2024-12-01,2024-12-31,overlap_join_only`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function update() {
      setIsMobile(window.innerWidth < 760);
    }

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile;
}

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

export default function StateStateAlignmentPage() {
  useReloadOnBackForwardCache();

  useEffect(() => {
    track("learn_page_opened", {
      page: "state_state_alignment",
      page_type: "interactive_example",
      example: "state_state_alignment",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  const codeNoteStyle: CSSProperties = {
    marginTop: 10,
    marginBottom: 0,
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.55,
  };

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Alignment Pattern</div>
          </div>

          <h1 style={h1Style}>State ↔ State Alignment</h1>

          <p style={heroTextStyle}>
            State ↔ State Alignment joins two historized state sources across
            overlapping valid-time intervals.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Two historized sources can both be correct but still fail when joined."
          >
            <p style={paragraphStyle}>
              Historical reporting often requires joining two sources that both
              describe changing state over time. The challenge is not just
              joining by business key. The model must decide which versions were
              valid at the same reporting date.
            </p>

            <ChipRow
              chips={[
                "Multiple overlapping matches",
                "Missing valid-time coverage",
                "Join explosions",
                "Incorrect point-in-time results",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Each source has its own timeline and change frequency."
          >
            <p style={paragraphStyle}>
              A contract can change status over time. A customer can change
              segment over time. A product can change category or price over
              time. When both sides are historized, the join must align two
              timelines instead of simply matching keys.
            </p>

            <ChipRow
              chips={[
                "Independent source timelines",
                "Different change dates",
                "Temporal join predicates",
                "Coverage gaps",
                "Overlapping versions",
                "Boundary semantics",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Join on business key and overlapping valid-time intervals."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Overlap join"
                text="Join records where the business keys match and the valid-time intervals overlap."
              />
              <MiniCard
                title="Interval splitting"
                text="Split joined results into stable intervals when either source changes within the overlap."
              />
              <MiniCard
                title="Coverage handling"
                text="Define what should happen when one source has no valid row for a required reporting period."
              />
              <MiniCard
                title="Cardinality validation"
                text="Validate that the join produces the expected number of matches per entity and reporting date."
              />
            </div>

            <div style={codeBoxStyle}>
              <code style={codeStyle}>
                {`left.business_key = right.business_key
AND intervals_overlap(
  left.valid_from,
  left.valid_to,
  right.valid_from,
  right.valid_to,
  boundary_convention
)`}
              </code>
              <p style={codeNoteStyle}>
                The exact overlap predicate depends on your interval convention, for example
                closed daily intervals or half-open timestamp intervals. The important rule is
                that every temporal join uses the same boundary semantics consistently.
              </p>
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate the joined history, not only each source table."
          >
            <CheckChipRow
              checks={[
                "Detect overlapping versions per business key",
                "Detect gaps in required reporting periods",
                "Count matches per entity and reporting date",
                "Validate one expected match where the model requires one",
                "Check whether joined intervals produce unintended splits",
              ]}
            />
          </WhiteCard>

          <DetectionCard />

          <WhiteCard
            eyebrow="Why it matters"
            title="State-state joins are one of the most common sources of historical reporting bugs."
          >
            <p style={paragraphStyle}>
              The data can look correct in each source independently, but the
              combined history can still produce gaps, duplicates or incorrect
              attribution.
            </p>

            <p style={paragraphStyle}>
              Validating the join result is often more important than validating
              each source table in isolation.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="state_state_alignment" />

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
        Contract state and customer state change on different dates.
      </h2>

      <div style={stateTimelineStyle}>
        <TimelineLane
          label="Contract state"
          segments={[
            {
              text: "Active",
              left: "0%",
              width: "50%",
              background: "#bfdbfe",
              border: "#93c5fd",
            },
            {
              text: "Changed",
              left: "50%",
              width: "50%",
              background: "#dbeafe",
              border: "#60a5fa",
            },
          ]}
        />

        <TimelineLane
          label="Customer state"
          segments={[
            {
              text: "Customer A",
              left: "16.66%",
              width: "58.33%",
              background: "#ffedd5",
              border: "#fdba74",
            },
            {
              text: "Customer B",
              left: "75%",
              width: "25%",
              background: "#fed7aa",
              border: "#fb923c",
            },
          ]}
        />
      </div>

      <div style={questionCardStyle}>
        <div style={questionIconStyle}>?</div>

        <div>
          <div style={questionBadgeStyle}>Reporting question</div>
          <div style={questionTextStyle}>
            What should the joined history look like when either side changes?
            A correct model must split the result at every relevant state boundary.
          </div>
        </div>
      </div>

      <div style={comparisonGridStyle}>
        <ResultCard title="Expected Result (Recommended)" rows={EXPECTED_ROWS} tone="good" />
        <ResultCard title="Common Wrong Result (Risk)" rows={WRONG_ROWS} tone="bad" />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Key idea</div>

        <p style={exampleNoteTextStyle}>
          The joined table should only contain periods where both source states
          are stable. If one side changes, the joined interval must split.
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
      <div style={cardRangeStyle}>Valid: {range}</div>
    </div>
  );
}

function TimelineLane({
  label,
  segments,
}: {
  label: string;
  segments: {
    text: string;
    left: string;
    width: string;
    background: string;
    border: string;
  }[];
}) {
  return (
    <div style={timelineLaneStyle}>
      <div style={timelineLaneLabelStyle}>{label}</div>

      <div style={timelineTrackStyle}>
        {segments.map((segment) => (
          <div
            key={`${label}-${segment.text}-${segment.left}`}
            style={{
              ...timelineSegmentStyle,
              left: segment.left,
              width: segment.width,
              background: segment.background,
              border: `1px solid ${segment.border}`,
            }}
          >
            {segment.text}
          </div>
        ))}
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
        {rows.map(([contract, period, status, customer]) => (
          <div key={`${contract}-${period}-${status}-${customer}`} style={resultRowStyle}>
            <div>
              <div style={resultPeriodStyle}>{period}</div>
              <div style={resultMetaStyle}>{contract}</div>
            </div>
            <div style={resultValueStyle}>
              {status} / {customer}
            </div>
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
        Try this State ↔ State Alignment case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Copy the generated joined target table and paste it into Target Table
        Validation. The aligned table splits the result when either source state
        changes. The wrong table keeps the customer assignment too coarse.
      </p>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Aligned target table"
          description="Expected output after interval splitting."
          tableName="aligned_target"
          value={ALIGNED_TARGET_TABLE}
          tone="good"
        />

        <CopyTableCard
          title="Wrong target table"
          description="Common output when the join does not split at all state boundaries."
          tableName="wrong_target"
          value={WRONG_TARGET_TABLE}
          tone="bad"
        />
      </div>

      <a
        href="/#target-table-validation"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "state_state_alignment",
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
  tableName: "aligned_target" | "wrong_target";
  value: string;
  tone: "good" | "bad";
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
      example: "dimension_completion",
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
        onPointerDown={(event) => {
          event.preventDefault();
          handleCopy();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...copyTableButtonStyle,
          background: copied
            ? "#16a34a"
            : isGood
            ? "#15803d"
            : "#b91c1c",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 10px 22px rgba(15, 23, 42, 0.22)"
            : "none",
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
        The Workbench can surface state-state alignment risks.
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
        Validate temporal joins before they reach reporting.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to detect gaps, ambiguous matches,
        overlapping versions and unintended temporal join splits.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "state_state_alignment",
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
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
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
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
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

const codeBoxStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
  overflowX: "auto",
};

const codeStyle: CSSProperties = {
  whiteSpace: "pre",
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.7,
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

const stateTimelineStyle: CSSProperties = {
  display: "grid",
  gap: 18,
  marginTop: 22,
};

const timelineLaneStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  alignItems: "center",
};

const timelineLaneLabelStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const timelineTrackStyle: CSSProperties = {
  position: "relative",
  height: 56,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.56)",
  overflow: "hidden",
};

const timelineSegmentStyle: CSSProperties = {
  position: "absolute",
  top: 9,
  height: 38,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 12px",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 900,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
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