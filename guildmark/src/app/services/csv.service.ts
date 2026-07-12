/**
 * CSV parsing helpers — quoted fields and comma-in-value without a library
 * dependency. Shared by the listing/asset import dialogs.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((h, ndx) => [h.trim(), (values[ndx] ?? "").trim()]));
  });
}

export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let ndx = 0; ndx < line.length; ndx++) {
    const ch = line[ndx];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}
