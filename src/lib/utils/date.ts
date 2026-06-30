export function nextMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 2, 0);
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseDate(value: unknown) {
  if (!value) return null;

  const text = String(value).trim();

  if (!text || text.toLowerCase() === "null") return null;
  if (text.startsWith("9999-12-31")) return new Date("9999-12-31T00:00:00");

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}