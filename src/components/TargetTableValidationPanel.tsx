"use client";

import { validateTargetTable } from "@/lib/targetTableValidator";
import { track } from "@/lib/analytics";
import { useEffect, useMemo, useRef, useState } from "react";
import { SampleInvestigation } from "@/components/SampleInvestigation";

type EntryMode = "sample" | "upload";

const SAMPLE_ROWS = [
  [
    "C-1001",
    "2024-01-31",
    "120",
    "2024-01-01",
    "2024-02-01",
    "current_rebuild_only",
  ],
  [
    "C-1001",
    "2024-02-29",
    "120",
    "2024-02-01",
    "2024-03-01",
    "current_rebuild_only",
  ],
  [
    "C-1001",
    "2024-04-30",
    "135",
    "2024-04-01",
    "2024-05-01",
    "current_rebuild_only",
  ],
  [
    "C-1002",
    "2024-01-31",
    "90",
    "2024-01-01",
    "2024-02-01",
    "current_rebuild_only",
  ],
  [
    "C-1002",
    "2024-01-31",
    "90",
    "2024-01-01",
    "2024-02-01",
    "current_rebuild_only",
  ],
];

export function TargetTableValidationPanel() {
  const [input, setInput] = useState("");
  const [entryMode, setEntryMode] = useState<EntryMode>("sample");
  const [sampleCompleted, setSampleCompleted] = useState(false);
  const [sampleStartToken, setSampleStartToken] = useState(0);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return validateTargetTable(input, {}, {});
  }, [input]);

  function startSample() {
    setEntryMode("sample");
    setInput("");
    setSampleCompleted(false);
    setSampleStartToken((value) => value + 1);
  }

  function runInvestigation(sampleInput: string) {
    setEntryMode("sample");
    setSampleCompleted(true);
    setInput(sampleInput);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("sample_investigation_completed", {
      scenario: "customer_revenue_mismatch",
      inputLength: sampleInput.length,
    });
  }

  function handleOwnTableSelected() {
    setEntryMode("upload");
    setSampleCompleted(false);
    setInput("");

    track("target_validation_own_table_selected", {
      source: "target_table_validation",
    });
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    const text = await file.text();

    setEntryMode("upload");
    setSampleCompleted(false);
    setInput(text);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("target_validation_file_uploaded", {
      fileName: file.name,
      fileSize: file.size,
      inputLength: text.length,
    });
  }

  useEffect(() => {
    const prefill = localStorage.getItem("target_validation_prefill");
    const prefillName = localStorage.getItem("target_validation_prefill_name");

    if (!prefill) return;

    setEntryMode("upload");
    setSampleCompleted(false);
    setInput(prefill);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("target_validation_prefilled", {
      source: "learn_page",
      name: prefillName,
      inputLength: prefill.length,
    });

    localStorage.removeItem("target_validation_prefill");
    localStorage.removeItem("target_validation_prefill_name");
  }, []);

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
    }, 180);
  }, [result]);

  return (
    <section
      id="target-table-validation"
      style={{
        scrollMarginTop: 10,
        background: "#ffffff",
        color: "#0f172a",
        padding: "clamp(18px, 3vw, 28px)",
        borderRadius: 20,
        marginBottom: 24,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <Hero />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          <ChoiceCard
            eyebrow="Recommended"
            title="Guided sample investigation"
            description="Walk through a realistic revenue mismatch before running the analyzer."
            buttonLabel="Start guided investigation"
            active={entryMode === "sample"}
            primary
            onClick={startSample}
          />

          <ChoiceCard
            eyebrow="Your data"
            title="Upload your own table"
            description="Paste or upload a CSV output from a notebook, dbt model or pipeline."
            buttonLabel="Use my own table"
            active={entryMode === "upload"}
            onClick={handleOwnTableSelected}
          />
        </div>

        {entryMode === "sample" && !sampleCompleted && (
          <SampleInvestigation
            startSignal={sampleStartToken}
            onRunInvestigation={runInvestigation}
          />
        )}

        {entryMode === "upload" && (
          <div style={{ marginTop: 18 }}>
            <UploadArea
              input={input}
              onInputChange={setInput}
              onFileUpload={handleFileUpload}
            />
          </div>
        )}

        {result && (
          <div ref={resultRef} style={{ marginTop: 18 }}>
            <DarkInvestigationResult
              result={result}
              mode={entryMode}
              showSampleTable={entryMode === "sample"}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <header>
      <div style={blueEyebrowStyle}>Bitemporal Debugger</div>

      <h2
        style={{
          margin: 0,
          maxWidth: 820,
          fontSize: "clamp(34px, 4.4vw, 56px)",
          lineHeight: 1,
          letterSpacing: "-0.055em",
        }}
      >
        Find why historical tables break business results.
      </h2>

      <p
        style={{
          maxWidth: 820,
          color: "#475569",
          fontSize: 16,
          lineHeight: 1.5,
          margin: "12px 0 0",
        }}
      >
        Investigate unstable grains, missing coverage and reproducibility risks
        in historical target tables.
      </p>
    </header>
  );
}

function ChoiceCard({
  eyebrow,
  title,
  description,
  buttonLabel,
  active,
  primary = false,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  active: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
        background: active ? "#eff6ff" : "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: primary ? "#2563eb" : "#64748b",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 7,
        }}
      >
        {eyebrow}
      </div>

      <h3 style={{ margin: "0 0 7px", fontSize: 18 }}>{title}</h3>

      <p
        style={{
          margin: "0 0 13px",
          color: "#475569",
          lineHeight: 1.45,
          fontSize: 14,
        }}
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 12,
          padding: "11px 14px",
          background: primary ? "#2563eb" : "#0f172a",
          color: "#ffffff",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function DarkInvestigationResult({
  result,
  mode,
  showSampleTable,
}: {
  result: ReturnType<typeof validateTargetTable>;
  mode: EntryMode;
  showSampleTable: boolean;
}) {
  const high = result.findings.filter((f) => f.severity === "high").length;
  const medium = result.findings.filter((f) => f.severity === "medium").length;
  const low = result.findings.filter((f) => f.severity === "low").length;
  const topFindings = result.findings.slice(0, 3);

  return (
    <section
      style={{
        padding: 18,
        borderRadius: 18,
        background:
          "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.16), transparent 34%), #020617",
        border: "1px solid rgba(148,163,184,0.24)",
        color: "#ffffff",
      }}
    >
      <div style={darkEyebrowStyle}>
        {mode === "sample" ? "Sample analyzer result" : "Analyzer result"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.85fr) minmax(420px, 1.15fr)",
          gap: 14,
          alignItems: "start",
          marginTop: 10,
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <AssessmentCard high={high} medium={medium} low={low} />

          <div style={darkPanelStyle}>
            <div style={darkEyebrowStyle}>Detected structure</div>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                margin: "12px 0 0",
                fontSize: 13,
              }}
            >
              <Meta label="Rows" value={String(result.rowCount)} />
              <Meta label="Columns" value={String(result.columns.length)} />
              <Meta
                label="Business key"
                value={result.detectedColumns.businessKey ?? "not detected"}
              />
              <Meta
                label="Valid time"
                value={
                  result.detectedColumns.validFrom &&
                  result.detectedColumns.validTo
                    ? `${result.detectedColumns.validFrom} → ${result.detectedColumns.validTo}`
                    : "not detected"
                }
              />
              <Meta
                label="Snapshot"
                value={result.detectedColumns.snapshotDate ?? "not detected"}
              />
              <Meta
                label="Visible time"
                value={
                  result.detectedColumns.visibleFrom &&
                  result.detectedColumns.visibleTo
                    ? "detected"
                    : "not detected"
                }
              />
            </dl>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {showSampleTable && <SampleTablePreview />}

          <div style={darkPanelStyle}>
            <div style={darkEyebrowStyle}>Top findings</div>

            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {topFindings.map((finding, index) => (
                <FindingCard
                  key={`${"kind" in finding ? finding.kind : "finding"}-${index}`}
                  finding={finding}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssessmentCard({
  high,
  medium,
  low,
}: {
  high: number;
  medium: number;
  low: number;
}) {
  const hasHighRisk = high > 0;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: hasHighRisk
          ? "rgba(127,29,29,0.22)"
          : "rgba(34,197,94,0.10)",
        border: hasHighRisk
          ? "1px solid rgba(251,113,133,0.38)"
          : "1px solid rgba(34,197,94,0.25)",
      }}
    >
      <div style={darkEyebrowStyle}>
        {hasHighRisk ? "High risk" : "Looks stable"}
      </div>

      <h3
        style={{
          margin: "8px 0 8px",
          fontSize: 26,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
        }}
      >
        {hasHighRisk
          ? "Historical issues detected"
          : "No critical historical issue detected"}
      </h3>

      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.72)",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {hasHighRisk
          ? "This table is unlikely to reproduce historical reports reliably."
          : "The table passed the most important historical consistency checks."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginTop: 14,
        }}
      >
        <RiskBox label="High" value={high} tone="bad" />
        <RiskBox label="Medium" value={medium} tone="warn" />
        <RiskBox label="Low" value={low} tone="good" />
      </div>
    </div>
  );
}

function RiskBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "bad" | "warn" | "good";
}) {
  const color =
    tone === "bad" ? "#fb7185" : tone === "warn" ? "#fbbf24" : "#34d399";

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: "rgba(15,23,42,0.46)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          color,
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 24, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function SampleTablePreview() {
  return (
    <div style={darkPanelStyle}>
      <div style={darkEyebrowStyle}>Analyzed sample table</div>

      <MiniTable
        title="sample_target_table"
        columns={[
          "contract_id",
          "snapshot_date",
          "premium",
          "valid_from",
          "valid_to",
          "method",
        ]}
        rows={SAMPLE_ROWS}
        highlightRow={4}
      />

      <div
        style={{
          marginTop: 10,
          padding: 11,
          borderRadius: 11,
          background: "rgba(251,191,36,0.10)",
          border: "1px solid rgba(251,191,36,0.24)",
          color: "#fde68a",
          fontSize: 12.5,
          lineHeight: 1.45,
          fontWeight: 700,
        }}
      >
        The analyzer checks this generated table for reproducibility, duplicate
        grain, gaps and temporal consistency.
      </div>
    </div>
  );
}

function FindingCard({
  finding,
}: {
  finding: ReturnType<typeof validateTargetTable>["findings"][number];
}) {
  const severityColor =
    finding.severity === "high"
      ? "#fb7185"
      : finding.severity === "medium"
        ? "#fbbf24"
        : "#34d399";

  const title =
    "title" in finding && typeof finding.title === "string"
      ? finding.title
      : "kind" in finding && typeof finding.kind === "string"
        ? humanize(finding.kind)
        : "Historical issue detected";

  const description =
    "message" in finding && typeof finding.message === "string"
      ? finding.message
      : "description" in finding && typeof finding.description === "string"
        ? finding.description
        : "This issue can affect historical reporting correctness.";

  const recommendation =
    "recommendation" in finding && typeof finding.recommendation === "string"
      ? finding.recommendation
      : "Review the affected grain, interval logic or snapshot generation rule.";

  return (
    <div
      style={{
        padding: 13,
        borderRadius: 13,
        background: "rgba(15,23,42,0.58)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: severityColor,
            flex: "0 0 auto",
          }}
        />

        <strong style={{ fontSize: 14 }}>{title}</strong>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.68)",
          fontSize: 12.5,
          lineHeight: 1.45,
        }}
      >
        {description}
      </div>

      <div
        style={{
          marginTop: 9,
          padding: 10,
          borderRadius: 10,
          background: "rgba(255,255,255,0.045)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#bfdbfe",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        <strong>Recommended fix: </strong>
        {recommendation}
      </div>
    </div>
  );
}

function MiniTable({
  title,
  columns,
  rows,
  highlightRow,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  highlightRow?: number;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 13,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(2,6,23,0.45)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          padding: "8px 10px",
          background: "rgba(255,255,255,0.06)",
          fontSize: 12,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {title}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11.5,
            minWidth: 620,
          }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={thStyle}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background:
                    rowIndex === highlightRow
                      ? "rgba(251,191,36,0.18)"
                      : "transparent",
                }}
              >
                {row.map((value, columnIndex) => (
                  <td key={columnIndex} style={tdStyle}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{label}</dt>
      <dd
        style={{
          margin: "4px 0 0",
          color: "#ffffff",
          fontSize: 12.5,
          fontWeight: 800,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function UploadArea({
  input,
  onInputChange,
  onFileUpload,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <label style={uploadLabelStyle}>Upload CSV</label>

      <input
        type="file"
        accept=".csv,text/csv,text/plain"
        onChange={(event) => {
          void onFileUpload(event.target.files?.[0] ?? null);
        }}
        style={{
          width: "100%",
          padding: 11,
          borderRadius: 12,
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          marginBottom: 12,
        }}
      />

      <label style={uploadLabelStyle}>Or paste table data</label>

      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Paste CSV data here..."
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        style={{
          width: "100%",
          minHeight: 180,
          padding: 13,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 1.5,
          boxSizing: "border-box",
          resize: "vertical",
          background: "#ffffff",
        }}
      />
    </div>
  );
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const blueEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};

const darkEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
  fontWeight: 900,
};

const darkPanelStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "7px 8px",
  color: "rgba(255,255,255,0.48)",
  fontWeight: 500,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "7px 8px",
  color: "rgba(255,255,255,0.84)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  whiteSpace: "nowrap",
};

const uploadLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 9,
  color: "#0f172a",
};
