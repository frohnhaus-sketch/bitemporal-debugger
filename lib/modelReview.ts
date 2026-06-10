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

  const hasSnapshot =
    includesAny(text, ["snapshot", "snapshot_date", "reference_date", "month_end", "month-end"]);

  const hasValidTime =
    includesAny(text, ["valid_from", "valid_to", "bk_valid_from", "bk_valid_to"]);

  const hasVisibleTime =
    includesAny(text, ["visible_from", "visible_to", "bk_visible_from", "bk_visible_to"]);

  const hasScd2 =
    includesAny(text, ["scd2", "valid_from", "valid_to", "is_current"]);

  const hasEvent =
    includesAny(text, ["event", "event_time", "effective_at", "bk_effective_at"]);

  const hasJoin =
    includesAny(text, [" join ", ".join(", "merge", "left join", "inner join"]);

  const hasBetween =
    includesAny(text, [" between ", ">= ", "<=", "< "]);

  const hasRank =
    includesAny(text, ["row_number", "rank()", "dense_rank", "window"]);

  const hasGroupBy =
    includesAny(text, ["group by", ".groupby", "groupBy"]);

  const hasHash =
    includesAny(text, ["hash", "checksum", "md5", "sha2"]);

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

  const hasNonTemporalJoinJustification =
    includesAny(text, [
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

  if (hasRank) {
    detectedDecisions.push(
      "Winner selection / prioritization logic detected"
    );
  }
  
  if (hasGroupBy) {
    detectedDecisions.push(
      "Aggregation or state reduction logic detected"
    );
  }
  
  if (hasVisibleTime) {
    detectedDecisions.push(
      "Visibility-time handling detected"
    );
  }
  
  if (hasEvent && hasRank) {
    detectedDecisions.push(
      "Event prioritization logic detected"
    );
  }
  
  if (hasJoin && hasValidTime && hasNonTemporalJoinJustification) {
    detectedDecisions.push(
      "Non-temporal join is explicitly documented"
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

  if (hasJoin && hasValidTime && !hasBetween && !hasNonTemporalJoinJustification) {
    findings.push({
      id: "temporal-join-without-range-condition",
      title: "Temporal join may miss valid-time alignment",
      severity: "high",
      evidence: ["Join detected", "Valid-time columns detected", "No obvious range condition detected"],
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
      risk:
        "This may be valid if the joined source is stable, reduced to one row per key, or intentionally treated as reference data.",
      recommendation:
        "Keep the justification close to the join logic and validate uniqueness of the joined source per business key.",
    });
  }

  if (hasEvent && hasJoin && !hasRank) {
    findings.push({
      id: "event-alignment-without-prioritization",
      title: "Event alignment may need prioritization",
      severity: "medium",
      evidence: ["Event-like fields detected", "Join logic detected", "No ranking or winner selection detected"],
      risk: "Multiple matching states may exist for the same event, causing ambiguous event-to-state mapping.",
      recommendation:
        "Define winner-selection logic for events that match multiple historical states.",
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
      evidence: ["Visible-time columns detected", "No snapshot or reporting cut-off detected"],
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
      risk:
        "This may be correct for current-state reporting, but it may not support historical or point-in-time reporting.",
      recommendation:
        "Clarify whether the report should use current dimension values or dimension values valid at the reporting date.",
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
    new Map(findings.map((finding) => [finding.id, finding])).values()
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
${finding.recommendation}`
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

  const sourceBehavior = input.hasEvent
    ? "Event-oriented source logic"
    : input.hasValidTime
    ? "State-oriented historical source logic"
    : "No clear historical source behavior detected";

  const outputType = input.hasSnapshot
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

  let explanation =
    "The reviewed logic contains historical modeling signals.";
  
  if (
    input.hasEvent &&
    input.hasRank &&
    input.hasGroupBy
  ) {
    explanation =
      "The reviewed logic appears to transform raw historical events into a curated business-level event product. Event prioritization, enrichment and aggregation/state-reduction logic were detected. The output likely represents interpreted business events rather than raw source events.";
  }
  else if (
    input.hasValidTime &&
    input.hasJoin &&
    input.hasScd2
  ) {
    explanation =
      "The reviewed logic appears to build a historized reporting model using valid-time semantics and dimension alignment. The output is likely intended for point-in-time or snapshot reporting.";
  }
  else if (
    input.hasSnapshot
  ) {
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