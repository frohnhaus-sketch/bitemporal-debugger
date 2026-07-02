import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function RecommendationCard({
  presentation,
}: {
  presentation: InvestigationPresentation;
}) {
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 18,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontSize: 22,
        }}
      >
        Recommendation
      </h2>

      <p
        style={{
          margin: 0,
          lineHeight: 1.8,
        }}
      >
        {presentation.recommendation}
      </p>
    </section>
  );
}