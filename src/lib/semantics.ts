import type {
  HistoricalSemantics,
  IntervalEndSemantics,
  SnapshotMeaning,
} from "@/lib/types";

export function emptySemantics(): HistoricalSemantics {
  return {
    validIntervalEnd: "exclusive",
    visibleIntervalEnd: "exclusive",
    snapshotMeaning: "none",
    openEndedValue: "none",
    correctionMode: "valid_time",
    detectedSignals: [],
    confidence: {
      validIntervalEnd: 0,
      visibleIntervalEnd: 0,
      snapshotMeaning: 0,
      openEndedValue: 0,
      correctionMode: 0,
    },
    explanations: [],
  };
}

export function inferSnapshotMeaning(snapshotColumn: string): SnapshotMeaning {
  if (
    ["month_end", "snapshot_date", "reference_date", "bk_reference_date"].includes(snapshotColumn)
  ) {
    return "period_end";
  }

  if (["reporting_date", "as_of_date", "stichtag"].includes(snapshotColumn)) {
    return "reporting_timestamp";
  }

  return "period_end";
}