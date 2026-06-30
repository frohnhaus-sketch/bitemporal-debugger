"use client";

import { validateTargetTable } from "@/lib/targetTableValidator";
import { track } from "@/lib/analytics";
import { useEffect, useMemo, useRef, useState } from "react";

import { TargetTableInvestigation } from "@/components/investigation/TargetTableInvestigation";

const SAMPLE_INVESTIGATION = {
  id: "customer_revenue_mismatch",
  title: "Customer Revenue Mismatch",
  description:
    "A monthly revenue table looks correct, but historical reporting can no longer reproduce February numbers.",
  input: `contract_id,customer_id,snapshot_date,status,premium_amount,customer_segment,valid_from,valid_to,snapshot_method,coverage_status
C-1001,U-10,2024-01-31,active,120.00,Bronze,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1001,U-10,2024-02-29,active,120.00,Bronze,2024-02-01,2024-03-01,current_rebuild_only,ok
C-1001,U-10,2024-04-30,active,135.00,Gold,2024-04-01,2024-05-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-02-29,cancelled,90.00,Silver,2024-02-01,2024-03-01,current_rebuild_only,ok`,
};

type EntryMode = "sample" | "upload";

export function TargetTableValidationPanel() {
  const [input, setInput] = useState("");
  const [entryMode, setEntryMode] = useState<EntryMode>("sample");
  const [loadedSample, setLoadedSample] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;

    return validateTargetTable(input, {}, {});
  }, [input]);

  function runSampleInvestigation() {
    setEntryMode("sample");
    setLoadedSample(true);
    setInput(SAMPLE_INVESTIGATION.input);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("validation_example_loaded", {
      example: SAMPLE_INVESTIGATION.id,
      inputLength: SAMPLE_INVESTIGATION.input.length,
    });
  }

  function handleOwnTableSelected() {
    setEntryMode("upload");
    setLoadedSample(false);

    track("target_validation_own_table_selected", {
      source: "target_table_validation",
    });
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    const text = await file.text();

    setEntryMode("upload");
    setLoadedSample(false);
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
    setLoadedSample(false);
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
    }, 250);
  }, [result]);

  return (
    <section
      id="target-table-validation"
      style={{
        scrollMarginTop: 10,
        background: "#ffffff",
        color: "#0f172a",
        padding: "clamp(22px, 4vw, 34px)",
        borderRadius: 20,
        marginBottom: 24,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Hero />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
            marginTop: 24,
          }}
        >
          <ChoiceCard
            eyebrow="Recommended"
            title="Run sample investigation"
            description="Start with a realistic revenue mismatch and see what the debugger finds."
            buttonLabel="Run sample investigation"
            active={entryMode === "sample"}
            primary
            onClick={runSampleInvestigation}
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

        <div style={{ marginTop: 22 }}>
          {entryMode === "sample" && !loadedSample && (
            <EmptyState
              title="Start with the sample investigation"
              description="The debugger will load a small historical target table and explain the most important risks."
              actionLabel="Run sample investigation"
              onAction={runSampleInvestigation}
            />
          )}

          {entryMode === "sample" && loadedSample && (
            <LoadedSampleNotice
              title={SAMPLE_INVESTIGATION.title}
              description={SAMPLE_INVESTIGATION.description}
            />
          )}

          {entryMode === "upload" && (
            <UploadArea
              input={input}
              onInputChange={setInput}
              onFileUpload={handleFileUpload}
            />
          )}
        </div>

        {result && (
          <div ref={resultRef} style={{ marginTop: 26 }}>
            <TargetTableInvestigation result={result} />
          </div>
        )}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <header>
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#2563eb",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 10,
        }}
      >
        Bitemporal Debugger
      </div>

      <h2
        style={{
          margin: 0,
          maxWidth: 760,
          fontSize: "clamp(30px, 5vw, 48px)",
          lineHeight: 1.03,
          letterSpacing: "-0.04em",
        }}
      >
        Find why historical tables break business results.
      </h2>

      <p
        style={{
          maxWidth: 680,
          color: "#475569",
          fontSize: 17,
          lineHeight: 1.6,
          margin: "14px 0 0",
        }}
      >
        Validate target tables from notebooks, dbt models or pipelines for
        unstable grains, missing coverage and reproducibility risks.
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
        padding: 18,
        borderRadius: 18,
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
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 19 }}>{title}</h3>

      <p
        style={{
          margin: "0 0 16px",
          color: "#475569",
          lineHeight: 1.5,
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
          padding: "12px 14px",
          background: primary ? "#2563eb" : "#0f172a",
          color: "#ffffff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{title}</h3>

      <p
        style={{
          margin: "0 0 16px",
          color: "#475569",
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        style={{
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          background: "#2563eb",
          color: "#ffffff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function LoadedSampleNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 18,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#2563eb",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 6,
        }}
      >
        Sample investigation loaded
      </div>

      <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{title}</h3>

      <p
        style={{
          margin: 0,
          color: "#475569",
          lineHeight: 1.55,
          fontSize: 14,
        }}
      >
        {description}
      </p>
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
        padding: 18,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 900,
          marginBottom: 10,
          color: "#0f172a",
        }}
      >
        Upload CSV
      </label>

      <input
        type="file"
        accept=".csv,text/csv,text/plain"
        onChange={(event) => {
          void onFileUpload(event.target.files?.[0] ?? null);
        }}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          marginBottom: 14,
        }}
      />

      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 900,
          marginBottom: 10,
          color: "#0f172a",
        }}
      >
        Or paste table data
      </label>

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
          minHeight: 210,
          padding: 14,
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