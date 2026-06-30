export function MiniTable({
  title,
  columns,
  rows,
  highlightRow,
}: {
  title: string;
  columns: string[];
  rows: Record<string, string>[];
  highlightRow?: number;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(2,6,23,0.45)",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(255,255,255,0.06)",
          fontSize: 13,
          opacity: 0.8,
        }}
      >
        {title}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={thStyle}>
                {c}
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
                    ? "rgba(251,191,36,0.16)"
                    : "transparent",
              }}
            >
              {columns.map((c) => (
                <td key={c} style={tdStyle}>
                  {row[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left" as const,
  padding: "9px 12px",
  color: "rgba(255,255,255,0.5)",
  fontWeight: 500,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tdStyle = {
  padding: "9px 12px",
  color: "rgba(255,255,255,0.86)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};