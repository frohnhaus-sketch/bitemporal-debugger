"use client";

import type { TargetValidationResult } from "@/lib/types";
import { deriveInvestigation } from "@/lib/analyzer/investigation/deriveInvestigation";

import { ConclusionCard } from "@/components/investigation/ConclusionCard";
import { TechnicalDetails } from "@/components/investigation/TechnicalDetails";

export function TargetTableInvestigation({
  result,
}: {
  result: TargetValidationResult;
}) {
  const investigation = deriveInvestigation(result);

  return (
    <div
      id="target-validation-result"
      style={{
        marginTop: 24,
        display: "grid",
        gap: 24,
      }}
    >
      <ConclusionCard
        decision={investigation.diagnosis.decision}
        presentation={investigation.presentation}
      />
      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1fr",
        }}
      >
        <InsightCard
          title="Root Cause"
          text={investigation.presentation.rootCause}
        />

        <InsightCard
          title="Business Impact"
          text={investigation.presentation.businessImpact}
        />

        <InsightCard
          title="Recommended next step"
          text={investigation.presentation.recommendation}
        />

        <InsightCard
          accent
          title="Recommended next step"
          text="Learn how to eliminate this issue using the interactive historical modeling guide."
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
              marginBottom: 8,
              fontSize: 24,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Evidence
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            The following observations led to this investigation result.
          </p>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            {result.findings.slice(0, 3).map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
            {result.findings.length > 3 && (
              <div
                style={{
                  marginTop: 18,
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                + {result.findings.length - 3} more observations
              </div>
            )}
          </div>
        </section>
      )}
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
            marginBottom: 18,
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          How I reached this conclusion
        </h2>

        <ReasonCheck
          ok={!!result.detectedColumns.businessKey}
          label="Business Key detected"
        />

        <ReasonCheck
          ok={
            !!result.detectedColumns.validFrom &&
            !!result.detectedColumns.validTo
          }
          label="Valid Time detected"
        />

        <ReasonCheck
          ok={
            !!result.detectedColumns.visibleFrom &&
            !!result.detectedColumns.visibleTo
          }
          label="Visible Time detected"
        />

        <ReasonCheck
          ok={!!result.detectedColumns.snapshotDate}
          label="Snapshot detected"
        />

        <div
          style={{
            height: 1,
            background: "#e2e8f0",
            margin: "12px 0",
          }}
        />

        <ReasonCheck
          ok={result.findings.some((f) => f.id === "valid-time-overlaps")}
          label="Overlapping intervals detected"
        />

        <ReasonCheck
          ok={result.findings.some((f) => f.id === "valid-time-gaps")}
          label="Coverage gaps detected"
        />

        <ReasonCheck
          ok={result.findings.some((f) => f.id === "duplicate-snapshot-grain")}
          label="Duplicate snapshot grain detected"
        />
      </section>
      <TechnicalDetails result={result} />
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
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: 999,
          marginBottom: 14,

          background:
            finding.severity === "high"
              ? "#fef2f2"
              : finding.severity === "medium"
                ? "#fffbeb"
                : "#f0fdf4",

          color:
            finding.severity === "high"
              ? "#991b1b"
              : finding.severity === "medium"
                ? "#92400e"
                : "#166534",

          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        {finding.severity}
      </div>
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
        Evidence
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
            Suggested action
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

function InsightCard({
  title,
  text,
  accent = false,
}: {
  title: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <section
      style={{
        background: accent ? "#eff6ff" : "#ffffff",
        border: accent ? "1px solid #93c5fd" : "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 22,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "#334155",
        }}
      >
        {text}
      </div>
    </section>
  );
}

function ReasonCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
      }}
    >
      <div
        style={{
          fontSize: 18,
        }}
      >
        {ok ? "✓" : "○"}
      </div>

      <div
        style={{
          color: ok ? "#0f172a" : "#64748b",
          fontWeight: ok ? 600 : 400,
        }}
      >
        {label}
      </div>
    </div>
  );
}
