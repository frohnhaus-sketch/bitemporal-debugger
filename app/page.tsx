"use client";

import { useState } from "react";
import { parseCSV } from "../lib/parser";
import type { HeaderMapping } from "../lib/parser";
import { Timeline } from "@/components/Timeline";
import { analyzeJoinability } from "../lib/joinability";
import type {
  BitemporalRow,
  JoinabilityIssue,
  OverlapIssue,
  ValidationMode,
} from "../lib/types";
import {
  detectDrift,
  detectOverlaps,
  detectGaps,
  detectFlaggedOverlapRows,
  detectOverlapMarkers,
} from "../lib/analysis";
import { TimelineLegend } from "@/components/TimelineLegend";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { SqlPanel } from "@/components/SqlPanel";
import { IssuesPanel } from "@/components/IssuesPanel";
import { InputPanel } from "@/components/InputPanel";
import { track } from "@vercel/analytics";
import { DataPreview } from "@/components/DataPreview";

const EXAMPLE_DATA = `source,entity_id,value,valid_from,valid_to,visible_from,visible_to
contract,1,A,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
object,1,X,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
object,1,Y,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
contract,2,A,2024-01-01,2024-03-31,2024-01-01T00:00:00,9999-12-31T00:00:00
contract,2,B,2024-05-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
object,2,X,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
contract,3,A,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-06-01T00:00:00
object,3,X,2024-01-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00
contract,4,A,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
object,4,X,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
contract,5,A,2024-01-01,2024-06-30,2024-01-01T00:00:00,2024-04-01T00:00:00
contract,5,B,2024-05-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00
object,5,X,2024-01-01,2024-12-31,2024-01-02T12:00:00,9999-12-31T00:00:00`;

export default function Home() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<BitemporalRow[]>([]);
  const [result, setResult] = useState<string[]>([]);
  const [joinIssues, setJoinIssues] = useState<JoinabilityIssue[]>([]);
  const [selectedIssue, setSelectedIssue] =
    useState<JoinabilityIssue | null>(null);

  const [flaggedRows, setFlaggedRows] = useState<Set<number>>(new Set());
  const [gaps, setGaps] = useState<any[]>([]);
  const [drifts, setDrifts] = useState<string[]>([]);
  const [overlapMarkers, setOverlapMarkers] = useState<OverlapIssue[]>([]);

  const [asOfDate, setAsOfDate] = useState("");
  const [visibleAsOf, setVisibleAsOf] = useState("");
  const [sql, setSql] = useState("");

  const [validationMode, setValidationMode] =
    useState<ValidationMode>("monotemporal");

  const [sourceA, setSourceA] = useState("");
  const [sourceB, setSourceB] = useState("");

  const [headerMappings, setHeaderMappings] = useState<HeaderMapping[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const availableSources = Array.from(
    new Set(rows.map((r) => r.source).filter(Boolean))
  );

  const minDate = rows.length
    ? Math.min(...rows.map((r) => new Date(r.valid_from).getTime()))
    : 0;

  const maxDate = rows.length
    ? Math.max(...rows.map((r) => new Date(r.valid_to).getTime()))
    : 1;

  function loadExample() {
    track("Example Loaded");
    setInput(EXAMPLE_DATA);
    analyzeRows(EXAMPLE_DATA);
  }

  function setValidationModeAndAnalyze(next: ValidationMode) {
    setValidationMode(next);
    if (input.trim()) analyzeRows(input, next);
  }

  function setSourceAAndAnalyze(next: string) {
    setSourceA(next);
    if (input.trim()) analyzeRows(input, validationMode, next, sourceB);
  }

  function setSourceBAndAnalyze(next: string) {
    setSourceB(next);
    if (input.trim()) analyzeRows(input, validationMode, sourceA, next);
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
    return getPosition(to) - getPosition(from);
  }

  function getSourceColor(source: string) {
    if (source === sourceA) return "#2563eb";
    if (source === sourceB) return "#16a34a";
    return "#64748b";
  }

  function applyColumnMapping(
    rows: any[],
    mappings: { original: string; normalized: string }[],
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

  function analyzeRows(
    rawInput: string,
    nextValidationMode = validationMode,
    nextSourceA = sourceA,
    nextSourceB = sourceB,
    nextColumnMapping = columnMapping
  ) {
    const parsed = parseCSV(rawInput);

    const initialMapping: Record<string, string> = {};
    parsed.headerMappings.forEach((m) => {
      initialMapping[m.original] = m.normalized;
    });

    const activeMapping =
      Object.keys(nextColumnMapping).length > 0
        ? nextColumnMapping
        : initialMapping;

    const parsedRows = applyColumnMapping(
      parsed.rows,
      parsed.headerMappings,
      activeMapping
    ) as BitemporalRow[];

    setHeaderMappings(parsed.headerMappings);
    setColumnMapping(activeMapping);

    const sources = Array.from(
      new Set(parsedRows.map((r) => r.source).filter(Boolean))
    );

    const hasMultipleSources = sources.length >= 2;

    const validNextSourceA =
      nextSourceA && sources.includes(nextSourceA) ? nextSourceA : "";

    const validNextSourceB =
      nextSourceB && sources.includes(nextSourceB) ? nextSourceB : "";

    const left = hasMultipleSources ? validNextSourceA || sources[0] : "";

    const right = hasMultipleSources
      ? validNextSourceB || sources.find((s) => s !== left) || ""
      : "";

    setRows(parsedRows);
    setSourceA(left);
    setSourceB(right);

    setResult(detectOverlaps(parsedRows, nextValidationMode));
    setGaps(detectGaps(parsedRows));
    setDrifts(detectDrift(parsedRows));
    setOverlapMarkers(detectOverlapMarkers(parsedRows, nextValidationMode));
    setFlaggedRows(detectFlaggedOverlapRows(parsedRows, nextValidationMode));
    setSelectedIssue(null);

    if (left && right && left !== right) {
      setJoinIssues(analyzeJoinability(parsedRows, left, right));
    } else {
      setJoinIssues([]);
    }
  }

  function analyze() {
    track("Analyze Clicked");
    analyzeRows(input);
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 12, color: "#ffffff" }}>
          Why does this JOIN fail?
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: 8 }}>
          Paste your query result → click the broken row → see exactly why it
          fails
        </p>

        <p style={{ color: "#64748b", marginBottom: 4, marginTop: 8 }}>
          Example:
        </p>

        <pre
          style={{
            color: "#94a3b8",
            background: "#020617",
            padding: 10,
            borderRadius: 6,
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          {`CONTRACT_ID,START_DATE,END_DATE,CREATED_AT
1,2026-01-01,2026-12-31,2026-01-01T00:00:00`}
        </pre>

        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          Works with Databricks, Snowflake, BigQuery (CSV / TSV copy & paste)
        </p>
                  
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 20,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <InputPanel
              input={input}
              setInput={setInput}
              onAnalyze={analyze}
              onLoadExample={loadExample}
              validationMode={validationMode}
              setValidationModeAndAnalyze={setValidationModeAndAnalyze}
              sourceA={sourceA}
              sourceB={sourceB}
              availableSources={availableSources}
              setSourceAAndAnalyze={setSourceAAndAnalyze}
              setSourceBAndAnalyze={setSourceBAndAnalyze}
              asOfDate={asOfDate}
              setAsOfDate={setAsOfDate}
              visibleAsOf={visibleAsOf}
              setVisibleAsOf={setVisibleAsOf}
              resetDates={resetDates}
              generateSQL={generateSQL}
            />
          </div>
          
          {headerMappings.length > 0 && (
            <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 0,
              alignItems: "stretch",
            }}
            >
              <aside
                style={{
                  width: 200,
                  flexShrink: 0,
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <strong style={{ display: "block", marginBottom: 2 }}>
                  Column mapping
                </strong>
              
                <p
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  Adjust if needed
                </p>
                
                {headerMappings.map((m, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginBottom: 1,
                      }}
                    >
                      {m.original}
                    </div>
                    
                    <select
                      value={columnMapping[m.original] || m.normalized}
                      onChange={(e) => {
                        const nextMapping = {
                          ...columnMapping,
                          [m.original]: e.target.value,
                        };
                      
                        setColumnMapping(nextMapping);
                      
                        if (input.trim()) {
                          analyzeRows(
                            input,
                            validationMode,
                            sourceA,
                            sourceB,
                            nextMapping
                          );
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                      }}
                    >
                      <option value="entity_id">entity_id</option>
                      <option value="valid_from">valid_from</option>
                      <option value="valid_to">valid_to</option>
                      <option value="visible_from">visible_from</option>
                      <option value="visible_to">visible_to</option>
                      <option value="value">value</option>
                      <option value="source">source</option>
                      <option value="">ignore</option>
                    </select>
                  </div>
                ))}
              </aside>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <DataPreview
            rows={rows}
            joinIssues={joinIssues}
            onSelectIssue={setSelectedIssue}
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
          flaggedRows={flaggedRows}
          getPosition={getPosition}
          getWidth={getWidth}
          getSourceColor={getSourceColor}
          onSelectIssue={setSelectedIssue}
        />

        <TimelineLegend />
        <Footer />
      </div>

      <Analytics />
    </main>
  );
}