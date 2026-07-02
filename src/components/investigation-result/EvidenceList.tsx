import type { TargetValidationResult } from "@/lib/types";

function getFindingTitle(finding: unknown, index: number) {
  if (!finding || typeof finding !== "object") return `Evidence ${index + 1}`;

  const record = finding as Record<string, unknown>;

  return (
    String(record.title ?? record.type ?? record.code ?? `Evidence ${index + 1}`)
  );
}

function getFindingDescription(finding: unknown) {
  if (!finding || typeof finding !== "object") return "";

  const record = finding as Record<string, unknown>;

  return String(record.message ?? record.description ?? "");
}

function getFindingSeverity(finding: unknown) {
  if (!finding || typeof finding !== "object") return "info";

  const record = finding as Record<string, unknown>;

  return String(record.severity ?? "info").toUpperCase();
}

export function EvidenceList({ result }: { result: TargetValidationResult }) {
  if (!result.findings.length) {
    return (
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Evidence</h2>
        <p style={mutedText}>No findings were produced by the analyzer.</p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Evidence</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {result.findings.map((finding, index) => (
          <div
            key={index}
            style={{
              border: "1px solid rgba(148, 163, 184, 0.18)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(15, 23, 42, 0.52)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <strong style={{ color: "#e2e8f0", fontSize: 14 }}>
                {getFindingTitle(finding, index)}
              </strong>

              <span
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                }}
              >
                {getFindingSeverity(finding)}
              </span>
            </div>

            {getFindingDescription(finding) ? (
              <p style={{ ...mutedText, marginTop: 8 }}>
                {getFindingDescription(finding)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(2, 6, 23, 0.42)",
  borderRadius: 20,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 18,
  fontWeight: 950,
};

const mutedText: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.6,
  fontSize: 14,
};