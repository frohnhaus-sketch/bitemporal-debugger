import type { TargetValidationResult } from "@/lib/types";

export function TechnicalDetails({
  result,
}: {
  result: TargetValidationResult;
}) {
  return (
    <details
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        marginTop: 0,
        padding: "clamp(16px, 4vw, 18px)",
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

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: 10,
          fontSize: 13,
          lineHeight: 1.55,
          overflowWrap: "break-word",
        }}
      >
        <div>
          <strong>Rows:</strong> {result.rowCount}
        </div>
        <div>
          <strong>Columns:</strong> {result.columns.length}
        </div>
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
      </div>
    </details>
  );
}