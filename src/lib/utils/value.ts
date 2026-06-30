export function isMissingValue(value: unknown) {
  if (value === null || value === undefined) return true;

  const text = String(value).trim().toLowerCase();

  return (
    text === "" ||
    text === "null" ||
    text === "none" ||
    text === "undefined" ||
    text === "n/a" ||
    text === "na" ||
    text === "-"
  );
}