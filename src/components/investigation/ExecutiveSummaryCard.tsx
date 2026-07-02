import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function ExecutiveSummaryCard({
  presentation,
}: {
  presentation: InvestigationPresentation;
}) {
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 18,
        background: "white",
        border: "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 22,
        }}
      >
        Executive Summary
      </h2>

      <p
        style={{
          margin: 0,
          lineHeight: 1.8,
          color: "#334155",
          fontSize: 16,
        }}
      >
        {presentation.subtitle}
      </p>
    </section>
  );
}