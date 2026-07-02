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
      badge: "Passed",
      bg: "#f0fdf4",
      border: "#86efac",
      accent: "#166534",
    },
    review: {
      icon: "🔵",
      badge: "Review",
      bg: "#eff6ff",
      border: "#93c5fd",
      accent: "#1d4ed8",
    },
    partially_reproducible: {
      icon: "🟠",
      badge: "Warning",
      bg: "#fffbeb",
      border: "#fde68a",
      accent: "#92400e",
    },
    not_reproducible: {
      icon: "🔴",
      badge: "High risk",
      bg: "#fef2f2",
      border: "#fca5a5",
      accent: "#991b1b",
    },
  }[decision];

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        background: appearance.bg,
        border: `1px solid ${appearance.border}`,
        borderRadius: 18,
        padding: "clamp(18px, 5vw, 32px)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          maxWidth: "100%",
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
          margin: "16px 0 10px",
          fontSize: "clamp(25px, 8vw, 38px)",
          lineHeight: 1.12,
          letterSpacing: "-0.045em",
          color: "#0f172a",
          overflowWrap: "break-word",
          wordBreak: "normal",
        }}
      >
        {appearance.icon} {presentation.title}
      </h2>

      <p
        style={{
          margin: 0,
          maxWidth: 760,
          color: "#475569",
          fontSize: "clamp(15px, 4vw, 17px)",
          lineHeight: 1.6,
          overflowWrap: "break-word",
        }}
      >
        {presentation.subtitle}
      </p>
    </section>
  );
}