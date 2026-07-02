"use client";

import type React from "react";
import type { validateTargetTable } from "@/lib/targetTableValidator";

type TargetValidationResult = ReturnType<typeof validateTargetTable>;
type TargetFinding = TargetValidationResult["findings"][number];

export function EvidenceList({ result }: { result: TargetValidationResult }) {
  const topFindings = result.findings.slice(0, 5);

  return (
    <div style={darkPanelStyle}>
      <div style={darkEyebrowStyle}>Evidence</div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {topFindings.length ? (
          topFindings.map((finding, index) => (
            <EvidenceCard
              key={`${getFindingKey(finding)}-${index}`}
              finding={finding}
            />
          ))
        ) : (
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.58)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            No analyzer findings were produced for this table.
          </p>
        )}
      </div>
    </div>
  );
}

function EvidenceCard({ finding }: { finding: TargetFinding }) {
  const severityColor =
    finding.severity === "high"
      ? "#fb7185"
      : finding.severity === "medium"
        ? "#fbbf24"
        : "#34d399";

  const title = getFindingTitle(finding);
  const description = getFindingDescription(finding);
  const recommendation = getFindingRecommendation(finding);

  return (
    <div
      style={{
        padding: 13,
        borderRadius: 13,
        background: "rgba(15,23,42,0.58)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: severityColor,
            flex: "0 0 auto",
          }}
        />

        <strong style={{ fontSize: 14 }}>{title}</strong>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.68)",
          fontSize: 12.5,
          lineHeight: 1.45,
        }}
      >
        {description}
      </div>

      {recommendation ? (
        <div
          style={{
            marginTop: 9,
            padding: 10,
            borderRadius: 10,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#bfdbfe",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          <strong>Recommended fix: </strong>
          {recommendation}
        </div>
      ) : null}
    </div>
  );
}

export function TechnicalDetails({
  result,
}: {
  result: TargetValidationResult;
}) {
  return (
    <details style={darkPanelStyle}>
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 900,
          color: "#ffffff",
          fontSize: 13,
        }}
      >
        Technical details
      </summary>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          margin: "12px 0 0",
          fontSize: 13,
        }}
      >
        <Meta label="Rows" value={String(result.rowCount)} />
        <Meta label="Columns" value={String(result.columns.length)} />
        <Meta label="Findings" value={String(result.findings.length)} />
        <Meta
          label="Business key"
          value={result.detectedColumns.businessKey ?? "not detected"}
        />
        <Meta
          label="Valid time"
          value={
            result.detectedColumns.validFrom && result.detectedColumns.validTo
              ? `${result.detectedColumns.validFrom} → ${result.detectedColumns.validTo}`
              : "not detected"
          }
        />
        <Meta
          label="Visible time"
          value={
            result.detectedColumns.visibleFrom &&
            result.detectedColumns.visibleTo
              ? `${result.detectedColumns.visibleFrom} → ${result.detectedColumns.visibleTo}`
              : "not detected"
          }
        />
        <Meta
          label="Snapshot"
          value={result.detectedColumns.snapshotDate ?? "not detected"}
        />
      </dl>
    </details>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{label}</dt>

      <dd
        style={{
          margin: "4px 0 0",
          color: "#ffffff",
          fontSize: 12.5,
          fontWeight: 800,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function getFindingKey(finding: TargetFinding) {
  if ("kind" in finding && typeof finding.kind === "string") {
    return finding.kind;
  }

  if ("id" in finding && typeof finding.id === "string") {
    return finding.id;
  }

  return "finding";
}

function getFindingTitle(finding: TargetFinding) {
  if ("title" in finding && typeof finding.title === "string") {
    return finding.title;
  }

  if ("kind" in finding && typeof finding.kind === "string") {
    return humanize(finding.kind);
  }

  if ("id" in finding && typeof finding.id === "string") {
    return humanize(finding.id);
  }

  return "Historical evidence detected";
}

function getFindingDescription(finding: TargetFinding) {
  if ("message" in finding && typeof finding.message === "string") {
    return finding.message;
  }

  if ("description" in finding && typeof finding.description === "string") {
    return finding.description;
  }

  return "This evidence can affect historical reporting correctness.";
}

function getFindingRecommendation(finding: TargetFinding) {
  if (
    "recommendation" in finding &&
    typeof finding.recommendation === "string"
  ) {
    return finding.recommendation;
  }

  return "";
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const darkEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
  fontWeight: 900,
};

const darkPanelStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
};