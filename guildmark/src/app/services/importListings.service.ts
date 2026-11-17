/** Import Listings service — row validation into the create-listing payload. */

export interface ParsedRow {
  asset_type: string;
  condition: string;
  cpu_score?: number;
  listed_price: number;
  model_name: string;
  quantity: number;
  ram_gb?: number;
  reason?: string;
  serial_number?: string;
  storage_gb?: number;
}

export type RowStatus = "done" | "error" | "importing" | "pending";

export interface RowState {
  error?: string;
  row: ParsedRow;
  status: RowStatus;
}

export const REQUIRED_COLUMNS = ["model_name", "asset_type", "condition", "quantity", "listed_price"] as const;

/** Returns a validated ParsedRow, or an error-message string for row `index`. */
export function validateRow(raw: Record<string, string>, index: number): ParsedRow | string {
  for (const field of REQUIRED_COLUMNS) {
    if (!raw[field]) return `Row ${index + 1}: missing "${field}"`;
  }
  const quantity = parseInt(raw.quantity, 10);
  const listed_price = parseFloat(raw.listed_price);
  if (isNaN(quantity) || quantity <= 0) return `Row ${index + 1}: invalid quantity`;
  if (isNaN(listed_price) || listed_price <= 0) return `Row ${index + 1}: invalid listed_price`;

  return {
    model_name: raw.model_name,
    asset_type: raw.asset_type,
    condition: raw.condition,
    quantity,
    listed_price,
    ram_gb: raw.ram_gb ? parseFloat(raw.ram_gb) : undefined,
    storage_gb: raw.storage_gb ? parseFloat(raw.storage_gb) : undefined,
    cpu_score: raw.cpu_score ? parseInt(raw.cpu_score, 10) : undefined,
    serial_number: raw.serial_number || undefined,
    reason: raw.reason || undefined,
  };
}
