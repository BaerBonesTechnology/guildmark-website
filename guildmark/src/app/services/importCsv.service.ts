/**
 * Import Assets (CSV) service — template download + asset-row parsing.
 * Uses a dedicated CSV line parser that also handles escaped double-quotes
 * ("") and normalizes headers, which the generic csv.service does not.
 */
import {
  TEMPLATE_EXAMPLE, TEMPLATE_HEADERS, VALID_ASSET_TYPES, VALID_GRADES,
} from "../constants/importCsv.constants";
import type { LocalAsset } from "../models/localAsset";

export interface ParsedRow {
  asset: Partial<LocalAsset>;
  errors: string[];
  raw: Record<string, string>;
  rowNum: number;
}

export function downloadTemplate(): void {
  const rows = [
    TEMPLATE_HEADERS.join(","),
    TEMPLATE_EXAMPLE.map((v) => `"${v}"`).join(","),
  ].join("\n");
  const blob = new Blob([rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "guildmark-asset-import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQ = false;
  for (let ndx = 0; ndx < line.length; ndx++) {
    const ch = line[ndx];
    if (ch === '"') {
      if (inQ && line[ndx + 1] === '"') { cur += '"'; ndx++; }
      else { inQ = !inQ; }
    } else if (ch === "," && !inQ) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseAssetCsv(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  return lines.slice(1).map((line, ndx) => {
    const values = parseLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h] = values[idx] ?? ""; });

    const errors: string[] = [];
    const model = (raw.model_name || raw.model || "").trim();
    const type = (raw.asset_type || raw.type || "").toLowerCase().trim();
    const grade = (raw.condition_grade || raw.condition || "").toUpperCase().trim();
    const fmvStr = raw.fair_market_value || raw.fmv || raw.value || "";
    const bookStr = raw.book_value || raw.book || "";
    const ageStr = raw.age_months || raw.age || "";

    if (!model) errors.push("model_name is required");
    if (!VALID_ASSET_TYPES.includes(type)) errors.push(`asset_type must be one of: ${VALID_ASSET_TYPES.join(", ")}`);
    if (!VALID_GRADES.includes(grade)) errors.push("condition_grade must be A, B, or C");
    const fmv = parseFloat(fmvStr);
    const book = parseFloat(bookStr) || fmv;
    const age = parseInt(ageStr);
    if (isNaN(fmv) || fmv < 0) errors.push("fair_market_value must be a positive number");
    if (isNaN(age) || age < 0) errors.push("age_months must be a non-negative integer");

    const qty = parseInt(raw.quantity || "1") || 1;
    const dep = book > 0 ? parseFloat((((book - fmv) / book) * 100).toFixed(1)) : 0;

    const typePretty = type.charAt(0).toUpperCase() + type.slice(1);

    const asset: Partial<LocalAsset> = errors.length === 0
      ? {
          id: crypto.randomUUID(),
          model,
          type: typePretty,
          condition: grade as "A" | "B" | "C",
          quantity: qty,
          age,
          fairMarketValue: fmv,
          bookValue: book,
          depreciation: dep,
          serialNumber: (raw.serial_number || raw.serial || "").trim() || null,
          department: (raw.department || "").trim() || null,
          status: dep >= 30 ? "At Risk" : "Active",
          lastSync: "Just now",
          source: "csv",
        }
      : {};

    return { raw, asset, errors, rowNum: ndx + 2 };
  });
}
