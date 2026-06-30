"use client";

import type { TargetValidationResult } from "@/lib/types";

import {
  ConclusionCard,
  type InvestigationConclusion,
} from "@/components/investigation/ConclusionCard";
import { TechnicalDetails } from "@/components/investigation/TechnicalDetails";

function deriveConclusion(
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

export function TargetTableInvestigation({
  result,
}: {
  result: TargetValidationResult;
}) {
  const conclusion = deriveConclusion(result);

  return (
    <div
      id="target-validation-result"
      style={{
        marginTop: 24,
        display: "grid",
        gap: 24,
      }}
    >
      <ConclusionCard conclusion={conclusion} />

      <section
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <SeverityCard
          label="High"
          value={result.qualitySummary.counts.high}
          background="#fef2f2"
          border="#fecaca"
          color="#991b1b"
        />

        <SeverityCard
          label="Medium"
          value={result.qualitySummary.counts.medium}
          background="#fffbeb"
          border="#fde68a"
          color="#92400e"
        />

        <SeverityCard
          label="Low"
          value={result.qualitySummary.counts.low}
          background="#ecfdf5"
          border="#86efac"
          color="#166534"
        />
      </section>

      {result.findings.length > 0 && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 20,
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Top findings
          </h2>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            {result.findings.slice(0, 3).map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </section>
      )}

      <TechnicalDetails result={result} />
    </div>
  );
}

function SeverityCard({
  label,
  value,
  background,
  border,
  color,
}: {
  label: string;
  value: number;
  background: string;
  border: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderRadius: 12,
        background,
        border: `1px solid ${border}`,
        minWidth: 120,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#0f172a",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FindingCard({
  finding,
}: {
  finding: TargetValidationResult["findings"][number];
}) {
  const color =
    finding.severity === "high"
      ? "#dc2626"
      : finding.severity === "medium"
        ? "#f59e0b"
        : "#16a34a";

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
          }}
        />

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {finding.title}
        </div>
      </div>

      <div
        style={{
          fontWeight: 700,
          marginBottom: 6,
          color: "#0f172a",
        }}
      >
        Why it matters
      </div>

      <div
        style={{
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        {finding.evidence.join(" ")}
      </div>

      {finding.recommendation && (
        <>
          <div
            style={{
              marginTop: 18,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Recommended fix
          </div>

          <div
            style={{
              marginTop: 6,
              padding: 14,
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            {finding.recommendation}
          </div>
        </>
      )}
    </div>
  );
}