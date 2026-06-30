import type { TargetValidationResult } from "@/lib/types";

export function TechnicalDetails({
  result,
}: {
  result: TargetValidationResult;
}) {
  return (
    <details
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        color: "#334155",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        Technical details
      </summary>

      <div style={{ marginTop: 14, display: "grid", gap: 10, fontSize: 13 }}>
        <div><strong>Rows:</strong> {result.rowCount}</div>
        <div><strong>Columns:</strong> {result.columns.length}</div>
        <div><strong>Findings:</strong> {result.findings.length}</div>
        <div>
          <strong>Business key:</strong>{" "}
          {result.detectedColumns.businessKey ?? "not detected"}
        </div>
        <div>
          <strong>Valid time:</strong>{" "}
          {result.detectedColumns.validFrom && result.detectedColumns.validTo
            ? `${result.detectedColumns.validFrom} → ${result.detectedColumns.validTo}`
            : "not detected"}
        </div>
        <div>
          <strong>Snapshot date:</strong>{" "}
          {result.detectedColumns.snapshotDate ?? "not detected"}
        </div>

        {result.findings.length > 0 && (
          <details style={{ marginTop: 10 }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Raw findings
            </summary>

            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {result.findings.map((finding) => (
                <div
                  key={finding.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#0f172a" }}>
                    {finding.title}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color:
                        finding.severity === "high"
                          ? "#b91c1c"
                          : finding.severity === "medium"
                            ? "#92400e"
                            : "#334155",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    {finding.severity} risk
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </details>
  );
}