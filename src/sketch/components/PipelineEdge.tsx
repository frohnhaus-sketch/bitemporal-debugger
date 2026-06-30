export function PipelineEdge({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        color: "rgba(255,255,255,0.35)",
        minHeight: 34,
      }}
    >
      <div style={{ fontSize: 22 }}>↓</div>
      {label && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#fde68a",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}