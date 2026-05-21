export function parseTemporalValue(value: string) {
  if (!value) return Infinity;

  const normalized = value.trim().replace(" ", "T");
  const timestamp = new Date(normalized).getTime();

  return Number.isNaN(timestamp) ? Infinity : timestamp;
}

export function closedDateIntervalsOverlap(
  aFrom: string,
  aTo: string,
  bFrom: string,
  bTo: string
) {
  const aStart = parseTemporalValue(aFrom);
  const aEnd = parseTemporalValue(aTo);
  const bStart = parseTemporalValue(bFrom);
  const bEnd = parseTemporalValue(bTo);

  return aStart <= bEnd && bStart <= aEnd;
}

export function halfOpenTimestampIntervalsOverlap(
  aFrom: string,
  aTo: string,
  bFrom: string,
  bTo: string
) {
  const aStart = parseTemporalValue(aFrom);
  const aEnd = parseTemporalValue(aTo);
  const bStart = parseTemporalValue(bFrom);
  const bEnd = parseTemporalValue(bTo);

  return aStart < bEnd && bStart < aEnd;
}