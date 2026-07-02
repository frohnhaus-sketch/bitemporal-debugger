import type { TargetFinding } from "@/lib/types";
import type { InvestigationDiagnosis } from "@/lib/analyzer/diagnosis/types";

type EvidenceExplanation = {
  title: string;
  body: string;
};

function explainFinding(finding: TargetFinding): EvidenceExplanation {
  switch (finding.id) {
    case "valid-time-overlaps":
      return {
        title: "Conflicting historical states detected",
        body:
          "Multiple historical versions are valid for the same business entity during the same time period. Reports cannot reliably determine which version should have been used.",
      };

    case "valid-time-gaps":
      return {
        title: "Missing periods detected",
        body:
          "The historical timeline contains uncovered periods. Reports for these dates may silently omit business entities.",
      };

    case "snapshot-reproducibility-risk":
      return {
        title: "Historical reports are not reproducible",
        body:
          "Previously published reports can change after a rebuild because historical corrections affect earlier reporting periods.",
      };

    case "coverage-gap-risk":
      return {
        title: "Historical coverage is incomplete",
        body:
          "Parts of the historical timeline are missing, increasing the risk of incomplete or misleading reporting.",
      };

    case "duplicate-intervals":
      return {
        title: "Duplicate historical intervals detected",
        body:
          "Multiple records describe the same time period for one business entity, creating ambiguity during joins and aggregations.",
      };

    default:
      return {
        title: finding.title ?? finding.id,
        body:
          "This signal contributed to the investigation result and should be reviewed.",
      };
  }
}

export function EvidenceCard({
  diagnosis,
}: {
  diagnosis: InvestigationDiagnosis;
}) {
  if (diagnosis.evidence.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 28,
      }}
    >
      {diagnosis.evidence.map((finding, index) => {
        const explanation = explainFinding(finding);

        return (
          <div
            key={`${finding.id}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: "#dcfce7",
                color: "#166534",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 18,
                marginTop: 2,
              }}
            >
              ✓
            </div>

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {explanation.title}
              </div>

              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: 16,
                  maxWidth: 720,
                }}
              >
                {explanation.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}