export type SourcePatternType =
  | "STATE_SOURCE"
  | "EVENT_SOURCE"
  | "SNAPSHOT_SOURCE"
  | "RETROACTIVE_SOURCE"
  | "UNKNOWN";

export type SourcePatternResult = {
  pattern: SourcePatternType;
  label: string;
  confidence: number;
  indicators: string[];
  modelingInsight: string;
};

type Row = {
  entity_id?: string | number;
  valid_from?: string;
  valid_to?: string | null;
  visible_from?: string;
  visible_to?: string | null;
};

function daysBetween(from?: string, to?: string | null) {
  if (!from || !to || to.startsWith("9999")) return null;

  const start = new Date(from).getTime();
  const end = new Date(to).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
}

export function detectSourcePattern(rows: Row[]): SourcePatternResult {
  if (!rows.length) {
    return {
      pattern: "UNKNOWN",
      label: "Unknown",
      confidence: 0,
      indicators: ["No records available"],
      modelingInsight: "Upload and analyze records to detect a historical source pattern.",
    };
  }

  const entityIds = new Set(rows.map((r) => String(r.entity_id ?? "")));
  const entityCount = Math.max(entityIds.size, 1);
  const recordsPerEntity = rows.length / entityCount;

  const durations = rows
    .map((r) => daysBetween(r.valid_from, r.valid_to))
    .filter((d): d is number => d !== null);

  const avgDurationDays =
    durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : null;

  const shortIntervals =
    durations.length > 0
      ? durations.filter((d) => d <= 1).length / durations.length
      : 0;

  const openEndedRatio =
    rows.filter((r) => !r.valid_to || String(r.valid_to).startsWith("9999"))
      .length / rows.length;

  const visibilityCorrections =
    rows.filter(
      (r) =>
        r.visible_from &&
        r.valid_from &&
        new Date(r.visible_from).getTime() > new Date(r.valid_from).getTime()
    ).length / rows.length;

  const indicators: string[] = [];

  let eventScore = 0;
  let stateScore = 0;
  let retroScore = 0;

  if (recordsPerEntity >= 5) {
    eventScore += 35;
    indicators.push("High number of records per entity");
  } else {
    stateScore += 25;
    indicators.push("Low number of records per entity");
  }

  if (avgDurationDays !== null && avgDurationDays <= 7) {
    eventScore += 30;
    indicators.push("Short validity intervals");
  }

  if (avgDurationDays !== null && avgDurationDays > 30) {
    stateScore += 30;
    indicators.push("Long validity intervals");
  }

  if (shortIntervals > 0.5) {
    eventScore += 20;
    indicators.push("Many point-like or very short intervals");
  }

  if (openEndedRatio > 0.3) {
    stateScore += 20;
    indicators.push("Many open-ended current-state records");
  }

  if (visibilityCorrections > 0.25) {
    retroScore += 40;
    indicators.push("Many records become visible after their valid date");
  }

  if (retroScore >= 40) {
    return {
      pattern: "RETROACTIVE_SOURCE",
      label: "Likely Retroactive Source",
      confidence: Math.min(95, retroScore + 40),
      indicators,
      modelingInsight:
        "This source appears to contain retroactive corrections. Historical reporting should consider both valid time and visible time.",
    };
  }

  if (eventScore > stateScore) {
    return {
      pattern: "EVENT_SOURCE",
      label: "Likely Event Source",
      confidence: Math.min(95, eventScore),
      indicators,
      modelingInsight:
        "This source behaves like an event-based history. Joining it to state sources may require event-to-state modeling patterns.",
    };
  }

  return {
    pattern: "STATE_SOURCE",
    label: "Likely State Source",
    confidence: Math.min(95, stateScore || 50),
    indicators,
    modelingInsight:
      "This source behaves like a state-based history. It is usually suitable for SCD2-style joins and snapshot reporting.",
  };
}