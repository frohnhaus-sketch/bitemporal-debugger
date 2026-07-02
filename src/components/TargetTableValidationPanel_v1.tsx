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
import { LandingSection } from "@/components/target-validation/LandingSection";
import { ReportActions } from "@/components/target-validation/ReportActions";
import { UploadArea } from "@/components/target-validation/UploadArea";

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
  const [sampleStartToken] = useState(0);
  const [input, setInput] = useState("");
  const [flowState, setFlowState] = useState<FlowState>("landing");
  const [showOwnTableUpload, setShowOwnTableUpload] = useState(false);
  const [ownTableDraft, setOwnTableDraft] = useState("");
  const [uploadDraft, setUploadDraft] = useState("");
  const [selectedScenario, setSelectedScenario] =
    useState<SampleScenarioId>("revenue_rebuild");

  const resultRef = useRef<HTMLDivElement | null>(null);
  const investigationStartedAt = useRef<number | null>(null);

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

  function runInvestigation(
    scenarioId: keyof typeof SAMPLE_SCENARIOS,
    sampleInput: string,
  ) {
    investigationStartedAt.current = performance.now();
    setSelectedScenario(scenarioId);
    setInput(sampleInput);
    setFlowState("report");

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    onInvestigationCompleted?.();
  }

  function handleOwnTableSelected() {
    track("landing_cta_clicked", {
      cta: "own_table",
    });
    if (result) {
      setShowOwnTableUpload(true);
    } else {
      setInput("");
      setUploadDraft("");
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

    setUploadDraft(text);
    setOwnTableDraft(text);

    track("target_validation_file_uploaded", {
      fileName: file.name,
      fileSize: file.size,
      inputLength: text.length,
    });
  }

  function runUploadedTable() {
    investigationStartedAt.current = performance.now();
    if (!uploadDraft.trim()) return;

    setFlowState("upload");
    setInput(uploadDraft);

    sessionStorage.setItem("target_validation_scroll_to_result", "true");

    track("target_validation_own_table_started", {
      inputLength: uploadDraft.length,
      source: "direct_upload",
    });
  }

  function runOwnTableFromPaste() {
    investigationStartedAt.current = performance.now();
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
      durationMs: investigationStartedAt.current
        ? Math.round(performance.now() - investigationStartedAt.current)
        : null,
      flowState,
      source: flowState === "report" ? "sample" : "own_table",
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

    track("investigation_report_viewed", {
      source: flowState === "report" ? "sample" : "own_table",
      scenario: flowState === "report" ? selectedScenario : null,
    });

    if (!shouldScroll) return;

    window.setTimeout(() => {
      const element = resultRef.current;

      if (!element) return;

      const top = element.getBoundingClientRect().top + window.scrollY - 2;

      window.scrollTo({
        top,
        behavior: "smooth",
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
          <LandingSection
            Hero={Hero}
            ScenarioPicker={ScenarioPicker}
            ChoiceCard={ChoiceCard}
            sampleScenario={SAMPLE_SCENARIOS["revenue_rebuild"]}
            selectedScenario={selectedScenario}
            sampleStartToken={sampleStartToken}
            onScenarioSelected={(scenarioId) => {
              track("landing_cta_clicked", {
                cta: scenarioId,
              });

              setSelectedScenario(scenarioId);

              runInvestigation(scenarioId, SAMPLE_SCENARIOS[scenarioId].csv);
            }}
            onRunGuidedInvestigation={() => {
              track("landing_cta_clicked", {
                cta: "guided",
              });

              runInvestigation(
                "revenue_rebuild",
                SAMPLE_SCENARIOS["revenue_rebuild"].csv,
              );
            }}
            onOwnTable={handleOwnTableSelected}
          />
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

            <section
              style={{
                marginTop: 22,
                maxWidth: 900,
              }}
            >
              <div style={blueEyebrowStyle}>Your data</div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 30,
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                }}
              >
                Analyze your own historical table
              </h2>

              <p
                style={{
                  margin: "0 0 22px",
                  color: "#475569",
                  fontSize: 15,
                  lineHeight: 1.6,
                  maxWidth: 720,
                }}
              >
                Paste the output of a SQL query, notebook, dbt model, Excel
                export or CSV file. We'll automatically detect the historical
                structure and look for reproducibility risks, temporal
                inconsistencies and reporting problems.
              </p>

              <UploadArea
                input={uploadDraft}
                onInputChange={setUploadDraft}
                onFileUpload={handleFileUpload}
                onRun={runUploadedTable}
                runLabel="Run investigation"
              />
            </section>
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

            {flowState === "upload" && (
              <details
                className="no-print"
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 900 }}>
                  Analyzed input table
                </summary>

                <pre
                  style={{
                    marginTop: 12,
                    maxHeight: 320,
                    overflow: "auto",
                    padding: 12,
                    borderRadius: 12,
                    background: "#020617",
                    color: "#e2e8f0",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {input}
                </pre>
              </details>
            )}

            <ReportActions
              isSampleReport={flowState === "report"}
              showOwnTableUpload={showOwnTableUpload}
              ownTableDraft={ownTableDraft}
              onStartOwnTable={handleOwnTableSelected}
              onOwnTableDraftChange={setOwnTableDraft}
              onFileUpload={handleFileUpload}
              onRunOwnTable={runOwnTableFromPaste}
              onRunAnother={resetInvestigation}
              UploadArea={UploadArea}
            />
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
  badge,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  active: boolean;
  primary?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      {eyebrow && (
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
      )}

      <h3 style={{ margin: "0 0 7px", fontSize: 18 }}>{title}</h3>

      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            marginBottom: 12,
            borderRadius: 999,
            background: "#ecfdf5",
            color: "#166534",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          ⭐ {badge}
        </div>
      )}

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

function ScenarioPicker({
  selectedScenario,
  onSelect,
}: {
  selectedScenario: SampleScenarioId;
  onSelect: (scenarioId: SampleScenarioId) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
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
              padding: "13px 16px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{scenario.icon}</div>
            <strong>{scenario.title}</strong>
          </button>
        );
      })}
    </div>
  );
}

const blueEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};
