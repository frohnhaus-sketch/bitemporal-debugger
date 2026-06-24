"use client";

import { track } from "@/lib/analytics";
import { useEffect, useMemo, useState, useRef } from "react";
import { parseCSV } from "@/lib/parser";

type TargetFinding = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendation: string;
  assumptions?: string[];
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

type IntervalEndSemantics = "exclusive" | "inclusive";
type SnapshotMeaning =
  | "period_end"
  | "period_start"
  | "reporting_timestamp"
  | "none";
type OpenEndedValue = "9999-12-31" | "null" | "custom" | "none";
type CorrectionMode = "valid_time" | "bitemporal" | "published_snapshot";

type HistoricalSemantics = {
  validIntervalEnd: IntervalEndSemantics;
  visibleIntervalEnd: IntervalEndSemantics;
  snapshotMeaning: SnapshotMeaning;
  openEndedValue: OpenEndedValue;
  correctionMode: CorrectionMode;
  detectedSignals: string[];
};

type TargetValidationResult = {
  rowCount: number;
  columns: string[];
  detectedColumns: DetectedColumns;
  semantics: HistoricalSemantics;
  findings: TargetFinding[];
  qualitySummary: {
    label: string;
    description: string;
    severity: "success" | "warning" | "danger";
  };
};

const TARGET_VALIDATION_EXAMPLES = [
  {
    id: "snapshot_output",
    title: "Snapshot Output",
    button: "Load Snapshot Output Demo",
    description:
      "Monthly snapshot output with duplicate grain, missing month coverage and reproducibility risk.",
    input: `contract_id,customer_id,snapshot_date,status,premium_amount,customer_segment,valid_from,valid_to,snapshot_method,coverage_status
C-1001,U-10,2024-01-31,active,120.00,Bronze,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1001,U-10,2024-02-29,active,120.00,Bronze,2024-02-01,2024-03-01,current_rebuild_only,ok
C-1001,U-10,2024-04-30,active,135.00,Gold,2024-04-01,2024-05-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-02-29,cancelled,90.00,Silver,2024-02-01,2024-03-01,current_rebuild_only,ok`,
  },
  {
    id: "dimension_completion_output",
    title: "Dimension Completion Output",
    button: "Load Dimension Completion Demo",
    description:
      "Fact snapshots with missing customer dimension values and historical coverage gaps.",
    input: `contract_id,customer_id,snapshot_date,status,premium_amount,customer_segment,region,valid_from,valid_to,completion_method,coverage_status
C-2001,U-30,2024-01-31,active,150.00,,North,2024-01-01,2024-02-01,not_completed,coverage_gap
C-2001,U-30,2024-02-29,active,150.00,,North,2024-02-01,2024-03-01,not_completed,coverage_gap
C-2001,U-30,2024-03-31,active,150.00,Gold,North,2024-03-01,2024-04-01,completed,ok
C-2002,U-40,2024-01-31,active,80.00,Silver,,2024-01-01,2024-02-01,not_completed,coverage_gap
C-2002,U-40,2024-02-29,active,80.00,Silver,West,2024-02-01,2024-03-01,completed,ok`,
  },
  {
    id: "event_prioritization_output",
    title: "Event Prioritization Output",
    button: "Load Event Prioritization Demo",
    description:
      "Event output with operational noise, duplicate milestones and prioritization issues.",
    input: `event_id,contract_id,event_time,event_type,reporting_milestone,priority_rank,prioritization_status
E-001,C-3001,2024-01-03T10:00:00,created,contract_created,1,ok
E-002,C-3001,2024-01-03T10:05:00,technical_update,contract_created,2,technical_event_kept
E-003,C-3001,2024-02-10T09:00:00,status_changed,contract_active,1,ok
E-004,C-3001,2024-02-10T09:01:00,workflow_sync,contract_active,2,workflow_noise_kept
E-005,C-3002,2024-03-01T11:00:00,cancelled,contract_cancelled,1,duplicate_milestone
E-006,C-3002,2024-03-01T11:02:00,cancelled,contract_cancelled,1,duplicate_milestone`,
  },
];

export function TargetTableValidationPanel() {
  const [input, setInput] = useState("");
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [semanticsOverride, setSemanticsOverride] = useState<
    Partial<HistoricalSemantics>
  >({});
  const [columnOverrides, setColumnOverrides] = useState<
    Partial<DetectedColumns>
  >({});

  function loadExampleValidation(
    example: (typeof TARGET_VALIDATION_EXAMPLES)[number],
  ) {
    setInput(example.input);
    setActiveExampleId(example.id);

    track("validation_example_loaded", {
      example: example.id,
      inputLength: example.input.length,
    });
  }

  useEffect(() => {
    const prefill = localStorage.getItem("target_validation_prefill");
    const prefillName = localStorage.getItem("target_validation_prefill_name");

    if (!prefill) return;

    setInput(prefill);
    setActiveExampleId(prefillName ?? "external_prefill");

    setTimeout(() => {
      validationResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);

    track("target_validation_prefilled", {
      source: "learn_page",
      name: prefillName,
      inputLength: prefill.length,
    });

    localStorage.removeItem("target_validation_prefill");
    localStorage.removeItem("target_validation_prefill_name");
  }, []);

  const result = useMemo(() => {
    if (!input.trim()) return null;

    return validateTargetTable(input, semanticsOverride, columnOverrides);
  }, [input, semanticsOverride, columnOverrides]);

  useEffect(() => {
    if (!result) return;

    track("target_validation_completed", {
      rowCount: result.rowCount,
      columnCount: result.columns.length,
      findingCount: result.findings.length,
      highRiskCount: result.findings.filter((f) => f.severity === "high")
        .length,
      mediumRiskCount: result.findings.filter((f) => f.severity === "medium")
        .length,
      hasBusinessKey: Boolean(result.detectedColumns.businessKey),
      hasValidTime: Boolean(
        result.detectedColumns.validFrom && result.detectedColumns.validTo,
      ),
      hasVisibleTime: Boolean(
        result.detectedColumns.visibleFrom && result.detectedColumns.visibleTo,
      ),
      hasSnapshotDate: Boolean(result.detectedColumns.snapshotDate),
    });
  }, [result]);

  const effectiveColumns = result
    ? {
        ...result.detectedColumns,
        ...columnOverrides,
      }
    : null;

  useEffect(() => {
    if (!result) return;

    const shouldScroll = sessionStorage.getItem(
      "target_validation_scroll_to_result",
    );

    if (!shouldScroll) return;

    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      sessionStorage.removeItem("target_validation_scroll_to_result");
    }, 250);
  }, [result]);

  useEffect(() => {
    const keys = Object.keys(semanticsOverride);

    if (keys.length === 0) return;

    track("target_validation_semantics_overridden", {
      overriddenFields: keys.join(","),
    });
  }, [semanticsOverride]);

  const requiresValidTime =
    !result ||
    !(
      result.columns.includes("event_id") ||
      result.columns.includes("event_time") ||
      result.columns.includes("event_type") ||
      result.columns.includes("prioritization_status")
    );

  const validationResultRef = useRef<HTMLDivElement>(null);

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
        Paste the output table produced by your notebook or pipeline. This
        checks whether the generated historical table has a stable grain,
        valid-time consistency and snapshot coverage.
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
          Try an example output
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 6,
          }}
        >
          Validate generated tables from notebooks or pipelines
        </div>

        <p
          style={{
            margin: "0 0 14px",
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Load sample target-table outputs to see checks for snapshot grain,
          dimension completion, missing coverage, event prioritization and
          reproducibility risks.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {TARGET_VALIDATION_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => loadExampleValidation(example)}
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

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste target table data here — or use an example from a Learn Page / demo button above..."
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
          Paste a target table or load an example above. If you opened this from
          a Learn Page, the example should appear here automatically.
        </InfoBox>
      )}

      {result && (
        <div ref={validationResultRef}>
          <div id="target-validation-result" ref={resultRef}>
            <div
              style={{
                marginTop: 16,
                marginBottom: 12,
                padding: 12,
                borderRadius: 10,
                background: "#ecfeff",
                border: "1px solid #a5f3fc",
                color: "#155e75",
                fontWeight: 700,
              }}
            >
              Example loaded automatically from the learn page.
            </div>
            <SummaryCard result={result} />
          </div>

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
                required={requiresValidTime}
              />
              <ColumnCard
                label="Valid to"
                value={result.detectedColumns.validTo}
                required={requiresValidTime}
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

          <div style={{ marginTop: 18 }}>
            <SectionTitle>Historical semantics</SectionTitle>

            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                Review the assumptions used for validation
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.5,
                }}
              >
                These settings describe how the target table should be
                interpreted. The validator auto-detects them where possible, but
                you can override them.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}
            >
              <SemanticSelect
                label="Valid-time interval end"
                value={result.semantics.validIntervalEnd}
                options={[
                  { value: "exclusive", label: "Exclusive [from, to)" },
                  { value: "inclusive", label: "Inclusive [from, to]" },
                ]}
                onChange={(value) =>
                  setSemanticsOverride((current) => ({
                    ...current,
                    validIntervalEnd: value as IntervalEndSemantics,
                  }))
                }
              />

              <SemanticSelect
                label="Visible-time interval end"
                value={result.semantics.visibleIntervalEnd}
                options={[
                  { value: "exclusive", label: "Exclusive [from, to)" },
                  { value: "inclusive", label: "Inclusive [from, to]" },
                ]}
                onChange={(value) =>
                  setSemanticsOverride((current) => ({
                    ...current,
                    visibleIntervalEnd: value as IntervalEndSemantics,
                  }))
                }
              />

              <SemanticSelect
                label="Snapshot date means"
                value={result.semantics.snapshotMeaning}
                options={[
                  { value: "period_end", label: "Period end" },
                  { value: "period_start", label: "Period start" },
                  {
                    value: "reporting_timestamp",
                    label: "Reporting timestamp",
                  },
                  { value: "none", label: "No snapshot" },
                ]}
                onChange={(value) =>
                  setSemanticsOverride((current) => ({
                    ...current,
                    snapshotMeaning: value as SnapshotMeaning,
                  }))
                }
              />

              <SemanticSelect
                label="Open-ended value"
                value={result.semantics.openEndedValue}
                options={[
                  { value: "9999-12-31", label: "9999-12-31" },
                  { value: "null", label: "NULL" },
                  { value: "custom", label: "Custom" },
                  { value: "none", label: "Not detected" },
                ]}
                onChange={(value) =>
                  setSemanticsOverride((current) => ({
                    ...current,
                    openEndedValue: value as OpenEndedValue,
                  }))
                }
              />

              <SemanticSelect
                label="Correction mode"
                value={result.semantics.correctionMode}
                options={[
                  { value: "valid_time", label: "Valid-time only" },
                  { value: "bitemporal", label: "As-known / bitemporal" },
                  { value: "published_snapshot", label: "Published snapshot" },
                ]}
                onChange={(value) =>
                  setSemanticsOverride((current) => ({
                    ...current,
                    correctionMode: value as CorrectionMode,
                  }))
                }
              />
            </div>

            {Object.keys(semanticsOverride).length > 0 && (
              <button
                type="button"
                onClick={() => setSemanticsOverride({})}
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset to auto-detected semantics
              </button>
            )}

            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1e40af",
                fontSize: 13,
                lineHeight: 1.5,
                fontWeight: 700,
              }}
            >
              Validation uses the selected historical semantics. Changing
              interval semantics may change gap and overlap findings.
            </div>

            {result.semantics.detectedSignals.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 10,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <strong>Auto-detected signals:</strong>
                {result.semantics.detectedSignals.map((signal) => (
                  <div key={signal}>• {signal}</div>
                ))}
              </div>
            )}
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
              Column Detection
            </summary>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gap: 12,
              }}
            >
              <ColumnSelector
                label="Business Key"
                value={
                  columnOverrides.businessKey ??
                  result.detectedColumns.businessKey
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    businessKey: value || null,
                  }))
                }
              />

              <ColumnSelector
                label="Valid From"
                value={
                  columnOverrides.validFrom ?? result.detectedColumns.validFrom
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    validFrom: value || null,
                  }))
                }
              />

              <ColumnSelector
                label="Valid To"
                value={
                  columnOverrides.validTo ?? result.detectedColumns.validTo
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    validTo: value || null,
                  }))
                }
              />

              <ColumnSelector
                label="Visible From"
                value={
                  columnOverrides.visibleFrom ??
                  result.detectedColumns.visibleFrom
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    visibleFrom: value || null,
                  }))
                }
              />

              <ColumnSelector
                label="Visible To"
                value={
                  columnOverrides.visibleTo ?? result.detectedColumns.visibleTo
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    visibleTo: value || null,
                  }))
                }
              />

              <ColumnSelector
                label="Snapshot Date"
                value={
                  columnOverrides.snapshotDate ??
                  result.detectedColumns.snapshotDate
                }
                options={result.columns}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    snapshotDate: value || null,
                  }))
                }
              />
            </div>
          </details>
        </div>
      )}
    </section>
  );
}

function ColumnSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#475569",
        }}
      >
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
        }}
      >
        <option value="">Not assigned</option>

        {options.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
    </label>
  );
}

function detectValidTimeOverlapsWithinVisibleSlices(
  rows: any[],
  businessKey: string,
  validFromKey: string,
  validToKey: string,
  visibleFromKey: string,
  visibleToKey: string,
  semantics: HistoricalSemantics,
): TargetFinding[] {
  const groups = new Map<string, any[]>();

  for (const row of rows) {
    const key = row[businessKey];
    if (!key) continue;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const findings: TargetFinding[] = [];

  for (const [key, group] of groups.entries()) {
    const sorted = group
      .filter((r) => r[validFromKey] && r[validToKey])
      .sort(
        (a, b) =>
          new Date(a[validFromKey]).getTime() -
          new Date(b[validFromKey]).getTime(),
      );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentTo = new Date(current[validToKey]).getTime();
      const nextFrom = new Date(next[validFromKey]).getTime();

      if (currentTo > nextFrom) {
        findings.push({
          id: "valid-overlap-bitemporal",
          title: "Valid-time overlap within visible slice detected",
          severity: "high",
          evidence: [
            `Entity ${key}`,
            `${current[validFromKey]} → ${current[validToKey]}`,
            `${next[validFromKey]} → ${next[validToKey]}`,
          ],
          recommendation:
            "Fix overlapping valid-time intervals within the same visible-time slice.",
        });
      }
    }
  }

  return findings;
}

function validateTargetTable(
  rawInput: string,
  semanticsOverride: Partial<HistoricalSemantics> = {},
  columnOverrides: Partial<DetectedColumns> = {},
): TargetValidationResult {
  const parsed = parseCSV(rawInput, { maxColumns: "all" });
  const rows = parsed.rows;
  const columns = parsed.headerMappings.map((m) => m.normalized);

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
      "as_of_date",
      "stichtag",
    ]),
    dimensionColumns: detectDimensionColumns(columns),
  };

  const effectiveColumns: DetectedColumns = {
    ...detectedColumns,
    ...columnOverrides,
  };

  const detectedSemantics = detectHistoricalSemantics(
    rows,
    columns,
    detectedColumns,
  );

  const semantics: HistoricalSemantics = {
    ...detectedSemantics,
    ...semanticsOverride,
    detectedSignals: detectedSemantics.detectedSignals,
  };

  const findings: TargetFinding[] = [];

  // =========================
  // BASIC VALIDATION
  // =========================

  if (rows.length === 0) {
    return buildResult(rows, columns, detectedColumns, semantics, [
      {
        id: "no-rows",
        title: "No rows detected",
        severity: "high",
        evidence: ["Input could not be parsed."],
        recommendation: "Provide valid tabular data.",
      },
    ]);
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
    rows.some((r) => r.event_id !== undefined) ||
    rows.some((r) => r.event_time !== undefined) ||
    rows.some((r) => r.event_type !== undefined);

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
    // invalid intervals
    findings.push(
      ...detectInvalidIntervals(
        rows,
        effectiveColumns.validFrom,
        effectiveColumns.validTo,
      ),
    );

    // basic overlaps (always)
    findings.push(
      ...detectValidTimeOverlaps(
        rows,
        effectiveColumns.businessKey,
        effectiveColumns.validFrom,
        effectiveColumns.validTo,
        semantics,
      ),
    );

    // =========================
    // BITEMPORAL DETECTION
    // =========================

    const hasVisibleColumns =
      !!effectiveColumns.visibleFrom && !!effectiveColumns.visibleTo;

    const hasVisibleVariance =
      hasVisibleColumns &&
      (new Set(rows.map((r) => r[effectiveColumns.visibleFrom!])).size > 1 ||
        new Set(rows.map((r) => r[effectiveColumns.visibleTo!])).size > 1);

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

  if (effectiveColumns.snapshotDate && effectiveColumns.businessKey) {
    findings.push(
      ...detectSnapshotDuplicates(
        rows,
        effectiveColumns.businessKey,
        effectiveColumns.snapshotDate,
      ),
    );

    findings.push(
      ...detectMissingSnapshotCoverage(
        rows,
        effectiveColumns.businessKey,
        effectiveColumns.snapshotDate,
      ),
    );

    findings.push(
      ...detectMonthlySnapshotGaps(
        rows,
        effectiveColumns.businessKey,
        effectiveColumns.snapshotDate,
      ),
    );
  }

  // =========================
  // DIMENSIONS
  // =========================

  if (effectiveColumns.dimensionColumns.length > 0) {
    findings.push(
      ...detectMissingDimensionValues(rows, effectiveColumns.dimensionColumns),
    );
  }

  return buildResult(rows, columns, detectedColumns, semantics, findings);
}

function buildResult(
  rows: any[],
  columns: string[],
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
    columns,
    detectedColumns,
    semantics,
    findings: uniqueFindings,
    qualitySummary,
  };
}

function detectHistoricalSemantics(
  rows: any[],
  columns: string[],
  detectedColumns: DetectedColumns,
): HistoricalSemantics {
  const detectedSignals: string[] = [];

  const hasValidTime = Boolean(
    detectedColumns.validFrom && detectedColumns.validTo,
  );

  const hasVisibleTime = Boolean(
    detectedColumns.visibleFrom && detectedColumns.visibleTo,
  );

  const hasSnapshotDate = Boolean(detectedColumns.snapshotDate);

  const hasPublishedAt = columns.some((column) =>
    [
      "published_at",
      "publication_time",
      "published_time",
      "report_published_at",
    ].includes(column),
  );

  const hasSnapshotVersion = columns.some((column) =>
    [
      "snapshot_version",
      "reporting_run_id",
      "run_id",
      "freeze_date",
      "publication_version",
    ].includes(column),
  );

  const has9999OpenEnd = rows.some((row) =>
    Object.values(row).some((value) =>
      String(value ?? "")
        .trim()
        .startsWith("9999-12-31"),
    ),
  );

  const hasNullOpenEnd =
    detectedColumns.validTo &&
    rows.some((row) => isMissingValue(row[detectedColumns.validTo!]));

  if (hasValidTime) detectedSignals.push("Valid-time interval detected.");
  if (hasVisibleTime) detectedSignals.push("Visible-time interval detected.");
  if (hasSnapshotDate) detectedSignals.push("Snapshot date detected.");
  if (hasPublishedAt || hasSnapshotVersion) {
    detectedSignals.push("Publication or freeze metadata detected.");
  }
  if (has9999OpenEnd) detectedSignals.push("9999-12-31 open end detected.");
  if (hasNullOpenEnd) detectedSignals.push("NULL open end detected.");

  const openEndedValue: OpenEndedValue = has9999OpenEnd
    ? "9999-12-31"
    : hasNullOpenEnd
      ? "null"
      : "none";

  const snapshotMeaning: SnapshotMeaning = hasSnapshotDate
    ? inferSnapshotMeaning(detectedColumns.snapshotDate!)
    : "none";

  const correctionMode: CorrectionMode =
    hasSnapshotDate && (hasPublishedAt || hasSnapshotVersion)
      ? "published_snapshot"
      : hasVisibleTime
        ? "bitemporal"
        : "valid_time";

  return {
    validIntervalEnd: "exclusive",
    visibleIntervalEnd: "exclusive",
    snapshotMeaning,
    openEndedValue,
    correctionMode,
    detectedSignals,
  };
}

function inferSnapshotMeaning(snapshotColumn: string): SnapshotMeaning {
  if (
    [
      "month_end",
      "snapshot_date",
      "reference_date",
      "bk_reference_date",
    ].includes(snapshotColumn)
  ) {
    return "period_end";
  }

  if (["reporting_date", "as_of_date", "stichtag"].includes(snapshotColumn)) {
    return "reporting_timestamp";
  }

  return "period_end";
}

function detectDuplicateIntervals(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string,
): TargetFinding[] {
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
  snapshotColumn: string,
): TargetFinding[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = [row[keyColumn], row[snapshotColumn]].join("||");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const duplicates = Array.from(counts.entries()).filter(
    ([, count]) => count > 1,
  );

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
      assumptions: [
        "snapshot_date is interpreted as part of the target table grain.",
        "The expected grain is one row per business key and snapshot date unless another grain is explicitly modeled.",
      ],
      recommendation:
        "A snapshot fact table should usually have one row per business key and snapshot date unless another grain is explicitly defined.",
    },
  ];
}

function detectMissingSnapshotCoverage(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string,
): TargetFinding[] {
  const snapshots = new Set(
    rows.map((row) => String(row[snapshotColumn] ?? "")),
  );
  const byKey = groupRowsByKey(rows, keyColumn);
  let missingCoverageCount = 0;

  byKey.forEach((keyRows) => {
    const keySnapshots = new Set(
      keyRows.map((row) => String(row[snapshotColumn] ?? "")),
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

function detectMonthlySnapshotGaps(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string,
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let missingCount = 0;
  const examples: string[] = [];

  byKey.forEach((keyRows, key) => {
    const dates = Array.from(
      new Set(
        keyRows
          .map((row) => parseDate(row[snapshotColumn]))
          .filter((date): date is Date => date !== null)
          .map((date) => formatDate(date)),
      ),
    )
      .map((date) => new Date(`${date}T00:00:00`))
      .sort((a, b) => a.getTime() - b.getTime());

    for (let i = 1; i < dates.length; i++) {
      const expectedNext = nextMonthEnd(dates[i - 1]);

      if (!sameDay(expectedNext, dates[i])) {
        missingCount += 1;

        if (examples.length < 3) {
          examples.push(
            `${key}: expected ${formatDate(expectedNext)} before ${formatDate(dates[i])}`,
          );
        }
      }
    }
  });

  if (missingCount === 0) return [];

  return [
    {
      id: "monthly-snapshot-gap",
      title: "Monthly snapshot coverage gap detected",
      severity: "high",
      evidence: [
        `${missingCount} missing monthly snapshot step${
          missingCount === 1 ? "" : "s"
        } detected within a business key timeline.`,
        `Examples: ${examples.join("; ")}.`,
      ],
      recommendation:
        "Check whether the missing snapshot month should be present. If the fact or dimension is required for every month-end snapshot, explicitly mark the gap, complete the history or use a controlled unknown member.",
    },
  ];
}

function nextMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 2, 0);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function intervalsOverlap(
  leftFrom: Date,
  leftTo: Date,
  rightFrom: Date,
  rightTo: Date,
  intervalEnd: IntervalEndSemantics,
) {
  if (intervalEnd === "exclusive") {
    return (
      leftFrom.getTime() < rightTo.getTime() &&
      rightFrom.getTime() < leftTo.getTime()
    );
  }

  return (
    leftFrom.getTime() <= rightTo.getTime() &&
    rightFrom.getTime() <= leftTo.getTime()
  );
}

function hasIntervalGap(
  previousTo: Date,
  nextFrom: Date,
  intervalEnd: IntervalEndSemantics,
) {
  if (intervalEnd === "exclusive") {
    return previousTo.getTime() < nextFrom.getTime();
  }

  const nextAllowed = new Date(previousTo);
  nextAllowed.setDate(nextAllowed.getDate() + 1);

  return nextAllowed.getTime() < nextFrom.getTime();
}

function isSameOrNextDay(previousTo: Date, nextFrom: Date) {
  if (sameDay(previousTo, nextFrom)) return true;

  const nextAllowed = new Date(previousTo);
  nextAllowed.setDate(nextAllowed.getDate() + 1);

  return sameDay(nextAllowed, nextFrom);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function detectRiskyAlignmentMethods(rows: any[]): TargetFinding[] {
  const methodColumns = [
    "alignment_method",
    "join_method",
    "modeling_method",
    "generation_method",
  ];

  const existingMethodColumn = methodColumns.find((column) =>
    rows.some((row) => row[column] !== undefined),
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
        "unknown period",
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
  detectedColumns: DetectedColumns,
): TargetFinding[] {
  const methodColumns = [
    "reproducibility_method",
    "snapshot_method",
    "reporting_method",
    "generation_method",
  ];

  const existingMethodColumn = methodColumns.find((column) =>
    rows.some((row) => row[column] !== undefined),
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

  const riskyRows = rows.filter((row) => {
    const value = String(row[existingMethodColumn] ?? "")
      .trim()
      .toLowerCase();

    return riskyValues.has(value);
  });

  if (riskyRows.length === 0) return [];

  const hasSnapshotDate = Boolean(detectedColumns.snapshotDate);
  const hasVisibleTime = Boolean(
    detectedColumns.visibleFrom && detectedColumns.visibleTo,
  );

  if (!hasSnapshotDate) return [];

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

  return [
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
  ];
}

function detectCoverageGapRisk(rows: any[]): TargetFinding[] {
  const statusColumns = [
    "coverage_status",
    "historical_coverage_status",
    "gap_status",
  ];

  const existingStatusColumn = statusColumns.find((column) =>
    rows.some((row) => row[column] !== undefined),
  );

  if (!existingStatusColumn) return [];

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

  if (riskyRows.length === 0) return [];

  return [
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
  ];
}

function detectStateReductionRisk(rows: any[]): TargetFinding[] {
  const statusColumn = "reduction_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) return [];

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

  if (riskyRows.length === 0) return [];

  return [
    {
      id: "state-reduction-risk",
      title: "State reduction risk detected",
      severity: "medium",
      evidence: [
        `${riskyRows.length} row${riskyRows.length === 1 ? "" : "s"} keep redundant or unreduced state versions.`,
      ],
      recommendation:
        "Review whether these operational state changes should be collapsed before publishing the reporting model.",
    },
  ];
}

function detectEventPrioritizationRisk(rows: any[]): TargetFinding[] {
  const statusColumn = "prioritization_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) return [];

  const riskyRows = rows.filter((row) => {
    const value = String(row[statusColumn] ?? "")
      .trim()
      .toLowerCase();

    return [
      "operational_noise_kept",
      "technical_event_kept",
      "not_prioritized",
      "duplicate_milestone",
      "workflow_noise_kept",
      "raw_event_kept",
    ].includes(value);
  });

  if (riskyRows.length === 0) return [];

  const exampleEvents = riskyRows
    .slice(0, 3)
    .map(
      (row) =>
        row.event_id ?? row.event_type ?? row.event_time ?? "unknown event",
    )
    .join(", ");

  return [
    {
      id: "event-prioritization-risk",
      title: "Event prioritization risk detected",
      severity: "medium",
      evidence: [
        `${riskyRows.length} row${
          riskyRows.length === 1 ? "" : "s"
        } keep operational or unprioritized event noise.`,
        `Example affected events: ${exampleEvents}.`,
      ],
      recommendation:
        "Review whether these operational events should be excluded, collapsed or ranked before publishing the reporting model.",
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
  validToColumn: string,
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
  visibleToColumn: string,
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
  validToColumn: string,
  semantics: HistoricalSemantics,
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
      if (
        intervalsOverlap(
          sorted[i - 1].from!,
          sorted[i - 1].to!,
          sorted[i].from!,
          sorted[i].to!,
          semantics.validIntervalEnd,
        )
      ) {
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
      assumptions: [
        semantics.validIntervalEnd === "exclusive"
          ? "valid_to is treated as exclusive. Touching intervals such as [2024-01-01, 2024-02-01) and [2024-02-01, 2024-03-01) do not overlap."
          : "valid_to is treated as inclusive. Touching intervals with the same boundary date are considered overlapping.",
        "Overlaps are checked within each detected business key.",
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
  validToColumn: string,
  semantics: HistoricalSemantics,
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
      if (
        hasIntervalGap(
          sorted[i - 1].to!,
          sorted[i].from!,
          semantics.validIntervalEnd,
        )
      ) {
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
      assumptions: [
        semantics.validIntervalEnd === "exclusive"
          ? "valid_to is treated as exclusive. Intervals are continuous when valid_to equals the next valid_from."
          : "valid_to is treated as inclusive. Intervals are continuous when the next valid_from is the next calendar day.",
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
      candidates.some((candidate) => column.includes(candidate)),
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
    new Map(findings.map((finding) => [finding.id, finding])).values(),
  );
}

function sortFindings(findings: TargetFinding[]) {
  const severityRank = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...findings].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
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

function formatSnapshotMeaning(value: SnapshotMeaning) {
  switch (value) {
    case "period_end":
      return "Period end";
    case "period_start":
      return "Period start";
    case "reporting_timestamp":
      return "Reporting timestamp";
    case "none":
      return "No snapshot";
  }
}

function formatOpenEndedValue(value: OpenEndedValue) {
  switch (value) {
    case "9999-12-31":
      return "9999-12-31";
    case "null":
      return "NULL";
    case "custom":
      return "Custom";
    case "none":
      return "Not detected";
  }
}

function formatCorrectionMode(value: CorrectionMode) {
  switch (value) {
    case "valid_time":
      return "Valid-time only";
    case "bitemporal":
      return "As-known / bitemporal";
    case "published_snapshot":
      return "Published snapshot";
  }
}

function SemanticSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label
      style={{
        display: "block",
        padding: 12,
        borderRadius: 12,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          color: "#64748b",
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          background: "#f8fafc",
          color: "#0f172a",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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

      {finding.assumptions && finding.assumptions.length > 0 && (
        <div
          style={{
            display: "inline-block",
            marginBottom: 8,
            padding: "3px 8px",
            borderRadius: 999,
            background: "#ffffff",
            border: "1px solid rgba(148, 163, 184, 0.45)",
            color: "#475569",
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Semantics-sensitive finding
        </div>
      )}

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

      {finding.assumptions && finding.assumptions.length > 0 && (
        <div
          style={{
            marginBottom: 8,
            padding: 10,
            borderRadius: 10,
            background: "#ffffff",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>Assumptions:</strong>
          {finding.assumptions.map((assumption) => (
            <div key={assumption}>• {assumption}</div>
          ))}
        </div>
      )}

      <div style={{ color: "#0f172a", fontSize: 14, lineHeight: 1.5 }}>
        <strong>Recommendation:</strong> {finding.recommendation}
      </div>
    </div>
  );
}
