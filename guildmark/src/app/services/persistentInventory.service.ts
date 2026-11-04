import type { Asset, AssetType, ConditionGrade } from "../models/asset";
import type { PaginatedResponse } from "../models/pagination";

export const INVENTORY_TYPES = ["laptop", "desktop", "server", "phone", "tablet", "networking", "monitor", "software", "license", "other"] as const;
export interface InventoryInput {
  model_name: string; asset_type: AssetType; condition_grade: ConditionGrade; quantity: number;
  purchase_date?: string | null; original_purchase_price?: number | null;
  cpu_score?: number | null; ram_gb?: number | null; storage_gb?: number | null;
  serial_number?: string | null; department?: string | null;
}
export type InventoryAsset = Asset & { archived_at?: string | null; archived?: boolean };
export interface InventoryClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
/** Software and licenses occupy records, but not physical-device capacity. */
export function physicalInventoryUnits(assets: Array<Pick<InventoryInput, "asset_type" | "quantity"> & { archived?: boolean; archived_at?: string | null }>): number {
  return assets.filter(a => !a.archived && !a.archived_at && a.asset_type !== "software" && a.asset_type !== "license").reduce((sum, a) => sum + a.quantity, 0);
}
export function fitsPhysicalCapacity(input: InventoryInput[], used: number, limit: number, replaced?: InventoryAsset): boolean {
  const next = used - (replaced ? physicalInventoryUnits([replaced]) : 0) + physicalInventoryUnits(input);
  // A retained over-limit account can still reduce hardware counts or add zero-device records.
  return next <= limit || next <= used;
}
const fields = ["model_name", "asset_type", "condition_grade", "quantity", "purchase_date", "original_purchase_price", "cpu_score", "ram_gb", "storage_gb", "serial_number", "department"] as const;
const numericFields = ["original_purchase_price", "cpu_score", "ram_gb", "storage_gb"] as const;
/** Whitelist fields: imported IDs/company IDs can never override server ownership. */
export function inventoryInput(raw: Record<string, unknown>): InventoryInput {
  const model = String(raw.model_name ?? "").trim();
  if (!model || model.length > 200) throw new Error("Model name is required (200 characters maximum).");
  const type = String(raw.asset_type ?? "").toLowerCase();
  if (!(INVENTORY_TYPES as readonly string[]).includes(type)) throw new Error("Choose a supported asset type.");
  const grade = String(raw.condition_grade ?? "").toUpperCase();
  if (!["A", "B", "C"].includes(grade)) throw new Error("Condition must be A, B or C.");
  const quantity = Number(raw.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error("Quantity must be a whole number from 1 to 100,000.");
  const result: InventoryInput = { model_name: model, asset_type: type as AssetType, condition_grade: grade as ConditionGrade, quantity };
  for (const field of numericFields) {
    const value = raw[field];
    if (value == null || value === "") { if (field in raw) result[field] = null; continue; }
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new Error(`${field.replaceAll("_", " ")} must be a nonnegative number.`);
    if ((field === "ram_gb" || field === "storage_gb") && !Number.isInteger(number)) throw new Error(`${field.replaceAll("_", " ")} must be a whole number.`);
    result[field] = number;
  }
  if ("purchase_date" in raw) {
    const date = String(raw.purchase_date ?? "").slice(0, 10);
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || Date.parse(date) > Date.now())) throw new Error("Purchase date must be a valid date that is not in the future.");
    result.purchase_date = date || null;
  }
  for (const field of ["serial_number", "department"] as const) if (field in raw) result[field] = String(raw[field] ?? "").trim() || null;
  return result;
}

export function inventoryApi(client: InventoryClient) {
  return {
    async listAll(includeArchived = false): Promise<InventoryAsset[]> {
      const records: InventoryAsset[] = [];
      const seen = new Set<string>();
      for (let page = 1; page <= 10000; page++) {
        const response = await client.get<PaginatedResponse<InventoryAsset>>(`/amps/assets?page=${page}&page_size=100${includeArchived ? "&include_archived=true" : ""}`);
        if (!Array.isArray(response.data) || !Number.isInteger(response.total_pages) || response.total_pages < 0 || response.page !== page) throw new Error("Inventory pagination changed. Refresh and try again.");
        for (const asset of response.data) {
          if (seen.has(asset.id)) throw new Error("Inventory changed during loading. Refresh to get a complete export.");
          seen.add(asset.id); records.push(asset);
        }
        if (page >= response.total_pages) {
          if (records.length !== response.total) throw new Error("Inventory changed during loading. Refresh to get complete records.");
          return records;
        }
        if (!response.data.length) throw new Error("Inventory page was empty. Refresh and try again.");
      }
      throw new Error("Inventory is too large for this view. Contact support for a complete export.");
    },
    create: (input: InventoryInput, key: string) => client.post<InventoryAsset>("/amps/assets", { ...inventoryInput(input as unknown as Record<string, unknown>), idempotency_key: key }),
    update: (id: string, input: InventoryInput) => client.patch<InventoryAsset>(`/amps/assets/${encodeURIComponent(id)}`, inventoryInput(input as unknown as Record<string, unknown>)),
    archive: (id: string) => client.delete<{ archived: boolean; id: string }>(`/amps/assets/${encodeURIComponent(id)}`),
    import: (assets: InventoryInput[], key: string) => {
      if (!assets.length || assets.length > 50) throw new Error("Import 1–50 records at a time. No rows were saved.");
      return client.post<{ assets: InventoryAsset[]; imported_records: number; imported_units: number }>("/amps/assets/import", { assets: assets.map(asset => inventoryInput(asset as unknown as Record<string, unknown>)), idempotency_key: key });
    },
  };
}
export function inventoryError(error: unknown): string {
  const e = error as { code?: string; status?: number; message?: string };
  if (e?.code === "ASSET_LIMIT_EXCEEDED") return "This change exceeds your plan's active physical-device limit. Reduce quantities, archive retired records, or choose a larger plan. Viewing and export remain available.";
  if (e?.status === 401) return "Sign in again to access your company inventory.";
  if (e?.status === 403) return "Your account cannot make this change. Check your plan status and permissions. Existing records remain available for viewing and export.";
  if (e?.status === 409) return "This record or request changed. Refresh the inventory before trying again.";
  if (e?.status === 429) return "The request limit was reached. Wait, then retry. Valuation credits reset each billing month.";
  if (e?.status === 400) return e.message || "Check the record fields and quantities, then try again.";
  return "The request could not be completed. Your changes have not been confirmed. Retry using the same form, or refresh to check saved records.";
}
function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function inventoryCSV(assets: InventoryAsset[]): string {
  const headers = ["id", ...fields, "archived_at"];
  return [headers.join(","), ...assets.map(a => headers.map(field => csvCell(a[field as keyof InventoryAsset])).join(","))].join("\r\n");
}
export const INVENTORY_CSV_TEMPLATE = `${fields.join(",")}\r\nExample laptop,laptop,B,2,2024-01-01,1000,180,16,512,,IT`;
export function parseInventoryCSV(text: string): InventoryInput[] {
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { value += '"'; i++; } else if (quoted || !value) quoted = !quoted; else throw new Error("Invalid CSV quote.");
    } else if (!quoted && (c === "," || c === "\n" || c === "\r")) {
      row.push(value); value = "";
      if (c !== ",") { if (row.some(x => x.trim())) rows.push(row); row = []; if (c === "\r" && input[i + 1] === "\n") i++; }
    } else value += c;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (value || row.length) { row.push(value); if (row.some(x => x.trim())) rows.push(row); }
  const headers = rows.shift()?.map(h => h.trim().toLowerCase()) ?? [];
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate column names.");
  for (const field of ["model_name", "asset_type", "condition_grade", "quantity"]) if (!headers.includes(field)) throw new Error(`Missing required CSV column: ${field}.`);
  if (!rows.length || rows.length > 50) throw new Error("Choose a CSV with 1–50 records. Large imports must be split into batches.");
  return rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`CSV row ${index + 2} has the wrong number of columns.`);
    const raw = Object.fromEntries(headers.map((h, i) => [h, /^'[=+\-@\t\r]/.test(values[i]) ? values[i].slice(1) : values[i]]));
    try { return inventoryInput(raw); } catch (e) { throw new Error(`CSV row ${index + 2}: ${(e as Error).message}`); }
  });
}
export function downloadInventoryCSV(text: string, name = "guildmark-assets.csv") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
