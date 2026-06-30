export function OptionGrid({
  options,
  selectedIds = [],
  onSelect,
}: {
  options: { id: string; label: string; icon?: string }[];
  selectedIds?: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            style={{
              textAlign: "left",
              padding: "17px 18px",
              borderRadius: 16,
              background: selected
                ? "rgba(124,58,237,0.22)"
                : "rgba(255,255,255,0.055)",
              border: selected
                ? "1px solid rgba(196,181,253,0.55)"
                : "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            {option.icon && (
              <span style={{ marginRight: 10 }}>{option.icon}</span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
