import type {
  AggregatedJoinabilityIssue,
  TemporalIssue,
} from "@/lib/types";
import { track } from "@/lib/analytics";
import { explainJoinIssue } from "@/lib/explainJoinIssue";
import { IssueWhyPanel } from "./IssueWhyPanel";

type SqlPanelProps = {
  sql: string;
  selectedIssue: AggregatedJoinabilityIssue | null;
  selectedTemporalIssue: TemporalIssue | null;
};

type TemporalGuidance = {
  label: string;
  title: string;
  summary: string;
  impact: string;
  action: string;
};

function getTemporalGuidance(issue: TemporalIssue | null): TemporalGuidance | null {
  if (!issue) return null;

  switch (issue.type) {
    case "VALID_GAP":
      return {
        label: "Valid-time coverage gap",
        title: "Missing historical coverage",
        summary:
          "No source record exists for this entity during the selected valid-time interval.",
        impact:
          "Core Layer snapshots may miss this entity state unless the gap is handled explicitly.",
        action:
          "Decide whether this is missing source history, a valid business absence, or requires a placeholder record.",
      };

    case "OVERLAP":
      return {
        label: "Overlap finding",
        title: "Conflicting historical records",
        summary:
          "Multiple records are valid for the same entity during the selected interval.",
        impact:
          "As-of models may return duplicate or ambiguous states unless a precedence rule is defined.",
        action:
          "Define whether one record supersedes another, whether a tie-breaking rule is required, or whether multiple states are valid.",
      };

    case "VISIBILITY_LAG":
      return {
        label: "Visibility lag",
        title: "Delayed source visibility",
        summary:
          "One source appears later than the other across multiple entities.",
        impact:
          "Historical snapshots may differ depending on source arrival time, even when valid-time ranges look correct.",
        action:
          "Consider source latency buffers, delayed publication windows, or visibility-aware snapshot logic.",
      };

    default:
      return null;
  }
}

export function SqlPanel({
  sql,
  selectedIssue,
  selectedTemporalIssue,
}: SqlPanelProps) {
  const explanation = selectedIssue ? explainJoinIssue(selectedIssue) : null;

  const temporalGuidance =
    selectedTemporalIssue && !selectedIssue
      ? getTemporalGuidance(selectedTemporalIssue)
      : null;

  function buildModelingReport() {
    if (selectedIssue && explanation) {
      return `
HISTORICAL MODELING REPORT

Finding: ${explanation.title}

What happened:
${explanation.summary}

Likely cause:
${explanation.cause}

Modeling impact:
${explanation.interpretation}

Context:
Source relationship: ${selectedIssue.source} → ${selectedIssue.targetSource}
Entity: ${
        selectedIssue.isAggregated
          ? `${selectedIssue.count} entities`
          : selectedIssue.entity_id
      }
Valid-time: ${selectedIssue.valid_from} → ${selectedIssue.valid_to}
${
  selectedIssue.visible_from
    ? `Visible-time: ${selectedIssue.visible_from} → ${
        selectedIssue.visible_to || "∞"
      }`
    : ""
}

Suggested modeling actions:
${(explanation.fixes ?? []).map((fix) => `- ${fix}`).join("\n")}

${
  explanation.sqlSuggestion
    ? `Suggested query pattern:\n${explanation.sqlSuggestion}`
    : ""
}
`.trim();
    }

    if (selectedTemporalIssue && temporalGuidance) {
      return `
HISTORICAL MODELING REPORT

Finding: ${temporalGuidance.title}

What happened:
${temporalGuidance.summary}

Modeling impact:
${temporalGuidance.impact}

Suggested modeling action:
${temporalGuidance.action}

Context:
Entity: ${selectedTemporalIssue.entity_id}
Source: ${selectedTemporalIssue.source ?? "n/a"}
Interval: ${selectedTemporalIssue.from ?? "n/a"} → ${
        selectedTemporalIssue.to ?? "n/a"
      }
`.trim();
    }

    return "";
  }

  const hasGuidance =
    Boolean(selectedIssue && explanation) || Boolean(temporalGuidance);

  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Modeling Guidance</h3>

      {!hasGuidance && (
        <div
          style={{
            marginTop: 0,
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            padding: 24,
            color: "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: "#64748b",
              marginBottom: 10,
            }}
          >
            Historical Modeling Guidance
          </div>

          <h2 style={{ marginTop: 0, marginBottom: 16 }}>
            Select a source alignment finding
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: "#475569",
              lineHeight: 1.7,
              maxWidth: 520,
              fontSize: 15,
            }}
          >
            Select a finding from the source analysis panel to understand how
            this historical relationship behaves and what it means for Core
            Layer modeling.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 15,
              color: "#0f172a",
            }}
          >
            <div>→ affected source relationship</div>
            <div>→ historical alignment pattern</div>
            <div>→ modeling impact</div>
            <div>→ suggested investigation steps</div>
          </div>
        </div>
      )}

      {temporalGuidance && selectedTemporalIssue && (
        <>
          <div
            style={{
              marginTop: 0,
              background: "#eff6ff",
              border: "1px solid #60a5fa",
              borderRadius: 12,
              padding: 20,
              fontSize: 13,
              lineHeight: 1.6,
              color: "#0f172a",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#1e40af",
                marginBottom: 6,
              }}
            >
              {temporalGuidance.label}
            </div>

            <h3 style={{ marginTop: 0, marginBottom: 10 }}>
              {temporalGuidance.title}
            </h3>

            <div style={{ marginBottom: 12 }}>
              <strong>What happened</strong>
              <br />
              {temporalGuidance.summary}
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Modeling impact</strong>
              <br />
              {temporalGuidance.impact}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                background: "#ecfdf5",
                border: "1px solid #86efac",
              }}
            >
              <strong>Suggested modeling action</strong>
              <br />
              {temporalGuidance.action}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
              }}
            >
              <strong>Affected interval</strong>
              <div style={{ marginTop: 8 }}>
                Entity {selectedTemporalIssue.entity_id}
                {selectedTemporalIssue.source
                  ? ` · ${selectedTemporalIssue.source}`
                  : ""}
                {selectedTemporalIssue.from && selectedTemporalIssue.to
                  ? ` · ${selectedTemporalIssue.from} → ${selectedTemporalIssue.to}`
                  : ""}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const report = buildModelingReport();
              if (!report) return;

              track("Modeling Report Copied");
              navigator.clipboard.writeText(report);
            }}
            style={{
              display: "block",
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Copy modeling report
          </button>
        </>
      )}
      {selectedIssue && explanation && (
        <>
          <div
            style={{
              marginTop: 0,
              background:
                explanation.severity === "error" ? "#fee2e2" : "#fff7ed",
              border:
                explanation.severity === "error"
                  ? "1px solid #ef4444"
                  : "1px solid #f59e0b",
              borderRadius: 12,
              padding: 18,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: explanation.severity === "error" ? "#991b1b" : "#92400e",
                marginBottom: 8,
              }}
            >
              {selectedIssue.type === "JOIN_AMBIGUITY"
                ? "Ambiguous Temporal Join"
                : "Missing Temporal Match"}
            </div>
              
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                fontSize: 15,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 14,
              }}
            >
              {explanation.headline}
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <strong>Problem</strong>
              <br />
              {explanation.summary}
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <strong>Impact</strong>
              <br />
              {explanation.interpretation}
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <strong>Investigate</strong>
              <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                {explanation.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
              
            {explanation.fixes && explanation.fixes.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: "#ecfdf5",
                  border: "1px solid #86efac",
                }}
              >
                <strong>Suggested action</strong>
                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                  {explanation.fixes.map((fix) => (
                    <li key={fix}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}
      
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                color: "#334155",
              }}
            >
              <strong style={{ color: "#0f172a" }}>
                {selectedIssue.isAggregated ? "Affected pattern" : "Context"}
              </strong>
            
              <div style={{ marginTop: 8 }}>
                {selectedIssue.source} → {selectedIssue.targetSource}
              </div>
            
              <div>
                Entity:{" "}
                {selectedIssue.isAggregated
                  ? `${selectedIssue.count} entities affected`
                  : selectedIssue.entity_id}
              </div>
                
              <div>
                Valid-time: {selectedIssue.valid_from} → {selectedIssue.valid_to}
              </div>
                
              {selectedIssue.isAggregated && selectedIssue.entityIds && (
                <div style={{ marginTop: 6 }}>
                  Examples: {selectedIssue.entityIds.slice(0, 8).join(", ")}
                  {selectedIssue.entityIds.length > 8 ? " …" : ""}
                </div>
              )}
            </div>
          </div>
            
          <IssueWhyPanel
            selectedIssue={selectedIssue}
            selectedTemporalIssue={selectedTemporalIssue}
          />
      
          <button
            onClick={() => {
              const report = buildModelingReport();
              if (!report) return;
            
              track("Modeling Report Copied");
              navigator.clipboard.writeText(report);
            }}
            style={{
              display: "block",
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "#020617";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#0f172a";
            }}
          >
            Copy modeling report
          </button>
        </>
      )}

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.7,
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          SNAPSHOT SQL FILTER
        </div>

        <pre
          style={{
            margin: 0,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#111827",
            color: "#e5e7eb",
            border: "none",
            whiteSpace: "pre-wrap",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {sql || "SQL filter for the active historical snapshot."}
        </pre>

        <button
          onClick={() => {
            track("SQL Copied");
            if (!sql) return;
            navigator.clipboard.writeText(sql);
          }}
          disabled={!sql}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: sql ? "#0f172a" : "#e2e8f0",
            color: sql ? "#ffffff" : "#64748b",
            border: "none",
            cursor: sql ? "pointer" : "not-allowed",
            fontWeight: 700,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!sql) return;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Copy Snapshot Filter
        </button>
      </div>
    </div>
  );
}