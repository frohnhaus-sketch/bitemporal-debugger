"use client";

import { track } from "@/lib/analytics";
import { useEffect, useMemo, useState } from "react";
import { reviewModelText, type ReviewFinding } from "@/lib/modelReview";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const MODEL_REVIEW_EXAMPLES = [
  {
    id: "architecture_description",
    title: "Architecture description",
    button: "Load Architecture Description",
    description:
      "Plain English model description for monthly snapshots, SCD2 joins and dimension completion risk.",
    input: `We build monthly contract snapshots for insurance contracts.

Source tables:
- contract_state_bitemporal
  - contract_id
  - customer_id
  - status
  - premium_amount
  - valid_from
  - valid_to
  - visible_from
  - visible_to

- customer_dimension_scd2
  - customer_id
  - customer_segment
  - region

Target model:
- fact_contract_month_snapshot
  - contract_id
  - customer_id
  - snapshot_month
  - status
  - premium_amount
  - customer_segment
  - region

Model logic:
For each month-end snapshot date we select the contract state where snapshot_month is between valid_from and valid_to.
We join the customer SCD2 dimension using customer_id and the same snapshot_month between customer valid_from and valid_to.

Late-arriving customer corrections can arrive after the snapshot month.
Contract corrections are handled with visible_from and visible_to.
Customer dimension corrections currently overwrite the previous SCD2 row.

Known concern:
Some contract snapshots have no matching customer dimension row.
We are considering filling missing customer history before joining the fact table.`,
  },
  {
    id: "pyspark_notebook",
    title: "PySpark notebook",
    button: "Load PySpark Notebook",
    description:
      "Notebook-style Spark logic for bitemporal contract history joined to an SCD2 customer dimension.",
    input: `# Databricks notebook: build monthly contract snapshots

from pyspark.sql import functions as F

contracts = spark.table("silver.contract_state_bitemporal")
customers = spark.table("silver.customer_dimension_scd2")
calendar = spark.table("gold.month_end_calendar")

contract_snapshots = (
    contracts.alias("c")
    .join(
        calendar.alias("cal"),
        (F.col("cal.snapshot_month") >= F.col("c.valid_from")) &
        (F.col("cal.snapshot_month") < F.col("c.valid_to")),
        "inner"
    )
    .where(
        (F.col("cal.snapshot_month") >= F.lit("2024-01-31")) &
        (F.col("cal.snapshot_month") <= F.lit("2024-12-31"))
    )
)

result = (
    contract_snapshots.alias("f")
    .join(
        customers.alias("d"),
        (F.col("f.customer_id") == F.col("d.customer_id")) &
        (F.col("f.snapshot_month") >= F.col("d.valid_from")) &
        (F.col("f.snapshot_month") < F.col("d.valid_to")),
        "left"
    )
    .select(
        "f.contract_id",
        "f.customer_id",
        "f.snapshot_month",
        "f.status",
        "f.premium_amount",
        "d.customer_segment",
        "d.region"
    )
)

# Publication note:
# The output table is overwritten on each notebook run.
# We compare row counts after publication, but we do not yet compare regenerated historical snapshot rows.
# Contract corrections use visible_from / visible_to in the source.
result.write.mode("overwrite").saveAsTable("gold.fact_contract_month_snapshot")`,
  },
  {
    id: "sql_snapshot_model",
    title: "SQL snapshot model",
    button: "Load SQL Snapshot Model",
    description:
      "SQL model for month-end snapshot reporting with valid-time joins and reproducibility risk.",
    input: `with month_end_calendar as (
    select snapshot_month
    from dim_calendar
    where is_month_end = true
),

contract_current_state as (
    select
        contract_id,
        customer_id,
        status,
        premium_amount,
        current_product_code
    from contract_current
),

snapshot_rows as (
    select
        c.contract_id,
        c.customer_id,
        cal.snapshot_month,
        c.status,
        c.premium_amount,
        p.product_group
    from contract_current_state c
    join month_end_calendar cal
      on cal.snapshot_month >= date '2024-01-31'
     and cal.snapshot_month <= date '2024-12-31'
    left join product_lookup p
      on c.current_product_code = p.product_code
)

select *
from snapshot_rows;

-- Review concern:
-- snapshots are rebuilt from current source state
-- visible time is not stored in the final table
-- If a late correction arrives next month, an old snapshot month may be regenerated with knowledge that was not visible at the original reporting run.`,
  },
  {
    id: "dbt_scd2_model",
    title: "dbt model",
    button: "Load dbt Model",
    description:
      "dbt-style incremental model with SCD2 joins, snapshot grain and late-arriving correction risk.",
    input: `{{ config(
    materialized = 'incremental',
    unique_key = ['contract_id', 'snapshot_month']
) }}

with contracts as (
    select *
    from {{ ref('silver_contract_state_bitemporal') }}
),

customers as (
    select *
    from {{ ref('dim_customer_scd2') }}
),

calendar as (
    select snapshot_month
    from {{ ref('dim_month_end_calendar') }}
),

contract_snapshots as (
    select
        c.contract_id,
        c.customer_id,
        cal.snapshot_month,
        c.status,
        c.premium_amount
    from contracts c
    join calendar cal
      on cal.snapshot_month >= c.valid_from
     and cal.snapshot_month <  c.valid_to
),

final as (
    select
        s.contract_id,
        s.customer_id,
        s.snapshot_month,
        s.status,
        s.premium_amount,
        d.customer_segment,
        d.region
    from contract_snapshots s
    left join customers d
      on s.customer_id = d.customer_id
     and s.snapshot_month >= d.valid_from
     and s.snapshot_month <  d.valid_to
)

select *
from final

{% if is_incremental() %}
where snapshot_month >= dateadd(month, -2, current_date)
{% endif %}

-- Known risk:
-- Late arriving customer dimension corrections may affect old snapshot months.
-- The incremental rebuild window only rebuilds the last two months.
-- Corrections outside this window require a targeted historical backfill.
-- Older snapshots may otherwise keep stale dimension attributes.`,
  },
];

export function ModelReviewPanel() {
  const [input, setInput] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);

  const review = useMemo(() => {
    if (!input.trim()) return null;
    return reviewModelText(input);
  }, [input]);

  const primaryFinding = review?.findings
    ?.slice()
    .sort((a, b) => getFindingPriority(b) - getFindingPriority(a))[0];

  useEffect(() => {
    if (!review) return;

    track("model_review_completed", {
      patternCount: review.detectedPatterns.length,
      decisionCount: review.detectedDecisions.length,
      findingCount: review.findings.length,
      recommendation: review.architectureSummary.outputType,
      complexity: review.architectureSummary.complexity,
      inputLength: input.length,
    });
  }, [review, input.length]);

  async function copyReport() {
    if (!review) return;

    track("model_review_report_copied", {
      findingCount: review.findings.length,
      patternCount: review.detectedPatterns.length,
    });

    await navigator.clipboard.writeText(review.markdownReport);
    setCopyState("copied");

    window.setTimeout(() => {
      setCopyState("idle");
    }, 2000);
  }

  function loadExampleReview(example: (typeof MODEL_REVIEW_EXAMPLES)[number]) {
    setInput(example.input);
    setActiveExampleId(example.id);

    track("review_example_loaded", {
      example: example.id,
      inputLength: example.input.length,
    });
  }

  function getSyntaxLanguage() {
    if (activeExampleId === "pyspark_notebook") return "python";
    if (activeExampleId === "sql_snapshot_model") return "sql";
    if (activeExampleId === "dbt_scd2_model") return "sql";
    if (activeExampleId === "architecture_description") return "markdown";

    const lowered = input.toLowerCase();

    if (lowered.includes("pyspark") || lowered.includes("spark.table")) {
      return "python";
    }

    if (
      lowered.includes("select ") ||
      lowered.includes("with ") ||
      lowered.includes("join ")
    ) {
      return "sql";
    }

    return "markdown";
  }

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#2563eb",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 8,
        }}
      >
        Historical Model Review
      </div>

      <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
        Review an existing model
      </h2>

      <p style={{ color: "#475569", marginTop: 0, marginBottom: 18 }}>
        Paste SQL, PySpark, dbt model code or notebook text to understand the
        historical architecture, detected modeling decisions and potential
        review questions.
      </p>

      <div
        style={{
          marginBottom: 18,
          padding: 16,
          borderRadius: 14,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#1d4ed8",
            textTransform: "uppercase",
            letterSpacing: 0.7,
            marginBottom: 6,
          }}
        >
          Try an example
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 6,
          }}
        >
          See what the model review can understand
        </div>

        <p
          style={{
            margin: "0 0 14px",
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Load a sample architecture description, PySpark notebook, SQL model or
          dbt model to see how the review detects historical modeling patterns,
          risks and missing validation checks.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10,
          }}
        >
          {MODEL_REVIEW_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => loadExampleReview(example)}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 12,
                background:
                  activeExampleId === example.id ? "#2563eb" : "#ffffff",
                color: activeExampleId === example.id ? "#ffffff" : "#0f172a",
                border:
                  activeExampleId === example.id
                    ? "1px solid #1d4ed8"
                    : "1px solid #bfdbfe",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 6 }}>
                {example.button}
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: activeExampleId === example.id ? "#dbeafe" : "#475569",
                }}
              >
                {example.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {input ? (
        <div
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <SyntaxHighlighter
            language={getSyntaxLanguage()}
            style={oneLight}
            customStyle={{
              margin: 0,
              minHeight: 220,
              maxHeight: 360,
              padding: 18,
              fontSize: 13,
              lineHeight: 1.6,
              background: "#f8fafc",
            }}
            wrapLongLines
          >
            {input}
          </SyntaxHighlighter>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste SQL, PySpark, dbt model or notebook text here..."
            style={{
              width: "100%",
              minHeight: 120,
              padding: 14,
              border: 0,
              borderTop: "1px solid #cbd5e1",
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 1.5,
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>
      ) : (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste SQL, PySpark, dbt model or notebook text here..."
          style={{
            width: "100%",
            minHeight: 220,
            padding: 14,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.5,
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      )}

      {!review && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          The review will appear after you paste model logic.
        </div>
      )}

      {review && (
        <>
          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 14,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.7,
                color: "#1d4ed8",
                marginBottom: 6,
              }}
            >
              Historical Architecture Summary
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              {review.architectureSummary.outputType}
            </div>

            <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.5 }}>
              {review.architectureSummary.explanation}
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "#334155" }}>
              <strong>Source behavior:</strong>{" "}
              {review.architectureSummary.sourceBehavior}
            </div>

            <div style={{ marginTop: 6, fontSize: 13, color: "#334155" }}>
              <strong>Complexity:</strong>{" "}
              {review.architectureSummary.complexity}
            </div>

            {review.architectureSummary.mainOperations.length > 0 && (
              <>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#0f172a",
                  }}
                >
                  <strong>Detected operations:</strong>
                </div>

                <ChipRow
                  items={review.architectureSummary.mainOperations}
                  background="#ffffff"
                  border="#bfdbfe"
                  color="#1d4ed8"
                />
              </>
            )}
          </div>

          {primaryFinding && (
            <div
              style={{
                marginTop: 18,
                padding: 18,
                borderRadius: 14,
                background:
                  primaryFinding.severity === "high"
                    ? "#fef2f2"
                    : primaryFinding.severity === "medium"
                      ? "#fffbeb"
                      : "#f8fafc",
                border:
                  primaryFinding.severity === "high"
                    ? "1px solid #fecaca"
                    : primaryFinding.severity === "medium"
                      ? "1px solid #fde68a"
                      : "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color:
                    primaryFinding.severity === "high"
                      ? "#b91c1c"
                      : primaryFinding.severity === "medium"
                        ? "#92400e"
                        : "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  marginBottom: 6,
                }}
              >
                Biggest Historical Risk
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                {primaryFinding.title}
              </div>

              <div
                style={{
                  color: "#475569",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {primaryFinding.risk}
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <strong>Recommended validation:</strong>
                <div style={{ marginTop: 6 }}>
                  {primaryFinding.recommendation}
                </div>
              </div>
            </div>
          )}

          {review.detectedDecisions.length > 0 && (
            <ReviewSectionTitle title="Detected Modeling Decisions" />
          )}

          {review.detectedDecisions.length > 0 && (
            <ChipRow
              items={review.detectedDecisions}
              background="#ecfdf5"
              border="#86efac"
              color="#166534"
            />
          )}

          {review.findings.length > 0 && (
            <>
              <ReviewSectionTitle title="Additional Review Observations" />

              <div style={{ display: "grid", gap: 12 }}>
                {review.findings
                  .filter((finding) => finding.id !== primaryFinding?.id)
                  .slice(0, 3)
                  .map((finding) => (
                    <div
                      key={finding.id}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color:
                            finding.severity === "high"
                              ? "#b91c1c"
                              : finding.severity === "medium"
                                ? "#92400e"
                                : "#475569",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        {finding.severity} observation
                      </div>

                      <div style={{ fontWeight: 900, marginBottom: 6 }}>
                        {finding.title}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 14,
                          lineHeight: 1.5,
                          marginBottom: 8,
                        }}
                      >
                        {finding.risk}
                      </div>

                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Review question:</strong>{" "}
                        {finding.recommendation}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {review.detectedPatterns.length > 0 && (
            <>
              <ReviewSectionTitle title="Detected Patterns" />

              <ChipRow
                items={review.detectedPatterns}
                background="#eff6ff"
                border="#bfdbfe"
                color="#1d4ed8"
              />
            </>
          )}

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: 0.7,
                marginBottom: 6,
              }}
            >
              Review Report
            </div>

            <p
              style={{
                margin: "0 0 14px",
                color: "#475569",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Copy a Markdown review report for documentation, implementation
              review or follow-up work.
            </p>

            <button
              type="button"
              onClick={copyReport}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "#2563eb",
                color: "#ffffff",
                border: "1px solid #1d4ed8",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              {copyState === "copied"
                ? "Copied Review Report"
                : "Copy Review Report"}
            </button>

            <details style={{ marginTop: 14 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Preview Report
              </summary>

              <pre
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 10,
                  background: "#0f172a",
                  color: "#e2e8f0",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {review.markdownReport}
              </pre>
            </details>
          </div>
        </>
      )}
    </section>
  );
}

function getFindingPriority(finding: ReviewFinding) {
  const priorityById: Record<string, number> = {
    "limited-incremental-rebuild-risk": 100,
    "current-rebuild-snapshot-risk": 95,
    "overwrite-snapshot-publication-risk": 90,
    "dimension-completion-risk": 85,
    "snapshot-without-visible-time": 80,
    "temporal-join-without-range-condition": 75,
    "event-alignment-without-prioritization": 70,
    "scd2-without-change-detection": 60,
  };

  const severityBoost = {
    high: 30,
    medium: 20,
    low: 10,
  };

  return (priorityById[finding.id] ?? 0) + severityBoost[finding.severity];
}

function ReviewSectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        marginTop: 18,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 800,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {title}
    </div>
  );
}

const CHIP_TOOLTIPS: Record<string, string> = {
  "Snapshot Reporting":
    "The model contains snapshot or month-end reporting logic.",
  "Valid-Time Modeling":
    "The model uses business-valid intervals such as valid_from and valid_to.",
  "Bitemporal / Visibility Modeling":
    "The model uses visible-time columns to represent when data became known.",
  "SCD2-style Dimension Modeling":
    "The model contains SCD2-style dimension history or valid-time dimensions.",
  "Temporal Join":
    "A join appears to depend on historical valid-time alignment.",
  "Winner Selection / Prioritization":
    "The logic appears to choose one record from multiple candidates using ranking or priority rules.",
  "Aggregation / State Reduction":
    "The logic appears to aggregate, collapse or reduce historical states.",
  "PySpark / notebook implementation detected":
    "The pasted model looks like PySpark or notebook code.",
  "Visibility-time handling detected":
    "The model explicitly uses visible_from / visible_to or equivalent columns.",
  "Event prioritization logic detected":
    "The model appears to prioritize events or select business-relevant milestones.",
};

function ChipRow({
  items,
  background,
  border,
  color,
}: {
  items: string[];
  background: string;
  border: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item) => (
        <span
          key={item}
          title={CHIP_TOOLTIPS[item] ?? item}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background,
            border: `1px solid ${border}`,
            color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
