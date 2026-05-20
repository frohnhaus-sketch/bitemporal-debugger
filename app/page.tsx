"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [flaggedRows, setFlaggedRows] = useState<Set<number>>(new Set());
  const [gaps, setGaps] = useState<any[]>([]);
  const [asOfDate, setAsOfDate] = useState("");
  const [sql, setSql] = useState("");

  function parseCSV(text: string) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};

      headers.forEach((h, i) => {
        obj[h.trim()] = values[i]?.trim();
      });

      return obj;
    });
  }

  function getPosition(date: string) {
    const start = new Date("2024-01-01").getTime();
    const end = new Date("2024-12-31").getTime();
    const current = new Date(date).getTime();

    return ((current - start) / (end - start)) * 100;
  }

  function getWidth(from: string, to: string) {
    return getPosition(to) - getPosition(from);
  }

  function analyze() {
    const parsedRows = parseCSV(input);
    const gapList: any[] = [];

    const sortedRows = [...parsedRows].sort((a, b) => {
      if (a.entity_id !== b.entity_id) {
        return a.entity_id.localeCompare(b.entity_id);
      }
    
      return new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime();
    });

    setRows(sortedRows);

    const errors: string[] = [];

    const flagged = new Set<number>();

    for (let i = 1; i < sortedRows.length; i++) {
      const prev = sortedRows[i - 1];
      const curr = sortedRows[i];
    
      if (prev.entity_id === curr.entity_id) {
        const prevEnd = new Date(prev.valid_to);
        const currStart = new Date(curr.valid_from);
      
        if (currStart < prevEnd) {
          errors.push(
            `OVERLAP for ${curr.entity_id}: ${prev.valid_from}-${prev.valid_to} overlaps with ${curr.valid_from}-${curr.valid_to}`
          );
        
          flagged.add(i);
          flagged.add(i - 1);
        } else if (currStart > prevEnd) {
          errors.push(
            `GAP for ${curr.entity_id}: missing ${prev.valid_to} → ${curr.valid_from}`
          );
        
          gapList.push({
            entity_id: curr.entity_id,
            from: prev.valid_to,
            to: curr.valid_from,
          });
        }
      }
    }

    setResult(errors);
    setFlaggedRows(flagged);
    setGaps(gapList);
  }

  const filteredRows = asOfDate
    ? rows.filter(r => {
        const start = new Date(r.valid_from);
        const end = new Date(r.valid_to);
        const t = new Date(asOfDate);

        return t >= start && t <= end;
      })
    : rows;

  function generateSQL() {
    if (!asOfDate) {
      setSql("-- Please select an As-of Date first");
      return;
    }

    setSql(`SELECT *
  FROM your_table
  WHERE valid_from <= '${asOfDate}'
    AND valid_to > '${asOfDate}';`);
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

        {/* HEADER */}
        <h1 style={{ marginBottom: 20, color: "#ffffff" }}>
          Bitemporal Debugger
        </h1>

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
            placeholder="entity_id,value,valid_from,valid_to,visible_from,visible_to"
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
              <label style={{ fontSize: 12 }}>As-of Date</label>
              <br />
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
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

        {/* TIMELINE */}
        <div
          style={{
            background: "#ffffff",
            color: "#0f172a",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>
            Timeline
          </h3>
        
          {filteredRows.map((r, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 6 }}>
                <strong>{r.entity_id}</strong>
                <span style={{ marginLeft: 10, color: "#64748b", fontSize: 13 }}>
                  {r.valid_from} → {r.valid_to}
                </span>
              </div>
          
              <div
                style={{
                  height: 22,
                  background: "#334155",
                  borderRadius: 999,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  title={`${r.valid_from} → ${r.valid_to}`}
                  style={{
                    position: "absolute",
                    left: `${getPosition(r.valid_from)}%`,
                    width: `${getWidth(r.valid_from, r.valid_to)}%`,
                    height: "100%",
                    background: flaggedRows.has(i) ? "#ef4444" : "#2563eb",
                    borderRadius: 999,
                  }}
                />
        
                {gaps
                  .filter((g) => g.entity_id === r.entity_id)
                  .map((g, j) => (
                    <div
                      key={j}
                      title={`GAP: ${g.from} → ${g.to}`}
                      style={{
                        position: "absolute",
                        left: `${getPosition(g.from)}%`,
                        width: `${getWidth(g.from, g.to)}%`,
                        height: "100%",
                        background: "#f59e0b",
                        opacity: 0.9,
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}