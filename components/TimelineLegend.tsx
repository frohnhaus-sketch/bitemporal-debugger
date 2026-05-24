export function TimelineLegend() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "10px 12px",
        background: "#1e293b",
        borderRadius: 8,
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        fontSize: 12,
        color: "#cbd5e1",
      }}
    >
      <span>⬜ valid-time axis</span>
      <span style={{ color: "#f59e0b" }}>🟧 gap (missing valid time)</span>
      <span style={{ color: "#ef4444" }}>🟥 overlap (conflicting records)</span>
      <span style={{ color: "#ef4444" }}>🔴 dashed (no join result)</span>
      <span style={{ color: "#f59e0b" }}>🟠 dashed (multiple matches)</span>
    </div>
  );
}