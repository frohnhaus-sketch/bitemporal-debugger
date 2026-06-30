export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const color =
    tone === "bad"
      ? "#fb7185"
      : tone === "warn"
        ? "#fbbf24"
        : tone === "good"
          ? "#34d399"
          : "#fff";

  return (
    <div
      style={{
        padding: 22,
        borderRadius: 16,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.10)",
        minHeight: 120,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.58 }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, color }}>
        {value}
      </div>
      {hint && (
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.62 }}>{hint}</div>
      )}
    </div>
  );
}