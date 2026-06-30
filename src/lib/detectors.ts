import type { HeaderMapping } from "@/lib/types";

export function detectColumnOriginal(
  headers: HeaderMapping[],
  candidates: string[],
) {
  const match = headers.find((h) => candidates.includes(h.normalized));
  return match?.original ?? null;
}

export function detectDimensionColumns(columns: string[]) {
  const excluded = new Set([
    "business_key",
    "entity_id",
    "id",
    "contract_id",
    "policy_id",
    "valid_from",
    "valid_to",
    "visible_from",
    "visible_to",
    "snapshot_date",
    "event_id",
    "event_time",
    "event_type",
  ]);

  return columns.filter((column) => {
    if (excluded.has(column)) return false;

    return (
      column.endsWith("_key") ||
      column.endsWith("_code") ||
      column.startsWith("customer") ||
      column.startsWith("product") ||
      column.startsWith("agent")
    );
  });
}

export function detectColumn(columns: string[], candidates: string[]) {
  const exact = candidates.find((c) => columns.includes(c));
  if (exact) return exact;

  for (const column of columns) {
    for (const candidate of candidates) {
      if (column.includes(candidate)) return column;
    }
  }

  return null;
}