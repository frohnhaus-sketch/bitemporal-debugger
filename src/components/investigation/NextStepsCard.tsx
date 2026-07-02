import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function NextStepsCard({
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
          marginBottom: 18,
          fontSize: 22,
        }}
      >
        Next Steps
      </h2>

      <ol
        style={{
          margin: 0,
          paddingLeft: 22,
          display: "grid",
          gap: 12,
          lineHeight: 1.8,
        }}
      >
        {presentation.nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}