"use client";

import type { CSSProperties } from "react";
import { validateTargetTable } from "@/lib/targetTableValidator";
import { createAnalyzerContext } from "@/lib/analyzer/context";
import type { AnalyzerContext } from "@/lib/analyzer/context";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import { ReportSection } from "@/components/investigation/ReportSection";

type IntervalEnd = "exclusive" | "inclusive";
type TemporalModel = "valid_time" | "bitemporal" | "tritemporal_unknown";

export function AnalyzerResultScreenV2({
  result,
  ruleFacts,
  showSampleTable = false,
  validIntervalEnd,
  visibleIntervalEnd,
  temporalModel,
  onChangeValidIntervalEndAction,
  onChangeVisibleIntervalEndAction,
  onChangeTemporalModelAction,
}: {
  result: ReturnType<typeof validateTargetTable>;
  ruleFacts?: RuleFacts;
  showSampleTable?: boolean;
  validIntervalEnd: IntervalEnd;
  visibleIntervalEnd: IntervalEnd;
  temporalModel: TemporalModel;
  onChangeValidIntervalEndAction: (value: IntervalEnd) => void;
  onChangeVisibleIntervalEndAction: (value: IntervalEnd) => void;
  onChangeTemporalModelAction: (value: TemporalModel) => void;
}) {
  const context = createAnalyzerContext(result, ruleFacts);
  const { diagnosis, presentation } = context;

  const hasValidTime = Boolean(
    result.detectedColumns.validFrom && result.detectedColumns.validTo,
  );

  const hasVisibleTime = Boolean(
    result.detectedColumns.visibleFrom && result.detectedColumns.visibleTo,
  );

  const hasSnapshot = Boolean(result.detectedColumns.snapshotDate);

  const severity =
    diagnosis.decision === "not_reproducible"
      ? "HIGH RISK"
      : diagnosis.decision === "partially_reproducible"
        ? "MEDIUM RISK"
        : "LOW RISK";

  return (
    <section style={screenStyle}>
      <div style={heroStyle}>
        <div style={riskRowStyle}>
          <RiskChip label={severity} tone={diagnosis.decision} />
          <span>{diagnosis.confidence} confidence</span>
          <span>{diagnosis.evidence.length} independent signals</span>
        </div>

        <h1 style={titleStyle}>{presentation.title}</h1>

        <p style={subtitleStyle}>{presentation.rootCause}</p>

        <ul style={consequenceListStyle}>
          {presentation.consequences.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <EvidenceSection findings={diagnosis.evidence} />

      <StoryBlock
        eyebrow="Business impact"
        body={presentation.businessImpact}
      />

      <div style={actionStyle}>
        <div style={eyebrowStyle}>What you should do next</div>
        <ul style={nextStepsStyle}>
          {presentation.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>

      <details style={detailsStyle}>
        <summary style={summaryStyle}>Investigation configuration</summary>

        <div style={{ marginTop: 14 }}>
          <AnalysisAssumptionsBar
            validIntervalEnd={validIntervalEnd}
            visibleIntervalEnd={visibleIntervalEnd}
            temporalModel={temporalModel}
            hasVisibleTime={hasVisibleTime}
            onChangeValidIntervalEndAction={onChangeValidIntervalEndAction}
            onChangeVisibleIntervalEndAction={onChangeVisibleIntervalEndAction}
            onChangeTemporalModelAction={onChangeTemporalModelAction}
          />
          <div style={detectedStructureStyle}>
            <Meta
              label="Business key"
              value={result.detectedColumns.businessKey ?? "not detected"}
            />

            <Meta
              label="Valid time"
              value={
                hasValidTime
                  ? `${result.detectedColumns.validFrom} → ${result.detectedColumns.validTo}`
                  : "not detected"
              }
            />

            <Meta
              label="Visible time"
              value={
                hasVisibleTime
                  ? `${result.detectedColumns.visibleFrom} → ${result.detectedColumns.visibleTo}`
                  : "not detected"
              }
            />

            <Meta
              label="Snapshot"
              value={
                hasSnapshot
                  ? result.detectedColumns.snapshotDate!
                  : "not detected"
              }
            />
          </div>
        </div>
      </details>

      <details style={detailsStyle}>
        <summary style={summaryStyle}>Technical details</summary>

        <MiniTable rows={result.rows} columns={result.columns} />

        <dl style={metaGridStyle}>
          <Meta label="Rows" value={String(result.rowCount)} />
          <Meta label="Columns" value={String(result.columns.length)} />
          <Meta label="Findings" value={String(result.findings.length)} />
        </dl>
      </details>
    </section>
  );
}

function StoryBlock({ eyebrow, body }: { eyebrow: string; body: string }) {
  return (
    <section style={storyBlockStyle}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <p style={storyTextStyle}>{body}</p>
    </section>
  );
}

function EvidenceSection({
  findings,
}: {
  findings: AnalyzerContext["diagnosis"]["evidence"];
}) {
  const topFindings = findings.slice(0, 3);

  if (topFindings.length === 0) {
    return null;
  }

  return (
    <ReportSection title="Why we reached this conclusion">
      <div style={{ display: "grid", gap: 12 }}>
        {topFindings.map((finding) => (
          <div key={finding.id} style={findingStyle}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SeverityDot severity={finding.severity} />
              <strong>{finding.title}</strong>
            </div>

            <ul style={evidenceListStyle}>
              {finding.evidence.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <div style={recommendationNoteStyle}>
              <strong>Recommendation</strong>
              <br />
              {finding.recommendation}
            </div>
          </div>
        ))}
      </div>

      {findings.length > 3 && (
        <p style={mutedTextStyle}>Showing 3 of {findings.length} findings.</p>
      )}
    </ReportSection>
  );
}

function RiskChip({
  label,
  tone,
}: {
  label: string;
  tone: AnalyzerContext["diagnosis"]["decision"];
}) {
  const color =
    tone === "not_reproducible"
      ? "#fb7185"
      : tone === "partially_reproducible"
        ? "#fbbf24"
        : "#34d399";

  return (
    <span
      style={{
        ...chipStyle,
        color,
        borderColor: `${color}66`,
        background: `${color}18`,
      }}
    >
      {label}
    </span>
  );
}

function AnalysisAssumptionsBar({
  validIntervalEnd,
  visibleIntervalEnd,
  temporalModel,
  hasVisibleTime,
  onChangeValidIntervalEndAction,
  onChangeVisibleIntervalEndAction,
  onChangeTemporalModelAction,
}: {
  validIntervalEnd: IntervalEnd;
  visibleIntervalEnd: IntervalEnd;
  temporalModel: TemporalModel;
  hasVisibleTime: boolean;
  onChangeValidIntervalEndAction: (value: IntervalEnd) => void;
  onChangeVisibleIntervalEndAction: (value: IntervalEnd) => void;
  onChangeTemporalModelAction: (value: TemporalModel) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 7,
        minWidth: 0,
      }}
    >
      <AssumptionToggle
        label="Valid end"
        value={validIntervalEnd}
        options={[
          ["exclusive", "Exclusive"],
          ["inclusive", "Inclusive"],
        ]}
        onChange={onChangeValidIntervalEndAction}
      />

      <AssumptionToggle
        label="Visible end"
        value={visibleIntervalEnd}
        disabledOptions={hasVisibleTime ? [] : ["exclusive", "inclusive"]}
        options={[
          ["exclusive", "Exclusive"],
          ["inclusive", "Inclusive"],
        ]}
        onChange={onChangeVisibleIntervalEndAction}
      />

      <AssumptionToggle
        label="Temporal model"
        value={temporalModel}
        disabledOptions={
          hasVisibleTime ? [] : ["bitemporal", "tritemporal_unknown"]
        }
        options={[
          ["valid_time", "Valid-time"],
          ["bitemporal", "Bitemporal"],
          ["tritemporal_unknown", "Tri-temporal / Unknown"],
        ]}
        onChange={onChangeTemporalModelAction}
      />
    </div>
  );
}

function AssumptionToggle<T extends string>({
  label,
  value,
  options,
  disabledOptions = [],
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  disabledOptions?: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={toggleLabelStyle}>{label}</span>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
        {options.map(([optionValue, optionLabel]) => {
          const disabled = disabledOptions.includes(optionValue);

          return (
            <button
              key={optionValue}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onChange(optionValue);
                }
              }}
              style={{
                ...toggleButtonStyle,
                border:
                  value === optionValue
                    ? "1px solid rgba(147,197,253,0.70)"
                    : "1px solid rgba(255,255,255,0.12)",
                background:
                  value === optionValue
                    ? "rgba(37,99,235,0.32)"
                    : "rgba(15,23,42,0.52)",
                color:
                  value === optionValue ? "#bfdbfe" : "rgba(255,255,255,0.62)",
                opacity: disabled ? 0.35 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  const visibleColumns = columns.slice(0, 8);

  return (
    <div style={{ overflowX: "auto", marginTop: 14, maxWidth: "100%" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {visibleColumns.map((column) => (
              <th key={column} style={thStyle}>
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.slice(0, 8).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {visibleColumns.map((column) => (
                <td key={column} style={tdStyle}>
                  {String(row[column] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={metaLabelStyle}>{label}</dt>
      <dd style={metaValueStyle}>{value}</dd>
    </div>
  );
}

function SeverityDot({ severity }: { severity: "low" | "medium" | "high" }) {
  const color =
    severity === "high"
      ? "#fb7185"
      : severity === "medium"
        ? "#fbbf24"
        : "#34d399";

  return (
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: 999,
        background: color,
        flex: "0 0 auto",
      }}
    />
  );
}

const screenStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,

  overflow: "hidden",

  padding: "clamp(16px,4vw,32px)",

  borderRadius: 22,
  background:
    "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.14), transparent 34%), #020617",

  color: "#fff",

  border: "1px solid rgba(148,163,184,0.24)",

  display: "grid",
  gap: 18,
};

const assumptionsStyle: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
  display: "grid",
  gap: 12,
  minWidth: 0,
  overflow: "hidden",
};

const heroStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,

  overflow: "hidden",

  padding: "24px 0 18px",
};

const titleStyle: CSSProperties = {
  margin: "14px 0 0",
  fontSize: "clamp(28px, 9vw, 44px)",
  lineHeight: 1.08,
  letterSpacing: "-0.045em",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  maxWidth: "100%",
};

const subtitleStyle: CSSProperties = {
  margin: "18px 0 0",
  color: "rgba(255,255,255,0.82)",
  fontSize: "clamp(18px,5vw,26px)",
  lineHeight: 1.55,
  maxWidth: "100%",
  overflowWrap: "anywhere",
};

const riskRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
  color: "rgba(255,255,255,0.58)",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const chipStyle: CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 900,
};

const storyBlockStyle: CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const actionStyle: CSSProperties = {
  padding: 20,
  borderRadius: 18,
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(147,197,253,0.35)",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
  fontWeight: 900,
};

const storyTextStyle: CSSProperties = {
  margin: "9px 0 0",
  color: "rgba(255,255,255,0.74)",
  fontSize: 15.5,
  lineHeight: 1.65,
};

const detailsStyle: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  minWidth: 0,
  overflow: "hidden",
};

const summaryStyle: CSSProperties = {
  cursor: "pointer",
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: 11,
};

const findingStyle: CSSProperties = {
  padding: 16,
  borderRadius: 14,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const recommendationNoteStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  background: "rgba(37,99,235,0.10)",
  color: "#bfdbfe",
  fontSize: 12,
  lineHeight: 1.5,
};

const evidenceListStyle: CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 18,
  color: "rgba(255,255,255,0.68)",
  fontSize: 14,
  lineHeight: 1.55,
};

const mutedTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,255,255,0.52)",
  fontSize: 13,
  lineHeight: 1.5,
};

const toggleLabelStyle: CSSProperties = {
  color: "rgba(255,255,255,0.48)",
  fontSize: 11,
  fontWeight: 900,
};

const toggleButtonStyle: CSSProperties = {
  borderRadius: 999,
  padding: "6px 9px",
  fontSize: 11.5,
  fontWeight: 900,
  cursor: "pointer",
};

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  margin: "14px 0 0",
};

const metaLabelStyle: CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  fontSize: 11,
};

const metaValueStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#ffffff",
  fontSize: 12.5,
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "clamp(9px, 2.4vw, 12px)",
  tableLayout: "fixed",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 6px",
  color: "rgba(255,255,255,0.48)",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const tdStyle: CSSProperties = {
  padding: "8px 6px",
  color: "rgba(255,255,255,0.84)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const consequenceListStyle: CSSProperties = {
  margin: "16px 0 0",
  paddingLeft: 22,
  color: "rgba(255,255,255,0.72)",
  fontSize: 15,
  lineHeight: 1.7,
};

const nextStepsStyle: CSSProperties = {
  margin: "12px 0 0",
  paddingLeft: 20,
  color: "#ffffff",
  fontSize: 15.5,
  lineHeight: 1.75,
  fontWeight: 700,
};

const detectedStructureStyle: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};
