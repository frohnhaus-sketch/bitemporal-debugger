import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function BusinessImpactCard({
  presentation,
}: {
  presentation: InvestigationPresentation;
}) {
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 18,
        background: "#fff8eb",
        border: "1px solid #fde68a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontSize: 22,
        }}
      >
        Business Impact
      </h2>

      <p
        style={{
          margin: 0,
          lineHeight: 1.8,
        }}
      >
        {presentation.businessImpact}
      </p>
    </section>
  );
}