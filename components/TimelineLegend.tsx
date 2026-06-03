type LegendItem = {
  label: string;
  color: string;
  dashed?: boolean;
  description: string;
};

const legendItems: LegendItem[] = [
  {
    label: "No data",
    color: "#d1d5db",
    description:
      "Background timeline without rows for this entity.",
  },
  {
    label: "Valid",
    color: "#64748b",
    description:
      "A stored valid-time interval.",
  },
  {
    label: "Gap",
    color: "#f59e0b",
    description:
      "Missing valid-time history.",
  },
  {
    label: "No match",
    color: "#f59e0b",
    dashed: true,
    description:
      "No matching interval found in the other source.",
  },
  {
    label: "Overlap",
    color: "#ef4444",
    description:
      "Overlapping valid-time rows.",
  },
  {
    label: "Ambiguous",
    color: "#ef4444",
    dashed: true,
    description:
      "Multiple temporal matches found.",
  },
];

export function TimelineLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 8,
        color: "#cbd5e1",
        fontSize: 11,
        opacity: 0.9,
      }}
    >
      {legendItems.map((item) => (
        <div
          key={item.label}
          title={item.description}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            cursor: "help",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 18,
              height: 7,
              borderRadius: 999,
              background: item.dashed ? "transparent" : item.color,
              border: item.dashed
                ? `2px dashed ${item.color}`
                : `1px solid ${item.color}`,
              opacity: item.color === "#d1d5db" ? 0.45 : 0.95,
              display: "inline-block",
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}