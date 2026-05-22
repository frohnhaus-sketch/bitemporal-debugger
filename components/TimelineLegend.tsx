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
      <span style={{ color: "#60a5fa" }}>🟦 source A row</span>
      <span style={{ color: "#4ade80" }}>🟩 source B row</span>
      <span>⬜ valid-time axis</span>
      <span>🟨 gap (missing valid time)</span>
      <span>🔴 overlap (conflicting records)</span>
      <span>🔴 dashed (no join result)</span>
      <span>🟠 dashed (multiple join matches)</span>
    </div>
  );
}