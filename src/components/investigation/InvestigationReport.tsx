import type { TargetValidationResult } from "@/lib/types";
import type { InvestigationDiagnosis } from "@/lib/analyzer/diagnosis/types";
import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

import { ReportHeader } from "./ReportHeader";
import { ReportSection } from "./ReportSection";
import { EvidenceCard } from "./EvidenceCard";
import { SupportingFindingsCard } from "./SupportingFindingsCard";

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "#e2e8f0",
      }}
    />
  );
}

export function InvestigationReport({
  result,
  diagnosis,
  presentation,
}: {
  result: TargetValidationResult;
  diagnosis: InvestigationDiagnosis;
  presentation: InvestigationPresentation;
}) {
  return (
    <main
      style={{
        maxWidth: 980,
        margin: "48px auto",
        padding: "0 24px",
      }}
    >
      <ReportHeader diagnosis={diagnosis} presentation={presentation} />

      <article
        style={{
          marginTop: 36,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0 56px",
          }}
        >
          <ReportSection title="Verdict">
            <p
              style={{
                marginTop: 0,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {presentation.subtitle}
            </p>

            <p
              style={{
                color: "#475569",
              }}
            >
              {presentation.rootCause}
            </p>
          </ReportSection>

          <Divider />

          <ReportSection title="Why we reached this conclusion">
            <EvidenceCard diagnosis={diagnosis} />
          </ReportSection>

          <Divider />

          <ReportSection title="Business Impact">
            <p>{presentation.businessImpact}</p>
          </ReportSection>

          <Divider />

          <ReportSection title="Recommended Action">
            <p>{presentation.recommendation}</p>
          </ReportSection>

          <Divider />

          <ReportSection title="Next Steps">
            <ol
              style={{
                margin: 0,
                paddingLeft: 22,
                display: "grid",
                gap: 10,
              }}
            >
              {presentation.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </ReportSection>
        </div>
      </article>

      <details
        style={{
          marginTop: 36,
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          Technical Appendix
        </summary>

        <div
          style={{
            marginTop: 24,
          }}
        >
          <SupportingFindingsCard result={result} />
        </div>
      </details>
    </main>
  );
}
