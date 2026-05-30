export type HeaderMapping = {
  original: string;
  normalized: string;
};

export type ParseResult = {
  rows: any[];
  headerMappings: HeaderMapping[];
};

const COLUMN_ALIASES: Record<string, string> = {
  id: "entity_id",
  entity: "entity_id",
  entity_id: "entity_id",
  contract_id: "entity_id",
  object_id: "entity_id",
  customer_id: "entity_id",
  account_id: "entity_id",

  source: "source",
  table: "source",
  table_name: "source",
  dataset: "source",

  value: "value",
  status: "value",
  state: "value",
  type: "value",

  valid_from: "valid_from",
  valid_start: "valid_from",
  valid_start_date: "valid_from",
  start_date: "valid_from",
  from_date: "valid_from",
  effective_from: "valid_from",
  effective_start: "valid_from",

  valid_to: "valid_to",
  valid_end: "valid_to",
  valid_end_date: "valid_to",
  end_date: "valid_to",
  to_date: "valid_to",
  effective_to: "valid_to",
  effective_end: "valid_to",

  visible_from: "visible_from",
  system_from: "visible_from",
  system_start: "visible_from",
  transaction_from: "visible_from",
  transaction_start: "visible_from",
  created_at: "visible_from",
  inserted_at: "visible_from",
  loaded_at: "visible_from",
  updated_at: "visible_from",

  visible_to: "visible_to",
  system_to: "visible_to",
  system_end: "visible_to",
  transaction_to: "visible_to",
  transaction_end: "visible_to",
  deleted_at: "visible_to",
  removed_at: "visible_to",
  expired_at: "visible_to",
};

const REQUIRED_COLUMNS = ["entity_id", "valid_from", "valid_to"];

function looksLikeDate(value: string | undefined) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}/.test(value.trim());
}

function looksLikeHeaderCell(value: string | undefined) {
  if (!value) return false;

  const key = value.trim().toLowerCase();

  return (
    key in COLUMN_ALIASES ||
    key.includes("valid") ||
    key.includes("visible") ||
    key.includes("system") ||
    key.includes("transaction") ||
    key.includes("entity") ||
    key.endsWith("_id") ||
    key === "id" ||
    key === "value" ||
    key === "status"
  );
}

function inferHeaderlessMapping(firstValues: string[]): HeaderMapping[] {
  const columnCount = firstValues.length;

  const inferred =
    columnCount <= 3
      ? ["entity_id", "valid_from", "valid_to"]
      : columnCount === 4
      ? ["entity_id", "value", "valid_from", "valid_to"]
      : columnCount === 5
      ? ["entity_id", "value", "valid_from", "valid_to", "visible_from"]
      : [
          "entity_id",
          "value",
          "valid_from",
          "valid_to",
          "visible_from",
          "visible_to",
        ];

  return firstValues.map((_, index) => ({
    original: `column_${index + 1}`,
    normalized: inferred[index] ?? "",
  }));
}

function hasUsableHeaders(values: string[]) {
  const normalized = values.map((value) => normalizeHeader(value).normalized);

  const hasRequiredColumns = REQUIRED_COLUMNS.every((required) =>
    normalized.includes(required)
  );

  const hasHeaderLikeCells = values.some((value) => looksLikeHeaderCell(value));
  const firstRowLooksLikeData =
    values.length >= 3 && looksLikeDate(values[1]) && looksLikeDate(values[2]);

  return hasRequiredColumns || (hasHeaderLikeCells && !firstRowLooksLikeData);
}

export function normalizeHeader(header: string): HeaderMapping {
  const original = header.trim();
  const key = original.toLowerCase();

  let normalized =
    COLUMN_ALIASES[key] ||
    (key.includes("valid_from")
      ? "valid_from"
      : key.includes("valid_to")
      ? "valid_to"
      : key.includes("visible_from") || key.includes("system_from")
      ? "visible_from"
      : key.includes("visible_to") || key.includes("system_to")
      ? "visible_to"
      : key.includes("entity_id") || key.endsWith("_id")
      ? "entity_id"
      : key);

  normalized = normalized
    .replace(/^bk_/, "")
    .replace(/^sys_/, "")
    .replace(/^technical_/, "");

  return { original, normalized };
}

function normalizeValue(value: string | undefined) {
  const trimmed = (value ?? "").trim();

  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "none"
  ) {
    return "";
  }

  return trimmed;
}

export function detectDelimiter(text: string) {
  const firstLine =
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))[0] ?? "";

  if (firstLine.includes("\t")) return "\t";
  if (firstLine.includes(";")) return ";";
  return ",";
}

export function parseCSV(text: string): ParseResult {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));

  if (lines.length === 0) {
    return {
      rows: [],
      headerMappings: [],
    };
  }

  const delimiter = detectDelimiter(text);
  const firstValues = lines[0].split(delimiter).map(normalizeValue);

  const useHeaderRow = hasUsableHeaders(firstValues);

  const headerMappings = useHeaderRow
    ? firstValues.map((h) => normalizeHeader(h))
    : inferHeaderlessMapping(firstValues);

  const headers = headerMappings.map((h) => h.normalized);
  const dataLines = useHeaderRow ? lines.slice(1) : lines;

  const rows = dataLines.map((line) => {
    const values = line.split(delimiter);
    const obj: any = {};

    headers.forEach((h, i) => {
      if (!h) return;
      obj[h] = normalizeValue(values[i]);
    });

    if (!obj.source) {
      obj.source = "default";
    }

    if (!obj.value) {
      obj.value = "";
    }

    if (!obj.visible_from) {
      obj.visible_from = obj.valid_from || "";
    }

    if (!obj.visible_to) {
      obj.visible_to = "9999-12-31T00:00:00";
    }

    return obj;
  });

  return {
    rows,
    headerMappings,
  };
}