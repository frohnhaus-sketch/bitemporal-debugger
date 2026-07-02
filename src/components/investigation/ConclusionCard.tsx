import type { InvestigationDecision } from "@/lib/analyzer/diagnosis/types";
import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export function ConclusionCard({
  decision,
  presentation,
}: {
  decision: InvestigationDecision;
  presentation: InvestigationPresentation;
}) {
  const appearance = {
    clean: {
      icon: "🟢",
      badge: "PASSED",
      bg: "#f0fdf4",
      border: "#86efac",
      accent: "#166534",
    },

    review: {
      icon: "🔵",
      badge: "REVIEW",
      bg: "#eff6ff",
      border: "#93c5fd",
      accent: "#1d4ed8",
    },

    partially_reproducible: {
      icon: "🟠",
      badge: "WARNING",
      bg: "#fffbeb",
      border: "#fde68a",
      accent: "#92400e",
    },

    not_reproducible: {
      icon: "🔴",
      badge: "HIGH RISK",
      bg: "#fef2f2",
      border: "#fca5a5",
      accent: "#991b1b",
    },
  }[decision];

  return (
    <section
      style={{
        background: appearance.bg,
        border: `1px solid ${appearance.border}`,
        borderRadius: 18,
        padding: 36,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          borderRadius: 999,
          background: "#ffffff",
          border: `1px solid ${appearance.border}`,
          fontSize: 12,
          fontWeight: 800,
          color: appearance.accent,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}
      >
        {appearance.badge}
      </div>

      <h2
        style={{
          margin: "18px 0 10px",
          fontSize: 38,
          lineHeight: 1.15,
          color: "#0f172a",
        }}
      >
        {appearance.icon} {presentation.title}
      </h2>

      <p
        style={{
          margin: 0,
          maxWidth: 760,
          color: "#475569",
          fontSize: 17,
          lineHeight: 1.65,
        }}
      >
        {presentation.subtitle}
      </p>
    </section>
  );
}