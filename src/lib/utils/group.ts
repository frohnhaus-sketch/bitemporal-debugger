export function groupRowsByKey(rows: any[], keyColumn: string) {
  const groups = new Map<string, any[]>();

  rows.forEach((row) => {
    const key = String(row[keyColumn] ?? "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  return groups;
}