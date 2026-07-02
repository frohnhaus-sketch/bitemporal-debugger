"use client";

import { SampleInvestigation } from "@/components/SampleInvestigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { analyzeTargetTable } from "@/lib/targetTableValidator";
import { track } from "@/lib/analytics";
import type { HistoricalSemantics } from "@/lib/types";
import { AnalyzerResultScreenV2 } from "@/analyzer/AnalyzerResultScreenV2";
import { UploadArea } from "@/components/target-validation/UploadArea";

type FlowState = "start" | "upload" | "result";

type SampleScenarioId =
  | "revenue_rebuild"
  | "customer_missing"
  | "duplicate_snapshot";

type SampleScenario = {
  id: SampleScenarioId;
  title: string;
  icon: string;
  description: string;
  csv: string;
  rows: Record<string, string>[];
};

const SAMPLE_SCENARIOS: Record<SampleScenarioId, SampleScenario> = {
  revenue_rebuild: {
    id: "revenue_rebuild",
    title: "Revenue changed after rebuild",
    icon: "💰",
    description:
      "A corrected historical row overlaps a previously published state.",
    rows: [],
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
      "A customer is missing because no row covers the reporting date.",
    rows: [],
    csv: `customer_id,snapshot_date,status,valid_from,valid_to
C-204,2024-03-31,ACTIVE,2024-01-01,2024-03-15
C-205,2024-03-31,ACTIVE,2024-01-01,9999-12-31`,
  },
  duplicate_snapshot: {
    id: "duplicate_snapshot",
    title: "Duplicate snapshot records",
    icon: "📅",
    description: "The same business key appears twice for one snapshot date.",
    rows: [],
    csv: `contract_id,snapshot_date,premium
C-301,2024-05-31,250
C-301,2024-05-31,250`,
  },
};

type Props = {
  onInvestigationCompleted?: () => void;
};

export function TargetTableValidationPanel({
  onInvestigationCompleted,
}: Props) {
  const [flowState, setFlowState] = useState<FlowState>("start");
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedScenario, setSelectedScenario] =
    useState<SampleScenarioId>("revenue_rebuild");
  const [sampleStartToken, setSampleStartToken] = useState(0);

  const [validIntervalEnd, setValidIntervalEnd] = useState<
    "exclusive" | "inclusive"
  >("exclusive");

  const [visibleIntervalEnd, setVisibleIntervalEnd] = useState<
    "exclusive" | "inclusive"
  >("exclusive");

  const [temporalModel, setTemporalModel] = useState<
    "valid_time" | "bitemporal" | "tritemporal_unknown"
  >("valid_time");

  const resultRef = useRef<HTMLDivElement | null>(null);
  const investigationStartedAt = useRef<number | null>(null);

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

  function runGuidedInvestigation() {
    setSampleStartToken((x) => x + 1);
  }

  function runSample(scenarioId: SampleScenarioId) {
    const scenario = SAMPLE_SCENARIOS[scenarioId];

    investigationStartedAt.current = performance.now();
    setSelectedScenario(scenarioId);
    setInput(scenario.csv);
    setDraft("");
    setFlowState("result");

    track("sample_investigation_started", {
      scenario: scenarioId,
    });

    onInvestigationCompleted?.();
  }

  function startUpload() {
    setInput("");
    setDraft("");
    setFlowState("upload");

    track("own_table_upload_started", {
      source: "target_table_validation",
    });
  }

  function runUpload() {
    if (!draft.trim()) return;

    investigationStartedAt.current = performance.now();
    setInput(draft);
    setFlowState("result");

    track("own_table_investigation_started", {
      inputLength: draft.length,
    });

    onInvestigationCompleted?.();
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    const text = await file.text();
    setDraft(text);

    track("target_validation_file_uploaded", {
      fileName: file.name,
      fileSize: file.size,
      inputLength: text.length,
    });
  }

  function reset() {
    setInput("");
    setDraft("");
    setSelectedScenario("revenue_rebuild");
    setFlowState("start");

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

  useEffect(() => {
    const prefill = localStorage.getItem("target_validation_prefill");
    const prefillName = localStorage.getItem("target_validation_prefill_name");

    if (!prefill) return;

    investigationStartedAt.current = performance.now();
    setDraft(prefill);
    setInput(prefill);
    setFlowState("result");

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
      source:
        selectedScenario && input === SAMPLE_SCENARIOS[selectedScenario].csv
          ? "sample"
          : "own_table",
      scenario: selectedScenario,
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

    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }, [result, input, selectedScenario]);

  return (
    <section id="target-table-validation" style={shellStyle}>
      <div style={innerStyle}>
        {flowState !== "result" && (
          <>
            <Hero />

            {flowState === "start" && (
              <>
                <div style={{ marginTop: 18 }}>
                  <SampleInvestigation
                    scenario={SAMPLE_SCENARIOS[selectedScenario]}
                    startSignal={sampleStartToken}
                    onRunInvestigation={() => runSample(selectedScenario)}
                  />
                </div>

                <section style={choiceGridStyle}>
                  <div style={primaryCardStyle}>
                    <div style={eyebrowStyle}>
                      Or choose another sample investigation
                    </div>

                    <div style={scenarioGridStyle}>
                      {Object.values(SAMPLE_SCENARIOS).map((scenario) => (
                        <button
                          key={scenario.id}
                          type="button"
                          onClick={() => setSelectedScenario(scenario.id)}
                          style={scenarioButtonStyle}
                        >
                          <span style={{ fontSize: 22 }}>{scenario.icon}</span>

                          <span style={scenarioTextStyle}>
                            <strong>{scenario.title}</strong>
                            <span>{scenario.description}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={primaryCardStyle}>
                    <div style={eyebrowStyle}>Or use your own data</div>

                    <h3 style={cardTitleStyle}>Analyze your own table</h3>

                    <p style={cardTextStyle}>
                      Paste or upload a CSV output from a notebook, dbt model or
                      pipeline. Analysis runs in your browser; nothing is
                      stored.
                    </p>

                    <button
                      type="button"
                      onClick={startUpload}
                      style={{
                        ...darkButtonStyle,
                        width: "100%",
                        marginTop: 8,
                      }}
                    >
                      Upload your own CSV
                    </button>
                  </div>
                </section>
              </>
            )}
            {flowState === "upload" && (
              <section style={uploadSectionStyle}>
                <div style={eyebrowStyle}>Your data</div>
                <h3 style={cardTitleStyle}>
                  Analyze your own historical table
                </h3>
                <p style={cardTextStyle}>
                  The debugger checks keys, validity intervals, snapshot signals
                  and historical consistency risks.
                </p>

                <UploadArea
                  input={draft}
                  onInputChange={setDraft}
                  onFileUpload={handleFileUpload}
                  onRun={runUpload}
                  runLabel="Run investigation"
                />

                <button
                  type="button"
                  onClick={reset}
                  style={secondaryButtonStyle}
                >
                  Back to start
                </button>
              </section>
            )}
          </>
        )}

        {analysis && (
          <div ref={resultRef} style={resultWrapperStyle}>
            <AnalyzerResultScreenV2
              result={analysis.result}
              ruleFacts={analysis.ruleFacts}
              showSampleTable={input === SAMPLE_SCENARIOS[selectedScenario].csv}
              validIntervalEnd={validIntervalEnd}
              visibleIntervalEnd={visibleIntervalEnd}
              temporalModel={temporalModel}
              onChangeValidIntervalEndAction={setValidIntervalEnd}
              onChangeVisibleIntervalEndAction={setVisibleIntervalEnd}
              onChangeTemporalModelAction={setTemporalModel}
            />
            {input === SAMPLE_SCENARIOS[selectedScenario].csv && (
              <section style={nextStepStyle}>
                <div>
                  <div style={eyebrowStyle}>Next step</div>

                  <h3 style={nextStepTitleStyle}>
                    Run this investigation on your own historical table
                  </h3>

                  <p style={cardTextStyle}>
                    Upload your own CSV and investigate your own historical
                    reporting output.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startUpload}
                  style={darkButtonStyle}
                >
                  Upload your own CSV
                </button>
              </section>
            )}
            <section style={nextStepStyle}>
              <div>
                <div style={eyebrowStyle}>Next step</div>
                <h3 style={nextStepTitleStyle}>
                  Want to investigate another table?
                </h3>
                <p style={cardTextStyle}>
                  Run another sample or upload your own historical output table.
                </p>
              </div>

              <div style={nextStepActionsStyle}>
                <button
                  type="button"
                  onClick={reset}
                  style={secondaryButtonStyle}
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={startUpload}
                  style={darkButtonStyle}
                >
                  Upload CSV
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      <style jsx global>{`
        #target-table-validation,
        #target-table-validation * {
          box-sizing: border-box;
          max-width: 100%;
        }

        #target-table-validation {
          overflow-x: hidden;
        }

        #target-table-validation pre,
        #target-table-validation code {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

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
    <header style={{ minWidth: 0 }}>
      <div style={eyebrowStyle}>HISTORICAL DATA TOOLKIT</div>

      <h2 style={heroTitleStyle}>Debug historical reporting.</h2>

      <p style={heroTextStyle}>
        Investigate unstable grains, missing coverage and reproducibility risks
        in historical target tables.
      </p>
    </header>
  );
}

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  scrollMarginTop: 10,
  background: "#ffffff",
  color: "#0f172a",
  padding: "clamp(16px, 4vw, 32px)",
  borderRadius: 20,
  marginBottom: 24,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e2e8f0",
};

const innerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1120,
  minWidth: 0,
  margin: "0 auto",
  overflow: "hidden",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
  overflowWrap: "break-word",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  maxWidth: 820,
  fontSize: "clamp(32px, 9vw, 54px)",
  lineHeight: 1.02,
  letterSpacing: "-0.055em",
  overflowWrap: "break-word",
};

const heroTextStyle: CSSProperties = {
  maxWidth: 760,
  color: "#475569",
  fontSize: "clamp(15px, 4vw, 17px)",
  lineHeight: 1.55,
  margin: "12px 0 0",
  overflowWrap: "break-word",
};

const choiceGridStyle: CSSProperties = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 16,
  minWidth: 0,
};

const primaryCardStyle: CSSProperties = {
  padding: "clamp(18px, 4vw, 24px)",
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #dbeafe",
  minWidth: 0,
  overflow: "hidden",
};

const secondaryCardStyle: CSSProperties = {
  padding: "clamp(18px, 4vw, 24px)",
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  minWidth: 0,
  overflow: "hidden",
};

const cardTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(22px, 6vw, 28px)",
  lineHeight: 1.12,
  letterSpacing: "-0.04em",
  color: "#0f172a",
  overflowWrap: "break-word",
};

const cardTextStyle: CSSProperties = {
  margin: "0 0 16px",
  color: "#475569",
  fontSize: 15,
  lineHeight: 1.55,
  overflowWrap: "break-word",
};

const scenarioGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  minWidth: 0,
};

const scenarioButtonStyle: CSSProperties = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr)",
  gap: 12,
  textAlign: "left",
  borderRadius: 14,
  padding: 14,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
  cursor: "pointer",
  minWidth: 0,
};

const scenarioTextStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
  fontSize: 14,
  lineHeight: 1.4,
  color: "#475569",
  overflowWrap: "break-word",
};

const uploadSectionStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 820,
  minWidth: 0,
};

const resultWrapperStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
};

const nextStepStyle: CSSProperties = {
  marginTop: 18,
  padding: "clamp(18px, 4vw, 22px)",
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: 16,
  minWidth: 0,
};

const nextStepTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(21px, 6vw, 26px)",
  lineHeight: 1.15,
  letterSpacing: "-0.035em",
  color: "#0f172a",
  overflowWrap: "break-word",
};

const nextStepActionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  minWidth: 0,
};

const darkButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 14,
  overflowWrap: "break-word",
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 14,
  overflowWrap: "break-word",
};
