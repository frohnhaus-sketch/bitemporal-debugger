"use client";

import { validateTargetTable } from "@/lib/targetTableValidator";
import { track } from "@/lib/analytics";
import { useEffect, useMemo, useState, useRef } from "react";
import type {
    TargetValidationResult,
    HistoricalSemantics,
    DetectedColumns,
    IntervalEndSemantics,
    OpenEndedValue,
    CorrectionMode,
    SemanticsConfidence,
    SnapshotMeaning,
} from "@/lib/types";
import { sameDay } from "@/lib/utils/date";
import { TargetFinding } from "@/lib/types";

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
      resultRef.current?.scrollIntoView({
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
      columnCount: result.columns.length, // ✅ FIX
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
      result.headerMappings.some((m) => m.normalized === "event_id") ||
      result.headerMappings.some((m) => m.normalized === "event_time") ||
      result.headerMappings.some((m) => m.normalized === "event_type") ||
      result.headerMappings.some(
        (m) => m.normalized === "prioritization_status",
      )
    );

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
        <div ref={resultRef}>
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
                value={result.detectedColumns.validFrom ?? null}
                required={requiresValidTime}
              />
              <ColumnCard
                label="Valid to"
                value={result.detectedColumns.validTo ?? null}
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
                label={`Valid-time interval end (${Math.round((result.semantics.confidence?.validIntervalEnd ?? 0) * 100)}%)`}
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
                label={`Visible-time interval end (${Math.round((result.semantics.confidence?.visibleIntervalEnd ?? 0) * 100)}%)`}
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
                options={result.headerMappings.map((m) => m.original)}
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
                  columnOverrides.validFrom ??
                  result.detectedColumns.validFrom ??
                  null
                }
                options={result.headerMappings.map((m) => m.original)}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    validFrom: value ?? null,
                  }))
                }
              />

              <ColumnSelector
                label="Valid To"
                value={
                  columnOverrides.validTo ??
                  result.detectedColumns.validTo ??
                  null
                }
                options={result.headerMappings.map((m) => m.original)}
                onChange={(value) =>
                  setColumnOverrides((prev) => ({
                    ...prev,
                    validTo: value ?? null,
                  }))
                }
              />

              <ColumnSelector
                label="Visible From"
                value={
                  columnOverrides.visibleFrom ??
                  result.detectedColumns.visibleFrom
                }
                options={result.headerMappings.map((m) => m.original)}
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
                options={result.headerMappings.map((m) => m.original)}
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
                options={result.headerMappings.map((m) => m.original)}
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

function isSameOrNextDay(previousTo: Date, nextFrom: Date) {
  if (sameDay(previousTo, nextFrom)) return true;

  const nextAllowed = new Date(previousTo);
  nextAllowed.setDate(nextAllowed.getDate() + 1);

  return sameDay(nextAllowed, nextFrom);
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