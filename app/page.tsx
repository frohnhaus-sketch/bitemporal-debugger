"use client";
import { track } from "@/lib/analytics";
import { TwoSourceInputPanel } from "@/components/TwoSourceInputPanel";
import { useState } from "react";
import { parseCSV } from "../lib/parser";
import type { HeaderMapping } from "../lib/parser";
import { Timeline } from "@/components/Timeline";
import { analyzeJoinability } from "../lib/joinability";
import type {
  BitemporalRow,
  AggregatedJoinabilityIssue,
  OverlapIssue,
  ValidationMode,
  DriftSummary,
  HighlightTarget,
} from "../lib/types";
import {
  detectDrift,
  detectOverlaps,
  detectGaps,
  detectOverlapMarkers,
} from "../lib/analysis";
import { TimelineLegend } from "@/components/TimelineLegend";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { SqlPanel } from "@/components/SqlPanel";
import { IssuesPanel } from "@/components/IssuesPanel";
import { DataPreview } from "@/components/DataPreview";

const EXAMPLE_A = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-06-01T00:00:00
2,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
3,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-01-01,2024-03-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-05-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

const EXAMPLE_B = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,object_active,2024-01-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00
2,object_active,2024-04-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
3,object_v1,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-12-31T00:00:00
3,object_v2,2024-01-01,2024-12-31,2025-01-01T00:00:00,9999-12-31T00:00:00
5,object_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

export default function Home() {
  const [expandedSources, setExpandedSources] = useState<string[]>([]);
  const [highlightedRow, setHighlightedRow] = useState<HighlightTarget | null>(null);
  const [headerMappingsA, setHeaderMappingsA] = useState<HeaderMapping[]>([]);
  const [headerMappingsB, setHeaderMappingsB] = useState<HeaderMapping[]>([]);
  const [columnMappingA, setColumnMappingA] = useState<Record<string, string>>({});
  const [columnMappingB, setColumnMappingB] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<BitemporalRow[]>([]);
  const [result, setResult] = useState<string[]>([]);
  const [joinIssues, setJoinIssues] = useState<AggregatedJoinabilityIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<AggregatedJoinabilityIssue | null>(null);
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [sourceNameA, setSourceNameA] = useState("source_a");
  const [sourceNameB, setSourceNameB] = useState("source_b");
  const [gaps, setGaps] = useState<any[]>([]);
  const [drifts, setDrifts] = useState<DriftSummary[]>([]);
  const [overlapMarkers, setOverlapMarkers] = useState<OverlapIssue[]>([]);
  const [asOfDate, setAsOfDate] = useState("");
  const [visibleAsOf, setVisibleAsOf] = useState("");
  const [sql, setSql] = useState("");
  const [validationMode, setValidationMode] = useState<ValidationMode>("monotemporal");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const minDate = rows.length
    ? Math.min(...rows.map((r) => new Date(r.valid_from).getTime()))
    : 0;
  const maxDate = rows.length
    ? Math.max(
        ...rows.map((r) => {
          const t = new Date(r.valid_to).getTime();
          return !String(r.valid_to).includes("T")
            ? t + 24 * 60 * 60 * 1000
            : t;
        })
      )
    : 1;

  function resetAnalysis() {
    setRows([]);
    setResult([]);
    setJoinIssues([]);
    setSelectedIssue(null);
    setGaps([]);
    setDrifts([]);
    setOverlapMarkers([]);
    setSql("");
    setHasAnalyzed(false);
  }

  function buildColumnMapping(
    mappings: HeaderMapping[],
    currentMapping: Record<string, string>
  ) {
    const nextMapping: Record<string, string> = {};

    mappings.forEach((m) => {
      nextMapping[m.original] = currentMapping[m.original] ?? m.normalized;
    });

    return nextMapping;
  }

  function updateMappingForSourceA(nextInputA = inputA) {
    if (!nextInputA.trim()) {
      setHeaderMappingsA([]);
      setColumnMappingA({});
      return;
    }

    const parsedA = parseCSV(nextInputA);
    setHeaderMappingsA(parsedA.headerMappings);
    setColumnMappingA(buildColumnMapping(parsedA.headerMappings, columnMappingA));
  }

  function updateMappingForSourceB(nextInputB = inputB) {
    if (!nextInputB.trim()) {
      setHeaderMappingsB([]);
      setColumnMappingB({});
      return;
    }

    const parsedB = parseCSV(nextInputB);
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingB(buildColumnMapping(parsedB.headerMappings, columnMappingB));
  }

  function updateMappingsFromInputs(nextInputA = inputA, nextInputB = inputB) {
    if (nextInputA.trim()) {
      const parsedA = parseCSV(nextInputA);
      setHeaderMappingsA(parsedA.headerMappings);
      setColumnMappingA(buildColumnMapping(parsedA.headerMappings, columnMappingA));
    } else {
      setHeaderMappingsA([]);
      setColumnMappingA({});
    }

    if (nextInputB.trim()) {
      const parsedB = parseCSV(nextInputB);
      setHeaderMappingsB(parsedB.headerMappings);
      setColumnMappingB(buildColumnMapping(parsedB.headerMappings, columnMappingB));
    } else {
      setHeaderMappingsB([]);
      setColumnMappingB({});
    }
  }

  function loadExample() {
    track("example_loaded", {
      type: "default_example"
    });

    setInputA(EXAMPLE_A);
    setInputB(EXAMPLE_B);
    setSourceNameA("contract");
    setSourceNameB("object");
    updateMappingsFromInputs(EXAMPLE_A, EXAMPLE_B);

    resetAnalysis();
  }

  function copySourceAToB() {
    track("copy_a_to_b");
    setInputB(inputA);
    updateMappingsFromInputs(inputA, inputA);
    resetAnalysis();
  }

  function applyColumnMapping(
    rows: any[],
    mappings: HeaderMapping[],
    activeMapping: Record<string, string>
  ) {
    return rows.map((row) => {
      const mappedRow: any = {};

      mappings.forEach((mapping) => {
        const targetColumn =
          activeMapping[mapping.original] ?? mapping.normalized;

        if (!targetColumn) return;

        mappedRow[targetColumn] = row[mapping.normalized];
      });

      if (!mappedRow.source) mappedRow.source = "default";
      if (!mappedRow.value) mappedRow.value = "";
      if (!mappedRow.visible_from) {
        mappedRow.visible_from = mappedRow.valid_from || "";
      }
      if (!mappedRow.visible_to) {
        mappedRow.visible_to = "9999-12-31T00:00:00";
      }

      return mappedRow;
    });
  }

  function parseOneSource(
    rawInput: string,
    sourceName: string,
    activeMapping: Record<string, string>
  ) {
    const parsed = parseCSV(rawInput);

    const initialMapping: Record<string, string> = {};
    parsed.headerMappings.forEach((m) => {
      initialMapping[m.original] = m.normalized;
    });

    const mappingToUse =
      Object.keys(activeMapping).length > 0 ? activeMapping : initialMapping;

    const mappedRows = applyColumnMapping(
      parsed.rows,
      parsed.headerMappings,
      mappingToUse
    ).map((row) => ({
      ...row,
      source: sourceName || "source",
    }));

    return {
      rows: mappedRows,
      headerMappings: parsed.headerMappings,
      mapping: mappingToUse,
    };
  }

  function analyzeTwoSourcesFromValues(
    rawA: string,
    rawB: string,
    sourceAName: string,
    sourceBName: string,
    mode: ValidationMode = validationMode
  ) {
    if (!rawA.trim() || !rawB.trim()) {
      resetAnalysis();
      return;
    }

    const parsedA = parseOneSource(
      rawA,
      sourceAName || "source_a",
      columnMappingA
    );

    const parsedB = parseOneSource(
      rawB,
      sourceBName || "source_b",
      columnMappingB
    );

    const combinedRows = [...parsedA.rows, ...parsedB.rows] as BitemporalRow[];

    setRows(combinedRows);
    setHeaderMappingsA(parsedA.headerMappings);
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingA(parsedA.mapping);
    setColumnMappingB(parsedB.mapping);

    setResult(detectOverlaps(combinedRows, mode));
    setGaps(detectGaps(combinedRows));
    setDrifts(detectDrift(combinedRows));
    setOverlapMarkers(detectOverlapMarkers(combinedRows, mode));
    setSelectedIssue(null);
    if (combinedRows.length > 0) {
      // beide Sources aufklappen
      setExpandedSources([sourceAName, sourceBName]);
    }

    const computedJoinIssues = analyzeJoinability(
      combinedRows,
      sourceAName,
      sourceBName,
      mode
    );

    track("analysis_completed", {
      rowCount: combinedRows.length,
      sourceA: sourceAName,
      sourceB: sourceBName,
      joinIssues: computedJoinIssues.length,
      joinGaps: computedJoinIssues.filter((i) => i.type === "JOIN_GAP").length,
      ambiguities: computedJoinIssues.filter((i) => i.type === "JOIN_AMBIGUITY").length,
      mode: validationMode,
    });

    setJoinIssues(computedJoinIssues);
    setHasAnalyzed(true);
  }

  function analyzeTwoSources() {
    track("analyze_clicked", {
      hasBothSources: !!inputA.trim() && !!inputB.trim(),
    });

    if (!inputA.trim() || !inputB.trim()) {
      resetAnalysis();
      return;
    }

    analyzeTwoSourcesFromValues(
      inputA,
      inputB,
      sourceNameA,
      sourceNameB,
      validationMode
    );
  }

  function setValidationModeAndAnalyze(next: ValidationMode) {
    setValidationMode(next);

    if (inputA.trim() && inputB.trim() && hasAnalyzed) {
      analyzeTwoSourcesFromValues(
        inputA,
        inputB,
        sourceNameA,
        sourceNameB,
        next
      );
    }
  }

  function resetDates() {
    setAsOfDate("");
    setVisibleAsOf("");
  }

  function getPosition(date: string) {
    const current = new Date(date).getTime();
    return ((current - minDate) / (maxDate - minDate)) * 100;
  }

  function getWidth(from: string, to: string) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();

    const isDateOnly = !to.includes("T");
    const adjustedToTime = isDateOnly
      ? toTime + 24 * 60 * 60 * 1000
      : toTime;

    return ((adjustedToTime - fromTime) / (maxDate - minDate)) * 100;
  }

  function getSourceColor(source: string) {
    return source === sourceNameA ? "#475569" : "#64748b";
  }

  const filteredRows = rows.filter((r) => {
    const validOk = asOfDate
      ? new Date(asOfDate) >= new Date(r.valid_from) &&
        new Date(asOfDate) <= new Date(r.valid_to)
      : true;

    const visibleOk = visibleAsOf
      ? new Date(visibleAsOf) >= new Date(r.visible_from) &&
        new Date(visibleAsOf) <
          new Date(r.visible_to || "9999-12-31T00:00:00")
      : true;

    return validOk && visibleOk;
  });

  function generateSQL() {
    track("sql_generated");
    const sqlParts: string[] = [];

    if (asOfDate) {
      sqlParts.push(`'${asOfDate}' BETWEEN valid_from AND valid_to`);
    }

    if (visibleAsOf) {
      sqlParts.push(
        `'${visibleAsOf}' >= visible_from AND '${visibleAsOf}' < visible_to`
      );
    }

    if (sqlParts.length === 0) {
      setSql("-- Please select at least one As-of filter");
      return;
    }

    setSql(`SELECT *
FROM your_table
WHERE ${sqlParts.join(" AND ")};`);
  }

  const joinGapCount = joinIssues.filter((i) => i.type === "JOIN_GAP").length;
  const joinAmbiguityCount = joinIssues.filter(
    (i) => i.type === "JOIN_AMBIGUITY"
  ).length;

  const validGapCount = gaps.length;
  const overlapCount = result.length;

  const hasCriticalIssues =
    overlapCount > 0 || joinGapCount > 0 || joinAmbiguityCount > 0;

  const totalIssueCount =
    joinGapCount + joinAmbiguityCount + validGapCount + overlapCount;

  const summaryStyle = hasCriticalIssues
    ? {
        background: "rgba(239, 68, 68, 0.15)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
      }
    : validGapCount > 0
    ? {
        background: "rgba(245, 158, 11, 0.16)",
        border: "1px solid rgba(245, 158, 11, 0.45)",
      }
    : {
        background: "rgba(34, 197, 94, 0.15)",
        border: "1px solid rgba(34, 197, 94, 0.4)",
      };

  const summaryTitle = hasCriticalIssues
    ? "❌ Your JOIN may return wrong or missing results"
    : validGapCount > 0
    ? `⚠️ ${validGapCount} valid-time gap${validGapCount === 1 ? "" : "s"} found`
    : "✅ No temporal issues found";
  
  const rootCause = joinIssues.find(
    (issue) => issue.type === "JOIN_GAP" && issue.isAggregated
  );

  const issueParts = [
    joinGapCount > 0
      ? `${joinGapCount} join gap${joinGapCount === 1 ? "" : "s"} = missing rows`
      : null,
    joinAmbiguityCount > 0
      ? `${joinAmbiguityCount} ambiguous match${
          joinAmbiguityCount === 1 ? "" : "es"
        } = duplicate rows`
      : null,
    overlapCount > 0
      ? `${overlapCount} overlap${overlapCount === 1 ? "" : "s"} = conflicting history`
      : null,
    validGapCount > 0
      ? `${validGapCount} valid-time gap${
          validGapCount === 1 ? "" : "s"
        } = incomplete history`
      : null,
  ].filter(Boolean);

  const summaryMessage = hasCriticalIssues
    ? `Detected: ${issueParts.join(" · ")}. Click an issue below to see the root cause and suggested fix.`
    : validGapCount > 0
    ? `There are ${validGapCount} missing valid-time periods. Your history is incomplete, which may affect join results.`
    : "No gaps, overlaps, or joinability issues detected. Your temporal data looks clean.";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
    <div style={{ maxWidth: 1150, margin: "0 auto" }}>
      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            background: "#020617",
            border: "1px solid #1e293b",
            color: "#93c5fd",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Temporal JOIN Debugger
        </div>
        
        <h1
          style={{
            margin: "0 0 12px",
            color: "#ffffff",
            fontSize: 38,
            lineHeight: 1.1,
            letterSpacing: -0.8,
          }}
        >
          Debug broken temporal JOINs in seconds.
        </h1>
        
        <p
          style={{
            color: "#cbd5e1",
            fontSize: 18,
            lineHeight: 1.5,
            maxWidth: 820,
            margin: "0 0 20px",
          }}
        >
          Paste two query results and instantly see why your JOIN returns missing,
          duplicated, or incorrect rows.
        </p>
        
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
          }}
        >        
          <span style={{ color: "#94a3b8", fontSize: 12, opacity: 0.7 }}>
            Works with Databricks, Snowflake, BigQuery · CSV / TSV copy & paste
          </span>
        </div>
          
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 10,
            marginBottom: -5,
          }}
        >
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 12,
            }}
          >
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Expected input
          </div>
          
          <pre
            style={{
              margin: 0,
              color: "#93c5fd",
              fontSize: 12,
              lineHeight: 1.5,
              overflowX: "auto",
            }}
          >{`entity_id,value,valid_from,valid_to[,visible_from,visible_to]
1,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`}</pre>

          <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
            visible_from and visible_to are optional. If omitted, data is treated as valid-time only.
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            Paste CSV or TSV. Column names are auto-detected and can be adjusted in the
            mapping section below.
          </p>
          </div>
            
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 12,
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                color: "#e2e8f0",
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              How time is interpreted
            </div>
            Valid-time uses inclusive date ranges{" "}
            <code>[valid_from, valid_to]</code>. Visible-time uses half-open
            timestamp ranges <code>[visible_from, visible_to)</code>.
          </div>
            
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 12,
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                color: "#e2e8f0",
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Data privacy
            </div>
            Processing happens locally in your browser. Data is not stored. Avoid
            pasting sensitive production data if unsure.
          </div>
        </div>
      </section>

        <TwoSourceInputPanel
          inputA={inputA}
          inputB={inputB}
          setInputA={(value) => {
            setInputA(value);
            if (!value.trim()) resetAnalysis();
            updateMappingForSourceA(value);
          }}
          setInputB={(value) => {
            setInputB(value);
            if (!value.trim()) resetAnalysis();
            updateMappingForSourceB(value);
          }}
          sourceNameA={sourceNameA}
          sourceNameB={sourceNameB}
          setSourceNameA={setSourceNameA}
          setSourceNameB={setSourceNameB}
          onAnalyze={analyzeTwoSources}
          onLoadExample={loadExample}
          onCopyAtoB={copySourceAToB}
          analysisModeControl={
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>
                Temporal validation mode
              </label>
              <br />
              <select
                value={validationMode}
                onChange={(e) =>
                  setValidationModeAndAnalyze(e.target.value as ValidationMode)
                }
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#020617",
                  color: "#e2e8f0",
                }}
              >
                <option value="monotemporal">Valid-time only (strict)</option>
                <option value="bitemporal">Bitemporal (valid + visible time)</option>
              </select>
            </div>
          }
          controls={
            <div
              style={{
                background: "#ffffff",
                padding: 12,
                borderRadius: 10,
                marginTop: 12,
                marginBottom: 12,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              {(headerMappingsA.length > 0 || headerMappingsB.length > 0) && (
                <div
                  style={{
                    width: "100%",
                    marginBottom: 12,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                    Column mapping
                  </div>
                
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 10,
                        background: "#020617",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
                        Source A mapping
                      </div>
                    
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {headerMappingsA.map((m, i) => (
                          <div key={`a-${m.original}-${i}`}>
                            <div style={{ fontSize: 10, color: "#64748b" }}>
                              {m.original}
                            </div>
                        
                            <select
                              value={columnMappingA[m.original] ?? m.normalized}
                              onChange={(e) => {
                                setColumnMappingA({
                                  ...columnMappingA,
                                  [m.original]: e.target.value,
                                });
                              }}
                              style={{
                                padding: "4px 6px",
                                borderRadius: 6,
                                border: "1px solid #334155",
                                background: "#020617",
                                color: "#e2e8f0",
                                fontSize: 12,
                              }}
                            >
                              <option value="entity_id">entity_id</option>
                              <option value="valid_from">valid_from</option>
                              <option value="valid_to">valid_to</option>
                              <option value="visible_from">visible_from</option>
                              <option value="visible_to">visible_to</option>
                              <option value="value">value</option>
                              <option value="">ignore</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                      
                    <div
                      style={{
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 10,
                        background: "#020617",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
                        Source B mapping
                      </div>
                    
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {headerMappingsB.map((m, i) => (
                          <div key={`b-${m.original}-${i}`}>
                            <div style={{ fontSize: 10, color: "#64748b" }}>
                              {m.original}
                            </div>
                        
                            <select
                              value={columnMappingB[m.original] ?? m.normalized}
                              onChange={(e) => {
                                setColumnMappingB({
                                  ...columnMappingB,
                                  [m.original]: e.target.value,
                                });
                              }}
                              style={{
                                padding: "4px 6px",
                                borderRadius: 6,
                                border: "1px solid #334155",
                                background: "#020617",
                                color: "#e2e8f0",
                                fontSize: 12,
                              }}
                            >
                              <option value="entity_id">entity_id</option>
                              <option value="valid_from">valid_from</option>
                              <option value="valid_to">valid_to</option>
                              <option value="visible_from">visible_from</option>
                              <option value="visible_to">visible_to</option>
                              <option value="value">value</option>
                              <option value="">ignore</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12 }}>Temporal validation mode</label>
                <br />
                <select
                  value={validationMode}
                  onChange={(e) =>
                    setValidationModeAndAnalyze(e.target.value as ValidationMode)
                  }
                >
                  <option value="monotemporal">Valid-time only — stricter for history</option>
                  <option value="bitemporal">Valid + visible time — bitemporal</option>
                </select>
              </div>
                
              <div>
                <label style={{ fontSize: 12 }}>Valid As-of Date</label>
                <br />
                <input
                  type="date"
                  value={asOfDate || ""}
                  onChange={(e) => setAsOfDate(e.target.value || "")}
                />
              </div>
                
              <div>
                <label style={{ fontSize: 12 }}>Visible As-of Timestamp</label>
                <br />
                <input
                  type="datetime-local"
                  value={visibleAsOf || ""}
                  onChange={(e) => setVisibleAsOf(e.target.value || "")}
                />
              </div>
                
              <button
                onClick={resetDates}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #475569",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Reset Dates
              </button>
              
              <button
                onClick={generateSQL}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #475569",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Generate SQL
              </button>
            </div>
          }
        />

        {hasAnalyzed && (
          <>
            <div
              style={{
                ...summaryStyle,
                color: "#ffffff",
                borderRadius: 12,
                padding: 18,
                marginBottom: 20,
              }}
            >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(15, 23, 42, 0.45)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              {validationMode === "bitemporal"
                ? "Valid + visible time analysis"
                : "Valid-time only analysis"}
            </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>
                {summaryTitle}
              </h2>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  color: "#ffffff",
                  opacity: 0.9,
                }}
              >
                {summaryMessage}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  fontSize: 14,
                }}
              >
                <span>{validGapCount} valid-time gaps</span>
                <span>{joinGapCount} join gaps</span>
                <span>{joinAmbiguityCount} ambiguous matches</span>
                <span>{overlapCount} overlaps</span>
              </div>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 13,
                  color: "#ffffff",
                  opacity: 0.82,
                  lineHeight: 1.5,
                }}
              >
                {validationMode === "bitemporal"
                  ? "True bitemporal mode: records are only flagged when they conflict in both valid-time and visible-time."
                  : "Valid-time only mode: stricter check. Records are flagged when they overlap in valid-time, even if they would be valid bitemporal history."}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 20,
              }}
            >
            <DataPreview
              title={`Source A: ${sourceNameA}`}
              rows={rows.filter((r) => r.source === sourceNameA)}
              joinIssues={joinIssues}
              onSelectIssue={setSelectedIssue}
              highlightedRow={highlightedRow}
              onHighlightRow={setHighlightedRow}
              forceOpen={expandedSources.includes(sourceNameA)}
              overlapMarkers={overlapMarkers}
            />
                        
            <DataPreview
              title={`Source B: ${sourceNameB}`}
              rows={rows.filter((r) => r.source === sourceNameB)}
              joinIssues={joinIssues}
              onSelectIssue={setSelectedIssue}
              highlightedRow={highlightedRow}
              onHighlightRow={setHighlightedRow}
              forceOpen={expandedSources.includes(sourceNameB)}
              overlapMarkers={overlapMarkers}
            />
            </div>

            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <IssuesPanel
                result={result}
                drifts={drifts}
                joinIssues={joinIssues}
                selectedIssue={selectedIssue}
                setSelectedIssue={setSelectedIssue}
              />

              <SqlPanel sql={sql} selectedIssue={selectedIssue} />
            </div>

            <Timeline
              rows={filteredRows}
              gaps={gaps}
              overlapMarkers={overlapMarkers}
              joinIssues={joinIssues}
              getPosition={getPosition}
              getWidth={getWidth}
              getSourceColor={getSourceColor}
              onSelectIssue={setSelectedIssue}
              highlightedEntityId={highlightedRow?.entity_id ?? null}
            />

            <TimelineLegend />
          </>
        )}

        <Footer />
      </div>

      <Analytics />
    </main>
  );
}