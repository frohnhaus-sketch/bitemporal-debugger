type LegendItem = {
  label: string;
  color: string;
  dashed?: boolean;
  description: string;
};

const legendItems: LegendItem[] = [
  {
    label: "Timeline (no data)",
    color: "#e5e7eb",
    description:
      "Background timeline. Indicates periods where no data exists for this entity.",
  },
  {
    label: "Data row (valid interval)",
    color: "#64748b",
    description:
      "A valid-time interval from one source. This represents actual stored data.",
  },
  {
    label: "Gap",
    color: "#f59e0b",
    description:
      "A missing valid-time period inside one source. History is incomplete for this entity.",
  },
  {
    label: "No temporal match",
    color: "#f59e0b",
    dashed: true,
    description:
      "This row has no overlapping match in the other source for either valid-time or visible-time.",
  },
  {
    label: "Overlap",
    color: "#ef4444",
    description:
      "Two rows from the same source cover overlapping valid-time periods. This can create ambiguous results.",
  },
  {
    label: "Ambiguous join",
    color: "#ef4444",
    dashed: true,
    description:
      "Multiple matching rows found in the other source. The join result is not unique.",
  },
];

export function TimelineLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 20,
        color: "white",
        fontSize: 12,
      }}
    >
      {legendItems.map((item) => (
        <div
          key={item.label}
          title={item.description}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "help",
          }}
        >
          <span
            style={{
              width: 22,
              height: 8,
              borderRadius: 999,
              background: item.dashed ? "transparent" : item.color,
              border: item.dashed
                ? `2px dashed ${item.color}`
                : `1px solid ${item.color}`,
              opacity: item.color === "#e5e7eb" ? 0.6 : 1,
              display: "inline-block",
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}