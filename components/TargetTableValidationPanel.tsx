"use client";

import { track } from "@/lib/analytics";
import { useEffect, useMemo, useState } from "react";
import { parseCSV } from "@/lib/parser";

type TargetFinding = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendation: string;
};

type DetectedColumns = {
  businessKey: string | null;
  validFrom: string | null;
  validTo: string | null;
  visibleFrom: string | null;
  visibleTo: string | null;
  snapshotDate: string | null;
  dimensionColumns: string[];
};

type TargetValidationResult = {
  rowCount: number;
  columns: string[];
  detectedColumns: DetectedColumns;
  findings: TargetFinding[];
  qualitySummary: {
    label: string;
    description: string;
    severity: "success" | "warning" | "danger";
  };
};

export function TargetTableValidationPanel() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return validateTargetTable(input);
  }, [input]);

  useEffect(() => {
    if (!result) return;
  
    track("target_validation_completed", {
      rowCount: result.rowCount,
      columnCount: result.columns.length,
      findingCount: result.findings.length,
      highRiskCount: result.findings.filter((f) => f.severity === "high").length,
      mediumRiskCount: result.findings.filter((f) => f.severity === "medium").length,
      hasBusinessKey: Boolean(result.detectedColumns.businessKey),
      hasValidTime: Boolean(
        result.detectedColumns.validFrom && result.detectedColumns.validTo
      ),
      hasVisibleTime: Boolean(
        result.detectedColumns.visibleFrom && result.detectedColumns.visibleTo
      ),
      hasSnapshotDate: Boolean(result.detectedColumns.snapshotDate),
    });
  }, [result]);

  return (
    <section
      id="target-table-validation"
      style={{
        scrollMarginTop: 10,
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
        Target Table Validation
      </div>

      <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
        Validate the generated historical table
      </h2>

      <p style={{ color: "#475569", marginTop: 0, marginBottom: 18 }}>
        Paste the output table produced by your notebook or pipeline. This checks
        whether the generated historical table has a stable grain, valid-time
        consistency and snapshot coverage.
      </p>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste target table data here, for example from Databricks display(), SQL result grid, CSV or TSV..."
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        style={{
          width: "100%",
          minHeight: 190,
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

      {!result && (
        <InfoBox>
          The validation result will appear after you paste target table rows.
        </InfoBox>
      )}

      {result && (
        <>
          <SummaryCard result={result} />

          <div style={{ marginTop: 18 }}>
            <SectionTitle>Detected historical structure</SectionTitle>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
              }}
            >
              <ColumnCard
                label="Business key"
                value={result.detectedColumns.businessKey}
                required
              />
              <ColumnCard
                label="Valid from"
                value={result.detectedColumns.validFrom}
                required
              />
              <ColumnCard
                label="Valid to"
                value={result.detectedColumns.validTo}
                required
              />
              <ColumnCard
                label="Visible from"
                value={result.detectedColumns.visibleFrom}
              />
              <ColumnCard
                label="Visible to"
                value={result.detectedColumns.visibleTo}
              />
              <ColumnCard
                label="Snapshot date"
                value={result.detectedColumns.snapshotDate}
              />
              <ColumnCard
                label="Dimension columns"
                value={
                  result.detectedColumns.dimensionColumns.length > 0
                    ? result.detectedColumns.dimensionColumns.join(", ")
                    : null
                }
              />
            </div>
          </div>

          {result.findings.length > 0 ? (
            <div style={{ marginTop: 18 }}>
              <SectionTitle>Validation findings</SectionTitle>

              <div style={{ display: "grid", gap: 12 }}>
                {sortFindings(result.findings).map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 12,
                background: "#ecfdf5",
                border: "1px solid #86efac",
                color: "#166534",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              ✓ No major grain, interval or snapshot issues detected in the
              pasted target table sample.
            </div>
          )}

          <details style={{ marginTop: 16 }}>
            <summary
              style={{
                cursor: "pointer",
                color: "#334155",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Show parsed columns
            </summary>

            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontSize: 12,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {result.columns.join(", ")}
            </div>
          </details>
        </>
      )}
    </section>
  );
}

function validateTargetTable(rawInput: string): TargetValidationResult {
  const parsed = parseCSV(rawInput, { maxColumns: "all" });
  const rows = parsed.rows;
  const columns = parsed.headerMappings.map((mapping) => mapping.normalized);

  const detectedColumns: DetectedColumns = {
    businessKey: detectColumn(columns, [
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
    ]),
    validFrom: detectColumn(columns, [
      "valid_from",
      "bk_valid_from",
      "effective_from",
      "effective_start",
      "start_date",
      "gueltig_ab",
    ]),
    validTo: detectColumn(columns, [
      "valid_to",
      "bk_valid_to",
      "effective_to",
      "effective_end",
      "end_date",
      "gueltig_bis",
    ]),
    visibleFrom: detectColumn(columns, [
      "visible_from",
      "bk_visible_from",
      "loaded_from",
      "system_from",
      "technical_from",
    ]),
    visibleTo: detectColumn(columns, [
      "visible_to",
      "bk_visible_to",
      "loaded_to",
      "system_to",
      "technical_to",
    ]),
    snapshotDate: detectColumn(columns, [
      "snapshot_date",
      "reference_date",
      "reporting_date",
      "bk_reference_date",
      "month_end",
      "as_of_date",
      "stichtag",
    ]),
    dimensionColumns: detectDimensionColumns(columns),
  };

const sourceSystemColumn = detectColumn(columns, [
  "source_system",
  "source",
  "system",
  "source_name",
  "system_name",
]);

  const effectiveBusinessKey =
    detectedColumns.businessKey && sourceSystemColumn
      ? "__validation_business_key"
      : detectedColumns.businessKey;

  const effectiveRows =
    detectedColumns.businessKey && sourceSystemColumn
      ? rows.map((row) => ({
          ...row,
          __validation_business_key: [
            row[detectedColumns.businessKey!],
            row[sourceSystemColumn],
          ].join("||"),
        }))
      : rows;

  const findings: TargetFinding[] = [];

  if (rows.length === 0) {
    findings.push({
      id: "no-rows",
      title: "No rows detected",
      severity: "high",
      evidence: ["The pasted input could not be parsed into data rows."],
      recommendation:
        "Paste a tabular result including a header row and at least one data row.",
    });

    return buildResult(rows, columns, detectedColumns, findings);
  }

  if (!detectedColumns.businessKey) {
    findings.push({
      id: "missing-business-key",
      title: "No business key column detected",
      severity: "high",
      evidence: [
        "No entity_id, business_key, policy_id, contract_id or similar key column was detected.",
      ],
      recommendation:
        "Include or map the business key that defines the grain of the target table.",
    });
  }

  if (!detectedColumns.validFrom || !detectedColumns.validTo) {
    findings.push({
      id: "missing-valid-time",
      title: "No complete valid-time interval detected",
      severity: "medium",
      evidence: [
        detectedColumns.validFrom
          ? `Detected valid-from column: ${detectedColumns.validFrom}`
          : "No valid-from column detected.",
        detectedColumns.validTo
          ? `Detected valid-to column: ${detectedColumns.validTo}`
          : "No valid-to column detected.",
      ],
      recommendation:
        "For historized target tables, include valid_from and valid_to or equivalent business-valid interval columns.",
    });
  }

  if (
    effectiveBusinessKey &&
    detectedColumns.validFrom &&
    detectedColumns.validTo
  ) {
  if (!(detectedColumns.visibleFrom && detectedColumns.visibleTo)) {
    findings.push(
      ...detectDuplicateIntervals(
        effectiveRows,
        effectiveBusinessKey,
        detectedColumns.validFrom,
        detectedColumns.validTo
      )
    );
  }

    findings.push(
      ...detectInvalidIntervals(
        rows,
        detectedColumns.validFrom,
        detectedColumns.validTo
      )
    );

    if (!(detectedColumns.visibleFrom && detectedColumns.visibleTo)) {
      findings.push(
        ...detectValidTimeOverlaps(
          effectiveRows,
          effectiveBusinessKey,
          detectedColumns.validFrom,
          detectedColumns.validTo
        )
      );
    }

    if (!detectedColumns.snapshotDate) {
      findings.push(
        ...detectValidTimeGaps(
          effectiveRows,
          effectiveBusinessKey,
          detectedColumns.validFrom,
          detectedColumns.validTo
        )
      );
    }
  }

  if (detectedColumns.snapshotDate && effectiveBusinessKey) {
    if (!(detectedColumns.visibleFrom && detectedColumns.visibleTo)) {
      findings.push(
        ...detectSnapshotDuplicates(
          effectiveRows,
          effectiveBusinessKey,
          detectedColumns.snapshotDate
        )
      );
    }

    findings.push(
      ...detectMissingSnapshotCoverage(
        effectiveRows,
        effectiveBusinessKey,
        detectedColumns.snapshotDate
      )
    );
  }

  if (detectedColumns.dimensionColumns.length > 0) {
    findings.push(
      ...detectMissingDimensionValues(rows, detectedColumns.dimensionColumns)
    );
  }

  findings.push(...detectRiskyAlignmentMethods(rows));
  findings.push(...detectSnapshotReproducibilityRisk(rows, detectedColumns));
  findings.push(...detectHistoricalConformanceRisk(rows));
  findings.push(...detectStateEventAlignmentRisk(rows));

  function detectHistoricalConformanceRisk(rows: any[]): TargetFinding[] {
    const statusColumns = [
      "conformance_status",
      "conformity_status",
      "historical_conformance_status",
      "mapping_status",
    ];

    const existingStatusColumn = statusColumns.find((column) =>
      rows.some((row) => row[column] !== undefined)
    );

    if (!existingStatusColumn) return [];

    const riskyValues = new Set([
      "unconformed",
      "conflict",
      "conflicting_history",
      "source_conflict",
      "inconsistent",
      "unresolved",
    ]);

    const riskyRows = rows.filter((row) => {
      const value = String(row[existingStatusColumn] ?? "")
        .trim()
        .toLowerCase();

      return riskyValues.has(value);
    });

    if (riskyRows.length === 0) return [];

    const examplePeriods = riskyRows
      .slice(0, 3)
      .map(
        (row) =>
          row.snapshot_date ??
          row.reference_date ??
          row.reporting_date ??
          row.valid_from ??
          "unknown period"
      )
      .join(", ");

    return [
      {
        id: "historical-conformance-risk",
        title: "Historical conformance risk detected",
        severity: "high",
        evidence: [
          `${riskyRows.length} row${
            riskyRows.length === 1 ? "" : "s"
          } have ${existingStatusColumn} marked as unresolved or unconformed.`,
          `Example affected periods: ${examplePeriods}.`,
        ],
        recommendation:
          "Resolve cross-system historical conflicts before publishing the reporting model. Define which source owns each attribute, whether values should be conformed, and how conflicting history should be represented.",
      },
    ];
  }

  function detectStateEventAlignmentRisk(rows: any[]): TargetFinding[] {
    const methodColumns = [
      "alignment_method",
      "event_alignment_method",
      "join_method",
      "modeling_method",
      "generation_method",
    ];

    const statusColumns = [
      "alignment_status",
      "event_alignment_status",
      "match_status",
      "state_match_status",
    ];

    const existingMethodColumn = methodColumns.find((column) =>
      rows.some((row) => row[column] !== undefined)
    );

    const existingStatusColumn = statusColumns.find((column) =>
      rows.some((row) => row[column] !== undefined)
    );

    const riskyMethodValues = new Set([
      "current_state_join",
      "latest_state_join",
      "no_event_time_alignment",
      "event_join_without_valid_time",
      "wrong_state_interval",
    ]);

    const riskyStatusValues = new Set([
      "no_matching_state",
      "multiple_matching_states",
      "wrong_state",
      "outside_state_interval",
      "ambiguous_state_match",
    ]);

    const riskyMethodRows = existingMethodColumn
      ? rows.filter((row) => {
          const value = String(row[existingMethodColumn] ?? "")
            .trim()
            .toLowerCase();

          return riskyMethodValues.has(value);
        })
      : [];

    const riskyStatusRows = existingStatusColumn
      ? rows.filter((row) => {
          const value = String(row[existingStatusColumn] ?? "")
            .trim()
            .toLowerCase();

          return riskyStatusValues.has(value);
        })
      : [];

    if (riskyMethodRows.length === 0 && riskyStatusRows.length === 0) return [];

    const affectedRows = [...riskyMethodRows, ...riskyStatusRows];

    const exampleEvents = affectedRows
      .slice(0, 3)
      .map(
        (row) =>
          row.event_id ??
          row.claim_id ??
          row.transaction_id ??
          row.event_date ??
          row.event_timestamp ??
          "unknown event"
      )
      .join(", ");

    const evidence = [];

    if (riskyMethodRows.length > 0 && existingMethodColumn) {
      evidence.push(
        `${riskyMethodRows.length} row${
          riskyMethodRows.length === 1 ? "" : "s"
        } use ${existingMethodColumn} with a risky state-event alignment method.`
      );
    }

    if (riskyStatusRows.length > 0 && existingStatusColumn) {
      evidence.push(
        `${riskyStatusRows.length} row${
          riskyStatusRows.length === 1 ? "" : "s"
        } have ${existingStatusColumn} marked as no match, ambiguous match or wrong state.`
      );
    }

    evidence.push(`Example affected events: ${exampleEvents}.`);

    return [
      {
        id: "state-event-alignment-risk",
        title: "State-event alignment risk detected",
        severity: "high",
        evidence,
        recommendation:
          "Align each event timestamp to the state interval that was valid when the event occurred. Avoid current-state joins and validate that each event resolves to exactly one intended historical state.",
      },
    ];
  }

  if (
    (detectedColumns.visibleFrom && !detectedColumns.visibleTo) ||
    (!detectedColumns.visibleFrom && detectedColumns.visibleTo)
  ) {
    findings.push({
      id: "incomplete-visible-time",
      title: "Incomplete visible-time interval detected",
      severity: "medium",
      evidence: [
        detectedColumns.visibleFrom
          ? `Detected visible-from column: ${detectedColumns.visibleFrom}`
          : "No visible-from column detected.",
        detectedColumns.visibleTo
          ? `Detected visible-to column: ${detectedColumns.visibleTo}`
          : "No visible-to column detected.",
      ],
      recommendation:
        "If the target table is bitemporal, include both visible_from and visible_to columns.",
    });
  }

  if (
    detectedColumns.visibleFrom &&
    detectedColumns.visibleTo &&
    detectedColumns.validFrom &&
    detectedColumns.validTo
  ) {
    findings.push(
      ...detectInvalidVisibleIntervals(
        rows,
        detectedColumns.visibleFrom,
        detectedColumns.visibleTo
      )
    );
  }

  return buildResult(rows, columns, detectedColumns, findings);
}

function buildResult(
  rows: any[],
  columns: string[],
  detectedColumns: DetectedColumns,
  findings: TargetFinding[]
): TargetValidationResult {
  const uniqueFindings = uniqueFindingsById(findings);

  const highCount = uniqueFindings.filter(
    (finding) => finding.severity === "high"
  ).length;

  const mediumCount = uniqueFindings.filter(
    (finding) => finding.severity === "medium"
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
    columns,
    detectedColumns,
    findings: uniqueFindings,
    qualitySummary,
  };
}

function detectDuplicateIntervals(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string
): TargetFinding[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = [
      row[keyColumn],
      row[validFromColumn],
      row[validToColumn],
    ].join("||");

    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const duplicates = Array.from(counts.entries()).filter(([, count]) => count > 1);

  if (duplicates.length === 0) return [];

  return [
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
  ];
}

function detectSnapshotDuplicates(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string
): TargetFinding[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = [row[keyColumn], row[snapshotColumn]].join("||");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const duplicates = Array.from(counts.entries()).filter(([, count]) => count > 1);

  if (duplicates.length === 0) return [];

  return [
    {
      id: "duplicate-snapshot-grain",
      title: "Duplicate snapshot grain detected",
      severity: "high",
      evidence: [
        `${duplicates.length} duplicate business-key / snapshot-date combination${
          duplicates.length === 1 ? "" : "s"
        } found.`,
      ],
      recommendation:
        "A snapshot fact table should usually have one row per business key and snapshot date unless another grain is explicitly defined.",
    },
  ];
}

function detectMissingSnapshotCoverage(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string
): TargetFinding[] {
  const snapshots = new Set(rows.map((row) => String(row[snapshotColumn] ?? "")));
  const byKey = groupRowsByKey(rows, keyColumn);
  let missingCoverageCount = 0;

  byKey.forEach((keyRows) => {
    const keySnapshots = new Set(
      keyRows.map((row) => String(row[snapshotColumn] ?? ""))
    );

    snapshots.forEach((snapshot) => {
      if (!keySnapshots.has(snapshot)) missingCoverageCount += 1;
    });
  });

  if (snapshots.size <= 1 || missingCoverageCount === 0) return [];

  return [
    {
      id: "missing-snapshot-coverage",
      title: "Potential missing snapshot coverage detected",
      severity: "medium",
      evidence: [
        `${missingCoverageCount} business-key / snapshot-date combination${
          missingCoverageCount === 1 ? "" : "s"
        } missing from the pasted sample.`,
      ],
      recommendation:
        "Check whether every required business key should appear in every reporting snapshot. If not, document the expected sparsity.",
    },
  ];
}

function detectRiskyAlignmentMethods(rows: any[]): TargetFinding[] {
  const methodColumns = [
    "alignment_method",
    "join_method",
    "modeling_method",
    "generation_method",
  ];

  const existingMethodColumn = methodColumns.find((column) =>
    rows.some((row) => row[column] !== undefined)
  );

  if (!existingMethodColumn) return [];

  const riskyValues = new Set([
    "overlap_join_only",
    "simple_overlap_join",
    "current_value_join",
    "no_interval_split",
    "unsplit_join",
    "latest_value_join",
  ]);

  const riskyRows = rows.filter((row) => {
    const value = String(row[existingMethodColumn] ?? "")
      .trim()
      .toLowerCase();

    return riskyValues.has(value);
  });

  if (riskyRows.length === 0) return [];

  const examplePeriods = riskyRows
    .slice(0, 3)
    .map(
      (row) =>
        row.snapshot_date ??
        row.reference_date ??
        row.reporting_date ??
        row.valid_from ??
        "unknown period"
    )
    .join(", ");

  return [
    {
      id: "risky-state-state-alignment-method",
      title: "Potential state-state alignment risk detected",
      severity: "high",
      evidence: [
        `${riskyRows.length} row${
          riskyRows.length === 1 ? "" : "s"
        } use ${existingMethodColumn} = overlap_join_only or a similar risky method.`,
        `Example affected periods: ${examplePeriods}.`,
      ],
      recommendation:
        "For State ↔ State Alignment, validate that the joined table is split at every relevant state boundary. An overlap join alone can produce coarse intervals and incorrect attribution when either side changes independently.",
    },
  ];
}

function detectSnapshotReproducibilityRisk(
  rows: any[],
  detectedColumns: DetectedColumns
): TargetFinding[] {
  const methodColumns = [
    "reproducibility_method",
    "snapshot_method",
    "reporting_method",
    "generation_method",
  ];

  const existingMethodColumn = methodColumns.find((column) =>
    rows.some((row) => row[column] !== undefined)
  );

  if (!existingMethodColumn) return [];

  const riskyValues = new Set([
    "current_rebuild_only",
    "no_visible_time",
    "current_truth_only",
    "latest_state_rebuild",
    "overwrite_snapshot",
    "non_reproducible_rebuild",
  ]);

  const riskyRows = existingMethodColumn
    ? rows.filter((row) => {
        const value = String(row[existingMethodColumn] ?? "")
          .trim()
          .toLowerCase();

        return riskyValues.has(value);
      })
    : [];

  const hasSnapshotDate = Boolean(detectedColumns.snapshotDate);
  const hasVisibleTime = Boolean(
    detectedColumns.visibleFrom && detectedColumns.visibleTo
  );

  if (riskyRows.length === 0 && (!hasSnapshotDate || hasVisibleTime)) {
    return [];
  }

  if (!hasSnapshotDate) {
    return [];
  }

  const evidence = [];

  if (!hasVisibleTime) {
    evidence.push(
      "The table has snapshot_date but no complete visible_from / visible_to interval."
    );
  }

  if (existingMethodColumn && riskyRows.length > 0) {
    const examplePeriods = riskyRows
      .slice(0, 3)
      .map(
        (row) =>
          row.snapshot_date ??
          row.reference_date ??
          row.reporting_date ??
          row.valid_from ??
          "unknown period"
      )
      .join(", ");

    evidence.push(
      `${riskyRows.length} row${
        riskyRows.length === 1 ? "" : "s"
      } use ${existingMethodColumn} with a non-reproducible rebuild method.`
    );

    evidence.push(`Example affected periods: ${examplePeriods}.`);
  }

  return [
    {
      id: "snapshot-reproducibility-risk",
      title: "Snapshot reproducibility risk detected",
      severity: "high",
      evidence,
      recommendation:
        "If published reports must be reproducible, include visible-time information or persist the exact snapshot state used at publication time. Otherwise, rebuilding old reports may silently use later corrections or future knowledge.",
    },
  ];
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
  dimensionColumns: string[]
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
          "unknown period"
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

function isMissingValue(value: unknown) {
  if (value === null || value === undefined) return true;

  const text = String(value).trim().toLowerCase();

  return (
    text === "" ||
    text === "null" ||
    text === "none" ||
    text === "undefined" ||
    text === "n/a" ||
    text === "na" ||
    text === "-"
  );
}

function detectInvalidIntervals(
  rows: any[],
  validFromColumn: string,
  validToColumn: string
): TargetFinding[] {
  const invalidCount = rows.filter((row) => {
    const from = parseDate(row[validFromColumn]);
    const to = parseDate(row[validToColumn]);
    return from && to && from.getTime() > to.getTime();
  }).length;

  if (invalidCount === 0) return [];

  return [
    {
      id: "invalid-valid-time-intervals",
      title: "Invalid valid-time intervals detected",
      severity: "high",
      evidence: [
        `${invalidCount} row${invalidCount === 1 ? "" : "s"} have valid_from after valid_to.`,
      ],
      recommendation:
        "Fix interval boundaries before using the table for joins, snapshots or point-in-time reporting.",
    },
  ];
}

function detectInvalidVisibleIntervals(
  rows: any[],
  visibleFromColumn: string,
  visibleToColumn: string
): TargetFinding[] {
  const invalidCount = rows.filter((row) => {
    const from = parseDate(row[visibleFromColumn]);
    const to = parseDate(row[visibleToColumn]);
    return from && to && from.getTime() > to.getTime();
  }).length;

  if (invalidCount === 0) return [];

  return [
    {
      id: "invalid-visible-time-intervals",
      title: "Invalid visible-time intervals detected",
      severity: "high",
      evidence: [
        `${invalidCount} row${invalidCount === 1 ? "" : "s"} have visible_from after visible_to.`,
      ],
      recommendation:
        "Fix visible-time boundaries before relying on auditability or reproducible snapshot behavior.",
    },
  ];
}

function detectValidTimeOverlaps(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let overlapCount = 0;

  byKey.forEach((keyRows) => {
    const sorted = keyRows
      .map((row) => ({
        from: parseDate(row[validFromColumn]),
        to: parseDate(row[validToColumn]),
      }))
      .filter((interval) => interval.from !== null && interval.to !== null)
      .sort((a, b) => a.from!.getTime() - b.from!.getTime());

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].from!.getTime() < sorted[i - 1].to!.getTime()) {
        overlapCount += 1;
      }
    }
  });

  if (overlapCount === 0) return [];

  return [
    {
      id: "valid-time-overlaps",
      title: "Valid-time overlaps detected",
      severity: "high",
      evidence: [
        `${overlapCount} overlapping interval pair${
          overlapCount === 1 ? "" : "s"
        } found.`,
      ],
      recommendation:
        "Review whether overlapping intervals are expected. If not, apply winner selection, interval splitting or source correction logic.",
    },
  ];
}

function detectValidTimeGaps(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let gapCount = 0;

  byKey.forEach((keyRows) => {
    const sorted = keyRows
      .map((row) => ({
        from: parseDate(row[validFromColumn]),
        to: parseDate(row[validToColumn]),
      }))
      .filter((interval) => interval.from !== null && interval.to !== null)
      .sort((a, b) => a.from!.getTime() - b.from!.getTime());

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].from!.getTime() > sorted[i - 1].to!.getTime()) {
        gapCount += 1;
      }
    }
  });

  if (gapCount === 0) return [];

  return [
    {
      id: "valid-time-gaps",
      title: "Valid-time gaps detected",
      severity: "medium",
      evidence: [
        `${gapCount} gap${gapCount === 1 ? "" : "s"} between intervals found.`,
      ],
      recommendation:
        "Check whether gaps are expected. For continuous state histories, gaps may indicate missing source records or incomplete dimension coverage.",
    },
  ];
}

function groupRowsByKey(rows: any[], keyColumn: string) {
  const groups = new Map<string, any[]>();

  rows.forEach((row) => {
    const key = String(row[keyColumn] ?? "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  return groups;
}

function detectColumn(columns: string[], candidates: string[]) {
  const exact = candidates.find((candidate) => columns.includes(candidate));
  if (exact) return exact;

  return (
    columns.find((column) =>
      candidates.some((candidate) => column.includes(candidate))
    ) ?? null
  );
}

function parseDate(value: unknown) {
  if (!value) return null;

  const text = String(value).trim();

  if (!text || text.toLowerCase() === "null") return null;
  if (text.startsWith("9999-12-31")) return new Date("9999-12-31T00:00:00");

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function uniqueFindingsById(findings: TargetFinding[]) {
  return Array.from(
    new Map(findings.map((finding) => [finding.id, finding])).values()
  );
}

function sortFindings(findings: TargetFinding[]) {
  const severityRank = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...findings].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity]
  );
}

function SummaryCard({ result }: { result: TargetValidationResult }) {
  const accent =
    result.qualitySummary.severity === "danger"
      ? {
          background: "#fff7ed",
          border: "#fed7aa",
          color: "#9a3412",
        }
      : result.qualitySummary.severity === "warning"
      ? {
          background: "#fffbeb",
          border: "#fde68a",
          color: "#92400e",
        }
      : {
          background: "#ecfdf5",
          border: "#86efac",
          color: "#166534",
        };

  return (
    <div
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 14,
        background: accent.background,
        border: `1px solid ${accent.border}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0.7,
          color: accent.color,
          marginBottom: 6,
        }}
      >
        Target Validation Summary
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>
        {result.qualitySummary.label}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#475569",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {result.qualitySummary.description}
      </div>

      <div style={{ marginTop: 10, color: "#475569", fontSize: 13 }}>
        {result.rowCount} rows · {result.columns.length} columns ·{" "}
        {result.findings.length} finding
        {result.findings.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  );
}

function ColumnCard({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string | null;
  required?: boolean;
}) {
  const missingRequired = required && !value;

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: value ? "#ecfdf5" : missingRequired ? "#fff7ed" : "#f8fafc",
        border: value
          ? "1px solid #86efac"
          : missingRequired
          ? "1px solid #fed7aa"
          : "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          color: value ? "#166534" : missingRequired ? "#9a3412" : "#64748b",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: value ? "#0f172a" : "#94a3b8",
          wordBreak: "break-word",
        }}
      >
        {value ?? (required ? "Required but not detected" : "Not detected")}
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: TargetFinding }) {
  const accent =
    finding.severity === "high"
      ? {
          color: "#b91c1c",
          background: "#fef2f2",
          border: "#fecaca",
        }
      : finding.severity === "medium"
      ? {
          color: "#92400e",
          background: "#fffbeb",
          border: "#fde68a",
        }
      : {
          color: "#475569",
          background: "#f8fafc",
          border: "#e2e8f0",
        };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: accent.background,
        border: `1px solid ${accent.border}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: accent.color,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {finding.severity} issue
      </div>

      <div style={{ fontWeight: 900, marginBottom: 6 }}>{finding.title}</div>

      <div
        style={{
          color: "#475569",
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        {finding.evidence.map((item) => (
          <div key={item}>• {item}</div>
        ))}
      </div>

      <div style={{ color: "#0f172a", fontSize: 14, lineHeight: 1.5 }}>
        <strong>Recommendation:</strong> {finding.recommendation}
      </div>
    </div>
  );
}