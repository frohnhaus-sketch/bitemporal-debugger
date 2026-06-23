export type ReviewFinding = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  risk: string;
  recommendation: string;
};

export type ModelReviewResult = {
  detectedPatterns: string[];
  detectedDecisions: string[];
  findings: ReviewFinding[];
  reviewSummary: string;
  markdownReport: string;
  architectureSummary: HistoricalArchitectureSummary;
};

export function reviewModelText(input: string): ModelReviewResult {
  const text = input.toLowerCase();

  const detectedPatterns: string[] = [];
  const findings: ReviewFinding[] = [];
  const detectedDecisions: string[] = [];

  const hasSnapshot = includesAny(text, [
    "snapshot",
    "snapshot_date",
    "reference_date",
    "month_end",
    "month-end",
  ]);

  const hasValidTime = includesAny(text, [
    "valid_from",
    "valid_to",
    "bk_valid_from",
    "bk_valid_to",
  ]);

  const hasVisibleTime = includesAny(text, [
    "visible_from",
    "visible_to",
    "bk_visible_from",
    "bk_visible_to",
  ]);

  const hasScd2 = includesAny(text, [
    "scd2",
    "valid_from",
    "valid_to",
    "is_current",
  ]);

  const hasEvent = includesAny(text, [
    "event",
    "event_time",
    "effective_at",
    "bk_effective_at",
  ]);

  const hasJoin = includesAny(text, [
    " join ",
    ".join(",
    "merge",
    "left join",
    "inner join",
  ]);

  const hasBetween = includesAny(text, [" between ", ">= ", "<=", "< "]);

  const hasRank = includesAny(text, [
    "row_number",
    "dense_rank",
    "rank()",
    ".over(",
    "window.partitionby",
    "partitionby(",
    "partition by",
  ]);

  const hasEventPrioritization =
    hasEvent &&
    includesAny(text, [
      "prioritization",
      "priority_rank",
      "event priority",
      "event_rank",
      "milestone",
      "winner event",
    ]);

  const hasGroupBy = includesAny(text, ["group by", ".groupby", "groupBy"]);

  const hasHash = includesAny(text, ["hash", "checksum", "md5", "sha2"]);

  const hasIncremental = includesAny(text, [
    "is_incremental",
    "incremental",
    "unique_key",
  ]);

  const hasLimitedRebuildWindow = includesAny(text, [
    "last two months",
    "dateadd(month, -2",
    "-2, current_date",
  ]);

  const hasOverwrite = includesAny(text, [
    "overwrite",
    'mode("overwrite")',
    "mode('overwrite')",
  ]);

  const hasMissingDimensionConcern = includesAny(text, [
    "no matching customer dimension",
    "null customer_segment",
    "missing customer",
    "missing dimension",
    "dimension completion",
  ]);

  const hasCurrentRebuildConcern = includesAny(text, [
    "rebuilt from current source state",
    "current rebuild",
    "current source state",
    "current_truth",
    "current truth",
  ]);

  const hasLateArrivingConcern = includesAny(text, [
    "late-arriving",
    "late arriving",
    "corrections can arrive after",
    "late arriving customer",
  ]);

  const hasPySpark = includesAny(text, [
    "spark.table",
    "pyspark",
    "from pyspark.sql",
  ]);

  const hasDbt = includesAny(text, ["{{ config", "ref(", "is_incremental"]);

  const hasSql = includesAny(text, ["with ", "select ", "from ", "left join"]);

  const hasFactDimJoin =
    includesAny(text, [
      "fact_",
      "dim_",
      " fact ",
      " dimension",
      "dim_customer",
      "dim_contract",
      "dim_",
    ]) && hasJoin;

  const hasNonTemporalJoinJustification = includesAny(text, [
    "nicht bitemporaler join",
    "kein bitemp join",
    "kein bitemporaler join",
    "nicht historisiert",
    "zeitunabhängig",
    "not historized",
    "non-temporal join",
    "not a temporal join",
  ]);

  if (hasSnapshot) detectedPatterns.push("Snapshot Reporting");
  if (hasValidTime) detectedPatterns.push("Valid-Time Modeling");
  if (hasVisibleTime) detectedPatterns.push("Bitemporal / Visibility Modeling");
  if (hasScd2) detectedPatterns.push("SCD2-style Dimension Modeling");
  if (hasEvent) detectedPatterns.push("Event Modeling");
  if (hasJoin && hasValidTime) detectedPatterns.push("Temporal Join");
  if (hasRank) detectedPatterns.push("Winner Selection / Prioritization");
  if (hasGroupBy) detectedPatterns.push("Aggregation / State Reduction");
  if (hasMissingDimensionConcern) detectedPatterns.push("Dimension Completion");
  if (hasIncremental) detectedPatterns.push("Incremental Snapshot Build");
  if (hasLateArrivingConcern)
    detectedPatterns.push("Late-Arriving Corrections");

  if (hasRank) {
    detectedDecisions.push("Winner selection / prioritization logic detected");
  }

  if (hasGroupBy) {
    detectedDecisions.push("Aggregation or state reduction logic detected");
  }

  if (hasVisibleTime) {
    detectedDecisions.push("Visibility-time handling detected");
  }

  if (hasEventPrioritization) {
    detectedDecisions.push("Event prioritization logic detected");
  }

  if (hasJoin && hasValidTime && hasNonTemporalJoinJustification) {
    detectedDecisions.push("Non-temporal join is explicitly documented");
  }

  if (hasPySpark) {
    detectedDecisions.push("PySpark / notebook implementation detected");
  }

  if (hasDbt) {
    detectedDecisions.push("dbt-style model configuration detected");
  }

  if (hasIncremental) {
    detectedDecisions.push("Incremental rebuild strategy detected");
  }

  if (hasOverwrite) {
    detectedDecisions.push("Overwrite-based table publication detected");
  }

  if (hasMissingDimensionConcern) {
    detectedDecisions.push(
      "Missing dimension coverage is explicitly documented",
    );
  }

  if (hasSnapshot && !hasVisibleTime) {
    findings.push({
      id: "snapshot-without-visible-time",
      title: "Snapshot reproducibility may be incomplete",
      severity: "high",
      evidence: ["Snapshot logic detected", "No visible-time columns detected"],
      risk: "Reports may not be reproducible if late-arriving corrections can change historical records.",
      recommendation:
        "Define whether snapshots should represent business-valid history or the history visible at the reporting run.",
    });
  }

  if (
    hasJoin &&
    hasValidTime &&
    !hasBetween &&
    !hasNonTemporalJoinJustification
  ) {
    findings.push({
      id: "temporal-join-without-range-condition",
      title: "Temporal join may miss valid-time alignment",
      severity: "high",
      evidence: [
        "Join detected",
        "Valid-time columns detected",
        "No obvious range condition detected",
      ],
      risk: "Rows may be joined by key only, producing historically incorrect matches.",
      recommendation:
        "Add explicit valid-time overlap or as-of join conditions using valid_from and valid_to.",
    });
  }

  if (hasJoin && hasValidTime && hasNonTemporalJoinJustification) {
    findings.push({
      id: "non-temporal-join-justified",
      title: "Non-temporal join is documented",
      severity: "low",
      evidence: [
        "Join detected",
        "Historical columns detected",
        "Comment indicates the join is intentionally non-temporal",
      ],
      risk: "This may be valid if the joined source is stable, reduced to one row per key, or intentionally treated as reference data.",
      recommendation:
        "Keep the justification close to the join logic and validate uniqueness of the joined source per business key.",
    });
  }

  if (hasEvent && hasJoin && !hasRank) {
    findings.push({
      id: "event-alignment-without-prioritization",
      title: "Event alignment may need prioritization",
      severity: "medium",
      evidence: [
        "Event-like fields detected",
        "Join logic detected",
        "No ranking or winner selection detected",
      ],
      risk: "Multiple matching states may exist for the same event, causing ambiguous event-to-state mapping.",
      recommendation:
        "Define winner-selection logic for events that match multiple historical states.",
    });
  }

  if (hasMissingDimensionConcern) {
    findings.push({
      id: "dimension-completion-risk",
      title: "Dimension completion risk detected",
      severity: "high",
      evidence: [
        "Missing dimension coverage is mentioned",
        "Fact or snapshot rows may exist before matching dimension history",
      ],
      risk: "Historical facts may lose attribution or appear with null dimension attributes if dimension history is incomplete.",
      recommendation:
        "Complete the dimension timeline, use a controlled unknown member, or explicitly document expected sparsity before joining facts to dimensions.",
    });
  }

  if (hasCurrentRebuildConcern && hasSnapshot && !hasVisibleTime) {
    findings.push({
      id: "current-rebuild-snapshot-risk",
      title: "Current-state rebuild risk detected",
      severity: "high",
      evidence: [
        "Snapshot output is rebuilt from current source state",
        "No visible-time interval is preserved in the final model",
      ],
      risk: "Rebuilding old snapshots may silently use later corrections or future knowledge.",
      recommendation:
        "Persist visible-time information or store the exact published snapshot state if reports must be reproducible.",
    });
  }

  if (hasIncremental && hasLimitedRebuildWindow && hasLateArrivingConcern) {
    findings.push({
      id: "limited-incremental-rebuild-risk",
      title: "Limited incremental rebuild may miss late corrections",
      severity: "high",
      evidence: [
        "Incremental model detected",
        "Limited rebuild window detected",
        "Late-arriving corrections are mentioned",
      ],
      risk: "Corrections for older historical periods may not be applied if the incremental rebuild window is too short.",
      recommendation:
        "Define a correction-aware backfill strategy, widen the rebuild window, or trigger targeted historical restatements.",
    });
  }

  if (hasOverwrite && hasSnapshot) {
    findings.push({
      id: "overwrite-snapshot-publication-risk",
      title: "Overwrite publication should be controlled",
      severity: "medium",
      evidence: [
        "Overwrite-based publication detected",
        "Snapshot model detected",
      ],
      risk: "Overwriting the target table can hide changes between previous and regenerated snapshot outputs.",
      recommendation:
        "Track snapshot versions, compare regenerated outputs, or persist publication metadata for auditability.",
    });
  }

  if (hasScd2 && !hasHash) {
    findings.push({
      id: "scd2-without-change-detection",
      title: "SCD2 change detection is not obvious",
      severity: "medium",
      evidence: ["SCD2-like columns detected", "No hash/checksum detected"],
      risk: "Attribute changes may not be consistently detected or versioned.",
      recommendation:
        "Use a stable change detection strategy such as record hash, tracked attributes or explicit change flags.",
    });
  }

  if (hasVisibleTime && !hasSnapshot) {
    findings.push({
      id: "visible-time-without-snapshot-use",
      title: "Visible-time exists but snapshot usage is unclear",
      severity: "low",
      evidence: [
        "Visible-time columns detected",
        "No snapshot or reporting cut-off detected",
      ],
      risk: "The model may store bitemporal information without using it for reproducible reporting.",
      recommendation:
        "Clarify whether visible-time is required for auditability, replay, or reporting reproducibility.",
    });
  }

  if (hasFactDimJoin && !hasValidTime && !hasSnapshot && !hasVisibleTime) {
    findings.push({
      id: "dimension-join-without-history",
      title: "Dimension join detected without historical alignment",
      severity: "low",
      evidence: [
        "Fact/dimension style join detected",
        "No valid-time, visible-time or snapshot columns detected",
      ],
      risk: "This may be correct for current-state reporting, but it may not support historical or point-in-time reporting.",
      recommendation:
        "Clarify whether the report should use current dimension values or dimension values valid at the reporting date.",
    });
  }

  if (
    hasSnapshot &&
    includesAny(text, [
      "rebuilt from current source state",
      "current source state",
      "not stored visible time",
      "visible time is not stored",
    ])
  ) {
    findings.push({
      id: "current-rebuild-snapshot-risk",
      title: "Historical snapshots are rebuilt from current source state",
      severity: "high",
      evidence: [
        "Snapshot logic detected",
        "Model appears to rebuild snapshots from current source state",
        "Visible-time preservation is not documented",
      ],
      risk:
        "Historical reports may change when late-arriving corrections or restatements arrive in the source system.",
      recommendation:
        "Store visible-time information or persist published snapshot versions to ensure reproducible reporting.",
    });
  }

  const uniqueDetectedPatterns = unique(detectedPatterns);
  const uniqueFindings = uniqueFindingsById(findings);
  const uniqueDetectedDecisions = unique(detectedDecisions);

  const reviewSummary =
    uniqueDetectedPatterns.length === 0 && uniqueFindings.length === 0
      ? "No historical modeling pattern detected from the provided text."
      : uniqueFindings.length === 0
        ? "Historical modeling patterns detected, but no major risks found."
        : `${uniqueFindings.length} potential historical modeling risk${
            uniqueFindings.length === 1 ? "" : "s"
          } detected.`;

  const markdownReport = generateModelReviewMarkdown({
    detectedPatterns: uniqueDetectedPatterns,
    detectedDecisions: uniqueDetectedDecisions,
    findings: uniqueFindings,
    reviewSummary,
  });

  const architectureSummary = generateArchitectureSummary({
    hasSnapshot,
    hasValidTime,
    hasVisibleTime,
    hasScd2,
    hasEvent,
    hasJoin,
    hasRank,
    hasGroupBy,
    hasFactDimJoin,
    hasIncremental,
    hasMissingDimensionConcern,
    hasCurrentRebuildConcern,
    hasPySpark,
    hasDbt,
    detectedPatterns: uniqueDetectedPatterns,
    detectedDecisions: uniqueDetectedDecisions,
  });

  return {
    detectedPatterns: uniqueDetectedPatterns,
    detectedDecisions: uniqueDetectedDecisions,
    findings: uniqueFindings,
    reviewSummary,
    architectureSummary,
    markdownReport,
  };
}

function uniqueFindingsById(findings: ReviewFinding[]) {
  return Array.from(
    new Map(findings.map((finding) => [finding.id, finding])).values(),
  );
}

function includesAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle.toLowerCase()));
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function generateModelReviewMarkdown(result: {
  detectedPatterns: string[];
  detectedDecisions: string[];
  findings: ReviewFinding[];
  reviewSummary: string;
}) {
  return `# Historical Model Review Report

## Review Summary

${result.reviewSummary}

## Detected Modeling Patterns

${toMarkdownList(result.detectedPatterns)}

## Detected Modeling Decisions

${toMarkdownList(result.detectedDecisions)}

## Findings

${
  result.findings.length === 0
    ? "- No findings detected."
    : result.findings
        .map(
          (finding) => `### ${finding.title}

Severity: ${finding.severity}

Evidence:
${toMarkdownList(finding.evidence)}

Risk:
${finding.risk}

Recommendation:
${finding.recommendation}`,
        )
        .join("\n\n")
}

## Suggested Next Steps

- Review the detected patterns against the intended reporting requirement.
- Confirm whether valid-time and visible-time semantics are required.
- Validate joins with representative historical test cases.
- Check snapshot reproducibility if reports depend on reporting cut-off dates.
`;
}

function toMarkdownList(items: string[]) {
  if (items.length === 0) return "- None";

  return items.map((item) => `- ${item}`).join("\n");
}

export type HistoricalArchitectureSummary = {
  sourceBehavior: string;
  outputType: string;
  mainOperations: string[];
  complexity: "Low" | "Medium" | "High";
  explanation: string;
};

function generateArchitectureSummary(input: {
  hasSnapshot: boolean;
  hasValidTime: boolean;
  hasVisibleTime: boolean;
  hasScd2: boolean;
  hasEvent: boolean;
  hasJoin: boolean;
  hasRank: boolean;
  hasGroupBy: boolean;
  hasFactDimJoin: boolean;
  hasIncremental: boolean;
  hasMissingDimensionConcern: boolean;
  hasCurrentRebuildConcern: boolean;
  hasPySpark: boolean;
  hasDbt: boolean;
  detectedPatterns: string[];
  detectedDecisions: string[];
}): HistoricalArchitectureSummary {
  const mainOperations: string[] = [];

  if (input.hasEvent) mainOperations.push("Event modeling");
  if (input.hasRank) mainOperations.push("Winner selection / prioritization");
  if (input.hasGroupBy) mainOperations.push("Aggregation / state reduction");
  if (input.hasJoin) mainOperations.push("Join / enrichment");
  if (input.hasVisibleTime) mainOperations.push("Visibility-time handling");
  if (input.hasSnapshot) mainOperations.push("Snapshot generation");
  if (input.hasScd2) mainOperations.push("SCD2-style historization");
  if (input.hasIncremental) mainOperations.push("Incremental rebuild");
  if (input.hasMissingDimensionConcern)
    mainOperations.push("Dimension completion check");

  const sourceBehavior = input.hasEvent
    ? "Event-oriented source logic"
    : input.hasValidTime
      ? "State-oriented historical source logic"
      : "No clear historical source behavior detected";

  const outputType =
    input.hasIncremental && input.hasSnapshot
      ? "Incremental snapshot data product"
      : input.hasPySpark && input.hasSnapshot
        ? "PySpark snapshot publication pipeline"
        : input.hasMissingDimensionConcern && input.hasSnapshot
          ? "Snapshot model with dimension completion risk"
          : input.hasCurrentRebuildConcern && input.hasSnapshot
            ? "Snapshot model with reproducibility risk"
            : input.hasSnapshot
              ? "Snapshot-oriented historical data product"
              : input.hasEvent
                ? "Business event data product"
                : input.hasScd2
                  ? "Historized dimension or state table"
                  : "Unknown or current-state data product";

  const complexityScore =
    Number(input.hasVisibleTime) +
    Number(input.hasEvent) +
    Number(input.hasRank) +
    Number(input.hasGroupBy) +
    Number(input.hasJoin) +
    Number(input.hasSnapshot);

  const complexity =
    complexityScore >= 4 ? "High" : complexityScore >= 2 ? "Medium" : "Low";

  let explanation = "The reviewed logic contains historical modeling signals.";

  if (input.hasIncremental && input.hasSnapshot) {
    explanation =
      "The reviewed logic appears to build an incremental snapshot model. This is useful for operational efficiency, but it requires explicit handling of late-arriving corrections and historical restatements.";
  } else if (input.hasPySpark && input.hasSnapshot) {
    explanation =
      "The reviewed logic appears to build a PySpark snapshot pipeline. It joins historical contract state to customer dimension history and publishes the result as a target table. If this output is used for recurring reporting, consider tracking publication versions or comparing regenerated outputs.";
  } else if (input.hasMissingDimensionConcern && input.hasSnapshot) {
    explanation =
      "The reviewed logic appears to build monthly snapshots where dimension history may be incomplete. This is a strong signal for Dimension Completion, Unknown Member handling or explicit coverage validation before publication.";
  } else if (input.hasCurrentRebuildConcern && input.hasSnapshot) {
    explanation =
      "The reviewed logic appears to rebuild snapshot outputs from current source state. Without visible-time preservation, old reporting snapshots may not be reproducible after late corrections.";
  } else if (input.hasEvent && input.hasRank && input.hasGroupBy) {
    explanation =
      "The reviewed logic appears to transform raw historical events into a curated business-level event product. Event prioritization, enrichment and aggregation/state-reduction logic were detected. The output likely represents interpreted business events rather than raw source events.";
  } else if (input.hasValidTime && input.hasJoin && input.hasScd2) {
    explanation =
      "The reviewed logic appears to build a historized reporting model using valid-time semantics and dimension alignment. The output is likely intended for point-in-time or snapshot reporting.";
  } else if (input.hasSnapshot) {
    explanation =
      "The reviewed logic appears to generate reproducible reporting snapshots from historical source data.";
  }

  return {
    sourceBehavior,
    mainOperations: unique(mainOperations),
    outputType,
    complexity,
    explanation,
  };
}
