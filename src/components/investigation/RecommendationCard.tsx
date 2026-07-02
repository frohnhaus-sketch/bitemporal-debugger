import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function RecommendationCard({
  presentation,
}: {
  presentation: InvestigationPresentation;
}) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "clamp(18px, 5vw, 24px)",
        borderRadius: 18,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      }}
    >
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: "clamp(20px, 6vw, 24px)",
          lineHeight: 1.2,
          color: "#0f172a",
          overflowWrap: "break-word",
        }}
      >
        Recommendation
      </h2>

      <p
        style={{
          margin: 0,
          color: "#475569",
          fontSize: "clamp(15px, 4vw, 16px)",
          lineHeight: 1.65,
          overflowWrap: "break-word",
        }}
      >
        {presentation.recommendation}
      </p>
    </section>
  );
}