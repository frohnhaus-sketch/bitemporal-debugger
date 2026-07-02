"use client";

import type React from "react";

type SampleScenarioId =
  | "revenue_rebuild"
  | "customer_missing"
  | "duplicate_snapshot";

export function SampleTablePreview({
  selectedScenario,
}: {
  selectedScenario: SampleScenarioId | null;
}) {
  const preview = getSamplePreview(selectedScenario);

  return (
    <div style={darkPanelStyle}>
      <div style={darkEyebrowStyle}>Analyzed sample table</div>

      <MiniTable
        title={preview.title}
        columns={preview.columns}
        rows={preview.rows}
        highlightRow={preview.highlightRow}
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
        {preview.note}
      </div>
    </div>
  );
}

function getSamplePreview(selectedScenario: SampleScenarioId | null) {
  if (selectedScenario === "customer_missing") {
    return {
      title: "sample_customer_snapshot",
      columns: [
        "customer_id",
        "snapshot_date",
        "status",
        "valid_from",
        "valid_to",
      ],
      rows: [
        ["C-204", "2024-03-31", "ACTIVE", "2024-01-01", "2024-03-15"],
        ["C-205", "2024-03-31", "ACTIVE", "2024-01-01", "9999-12-31"],
      ],
      highlightRow: 0,
      note: "The analyzer checks whether every reported business entity is covered by a valid historical period.",
    };
  }

  if (selectedScenario === "duplicate_snapshot") {
    return {
      title: "sample_snapshot_table",
      columns: ["contract_id", "snapshot_date", "premium"],
      rows: [
        ["C-301", "2024-05-31", "250"],
        ["C-301", "2024-05-31", "250"],
      ],
      highlightRow: 1,
      note: "The analyzer checks whether the reporting grain is deterministic and unique for each snapshot.",
    };
  }

  return {
    title: "sample_target_table",
    columns: [
      "contract_id",
      "snapshot_date",
      "premium",
      "valid_from",
      "valid_to",
      "method",
    ],
    rows: [
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
    ],
    highlightRow: 1,
    note: "The analyzer checks this generated table for reproducibility, duplicate grain, gaps and temporal consistency.",
  };
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