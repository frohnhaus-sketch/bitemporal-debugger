"use client";

import { useState } from "react";
import { parseCSV } from "../lib/parser";
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
import { Analytics } from "@vercel/analytics/next"

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
  const [selectedIssue, setSelectedIssue] = useState<JoinabilityIssue | null>(null);

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

  const availableSources = Array.from(
    new Set(rows.map((r) => r.source).filter(Boolean))
  );

  const minDate = rows.length
    ? Math.min(...rows.map((r) => new Date(r.valid_from).getTime()))
    : 0;

  const maxDate = rows.length
    ? Math.max(...rows.map((r) => new Date(r.valid_to).getTime()))
    : 1;

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

  function analyzeRows(
    rawInput: string,
    nextValidationMode = validationMode,
    nextSourceA = sourceA,
    nextSourceB = sourceB
  ) {
    const parsedRows = parseCSV(rawInput) as BitemporalRow[];
    const sources = Array.from(
      new Set(parsedRows.map((r) => r.source).filter(Boolean))
    );

    const left = nextSourceA || sources[0] || "";
    const right = nextSourceB || sources[1] || "";

    setRows(parsedRows);
    setSourceA(left);
    setSourceB(right);

    setResult(detectOverlaps(parsedRows, nextValidationMode));
    setGaps(detectGaps(parsedRows));
    setDrifts(detectDrift(parsedRows));
    setOverlapMarkers(detectOverlapMarkers(parsedRows, nextValidationMode));
    setFlaggedRows(detectFlaggedOverlapRows(parsedRows, nextValidationMode));
    setSelectedIssue(null);

    if (left && right) {
      setJoinIssues(analyzeJoinability(parsedRows, left, right));
    } else {
      setJoinIssues([]);
    }
  }

  function analyze() {
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
        `'${visibleAsOf}' >= visible_from AND '${visibleAsOf}' < COALESCE(visible_to, '9999-12-31')`
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
          Why is this JOIN wrong?
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: 8 }}>
          Paste your query result → see exactly why your joins are broken
        </p>

        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          Works with Databricks, Snowflake, BigQuery (CSV / TSV copy & paste)
        </p>

        <button
          onClick={() => {
            setInput(EXAMPLE_DATA);
            analyzeRows(EXAMPLE_DATA);
          }}
          style={{
            margin: "10px 0 20px",
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

          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Expected columns: source, entity_id, value, valid_from, valid_to,
            visible_from, visible_to
          </p>

          <div
            style={{
              marginTop: 15,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
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
              <label style={{ fontSize: 12 }}>Validation Mode</label>
              <br />
              <select
                value={validationMode}
                onChange={(e) => {
                  const next = e.target.value as ValidationMode;
                  setValidationMode(next);
                  if (input.trim()) analyzeRows(input, next);
                }}
              >
                <option value="monotemporal">Valid time only</option>
                <option value="bitemporal">Valid + visible time</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Source A</label>
              <br />
              <select
                value={sourceA}
                onChange={(e) => {
                  const next = e.target.value;
                  setSourceA(next);
                  if (input.trim()) analyzeRows(input, validationMode, next, sourceB);
                }}
              >
                <option value="">Auto</option>
                {availableSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Source B</label>
              <br />
              <select
                value={sourceB}
                onChange={(e) => {
                  const next = e.target.value;
                  setSourceB(next);
                  if (input.trim()) analyzeRows(input, validationMode, sourceA, next);
                }}
              >
                <option value="">Auto</option>
                {availableSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Filters rows by valid time.
              </p>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Visible As-of Timestamp</label>
              <br />
              <input
                type="datetime-local"
                value={visibleAsOf || ""}
                onChange={(e) => setVisibleAsOf(e.target.value || "")}
              />
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Filters rows by visible/system time.
              </p>
            </div>

            <button
              onClick={() => {
                setAsOfDate("");
                setVisibleAsOf("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #475569",
                background: "#1e293b",
                color: "#e2e8f0",
                cursor: "pointer",
              }}
            >
              Reset Dates
            </button>

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

        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
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
            <h3 style={{ marginBottom: 12, fontSize: 18 }}>Errors</h3>

            {result.length > 0 ? (
              result.map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    background: e.includes("OVERLAP") ? "#fee2e2" : "#fef3c7",
                    border: e.includes("OVERLAP")
                      ? "1px solid #ef4444"
                      : "1px solid #f59e0b",
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
                    onClick={() => setSelectedIssue(j)}
                    style={{
                      cursor: "pointer",
                      padding: 10,
                      marginBottom: 8,
                      borderRadius: 8,
                      background: j.type === "JOIN_GAP" ? "#fee2e2" : "#fef3c7",
                      border:
                        selectedIssue === j
                          ? "2px solid #0f172a"
                          : j.type === "JOIN_GAP"
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
                    Reason:{" "}
                    {j.reason === "NO_VISIBLE_OVERLAP"
                      ? "No visible-time overlap"
                      : j.reason === "NO_VALID_MATCH"
                      ? "No valid-time match"
                      : "Multiple matches"}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              background: "#ffffff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              color: "#0f172a",
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
                whiteSpace: "pre-wrap",
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

            {selectedIssue && (
              <div
                style={{
                  marginTop: 20,
                  background: "#f1f5f9",
                  border: "1px solid #cbd5f5",
                  borderRadius: 12,
                  padding: 20,
                }}
              >

                <h3 style={{ marginTop: 0 }}>
                  Why does this JOIN fail?
                </h3>

                <p style={{ fontWeight: "bold", marginBottom: 10 }}>
                  This row cannot be joined cleanly to the other source.
                </p>

                <p>
                  Visible time:
                  <br />
                  {selectedIssue.visible_from?.slice(0, 10)} →{" "}
                  {selectedIssue.visible_to?.slice(0, 10) || "∞"}
                </p>

                {selectedIssue.type === "JOIN_GAP" && (
                  <>
                    <p>No matching row exists in the other data source.</p>

                    {selectedIssue.reason === "NO_VISIBLE_OVERLAP" && (
                      <>
                        <p>
                          The records do not overlap in visible/system time.
                        </p>
                    
                        <p>
                          Contract visible until:{" "}
                          {selectedIssue.visible_to?.slice(0, 10)}
                          <br />
                          Object visible from:{" "}
                          {selectedIssue.visible_from?.slice(0, 10)}
                        </p>
                    
                        <p>
                          → They never exist at the same time
                        </p>
                    
                        <p>
                          → The JOIN returns no rows
                        </p>
                      </>
                    )}

                    {selectedIssue.reason === "NO_VALID_MATCH" && (
                      <>
                        <p>
                          No row in the other source overlaps in valid time.
                        </p>
                        <p>→ There is no matching business-time record.</p>
                      </>
                    )}
                  </>
                )}

                {selectedIssue.type === "JOIN_AMBIGUITY" && (
                  <>
                    <p>Multiple matching rows were found.</p>
                    <p>→ The JOIN result is ambiguous.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          Joinability checks compare records with the same entity_id across
          source A and source B.
        </p>

        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: -4,
            marginBottom: 12,
          }}
        >
          Each bar is one input row on the valid-time axis. Join issues are
          shown on the source A row.
        </p>

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

        <TimelineLegend />

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