"use client";

import { useState } from "react";
import { parseCSV } from "../lib/parser";
import { Timeline } from "@/components/Timeline";
import { analyzeJoinability } from "../lib/joinability";
import type { BitemporalRow, JoinabilityIssue, OverlapIssue } from "../lib/types";
import {
  detectDrift,
  detectOverlaps,
  detectGaps,
  detectFlaggedOverlapRows,
  detectOverlapMarkers,
} from "../lib/analysis";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [rows, setRows] = useState<BitemporalRow[]>([]);
  const [joinIssues, setJoinIssues] = useState<JoinabilityIssue[]>([]);
  const [flaggedRows, setFlaggedRows] = useState<Set<number>>(new Set());
  const [gaps, setGaps] = useState<any[]>([]);
  const [asOfDate, setAsOfDate] = useState("");
  const [visibleAsOf, setVisibleAsOf] = useState("");
  const [sql, setSql] = useState("");
  const [drifts, setDrifts] = useState<string[]>([]);
  const [overlapMarkers, setOverlapMarkers] = useState<OverlapIssue[]>([]);

  function getPosition(date: string) {
    const current = new Date(date).getTime();
    return ((current - minDate) / (maxDate - minDate)) * 100;
  }

  function getWidth(from: string, to: string) {
    return getPosition(to) - getPosition(from);
  }

  function getSourceColor(source: string) {
    if (source === "contract") return "#2563eb";
    if (source === "object") return "#16a34a";
    return "#64748b";
  }

  function analyze() {
    const parsedRows = parseCSV(input) as BitemporalRow[];

    setRows(parsedRows);

    const overlapIssues = detectOverlaps(parsedRows);
    setResult(overlapIssues);

    const gapIssues = detectGaps(parsedRows);
    setGaps(gapIssues);

    const driftIssues = detectDrift(parsedRows);
    setDrifts(driftIssues);

    const joinabilityIssues = analyzeJoinability(
      parsedRows,
      "contract",
      "object"
    );

    const overlapMarkerIssues = detectOverlapMarkers(parsedRows);
    setOverlapMarkers(overlapMarkerIssues);

    const flagged = detectFlaggedOverlapRows(parsedRows);
    setFlaggedRows(flagged);
    
    setJoinIssues(joinabilityIssues);
  }

const filteredRows = rows.filter((r) => {
  const validOk = asOfDate
    ? new Date(asOfDate) >= new Date(r.valid_from) &&
      new Date(asOfDate) <= new Date(r.valid_to)
    : true;

  const visibleOk = visibleAsOf
    ? new Date(visibleAsOf) >= new Date(r.visible_from) &&
      new Date(visibleAsOf) < new Date(r.visible_to || "9999-12-31T00:00:00")
    : true;

  return validOk && visibleOk;
});

  function generateSQL() {
    if (!asOfDate) {
      setSql("-- Please select an As-of Date first");
      return;
    }

  setSql(`SELECT * FROM your_table
    WHERE valid_from <= '${asOfDate}'
    AND valid_to > '${asOfDate}';`);
  }

  const minDate = Math.min(
    ...rows.map(r => new Date(r.valid_from).getTime())
  );

  const maxDate = Math.max(
    ...rows.map(r => new Date(r.valid_to).getTime())
  );

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

        {/* HEADER */}
        <h1>
          Why is this JOIN wrong?
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: 20 }}>
          Paste your query result → see exactly why your joins are broken
        </p>

        <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
          Works with Databricks, Snowflake, BigQuery (copy & paste)
        </p>

        <button
          onClick={() =>
            setInput(`source,entity_id,value,valid_from,valid_to,visible_from,visible_to
        contract,1,A,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-06-01T00:00:00
        object,1,X,2024-01-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00`)
          }
          style={{
            margin: "10px 0", // 👈 Abstand oben & unten
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          Load Example
        </button>

        {/* INPUT CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            border: "1px solid #1e293b",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <textarea
            style={{
              width: "100%",
              height: 150,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontFamily: "monospace",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="source,entity_id,value,valid_from,valid_to,visible_from,visible_to"
          />

          <div style={{ marginTop: 15, display: "flex", gap: 20 }}>
            <button
              onClick={analyze}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(59,130,246,0.4)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Analyze
            </button>

            <div>
              <label style={{ fontSize: 12 }}>Valid As-of Date</label>
              <br />
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Filters rows by valid time.
              </p>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Visible As-of Timestamp</label>
              <br />
              <input
                type="datetime-local"
                value={visibleAsOf}
                onChange={(e) => setVisibleAsOf(e.target.value)}
              />
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Filters rows by visible/system time.
              </p>
            </div>

            <button
              onClick={generateSQL}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "#1e293b",
                color: "white",
                border: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
            >
              Generate SQL
            </button>
          </div>
        </div>

        {/* GRID: ERRORS + SQL */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            
          {/* ERRORS */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #1e293b",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              color: "#0f172a",
            }}
          >
            <h3 style={{ marginBottom: 12, fontSize: 18 }}>
              Errors
            </h3>

            {result.length > 0 ? (
              result.map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    background: e.includes("OVERLAP") ? "#fee2e2" : "#fef3c7",
                    border: e.includes("OVERLAP") ? "1px solid #ef4444" : "1px solid #f59e0b",
                    color: "#111827",
                    fontFamily: "monospace",
                  }}
                >
                  {e}
                </div>
              ))
            ) : (
              <p>No errors</p>
            )}

          {drifts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4>Source Drift</h4>
          
              {drifts.map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    background: "#fef3c7",
                    border: "1px solid #f59e0b",
                    color: "#92400e",
                    fontFamily: "monospace",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}

          {joinIssues.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 10 }}>Joinability Issues</h4>
          
              {joinIssues.map((j, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    background: j.type === "JOIN_GAP" ? "#fee2e2" : "#fef3c7",
                    border:
                      j.type === "JOIN_GAP"
                        ? "1px solid #ef4444"
                        : "1px solid #f59e0b",
                    color: j.type === "JOIN_GAP" ? "#991b1b" : "#92400e",
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>{j.type}</strong>
                  <br />
                  {j.source} → {j.targetSource}
                  <br />
                  Entity: {j.entity_id}
                  <br />
                  Valid: {j.valid_from} → {j.valid_to}
                  <br />
                  Matches: {j.matchingRows}
                  <br />
                  Reason: {
                    j.reason === "NO_VISIBLE_OVERLAP"
                      ? "No visible-time overlap"
                      : j.reason === "NO_VALID_MATCH"
                      ? "No valid-time match"
                      : "Multiple matches"
                  }
                </div>
              ))}
            </div>
          )}
          </div>

          {/* SQL */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <h3>SQL</h3>

            <pre
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#111827",
                color: "#e5e7eb",
                border: "none",
                cursor: "pointer",
              }}
            >
              {sql || "No SQL generated yet"}
            </pre>

            <button
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#e2e8f0",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => {
                if (!sql) return;
                navigator.clipboard.writeText(sql);
              }}
            >
              Copy SQL
            </button>
          </div>
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
      />

      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        Built by{" "}
        <a
          href="https://www.linkedin.com/in/jakob-frohnhaus/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa",
            marginLeft: 4,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Jakob Frohnhaus
        </a>
        
        <div style={{ marginTop: 6 }}>
          Want this for your team? →{" "}
          <a
            href="https://www.linkedin.com/in/jakob-frohnhaus/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
            }}
          >
            Contact me
          </a>
        </div>
      </div>

      </div>
    </main>
  );
}