export function PipelineNode({
  label,
  icon = "📦",
  historical = false,
  active = false,
}: {
  label: string;
  icon?: string;
  historical?: boolean;
  active?: boolean;
}) {
  return (
    <div
      style={{
        minWidth: 180,
        padding: "18px 20px",
        borderRadius: 18,
        background: active
          ? "rgba(124,58,237,0.22)"
          : "rgba(255,255,255,0.055)",
        border: active
          ? "1px solid rgba(196,181,253,0.55)"
          : "1px solid rgba(255,255,255,0.12)",
        boxShadow: active ? "0 0 40px rgba(124,58,237,0.22)" : "none",
        transition: "all 300ms ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong style={{ fontSize: 16 }}>
          {icon} {label}
        </strong>

        {historical && (
          <span
            style={{
              fontSize: 12,
              color: "#fde68a",
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.25)",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            🕒 Historical
          </span>
        )}
      </div>
    </div>
  );
}