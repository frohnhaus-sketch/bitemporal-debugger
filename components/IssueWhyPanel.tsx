import type {
  AggregatedJoinabilityIssue,
  TemporalIssue,
} from "@/lib/types";

type IssueWhyPanelProps = {
  selectedIssue: AggregatedJoinabilityIssue | null;
  selectedTemporalIssue: TemporalIssue | null;
};

function formatReason(reason?: string) {
  if (reason === "NO_VISIBLE_OVERLAP") return "No visible-time overlap";
  if (reason === "NO_VALID_MATCH") return "No valid-time match";
  if (reason === "MULTIPLE_MATCHES") return "Multiple matches";

  return reason ?? "Unknown reason";
}

function getTitle(
  issue: TemporalIssue | null,
  joinIssue: AggregatedJoinabilityIssue | null
) {
  if (joinIssue?.type === "JOIN_AMBIGUITY") {
    return "Multiple rows match the same temporal join";
  }

  if (joinIssue?.type === "JOIN_GAP") {
    return "No matching row exists for this temporal join";
  }

  if (issue?.type === "VALID_GAP") {
    return "A valid-time gap exists in this source history";
  }

  if (issue?.type === "OVERLAP") {
    return "Overlapping historical intervals exist";
  }

  if (issue?.type === "VISIBILITY_LAG") {
    return "Historical changes become visible later than their valid-time effect";
  }

  if (issue?.type === "SNAPSHOT_DRIFT") {
    return "Validation result changed between visible-time snapshots";
  }

  if (issue?.type === "DIMENSION_COMPLETION_RISK") {
    return "The dimension does not cover the full historical interval";
  }

  return issue?.title ?? "Validation Finding";
}

function getExplanation(
  issue: TemporalIssue | null,
  joinIssue: AggregatedJoinabilityIssue | null
) {
  if (joinIssue?.type === "JOIN_AMBIGUITY") {
    return "The temporal join finds more than one matching historical row. Validate whether the relationship should be one-to-one at this interval. Otherwise this can duplicate facts, inflate KPIs or make the result nondeterministic.";
  }

  if (joinIssue?.type === "JOIN_GAP") {
    return "The selected source interval cannot be resolved against the target source. Validate whether the target history has a gap, delayed visibility or incompatible valid-time boundaries. A strict temporal join may drop this row or leave related attributes empty.";
  }

  if (issue?.type === "VALID_GAP") {
    return "The source has a period where no valid historical row exists. Validate whether this gap is expected business behavior or whether the history should be completed before joining or deploying the model.";
  }

  if (issue?.type === "OVERLAP") {
    return "More than one row is valid for the same entity and time range. Validate whether this represents a real parallel state or an invalid SCD2 overlap that could create duplicate matches.";
  }

  if (issue?.type === "VISIBILITY_LAG") {
    return "A historical change is valid earlier than it becomes visible. Validate whether this delay is expected business behavior, or whether the model may produce different answers depending on the visible-time perspective.";
  }

  if (issue?.type === "SNAPSHOT_DRIFT") {
    return "The same historical validation produces a different result when evaluated from a later visible-time snapshot. This usually means late-arriving records changed what the model could know at the earlier point in time.";
  }

  if (issue?.type === "DIMENSION_COMPLETION_RISK") {
    return "The target source covers only part of the required historical interval. Historical facts, contracts or core entities may exist for periods where no matching dimension record is available. This can lead to incomplete attributes, missing joins or incorrect historical snapshots.";
  }

  return issue?.explanation ?? "Review this finding before deploying the historical model.";
}

function getChecks(
  issue: TemporalIssue | null,
  joinIssue: AggregatedJoinabilityIssue | null
) {
  if (joinIssue?.type === "JOIN_AMBIGUITY") {
    return [
      "Check whether the target source has overlapping valid-time intervals.",
      "Check whether the join key is specific enough.",
      "Decide whether the relationship should be one-to-one or one-to-many.",
      "If one row should win, define a deterministic prioritization rule.",
    ];
  }

  if (joinIssue?.type === "JOIN_GAP") {
    return [
      "Check whether the target source has a valid-time gap.",
      "Check whether valid_from / valid_to boundaries are aligned.",
      "Check whether visible_from starts later than expected.",
      "Decide whether the relationship is optional or must always match.",
    ];
  }

  if (issue?.type === "VALID_GAP") {
    return [
      "Check whether the gap is expected business behavior.",
      "Check whether valid_to and the next valid_from should be contiguous.",
      "Check whether missing source records need to be backfilled.",
      "Check whether downstream joins assume continuous history.",
    ];
  }

  if (issue?.type === "OVERLAP") {
    return [
      "Check whether two rows are valid for the same entity at the same time.",
      "Check whether the overlap is valid business behavior.",
      "Check whether a closing valid_to value is wrong.",
      "Decide whether the overlap should be cleaned, split or prioritized.",
    ];
  }

  if (issue?.type === "VISIBILITY_LAG") {
    return [
      "Check whether visible_from starts later than valid_from.",
      "Validate whether the delay is expected business behavior.",
      "Check whether snapshot reporting uses valid time, visible time or both.",
      "Decide whether late-arriving history should be handled explicitly.",
    ];
  }

  if (issue?.type === "SNAPSHOT_DRIFT") {
    return [
      "Compare the early and later visible-time snapshots.",
      "Check which entities changed their validation status.",
      "Validate whether the drift is expected late-arriving history.",
      "Decide whether historical reports must be reproducible as originally visible or recalculated with later knowledge.",
    ];
  }

  if (issue?.type === "DIMENSION_COMPLETION_RISK") {
    return [
      "Check whether the dimension history starts early enough.",
      "Validate SCD2 generation and backfilling logic.",
      "Verify that every fact interval has matching dimension coverage.",
      "Test month-end and as-of snapshots for missing attributes.",
    ];
  }

  return [
    "Inspect the timeline evidence.",
    "Compare the affected source records.",
    "Validate whether this behavior is expected before deploying.",
  ];
}

export function IssueWhyPanel({
  selectedIssue,
  selectedTemporalIssue,
}: IssueWhyPanelProps) {
  const joinIssue =
    selectedTemporalIssue?.originalIssue?.kind === "join"
      ? selectedTemporalIssue.originalIssue.issue
      : selectedIssue;

  if (!selectedTemporalIssue && !joinIssue) {
    return null;
  }

  const title = getTitle(selectedTemporalIssue, joinIssue);
  const explanation = getExplanation(selectedTemporalIssue, joinIssue);
  const checks = getChecks(selectedTemporalIssue, joinIssue);

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 8,
        }}
      >
        Why this finding exists
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {joinIssue && (        
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "#475569",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 800, color: "#334155", marginBottom: 4 }}>
            Affected interval
          </div>
          <div>
            <strong>Entity:</strong>{" "}
            {joinIssue.isAggregated
              ? `${joinIssue.count} entities`
              : joinIssue.entity_id}
          </div>

          <div>
            <strong>Source:</strong>{" "}
            {joinIssue.source} → {joinIssue.targetSource}
          </div>

          <div>
            <strong>Valid interval:</strong>{" "}
            {joinIssue.valid_from} → {joinIssue.valid_to}
          </div>

          <div>
            <strong>Reason:</strong>{" "}
            {formatReason(joinIssue.reason)}
          </div>
        </div>
      )}

      {!joinIssue && selectedTemporalIssue && (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "#475569",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 800, color: "#334155", marginBottom: 4 }}>
            Affected interval
          </div>
          {selectedTemporalIssue.type === "SNAPSHOT_DRIFT" ? (
            <>
              <div>
                <strong>Comparison:</strong> Visible-time snapshots
              </div>
          
              {selectedTemporalIssue.from && selectedTemporalIssue.to && (
                <div>
                  <strong>Visible-time range:</strong>{" "}
                  {selectedTemporalIssue.from} → {selectedTemporalIssue.to}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <strong>Entity:</strong> {selectedTemporalIssue.entity_id}
              </div>
          
              <div>
                <strong>Source:</strong> {selectedTemporalIssue.source}
              </div>
          
              {selectedTemporalIssue.from && selectedTemporalIssue.to && (
                <div>
                  <strong>Interval:</strong>{" "}
                  {selectedTemporalIssue.from} → {selectedTemporalIssue.to}
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div
        style={{
          padding: 10,
          borderRadius: 10,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#334155",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            marginBottom: 6,
          }}
        >
          What it means
        </div>
        {explanation}
      </div>
      <div
        style={{
          padding: 10,
          borderRadius: 10,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#334155",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            marginBottom: 6,
          }}
        >
          Suggested Validation Checks
        </div>

        {checks.map((check) => (
          <div key={check} style={{ marginBottom: 4 }}>
            ✓ {check}
          </div>
        ))}
      </div>
    </div>
  );
}