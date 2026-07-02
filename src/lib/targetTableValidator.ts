import { parseCSV } from "@/lib/parser";
import {
  detectInvalidIntervals,
  detectValidTimeOverlaps,
  detectValidTimeGaps,
  detectValidTimeOverlapsWithinVisibleSlices,
} from "@/lib/validation/intervals";
import {
  detectSnapshotDuplicates,
  detectMissingSnapshotCoverage,
  detectMonthlySnapshotGaps,
} from "./findings/snapshotFindings";
import type {
  DetectedColumns,
  HistoricalSemantics,
  HeaderMapping,
  TargetFinding,
  TargetValidationResult,
  SnapshotMeaning,
  IntervalEndSemantics,
  OpenEndedValue,
  CorrectionMode,
} from "@/lib/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";

export type TargetTableAnalysis = {
  result: TargetValidationResult;
  ruleFacts: RuleFacts;
};

export function validateTargetTable(
  rawInput: string,
  semanticsOverride: Partial<HistoricalSemantics> = {},
  columnOverrides: Partial<DetectedColumns> = {},
): TargetValidationResult {
  return analyzeTargetTable(rawInput, semanticsOverride, columnOverrides)
    .result;
}

export function analyzeTargetTable(
  rawInput: string,
  semanticsOverride: Partial<HistoricalSemantics> = {},
  columnOverrides: Partial<DetectedColumns> = {},
): TargetTableAnalysis {
  const ruleFacts: RuleFacts = {};
  const parsed = parseCSV(rawInput, { maxColumns: "all" });
  const rows = parsed.rows;
  const columns = parsed.headerMappings.map((m) => m.normalized);
  const headerMappings = parsed.headerMappings;

  const detectedColumns: DetectedColumns = {
    businessKey:
      detectColumnOriginal(headerMappings, [
        "business_key",
        "entity_id",
        "id",
        "contract_id",
        "policy_id",
        "police_id",
        "police_nummer",
        "vnr",
        "bk_contract",
        "bk_policy",
        "bk_police",
        "fk__police",
      ]) ?? null,

    validFrom:
      detectColumnOriginal(headerMappings, [
        "valid_from",
        "bk_valid_from",
        "effective_from",
        "effective_start",
        "start_date",
        "gueltig_ab",
      ]) ?? null,

    validTo:
      detectColumnOriginal(headerMappings, [
        "valid_to",
        "bk_valid_to",
        "effective_to",
        "effective_end",
        "end_date",
        "gueltig_bis",
      ]) ?? null,

    visibleFrom:
      detectColumnOriginal(headerMappings, [
        "visible_from",
        "bk_visible_from",
        "loaded_from",
        "system_from",
        "technical_from",
      ]) ?? null,

    visibleTo:
      detectColumnOriginal(headerMappings, [
        "visible_to",
        "bk_visible_to",
        "loaded_to",
        "system_to",
        "technical_to",
      ]) ?? null,

    snapshotDate:
      detectColumnOriginal(headerMappings, [
        "snapshot_date",
        "reference_date",
        "reporting_date",
        "as_of_date",
        "stichtag",
      ]) ?? null,
    dimensionColumns: detectDimensionColumns(columns ?? []),
  };

  const effectiveColumns: DetectedColumns = {
    ...detectedColumns,
    ...Object.fromEntries(
      Object.entries(columnOverrides).filter(([, v]) => v !== undefined),
    ),
  };

  const detectedSemantics = detectHistoricalSemantics(
    rows,
    columns,
    detectedColumns,
  );

  const semantics: HistoricalSemantics = {
    ...detectedSemantics,
    ...semanticsOverride,
    detectedSignals: detectedSemantics.detectedSignals ?? [],
  };

  const findings: TargetFinding[] = [];

  // =========================
  // BASIC VALIDATION
  // =========================

  if (rows.length === 0) {
    return {
      result: buildResult(
        rows,
        columns,
        headerMappings,
        detectedColumns,
        semantics,
        [
          {
            id: "no-rows",
            title: "No rows detected",
            severity: "high",
            evidence: ["Input could not be parsed."],
            recommendation: "Provide valid tabular data.",
          },
        ],
      ),
      ruleFacts,
    };
  }

  if (!effectiveColumns.businessKey) {
    findings.push({
      id: "missing-business-key",
      title: "No business key detected",
      severity: "high",
      evidence: ["No entity/business key found."],
      recommendation: "Provide a stable business key.",
    });
  }

  const hasEventSemantics =
    columns.includes("event_id") ||
    columns.includes("event_time") ||
    columns.includes("event_type");

  if (
    !hasEventSemantics &&
    (!effectiveColumns.validFrom || !effectiveColumns.validTo)
  ) {
    findings.push({
      id: "missing-valid-time",
      title: "No valid-time interval detected",
      severity: "medium",
      evidence: [
        effectiveColumns.validFrom
          ? `valid_from: ${effectiveColumns.validFrom}`
          : "missing valid_from",
        effectiveColumns.validTo
          ? `valid_to: ${effectiveColumns.validTo}`
          : "missing valid_to",
      ],
      recommendation: "Add valid_from / valid_to for historization.",
    });
  }

  // =========================
  // VALID TIME CORE
  // =========================

  if (
    effectiveColumns.businessKey &&
    effectiveColumns.validFrom &&
    effectiveColumns.validTo
  ) {
    findings.push(
      ...detectInvalidIntervals(
        rows,
        effectiveColumns.validFrom,
        effectiveColumns.validTo,
      ),
    );

    const duplicateIntervalResult = detectDuplicateIntervals(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.validFrom,
      effectiveColumns.validTo,
    );

    Object.assign(ruleFacts, duplicateIntervalResult.facts);

    findings.push(...duplicateIntervalResult.findings);

    const validTimeOverlapResult = detectValidTimeOverlaps(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.validFrom,
      effectiveColumns.validTo,
      semantics,
    );

    Object.assign(ruleFacts, validTimeOverlapResult.facts);

    findings.push(...validTimeOverlapResult.findings);

    const validTimeGapResult = detectValidTimeGaps(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.validFrom,
      effectiveColumns.validTo,
      semantics,
    );

    Object.assign(ruleFacts, validTimeGapResult.facts);

    findings.push(...validTimeGapResult.findings);

    // =========================
    // BITEMPORAL DETECTION
    // =========================

    const hasVisibleColumns =
      !!effectiveColumns.visibleFrom && !!effectiveColumns.visibleTo;

    const hasVisibleVariance =
      hasVisibleColumns &&
      (new Set(rows.map((row) => row[effectiveColumns.visibleFrom!])).size >
        1 ||
        new Set(rows.map((row) => row[effectiveColumns.visibleTo!])).size > 1);

    const useBitemporal =
      hasVisibleColumns &&
      effectiveColumns.businessKey &&
      effectiveColumns.validFrom &&
      effectiveColumns.validTo &&
      hasVisibleVariance;

    if (useBitemporal) {
      findings.push(
        ...detectValidTimeOverlapsWithinVisibleSlices(
          rows,
          effectiveColumns.businessKey,
          effectiveColumns.validFrom,
          effectiveColumns.validTo,
          effectiveColumns.visibleFrom!,
          effectiveColumns.visibleTo!,
          semantics,
        ),
      );
    }
  }

  // =========================
  // SNAPSHOT
  // =========================

  if (
    effectiveColumns.snapshotDate &&
    effectiveColumns.businessKey &&
    rows.length > 0
  ) {
    const snapshotDuplicateResult = detectSnapshotDuplicates(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.snapshotDate,
    );

    Object.assign(ruleFacts, snapshotDuplicateResult.facts);

    findings.push(...snapshotDuplicateResult.findings);

    const snapshotCoverageResult = detectMissingSnapshotCoverage(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.snapshotDate,
    );

    Object.assign(ruleFacts, snapshotCoverageResult.facts);

    findings.push(...snapshotCoverageResult.findings);

    const monthlySnapshotGapResult = detectMonthlySnapshotGaps(
      rows,
      effectiveColumns.businessKey,
      effectiveColumns.snapshotDate,
    );

    Object.assign(ruleFacts, monthlySnapshotGapResult.facts);

    findings.push(...monthlySnapshotGapResult.findings);
  }

  const snapshotReproducibilityRiskResult = detectSnapshotReproducibilityRisk(
    rows,
    effectiveColumns,
  );

  Object.assign(ruleFacts, snapshotReproducibilityRiskResult.facts);

  findings.push(...snapshotReproducibilityRiskResult.findings);

  // =========================
  // STATUS / MARKER RULES
  // =========================

  const coverageGapRiskResult = detectCoverageGapRisk(rows);
  Object.assign(ruleFacts, coverageGapRiskResult.facts);
  findings.push(...coverageGapRiskResult.findings);

  const stateReductionRiskResult = detectStateReductionRisk(rows);
  Object.assign(ruleFacts, stateReductionRiskResult.facts);
  findings.push(...stateReductionRiskResult.findings);

  const eventPrioritizationRiskResult = detectEventPrioritizationRisk(rows);
  Object.assign(ruleFacts, eventPrioritizationRiskResult.facts);
  findings.push(...eventPrioritizationRiskResult.findings);

  // =========================
  // DIMENSIONS
  // =========================

  if (effectiveColumns.dimensionColumns.length > 0) {
    findings.push(
      ...detectMissingDimensionValues(rows, effectiveColumns.dimensionColumns),
    );
  }

  return {
    result: buildResult(
      rows,
      columns,
      headerMappings,
      detectedColumns,
      semantics,
      findings,
    ),
    ruleFacts,
  };
}

export function detectHistoricalSemantics(
  rows: any[],
  columns: string[],
  detectedColumns: DetectedColumns,
): HistoricalSemantics {
  const signals: string[] = [];
  const explanations: string[] = [];

  // =========================
  // 1. SIGNAL DETECTION
  // =========================

  const validFromCol = detectedColumns.validFrom;
  const validToCol = detectedColumns.validTo;

  const hasBKStyle =
    validFromCol?.toLowerCase().startsWith("bk_") ||
    validToCol?.toLowerCase().startsWith("bk_");

  if (hasBKStyle) {
    signals.push("bk_columns_present");
    explanations.push("BK-style validity columns detected");
  }

  const hasExplicitInclusiveHints = rows.some((r) =>
    Object.values(r).some((v) => v?.toString().includes("23:59:59")),
  );

  if (hasExplicitInclusiveHints) {
    signals.push("end_of_day_values_found");
    explanations.push("Rows contain end-of-day timestamps → likely inclusive");
  }

  const emptySemantics = (): HistoricalSemantics => ({
    validIntervalEnd: "exclusive",
    visibleIntervalEnd: "exclusive",
    snapshotMeaning: "none",
    openEndedValue: "none",
    correctionMode: "valid_time",
    detectedSignals: [],
    confidence: {
      validIntervalEnd: 0,
      visibleIntervalEnd: 0,
      snapshotMeaning: 0,
      openEndedValue: 0,
      correctionMode: 0,
    },
    explanations: [],
  });

  if (!validFromCol || !validToCol) {
    return {
      ...emptySemantics(),
      detectedSignals: ["missing_valid_time_columns"],
      explanations: ["Valid-from or valid-to column is missing"],
    };
  }

  const hasCleanDateRanges = rows.every((r) => {
    const from = new Date(r[validFromCol]);
    const to = new Date(r[validToCol]);
    return from < to;
  });

  if (hasCleanDateRanges) {
    signals.push("strict_ordering_valid");
  }

  // =========================
  // 2. SCORING MODEL
  // =========================

  let inclusiveScore = 0.2;
  let exclusiveScore = 0.8;

  if (hasBKStyle) {
    exclusiveScore += 0.2;
  }

  if (hasExplicitInclusiveHints) {
    inclusiveScore += 0.4;
  }

  if (signals.includes("strict_ordering_valid")) {
    exclusiveScore += 0.1;
  }

  // normalize
  const sum = inclusiveScore + exclusiveScore;
  inclusiveScore /= sum;
  exclusiveScore /= sum;

  const validIntervalEnd =
    inclusiveScore > exclusiveScore ? "inclusive" : "exclusive";

  const validIntervalConfidence = Math.max(inclusiveScore, exclusiveScore);

  // =========================
  // 3. SNAPSHOT / OTHER DEFAULTS
  // =========================

  const snapshotMeaning: SnapshotMeaning = "period_end";
  const snapshotConfidence = 0.55;

  const visibleIntervalEnd: IntervalEndSemantics = "exclusive";
  const visibleConfidence = 0.6;

  const openEndedConfidence = 0.7;
  const correctionConfidence = 0.6;
  // =========================
  // 4. RETURN
  // =========================

  return {
    validIntervalEnd,
    visibleIntervalEnd,
    snapshotMeaning,
    openEndedValue: "9999-12-31",
    correctionMode: "valid_time",

    confidence: {
      validIntervalEnd: validIntervalConfidence,
      visibleIntervalEnd: visibleConfidence,
      snapshotMeaning: snapshotConfidence,
      openEndedValue: openEndedConfidence,
      correctionMode: correctionConfidence,
    },

    detectedSignals: signals,
    explanations,
  };
}

function isMissingValue(value: any) {
  return (
    value === undefined ||
    value === null ||
    String(value).trim() === "" ||
    String(value).toLowerCase() === "null" ||
    String(value).toLowerCase() === "none"
  );
}

function uniqueFindingsById(findings: TargetFinding[]) {
  return Array.from(new Map(findings.map((f) => [f.id, f])).values());
}

function detectDuplicateIntervals(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string,
): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = [row[keyColumn], row[validFromColumn], row[validToColumn]].join(
      "||",
    );

    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const duplicates = Array.from(counts.entries()).filter(
    ([, count]) => count > 1,
  );

  if (duplicates.length === 0) {
    return {
      findings: [],
      facts: {
        duplicateIntervalCount: 0,
        hasDuplicateIntervals: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "duplicate-valid-intervals",
        title: "Duplicate historical intervals detected",
        severity: "medium",
        evidence: [
          `${duplicates.length} duplicate business-key / valid-time interval combination${
            duplicates.length === 1 ? "" : "s"
          } found.`,
        ],
        recommendation:
          "Check whether duplicates should be removed, aggregated or differentiated by another grain column.",
      },
    ],
    facts: {
      duplicateIntervalCount: duplicates.length,
      hasDuplicateIntervals: true,
    },
  };
}

function detectSnapshotReproducibilityRisk(
  rows: any[],
  detectedColumns: DetectedColumns,
): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const methodColumns = [
    "reproducibility_method",
    "snapshot_method",
    "reporting_method",
    "generation_method",
  ];

  const existingMethodColumn = methodColumns.find((column) =>
    rows.some((row) => row[column] !== undefined),
  );

  if (!existingMethodColumn) {
    return {
      findings: [],
      facts: {
        hasCriticalReproducibilityRisk: false,
      },
    };
  }

  const riskyValues = new Set([
    "current_rebuild_only",
    "no_visible_time",
    "current_truth_only",
    "latest_state_rebuild",
    "overwrite_snapshot",
    "non_reproducible_rebuild",
  ]);

  const riskyRows = rows.filter((row) => {
    const value = String(row[existingMethodColumn] ?? "")
      .trim()
      .toLowerCase();

    return riskyValues.has(value);
  });

  if (riskyRows.length === 0) {
    return {
      findings: [],
      facts: {
        hasCriticalReproducibilityRisk: false,
      },
    };
  }

  const hasSnapshotDate = Boolean(detectedColumns.snapshotDate);
  const hasVisibleTime = Boolean(
    detectedColumns.visibleFrom && detectedColumns.visibleTo,
  );

  if (!hasSnapshotDate) {
    return {
      findings: [],
      facts: {
        hasCriticalReproducibilityRisk: false,
      },
    };
  }

  const evidence: string[] = [];

  if (!hasVisibleTime) {
    evidence.push(
      "The table has snapshot_date but no complete visible_from / visible_to interval.",
    );
  }

  const examplePeriods = riskyRows
    .slice(0, 3)
    .map(
      (row) =>
        row.snapshot_date ??
        row.reference_date ??
        row.reporting_date ??
        row.valid_from ??
        "unknown period",
    )
    .join(", ");

  evidence.push(
    `${riskyRows.length} row${
      riskyRows.length === 1 ? "" : "s"
    } use ${existingMethodColumn} with a non-reproducible rebuild method.`,
  );

  evidence.push(`Example affected periods: ${examplePeriods}.`);

  return {
    findings: [
      {
        id: "snapshot-reproducibility-risk",
        title: "Snapshot reproducibility risk detected",
        severity: "high",
        evidence,
        assumptions: [
          "snapshot_date indicates a published or reportable snapshot.",
          "Without visible-time or publication metadata, old reports may not be reproducible after corrections.",
        ],
        recommendation:
          "If published reports must be reproducible, include visible-time information or persist the exact snapshot state used at publication time. Otherwise, rebuilding old reports may silently use later corrections or future knowledge.",
      },
    ],
    facts: {
      hasCriticalReproducibilityRisk: true,
    },
  };
}

function detectCoverageGapRisk(rows: any[]): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const statusColumns = [
    "coverage_status",
    "historical_coverage_status",
    "gap_status",
  ];

  const existingStatusColumn = statusColumns.find((column) =>
    rows.some((row) => row[column] !== undefined),
  );

  if (!existingStatusColumn) {
    return {
      findings: [],
      facts: {},
    };
  }

  const riskyValues = new Set([
    "coverage_gap",
    "coverage_gap_unmarked",
    "missing_period",
    "silently_missing",
    "missing_snapshot",
    "gap_not_handled",
  ]);

  const riskyRows = rows.filter((row) => {
    const value = String(row[existingStatusColumn] ?? "")
      .trim()
      .toLowerCase();

    return riskyValues.has(value);
  });

  if (riskyRows.length === 0) {
    return {
      findings: [],
      facts: {},
    };
  }

  return {
    findings: [
      {
        id: "historical-coverage-gap-risk",
        title: "Historical coverage gap risk detected",
        severity: "high",
        evidence: [
          `${riskyRows.length} row${
            riskyRows.length === 1 ? "" : "s"
          } have ${existingStatusColumn} marked as missing or unhandled coverage.`,
        ],
        recommendation:
          "Explicitly handle missing historical coverage before publishing the model. Mark the gap, complete the history or use a controlled unknown member.",
      },
    ],
    facts: {
      hasCoverageProblem: true,
      coverageGapRiskCount: riskyRows.length,
    },
  };
}

export function detectEventPrioritizationRisk(rows: any[]): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const statusColumn = "prioritization_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) {
    return {
      findings: [],
      facts: {
        hasEventPrioritizationRisk: false,
      },
    };
  }

  const noisyRows = rows.filter((row) => {
    const value = String(row[statusColumn] ?? "")
      .trim()
      .toLowerCase();

    return [
      "operational_noise_kept",
      "technical_event_kept",
      "workflow_noise_kept",
      "duplicate_milestone",
      "raw_event_kept",
    ].includes(value);
  });

  if (noisyRows.length === 0) {
    return {
      findings: [],
      facts: {
        hasEventPrioritizationRisk: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "event-prioritization-risk",
        title: "Event prioritization noise detected",
        severity: "medium",
        evidence: [
          `${noisyRows.length} row${noisyRows.length === 1 ? "" : "s"} contain non-business or noise events.`,
        ],
        recommendation:
          "Filter or collapse technical events before building analytical models.",
      },
    ],
    facts: {
      eventPrioritizationRiskCount: noisyRows.length,
      hasEventPrioritizationRisk: true,
      hasTemporalAmbiguity: true,
    },
  };
}

function detectStateReductionRisk(rows: any[]): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const statusColumn = "reduction_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) {
    return {
      findings: [],
      facts: {
        hasStateReductionRisk: false,
      },
    };
  }

  const riskyRows = rows.filter((row) => {
    const value = String(row[statusColumn] ?? "")
      .trim()
      .toLowerCase();

    return [
      "redundant_state",
      "technical_state",
      "not_reduced",
      "noise_kept",
      "over_fragmented",
    ].includes(value);
  });

  if (riskyRows.length === 0) {
    return {
      findings: [],
      facts: {
        hasStateReductionRisk: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "state-reduction-risk",
        title: "State reduction risk detected",
        severity: "medium",
        evidence: [
          `${riskyRows.length} row${
            riskyRows.length === 1 ? "" : "s"
          } keep redundant or unreduced state versions.`,
        ],
        recommendation:
          "Review whether these operational state changes should be collapsed before publishing the reporting model.",
      },
    ],
    facts: {
      stateReductionRiskCount: riskyRows.length,
      hasStateReductionRisk: true,
      hasTemporalAmbiguity: true,
    },
  };
}

function detectDimensionColumns(columns: string[]) {
  const excluded = new Set([
    "business_key",
    "entity_id",
    "id",
    "contract_id",
    "policy_id",
    "police_id",
    "police_nummer",
    "vnr",
    "bk_contract",
    "bk_policy",
    "bk_police",
    "fk__police",
    "valid_from",
    "bk_valid_from",
    "effective_from",
    "effective_start",
    "start_date",
    "gueltig_ab",
    "valid_to",
    "bk_valid_to",
    "effective_to",
    "effective_end",
    "end_date",
    "gueltig_bis",
    "visible_from",
    "bk_visible_from",
    "loaded_from",
    "system_from",
    "technical_from",
    "visible_to",
    "bk_visible_to",
    "loaded_to",
    "system_to",
    "technical_to",
    "snapshot_date",
    "reference_date",
    "reporting_date",
    "bk_reference_date",
    "month_end",
    "as_of_date",
    "stichtag",
    "completion_method",
    "alignment_method",
    "join_method",
    "modeling_method",
    "generation_method",
    "reproducibility_method",
    "snapshot_method",
    "reporting_method",
    "conformance_status",
    "conformity_status",
    "historical_conformance_status",
    "mapping_status",
    "alignment_status",
    "event_alignment_status",
    "match_status",
    "state_match_status",
    "event_alignment_method",
    "prioritization_status",
    "reporting_milestone",
    "priority_rank",
    "event_id",
    "event_time",
    "event_type",
  ]);

  return columns.filter((column) => {
    if (excluded.has(column)) return false;

    return (
      column.endsWith("_key") ||
      column.endsWith("_code") ||
      column.endsWith("_number") ||
      column.startsWith("customer") ||
      column.startsWith("broker") ||
      column.startsWith("product") ||
      column.startsWith("agent") ||
      column.startsWith("sales") ||
      column.startsWith("territory") ||
      column.startsWith("risk") ||
      column.startsWith("coverage")
    );
  });
}

function detectMissingDimensionValues(
  rows: any[],
  dimensionColumns: string[],
): TargetFinding[] {
  const findings: TargetFinding[] = [];

  dimensionColumns.forEach((column) => {
    const missingRows = rows.filter((row) => isMissingValue(row[column]));

    if (missingRows.length === 0) return;

    const examplePeriods = missingRows
      .slice(0, 3)
      .map(
        (row) =>
          row.snapshot_date ??
          row.reference_date ??
          row.reporting_date ??
          row.valid_from ??
          "unknown period",
      )
      .join(", ");

    findings.push({
      id: `missing-dimension-values-${column}`,
      title: `Missing dimension values detected in ${column}`,
      severity: "high",
      evidence: [
        `${missingRows.length} row${
          missingRows.length === 1 ? "" : "s"
        } have no value for ${column}.`,
        `Example affected periods: ${examplePeriods}.`,
      ],
      recommendation:
        "Check whether these missing dimension values are expected. If the fact exists but the dimension is missing, apply Dimension Completion, an Unknown Member or document the expected sparsity.",
    });
  });

  return findings;
}

function detectColumnOriginal(headers: HeaderMapping[], candidates: string[]) {
  const match = headers.find((h) => candidates.includes(h.normalized));

  return match?.normalized ?? null;
}

function buildResult(
  rows: any[],
  columns: string[],
  headerMappings: HeaderMapping[],
  detectedColumns: DetectedColumns,
  semantics: HistoricalSemantics,
  findings: TargetFinding[],
): TargetValidationResult {
  const uniqueFindings = uniqueFindingsById(findings);

  const highCount = uniqueFindings.filter(
    (finding) => finding.severity === "high",
  ).length;

  const mediumCount = uniqueFindings.filter(
    (finding) => finding.severity === "medium",
  ).length;

  const qualitySummary =
    highCount > 0
      ? {
          label: "Historical modeling risks detected",
          description:
            "Review these issues before treating the generated historical table as production-ready.",
          severity: "danger" as const,
        }
      : mediumCount > 0
        ? {
            label: "Historical assumptions should be reviewed",
            description:
              "The table is parseable, but some modeling assumptions may affect reporting correctness.",
            severity: "warning" as const,
          }
        : {
            label: "Historical table structure looks consistent",
            description:
              "The pasted sample has a stable grain and consistent historical structure based on the available checks.",
            severity: "success" as const,
          };

  return {
    rowCount: rows.length,
    rows,
    columns,
    headerMappings,
    detectedColumns,
    semantics,
    findings: uniqueFindings,
    qualitySummary: {
      counts: {
        high: highCount,
        medium: uniqueFindings.filter((f) => f.severity === "medium").length,
        low: uniqueFindings.filter((f) => f.severity === "low").length,
      },
      label:
        highCount > 0
          ? "Critical issues detected"
          : uniqueFindings.length > 0
            ? "Warnings detected"
            : "All good",

      description:
        highCount > 0
          ? "High severity issues require immediate attention."
          : "No critical issues found in validation.",

      severity:
        highCount > 0
          ? "danger"
          : uniqueFindings.length > 0
            ? "warning"
            : "success",
    },
  };
}
