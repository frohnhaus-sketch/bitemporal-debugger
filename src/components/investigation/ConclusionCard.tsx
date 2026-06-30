import type { TargetValidationResult } from "@/lib/types";

export type InvestigationConclusion =
  | "reproducible"
  | "partial"
  | "not-reproducible"
  | "insufficient";

export function deriveConclusion(
  result: TargetValidationResult,
): InvestigationConclusion {
  switch (result.qualitySummary.severity) {
    case "danger":
      return "not-reproducible";

    case "warning":
      return "partial";

    default:
      return "reproducible";
  }
}

export function ConclusionCard({
  conclusion,
}: {
  conclusion: InvestigationConclusion;
}) {
  const config = {
    reproducible: {
      icon: "🟢",
      badge: "PASSED",
      title: "Historical model looks healthy",
      summary:
        "No major temporal risks were detected. This table appears suitable for reproducing historical reporting.",
      bg: "#f0fdf4",
      border: "#86efac",
      accent: "#166534",
    },

    partial: {
      icon: "🟠",
      badge: "WARNING",
      title: "Historical model requires review",
      summary:
        "The table contains historical information, but some temporal assumptions cannot be verified. Reporting may depend on upstream processing.",
      bg: "#fffbeb",
      border: "#fde68a",
      accent: "#92400e",
    },

    "not-reproducible": {
      icon: "🔴",
      badge: "HIGH RISK",
      title: "Historical issues detected",
      summary:
        "This table is unlikely to reproduce historical reports reliably. At least one high-severity temporal issue was detected.",
      bg: "#fef2f2",
      border: "#fca5a5",
      accent: "#991b1b",
    },

    insufficient: {
      icon: "⚪",
      badge: "INSUFFICIENT DATA",
      title: "More information required",
      summary:
        "This table alone does not expose enough historical semantics to determine whether reporting is reproducible.",
      bg: "#f8fafc",
      border: "#cbd5e1",
      accent: "#475569",
    },
  }[conclusion];

  return (
    <section
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 18,
        padding: 26,
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
          border: `1px solid ${config.border}`,
          fontSize: 12,
          fontWeight: 800,
          color: config.accent,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}
      >
        {config.badge}
      </div>

      <h2
        style={{
          margin: "18px 0 10px",
          fontSize: 30,
          lineHeight: 1.15,
          color: "#0f172a",
        }}
      >
        {config.icon} {config.title}
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
        {config.summary}
      </p>
    </section>
  );
}
