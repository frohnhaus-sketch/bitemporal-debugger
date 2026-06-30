import type { TargetValidationResult } from "@/lib/types";
import { Reveal } from "./Reveal";

export function InvestigationProgress({
  result,
}: {
  result: TargetValidationResult;
}) {
  const checks = [
    {
      label: "Understanding table structure",
      ok: result.columns.length > 0,
    },
    {
      label: "Detecting business entities",
      ok: Boolean(result.detectedColumns.businessKey),
    },
    {
      label: "Detecting historical validity",
      ok: Boolean(
        result.detectedColumns.validFrom && result.detectedColumns.validTo,
      ),
    },
    {
      label: "Checking snapshot strategy",
      ok: Boolean(result.detectedColumns.snapshotDate),
    },
    {
      label: "Reviewing historical findings",
      ok: true,
    },
  ];

  return (
    <section style={cardStyle}>
      <div style={titleStyle}>Investigation</div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {checks.map((check, index) => (
          <Reveal key={check.label} delay={200 + index * 300}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ color: check.ok ? "#16a34a" : "#f59e0b" }}>
                {check.ok ? "✓" : "!"}
              </span>
              <span>{check.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const cardStyle = {
  padding: 20,
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};

const titleStyle = {
  fontSize: 14,
  fontWeight: 900,
  color: "#0f172a",
};
