"use client";

import {
  analyzeTargetTable,
  validateTargetTable,
} from "@/lib/targetTableValidator";
import { track } from "@/lib/analytics";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HistoricalSemantics } from "@/lib/types";
import { AnalyzerResultScreenV2 } from "@/analyzer/AnalyzerResultScreenV2";
import { SampleInvestigation } from "@/components/SampleInvestigation";

type FlowState = "landing" | "guided-investigation" | "report" | "upload";

type SampleScenarioId =
  | "revenue_rebuild"
  | "customer_missing"
  | "duplicate_snapshot";

type SampleScenario = {
  id: SampleScenarioId;
  title: string;
  icon: string;
  description: string;
  rows: Record<string, string>[];
  csv: string;
};

const SAMPLE_SCENARIOS: Record<SampleScenarioId, SampleScenario> = {
  revenue_rebuild: {
    id: "revenue_rebuild",
    title: "Revenue changed after rebuild",
    icon: "💰",
    description:
      "A corrected historical row overlaps a previously published state. Rebuilding revenue can produce a different result.",
    rows: [
      {
        contract_id: "C-1001",
        snapshot_date: "2024-01-31",
        premium: "100",
        valid_from: "2024-01-01",
        valid_to: "9999-12-31",
        visible_from: "2024-01-31",
        visible_to: "2024-02-15",
        method: "published",
      },
      {
        contract_id: "C-1001",
        snapshot_date: "2024-01-31",
        premium: "120",
        valid_from: "2024-01-15",
        valid_to: "9999-12-31",
        visible_from: "2024-02-15",
        visible_to: "9999-12-31",
        method: "rebuild",
      },
      {
        contract_id: "C-1002",
        snapshot_date: "2024-01-31",
        premium: "80",
        valid_from: "2024-01-01",
        valid_to: "9999-12-31",
        visible_from: "2024-01-31",
        visible_to: "9999-12-31",
        method: "published",
      },
    ],
    csv: `contract_id,snapshot_date,premium,valid_from,valid_to,visible_from,visible_to,method
C-1001,2024-01-31,100,2024-01-01,9999-12-31,2024-01-31,2024-02-15,published
C-1001,2024-01-31,120,2024-01-15,9999-12-31,2024-02-15,9999-12-31,rebuild
C-1002,2024-01-31,80,2024-01-01,9999-12-31,2024-01-31,9999-12-31,published`,
  },

  customer_missing: {
    id: "customer_missing",
    title: "Customer disappeared from month-end report",
    icon: "👤",
    description:
      "A customer is missing from the month-end report because no row covers the reporting date.",
    rows: [
      {
        customer_id: "C-204",
        snapshot_date: "2024-03-31",
        status: "ACTIVE",
        valid_from: "2024-01-01",
        valid_to: "2024-03-15",
      },
      {
        customer_id: "C-205",
        snapshot_date: "2024-03-31",
        status: "ACTIVE",
        valid_from: "2024-01-01",
        valid_to: "9999-12-31",
      },
    ],
    csv: `customer_id,snapshot_date,status,valid_from,valid_to
C-204,2024-03-31,ACTIVE,2024-01-01,2024-03-15
C-205,2024-03-31,ACTIVE,2024-01-01,9999-12-31`,
  },

  duplicate_snapshot: {
    id: "duplicate_snapshot",
    title: "Duplicate snapshot records",
    icon: "📅",
    description:
      "The same business key appears twice for the same snapshot date.",
    rows: [
      {
        contract_id: "C-301",
        snapshot_date: "2024-05-31",
        premium: "250",
      },
      {
        contract_id: "C-301",
        snapshot_date: "2024-05-31",
        premium: "250",
      },
    ],
    csv: `contract_id,snapshot_date,premium
C-301,2024-05-31,250
C-301,2024-05-31,250`,
  },
};

type TargetTableValidationPanelProps = {
  onInvestigationCompleted?: () => void;
};

export function TargetTableValidationPanel({
  onInvestigationCompleted,
}: TargetTableValidationPanelProps) {
  const [sampleStartToken, setSampleStartToken] = useState(0);
  const [input, setInput] = useState("");
  const [flowState, setFlowState] = useState<FlowState>("landing");
  const [showOwnTableUpload, setShowOwnTableUpload] = useState(false);
  const [ownTableDraft, setOwnTableDraft] = useState("");
  const [selectedScenario, setSelectedScenario] =
    useState<SampleScenarioId>("revenue_rebuild");

  const resultRef = useRef<HTMLDivElement | null>(null);

  const [validIntervalEnd, setValidIntervalEnd] = useState<
    "exclusive" | "inclusive"
  >("exclusive");

  const [visibleIntervalEnd, setVisibleIntervalEnd] = useState<
    "exclusive" | "inclusive"
  >("exclusive");

  const [temporalModel, setTemporalModel] = useState<
    "valid_time" | "bitemporal" | "tritemporal_unknown"
  >("valid_time");

  const semanticsOverride = useMemo<Partial<HistoricalSemantics>>(
    () => ({
      validIntervalEnd,
      visibleIntervalEnd,
      correctionMode:
        temporalModel === "bitemporal" ? "bitemporal" : "valid_time",
    }),
    [validIntervalEnd, visibleIntervalEnd, temporalModel],
  );

  const analysis = useMemo(() => {
    if (!input.trim()) return null;
    return analyzeTargetTable(input, semanticsOverride, {});
  }, [input, semanticsOverride]);

  const result = analysis?.result ?? null;

  function startSample() {
    setInput("");
    setOwnTableDraft("");
    setShowOwnTableUpload(false);

    setFlowState("guided-investigation");

    track("guided_sample_investigation_started", {
      source: "target_table_validation",
    });
  }

  function runInvestigation(
    scenarioId: keyof typeof SAMPLE_SCENARIOS,
    sampleInput: string,
  ) {
    setInput(sampleInput);
    setFlowState("report");

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("sample_investigation_completed", {
      scenario: scenarioId,
      inputLength: sampleInput.length,
    });
  }

  function handleOwnTableSelected() {
    if (result) {
      setShowOwnTableUpload(true);
    } else {
      setInput("");
      setOwnTableDraft("");
      setShowOwnTableUpload(false);
      setFlowState("upload");
    }

    track("target_validation_own_table_selected", {
      source: result ? "sample_report_cta" : "target_table_validation",
    });
  }

  function resetInvestigation() {
    setInput("");
    setShowOwnTableUpload(false);
    setOwnTableDraft("");
    setSelectedScenario("revenue_rebuild");
    setFlowState("landing");

    track("another_investigation_started", {
      previousScenario: selectedScenario,
    });

    window.setTimeout(() => {
      document.getElementById("target-table-validation")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    const text = await file.text();

    setFlowState("upload");
    setShowOwnTableUpload(false);
    setOwnTableDraft("");
    setInput(text);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("target_validation_file_uploaded", {
      fileName: file.name,
      fileSize: file.size,
      inputLength: text.length,
    });
  }

  function runOwnTableFromPaste() {
    if (!ownTableDraft.trim()) return;

    setFlowState("upload");
    setShowOwnTableUpload(false);
    setInput(ownTableDraft);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("target_validation_own_table_pasted", {
      inputLength: ownTableDraft.length,
    });
  }

  useEffect(() => {
    const prefill = localStorage.getItem("target_validation_prefill");
    const prefillName = localStorage.getItem("target_validation_prefill_name");

    if (!prefill) return;

    setFlowState("upload");
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
      flowState,
      scenario: flowState === "report" ? selectedScenario : null,
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
  }, [result, flowState, selectedScenario]);

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
        padding: analysis ? "clamp(18px, 3vw, 40px)" : "clamp(18px, 3vw, 28px)",
        borderRadius: 20,
        marginBottom: 24,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ maxWidth: analysis ? 1320 : 1220, margin: "0 auto" }}>
        {!analysis && flowState === "landing" && (
          <>
            <>
              <Hero />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1.45fr) minmax(280px, 0.75fr)",
                  gap: 18,
                  marginTop: 18,
                  alignItems: "start",
                }}
              >
                <ScenarioPicker
                  selectedScenario={selectedScenario}
                  onSelect={(scenarioId) => {
                    setSelectedScenario(scenarioId);
                    runInvestigation(
                      scenarioId,
                      SAMPLE_SCENARIOS[scenarioId].csv,
                    );
                  }}
                />

                <ChoiceCard
                  eyebrow="Your data"
                  title="Upload your own table"
                  description="Paste or upload a CSV output from a notebook, dbt model or pipeline."
                  buttonLabel="Use my own table"
                  active={false}
                  onClick={handleOwnTableSelected}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <SampleInvestigation
                  scenario={SAMPLE_SCENARIOS["revenue_rebuild"]}
                  startSignal={sampleStartToken}
                  onRunInvestigation={() =>
                    runInvestigation(
                      "revenue_rebuild",
                      SAMPLE_SCENARIOS["revenue_rebuild"].csv,
                    )
                  }
                />
              </div>
            </>
          </>
        )}

        {!analysis && flowState === "guided-investigation" && (
          <SampleInvestigation
            scenario={SAMPLE_SCENARIOS["revenue_rebuild"]}
            startSignal={sampleStartToken}
            onRunInvestigation={() =>
              runInvestigation(
                "revenue_rebuild",
                SAMPLE_SCENARIOS["revenue_rebuild"].csv,
              )
            }
          />
        )}

        {!analysis && flowState === "upload" && (
          <>
            <Hero />

            <div style={{ marginTop: 18 }}>
              <UploadArea
                input={input}
                onInputChange={setInput}
                onFileUpload={handleFileUpload}
              />
            </div>
          </>
        )}

        {analysis && (
          <div ref={resultRef}>
            <AnalyzerResultScreenV2
              result={analysis.result}
              ruleFacts={analysis.ruleFacts}
              showSampleTable={flowState === "report"}
              validIntervalEnd={validIntervalEnd}
              visibleIntervalEnd={visibleIntervalEnd}
              temporalModel={temporalModel}
              onChangeValidIntervalEndAction={setValidIntervalEnd}
              onChangeVisibleIntervalEndAction={setVisibleIntervalEnd}
              onChangeTemporalModelAction={setTemporalModel}
            />

            <ReportExportActions />

            {flowState === "report" && (
              <ContinueWithOwnData
                showUpload={showOwnTableUpload}
                input={ownTableDraft}
                onStart={handleOwnTableSelected}
                onInputChange={setOwnTableDraft}
                onFileUpload={handleFileUpload}
                onRun={runOwnTableFromPaste}
              />
            )}

            <button
              type="button"
              onClick={resetInvestigation}
              className="no-print"
              style={{
                marginTop: 12,
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "12px 16px",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Run another investigation
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
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

function ReportExportActions() {
  function handlePrint() {
    track("investigation_report_pdf_download_clicked", {
      method: "browser_print",
    });

    window.print();
  }

  return (
    <section
      className="no-print"
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={blueEyebrowStyle}>Export</div>

        <h3
          style={{
            margin: "4px 0 4px",
            fontSize: 20,
            color: "#0f172a",
          }}
        >
          Save Investigation Report
        </h3>

        <p
          style={{
            margin: 0,
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          Save this investigation as a PDF for review, sharing or follow-up
          work.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePrint}
        style={{
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          background: "#0f172a",
          color: "#ffffff",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Save as PDF
      </button>
    </section>
  );
}

function DarkInvestigationResult({
  result,
  mode,
  showSampleTable,
  validIntervalEnd,
  visibleIntervalEnd,
  temporalModel,
  onChangeValidIntervalEnd,
  onChangeVisibleIntervalEnd,
  onChangeTemporalModel,
}: {
  result: ReturnType<typeof validateTargetTable>;
  mode: FlowState;
  showSampleTable: boolean;
  validIntervalEnd: "exclusive" | "inclusive";
  visibleIntervalEnd: "exclusive" | "inclusive";
  temporalModel: "valid_time" | "bitemporal" | "tritemporal_unknown";
  onChangeValidIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeVisibleIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeTemporalModel: (
    value: "valid_time" | "bitemporal" | "tritemporal_unknown",
  ) => void;
}) {
  const investigation = deriveInvestigation(result);

  return (
    <section
      style={{
        padding: 18,
        borderRadius: 18,
        background:
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.16), transparent 34%), #020617",
        border: "1px solid rgba(148,163,184,0.24)",
        color: "#ffffff",
      }}
    >
      <AnalysisAssumptionsBar
        validIntervalEnd={validIntervalEnd}
        visibleIntervalEnd={visibleIntervalEnd}
        temporalModel={temporalModel}
        onChangeValidIntervalEnd={onChangeValidIntervalEnd}
        onChangeVisibleIntervalEnd={onChangeVisibleIntervalEnd}
        onChangeTemporalModel={onChangeTemporalModel}
      />

      <div style={{ marginTop: 14 }}>
        <div style={darkEyebrowStyle}>Analyzer result</div>

        <InvestigationSummary investigation={investigation} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.9fr) minmax(420px, 1.1fr)",
          gap: 14,
          alignItems: "start",
          marginTop: 14,
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <ReasoningCard investigation={investigation} />

          <NarrativeCard title="Root Cause" body={investigation.rootCause} />

          <NarrativeCard
            title="Business Impact"
            body={investigation.businessImpact}
          />

          <NarrativeCard
            title="Recommendation"
            body={investigation.recommendation}
            highlighted
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {showSampleTable && (
            <SampleTablePreview selectedScenario="revenue_rebuild" />
          )}

          <EvidenceList result={result} />

          <TechnicalDetails result={result} />
        </div>
      </div>
    </section>
  );
}

function deriveInvestigation(result: ReturnType<typeof validateTargetTable>) {
  const findingsText = result.findings
    .map((finding) =>
      [
        "kind" in finding ? finding.kind : "",
        "title" in finding ? finding.title : "",
        "message" in finding ? finding.message : "",
        "description" in finding ? finding.description : "",
        "recommendation" in finding ? finding.recommendation : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    )
    .join(" ");

  const hasBusinessKey = Boolean(result.detectedColumns.businessKey);
  const hasValidTime = Boolean(
    result.detectedColumns.validFrom && result.detectedColumns.validTo,
  );
  const hasVisibleTime = Boolean(
    result.detectedColumns.visibleFrom && result.detectedColumns.visibleTo,
  );
  const hasSnapshot = Boolean(result.detectedColumns.snapshotDate);

  const hasDuplicateIntervals =
    findingsText.includes("duplicate") || findingsText.includes("overlap");

  const hasMissingCoverage =
    findingsText.includes("coverage") ||
    findingsText.includes("gap") ||
    findingsText.includes("missing");

  const hasDuplicateSnapshotGrain =
    findingsText.includes("duplicate snapshot") ||
    findingsText.includes("snapshot grain");

  const high = result.findings.filter((f) => f.severity === "high").length;
  const medium = result.findings.filter((f) => f.severity === "medium").length;

  const reasoning = [
    { label: "Business Key detected", detected: hasBusinessKey },
    { label: "Valid Time detected", detected: hasValidTime },
    { label: "Snapshot grain detected", detected: hasSnapshot },
    { label: "Visible Time detected", detected: hasVisibleTime },
    { label: "Duplicate intervals detected", detected: hasDuplicateIntervals },
    { label: "Missing coverage detected", detected: hasMissingCoverage },
  ];

  if (hasMissingCoverage || hasDuplicateSnapshotGrain || high > 0) {
    return {
      tone: "bad" as const,
      icon: "❌",
      title: "Historical reports cannot be reproduced.",
      summary:
        "The analyzer found historical consistency problems that can make regenerated reports differ from already published numbers.",
      rootCause: hasMissingCoverage
        ? "Expected historical periods are missing for the same business entity."
        : "The same reporting grain appears more than once, so the published result is ambiguous.",
      businessImpact:
        "Finance, revenue or operational reports may show different numbers after a rebuild.",
      recommendation: hasMissingCoverage
        ? "Generate complete monthly snapshots or model missing periods explicitly before publishing."
        : "Ensure exactly one deterministic row per business key and snapshot period.",
      reasoning,
    };
  }

  if (hasDuplicateIntervals || medium > 0) {
    return {
      tone: "warn" as const,
      icon: "⚠️",
      title: "Reports may change after historical rebuilds.",
      summary:
        "The analyzer found temporal ambiguity that can make joins, snapshots or rebuilds unstable.",
      rootCause:
        "Multiple rows may be valid for the same business entity at the same point in time.",
      businessImpact:
        "Historical joins may duplicate facts or select different rows depending on query logic.",
      recommendation:
        "Normalize interval boundaries and add deterministic winner selection before compaction.",
      reasoning,
    };
  }

  if (!hasBusinessKey || !hasValidTime) {
    return {
      tone: "review" as const,
      icon: "⚠️",
      title: "Historical model needs review.",
      summary:
        "The analyzer could not confidently detect the minimum structure needed for historical validation.",
      rootCause:
        "A clear business key or valid-time interval structure could not be detected.",
      businessImpact:
        "The analyzer cannot reliably prove whether this table is safe for historical reporting.",
      recommendation:
        "Confirm the business key and valid-time columns before relying on this table.",
      reasoning,
    };
  }

  return {
    tone: "good" as const,
    icon: "✅",
    title: "No critical historical risks detected.",
    summary:
      "The analyzer did not find critical reproducibility, coverage or interval problems.",
    rootCause:
      "No critical root cause was detected from the available historical structure.",
    businessImpact:
      "Reports based on this table are less likely to change unexpectedly after regeneration.",
    recommendation:
      "Keep validating this table whenever upstream logic or snapshot generation changes.",
    reasoning,
  };
}

function AnalysisAssumptionsBar({
  validIntervalEnd,
  visibleIntervalEnd,
  temporalModel,
  onChangeValidIntervalEnd,
  onChangeVisibleIntervalEnd,
  onChangeTemporalModel,
}: {
  validIntervalEnd: "exclusive" | "inclusive";
  visibleIntervalEnd: "exclusive" | "inclusive";
  temporalModel: "valid_time" | "bitemporal" | "tritemporal_unknown";
  onChangeValidIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeVisibleIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeTemporalModel: (
    value: "valid_time" | "bitemporal" | "tritemporal_unknown",
  ) => void;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div style={darkEyebrowStyle}>Analysis assumptions</div>

      <AssumptionToggle
        label="Valid end"
        value={validIntervalEnd}
        options={[
          ["exclusive", "Exclusive"],
          ["inclusive", "Inclusive"],
        ]}
        onChange={onChangeValidIntervalEnd}
      />

      <AssumptionToggle
        label="Visible end"
        value={visibleIntervalEnd}
        options={[
          ["exclusive", "Exclusive"],
          ["inclusive", "Inclusive"],
        ]}
        onChange={onChangeVisibleIntervalEnd}
      />

      <AssumptionToggle
        label="Temporal model"
        value={temporalModel}
        options={[
          ["valid_time", "Valid-time"],
          ["bitemporal", "Bitemporal"],
          ["tritemporal_unknown", "Tri-temporal / Unknown"],
        ]}
        onChange={onChangeTemporalModel}
      />
    </div>
  );
}

function AssumptionToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span
        style={{
          color: "rgba(255,255,255,0.48)",
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {label}
      </span>

      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          style={{
            borderRadius: 999,
            padding: "6px 9px",
            border:
              value === optionValue
                ? "1px solid rgba(147,197,253,0.70)"
                : "1px solid rgba(255,255,255,0.12)",
            background:
              value === optionValue
                ? "rgba(37,99,235,0.28)"
                : "rgba(15,23,42,0.52)",
            color: value === optionValue ? "#bfdbfe" : "rgba(255,255,255,0.62)",
            fontSize: 11.5,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

function InvestigationSummary({
  investigation,
}: {
  investigation: ReturnType<typeof deriveInvestigation>;
}) {
  const border =
    investigation.tone === "bad"
      ? "rgba(251,113,133,0.42)"
      : investigation.tone === "warn"
        ? "rgba(251,191,36,0.38)"
        : investigation.tone === "good"
          ? "rgba(52,211,153,0.32)"
          : "rgba(96,165,250,0.36)";

  return (
    <div
      style={{
        marginTop: 10,
        padding: 18,
        borderRadius: 18,
        background: "rgba(15,23,42,0.52)",
        border: `1px solid ${border}`,
      }}
    >
      <div style={darkEyebrowStyle}>Investigation Result</div>

      <h3
        style={{
          margin: "9px 0 8px",
          fontSize: 30,
          lineHeight: 1.05,
          letterSpacing: "-0.045em",
        }}
      >
        <span style={{ marginRight: 10 }}>{investigation.icon}</span>
        {investigation.title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.72)",
          fontSize: 14,
          lineHeight: 1.55,
          maxWidth: 760,
        }}
      >
        {investigation.summary}
      </p>
    </div>
  );
}

function ReasoningCard({
  investigation,
}: {
  investigation: ReturnType<typeof deriveInvestigation>;
}) {
  return (
    <div style={darkPanelStyle}>
      <div style={darkEyebrowStyle}>How I reached this conclusion</div>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {investigation.reasoning.map((signal) => (
          <div
            key={signal.label}
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
              color: signal.detected
                ? "rgba(255,255,255,0.86)"
                : "rgba(255,255,255,0.34)",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <span>{signal.detected ? "✓" : "—"}</span>
            <span>{signal.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NarrativeCard({
  title,
  body,
  highlighted = false,
}: {
  title: string;
  body: string;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        ...darkPanelStyle,
        border: highlighted
          ? "1px solid rgba(147,197,253,0.28)"
          : darkPanelStyle.border,
        background: highlighted
          ? "rgba(37,99,235,0.10)"
          : darkPanelStyle.background,
      }}
    >
      <div style={darkEyebrowStyle}>{title}</div>

      <p
        style={{
          margin: "9px 0 0",
          color: highlighted ? "#bfdbfe" : "rgba(255,255,255,0.74)",
          fontSize: 13.5,
          lineHeight: 1.55,
          fontWeight: highlighted ? 700 : 500,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function EvidenceList({
  result,
}: {
  result: ReturnType<typeof validateTargetTable>;
}) {
  const topFindings = result.findings.slice(0, 5);

  return (
    <div style={darkPanelStyle}>
      <div style={darkEyebrowStyle}>Evidence</div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {topFindings.length ? (
          topFindings.map((finding, index) => (
            <EvidenceCard
              key={`${"kind" in finding ? finding.kind : "finding"}-${index}`}
              finding={finding}
            />
          ))
        ) : (
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.58)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            No analyzer findings were produced for this table.
          </p>
        )}
      </div>
    </div>
  );
}

function EvidenceCard({
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
        : "Historical evidence detected";

  const description =
    "message" in finding && typeof finding.message === "string"
      ? finding.message
      : "description" in finding && typeof finding.description === "string"
        ? finding.description
        : "This evidence can affect historical reporting correctness.";

  const recommendation =
    "recommendation" in finding && typeof finding.recommendation === "string"
      ? finding.recommendation
      : "";

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

      {recommendation ? (
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
      ) : null}
    </div>
  );
}

function TechnicalDetails({
  result,
}: {
  result: ReturnType<typeof validateTargetTable>;
}) {
  return (
    <details style={darkPanelStyle}>
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 900,
          color: "#ffffff",
          fontSize: 13,
        }}
      >
        Technical details
      </summary>

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
        <Meta label="Findings" value={String(result.findings.length)} />
        <Meta
          label="Business key"
          value={result.detectedColumns.businessKey ?? "not detected"}
        />
        <Meta
          label="Valid time"
          value={
            result.detectedColumns.validFrom && result.detectedColumns.validTo
              ? `${result.detectedColumns.validFrom} → ${result.detectedColumns.validTo}`
              : "not detected"
          }
        />
        <Meta
          label="Visible time"
          value={
            result.detectedColumns.visibleFrom &&
            result.detectedColumns.visibleTo
              ? `${result.detectedColumns.visibleFrom} → ${result.detectedColumns.visibleTo}`
              : "not detected"
          }
        />
        <Meta
          label="Snapshot"
          value={result.detectedColumns.snapshotDate ?? "not detected"}
        />
      </dl>
    </details>
  );
}

function SampleTablePreview({
  selectedScenario,
}: {
  selectedScenario: SampleScenarioId | null;
}) {
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
        rows={[
          [
            "C-1001",
            "2024-01-31",
            "100",
            "2024-01-01",
            "9999-12-31",
            "published",
          ],
          [
            "C-1001",
            "2024-01-31",
            "120",
            "2024-01-15",
            "9999-12-31",
            "rebuild",
          ],
          [
            "C-1002",
            "2024-01-31",
            "80",
            "2024-01-01",
            "9999-12-31",
            "published",
          ],
        ]}
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

function ContinueWithOwnData({
  showUpload,
  input,
  onStart,
  onInputChange,
  onFileUpload,
  onRun,
}: {
  showUpload: boolean;
  input: string;
  onStart: () => void;
  onInputChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
  onRun: () => void;
}) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 22,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #dbeafe",
      }}
    >
      <div style={blueEyebrowStyle}>Continue your investigation</div>

      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 26,
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          color: "#0f172a",
        }}
      >
        Run this investigation on your own historical table
      </h3>

      <p
        style={{
          margin: "0 0 16px",
          maxWidth: 720,
          color: "#475569",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        The sample investigation is complete. Now upload your own CSV and
        investigate your own historical reporting output.
      </p>

      {!showUpload ? (
        <button
          type="button"
          onClick={onStart}
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Upload my own CSV
        </button>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <UploadArea
            input={input}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
          />

          <button
            type="button"
            onClick={onRun}
            disabled={!input.trim()}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: input.trim() ? "#2563eb" : "#94a3b8",
              color: "#ffffff",
              fontWeight: 900,
              cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            Investigate my CSV
          </button>
        </div>
      )}
    </section>
  );
}

function ScenarioPicker({
  selectedScenario,
  onSelect,
}: {
  selectedScenario: keyof typeof SAMPLE_SCENARIOS;
  onSelect: (scenarioId: keyof typeof SAMPLE_SCENARIOS) => void;
}) {
  return (
    <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
      <div style={blueEyebrowStyle}>Choose a sample investigation</div>

      {Object.values(SAMPLE_SCENARIOS).map((scenario) => {
        const active = scenario.id === selectedScenario;

        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            style={{
              textAlign: "left",
              borderRadius: 14,
              padding: 16,
              border: active ? "2px solid #2563eb" : "1px solid #e2e8f0",
              background: active ? "#eff6ff" : "#ffffff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{scenario.icon}</div>
            <strong>{scenario.title}</strong>
          </button>
        );
      })}
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
