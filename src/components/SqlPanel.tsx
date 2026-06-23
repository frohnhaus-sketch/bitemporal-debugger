import { track } from "@/lib/analytics";
import { useState } from "react";

type SqlPanelProps = {
  sql: string;
};

export function SqlPanel({ sql }: SqlPanelProps) {
  const [copiedSql, setCopiedSql] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        background: "#ffffff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Snapshot Filter</h3>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.7,
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          SNAPSHOT SQL FILTER
        </div>

        <pre
          style={{
            margin: 0,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#111827",
            color: "#e5e7eb",
            border: "none",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
            maxWidth: "100%",
            boxSizing: "border-box",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {sql || "SQL filter for the active historical snapshot."}
        </pre>

        <button
          onClick={async () => {
            if (!sql) return;

            track("SQL Copied");
            await navigator.clipboard.writeText(sql);

            setCopiedSql(true);

            setTimeout(() => {
              setCopiedSql(false);
            }, 1600);
          }}
          disabled={!sql}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: copiedSql ? "#dcfce7" : "#e2e8f0",
            color: copiedSql ? "#166534" : "#334155",
            border: "1px solid #cbd5e1",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            cursor: sql ? "pointer" : "not-allowed",
            fontWeight: 700,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!sql || copiedSql) return;

            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.background = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";

            if (!copiedSql) {
              e.currentTarget.style.background = "#e2e8f0";
            }
          }}
        >
          {copiedSql ? "✓ Copied" : "Copy Snapshot Filter"}
        </button>
      </div>
    </div>
  );
}