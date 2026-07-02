import type { TargetValidationResult } from "@/lib/types";

function severityColor(severity: string) {
  switch (severity) {
    case "high":
      return "#dc2626";
    case "medium":
      return "#d97706";
    case "low":
      return "#2563eb";
    default:
      return "#64748b";
  }
}

export function SupportingFindingsCard({
  result,
}: {
  result: TargetValidationResult;
}) {
  if (result.findings.length === 0) {
    return null;
  }

  return (
    <section>
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Technical Evidence
        </h2>

        <p
          style={{
            marginTop: 8,
            color: "#64748b",
            lineHeight: 1.7,
            maxWidth: 720,
          }}
        >
          The following findings were produced directly by the analyzer. They
          provide the technical evidence supporting the investigation result.
        </p>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {result.findings.map((finding, index) => (
          <div
            key={`${finding.id}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr",
              gap: 20,
              padding: "18px 22px",
              borderTop:
                index === 0 ? "none" : "1px solid #e2e8f0",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  fontWeight: 800,
                  color: severityColor(finding.severity),
                  textTransform: "uppercase",
                }}
              >
                {finding.severity}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: "#0f172a",
                }}
              >
                {finding.title ?? finding.id}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: "#64748b",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                Rule: {finding.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}