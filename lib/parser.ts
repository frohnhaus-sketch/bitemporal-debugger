export function detectDelimiter(text: string) {
  const firstLine = text.trim().split("\n")[0];

  if (firstLine.includes("\t")) return "\t";
  if (firstLine.includes(";")) return ";";
  return ",";
}

export function parseCSV(text: string) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .filter(line => line && !line.startsWith("#"));

  const delimiter = detectDelimiter(text);
  const headers = lines[0].split(delimiter).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const obj: any = {};

    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() ?? "";
    });

    return obj;
  });
}