import type {
  InvestigationConfidence,
  InvestigationDecision,
  InvestigationDiagnosis,
} from "@/lib/analyzer/diagnosis/types";
import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

function formatDecision(decision: InvestigationDecision) {
  switch (decision) {
    case "not_reproducible":
      return "Historical output is not reproducible";
    case "partially_reproducible":
      return "Historical output is partially reproducible";
    case "review":
      return "Historical output requires investigation";
    case "clean":
      return "No critical historical issues detected";
  }
}

function confidenceLabel(confidence: InvestigationConfidence) {
  switch (confidence) {
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    case "low":
      return "LOW";
  }
}

function decisionLabel(decision: InvestigationDecision) {
  switch (decision) {
    case "not_reproducible":
      return "Not reproducible";
    case "partially_reproducible":
      return "Partially reproducible";
    case "review":
      return "Needs review";
    case "clean":
      return "Clean";
  }
}

export function ReportHeader({
  diagnosis,
  presentation,
}: {
  diagnosis: InvestigationDiagnosis;
  presentation: InvestigationPresentation;
}) {
  return (
    <header
      style={{
        borderRadius: 24,
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#020617 0%,#0f172a 55%,#1e293b 100%)",
        color: "white",
      }}
    >
      <div
        style={{
          padding: "44px 48px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 900,
            color: "#93c5fd",
          }}
        >
          Historical Investigation Report
        </div>

        <h1
          style={{
            margin: "18px 0 0",
            fontSize: 46,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          {presentation.title || formatDecision(diagnosis.decision)}
        </h1>

        <p
          style={{
            marginTop: 28,
            maxWidth: 760,
            fontSize: 22,
            lineHeight: 1.65,
            color: "#e2e8f0",
          }}
        >
          This dataset should not currently be trusted for reproducible
          historical reporting. The analyzer found multiple independent
          signals indicating that rebuilding this dataset may produce
          different business results than previously published reports.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          <HeroPill
            title="Decision"
            value={decisionLabel(diagnosis.decision)}
          />

          <HeroPill
            title="Confidence"
            value={confidenceLabel(diagnosis.confidence)}
          />

          <HeroPill
            title="Evidence"
            value={`${diagnosis.evidence.length} signals`}
          />
        </div>
      </div>
    </header>
  );
}

function HeroPill({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        minWidth: 170,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#94a3b8",
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 24,
          fontWeight: 900,
          color: "white",
        }}
      >
        {value}
      </div>
    </div>
  );
}