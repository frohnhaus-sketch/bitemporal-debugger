const legendItems = [
  {
    label: "Data row",
    color: "#64748b",
    description: "A normal valid-time row from one source.",
  },
  {
    label: "Gap",
    color: "#f59e0b",
    description:
      "A missing valid-time period inside one source. History is incomplete for this entity.",
  },
  {
    label: "Overlap",
    color: "#ef4444",
    description:
      "Two rows from the same source cover overlapping valid-time periods. This can create ambiguous results.",
  },
  {
    label: "No temporal match",
    color: "#f59e0b",
    dashed: true,
    description:
      "This row has no overlapping match in the other source. Depending on the join type, this may produce NULLs or dropped rows.",
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
        color: "#94a3b8",
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
              display: "inline-block",
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}