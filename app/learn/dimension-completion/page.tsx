"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/analytics";

const COMPLETED_TARGET_TABLE = `contract_id,customer_key,snapshot_date,valid_from,valid_to,completion_method
C-1001,Customer A,2024-01-31,2024-01-01,2024-01-31,earliest_known_value_backfill
C-1001,Customer A,2024-02-29,2024-02-01,2024-02-29,earliest_known_value_backfill
C-1001,Customer A,2024-03-31,2024-03-01,2024-03-31,earliest_known_value_backfill
C-1001,Customer A,2024-04-30,2024-04-01,2024-04-30,observed
C-1001,Customer A,2024-05-31,2024-05-01,2024-05-31,observed
C-1001,Customer A,2024-06-30,2024-06-01,2024-06-30,observed`;

const WRONG_TARGET_TABLE = `contract_id,customer_key,snapshot_date,valid_from,valid_to,completion_method
C-1001,,2024-01-31,2024-01-01,2024-01-31,missing_dimension_match
C-1001,,2024-02-29,2024-02-01,2024-02-29,missing_dimension_match
C-1001,,2024-03-31,2024-03-01,2024-03-31,missing_dimension_match
C-1001,Customer A,2024-04-30,2024-04-01,2024-04-30,observed
C-1001,Customer A,2024-05-31,2024-05-01,2024-05-31,observed
C-1001,Customer A,2024-06-30,2024-06-01,2024-06-30,observed`;

const VALIDATION_CHECKS = [
  "Every fact period has a dimension match",
  "No silent fact loss during historical joins",
  "Completed history is marked or explainable",
  "Backfilled values are business-approved",
  "Snapshot completeness validation",
  "Late arriving dimension validation",
];

const SOLUTIONS = [
  {
    title: "Earliest Known Value Backfill",
    text: "Extend the earliest known dimension version backwards when the business assumption is that the value already applied before it was first observed.",
  },
  {
    title: "Carry Forward",
    text: "Extend the closest known dimension version into uncovered periods when this matches the business meaning.",
  },
  {
    title: "Unknown Member",
    text: "Join missing periods to a synthetic fallback member instead of silently dropping fact rows.",
  },
  {
    title: "Synthetic History",
    text: "Reconstruct historical dimension coverage from events, snapshots or other source evidence.",
  },
];

const SNAPSHOT_ROWS = [
  ["Snapshot Date", "2024-02-29"],
  ["Contract", "C-1001"],
  ["Contract valid", "Jan → Dec"],
  ["Customer assignment", "Apr → Dec"],
];

const EXPECTED_ROWS = [
  ["Contract", "C-1001"],
  ["Customer", "Customer A"],
  ["Reason", "Earliest known customer assignment completed backwards"],
];

const WRONG_ROWS = [
  ["Contract", "C-1001"],
  ["Customer", "NULL / Unknown"],
  ["Reason", "No valid customer row exists in February"],
];

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

export default function DimensionCompletionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "dimension_completion",
      page_type: "interactive_example",
      example: "dimension_completion",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "dimension-completion",
      pageType: "learn_page",
    });
  }, []);

  useEffect(() => {
    const trackedDepths = new Set<number>();

    function handleScroll() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);

      [25, 50, 75, 100].forEach((threshold) => {
        if (percent >= threshold && !trackedDepths.has(threshold)) {
          trackedDepths.add(threshold);

          track("scroll_depth", {
            page: "dimension_completion",
            page_type: "interactive_example",
            percent: threshold,
          });
        }
      });
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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

          <h1 style={h1Style}>Dimension Completion</h1>

          <p style={heroTextStyle}>
            A contract exists from January to December, but the customer assignment only
            starts in April. What should the February snapshot report show?
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="A fact exists, but no valid dimension record exists."
          >
            <p style={paragraphStyle}>
              This often happens in snapshot reporting, late-arriving dimensions
              or cross-system integrations. The fact row is available for a
              reporting period, but the dimension history does not cover that
              same period.
            </p>

            <p style={paragraphStyle}>
              A dimension can be technically valid and still be incomplete for reporting.
              SCD2 stores the changes that were captured, but it does not automatically
              create the missing historical coverage needed by snapshot facts.
            </p>

            <ChipRow
              chips={[
                "Missing attributes",
                "Missing joins",
                "Incorrect historical reporting",
                "Unstable snapshots",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <PatternTestCaseCard />

          <WhiteCard
            eyebrow="Reporting question"
            title="What should the February snapshot show?"
          >
            <ResultTable rows={SNAPSHOT_ROWS} />

            <p style={{ ...paragraphStyle, marginTop: 18 }}>
              The contract is clearly valid in February. The customer assignment is not.
              This is the exact moment where Dimension Completion becomes a modeling
              decision instead of a simple join problem.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Key idea"
            title="SCD2 preserves history. Dimension Completion creates missing reporting coverage."
          >
            <p style={paragraphStyle}>
              Many teams assume that historized dimensions are enough for historical
              reporting. But a perfectly modeled SCD2 dimension can still fail if its
              valid-time intervals do not cover the periods required by the fact table.
            </p>

            <p style={paragraphStyle}>
              Dimension Completion extends, reconstructs or explicitly marks missing
              dimension history so every relevant fact period has a deterministic
              dimensional context.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it happens"
            title="The fact model and dimension model do not have the same historical coverage."
          >
            <ChipRow
              chips={[
                "Late arriving dimensions",
                "Partial source history",
                "Cross-system integration",
                "Historical backfills",
                "Snapshot reporting requirements",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Where it appears"
            title="Dimension Completion often appears when fact history is older than dimension history."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Insurance"
                text="A policy exists since 2018, but customer ownership history only starts in 2021."
              />
              <MiniCard
                title="Sales reporting"
                text="Revenue history exists before territory, account or sales hierarchy history was tracked."
              />
              <MiniCard
                title="Product reporting"
                text="Sales facts exist before product categories or risk attributes were historized."
              />
              <MiniCard
                title="Lakehouse migrations"
                text="A new gold model requires historical dimensions that were never fully available in the source."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Complete the dimension before joining it to the fact model."
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
            title="Before publishing the model, validate historical coverage."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Without Dimension Completion, snapshot facts can be correct but historically unusable."
          >
            <p style={paragraphStyle}>
              The fact table may contain one row per entity and snapshot date, but
              downstream reporting still fails when the dimension join cannot resolve a
              valid historical context.
            </p>

            <p style={paragraphStyle}>
              Dimension Completion makes the assumption explicit: either history is
              backfilled, reconstructed, carried forward or assigned to an unknown member.
              The important part is that missing coverage is handled deliberately rather
              than silently losing facts or attributes.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Related Concepts"
            title="Dimension Completion is closely related to several historical modeling concepts."
          >
            <div style={solutionGridStyle}>
              <a href="/learn/snapshot-reproducibility" style={relatedConceptStyle}>
                <strong>Snapshot Reproducibility</strong>
                <div>
                  Historical snapshots remain reproducible only if dimensions provide
                  consistent coverage for every reporting period.
                </div>
              </a>

              <a href="/learn/historical-coverage-gap" style={relatedConceptStyle}>
                <strong>Historical Coverage Gap</strong>
                <div>
                  Dimension Completion is often required when historical coverage gaps
                  exist between facts and dimensions.
                </div>
              </a>

              <a href="/learn/state-state-alignment" style={relatedConceptStyle}>
                <strong>State ↔ State Alignment</strong>
                <div>
                  Historical joins become unstable when aligned states do not cover the
                  same time periods.
                </div>
              </a>

              <a href="/learn/state-modeling" style={relatedConceptStyle}>
                <strong>SCD2 Dimensions</strong>
                <div>
                  SCD2 preserves captured history, but does not automatically create the
                  historical coverage required by snapshot reporting.
                </div>
              </a>
            </div>
          </WhiteCard>

        </section>

        <RelatedPatterns current="dimension_completion" />

        <TryItCard />
      </div>

      <Analytics />
    </main>
  );
}

function DarkExampleCard() {
  const isMobile = useIsMobile();

  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        Contract exists from January to December. Customer assignment starts in April.
      </h2>

      <div style={visualTimelineStyle}>
        {!isMobile && <MonthAxis />}

        <div style={isMobile ? mobileSnapshotMarkerStyle : snapshotMarkerStyle}>
          <div style={snapshotLabelStyle}>February snapshot</div>
          <div style={snapshotTriangleStyle}>▼</div>
          <div style={snapshotLineStyle} />
        </div>

        <VisualTimelineRow
          label="Contract fact"
          startLabel="Jan"
          endLabel="Dec"
          left="0%"
          width="100%"
          color="#bfdbfe"
          border="#93c5fd"
          mobile={isMobile}
        />

        <VisualTimelineRow
          label="Customer dimension"
          startLabel="Apr"
          endLabel="Dec"
          left="25%"
          width="75%"
          color="#ffedd5"
          border="#fdba74"
          mobile={isMobile}
        />

        <div style={questionCardStyle}>
          <div style={questionIconStyle}>?</div>

          <div>
            <div style={questionBadgeStyle}>Snapshot Date: February 2024</div>
            <div style={questionTextStyle}>
              The contract exists. The customer assignment does not exist yet.
              <br />
              What should reporting show?
            </div>
          </div>
        </div>
        <div style={comparisonGridStyle}>
          <ResultCard title="Expected Result (Recommended)" rows={EXPECTED_ROWS} tone="good" />
          <ResultCard title="Common Wrong Result (Risk)" rows={WRONG_ROWS} tone="bad" />
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Reporting date: February</div>

        <p style={exampleNoteTextStyle}>
          The contract exists in February, but the customer dimension has no valid
          row yet. Without completion, the snapshot either loses the dimension
          attributes or fails the historical join.
        </p>
      </div>
    </section>
  );
}

async function copyExampleTable(
  tableName: "completed_target" | "wrong_target",
  value: string
) {
  await navigator.clipboard.writeText(value);

  track("example_table_copied", {
    example: "dimension_completion",
    table: tableName,
  });
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

function ResultTable({ rows }: { rows: string[][] }) {
  return (
    <div style={resultTableStyle}>
      {rows.map(([label, value]) => (
        <div key={label} style={resultRowStyle}>
          <div style={resultLabelStyle}>{label}</div>
          <div style={resultValueStyle}>{value}</div>
        </div>
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
        
        <h2
          style={{
            ...resultTitleStyle,
            color: isGood ? "#166534" : "#991b1b",
          }}
        >
          {title}
        </h2>
      </div>
      <ResultTable rows={rows} />
    </section>
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

function MonthAxis() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div style={monthAxisStyle}>
      {months.map((month) => (
        <div key={month} style={monthTickStyle}>
          <div style={monthLabelStyle}>{month}</div>
          <div style={monthLineStyle} />
        </div>
      ))}
    </div>
  );
}

function VisualTimelineRow({
  label,
  startLabel,
  endLabel,
  left,
  width,
  color,
  border,
  mobile = false,
}: {
  label: string;
  startLabel: string;
  endLabel: string;
  left: string;
  width: string;
  color: string;
  border: string;
  mobile?: boolean;
}) {
  return (
    <div style={mobile ? mobileVisualTimelineRowStyle : visualTimelineRowStyle}>
      <div style={visualTimelineLabelStyle}>{label}</div>

      <div style={mobile ? mobileTimelineTrackStyle : timelineTrackStyle}>
        <div
          style={{
            ...timelineSegmentStyle,
            left: mobile ? "0%" : left,
            width: mobile ? "100%" : width,
            background: color,
            border: `1px solid ${border}`,
          }}
        >
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>
    </div>
  );
}

function PatternTestCaseCard() {
  return (
    <section style={testCaseCardStyle}>
      <div style={testCaseEyebrowStyle}>Test case</div>

      <h2 style={testCaseTitleStyle}>
        Try this Dimension Completion case in Target Table Validation
      </h2>

      <p style={testCaseTextStyle}>
        Copy one of the generated target tables below and paste it into Target
        Table Validation. The completed table represents the intended output.
        The wrong table simulates a pipeline that keeps missing customer matches
        instead of completing the dimension history.
      </p>

      <div style={testCaseGridStyle}>
        <CopyTableCard
          title="Completed target table"
          description="Expected output after Dimension Completion."
          tableName="completed_target"
          value={COMPLETED_TARGET_TABLE}
          tone="good"
        />

        <CopyTableCard
          title="Wrong target table"
          description="Common output when missing dimension matches are not handled."
          tableName="wrong_target"
          value={WRONG_TARGET_TABLE}
          tone="bad"
        />
      </div>

      <a
        href="/#target-table-validation"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "dimension_completion",
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
  tableName: "completed_target" | "wrong_target";
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

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Review your own historical model for Dimension Completion risks.
      </h2>

      <p style={tryItTextStyle}>
        Paste your historized fact and dimension data into the workbench and check
        whether your snapshot model has missing dimensional coverage.
      </p>

      <a
        href="/"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "dimension_completion",
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
  fontSize: "clamp(22px, 5vw, 34px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const timelineListStyle: CSSProperties = {
  marginTop: 22,
  display: "grid",
  gap: 14,
  maxWidth: 820,
};

const timelineRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  alignItems: "center",
};

const timelineLabelStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const timelineBarStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  fontFamily: "monospace",
  fontSize: 13,
  overflowX: "auto",
  whiteSpace: "nowrap",
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 22,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

const relatedConceptStyle: CSSProperties = {
  display: "block",
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#334155",
  lineHeight: 1.6,
};

const comparisonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
};

const resultTableStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 16,
};

const resultRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const resultLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#64748b",
};

const resultValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  color: "#0f172a",
  textAlign: "right",
};

const resultCardStyle: CSSProperties = {
  padding: "clamp(18px, 4vw, 24px)",
  borderRadius: 16,
  color: "#0f172a",
  boxShadow: "0 18px 40px rgba(2, 6, 23, 0.22)",
};

const visualTimelineStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 12,
  marginTop: 28,
  paddingTop: 34,
};

const monthAxisStyle: CSSProperties = {
  marginLeft: 190,
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  alignItems: "end",
  borderBottom: "1px solid rgba(96, 165, 250, 0.7)",
  color: "#e2e8f0",
};

const monthTickStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: 6,
};

const monthLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#e5e7eb",
};

const monthLineStyle: CSSProperties = {
  width: 1,
  height: 10,
  background: "rgba(96, 165, 250, 0.85)",
};

const visualTimelineRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "170px 1fr",
  gap: 18,
  alignItems: "center",
};

const visualTimelineLabelStyle: CSSProperties = {
  color: "#e2e8f0",
  fontSize: 14,
  fontWeight: 900,
};

const timelineTrackStyle: CSSProperties = {
  position: "relative",
  height: 58,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.56)",
  overflow: "hidden",
};

const timelineSegmentStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  height: 38,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  color: "#0f172a",
  fontSize: 15,
  fontWeight: 900,
  boxSizing: "border-box",
};

const snapshotMarkerStyle: CSSProperties = {
  position: "absolute",
  left: "calc(170px + (100% - 170px) / 12 * 1.765)",
  top: 2,
  width: 1,
  height: 218,
  zIndex: 5,
  pointerEvents: "none",
};

const snapshotLabelStyle: CSSProperties = {
  position: "absolute",
  top: -22,
  left: -70,
  width: 150,
  textAlign: "center",
  color: "#fde047",
  fontSize: 12,
  fontWeight: 900,
};

const snapshotTriangleStyle: CSSProperties = {
  position: "absolute",
  top: -5,
  left: -6,
  color: "#fde047",
  fontSize: 14,
  lineHeight: 1,
};

const snapshotLineStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  width: 2,
  height: 190,
  borderLeft: "2px dashed #fde047",
};

const questionCardStyle: CSSProperties = {
  marginTop: 10,
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

const mobileVisualTimelineRowStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const mobileTimelineTrackStyle: CSSProperties = {
  position: "relative",
  height: 54,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.56)",
  overflow: "hidden",
};

const mobileSnapshotMarkerStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: 18,
  width: 1,
  height: 188,
  zIndex: 5,
  pointerEvents: "none",
};